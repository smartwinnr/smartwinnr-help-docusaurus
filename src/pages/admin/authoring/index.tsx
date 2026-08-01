import React, {useEffect, useReducer, useRef, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {useNotify} from '@site/src/components/admin/authoring/Notify';
import PersistenceStatus from '@site/src/components/admin/authoring/PersistenceStatus';
import {useMarkdownHtml} from '@site/src/lib/markdown-preview';
import {WIZARD_STORAGE_KEY, parseDocPath, slugify, checkTitleShape, parseFrontmatterFields, replaceFrontmatterFields, SUB_FOLDERS} from '@site/src/lib/authoring';

// Canonical module folders the wizard offers for creation. Excludes the
// deprecating `assign-and-schedule` (still accepted server-side for existing
// content, but not offered for new folders). Modules draw ALL their leaves
// from this fixed set; sections may have arbitrary folders.
const MODULE_CANONICAL_SUBS = SUB_FOLDERS.filter((s) => s.value !== 'assign-and-schedule');
import {TagPicker} from '@site/src/components/admin/authoring/TagPicker';
import styles from './styles.module.css';

/**
 * In-app authoring skill - `/admin/authoring`.
 *
 * 4-step wizard (plan §19). The editor fills two short forms and a
 * brain-dump; the model handles structure. Superadmin only.
 *
 *   1. Where + who      (module / sub-folder / audience roles)
 *   2. The hook         (title / description / tags)
 *   3. Brain dump       (rough explanation + screenshots)
 *   4. Preview + refine (LLM-generated markdown, audit panel, save)
 *
 * State persists to localStorage so a refresh mid-wizard doesn't lose
 * the editor's progress. Only step 3→4 (Generate) and 4→4 (Refine)
 * hit the model.
 */

// v2 = 3-step layout (where + who → brain dump → preview with editable
// LLM-suggested title/description/tags). v1 was the 4-step layout where
// title came before the brain dump; orphaned v1 keys are ignored by
// loadState() so editors mid-flight at deploy time start fresh.
// Shared with drafts.tsx (which clears it) via src/lib/authoring.ts.
const STORAGE_KEY = WIZARD_STORAGE_KEY;

// Modules are loaded from GET /api/admin/authoring/modules (sourced from
// data/modules.json). The wizard fetches them on Step-1 mount; adding a
// new module via /admin/authoring/modules makes it available here on
// next render.
/** One pickable destination from GET /sections (a docs section or module). */
type SectionEntry = {
  dir: string;
  label: string;
  kind: 'section' | 'module';
  allowRoot: boolean;
  roles?: string[];
  subs: Array<{dir: string; label: string; roles?: string[]}>;
};

type Image = {
  url: string;
  caption: string;
  /** Optional explicit placement hint. When present, the LLM uses this as the
   * primary signal for which step the image goes under, overriding caption-
   * driven guessing. Empty string treated as absent. */
  stepAnchor?: string;
};

type Inputs = {
  /** Destination folder, e.g. docs/get-started/onboarding or
   *  docs/modules/quiz/features. The primary location key. */
  dir: string;
  /** Friendly destination label ("Get Started / Onboarding") - LLM context. */
  sectionLabel: string;
  /** Set only for module destinations (title shapes, legacy routing). */
  module: string;
  subFolder: string;
  audienceRoles: string[];
  privilege: string;
  title: string;
  description: string;
  tags: string[];
  roughExplanation: string;
  images: Image[];
  slug: string;
};

type Finding = {
  key: string;
  label: string;
  detail?: string;
  blocking: boolean;
};

type Audit = {
  score: number;
  findings: Finding[];
};

type State = {
  step: 1 | 2 | 3;
  inputs: Inputs;
  markdown: string;
  audit: Audit | null;
  tokens: {prompt: number; completion: number} | null;
  generating: boolean;
  saving: boolean;
  error: string | null;
  saved: string | null;
  /** True when the wizard was opened to edit an existing draft via URL
   *  params (?module=&subFolder=&slug=). Lands directly on Step 3
   *  (preview + editable metadata + Refine + Save), hides the Step 1-2
   *  navigation stepper, and swaps the header subhead to an "Editing
   *  draft" (or "Refining published article") banner. `roughExplanation`
   *  isn't preserved in saved articles, so it stays empty - canAdvance's
   *  Step-2 gate doesn't apply because we never visit Step 2. */
  isEditing: boolean;
  /** True when the wizard loaded a PUBLISHED article (frontmatter
   *  `draft: false`). The save endpoint will force draft:true and
   *  re-draft the article; the live deployed copy stays untouched until
   *  the editor explicitly Publishes from the queue again. UI uses this
   *  to swap the banner copy ("Refining published article" vs
   *  "Editing draft"). */
  wasPublished: boolean;
  /** Server content hash captured at load/save time (edit mode). Sent as
   *  baseHash on save so the wizard can't silently overwrite a version
   *  another editor saved in between (server answers 409 stale-base). */
  loadedHash: string | null;
};

const initial: State = {
  step: 1,
  inputs: {
    dir: '',
    sectionLabel: '',
    module: '',
    subFolder: '',
    audienceRoles: [],
    privilege: '',
    title: '',
    description: '',
    tags: [],
    roughExplanation: '',
    images: [],
    slug: '',
  },
  markdown: '',
  audit: null,
  tokens: null,
  generating: false,
  saving: false,
  error: null,
  saved: null,
  isEditing: false,
  wasPublished: false,
  loadedHash: null,
};

type Action =
  | {type: 'set'; patch: Partial<Inputs>}
  | {type: 'step'; step: 1 | 2 | 3}
  | {type: 'generating'; on: boolean}
  | {type: 'generated'; markdown: string; audit: State['audit']; tokens: State['tokens']}
  | {type: 'suggestionsLoaded'; patch: Partial<Inputs>}
  | {type: 'saving'; on: boolean}
  | {type: 'saved'; path: string; hash?: string}
  | {type: 'error'; message: string}
  | {type: 'reset'}
  | {type: 'loadDraft'; inputs: Inputs; markdown: string; wasPublished: boolean; hash?: string}
  | {type: 'addImage'; image: Image};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'set':       return {...s, inputs: {...s.inputs, ...a.patch}, error: null};
    case 'step':      return {...s, step: a.step, error: null};
    case 'generating':return {...s, generating: a.on, error: null};
    case 'generated': return {...s, generating: false, markdown: a.markdown, audit: a.audit, tokens: a.tokens};
    // Populates title / description / tags from a /generate response's
    // parsed frontmatter, but ONLY for fields the editor hasn't already
    // typed into. That way an editor who pre-typed a title doesn't get
    // overwritten by the LLM's guess on first generate.
    case 'suggestionsLoaded': {
      const patch: Partial<Inputs> = {};
      const i = s.inputs;
      if (a.patch.title && !i.title)
        patch.title = a.patch.title;
      if (a.patch.description && !i.description)
        patch.description = a.patch.description;
      if (a.patch.tags && a.patch.tags.length > 0 && i.tags.length === 0)
        patch.tags = a.patch.tags;
      // Slug derives from title; only resync if the title actually changed.
      if (patch.title && !i.slug) patch.slug = slugify(patch.title);
      return Object.keys(patch).length === 0 ? s : { ...s, inputs: { ...i, ...patch } };
    }
    case 'saving':    return {...s, saving: a.on};
    case 'saved':     return {...s, saving: false, saved: a.path, loadedHash: a.hash ?? s.loadedHash};
    case 'error':     return {...s, error: a.message, generating: false, saving: false};
    case 'reset':     return initial;
    case 'loadDraft': return {
      ...initial,
      inputs: a.inputs,
      markdown: a.markdown,
      step: 3,
      isEditing: true,
      wasPublished: a.wasPublished,
      loadedHash: a.hash ?? null,
    };
    // Closure-safe append: a parallel multi-file upload would otherwise
    // race on dispatch({type:'set', patch:{images:[...i.images, new]}})
    // because each closure captures the same stale i.images.
    case 'addImage': return {...s, inputs: {...s.inputs, images: [...s.inputs.images, a.image]}, error: null};
  }
}

function loadState(): State | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: State = JSON.parse(raw);
    // Edit mode is URL-driven: don't restore a stale edit-mode session from
    // localStorage. Otherwise deleting a draft and returning to the wizard
    // (or clicking the "Authoring" link from anywhere) would re-open the
    // deleted draft.
    if (parsed && parsed.isEditing) return null;
    return parsed;
  } catch { return null; }
}
function saveState(s: State) {
  if (typeof window === 'undefined') return;
  // Edit mode state is per-URL-session, not per-user. Skip persisting so
  // localStorage never holds a draft reference that may have been deleted.
  if (s.isEditing) return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {/* swallow */}
}

// ════════ Step components ═════════════════════════════════════════════════

function Step1({state, dispatch}: {state: State; dispatch: React.Dispatch<Action>}): ReactNode {
  const i = state.inputs;
  const [locations, setLocations] = useState<SectionEntry[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/authoring/sections', {credentials: 'same-origin'});
        if (!res.ok) { setLocationsLoading(false); return; }
        const data = await res.json();
        setLocations(data.sections || []);
      } catch {/* fail soft - dropdown will be empty, user can refresh */}
      finally { setLocationsLoading(false); }
    })();
  }, []);

  // Inline "create a new folder" mini-form (sections only).
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  // The Section select keeps its own state so clearing/re-picking the folder
  // never blanks it. Seed from a preselected destination (deep link / resume).
  const [pickedLocation, setPickedLocation] = useState('');
  useEffect(() => {
    if (!pickedLocation && i.dir && locations.length > 0) {
      const loc = locations.find((l) => i.dir === l.dir || i.dir.startsWith(l.dir + '/'));
      if (loc) setPickedLocation(loc.dir);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i.dir, locations.length]);
  const currentLocation = locations.find((l) => l.dir === pickedLocation) || null;

  /** Apply a picked destination folder: remember the dir + friendly labels,
   *  derive module/subFolder for module dirs (title shapes, save routing),
   *  and prefill the audience from the folder's gate. */
  function pickFolder(dir: string, loc: SectionEntry | null) {
    if (!dir || !loc) {
      dispatch({type: 'set', patch: {dir: '', sectionLabel: loc ? loc.label : '', module: '', subFolder: ''}});
      return;
    }
    const sub = loc.subs.find((s) => s.dir === dir);
    const roles = (sub?.roles || loc.roles || []) as string[];
    const m = /^docs\/modules\/([^/]+)\/([^/]+)$/.exec(dir);
    dispatch({type: 'set', patch: {
      dir,
      sectionLabel: sub ? `${loc.label} / ${sub.label}` : loc.label,
      module: m ? m[1] : '',
      subFolder: m ? m[2] : '',
      audienceRoles: roles,
    }});
  }

  /** Create a section sub-folder on the server, add it to the tree, and
   *  select it as the destination. */
  // Missing canonical folders for the current module (none for sections).
  function missingCanonicalSubs(loc: typeof currentLocation) {
    if (!loc || loc.kind !== 'module') return [];
    const have = new Set(loc.subs.map((s) => s.dir.split('/').pop()));
    return MODULE_CANONICAL_SUBS.filter((s) => !have.has(s.value));
  }

  async function createFolder(labelArg?: string) {
    const loc = currentLocation;
    const label = (labelArg ?? newFolderName).trim();
    if (!loc || !label || creatingFolder) return;
    // On a module pick, `label` is a canonical folder label - send its exact
    // slug so the server doesn't have to re-derive it from the label (which
    // drops the "-and-" in names like "Settings & Permissions").
    const canonical = loc.kind === 'module'
      ? MODULE_CANONICAL_SUBS.find((s) => s.label === label)
      : undefined;
    setCreatingFolder(true);
    try {
      const res = await fetch('/api/admin/authoring/folders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({sectionDir: loc.dir, label, subFolder: canonical?.value}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        dispatch({type: 'error', message: data.error || 'Could not create the folder'});
        return;
      }
      const newSub = {dir: data.dir, label: data.label, roles: data.roles};
      const nextLoc = {...loc, subs: [...loc.subs, newSub]};
      setLocations(locations.map((l) => (l.dir === loc.dir ? nextLoc : l)));
      pickFolder(data.dir, nextLoc);
      setShowNewFolder(false);
      setNewFolderName('');
    } catch (err) {
      dispatch({type: 'error', message: (err as Error).message});
    } finally {
      setCreatingFolder(false);
    }
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.stepHead}>Step 1 · Where + who</h2>
      <div className={styles.field}>
        <label>Section</label>
        <select
          value={pickedLocation}
          disabled={locationsLoading}
          onChange={(e) => {
            setPickedLocation(e.target.value);
            setShowNewFolder(false);
            const loc = locations.find((l) => l.dir === e.target.value) || null;
            // Auto-land on the location itself when it has no sub-folders.
            if (loc && loc.subs.length === 0 && loc.allowRoot) pickFolder(loc.dir, loc);
            else pickFolder('', loc);
          }}>
          <option value="">{locationsLoading ? 'Loading…' : 'Select a section…'}</option>
          <optgroup label="Sections">
            {locations.filter((l) => l.kind === 'section').map((l) => (
              <option key={l.dir} value={l.dir}>{l.label}</option>
            ))}
          </optgroup>
          <optgroup label="Modules">
            {locations.filter((l) => l.kind === 'module').map((l) => (
              <option key={l.dir} value={l.dir}>{l.label}</option>
            ))}
          </optgroup>
        </select>
        <span className={styles.hint}>
          Don't see your module? <Link to="/admin/authoring/modules">Add a module →</Link>
        </span>
      </div>
      <div className={styles.field}>
        <label>Folder</label>
        <select
          value={showNewFolder ? '__new__' : i.dir}
          disabled={!currentLocation || (currentLocation.subs.length === 0 && currentLocation.allowRoot && currentLocation.kind !== 'section')}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '__new__') { setShowNewFolder(true); return; }
            if (v.startsWith('__create__:')) {
              const entry = MODULE_CANONICAL_SUBS.find((s) => s.value === v.slice('__create__:'.length));
              if (entry) createFolder(entry.label);
              return;
            }
            setShowNewFolder(false);
            pickFolder(v, currentLocation);
          }}>
          <option value="">Select a folder…</option>
          {currentLocation?.allowRoot && (
            <option value={currentLocation.dir}>(section root)</option>
          )}
          {currentLocation?.subs.map((s) => <option key={s.dir} value={s.dir}>{s.label}</option>)}
          {/* Modules: offer only the missing canonical folders (no free-text).
              Sections: keep free-text folder creation. */}
          {currentLocation?.kind === 'module'
            ? missingCanonicalSubs(currentLocation).map((s) => (
                <option key={s.value} value={`__create__:${s.value}`}>+ Add {s.label}</option>
              ))
            : currentLocation && (
                <option value="__new__">+ Create a new folder…</option>
              )}
        </select>
        {showNewFolder && currentLocation && (
          <div className={styles.selectorRow}>
            <input
              type="text"
              value={newFolderName}
              maxLength={60}
              placeholder="Folder name, e.g. Advanced Setup"
              disabled={creatingFolder}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); createFolder(); } }}
            />
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={creatingFolder || !newFolderName.trim()}
              onClick={() => createFolder()}>
              {creatingFolder ? 'Creating…' : 'Create folder'}
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              disabled={creatingFolder}
              onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}>
              Cancel
            </button>
          </div>
        )}
        {showNewFolder && (
          <span className={styles.hint}>
            {currentLocation?.kind === 'module'
              ? "The new folder appears in this module's sidebar once its first article is published. It stays protected by the module's licensing; each article's audience is set individually."
              : "The new folder appears in this section's sidebar once its first article is published. It inherits the section's audience."}
          </span>
        )}
        {!showNewFolder && i.dir && i.audienceRoles.length > 0 && (
          <span className={styles.hint}>
            Audience: {i.audienceRoles.join(', ')} - pre-set to match this folder; change only if this article should be narrower.
          </span>
        )}
      </div>
      {/*
        Per-article privilege is no longer an authoring input. The folder's
        _category_.json carries the canonical gate, and articles inherit. If a
        rare article ever needs a tighter gate, edit its raw frontmatter via
        /admin/authoring/edit. Keeping `inputs.privilege` in state so existing
        drafts that already carry one survive the load → save round-trip.
      */}
    </div>
  );
}

/** Extracted from the legacy Step 2 — now rendered above the preview on
 *  Step 3 so the editor reviews + tweaks the LLM-suggested tag list
 *  alongside the suggested title + description. */

function Step2({state, dispatch}: {state: State; dispatch: React.Dispatch<Action>}): ReactNode {
  const i = state.inputs;
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function onFiles(files: FileList | File[]) {
    const list = Array.from(files || []);
    if (list.length === 0) return;
    setUploading(true);
    // Upload sequentially so each addImage dispatch flushes through React
    // before the next, and to keep the per-file error message attached to
    // the file that actually failed.
    for (const file of list) {
      if (file.size > 5 * 1024 * 1024) {
        dispatch({type: 'error', message: `Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB) - 5 MB max.`});
        continue;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
      try {
        const res = await fetch('/api/admin/authoring/upload', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin',
          body: JSON.stringify({dataUrl, slug: i.slug || 'authored'}),
        });
        if (!res.ok) throw new Error(await res.text());
        const {url} = await res.json();
        // addImage reducer reads the latest state so multiple uploads in
        // a single onFiles call all land - using {type:'set', patch:{...}}
        // with the closed-over i.images value would race and only the
        // last upload would survive.
        dispatch({type: 'addImage', image: {url, caption: ''}});
      } catch (err) {
        dispatch({type: 'error', message: `Upload failed: ${(err as Error).message}`});
      }
    }
    setUploading(false);
  }

  function setCaption(idx: number, caption: string) {
    const next = i.images.slice();
    next[idx] = {...next[idx], caption};
    dispatch({type: 'set', patch: {images: next}});
  }
  function setStepAnchor(idx: number, stepAnchor: string) {
    const next = i.images.slice();
    next[idx] = {...next[idx], stepAnchor};
    dispatch({type: 'set', patch: {images: next}});
  }
  function removeImage(idx: number) {
    dispatch({type: 'set', patch: {images: i.images.filter((_, x) => x !== idx)}});
  }
  // Swap two adjacent entries. Up/down buttons are disabled at the edges
  // (the buttons themselves are gated on idx so this never gets called out
  // of bounds, but the guard keeps the helper safe to call directly).
  function moveImage(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= i.images.length) return;
    const next = i.images.slice();
    [next[idx], next[target]] = [next[target], next[idx]];
    dispatch({type: 'set', patch: {images: next}});
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.stepHead}>Step 2 · Tell us about this feature</h2>
      <div className={styles.field}>
        <label>Rough explanation</label>
        <textarea
          value={i.roughExplanation}
          rows={12}
          placeholder={`Just describe the feature in your own words. Bullets, fragments, copy-pasted notes - anything.\n\nExample:\n• Editors go to Quiz > All Quizzes, hit "New Manual Quiz"\n• Form needs Title, Topic, Pass mark\n• Pass mark must be at least 1\n• Once saved, the quiz lands in Draft until you click Publish\n• Long-answer questions need a reviewer assigned`}
          onChange={(e) => dispatch({type: 'set', patch: {roughExplanation: e.target.value}})}
        />
        <span className={styles.hint}>
          {i.roughExplanation.length} chars - the model needs at least 200 to do a good job.
        </span>
      </div>
      <div className={styles.field}>
        <label>Screenshots (optional)</label>
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
          onDragOver={(e) => {
            // preventDefault is required - without it the browser's default
            // behavior (navigate to / open the file) eats the drop.
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
            if (!dragOver) setDragOver(true);
          }}
          onDragLeave={(e) => {
            // Only clear dragOver when the cursor truly leaves the dropzone
            // - not when it crosses over a child element.
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const files = e.dataTransfer && e.dataTransfer.files;
            if (files && files.length > 0) onFiles(files);
          }}>
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={(e) => {
              if (e.target.files) onFiles(e.target.files);
              if (e.target) e.target.value = '';  // allow re-picking the same file
            }}
          />
          <span>Drop screenshots here or click to upload. PNG/JPG/GIF/WEBP, ≤ 5 MB each.</span>
          {uploading && <span className={styles.hint}>Uploading…</span>}
        </div>
        {i.images.length > 0 && (
          <ul className={styles.imageList}>
            {i.images.map((img, idx) => (
              <li key={img.url}>
                <img src={img.url} alt="" />
                <div className={styles.imageFields}>
                  <input
                    type="text"
                    placeholder="What does this screenshot show?"
                    value={img.caption}
                    onChange={(e) => setCaption(idx, e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Which step does this go with? (optional)"
                    value={img.stepAnchor ?? ''}
                    onChange={(e) => setStepAnchor(idx, e.target.value)}
                    className={styles.imageAnchor}
                  />
                </div>
                <div className={styles.imageControls}>
                  <button
                    type="button"
                    onClick={() => moveImage(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Move image up"
                    className={styles.moveBtn}>
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 1)}
                    disabled={idx === i.images.length - 1}
                    aria-label="Move image down"
                    className={styles.moveBtn}>
                    ↓
                  </button>
                  <button type="button" onClick={() => removeImage(idx)} className={styles.removeBtn}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Step3({state, dispatch, saveTick = 0}: {state: State; dispatch: React.Dispatch<Action>; saveTick?: number}): ReactNode {
  const [refinement, setRefinement] = useState('');
  const [regeneratingField, setRegeneratingField] = useState<'title' | 'description' | null>(null);
  // Set after a 409 stale-base so the editor's NEXT Save deliberately
  // overwrites the other editor's version; cleared on success.
  const staleOverrideRef = useRef(false);
  const i = state.inputs;
  const previewHtml = useMarkdownHtml(state.markdown);

  async function regenerate(withRefinement?: string) {
    dispatch({type: 'generating', on: true});
    try {
      const res = await fetch('/api/admin/authoring/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({
          inputs: i,
          refinement: withRefinement,
          previousMarkdown: withRefinement ? state.markdown : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({error: res.statusText}));
        // 429 - per-superadmin LLM rate limit. Show the server's friendly
        // message verbatim (it already includes "try again in ~M min").
        if (res.status === 429) {
          const minutes = err.retryAfterMs
            ? Math.max(1, Math.ceil(err.retryAfterMs / 60000))
            : null;
          dispatch({
            type: 'error',
            message:
              err.message ||
              `Rate-limited (${err.used ?? '?'}/${err.limit ?? '?'} generates this hour). ` +
              (minutes ? `Try again in ~${minutes} min.` : 'Try again later.'),
          });
          dispatch({type: 'generating', on: false});
          return;
        }
        dispatch({type: 'error', message: err.error || 'Generation failed'});
        return;
      }
      const data = await res.json();
      dispatch({type: 'generated', markdown: data.markdown, audit: data.audit, tokens: data.tokens});
      // Surface LLM-suggested title / description / tags into the
      // editable fields above the preview - but only for empty inputs,
      // so an editor who already typed something keeps their value.
      const fm = parseFrontmatterFields(data.markdown || '');
      if (fm) dispatch({type: 'suggestionsLoaded', patch: {
        title: fm.title,
        description: fm.description,
        tags: fm.tags,
      }});
      setRefinement('');
    } catch (err) {
      dispatch({type: 'error', message: (err as Error).message});
    }
  }

  async function save() {
    dispatch({type: 'saving', on: true});
    try {
      // Splice the editor's final title/description/tags into the
      // frontmatter just-in-time. The LLM's first-pass values may have
      // been edited inline; the file on disk should reflect what the
      // editor chose, not the original suggestion.
      const finalMarkdown = replaceFrontmatterFields(state.markdown, {
        title: i.title,
        description: i.description,
        tags: i.tags,
      });
      const res = await fetch('/api/admin/authoring/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({
          markdown: finalMarkdown,
          dir: i.dir,
          module: i.module,
          subFolder: i.subFolder,
          slug: i.slug,
          // Edit mode sends the hash of the version it loaded so the server
          // 409s instead of clobbering another editor's newer save. After
          // one stale-base warning, the next Save deliberately overwrites.
          ...(state.isEditing && state.loadedHash && !staleOverrideRef.current
            ? {baseHash: state.loadedHash}
            : {}),
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.error === 'stale-base') {
        staleOverrideRef.current = true;
        dispatch({
          type: 'error',
          message: 'Someone else saved this article after you opened it. Check the queue to see their version, or press Save again to replace it with yours.',
        });
        return;
      }
      if (!res.ok) {
        // The save endpoint returns {error, audit} on a blocking-audit
        // 400. Surface the specific blocking findings in the toast so
        // the editor can see WHICH gate fired (emptyDescription /
        // noHeadings / ghostStub / badAltText / inlineStep /
        // malformedFrontmatter) instead of the generic banner. Also
        // refresh state.audit so the on-screen audit panel reflects
        // the truth-on-disk view, not the stale /generate snapshot.
        const blockers = (data.audit?.findings || []).filter((f: Finding) => f.blocking);
        if (blockers.length > 0 && data.audit) {
          dispatch({
            type: 'generated',
            markdown: state.markdown,
            audit: data.audit,
            tokens: state.tokens,
          });
        }
        const detail = blockers.length
          ? ' - ' + blockers
              .map((f: Finding) => f.label + (f.detail ? ` (${f.detail})` : ''))
              .join('; ')
          : '';
        dispatch({type: 'error', message: (data.error || 'Save failed') + detail});
        return;
      }
      staleOverrideRef.current = false;
      dispatch({type: 'saved', path: data.path, hash: data.hash});
    } catch (err) {
      dispatch({type: 'error', message: (err as Error).message});
    }
  }

  useEffect(() => {
    if (!state.markdown && !state.generating) regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Per-field LLM suggest. Targets title or description only - the
   *  article body and other fields stay untouched. Backed by the
   *  /suggest-field endpoint which counts against the same per-superadmin
   *  rate limit as /generate. */
  async function regenerateField(field: 'title' | 'description') {
    setRegeneratingField(field);
    try {
      const res = await fetch('/api/admin/authoring/suggest-field', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({
          field,
          dir: i.dir,
          module: i.module,
          subFolder: i.subFolder,
          body: state.markdown,
          brainDump: i.roughExplanation,
          currentValue: field === 'title' ? i.title : i.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch({type: 'error', message: data.message || data.error || `${field} suggest failed`});
        return;
      }
      if (data.value) {
        // Title change also re-derives slug (same side-effect as direct
        // editing on the input).
        const patch: Partial<Inputs> = field === 'title'
          ? {title: data.value, slug: slugify(data.value)}
          : {description: data.value};
        dispatch({type: 'set', patch});
      }
    } catch (err) {
      dispatch({type: 'error', message: (err as Error).message});
    } finally {
      setRegeneratingField(null);
    }
  }

  const titleShape = checkTitleShape(i.title, i.subFolder);
  const saveBlockedByMetadata = !canSave(state);
  const saveBlockedByAudit = !!(state.audit && state.audit.findings.some((f) => f.blocking));

  return (
    <div className={styles.previewWrap}>
      <h2 className={styles.stepHead}>
        {state.isEditing ? 'Refine + save' : 'Step 3 · Review + refine'}
      </h2>
      {state.generating && <p className={styles.hint}>Generating…</p>}
      {!state.generating && state.markdown && (
        <>
          {/*
            LLM-suggested metadata, populated by the suggestionsLoaded
            reducer action after each /generate call (only fills empty
            fields - editor edits survive). On Save, the wizard splices
            the current values back into the markdown frontmatter via
            replaceFrontmatterFields(), so the file on disk reflects
            what the editor saw + tweaked here, not the LLM's first guess.
          */}
          <div className={styles.form}>
            <div className={styles.field}>
              <label>Title</label>
              <input
                type="text"
                value={i.title}
                placeholder="How to create a manual quiz"
                onChange={(e) => {
                  const t = e.target.value;
                  dispatch({type: 'set', patch: {title: t, slug: slugify(t)}});
                }}
              />
              <div className={styles.fieldActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  disabled={!!regeneratingField || state.generating || state.saving || !state.markdown}
                  onClick={() => regenerateField('title')}
                  title="Ask the LLM to suggest a new title from the article body + sub-folder shape. Body untouched.">
                  {regeneratingField === 'title' ? 'Suggesting…' : 'Suggest a new title'}
                </button>
              </div>
              {i.title && !titleShape.ok && (
                <span className={styles.warn}>{titleShape.hint}</span>
              )}
            </div>
            <div className={styles.field}>
              <label>Description (one sentence, 60–160 chars)</label>
              <input
                type="text"
                value={i.description}
                placeholder="Build a quiz from scratch with hand-picked questions and a reviewer."
                maxLength={160}
                onChange={(e) => dispatch({type: 'set', patch: {description: e.target.value}})}
              />
              <div className={styles.fieldActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  disabled={!!regeneratingField || state.generating || state.saving || !state.markdown}
                  onClick={() => regenerateField('description')}
                  title="Ask the LLM to suggest a new description from the article body. Body untouched.">
                  {regeneratingField === 'description' ? 'Suggesting…' : 'Suggest a new description'}
                </button>
                <span className={styles.hint}>{i.description.length}/160</span>
              </div>
            </div>
            <TagPicker tags={state.inputs.tags} onChange={(tags) => dispatch({type: 'set', patch: {tags}})} />
          </div>

          <article className={styles.preview} dangerouslySetInnerHTML={{__html: previewHtml}} />
          {state.audit && (
            <div className={styles.auditPanel}>
              <h3>Audit · score {state.audit.score}</h3>
              {state.audit.findings.length === 0 ? (
                <p className={styles.hint}>No findings - looks good.</p>
              ) : (
                <ul>
                  {state.audit.findings.map((f, idx) => (
                    <li key={f.key + '-' + idx} className={f.blocking ? styles.findBlock : styles.findWarn}>
                      <strong>{f.label}</strong>
                      {f.detail && <span className={styles.findDetail}> - {f.detail}</span>}
                      {f.blocking && <span className={styles.findBadge}> blocks save</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className={styles.refineRow}>
            <textarea
              rows={3}
              value={refinement}
              placeholder="Optional refinement note: 'make the tone less formal', 'merge steps 2 and 3', 'add a warning about reviewer permissions'…"
              onChange={(e) => setRefinement(e.target.value)}
            />
            <div className={styles.actions}>
              <PersistenceStatus refreshKey={saveTick} />
              <button
                type="button"
                className={styles.btnGhost}
                disabled={state.generating || !refinement.trim()}
                onClick={() => regenerate(refinement.trim())}>
                Refine
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={state.saving || saveBlockedByMetadata || saveBlockedByAudit}
                onClick={save}
                title={saveBlockedByMetadata ? 'Fill the title, description, and at least one tag to save.' : ''}>
                {state.saving ? 'Saving…' : 'Save as draft'}
              </button>
            </div>
          </div>
          {state.tokens && (
            <p className={styles.tokenStrip}>
              Tokens this call: {state.tokens.prompt} prompt · {state.tokens.completion} completion
            </p>
          )}
          {state.saved && (
            <p className={styles.savedNote}>
              Your draft is saved. The badge next to Save shows when it's backed up.
              Drafts stay invisible to readers until you publish from the Authoring queue.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ════════ Wizard root ═════════════════════════════════════════════════════

function canAdvance(s: State): boolean {
  const i = s.inputs;
  if (s.step === 1) return !!i.dir && i.audienceRoles.length > 0;
  // Step 2 is the brain dump (with screenshots). Title/description/tags
  // are no longer entered upfront - the LLM suggests them on Step 3.
  if (s.step === 2) return i.roughExplanation.length >= 200
    && i.images.every((img) => img.caption.trim().length >= 4);
  return true;
}

/** True when the article is ready to save. Checks the metadata fields
 *  that used to live on Step 2 - title, description, tags - which the
 *  LLM now pre-fills and the editor reviews on Step 3 above the
 *  preview. Used to disable the Save button. */
function canSave(s: State): boolean {
  const i = s.inputs;
  if (!i.title) return false;
  // Title must match the shape the article's sub-folder expects
  // (How to ... for create-and-manage, question-shaped for FAQs, etc.).
  // Sub-folder unknown -> falls back to the legacy verb/question check.
  if (!checkTitleShape(i.title, i.subFolder).ok) return false;
  if (i.description.length < 60 || i.description.length > 160) return false;
  if (i.tags.length < 1 || i.tags.length > 5) return false;
  return true;
}

function Wizard(): ReactNode {
  const user = useCurrentUser();
  const notify = useNotify();
  const location = useLocation();
  const [state, dispatch] = useReducer(reducer, initial, (init) => loadState() || init);
  // Bumped on every successful save so the backup pill re-checks immediately.
  const [saveTick, setSaveTick] = useState(0);

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    if (state.saved) {
      notify.success("Draft saved - backing up now. Readers can't see it yet; publish it from the Authoring queue when it's ready.");
      setSaveTick((t) => t + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.saved]);

  useEffect(() => {
    if (state.error) notify.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.error]);

  // Edit-an-existing-draft (and refine-a-published-article) entry.
  // When the wizard is opened with ?module=&subFolder=&slug=, fetch the
  // article via /draft, parse its frontmatter into inputs (title /
  // description / tags / audienceRoles / privilege / slug), and
  // dispatch loadDraft to jump straight to Step 3 (preview + editable
  // metadata + Refine + Save) with the markdown loaded. inputs.subFolder
  // comes from the URL, so the sub-folder-aware title-shape check
  // (checkTitleShape) fires in edit mode exactly like fresh-generate.
  // URL params take priority over any localStorage-persisted wizard
  // state so an editor clicking Edit always lands in edit mode.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const moduleSlug = params.get('module');
    const subFolder = params.get('subFolder');
    const slug = params.get('slug');
    const pathParam = params.get('path');
    const dirParam = params.get('dir');
    const legacyKey = moduleSlug && subFolder && slug;
    if (!legacyKey && !pathParam) {
      // No edit-mode params. A ?dir= deep link ("New article here" from the
      // Published tab) preselects the destination on a fresh wizard.
      if (state.isEditing) dispatch({type: 'reset'});
      if (dirParam && !state.isEditing && state.inputs.dir !== dirParam) {
        dispatch({type: 'set', patch: {dir: dirParam}});
      }
      return;
    }
    // Avoid re-fetching if we already loaded this draft in this session.
    if (state.isEditing && legacyKey && state.inputs.slug === slug && state.inputs.module === moduleSlug) return;
    if (state.isEditing && pathParam && parseDocPath(pathParam)?.slug === state.inputs.slug) return;

    (async () => {
      try {
        const qs = pathParam
          ? new URLSearchParams({path: pathParam})
          : new URLSearchParams({module: moduleSlug as string, subFolder: subFolder as string, slug: slug as string});
        const res = await fetch(`/api/admin/authoring/draft?${qs}`, {credentials: 'same-origin'});
        if (!res.ok) {
          const err = await res.json().catch(() => ({error: res.statusText}));
          dispatch({type: 'error', message: `Failed to load draft: ${err.error || res.statusText}`});
          return;
        }
        const {markdown, hash, path: loadedPath} = await res.json();
        const fm = parseFrontmatterFields(markdown);
        const loc = parseDocPath(pathParam || loadedPath || '')
          || (legacyKey ? {dir: `docs/modules/${moduleSlug}/${subFolder}`, slug: slug as string, module: moduleSlug as string, subFolder: subFolder as string} : null);
        const inputs: Inputs = {
          dir: loc?.dir ?? '',
          sectionLabel: '',
          module: loc?.module ?? '',
          subFolder: loc?.subFolder ?? '',
          audienceRoles: fm?.audienceRoles ?? [],
          privilege: fm?.privilege ?? '',
          title: fm?.title ?? '',
          description: fm?.description ?? '',
          tags: fm?.tags ?? [],
          roughExplanation: '',
          images: [],
          slug: fm?.slug ?? (loc?.slug ?? ''),
        };
        // Detect whether the source is a published article. The save flow
        // forces draft:true regardless, so a Refine -> Save here re-drafts
        // a live article; UI surfaces this with a different banner.
        const wasPublished = !/^draft:\s*true\b/m.test(markdown);
        dispatch({type: 'loadDraft', inputs, markdown, wasPublished, hash});
      } catch (err) {
        dispatch({type: 'error', message: `Failed to load draft: ${(err as Error).message}`});
      }
    })();
    // Only react to URL changes, not to wizard state churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Authoring</h1>
        <p>You don't have access to this page.</p>
        <p><Link to="/">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>
            {!state.isEditing
              ? 'Authoring'
              : state.wasPublished
                ? 'Refine published article'
                : 'Edit draft'}{' '}
            <PersistenceStatus refreshKey={saveTick} />
          </h1>
          {state.isEditing ? (
            state.wasPublished ? (
              <p className={styles.subhead}>
                Refining "{state.inputs.title || state.inputs.slug}". Saving creates a
                NEW draft of this article - the live version readers see stays unchanged
                until you publish the new draft from the queue.{' '}
                <Link to="/admin/authoring/drafts">← Back to queue</Link>
              </p>
            ) : (
              <p className={styles.subhead}>
                Editing draft "{state.inputs.title || state.inputs.slug}" ·{' '}
                <Link to="/admin/authoring/drafts">← Back to drafts queue</Link>
              </p>
            )
          ) : (
            <p className={styles.subhead}>
              Step {state.step} of 3 ·{' '}
              <Link to="/admin/authoring/drafts">Drafts queue →</Link>{' · '}
              <Link to="/admin/authoring/guide">Guide →</Link>
            </p>
          )}
        </div>
        {!state.isEditing && (
          <button
            type="button"
            className={styles.btnGhost}
            onClick={async () => {
              const ok = await notify.confirm({
                title: 'Discard wizard state?',
                message: 'You will lose the current inputs and any generated draft preview. This cannot be undone.',
                confirmLabel: 'Start over',
                cancelLabel: 'Keep editing',
                danger: true,
              });
              if (ok) dispatch({type: 'reset'});
            }}>
            Start over
          </button>
        )}
      </header>

      {!state.isEditing && (
        <ol className={styles.stepper}>
          {[1, 2, 3].map((n) => (
            <li key={n} className={state.step === n ? styles.stepOn : state.step > n ? styles.stepDone : styles.stepOff}>
              {n}
            </li>
          ))}
        </ol>
      )}

      {state.error && <div className={styles.error}>⚠ {state.error}</div>}

      {state.step === 1 && <Step1 state={state} dispatch={dispatch} />}
      {state.step === 2 && <Step2 state={state} dispatch={dispatch} />}
      {state.step === 3 && <Step3 state={state} dispatch={dispatch} saveTick={saveTick} />}

      {notify.host}

      {state.step < 3 && (
        <div className={styles.actions}>
          {state.step > 1 && (
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => dispatch({type: 'step', step: (state.step - 1) as 1 | 2})}>
              ← Back
            </button>
          )}
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!canAdvance(state)}
            onClick={() => dispatch({type: 'step', step: (state.step + 1) as 2 | 3})}>
            {state.step === 2 ? 'Generate →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthoringPage(): ReactNode {
  return (
    <Layout title="Authoring - Admin" description="Generate help articles with the in-app authoring skill.">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <Wizard />}
      </BrowserOnly>
    </Layout>
  );
}

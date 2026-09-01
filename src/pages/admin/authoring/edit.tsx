import React, {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {useNotify} from '@site/src/components/admin/authoring/Notify';
import PersistenceStatus from '@site/src/components/admin/authoring/PersistenceStatus';
import {useMarkdownHtml} from '@site/src/lib/markdown-preview';
import {
  parseDocPath,
  parseFrontmatterFields,
  replaceFrontmatterFields,
  checkTitleShape,
  getDraftFlag,
  setDraftFlag,
  type FrontmatterFields,
} from '@site/src/lib/authoring';
import {TagPicker} from '@site/src/components/admin/authoring/TagPicker';
import styles from './styles.module.css';

/**
 * Unified article editor for any docs/ article (draft or published).
 * One screen for: AI refine + hand-edited raw markdown + image upload +
 * structured metadata (title / description / tags). Save preserves the
 * article's publish state and queues a deploy for published articles - so
 * editing a live article no longer needs a refine -> publish -> deploy ->
 * edit-raw round-trip.
 *
 * GET    /api/admin/authoring/article?path=...
 * POST   /api/admin/authoring/save-raw      { path, markdown }   (preserves draft flag)
 * POST   /api/admin/authoring/generate      (refine mode)
 * POST   /api/admin/authoring/suggest-field (per-field title/description)
 * POST   /api/admin/authoring/upload        (image)
 * POST   /api/admin/authoring/move          { fromPath, toModule, toSubFolder }
 * GET    /api/admin/authoring/modules       (Move picker module list)
 *
 * Superadmin only. Entry point: drafts queue -> Edit (both tabs).
 */

type AuditFinding = {
  key: string;
  label: string;
  detail?: string;
  blocking?: boolean;
};
type Audit = { score: number; findings: AuditFinding[] };

const EMPTY_FM: FrontmatterFields = {
  title: '', description: '', slug: '', audienceRoles: [], privilege: '', tags: [],
};

function EditorPanel(): ReactNode {
  const user = useCurrentUser();
  const notify = useNotify();
  const location = useLocation();

  const [path, setPath] = useState<string>('');
  const [original, setOriginal] = useState<string>('');
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [refining, setRefining] = useState<boolean>(false);
  const [suggesting, setSuggesting] = useState<'title' | 'description' | null>(null);
  const [refinement, setRefinement] = useState<string>('');
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  // Bumped on every successful save so the backup pill re-checks immediately.
  const [saveTick, setSaveTick] = useState(0);
  // Server content hash from load/save - sent back as baseHash so a save
  // can't silently clobber another editor's newer version (409 stale-base).
  const [serverHash, setServerHash] = useState<string>('');
  const previewHtml = useMarkdownHtml(markdown);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Move-to-folder control, driven by the GET /sections location tree.
  const [locations, setLocations] = useState<Array<{dir: string; label: string; kind: string; allowRoot: boolean; subs: Array<{dir: string; label: string}>}>>([]);
  const [moveLocation, setMoveLocation] = useState<string>('');
  const [moveDir, setMoveDir] = useState<string>('');
  const [moving, setMoving] = useState<boolean>(false);

  // markdown is the single source of truth. Metadata fields are derived from
  // its frontmatter and write back through replaceFrontmatterFields, so the
  // textarea, the fields, and the saved file never drift apart.
  const fm = useMemo(() => parseFrontmatterFields(markdown) ?? EMPTY_FM, [markdown]);
  const parsed = useMemo(() => parseDocPath(path), [path]);
  const isDraft = getDraftFlag(markdown) === true;
  const titleShape = checkTitleShape(fm.title, parsed?.subFolder ?? '');
  const busy = saving || refining || uploading || moving || suggesting !== null;
  // Mirror the wizard's metadata gate: an article must carry at least one tag.
  const tagMissing = fm.tags.length === 0;
  // Move target differs from the article's current folder?
  const moveChanged = !!parsed && !!moveDir && moveDir !== parsed.dir;

  /** Article slug for the /upload filename suffix (path's last segment). */
  const articleSlug = (() => {
    const m = /\/([^/]+?)\.(md|mdx)$/.exec(path);
    return m ? m[1] : 'authored';
  })();

  /** Write a frontmatter field back into the markdown source. */
  function patchFrontmatter(patch: {title?: string; description?: string; tags?: string[]}) {
    setMarkdown((md) => replaceFrontmatterFields(md, patch));
  }

  /** Insert `text` at the textarea's cursor; restores the caret after paint.
   *  When `selectRange` [from, to] (relative to `text`) is given, that slice
   *  is left selected instead - used to pre-select a placeholder so the
   *  author's next keystroke replaces it. */
  function insertAtCursor(text: string, selectRange?: [number, number]) {
    const ta = textareaRef.current;
    const start = ta ? ta.selectionStart : markdown.length;
    const end = ta ? ta.selectionEnd : markdown.length;
    const next = markdown.slice(0, start) + text + markdown.slice(end);
    setMarkdown(next);
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      if (selectRange) {
        ta.setSelectionRange(start + selectRange[0], start + selectRange[1]);
      } else {
        const pos = start + text.length;
        ta.setSelectionRange(pos, pos);
      }
    });
  }

  async function uploadImageFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      notify.error(`Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB) - 5 MB max.`);
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
      const res = await fetch('/api/admin/authoring/upload', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({dataUrl, slug: articleSlug}),
      });
      const data = await res.json();
      if (!res.ok) { notify.error(data.error || 'Upload failed'); return; }
      // Placeholder alt, pre-selected so typing replaces it. The audit
      // treats the untouched placeholder (and empty alt) as a publish
      // blocker, so it can't slip through unedited.
      const placeholder = 'describe this screenshot';
      insertAtCursor(`![${placeholder}](${data.url})`, [2, 2 + placeholder.length]);
      notify.success('Image added - type a short description for it (the highlighted text). It publishes together with the article.');
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  /** Per-field LLM suggestion for title / description. Body untouched. */
  async function suggestField(field: 'title' | 'description') {
    if (!parsed) { notify.error('Cannot suggest: unrecognized article path.'); return; }
    setSuggesting(field);
    try {
      const res = await fetch('/api/admin/authoring/suggest-field', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({
          field,
          dir: parsed.dir,
          module: parsed.module,
          subFolder: parsed.subFolder,
          body: markdown,
          currentValue: field === 'title' ? fm.title : fm.description,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify.error(data.message || data.error || `${field} suggest failed`);
        return;
      }
      if (data.value) {
        patchFrontmatter(field === 'title' ? {title: data.value} : {description: data.value});
      }
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setSuggesting(null);
    }
  }

  /** AI refine: send the current markdown as the source, apply the editor's
   *  note, and replace the body with the result - PRESERVING the article's
   *  publish state (the generate prompt hard-sets draft:true, which would
   *  silently re-draft a published article). */
  async function refine() {
    if (!parsed) { notify.error('Cannot refine: unrecognized article path.'); return; }
    if (!refinement.trim()) return;
    setRefining(true);
    try {
      const targetDraft = getDraftFlag(markdown) === true;
      const res = await fetch('/api/admin/authoring/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({
          inputs: {
            dir: parsed.dir,
            module: parsed.module,
            subFolder: parsed.subFolder,
            slug: parsed.slug,
            title: fm.title,
            description: fm.description,
            tags: fm.tags,
            audienceRoles: fm.audienceRoles,
            privilege: fm.privilege,
          },
          refinement: refinement.trim(),
          previousMarkdown: markdown,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) {
          const minutes = data.retryAfterMs
            ? Math.max(1, Math.ceil(data.retryAfterMs / 60000))
            : null;
          notify.error(data.message
            || `Rate-limited.${minutes ? ` Try again in ~${minutes} min.` : ' Try again later.'}`);
        } else {
          notify.error(data.error || 'Refine failed');
        }
        return;
      }
      const refined = setDraftFlag(data.markdown || '', targetDraft);
      setMarkdown(refined);
      setAudit(data.audit || null);
      setRefinement('');
      notify.success('Refined - review the changes below, then press Save to keep them.');
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setRefining(false);
    }
  }

  useEffect(() => {
    if (!(user.roles || []).includes('superadmin')) return;
    const params = new URLSearchParams(location.search);
    const p = params.get('path') || '';
    if (!p) { setLoadError('Missing ?path= in URL.'); setLoading(false); return; }
    setPath(p);
    (async () => {
      try {
        const qs = new URLSearchParams({path: p});
        const res = await fetch(`/api/admin/authoring/article?${qs}`, {credentials: 'same-origin'});
        const data = await res.json();
        if (!res.ok) { setLoadError(data.error || `${res.status} ${res.statusText}`); return; }
        setOriginal(data.markdown || '');
        setMarkdown(data.markdown || '');
        setServerHash(data.hash || '');
      } catch (err) {
        setLoadError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, location.search]);

  // Location tree for the Move picker (sections + modules).
  useEffect(() => {
    if (!(user.roles || []).includes('superadmin')) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/authoring/sections', {credentials: 'same-origin'});
        if (!res.ok) return;
        const data = await res.json();
        setLocations(data.sections || []);
      } catch {/* fail soft - the picker just stays empty */}
    })();
  }, [user]);

  // Default the Move selects to the article's current folder once the path resolves.
  useEffect(() => {
    if (parsed) {
      const loc = locations.find((l) => parsed.dir === l.dir || parsed.dir.startsWith(l.dir + '/'));
      setMoveLocation(loc ? loc.dir : '');
      setMoveDir(parsed.dir);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed?.dir, locations.length]);

  const moveLoc = locations.find((l) => l.dir === moveLocation) || null;
  /** Human label for a destination dir, from the sections tree. */
  function dirLabel(d: string): string {
    for (const l of locations) {
      if (l.dir === d) return l.label;
      const sub = l.subs.find((s) => s.dir === d);
      if (sub) return `${l.label} / ${sub.label}`;
    }
    return d;
  }

  /** Relocate the article to the selected folder. Operates on the
   *  saved file (Move is disabled while there are unsaved edits), then reloads
   *  the server-rewritten frontmatter and re-points the URL to the new path. */
  async function move() {
    if (!parsed || !moveChanged) return;
    const destLabel = dirLabel(moveDir);
    const ok = await notify.confirm({
      title: 'Move article?',
      message: `Move to ${destLabel}? The article's web address changes (the old address will redirect automatically) and its audience may reset to that folder's default.${isDraft ? '' : ' The move goes live with the next site update.'}`,
      confirmLabel: 'Move',
      cancelLabel: 'Cancel',
    });
    if (!ok) return;
    setMoving(true);
    try {
      const res = await fetch('/api/admin/authoring/move', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({fromPath: path, toDir: moveDir}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { notify.error(data.error || 'Move failed'); return; }
      // Reload from the new location so the editor reflects the server-rewritten
      // frontmatter (roles re-homed, privilege dropped) and clears the dirty flag.
      setPath(data.toPath);
      try {
        const r2 = await fetch(`/api/admin/authoring/article?${new URLSearchParams({path: data.toPath})}`, {credentials: 'same-origin'});
        const d2 = await r2.json();
        if (r2.ok) { setOriginal(d2.markdown || ''); setMarkdown(d2.markdown || ''); setServerHash(d2.hash || ''); }
      } catch {/* non-fatal - the move already succeeded */}
      // Keep the URL in sync so a refresh reloads the new location.
      window.history.replaceState(null, '', `/admin/authoring/edit?${new URLSearchParams({path: data.toPath})}`);
      notify.success(`Moved to ${destLabel}. The old address now redirects automatically.${data.queuedForDeploy ? ' Goes live with the next site update.' : ''}`);
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setMoving(false);
    }
  }

  async function save(overwrite = false) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/authoring/save-raw', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({path, markdown, ...(overwrite || !serverHash ? {} : {baseHash: serverHash})}),
      });
      const data = await res.json();
      if (res.status === 409 && data.error === 'stale-base') {
        const ok = await notify.confirm({
          title: 'Someone else changed this article',
          message: 'Another editor saved a newer version after you loaded it. Overwrite their version with yours? (Cancel keeps your editor as-is - copy anything you need, then reload to see their version.)',
          confirmLabel: 'Overwrite anyway',
          cancelLabel: 'Cancel',
          danger: true,
        });
        if (ok) { setSaving(false); return save(true); }
        return;
      }
      if (!res.ok) { notify.error(data.error || 'Save failed'); return; }
      setOriginal(markdown);
      setAudit(data.audit || null);
      setServerHash(data.hash || '');
      setSaveTick((t) => t + 1);
      if (data.queuedForDeploy) {
        notify.success('Saved and backing up. Your changes are scheduled for the next site update - watch progress on the Authoring queue.');
      } else {
        notify.success("Draft saved and backing up. Publish it from the Authoring queue when you're ready.");
      }
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function discard() {
    if (markdown === original) return;
    const ok = await notify.confirm({
      title: 'Discard changes?',
      message: 'Reset the editor to the last saved version. Unsaved edits (including AI refines) cannot be recovered.',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
      danger: true,
    });
    if (ok) setMarkdown(original);
  }

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Edit article</h1>
        <p>You don't have access to this page.</p>
        <p><Link to="/home">← Back to the homepage</Link></p>
      </div>
    );
  }

  const dirty = markdown !== original;

  return (
    <div className={styles.editWrap}>
      <header className={styles.header}>
        <div>
          <h1>
            Edit article{' '}
            {!loading && !loadError && (
              <span className={styles.stateBadge} data-state={isDraft ? 'draft' : 'published'}>
                {isDraft ? 'Draft' : 'Published'}
              </span>
            )}{' '}
            <PersistenceStatus refreshKey={saveTick} />
          </h1>
          <p className={styles.subhead}>
            {isDraft
              ? "You're editing a draft - readers can't see it until you publish it from the queue."
              : "You're editing the LIVE article - saved changes go to readers with the next site update."}{' '}
            <Link to="/admin/authoring/drafts">← Back to queue</Link>{' · '}
            <Link to="/admin/authoring/guide">Guide →</Link>
          </p>
        </div>
      </header>

      {loading && <p className={styles.hint}>Loading…</p>}
      {loadError && <div className={styles.error}>{loadError}</div>}

      {!loading && !loadError && (
        <>
          {/* Structured metadata - derived from + written back into the
              frontmatter so they stay consistent with the raw source below. */}
          <div className={styles.form}>
            <div className={styles.field}>
              <label>Title</label>
              <input
                type="text"
                value={fm.title}
                placeholder="How to create a manual quiz"
                disabled={busy}
                onChange={(e) => patchFrontmatter({title: e.target.value})}
              />
              <div className={styles.fieldActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  disabled={busy || !parsed}
                  onClick={() => suggestField('title')}
                  title="Suggest a new title from the article body. Body untouched.">
                  {suggesting === 'title' ? 'Suggesting…' : 'Suggest a new title'}
                </button>
              </div>
              {fm.title && !titleShape.ok && (
                <span className={styles.warn}>{titleShape.hint}</span>
              )}
            </div>
            <div className={styles.field}>
              <label>Description (one sentence, 60–160 chars)</label>
              <input
                type="text"
                value={fm.description}
                placeholder="Build a quiz from scratch with hand-picked questions and a reviewer."
                maxLength={160}
                disabled={busy}
                onChange={(e) => patchFrontmatter({description: e.target.value})}
              />
              <div className={styles.fieldActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  disabled={busy || !parsed}
                  onClick={() => suggestField('description')}
                  title="Suggest a new description from the article body. Body untouched.">
                  {suggesting === 'description' ? 'Suggesting…' : 'Suggest a new description'}
                </button>
                <span className={styles.hint}>{fm.description.length}/160</span>
              </div>
            </div>
            <TagPicker tags={fm.tags} onChange={(tags) => patchFrontmatter({tags})} disabled={busy} />
            <div className={styles.field}>
              <label>Folder (section / sub-folder)</label>
              <div className={styles.selectorRow}>
                <select
                  value={moveLocation}
                  disabled={busy || !parsed}
                  onChange={(e) => {
                    setMoveLocation(e.target.value);
                    const loc = locations.find((l) => l.dir === e.target.value);
                    setMoveDir(loc && loc.subs.length === 0 && loc.allowRoot ? loc.dir : '');
                  }}>
                  <option value="">- pick a section -</option>
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
                <select
                  value={moveDir}
                  disabled={busy || !parsed || !moveLoc}
                  onChange={(e) => setMoveDir(e.target.value)}>
                  <option value="">- pick a folder -</option>
                  {moveLoc?.allowRoot && <option value={moveLoc.dir}>(section root)</option>}
                  {moveLoc?.subs.map((s) => <option key={s.dir} value={s.dir}>{s.label}</option>)}
                </select>
                <button
                  type="button"
                  className={styles.btnGhost}
                  disabled={busy || !moveChanged || dirty}
                  onClick={move}
                  title={dirty
                    ? 'Save your changes before moving.'
                    : moveChanged ? 'Move this article to the selected folder' : 'Pick a different folder to move'}>
                  {moving ? 'Moving…' : 'Move'}
                </button>
              </div>
              {moveChanged && !dirty && (
                <span className={styles.hint}>
                  Moving changes the article's web address (the old one redirects) and may reset its audience to the destination folder's default.
                </span>
              )}
              {moveChanged && dirty && (
                <span className={styles.warn}>Save your changes before moving.</span>
              )}
            </div>
          </div>

          {/* AI refine - rewrites the body per the note, preserving publish state. */}
          <div className={styles.refineRow}>
            <textarea
              rows={2}
              value={refinement}
              disabled={refining}
              placeholder="Refine with AI: e.g. 'tighten the intro', 'add a step about reviewer permissions', 'make the tone less formal'…"
              onChange={(e) => setRefinement(e.target.value)}
            />
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnGhost}
                disabled={busy || !refinement.trim() || !parsed}
                onClick={refine}
                title="Rewrite the article body to apply your note. Existing content is preserved; the publish state is kept.">
                {refining ? 'Refining…' : 'Refine with AI'}
              </button>
            </div>
          </div>

          <div className={styles.editLayout}>
            <textarea
              ref={textareaRef}
              className={styles.editTextarea}
              value={markdown}
              spellCheck={false}
              onChange={(e) => setMarkdown(e.target.value)}
              aria-label="Markdown source"
            />
            <article
              className={`${styles.preview} ${styles.editPreview}`}
              dangerouslySetInnerHTML={{__html: previewHtml}}
            />
          </div>
          {audit && audit.findings.length > 0 && (
            <div className={styles.auditPanel}>
              <h3>Audit · score {audit.score} <span className={styles.hint}>(advisory only)</span></h3>
              <ul>
                {audit.findings.map((f, idx) => (
                  <li key={f.key + '-' + idx} className={styles.findWarn}>
                    <strong>{f.label}</strong>
                    {f.detail && <span className={styles.findDetail}> - {f.detail}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.editActions}>
            <PersistenceStatus refreshKey={saveTick} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              style={{display: 'none'}}
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) uploadImageFile(f);
                if (e.target) e.target.value = '';  // allow re-picking the same file
              }}
            />
            <button
              type="button"
              className={styles.btnGhost}
              disabled={busy || loading || !!loadError}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              title="Upload an image and insert the markdown at the cursor position">
              {uploading ? 'Uploading…' : 'Upload image'}
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              disabled={!dirty || busy}
              onClick={discard}>
              Discard changes
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={!dirty || busy || loading || !!loadError || tagMissing}
              onClick={() => save()}
              title={tagMissing ? 'Add at least one tag before saving.' : ''}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </>
      )}

      {notify.host}
    </div>
  );
}

export default function EditPage(): ReactNode {
  return (
    <Layout title="Edit article - Admin" description="Unified editor: AI refine, raw markdown, image upload, and metadata.">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <EditorPanel />}
      </BrowserOnly>
    </Layout>
  );
}

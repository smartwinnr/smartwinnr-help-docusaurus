import React, {useEffect, useReducer, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import styles from './styles.module.css';

/**
 * In-app authoring skill - `/admin/authoring`.
 *
 * 4-step wizard (plan §19). The editor fills two short forms and a
 * brain-dump; the model handles structure. Superadmin only.
 *
 *   1. Where + who      (module / sub-folder / audience roles / privilege)
 *   2. The hook         (title / description / tags)
 *   3. Brain dump       (rough explanation + screenshots)
 *   4. Preview + refine (LLM-generated markdown, audit panel, save)
 *
 * State persists to localStorage so a refresh mid-wizard doesn't lose
 * the editor's progress. Only step 3→4 (Generate) and 4→4 (Refine)
 * hit the model.
 */

const STORAGE_KEY = 'sw.authoring.wizard.v1';

// Modules — `value` is the slug used in `docs/modules/<value>/`, `label`
// is the display string. We hand-curate the labels rather than auto-
// title-casing because some names have non-standard capitalization
// (AI, SmartFeed, SmartPath, KPI).
const MODULES: Array<{value: string; label: string}> = [
  {value: 'ai-coaching',      label: 'AI Coaching'},
  {value: 'cross-module',     label: 'Cross-Module'},
  {value: 'field-coaching',   label: 'Field Coaching'},
  {value: 'forms',            label: 'Forms'},
  {value: 'knowledge-hub',    label: 'Knowledge Hub'},
  {value: 'kpi-gamification', label: 'KPI & Gamification'},
  {value: 'notifications',    label: 'Notifications'},
  {value: 'quiz',             label: 'Quiz'},
  {value: 'smartfeed',        label: 'SmartFeed'},
  {value: 'smartpath',        label: 'SmartPath'},
  {value: 'survey',           label: 'Survey'},
  {value: 'video-coaching',   label: 'Video Coaching'},
];

const SUB_FOLDERS = [
  {value: 'for-learners',          label: 'For Learners',          audience: ['user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'for-managers',          label: 'For Managers',          audience: ['manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'create-and-manage',     label: 'Create & Manage',       audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'assign-and-schedule',   label: 'Assign & Schedule',     audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'features',              label: 'Features',              audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'reports-and-analytics', label: 'Reports & Analytics',   audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'settings-and-permissions', label: 'Settings & Permissions', audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'best-practices',        label: 'Best Practices',        audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'faqs-and-troubleshooting', label: 'FAQs & Troubleshooting', audience: ['user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
];

const TAG_VOCAB = [
  'quiz', 'smartpath', 'smartfeed', 'video-coaching', 'ai-coaching',
  'field-coaching', 'survey', 'knowledge-hub', 'forms', 'kpi',
  'gamification', 'reports', 'notifications', 'settings', 'admin',
  'troubleshooting', 'billing', 'onboarding', 'mobile', 'web', 'integration',
];

type Image = {url: string; caption: string};

type Inputs = {
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
  step: 1 | 2 | 3 | 4;
  inputs: Inputs;
  markdown: string;
  audit: Audit | null;
  tokens: {prompt: number; completion: number} | null;
  generating: boolean;
  saving: boolean;
  error: string | null;
  saved: string | null;
};

const initial: State = {
  step: 1,
  inputs: {
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
};

type Action =
  | {type: 'set'; patch: Partial<Inputs>}
  | {type: 'step'; step: 1 | 2 | 3 | 4}
  | {type: 'generating'; on: boolean}
  | {type: 'generated'; markdown: string; audit: State['audit']; tokens: State['tokens']}
  | {type: 'saving'; on: boolean}
  | {type: 'saved'; path: string}
  | {type: 'error'; message: string}
  | {type: 'reset'};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'set':       return {...s, inputs: {...s.inputs, ...a.patch}, error: null};
    case 'step':      return {...s, step: a.step, error: null};
    case 'generating':return {...s, generating: a.on, error: null};
    case 'generated': return {...s, generating: false, markdown: a.markdown, audit: a.audit, tokens: a.tokens};
    case 'saving':    return {...s, saving: a.on};
    case 'saved':     return {...s, saving: false, saved: a.path};
    case 'error':     return {...s, error: a.message, generating: false, saving: false};
    case 'reset':     return initial;
  }
}

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function titleStartsWithVerbOrQuestion(t: string): boolean {
  if (!t) return false;
  const first = t.trim().split(/\s+/)[0].toLowerCase();
  const verbs = new Set([
    'how', 'what', 'why', 'when', 'where', 'who',
    'add', 'configure', 'create', 'manage', 'edit', 'delete', 'send',
    'set', 'view', 'enable', 'disable', 'import', 'export', 'update',
    'assign', 'review', 'duplicate', 'troubleshoot', 'build', 'find',
    'submit', 'open', 'close', 'archive',
  ]);
  return verbs.has(first);
}

function loadState(): State | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveState(s: State) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {/* swallow */}
}

// ════════ Step components ═════════════════════════════════════════════════

function Step1({state, dispatch}: {state: State; dispatch: React.Dispatch<Action>}): ReactNode {
  const i = state.inputs;
  const sub = SUB_FOLDERS.find((s) => s.value === i.subFolder);
  function setSub(value: string) {
    const def = SUB_FOLDERS.find((s) => s.value === value);
    dispatch({type: 'set', patch: {subFolder: value, audienceRoles: def ? def.audience : []}});
  }
  return (
    <div className={styles.form}>
      <h2 className={styles.stepHead}>Step 1 · Where + who</h2>
      <div className={styles.field}>
        <label>Module</label>
        <select value={i.module} onChange={(e) => dispatch({type: 'set', patch: {module: e.target.value}})}>
          <option value="">Select a module…</option>
          {MODULES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>
      <div className={styles.field}>
        <label>Sub-folder</label>
        <select value={i.subFolder} onChange={(e) => setSub(e.target.value)}>
          <option value="">Select a sub-folder…</option>
          {SUB_FOLDERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {sub && <span className={styles.hint}>Default audience: {sub.audience.join(', ')}</span>}
      </div>
      <div className={styles.field}>
        <label>Privilege (optional)</label>
        <input
          type="text"
          value={i.privilege}
          placeholder="e.g. quiz, smartpaths, managerView…"
          onChange={(e) => dispatch({type: 'set', patch: {privilege: e.target.value.trim()}})}
        />
        <span className={styles.hint}>Inherits from module's _category_.json if blank.</span>
      </div>
    </div>
  );
}

function Step2({state, dispatch}: {state: State; dispatch: React.Dispatch<Action>}): ReactNode {
  const i = state.inputs;
  const [customTag, setCustomTag] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);

  function addTag(t: string) {
    const tag = t.trim().toLowerCase();
    if (!tag) return;
    if (!/^[a-z][a-z0-9-]{0,30}$/.test(tag)) {
      setTagError('Tags use lowercase letters, digits, and dashes only (e.g. ai-coaching).');
      return;
    }
    if (i.tags.includes(tag)) {
      setTagError(`"${tag}" is already added.`);
      return;
    }
    if (i.tags.length >= 5) {
      setTagError('Maximum 5 tags. Remove one first.');
      return;
    }
    setTagError(null);
    dispatch({type: 'set', patch: {tags: [...i.tags, tag]}});
  }

  function removeTag(t: string) {
    dispatch({type: 'set', patch: {tags: i.tags.filter((x) => x !== t)}});
    setTagError(null);
  }

  const titleOk = titleStartsWithVerbOrQuestion(i.title);
  const availableVocab = TAG_VOCAB.filter((t) => !i.tags.includes(t));
  const tagsRequired = i.tags.length === 0;

  return (
    <div className={styles.form}>
      <h2 className={styles.stepHead}>Step 2 · The hook</h2>
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
        {i.title && !titleOk && (
          <span className={styles.warn}>
            Should start with an action verb or question word (How, What, Add, Create, Configure…).
          </span>
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
        <span className={styles.hint}>{i.description.length}/160</span>
      </div>
      <div className={styles.field}>
        <label>
          Tags <span className={styles.required}>· at least 1 required</span>{' '}
          <span className={styles.hint}>({i.tags.length}/5)</span>
        </label>

        {/* Selected tags - show with × to remove. */}
        {i.tags.length > 0 && (
          <div className={styles.tagRow}>
            {i.tags.map((t) => (
              <button
                key={t}
                type="button"
                className={styles.tagOn}
                onClick={() => removeTag(t)}
                title="Remove tag">
                {t} <span className={styles.tagRemove}>×</span>
              </button>
            ))}
          </div>
        )}

        {/* Add from controlled vocabulary. */}
        {availableVocab.length > 0 && i.tags.length < 5 && (
          <>
            <span className={styles.hint}>Pick from common tags:</span>
            <div className={styles.tagRow}>
              {availableVocab.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={styles.tagOff}
                  onClick={() => addTag(t)}>
                  + {t}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Create a new tag. */}
        {i.tags.length < 5 && (
          <div className={styles.tagAddRow}>
            <input
              type="text"
              value={customTag}
              placeholder="Or create a new tag (e.g. event-quiz)"
              maxLength={32}
              onChange={(e) => { setCustomTag(e.target.value); setTagError(null); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(customTag);
                  setCustomTag('');
                }
              }}
            />
            <button
              type="button"
              className={styles.btnGhost}
              disabled={!customTag.trim()}
              onClick={() => { addTag(customTag); setCustomTag(''); }}>
              Add
            </button>
          </div>
        )}

        {tagError && <span className={styles.warn}>{tagError}</span>}
        {tagsRequired && !tagError && (
          <span className={styles.warn}>Pick at least one tag to continue.</span>
        )}
      </div>
    </div>
  );
}

function Step3({state, dispatch}: {state: State; dispatch: React.Dispatch<Action>}): ReactNode {
  const i = state.inputs;
  const [uploading, setUploading] = useState(false);

  async function onFiles(files: FileList) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
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
        dispatch({type: 'set', patch: {images: [...i.images, {url, caption: ''}]}});
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
  function removeImage(idx: number) {
    dispatch({type: 'set', patch: {images: i.images.filter((_, x) => x !== idx)}});
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.stepHead}>Step 3 · Tell us about this feature</h2>
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
        <div className={styles.dropzone}>
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={(e) => e.target.files && onFiles(e.target.files)}
          />
          <span>Drop screenshots here or click to upload. PNG/JPG/GIF/WEBP, ≤ 5 MB each.</span>
          {uploading && <span className={styles.hint}>Uploading…</span>}
        </div>
        {i.images.length > 0 && (
          <ul className={styles.imageList}>
            {i.images.map((img, idx) => (
              <li key={img.url}>
                <img src={img.url} alt="" />
                <input
                  type="text"
                  placeholder="What does this screenshot show?"
                  value={img.caption}
                  onChange={(e) => setCaption(idx, e.target.value)}
                />
                <button type="button" onClick={() => removeImage(idx)} className={styles.removeBtn}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Step4({state, dispatch}: {state: State; dispatch: React.Dispatch<Action>}): ReactNode {
  const [refinement, setRefinement] = useState('');
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
      setRefinement('');
    } catch (err) {
      dispatch({type: 'error', message: (err as Error).message});
    }
  }

  async function save() {
    dispatch({type: 'saving', on: true});
    try {
      const res = await fetch('/api/admin/authoring/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({
          markdown: state.markdown,
          module: i.module,
          subFolder: i.subFolder,
          slug: i.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch({type: 'error', message: data.error || 'Save failed'});
        return;
      }
      dispatch({type: 'saved', path: data.path});
    } catch (err) {
      dispatch({type: 'error', message: (err as Error).message});
    }
  }

  useEffect(() => {
    if (!state.markdown && !state.generating) regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.previewWrap}>
      <h2 className={styles.stepHead}>Step 4 · Review + refine</h2>
      {state.generating && <p className={styles.hint}>Generating…</p>}
      {!state.generating && state.markdown && (
        <>
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
                disabled={state.saving || !!(state.audit && state.audit.findings.some((f) => f.blocking))}
                onClick={save}>
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
              Saved to <code>{state.saved}</code>. The draft is hidden in production builds -
              flip <code>draft: true</code> to <code>false</code> via the publish action when ready.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ════════ Markdown rendering hook ═════════════════════════════════════════

function useMarkdownHtml(md: string): string {
  const [html, setHtml] = useState('');
  useEffect(() => {
    if (!md) { setHtml(''); return; }
    (async () => {
      try {
        const mod = await import('markdown-it');
        const MarkdownIt = (mod as {default?: typeof import('markdown-it')}).default || mod;
        const ctor = (MarkdownIt as unknown as new (opts?: object) => {render(s: string): string});
        const renderer = new ctor({html: false, linkify: true, typographer: true});
        // Strip frontmatter for preview rendering - it isn't HTML
        const body = md.replace(/^---[\s\S]*?\n---\s*\n?/, '');
        setHtml(renderer.render(body));
      } catch { setHtml('<pre>' + md.replace(/</g, '&lt;') + '</pre>'); }
    })();
  }, [md]);
  return html;
}

// ════════ Wizard root ═════════════════════════════════════════════════════

function canAdvance(s: State): boolean {
  const i = s.inputs;
  if (s.step === 1) return !!i.module && !!i.subFolder && i.audienceRoles.length > 0;
  if (s.step === 2) return !!i.title && titleStartsWithVerbOrQuestion(i.title)
    && i.description.length >= 60 && i.description.length <= 160
    && i.tags.length >= 1 && i.tags.length <= 5;
  if (s.step === 3) return i.roughExplanation.length >= 200
    && i.images.every((img) => img.caption.trim().length >= 4);
  return true;
}

function Wizard(): ReactNode {
  const user = useCurrentUser();
  const [state, dispatch] = useReducer(reducer, initial, (init) => loadState() || init);

  useEffect(() => { saveState(state); }, [state]);

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Authoring</h1>
        <p>This page is restricted to <strong>superadmin</strong>.</p>
        <p><Link to="/">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Authoring</h1>
          <p className={styles.subhead}>
            Step {state.step} of 4 ·{' '}
            <Link to="/admin/authoring/drafts">Drafts queue →</Link>
          </p>
        </div>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={() => { if (confirm('Discard wizard state and start over?')) dispatch({type: 'reset'}); }}>
          Start over
        </button>
      </header>

      <ol className={styles.stepper}>
        {[1, 2, 3, 4].map((n) => (
          <li key={n} className={state.step === n ? styles.stepOn : state.step > n ? styles.stepDone : styles.stepOff}>
            {n}
          </li>
        ))}
      </ol>

      {state.error && <div className={styles.error}>⚠ {state.error}</div>}

      {state.step === 1 && <Step1 state={state} dispatch={dispatch} />}
      {state.step === 2 && <Step2 state={state} dispatch={dispatch} />}
      {state.step === 3 && <Step3 state={state} dispatch={dispatch} />}
      {state.step === 4 && <Step4 state={state} dispatch={dispatch} />}

      {state.step < 4 && (
        <div className={styles.actions}>
          {state.step > 1 && (
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => dispatch({type: 'step', step: (state.step - 1) as 1 | 2 | 3})}>
              ← Back
            </button>
          )}
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!canAdvance(state)}
            onClick={() => dispatch({type: 'step', step: (state.step + 1) as 2 | 3 | 4})}>
            {state.step === 3 ? 'Generate →' : 'Next →'}
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

import React, {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {useNotify} from '@site/src/components/admin/authoring/Notify';
import {useMarkdownHtml} from '@site/src/lib/markdown-preview';
import {
  parsePath,
  parseFrontmatterFields,
  replaceFrontmatterFields,
  checkTitleShape,
  getDraftFlag,
  setDraftFlag,
  SUB_FOLDERS,
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
  const previewHtml = useMarkdownHtml(markdown);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Move-to-folder control.
  const [modules, setModules] = useState<Array<{slug: string; label: string}>>([]);
  const [moveModule, setMoveModule] = useState<string>('');
  const [moveSubFolder, setMoveSubFolder] = useState<string>('');
  const [moving, setMoving] = useState<boolean>(false);

  // markdown is the single source of truth. Metadata fields are derived from
  // its frontmatter and write back through replaceFrontmatterFields, so the
  // textarea, the fields, and the saved file never drift apart.
  const fm = useMemo(() => parseFrontmatterFields(markdown) ?? EMPTY_FM, [markdown]);
  const parsed = useMemo(() => parsePath(path), [path]);
  const isDraft = getDraftFlag(markdown) === true;
  const titleShape = checkTitleShape(fm.title, parsed?.subFolder ?? '');
  const busy = saving || refining || uploading || moving || suggesting !== null;
  // Mirror the wizard's metadata gate: an article must carry at least one tag.
  const tagMissing = fm.tags.length === 0;
  // Move target differs from the article's current folder?
  const moveChanged = !!parsed && (moveModule !== parsed.module || moveSubFolder !== parsed.subFolder);

  /** Article slug for the /upload filename suffix (path's last segment). */
  const articleSlug = (() => {
    const m = /\/([^/]+?)\.(md|mdx)$/.exec(path);
    return m ? m[1] : 'authored';
  })();

  /** Write a frontmatter field back into the markdown source. */
  function patchFrontmatter(patch: {title?: string; description?: string; tags?: string[]}) {
    setMarkdown((md) => replaceFrontmatterFields(md, patch));
  }

  /** Insert `text` at the textarea's cursor; restores the caret after paint. */
  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    const start = ta ? ta.selectionStart : markdown.length;
    const end = ta ? ta.selectionEnd : markdown.length;
    const next = markdown.slice(0, start) + text + markdown.slice(end);
    setMarkdown(next);
    requestAnimationFrame(() => {
      if (!ta) return;
      const pos = start + text.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
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
      // Empty alt text on purpose so the editor fills in something meaningful
      // (the alt-text lint rule nudges them).
      insertAtCursor(`![](${data.url})`);
      notify.success(`Image uploaded as ${data.url.split('/').pop()}.`);
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
      notify.success('Refined. Review the changes, then Save.');
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
      } catch (err) {
        setLoadError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, location.search]);

  // Module list for the Move picker (same source as the wizard's Step 1).
  useEffect(() => {
    if (!(user.roles || []).includes('superadmin')) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/authoring/modules', {credentials: 'same-origin'});
        if (!res.ok) return;
        const data = await res.json();
        setModules((data.modules || []).slice().sort(
          (a: {label: string}, b: {label: string}) => a.label.localeCompare(b.label)));
      } catch {/* fail soft - the picker just stays empty */}
    })();
  }, [user]);

  // Default the Move selects to the article's current folder once the path resolves.
  useEffect(() => {
    if (parsed) { setMoveModule(parsed.module); setMoveSubFolder(parsed.subFolder); }
  }, [parsed?.module, parsed?.subFolder]);

  /** Relocate the article to the selected module / sub-folder. Operates on the
   *  saved file (Move is disabled while there are unsaved edits), then reloads
   *  the server-rewritten frontmatter and re-points the URL to the new path. */
  async function move() {
    if (!parsed || !moveChanged) return;
    const subLabel = SUB_FOLDERS.find((s) => s.value === moveSubFolder)?.label ?? moveSubFolder;
    const modLabel = modules.find((m) => m.slug === moveModule)?.label ?? moveModule;
    const ok = await notify.confirm({
      title: 'Move article?',
      message: `Move to ${modLabel} / ${subLabel}? This changes the article's URL and resets its audience to that folder's default.${isDraft ? '' : ' It ships on the next deploy.'}`,
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
        body: JSON.stringify({fromPath: path, toModule: moveModule, toSubFolder: moveSubFolder}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { notify.error(data.error || 'Move failed'); return; }
      // Reload from the new location so the editor reflects the server-rewritten
      // frontmatter (roles re-homed, privilege dropped) and clears the dirty flag.
      setPath(data.toPath);
      try {
        const r2 = await fetch(`/api/admin/authoring/article?${new URLSearchParams({path: data.toPath})}`, {credentials: 'same-origin'});
        const d2 = await r2.json();
        if (r2.ok) { setOriginal(d2.markdown || ''); setMarkdown(d2.markdown || ''); }
      } catch {/* non-fatal - the move already succeeded */}
      // Keep the URL in sync so a refresh reloads the new location.
      window.history.replaceState(null, '', `/admin/authoring/edit?${new URLSearchParams({path: data.toPath})}`);
      notify.success(`Moved to ${data.toPath}.${data.queuedForDeploy ? ' Queued for deploy.' : ''}`);
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setMoving(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/authoring/save-raw', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({path, markdown}),
      });
      const data = await res.json();
      if (!res.ok) { notify.error(data.error || 'Save failed'); return; }
      setOriginal(markdown);
      setAudit(data.audit || null);
      if (data.queuedForDeploy) {
        notify.success(`Saved ${data.path}. Queued for deploy - production picks it up on the next batch.`);
      } else {
        notify.success(`Saved ${data.path} (draft - not queued for deploy until you Publish).`);
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
        <p><Link to="/">← Back to the homepage</Link></p>
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
            )}
          </h1>
          <p className={styles.subhead}>
            Saves to <code className={styles.smallCode}>{path || '…'}</code>.{' '}
            {isDraft
              ? 'A draft does not ship until you Publish from the queue.'
              : 'Saving queues a deploy; production updates on the next batch.'}{' '}
            <Link to="/admin/authoring/drafts">← Back to queue</Link>
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
                  title="Ask the LLM to suggest a new title from the article body + sub-folder shape. Body untouched.">
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
                  title="Ask the LLM to suggest a new description from the article body. Body untouched.">
                  {suggesting === 'description' ? 'Suggesting…' : 'Suggest a new description'}
                </button>
                <span className={styles.hint}>{fm.description.length}/160</span>
              </div>
            </div>
            <TagPicker tags={fm.tags} onChange={(tags) => patchFrontmatter({tags})} disabled={busy} />
            <div className={styles.field}>
              <label>Folder (module / sub-folder)</label>
              <div className={styles.selectorRow}>
                <select
                  value={moveModule}
                  disabled={busy || !parsed}
                  onChange={(e) => setMoveModule(e.target.value)}>
                  {modules.map((m) => <option key={m.slug} value={m.slug}>{m.label}</option>)}
                </select>
                <select
                  value={moveSubFolder}
                  disabled={busy || !parsed}
                  onChange={(e) => setMoveSubFolder(e.target.value)}>
                  {SUB_FOLDERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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
                  Moving changes the article's URL and resets its audience to the destination folder's default.
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
              onClick={save}
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

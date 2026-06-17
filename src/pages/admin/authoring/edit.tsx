import React, {useEffect, useRef, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {useNotify} from '@site/src/components/admin/authoring/Notify';
import {useMarkdownHtml} from '@site/src/lib/markdown-preview';
import styles from './styles.module.css';

/**
 * Raw markdown editor for any docs/ article (draft or published).
 * Surgical-fix path - no LLM round-trip, audit findings are advisory.
 *
 * GET    /api/admin/authoring/article?path=...
 * POST   /api/admin/authoring/save-raw       { path, markdown }
 *
 * Superadmin only. Entry point: drafts queue → Published tab → Edit raw.
 * Plan §B.
 */

type AuditFinding = {
  key: string;
  label: string;
  detail?: string;
  blocking?: boolean;
};
type Audit = { score: number; findings: AuditFinding[] };

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
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const previewHtml = useMarkdownHtml(markdown);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Derive the article slug from the path (last segment, no extension).
   *  The /upload endpoint requires a slug for the filename suffix. */
  const articleSlug = (() => {
    const m = /\/([^/]+?)\.(md|mdx)$/.exec(path);
    return m ? m[1] : 'authored';
  })();

  /** Insert `text` at the textarea's current cursor position. Returns the
   *  new full string so React state can be updated. Restores the cursor
   *  to just after the inserted text. */
  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    const start = ta ? ta.selectionStart : markdown.length;
    const end = ta ? ta.selectionEnd : markdown.length;
    const next = markdown.slice(0, start) + text + markdown.slice(end);
    setMarkdown(next);
    // Restore the cursor on the next paint.
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
      // Markdown image syntax; alt text intentionally empty so the editor
      // fills it in (and the no-decorative-emoji + alt-text lint rules
      // nudge them to write something meaningful).
      insertAtCursor(`![](${data.url})`);
      notify.success(`Image uploaded as ${data.url.split('/').pop()}.`);
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setUploading(false);
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
      notify.success(`Saved ${data.path}`);
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
      message: 'Reset the editor to the last saved version. Unsaved edits cannot be recovered.',
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
          <h1>Edit article</h1>
          <p className={styles.subhead}>
            Raw markdown editor. Saves directly to <code className={styles.smallCode}>{path || '…'}</code>.{' '}
            <Link to="/admin/authoring/drafts">← Back to queue</Link>
          </p>
        </div>
        <div className={styles.actions}>
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
            disabled={uploading || loading || !!loadError}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="Upload an image and insert the markdown at the cursor position">
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            disabled={!dirty || saving}
            onClick={discard}>
            Discard changes
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!dirty || saving || loading || !!loadError}
            onClick={save}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {loading && <p className={styles.hint}>Loading…</p>}
      {loadError && <div className={styles.error}>{loadError}</div>}

      {!loading && !loadError && (
        <>
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
        </>
      )}

      {notify.host}
    </div>
  );
}

export default function EditPage(): ReactNode {
  return (
    <Layout title="Edit article - Admin" description="Raw markdown editor for published articles.">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <EditorPanel />}
      </BrowserOnly>
    </Layout>
  );
}

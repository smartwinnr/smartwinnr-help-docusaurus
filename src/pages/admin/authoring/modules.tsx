import React, {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {useNotify} from '@site/src/components/admin/authoring/Notify';
import styles from './styles.module.css';

/**
 * Module taxonomy admin - /admin/authoring/modules.
 * Lists existing modules and lets a superadmin add a new one. Adding a
 * module writes data/modules.json + a full docs/modules/<slug>/ skeleton
 * (module root + 9 sub-folders) via POST /api/admin/authoring/modules.
 *
 * If the entered privilege isn't already in data/known-privileges.json,
 * the server appends it and we surface a yellow LMS-side warning so the
 * org-admin knows to wire the privilege into the LMS enum before users
 * will actually carry it.
 */

type Module = {
  slug: string;
  label: string;
  privilege?: string;
  anyPrivilege?: string[];
  description?: string;
  position?: number;
};

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,120}$/;

function ModulesAdmin(): ReactNode {
  const user = useCurrentUser();
  const notify = useNotify();
  const [modules, setModules] = useState<Module[]>([]);
  const [knownPrivileges, setKnownPrivileges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [slug, setSlug] = useState('');
  const [label, setLabel] = useState('');
  const [privilegeMode, setPrivilegeMode] = useState<'existing' | 'new' | 'none'>('existing');
  const [privilegeKnown, setPrivilegeKnown] = useState('');
  const [privilegeNew, setPrivilegeNew] = useState('');
  const [description, setDescription] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/authoring/modules', {credentials: 'same-origin'});
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setModules(data.modules || []);
      setKnownPrivileges((data.privileges || []).slice().sort());
    } catch (err) {
      notify.error(`Failed to load modules: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!(user.roles || []).includes('superadmin')) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function resetForm() {
    setSlug(''); setLabel(''); setPrivilegeMode('existing');
    setPrivilegeKnown(''); setPrivilegeNew(''); setDescription('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!SLUG_RE.test(slug)) { notify.error('Slug must be kebab-case (a-z, 0-9, hyphen).'); return; }
    if (!label.trim()) { notify.error('Label required.'); return; }
    const privilege =
      privilegeMode === 'existing' ? privilegeKnown.trim() :
      privilegeMode === 'new' ? privilegeNew.trim() : '';
    if (privilegeMode === 'new' && !SLUG_RE.test(privilege)) {
      notify.error('New privilege key must be kebab-case or camelCase (a-z, 0-9, hyphen).');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/authoring/modules', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({slug, label: label.trim(), privilege: privilege || undefined, description: description.trim() || undefined}),
      });
      const data = await res.json();
      if (!res.ok) { notify.error(data.error || 'Failed to add module'); return; }
      if (data.privilegeAdded && data.novelPrivilege) {
        notify.info(
          `Module added. Privilege "${data.novelPrivilege}" was new - ask the org-admin to add it to the LMS privileges enum before users will actually carry this gate.`,
        );
      } else {
        notify.success(`Module "${label}" added.`);
      }
      resetForm();
      await refresh();
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Modules</h1>
        <p>You don't have access to this page.</p>
        <p><Link to="/">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Modules</h1>
          <p className={styles.subhead}>
            Module taxonomy used by the authoring wizard and the drafts queue.{' '}
            <Link to="/admin/authoring/drafts">← Back to queue</Link>
          </p>
        </div>
      </header>

      <h2 className={styles.stepHead}>Existing modules</h2>
      {loading && <p className={styles.hint}>Loading…</p>}
      {!loading && (
        <table className={styles.draftTable}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Slug</th>
              <th>Privilege</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {modules.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map((m) => (
              <tr key={m.slug}>
                <td><strong>{m.label}</strong></td>
                <td><code className={styles.smallCode}>{m.slug}</code></td>
                <td>
                  {m.privilege && <code className={styles.smallCode}>{m.privilege}</code>}
                  {m.anyPrivilege && (
                    <code className={styles.smallCode}>any: {m.anyPrivilege.join(', ')}</code>
                  )}
                  {!m.privilege && !m.anyPrivilege && <span className={styles.hint}>none</span>}
                </td>
                <td className={styles.tabular}>{m.position ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className={styles.stepHead} style={{marginTop: '2rem'}}>Add a module</h2>
      <form onSubmit={submit} className={styles.form}>
        <div className={styles.field}>
          <label>Slug <span className={styles.required}>required</span></label>
          <input
            type="text"
            placeholder="e.g. competitions"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
          />
          <span className={styles.hint}>
            kebab-case. Becomes <code>docs/modules/{slug || '<slug>'}/</code>.
          </span>
        </div>
        <div className={styles.field}>
          <label>Label <span className={styles.required}>required</span></label>
          <input
            type="text"
            placeholder="e.g. Competitions"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <span className={styles.hint}>Display name. Hand-capitalize if needed (e.g. "AI Coaching", "SmartPath").</span>
        </div>
        <div className={styles.field}>
          <label>Privilege gate</label>
          <select value={privilegeMode} onChange={(e) => setPrivilegeMode(e.target.value as 'existing' | 'new' | 'none')}>
            <option value="existing">Pick an existing privilege</option>
            <option value="new">Use a new privilege key</option>
            <option value="none">No privilege gate (visible to all licensed roles)</option>
          </select>
          {privilegeMode === 'existing' && (
            <select value={privilegeKnown} onChange={(e) => setPrivilegeKnown(e.target.value)}>
              <option value="">Select a privilege…</option>
              {knownPrivileges.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          {privilegeMode === 'new' && (
            <>
              <input
                type="text"
                placeholder="e.g. competitionsV2"
                value={privilegeNew}
                onChange={(e) => setPrivilegeNew(e.target.value)}
              />
              <p className={styles.warn}>
                This privilege isn't yet defined in the LMS. After adding, ask the org-admin
                to add <code>{privilegeNew || '<new-key>'}</code> to the LMS privileges enum -
                otherwise users won't actually carry the gate.
              </p>
            </>
          )}
        </div>
        <div className={styles.field}>
          <label>Description</label>
          <input
            type="text"
            placeholder="Optional. Short one-liner about the module."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={
              saving || !slug || !label
              || (privilegeMode === 'existing' && !privilegeKnown)
              || (privilegeMode === 'new' && !privilegeNew)
            }>
            {saving ? 'Adding…' : 'Add module'}
          </button>
          <button type="button" className={styles.btnGhost} onClick={resetForm} disabled={saving}>
            Reset
          </button>
        </div>
      </form>

      {notify.host}
    </div>
  );
}

export default function ModulesPage(): ReactNode {
  return (
    <Layout title="Modules - Admin" description="Module taxonomy for the authoring wizard.">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <ModulesAdmin />}
      </BrowserOnly>
    </Layout>
  );
}

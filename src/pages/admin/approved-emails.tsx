import React, {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {useNotify} from '@site/src/components/admin/authoring/Notify';
import styles from '@site/src/pages/admin/authoring/styles.module.css';

/**
 * Approved emails admin - /admin/approved-emails. Superadmin only.
 *
 * Release-pipeline owner-notify / author-welcome emails (server.js:
 * notifyExistingOwner, notifyNewAuthor) only ever reach a smartwinnr.com
 * address outright. Anyone else must be added here first - lib/email-
 * allowlist.js checks this list before either email is sent.
 */

type ApprovedEmail = {
  id: number;
  email: string;
  added_at: string;
  added_by: string | null;
};

function ApprovedEmailsAdmin(): ReactNode {
  const user = useCurrentUser();
  const notify = useNotify();
  const [approved, setApproved] = useState<ApprovedEmail[]>([]);
  const [allowedDomain, setAllowedDomain] = useState('smartwinnr.com');
  const [loading, setLoading] = useState(true);
  const [draftEmail, setDraftEmail] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/approved-emails', {credentials: 'same-origin'});
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setApproved(data.approved || []);
      if (data.allowedDomain) setAllowedDomain(data.allowedDomain);
    } catch (e) {
      notify.error(`Failed to load approved emails: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!(user.roles || []).includes('superadmin')) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function addEmail() {
    const email = draftEmail.trim();
    if (!email) { notify.error('Email required'); return; }
    try {
      const res = await fetch('/api/admin/approved-emails', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({email}),
      });
      const data = await res.json();
      if (!res.ok) { notify.error(data.error || 'Failed to add'); return; }
      setDraftEmail('');
      notify.success(`Approved ${email}.`);
      await refresh();
    } catch (e) {
      notify.error((e as Error).message);
    }
  }

  async function removeEmail(row: ApprovedEmail) {
    const ok = await notify.confirm({
      title: `Remove ${row.email}?`,
      message: 'They will stop receiving release-pipeline notification emails until re-approved.',
      confirmLabel: 'Remove',
      cancelLabel: 'Keep',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/approved-emails/${row.id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        notify.error(data.error || 'Failed to remove');
        return;
      }
      notify.success(`Removed ${row.email}.`);
      await refresh();
    } catch (e) {
      notify.error((e as Error).message);
    }
  }

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Approved emails</h1>
        <p>You don't have access to this page.</p>
        <p><Link to="/home">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Approved notification emails</h1>
          <p className={styles.subhead}>
            Release-pipeline owner-update and welcome emails only ever go to a
            <code className={styles.smallCode}> @{allowedDomain}</code> address automatically.
            Add any other address here before it can receive one - useful for testing with a
            personal inbox, or for anyone who owns an article but doesn't have a company email on record.
          </p>
        </div>
        <button type="button" className={styles.btnGhost} onClick={refresh} disabled={loading}>Refresh</button>
      </header>

      <section className={styles.auditPanel}>
        <h3 style={{marginBottom: 'var(--space-2)'}}>
          Approved{' '}
          <span className={styles.hint}>({approved.length} email{approved.length === 1 ? '' : 's'})</span>
        </h3>

        <table className={styles.draftTable}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Added</th>
              <th>Added by</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {approved.length === 0 && (
              <tr><td colSpan={4} className={styles.hint}>No non-{allowedDomain} emails approved yet.</td></tr>
            )}
            {approved.map((row) => (
              <tr key={row.id}>
                <td>{row.email}</td>
                <td className={styles.tabular}>{row.added_at.slice(0, 10)}</td>
                <td className={styles.smallCode}>{row.added_by || '-'}</td>
                <td className={styles.rowActions}>
                  <button type="button" className={styles.btnGhost} onClick={() => removeEmail(row)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.tabToolbar} style={{marginTop: 'var(--space-3)'}}>
          <label className={styles.inlineLabel}>
            Email
            <input
              type="email"
              placeholder="alice@example.com"
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
              style={{minWidth: 240, padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6}}
            />
          </label>
          <button type="button" className={styles.btnPrimary} onClick={addEmail}>
            Approve
          </button>
        </div>
      </section>

      {notify.host}
    </div>
  );
}

export default function ApprovedEmailsPage(): ReactNode {
  return (
    <Layout title="Approved emails - Admin" description="Non-company emails approved to receive release-pipeline notifications.">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <ApprovedEmailsAdmin />}
      </BrowserOnly>
    </Layout>
  );
}

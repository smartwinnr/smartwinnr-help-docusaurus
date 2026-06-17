import React, {useEffect, useMemo, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {useNotify} from '@site/src/components/admin/authoring/Notify';
import styles from '@site/src/pages/admin/authoring/styles.module.css';

/**
 * Analytics digest admin - /admin/digests. Superadmin only.
 *
 * Three cards (editor-gap, ops-snapshot, module-overview). Each card has
 * its own subscriber list + a "Send now" trigger that fires the same
 * pipeline cron uses (just bypassing the CRON_SECRET check via the
 * superadmin route).
 *
 * Per plan in .claude/plans/our-help-site-menus-parsed-kernighan.md.
 */

type DigestType = 'editor-gap' | 'ops-snapshot' | 'module-overview';

type Subscription = {
  id: number;
  digest_type: DigestType;
  email: string;
  region: string;
  added_at: string;
  added_by: string | null;
};

type SendLogRow = {
  id: number;
  digest_type: DigestType;
  sent_at: string;
  recipient_count: number;
  status: 'sent' | 'failed' | 'no-recipients' | 'no-data';
  error: string | null;
  meta_json: string | null;
};

type LastSentRow = { digest_type: DigestType; sent_at: string; status: string };

const DIGEST_TYPES: Array<{type: DigestType; label: string; tagline: string}> = [
  {type: 'editor-gap',      label: 'Editor gap report',    tagline: 'Top unanswered queries, low-CTR articles, thumbs-down feedback.'},
  {type: 'ops-snapshot',    label: 'Ops snapshot',         tagline: 'Volume, refusal/fallback rate, latency, DB health.'},
  {type: 'module-overview', label: 'Module overview',      tagline: 'Per-module query count + top unanswered per module.'},
];

const REGIONS = [
  {value: 'global',     label: 'Global (app.smartwinnr.com)'},
  {value: 'ap-south-1', label: 'AP South 1 (ap-south-1.smartwinnr.com)'},
];

function DigestsAdmin(): ReactNode {
  const user = useCurrentUser();
  const notify = useNotify();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [lastSent, setLastSent] = useState<Record<string, LastSentRow>>({});
  const [log, setLog] = useState<SendLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<DigestType | null>(null);
  // Per-card add form state.
  const [draftEmail, setDraftEmail] = useState<Record<DigestType, string>>({
    'editor-gap': '', 'ops-snapshot': '', 'module-overview': '',
  });
  const [draftRegion, setDraftRegion] = useState<Record<DigestType, string>>({
    'editor-gap': 'global', 'ops-snapshot': 'global', 'module-overview': 'global',
  });

  async function refresh() {
    setLoading(true);
    try {
      const [subsRes, lastRes, logRes] = await Promise.all([
        fetch('/api/admin/digests/subscriptions', {credentials: 'same-origin'}),
        fetch('/api/admin/digests/last-sent',     {credentials: 'same-origin'}),
        fetch('/api/admin/digests/log?limit=20',  {credentials: 'same-origin'}),
      ]);
      if (!subsRes.ok) throw new Error(`subs: ${subsRes.status}`);
      const subsData = await subsRes.json();
      setSubs(subsData.subscriptions || []);
      if (lastRes.ok) {
        const lastData = await lastRes.json();
        const map: Record<string, LastSentRow> = {};
        for (const r of (lastData.lastSent || []) as LastSentRow[]) map[r.digest_type] = r;
        setLastSent(map);
      }
      if (logRes.ok) {
        const logData = await logRes.json();
        setLog(logData.log || []);
      }
    } catch (e) {
      notify.error(`Failed to load digests: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!(user.roles || []).includes('superadmin')) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const subsByType = useMemo(() => {
    const m: Record<DigestType, Subscription[]> = {
      'editor-gap': [], 'ops-snapshot': [], 'module-overview': [],
    };
    for (const s of subs) (m[s.digest_type] ||= []).push(s);
    return m;
  }, [subs]);

  async function addSubscriber(type: DigestType) {
    const email = (draftEmail[type] || '').trim();
    const region = draftRegion[type] || 'global';
    if (!email) { notify.error('Email required'); return; }
    try {
      const res = await fetch('/api/admin/digests/subscriptions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({type, email, region}),
      });
      const data = await res.json();
      if (!res.ok) { notify.error(data.error || 'Failed to add'); return; }
      setDraftEmail({...draftEmail, [type]: ''});
      notify.success(`Added ${email} to ${type}.`);
      await refresh();
    } catch (e) {
      notify.error((e as Error).message);
    }
  }

  async function removeSubscriber(s: Subscription) {
    const ok = await notify.confirm({
      title: `Remove ${s.email}?`,
      message: `They won't receive the ${s.digest_type} digest anymore.`,
      confirmLabel: 'Remove',
      cancelLabel: 'Keep',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/digests/subscriptions/${s.id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        notify.error(data.error || 'Failed to remove');
        return;
      }
      notify.success(`Removed ${s.email}.`);
      await refresh();
    } catch (e) {
      notify.error((e as Error).message);
    }
  }

  async function sendNow(type: DigestType) {
    setBusy(type);
    try {
      const res = await fetch(`/api/admin/digests/send-now?type=${encodeURIComponent(type)}`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok) { notify.error(data.error || 'Send failed'); return; }
      const results = (data.results || []) as Array<{region: string; status: string; recipientCount?: number; error?: string}>;
      const sent = results.filter((r) => r.status === 'sent');
      const failed = results.filter((r) => r.status === 'failed');
      const skipped = results.filter((r) => r.status === 'no-recipients' || r.status === 'no-data');
      if (sent.length && !failed.length) {
        const total = sent.reduce((acc, r) => acc + (r.recipientCount || 0), 0);
        notify.success(`Sent ${type} to ${total} recipient(s) across ${sent.length} region(s).`);
      } else if (failed.length) {
        notify.error(`${type}: ${failed.map((r) => `${r.region} (${r.error || 'failed'})`).join('; ')}`);
      } else if (skipped.length) {
        notify.info(`${type}: ${skipped.map((r) => `${r.region}: ${r.status}`).join('; ')}`);
      }
      await refresh();
    } catch (e) {
      notify.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Digests</h1>
        <p>You don't have access to this page.</p>
        <p><Link to="/">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Analytics digest emails</h1>
          <p className={styles.subhead}>
            Weekly digests with content gaps, ops health, and per-module signal.
            Subscribers receive Monday-morning emails rendered by the main app's MJML templates.
          </p>
        </div>
        <button type="button" className={styles.btnGhost} onClick={refresh} disabled={loading}>Refresh</button>
      </header>

      {DIGEST_TYPES.map(({type, label, tagline}) => {
        const list = subsByType[type] || [];
        const last = lastSent[type];
        return (
          <section key={type} className={styles.auditPanel} style={{marginBottom: 'var(--space-5)'}}>
            <h3 style={{marginBottom: 'var(--space-2)'}}>
              {label}{' '}
              <span className={styles.hint}>({list.length} subscriber{list.length === 1 ? '' : 's'})</span>
            </h3>
            <p className={styles.hint} style={{marginTop: 0}}>{tagline}</p>
            <p className={styles.hint}>
              {last
                ? <>Last sent <strong>{last.sent_at.slice(0, 16).replace('T', ' ')}</strong> · status <code className={styles.smallCode}>{last.status}</code></>
                : <>Never sent.</>}
            </p>

            <table className={styles.draftTable}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Region</th>
                  <th>Added</th>
                  <th>Added by</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr><td colSpan={5} className={styles.hint}>No subscribers yet.</td></tr>
                )}
                {list.map((s) => (
                  <tr key={s.id}>
                    <td>{s.email}</td>
                    <td><code className={styles.smallCode}>{s.region}</code></td>
                    <td className={styles.tabular}>{s.added_at.slice(0, 10)}</td>
                    <td className={styles.smallCode}>{s.added_by || '-'}</td>
                    <td className={styles.rowActions}>
                      <button type="button" className={styles.btnGhost} onClick={() => removeSubscriber(s)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.tabToolbar} style={{marginTop: 'var(--space-3)'}}>
              <div className={styles.selectorRow}>
                <label className={styles.inlineLabel}>
                  Email
                  <input
                    type="email"
                    placeholder="alice@example.com"
                    value={draftEmail[type]}
                    onChange={(e) => setDraftEmail({...draftEmail, [type]: e.target.value})}
                    style={{minWidth: 240, padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6}}
                  />
                </label>
                <label className={styles.inlineLabel}>
                  Region
                  <select value={draftRegion[type]} onChange={(e) => setDraftRegion({...draftRegion, [type]: e.target.value})}>
                    {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </label>
              </div>
              <div style={{display: 'flex', gap: 'var(--space-2)'}}>
                <button type="button" className={styles.btnGhost} onClick={() => addSubscriber(type)}>
                  Add subscriber
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={busy === type || list.length === 0}
                  onClick={() => sendNow(type)}>
                  {busy === type ? 'Sending…' : 'Send now'}
                </button>
              </div>
            </div>
          </section>
        );
      })}

      <h2 className={styles.stepHead}>Recent sends</h2>
      {log.length === 0 && <p className={styles.hint}>No sends yet.</p>}
      {log.length > 0 && (
        <table className={styles.draftTable}>
          <thead>
            <tr>
              <th>When</th>
              <th>Digest</th>
              <th>Recipients</th>
              <th>Status</th>
              <th>Error / meta</th>
            </tr>
          </thead>
          <tbody>
            {log.map((row) => (
              <tr key={row.id}>
                <td className={styles.tabular}>{row.sent_at.slice(0, 16).replace('T', ' ')}</td>
                <td><code className={styles.smallCode}>{row.digest_type}</code></td>
                <td className={styles.tabular}>{row.recipient_count}</td>
                <td>
                  <code className={
                    row.status === 'sent' ? styles.smallCode
                    : row.status === 'failed' ? styles.findBlock
                    : styles.findWarn
                  }>{row.status}</code>
                </td>
                <td className={styles.smallCode}>{row.error || row.meta_json || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {notify.host}
    </div>
  );
}

export default function DigestsPage(): ReactNode {
  return (
    <Layout title="Digests - Admin" description="Analytics digest email subscriptions and send log.">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <DigestsAdmin />}
      </BrowserOnly>
    </Layout>
  );
}

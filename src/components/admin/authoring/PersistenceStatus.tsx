import React, {useEffect, useRef, useState} from 'react';
import styles from '@site/src/pages/admin/authoring/styles.module.css';

/**
 * Compact "is my work safe?" pill for the authoring screens. Polls
 * GET /api/admin/authoring/deploy/state and summarizes the durability
 * journal in author language:
 *
 *   Backed up ✓    - every change is committed to git
 *   Backing up…    - changes are on their way (polls faster until done)
 *   Backup failing - changes exist on the server only; a restart loses them
 *   Server only    - journal disabled; git durability arrives at deploy time
 *
 * Bump `refreshKey` after a successful save/upload/publish so the pill
 * re-fetches immediately instead of waiting for the next poll.
 *
 * Lives outside src/pages/ so Docusaurus does NOT auto-route it as a page.
 */

type JournalState = {
  enabled: boolean;
  branch: string;
  lastCommitTs: number;
  lastCommitSha: string | null;
  pendingCount: number;
  lastError: {ts: number; message: string} | null;
  bootRestored: number;
  conflicts: string[];
};

const IDLE_POLL_MS = 30_000;
const BUSY_POLL_MS = 3_000;

export default function PersistenceStatus({refreshKey = 0}: {refreshKey?: number}): React.ReactElement | null {
  const [journal, setJournal] = useState<JournalState | null>(null);
  const [fetched, setFetched] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    async function poll() {
      let next = IDLE_POLL_MS;
      try {
        const res = await fetch('/api/admin/authoring/deploy/state', {credentials: 'same-origin'});
        if (alive && res.ok) {
          const data = await res.json();
          setJournal(data.journal ?? null);
          setFetched(true);
          if (data.journal?.pendingCount > 0) next = BUSY_POLL_MS;
        }
      } catch {/* fail-soft: keep the last known state */}
      if (alive) timerRef.current = window.setTimeout(poll, next);
    }
    poll();
    return () => {
      alive = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [refreshKey]);

  if (!fetched) return null;

  if (!journal || !journal.enabled) {
    return (
      <span
        className={styles.stateBadge}
        data-state="off"
        title="Git backup is not enabled on this server. Saves live on the server disk; published changes reach git when a deploy runs.">
        Server only
      </span>
    );
  }
  if (journal.lastError) {
    return (
      <span
        className={styles.stateBadge}
        data-state="error"
        title={`Recent changes are on the server only - a restart could lose them. Tell an admin. (${journal.lastError.message})`}>
        Backup failing
      </span>
    );
  }
  if (journal.pendingCount > 0) {
    return (
      <span
        className={styles.stateBadge}
        data-state="pending"
        title={`${journal.pendingCount} change(s) on their way to git (${journal.branch}).`}>
        Backing up…
      </span>
    );
  }
  if (journal.lastCommitTs > 0) {
    const mins = Math.round((Date.now() - journal.lastCommitTs) / 60000);
    return (
      <span
        className={styles.stateBadge}
        data-state="ok"
        title={`All changes are committed to git (${journal.branch}), ${mins < 1 ? 'moments' : `~${mins} min`} ago.`}>
        Backed up ✓
      </span>
    );
  }
  // Journal on, nothing recorded yet this server lifetime - quietly OK.
  return (
    <span
      className={styles.stateBadge}
      data-state="ok"
      title={`Git backup is active (${journal.branch}). Changes are committed within seconds of saving.`}>
      Backup on
    </span>
  );
}

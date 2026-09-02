import React, {useEffect, useState} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

/**
 * "Was this helpful?" footer.
 *
 * State machine:
 *   idle ─Yes─> voted-up        (terminal; vote recorded on click)
 *   idle ─No──> awaiting-comment (vote recorded on click, so navigating
 *               away no longer loses the down-vote)
 *   awaiting-comment ─Send─> commented (re-sends to attach the comment;
 *               the server upserts per viewer so no duplicate row)
 *   awaiting-comment ─Skip─> commented (no extra request)
 *
 * Vote tracking is per-page-load only - refreshing the page restores the
 * default prompt. The server dedupes per (slug, viewer) so re-votes update
 * the same row instead of inflating the counts.
 */

type State = 'idle' | 'awaiting-comment' | 'voted-up' | 'commented';

export default function FeedbackFooter(): JSX.Element | null {
  const {metadata} = useDoc();
  const slug = metadata?.permalink ?? '';
  const [state, setState] = useState<State>('idle');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  // Reset the widget whenever the article changes (e.g. SPA navigation).
  useEffect(() => {
    setState('idle');
    setComment('');
    setBusy(false);
  }, [slug]);

  if (!slug) return null;

  async function send(vote: 'up' | 'down', commentText?: string) {
    setBusy(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({slug, vote, comment: commentText || null}),
      });
    } catch {/* fail soft - the user still saw the thanks message */}
    setBusy(false);
  }

  if (state === 'voted-up') {
    return (
      <aside className={styles.feedback} aria-label="Article feedback">
        <p className={styles.feedbackThanks}>Thanks! Glad this was useful.</p>
      </aside>
    );
  }

  if (state === 'commented') {
    return (
      <aside className={styles.feedback} aria-label="Article feedback">
        <p className={styles.feedbackThanks}>Thanks - we read every one of these.</p>
      </aside>
    );
  }

  if (state === 'awaiting-comment') {
    return (
      <aside className={styles.feedback} aria-label="Article feedback">
        <p className={styles.feedbackPrompt}>What was missing?</p>
        <textarea
          className={styles.feedbackInput}
          rows={3}
          maxLength={2000}
          placeholder="Optional - what would have helped you?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={busy}
        />
        <div className={styles.feedbackRow}>
          <button
            className={styles.feedbackBtn}
            disabled={busy}
            onClick={async () => {
              // The down-vote was already recorded on the 👎 click; this
              // re-send attaches the comment (server upserts per viewer).
              await send('down', comment);
              setState('commented');
            }}>
            Send
          </button>
          <button
            className={styles.feedbackBtnGhost}
            disabled={busy}
            onClick={() => setState('commented')}>
            Skip
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.feedback} aria-label="Article feedback">
      <p className={styles.feedbackPrompt}>Was this helpful?</p>
      <div className={styles.feedbackRow}>
        <button
          className={styles.feedbackBtn}
          disabled={busy}
          onClick={async () => {
            await send('up');
            setState('voted-up');
          }}>
          👍 Yes
        </button>
        <button
          className={styles.feedbackBtnGhost}
          disabled={busy}
          onClick={async () => {
            // Record the down-vote immediately - readers who click 👎 and
            // navigate away used to never be counted, systematically
            // undercounting downvotes vs. upvotes (which fire on click).
            setState('awaiting-comment');
            await send('down');
          }}>
          👎 No
        </button>
      </div>
    </aside>
  );
}

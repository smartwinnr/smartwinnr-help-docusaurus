import React, {useEffect, useState} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

/**
 * "Was this helpful?" footer.
 *
 * State machine:
 *   idle ─Yes─> voted-up        (terminal)
 *   idle ─No──> awaiting-comment
 *   awaiting-comment ─Send/Skip─> commented (terminal)
 *
 * Vote tracking is per-page-load only - refreshing the page restores the
 * default prompt. Server-side stores the record; the client doesn't try to
 * dedupe across reloads (a determined user could clear localStorage anyway).
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
              await send('down', comment);
              setState('commented');
            }}>
            Send
          </button>
          <button
            className={styles.feedbackBtnGhost}
            disabled={busy}
            onClick={async () => {
              await send('down');
              setState('commented');
            }}>
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
          onClick={() => setState('awaiting-comment')}>
          👎 No
        </button>
      </div>
    </aside>
  );
}

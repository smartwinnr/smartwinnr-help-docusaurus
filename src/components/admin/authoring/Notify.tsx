import React, {useCallback, useRef, useState, type ReactNode} from 'react';
import styles from '@site/src/pages/admin/authoring/styles.module.css';

/**
 * Lightweight in-app toast + confirm modal - used by the authoring wizard
 * and drafts queue. No third-party dependency.
 *
 * Hook returns:
 *   notify.success(msg)   - green toast, auto-dismiss 4 s
 *   notify.error(msg)     - red toast, auto-dismiss 7 s
 *   notify.info(msg)      - neutral toast, auto-dismiss 5 s
 *   notify.confirm(opts)  - Promise<boolean>. Renders a modal that
 *                           returns true on Confirm, false on Cancel.
 *   notify.host           - JSX to drop once at the bottom of the page;
 *                           contains the toast stack + the confirm modal.
 *
 * Lives outside src/pages/ so Docusaurus does NOT auto-route it as a page.
 */

type ToastKind = 'success' | 'error' | 'info';
type Toast = {id: number; kind: ToastKind; message: string};

type ConfirmOpts = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmState = ConfirmOpts & {
  open: boolean;
  resolve: ((v: boolean) => void) | null;
};

let nextId = 1;

export type Notify = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
  host: ReactNode;
};

export function useNotify(): Notify {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    resolve: null,
  });
  const timersRef = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timersRef.current.get(id);
    if (handle) {
      window.clearTimeout(handle);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string, duration: number) => {
      const id = nextId++;
      setToasts((prev) => [...prev, {id, kind, message}]);
      if (duration > 0) {
        const handle = window.setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, handle);
      }
    },
    [dismiss],
  );

  const success = useCallback((m: string) => push('success', m, 4000), [push]);
  const error = useCallback((m: string) => push('error', m, 7000), [push]);
  const info = useCallback((m: string) => push('info', m, 5000), [push]);

  const confirm = useCallback((opts: ConfirmOpts): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({...opts, open: true, resolve});
    });
  }, []);

  function settle(value: boolean) {
    confirmState.resolve?.(value);
    setConfirmState({open: false, title: '', resolve: null});
  }

  const host = (
    <>
      <div className={styles.toastStack} aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={
              t.kind === 'success'
                ? styles.toastSuccess
                : t.kind === 'error'
                ? styles.toastError
                : styles.toastInfo
            }>
            <span>{t.message}</span>
            <button
              type="button"
              aria-label="Dismiss"
              className={styles.toastClose}
              onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>

      {confirmState.open && (
        <div
          className={styles.confirmBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sw-confirm-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) settle(false);
          }}>
          <div className={styles.confirmModal}>
            <h3 id="sw-confirm-title">{confirmState.title}</h3>
            {confirmState.message && <p>{confirmState.message}</p>}
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => settle(false)}>
                {confirmState.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                className={
                  confirmState.danger ? styles.btnDanger : styles.btnPrimary
                }
                onClick={() => settle(true)}
                autoFocus>
                {confirmState.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return {success, error, info, confirm, host};
}

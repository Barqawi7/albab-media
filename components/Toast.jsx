import { useCallback, useEffect, useRef, useState } from 'react';
import { theme } from '../lib/theme';

export function useUndoToast(timeout = 5000) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
  }, []);

  const show = useCallback((message, undoFn) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, undo: undoFn, ts: Date.now() });
    timerRef.current = setTimeout(() => setToast(null), timeout);
  }, [timeout]);

  const runUndo = useCallback(async () => {
    const t = toast;
    if (!t?.undo) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
    await t.undo();
  }, [toast]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { toast, show, dismiss, runUndo };
}

export function Toast({ toast, onUndo, onDismiss }) {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 100,
      background: theme.bg3, border: `1px solid ${theme.gold}`,
      borderRadius: 8, padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
      fontSize: 13, color: theme.text, minWidth: 240, maxWidth: 420,
      fontFamily: theme.font,
    }}>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button onClick={onUndo} style={{
        background: theme.gold, color: '#0A0E14', border: 'none',
        borderRadius: 4, padding: '4px 10px', fontWeight: 700,
        fontSize: 12, cursor: 'pointer',
      }}>Undo</button>
      <button onClick={onDismiss} aria-label="Dismiss" style={{
        background: 'transparent', color: theme.textMuted, border: 'none',
        cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px',
      }}>×</button>
    </div>
  );
}

export function LoadingSpinner({ size = 16, color }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size, height: size,
        border: `2px solid ${color || theme.textMuted}55`,
        borderTopColor: color || theme.gold,
        borderRadius: '50%',
        animation: 'bab-spin 0.8s linear infinite',
      }}
    />
  );
}

import React, { useEffect } from 'react';
import { usePVStore } from '../store';

export function ToastSystem() {
  const { toasts, removeToast } = usePVStore();
  useEffect(() => {
    if (toasts.length === 0) return;
    const last = toasts[toasts.length - 1];
    const timer = setTimeout(() => removeToast(last.id), 3000);
    return () => clearTimeout(timer);
  }, [toasts, removeToast]);
  if (toasts.length === 0) return null;
  return (
    <div className="pv-toasts">
      {toasts.map(t => (
        <div key={t.id} className={`pv-toast ${t.type}`} onClick={() => removeToast(t.id)}>
          {t.type === 'success' && '✓'}
          {t.type === 'error'   && '✗'}
          {t.type === 'warning' && '⚠'}
          {t.type === 'info'    && 'ℹ'}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

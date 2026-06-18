import { useState } from 'react';

// in-app replacement for window.confirm so these read like the rest of the app
// instead of a browser chrome popup. `variant` swaps the accent + icon between a
// neutral primary action and a destructive one.
const VARIANTS = {
  primary: { btn: 'bg-primary text-on-primary', iconWrap: 'bg-primary/10 text-primary' },
  danger: { btn: 'bg-error text-on-error', iconWrap: 'bg-error/10 text-error' },
};

const ConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  icon = 'help',
  onConfirm,
  onClose,
}) => {
  const [busy, setBusy] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  // click the backdrop to dismiss, but not a click inside the card
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-md" onClick={onClose}>
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-lg flex gap-md">
          <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${v.iconWrap}`}>
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-title-lg text-title-lg text-on-surface">{title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">{message}</p>
          </div>
        </div>

        <div className="px-lg py-md border-t border-outline-variant flex justify-end gap-sm">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-md py-xs rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className={`px-md py-xs rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 ${v.btn}`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

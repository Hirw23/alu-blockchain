const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${SIZES[size] || SIZES.md} bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between p-lg border-b border-outline-variant">
          <h3 className="font-headline text-headline-md text-on-surface">{title}</h3>
          <button
            onClick={onClose}
            className="p-sm rounded-full hover:bg-surface-container-high transition-colors"
            aria-label="Close"
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-lg overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="p-lg border-t border-outline-variant flex justify-end gap-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

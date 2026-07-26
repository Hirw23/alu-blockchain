export const inputClassName =
  'w-full px-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

export default function FormField({ label, htmlFor, required, hint, error, className = '', children }) {
  return (
    <div className={`space-y-xs ${className}`}>
      {label && (
        <label className="font-label-sm text-label-sm text-on-surface-variant block" htmlFor={htmlFor}>
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">{hint}</p>
      )}
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}

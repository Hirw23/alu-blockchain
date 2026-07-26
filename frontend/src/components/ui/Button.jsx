import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-primary text-on-primary hover:opacity-90 shadow-sm',
  secondary:
    'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant',
  danger: 'bg-error text-on-error hover:opacity-90 shadow-sm',
  ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-high',
  outline: 'bg-transparent text-primary border border-primary hover:bg-primary-fixed/20',
};

export default function Button({
  variant = 'primary',
  loading = false,
  icon,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-sm px-lg py-md rounded-lg font-label-md text-label-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={16} />
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

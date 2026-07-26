export default function Card({ className = '', children, as: As = 'div', ...props }) {
  return (
    <As
      className={`bg-surface-container-lowest border border-outline-variant rounded-xl ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div
      className={`p-lg border-b border-outline-variant flex items-start justify-between gap-md ${className}`}
    >
      <div>
        <h3 className="font-headline text-headline-md text-on-surface">{title}</h3>
        {description && (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

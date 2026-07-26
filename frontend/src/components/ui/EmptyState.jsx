export default function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-lg">
      <span className="material-symbols-outlined text-outline text-[48px] mb-md">{icon}</span>
      <h3 className="font-headline text-headline-md text-on-surface mb-xs">{title}</h3>
      {description && (
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mb-md">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminNavItems, getPrimaryNavItems } from './navConfig';

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${
          isActive
            ? 'bg-primary-container text-on-primary-container font-bold scale-[0.98]'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        }`
      }
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const auth = useAuth();
  const primaryItems = getPrimaryNavItems(auth);
  const adminItems = getAdminNavItems(auth);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 z-40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col p-md z-50 bg-surface-container-low border-r border-outline-variant transition-transform md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:flex`}
      >
        <div className="mb-lg px-2 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-headline-md font-black text-primary">SupplyChain+</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {auth.role || 'Portal'}
            </p>
          </div>
          <button
            className="md:hidden p-2 rounded-full hover:bg-surface-container-high"
            onClick={onCloseMobile}
            aria-label="Close menu"
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {primaryItems.map((item) => (
            <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
          ))}

          {adminItems.length > 0 && (
            <>
              <p className="px-4 pt-lg pb-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                Platform Administration
              </p>
              {adminItems.map((item) => (
                <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
              ))}
            </>
          )}
        </nav>

        <div className="mt-auto space-y-1 pt-md border-t border-outline-variant">
          <NavItem to="/notifications" icon="notifications" label="Notifications" />
          <NavItem to="/help" icon="contact_support" label="Support" />
        </div>
      </aside>
    </>
  );
}

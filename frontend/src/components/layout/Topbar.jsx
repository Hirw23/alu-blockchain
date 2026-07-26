import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import usersService from '../../services/users';
import { getQuickAction } from './navConfig';
import api from '../../api';

export default function Topbar({ onOpenMobileMenu }) {
  const auth = useAuth();
  const { user, logout } = auth;
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    usersService
      .getMyNotifications()
      .then((res) => {
        if (cancelled) return;
        const items = res.data?.data?.notifications || [];
        const count = items.filter((n) => n.status !== 'READ').length;
        setUnreadCount(count);
      })
      .catch(() => {
        // Notifications badge is a nice-to-have; a failed fetch shouldn't break the whole shell.
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const quickAction = getQuickAction(location.pathname, auth);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  }

  async function handleLogout() {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Best-effort server-side revoke; proceed with local logout regardless.
    }
    logout();
    navigate('/login');
  }

  return (
    <header className="flex justify-between items-center h-16 w-full px-md md:px-lg sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-4 flex-1">
        <button
          className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          type="button"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            className="w-full pl-10 pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="Search products..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1">
          <Link
            to="/notifications"
            className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error" />
            )}
          </Link>
          <Link
            to="/help"
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
            aria-label="Help"
          >
            <span className="material-symbols-outlined">help</span>
          </Link>
        </div>

        <div className="h-8 w-[1px] bg-outline-variant mx-1 hidden sm:block" />

        {quickAction && (
          <Link
            to={quickAction.to}
            className="hidden lg:flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all active:opacity-80"
          >
            <span className="material-symbols-outlined text-[18px]">{quickAction.icon}</span>
            {quickAction.label}
          </Link>
        )}

        <div className="relative">
          <button
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 flex items-center justify-center bg-primary-fixed text-primary font-label-md font-bold"
            onClick={() => setMenuOpen((o) => !o)}
            type="button"
            aria-label="Account menu"
          >
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-20 py-sm">
                <div className="px-md py-sm border-b border-outline-variant mb-xs">
                  <p className="font-label-md text-label-md text-on-surface truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-md py-sm text-error hover:bg-error-container/30 font-label-md text-label-md transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

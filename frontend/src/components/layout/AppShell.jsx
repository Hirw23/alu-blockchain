import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-background text-on-background min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <main className="md:ml-64 min-h-screen flex flex-col">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <div className="flex-1 p-md md:p-lg space-y-lg max-w-[1400px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

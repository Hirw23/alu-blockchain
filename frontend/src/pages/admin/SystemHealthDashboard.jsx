import { useEffect, useState } from 'react';
import adminService from '../../services/admin';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function SystemHealthDashboard() {
  const [health, setHealth] = useState(null);
  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([adminService.getSystemHealthDetails(), adminService.getMaintenanceWindows()])
      .then(([healthRes, winRes]) => {
        setHealth(healthRes.data?.data);
        const now = new Date();
        const upcoming = (winRes.data?.data?.windows || []).filter((w) => new Date(w.endsAt) >= now);
        setWindows(upcoming);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size={32} className="text-primary" /></div>;
  }

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">System Health</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Live backend process and database health, and upcoming maintenance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        <Card className="p-lg">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Overall Status</p>
          <StatusBadge status={health?.status === 'HEALTHY' ? 'ACTIVE' : 'FAILED'} label={health?.status} />
        </Card>
        <Card className="p-lg">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Database</p>
          <StatusBadge status={health?.details?.database === 'UP' ? 'ACTIVE' : 'FAILED'} label={health?.details?.database} />
        </Card>
        <Card className="p-lg">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Uptime</p>
          <h3 className="font-headline text-headline-lg text-primary">{formatUptime(health?.uptime || 0)}</h3>
        </Card>
        <Card className="p-lg">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Version</p>
          <h3 className="font-headline text-headline-lg text-primary">{health?.version}</h3>
        </Card>
      </div>

      <Card className="p-lg">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide mb-md">
          Process Memory Usage
        </h3>
        <div className="grid grid-cols-3 gap-lg">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">RSS</p>
            <p className="font-body-md text-body-md text-on-surface">{health?.details?.memoryUsage?.rss}</p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Heap Total</p>
            <p className="font-body-md text-body-md text-on-surface">{health?.details?.memoryUsage?.heapTotal}</p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Heap Used</p>
            <p className="font-body-md text-body-md text-on-surface">{health?.details?.memoryUsage?.heapUsed}</p>
          </div>
        </div>
      </Card>

      <Card className="p-lg">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide mb-md">
          Upcoming Maintenance
        </h3>
        {windows.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No upcoming maintenance windows scheduled.</p>
        ) : (
          <div className="space-y-sm">
            {windows.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-md border border-outline-variant rounded-lg">
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{w.title}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {new Date(w.startsAt).toLocaleString()} → {new Date(w.endsAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={w.enabled ? 'ACTIVE' : 'INACTIVE'} label={w.enabled ? 'Scheduled' : 'Disabled'} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

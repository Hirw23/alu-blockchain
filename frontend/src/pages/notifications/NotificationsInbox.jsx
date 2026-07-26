import { useEffect, useState } from 'react';
import usersService from '../../services/users';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const TYPE_ICONS = {
  BUSINESS_APPROVED: 'domain_verification',
  BUSINESS_SUSPENDED: 'block',
  PRODUCT_APPROVED: 'inventory_2',
  QR_GENERATED: 'qr_code_2',
  VERIFICATION_FAILED: 'error',
};

export default function NotificationsInbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    usersService
      .getMyNotifications()
      .then((res) => setNotifications(res.data?.data?.notifications || []))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleMarkRead(id) {
    await usersService.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n)));
  }

  return (
    <div className="space-y-lg max-w-2xl mx-auto">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">Notifications</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Updates about your businesses, products, and QR activity.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} className="text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState icon="notifications" title="You're all caught up" description="New notifications will appear here." />
        </Card>
      ) : (
        <div className="space-y-sm">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-lg flex items-start gap-md ${n.status !== 'READ' ? 'border-primary/40' : ''}`}
            >
              <span className="material-symbols-outlined text-primary shrink-0">
                {TYPE_ICONS[n.notificationType] || 'notifications'}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-label-md text-label-md text-on-surface">{n.title}</p>
                  {n.status !== 'READ' && <StatusBadge status="PENDING" label="New" />}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{n.message}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {n.status !== 'READ' && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-primary hover:underline font-label-sm text-label-sm shrink-0"
                >
                  Mark read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

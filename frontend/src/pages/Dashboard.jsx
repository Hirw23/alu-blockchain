import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analytics';
import businessesService from '../services/businesses';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';

function StatCard({ label, value, icon }) {
  return (
    <Card className="p-lg flex items-center justify-between">
      <div>
        <p className="font-label-md text-label-md text-on-surface-variant mb-1">{label}</p>
        <h3 className="font-headline text-headline-lg text-primary">{value ?? '—'}</h3>
      </div>
      <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
    </Card>
  );
}

function QuickLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-md rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors"
    >
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <span className="font-label-md text-label-md text-on-surface">{label}</span>
      <span className="material-symbols-outlined text-outline ml-auto">chevron_right</span>
    </Link>
  );
}

function EntrepreneurContent({ kpis }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        <StatCard label="Businesses" value={kpis.totalBusinesses} icon="business_center" />
        <StatCard label="Total Products" value={kpis.totalProducts} icon="inventory_2" />
        <StatCard label="Active Products" value={kpis.activeProducts} icon="check_circle" />
        <StatCard label="Supply Chain Events" value={kpis.supplyChainEvents} icon="account_tree" />
        <StatCard label="QR Codes Generated" value={kpis.qrCodesGenerated} icon="qr_code_2" />
        <StatCard label="QR Scans" value={kpis.qrScans} icon="qr_code_scanner" />
        <StatCard
          label="Verification Rate"
          value={`${Number(kpis.verificationRate || 0).toFixed(1)}%`}
          icon="verified"
        />
      </div>
      <Card className="p-lg mt-lg">
        <h3 className="font-headline text-headline-md text-on-surface mb-md">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <QuickLink to="/business" icon="business_center" label="Manage My Business" />
          <QuickLink to="/products/new" icon="add_box" label="Register a Product" />
          <QuickLink to="/supply-chain/events/new" icon="account_tree" label="Log a Supply Chain Event" />
          <QuickLink to="/products" icon="inventory_2" label="View Product Catalog" />
        </div>
      </Card>
    </>
  );
}

function CooperativeContent({ kpis }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        <StatCard label="Member Businesses" value={kpis.totalMemberBusinesses} icon="groups" />
        <StatCard label="Active Businesses" value={kpis.activeBusinesses} icon="check_circle" />
        <StatCard label="Products Registered" value={kpis.productsRegistered} icon="inventory_2" />
        <StatCard label="QR Verifications" value={kpis.qrVerifications} icon="qr_code_scanner" />
      </div>
      <Card className="p-lg mt-lg">
        <h3 className="font-headline text-headline-md text-on-surface mb-md">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <QuickLink to="/cooperatives" icon="groups" label="Manage Cooperatives" />
          <QuickLink to="/businesses" icon="business_center" label="View Member Businesses" />
        </div>
      </Card>
    </>
  );
}

function AdminContent({ kpis }) {
  const bc = kpis.blockchainMetrics || {};
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        <StatCard label="Total Users" value={kpis.totalUsers} icon="group" />
        <StatCard label="Total Businesses" value={kpis.totalBusinesses} icon="business_center" />
        <StatCard label="Total Products" value={kpis.totalProducts} icon="inventory_2" />
        <StatCard label="Supply Chain Events" value={kpis.totalSupplyChainEvents} icon="account_tree" />
        <StatCard label="QR Identities" value={kpis.totalQRIdentities} icon="qr_code_2" />
        <StatCard label="Total Verifications" value={kpis.totalVerifications} icon="verified" />
        <StatCard label="Failed Verifications" value={kpis.failedVerifications} icon="error" />
        <StatCard label="Blockchain Anchored" value={bc.successfulRecords} icon="hub" />
      </div>
      <Card className="p-lg mt-lg">
        <h3 className="font-headline text-headline-md text-on-surface mb-md">Platform Administration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <QuickLink to="/businesses" icon="domain_verification" label="Review Business Oversight" />
          <QuickLink to="/admin/users" icon="manage_accounts" label="Manage Users" />
          <QuickLink to="/admin/audit-logs" icon="fact_check" label="View Audit Logs" />
          <QuickLink to="/admin/blockchain" icon="hub" label="Blockchain Anchor Status" />
        </div>
      </Card>
    </>
  );
}

// Buyer / FinancialInstitution have no dashboard variant on the backend (getDashboard falls
// back to the Entrepreneur shape, which is meaningless for a role that owns no business) — so
// they get a minimal read-only landing pointing at the list/analytics views they can access.
function ReadOnlyContent() {
  return (
    <Card className="p-lg">
      <h3 className="font-headline text-headline-md text-on-surface mb-md">Available to your role</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        <QuickLink to="/businesses" icon="business_center" label="Browse Registered Businesses" />
        <QuickLink to="/products" icon="inventory_2" label="Browse Products" />
        <QuickLink to="/analytics" icon="analytics" label="View Analytics" />
        <QuickLink to="/reports" icon="summarize" label="View Reports" />
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user, role } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const isReadOnly = role === 'Buyer' || role === 'FinancialInstitution';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        if (!isReadOnly) {
          const res = await analyticsService.getDashboard();
          if (!cancelled) setKpis(res.data?.data || {});
        }
        if (role === 'Entrepreneur') {
          const bizRes = await businessesService.getMe();
          const items = bizRes.data?.data?.items || bizRes.data?.data || [];
          if (!cancelled && Array.isArray(items) && items.length > 0) setBusiness(items[0]);
        }
      } catch {
        if (!cancelled) setKpis({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [role, isReadOnly]);

  return (
    <div className="space-y-lg">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-headline-lg text-on-surface">
            Welcome back, {user?.firstName || 'there'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Here is what's happening across your supply chain today.
          </p>
        </div>
        {business && (
          <div className="flex items-center gap-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {business.businessName}
            </span>
            <StatusBadge status={business.verificationStatus} />
          </div>
        )}
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} className="text-primary" />
        </div>
      ) : isReadOnly ? (
        <ReadOnlyContent />
      ) : role === 'CooperativeAdmin' ? (
        <CooperativeContent kpis={kpis || {}} />
      ) : role === 'PlatformAdmin' ? (
        <AdminContent kpis={kpis || {}} />
      ) : (
        <EntrepreneurContent kpis={kpis || {}} />
      )}

      {role === 'Entrepreneur' && business && business.status === 'DRAFT' && (
        <Card className="p-lg border-tertiary/40">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Your business profile is still in draft.{' '}
            <Link to="/business" className="text-primary font-medium hover:underline">
              Complete your business setup
            </Link>{' '}
            to unlock product registration.
          </p>
        </Card>
      )}
    </div>
  );
}

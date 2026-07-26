import { useEffect, useState } from 'react';
import analyticsService from '../../services/analytics';
import businessesService from '../../services/businesses';
import productsService from '../../services/products';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import DataTable from '../../components/ui/DataTable';
import { useAuth } from '../../context/AuthContext';

function StatCard({ label, value }) {
  return (
    <Card className="p-lg">
      <p className="font-label-md text-label-md text-on-surface-variant mb-1">{label}</p>
      <h3 className="font-headline text-headline-lg text-primary">{value ?? '—'}</h3>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const { hasPermission, role } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [geography, setGeography] = useState([]);
  const [business, setBusiness] = useState(null);
  const [trends, setTrends] = useState([]);
  const [products, setProducts] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const tasks = [analyticsService.getDashboard()];
        if (hasPermission('analytics:view')) tasks.push(analyticsService.getVerificationGeography());
        const [dashRes, geoRes] = await Promise.all(tasks);
        if (cancelled) return;
        setKpis(dashRes.data?.data || {});
        if (geoRes) setGeography(geoRes.data?.data?.geography || []);

        if (role === 'Entrepreneur') {
          const [bizRes, prodRes] = await Promise.all([businessesService.getMe(), productsService.getMe()]);
          const items = bizRes.data?.data?.items || [];
          if (!cancelled && items.length > 0) {
            setBusiness(items[0]);
            const trendsRes = await analyticsService.getBusinessTrends(items[0].id);
            if (!cancelled) setTrends(trendsRes.data?.data?.trends || []);
          }
          if (!cancelled) setProducts(prodRes.data?.data?.items || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [role, hasPermission]);

  function toggleCompare(id) {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id].slice(-4)));
  }

  async function handleCompare() {
    setComparing(true);
    try {
      const res = await analyticsService.compareProducts(compareIds);
      setComparison(res.data?.data?.comparison || []);
    } finally {
      setComparing(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size={32} className="text-primary" /></div>;
  }

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">Analytics</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Performance and verification metrics{business ? ` for ${business.businessName}` : ''}.
        </p>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          {Object.entries(kpis)
            .filter(([, v]) => typeof v === 'number' || typeof v === 'string')
            .map(([key, value]) => (
              <StatCard
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                value={typeof value === 'number' && /rate$/i.test(key) ? `${value.toFixed(1)}%` : value}
              />
            ))}
        </div>
      )}

      {hasPermission('analytics:view') && (
        <Card>
          <CardHeader title="Verification Geography" description="Scan volume grouped by location." />
          <DataTable
            data={geography}
            emptyTitle="No verification scans recorded yet"
            columns={[
              { key: 'country', header: 'Country' },
              { key: 'province', header: 'Province' },
              { key: 'district', header: 'District' },
              { key: 'scanCount', header: 'Scans' },
            ]}
          />
        </Card>
      )}

      {business && hasPermission('analytics:kpis') && (
        <Card>
          <CardHeader
            title="Scan Trends"
            description="Verification scan counts over time for this business."
          />
          <DataTable
            data={trends}
            emptyTitle="No trend data available"
            columns={[
              { key: 'date', header: 'Date' },
              { key: 'scanCount', header: 'Scans' },
              { key: 'status', header: 'Status' },
            ]}
          />
        </Card>
      )}

      {role === 'Entrepreneur' && hasPermission('analytics:comparisons') && products.length > 0 && (
        <Card>
          <CardHeader title="Product Comparison" description="Select up to 4 products to compare verification activity." />
          <div className="p-lg space-y-lg">
            <div className="flex flex-wrap gap-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleCompare(p.id)}
                  className={`px-3 py-1 rounded-full font-label-sm text-label-sm border transition-colors ${
                    compareIds.includes(p.id)
                      ? 'bg-primary text-on-primary border-primary'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {p.productName}
                </button>
              ))}
            </div>
            <Button icon="compare_arrows" disabled={compareIds.length < 2} loading={comparing} onClick={handleCompare}>
              Compare Selected
            </Button>
            {comparison && (
              <DataTable
                data={comparison}
                columns={[
                  { key: 'productName', header: 'Product' },
                  { key: 'verificationCount', header: 'Scans' },
                  { key: 'currentStage', header: 'Current Stage' },
                ]}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

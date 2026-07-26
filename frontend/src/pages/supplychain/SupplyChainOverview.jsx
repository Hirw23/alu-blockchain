import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import businessesService from '../../services/businesses';
import productsService from '../../services/products';
import supplyChainService from '../../services/supplychain';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import { useAuth } from '../../context/AuthContext';

export default function SupplyChainOverview() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [bizRes, prodRes] = await Promise.all([businessesService.getMe(), productsService.getMe()]);
        const businesses = bizRes.data?.data?.items || [];
        if (!cancelled) setProducts(prodRes.data?.data?.items || []);

        if (businesses.length > 0) {
          const evRes = await supplyChainService.getAll({ businessId: businesses[0].id, page, limit: 15 });
          if (!cancelled) {
            setEvents(evRes.data?.data?.items || []);
            setTotal(evRes.meta?.totalItems || 0);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const productNameById = useMemo(() => {
    const map = {};
    products.forEach((p) => (map[p.id] = p.productName));
    return map;
  }, [products]);

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline text-headline-lg text-on-surface">Supply Chain Events</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Recent trace events logged across your products.
          </p>
        </div>
        {hasPermission('supply-chain:create') && (
          <Link to="/supply-chain/events/new">
            <Button icon="add_task">Log Event</Button>
          </Link>
        )}
      </div>

      <Card>
        <DataTable
          loading={loading}
          data={events}
          page={page}
          pageSize={15}
          total={total}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/products/${row.productId}/timeline`)}
          emptyTitle="No supply chain events yet"
          emptyDescription="Log your first event to start building a product's trace record."
          columns={[
            {
              key: 'product',
              header: 'Product',
              render: (row) => productNameById[row.productId] || row.productId,
            },
            {
              key: 'eventType',
              header: 'Event',
              render: (row) => row.eventType?.name,
            },
            { key: 'title', header: 'Title' },
            { key: 'eventStatus', header: 'Status', render: (row) => <StatusBadge status={row.eventStatus} /> },
            {
              key: 'blockchainStatus',
              header: 'Ledger',
              render: (row) => <StatusBadge status={row.blockchainStatus} />,
            },
            {
              key: 'occurredAt',
              header: 'Occurred',
              render: (row) => new Date(row.occurredAt).toLocaleString(),
            },
          ]}
        />
      </Card>
    </div>
  );
}

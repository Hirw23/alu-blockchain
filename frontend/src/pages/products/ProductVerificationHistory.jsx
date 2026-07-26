import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productsService from '../../services/products';
import qrService from '../../services/qr';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import Spinner from '../../components/ui/Spinner';

function StatCard({ label, value }) {
  return (
    <Card className="p-lg">
      <p className="font-label-md text-label-md text-on-surface-variant mb-1">{label}</p>
      <h3 className="font-headline text-headline-lg text-primary">{value ?? '—'}</h3>
    </Card>
  );
}

export default function ProductVerificationHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsService.getById(id).then((res) => setProduct(res.data?.data?.product));
    qrService
      .getStatistics(id)
      .then((res) => setStats(res.data?.data?.statistics))
      .catch(() => setStats(null));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    qrService
      .getVerifications(id, { page, limit: 15 })
      .then((res) => {
        setEvents(res.data?.data?.items || []);
        setTotal(res.meta?.totalItems || 0);
      })
      .catch(() => {
        setEvents([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [id, page]);

  return (
    <div className="space-y-lg">
      <div>
        <button
          onClick={() => navigate(`/products/${id}`)}
          className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm mb-xs"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Product
        </button>
        <h2 className="font-headline text-headline-lg text-on-surface">
          Verification History — {product?.productName}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Every QR scan recorded against this product's digital identity.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
          <StatCard label="Total Scans" value={stats.totalScans} />
          <StatCard label="Successful" value={stats.successScans} />
          <StatCard label="Failed" value={stats.failedScans} />
        </div>
      )}

      <Card>
        <DataTable
          loading={loading}
          data={events}
          page={page}
          pageSize={15}
          total={total}
          onPageChange={setPage}
          emptyTitle="No scans recorded yet"
          emptyDescription="Once a customer scans this product's QR code, the scan will appear here."
          columns={[
            {
              key: 'verifiedAt',
              header: 'Timestamp',
              render: (row) => new Date(row.verifiedAt).toLocaleString(),
            },
            {
              key: 'location',
              header: 'Location',
              render: (row) => [row.district, row.province, row.country].filter(Boolean).join(', ') || '—',
            },
            { key: 'deviceType', header: 'Device', render: (row) => row.deviceType || '—' },
            {
              key: 'verificationStatus',
              header: 'Result',
              render: (row) => <StatusBadge status={row.verificationStatus} />,
            },
          ]}
        />
      </Card>
    </div>
  );
}

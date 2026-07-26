import { useEffect, useState } from 'react';
import adminService from '../../services/admin';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { inputClassName } from '../../components/ui/FormField';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  function load() {
    setLoading(true);
    adminService
      .getAuditLogs({
        action: action || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 20,
      })
      .then((res) => {
        setLogs(res.data?.data?.logs || []);
        setTotal(res.data?.data?.total || 0);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, [page]);

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">Audit Logs</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Immutable record of security-relevant actions across the platform.
        </p>
      </div>

      <Card className="p-md">
        <div className="flex flex-col sm:flex-row gap-md">
          <input
            className={`${inputClassName} flex-1`}
            placeholder="Action (exact match, e.g. UPDATE_SETTING)"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
          <input type="date" className={inputClassName} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className={inputClassName} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button
            onClick={() => { setPage(1); load(); }}
            className="px-lg py-md bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90"
          >
            Filter
          </button>
        </div>
      </Card>

      <Card>
        <DataTable
          loading={loading}
          data={logs}
          page={page}
          pageSize={20}
          total={total}
          onPageChange={setPage}
          emptyTitle="No audit logs match these filters"
          columns={[
            { key: 'action', header: 'Action' },
            { key: 'entityType', header: 'Entity' },
            { key: 'userRole', header: 'Role' },
            { key: 'outcome', header: 'Outcome', render: (row) => <StatusBadge status={row.outcome} /> },
            { key: 'createdAt', header: 'Timestamp', render: (row) => new Date(row.createdAt).toLocaleString() },
          ]}
        />
      </Card>
    </div>
  );
}

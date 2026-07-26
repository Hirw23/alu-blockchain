import { useEffect, useState } from 'react';
import businessesService, { BUSINESS_STATUSES } from '../../services/businesses';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { inputClassName } from '../../components/ui/FormField';
import { useAuth } from '../../context/AuthContext';

function BusinessDetailModal({ business, onClose, onChanged }) {
  const { hasPermission } = useAuth();
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    businessesService.getDocuments(business.id).then((res) => setDocuments(res.data?.data?.documents || []));
  }, [business.id]);

  async function handleVerify(verificationStatus) {
    await businessesService.verify(business.id, verificationStatus);
    onChanged();
    onClose();
  }

  async function handleStatusChange(status) {
    await businessesService.updateStatus(business.id, status);
    onChanged();
  }

  async function handleVerifyDocument(documentId, verificationStatus) {
    await businessesService.verifyDocument(business.id, documentId, verificationStatus);
    const res = await businessesService.getDocuments(business.id);
    setDocuments(res.data?.data?.documents || []);
  }

  return (
    <Modal open onClose={onClose} title={business.businessName} size="lg">
      <div className="space-y-lg">
        <dl className="grid grid-cols-2 gap-md">
          <div>
            <dt className="font-label-sm text-label-sm text-on-surface-variant">Registration No.</dt>
            <dd className="font-body-md text-body-md text-on-surface">{business.registrationNumber}</dd>
          </div>
          <div>
            <dt className="font-label-sm text-label-sm text-on-surface-variant">Tax ID</dt>
            <dd className="font-body-md text-body-md text-on-surface">{business.taxIdentificationNumber}</dd>
          </div>
          <div>
            <dt className="font-label-sm text-label-sm text-on-surface-variant">Email</dt>
            <dd className="font-body-md text-body-md text-on-surface">{business.email}</dd>
          </div>
          <div>
            <dt className="font-label-sm text-label-sm text-on-surface-variant">Phone</dt>
            <dd className="font-body-md text-body-md text-on-surface">{business.phoneNumber}</dd>
          </div>
        </dl>

        {hasPermission('business:verify') && business.verificationStatus === 'PENDING' && (
          <div className="flex gap-md p-md bg-tertiary-fixed/40 rounded-lg">
            <Button icon="check_circle" onClick={() => handleVerify('VERIFIED')}>Approve Business</Button>
            <Button variant="danger" icon="cancel" onClick={() => handleVerify('REJECTED')}>Reject</Button>
          </div>
        )}

        {hasPermission('business:update') && (
          <div className="flex items-center gap-md">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Lifecycle Status</span>
            <select className={inputClassName} value={business.status} onChange={(e) => handleStatusChange(e.target.value)}>
              {BUSINESS_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide mb-sm">Documents</h4>
          {documents.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">No documents uploaded.</p>
          ) : (
            <div className="space-y-sm">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-sm border border-outline-variant rounded-lg">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{doc.documentType}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{doc.fileName}</p>
                  </div>
                  <div className="flex items-center gap-md">
                    <StatusBadge status={doc.verificationStatus} />
                    {hasPermission('business:verify') && doc.verificationStatus === 'PENDING' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')} className="text-secondary hover:underline font-label-sm text-label-sm">
                          Approve
                        </button>
                        <button onClick={() => handleVerifyDocument(doc.id, 'REJECTED')} className="text-error hover:underline font-label-sm text-label-sm">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function BusinessOversight() {
  const { hasPermission } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewing, setViewing] = useState(null);

  function load() {
    setLoading(true);
    businessesService
      .getAll({
        q: search || undefined,
        verificationStatus: verificationStatus !== 'ALL' ? verificationStatus : undefined,
        page,
        limit: 15,
      })
      .then((res) => {
        setBusinesses(res.data?.data?.items || []);
        setTotal(res.meta?.totalItems || 0);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, [page, verificationStatus]);

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">Business Oversight</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Review, verify, and manage every registered business on the platform.
        </p>
      </div>

      <Card className="p-md">
        <div className="flex flex-col sm:flex-row gap-md">
          <input
            className={`${inputClassName} flex-1`}
            placeholder="Search by name or registration number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())}
          />
          <select
            className={`${inputClassName} sm:w-56`}
            value={verificationStatus}
            onChange={(e) => {
              setVerificationStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <Button variant="secondary" icon="search" onClick={() => { setPage(1); load(); }}>
            Search
          </Button>
        </div>
      </Card>

      <Card>
        <DataTable
          loading={loading}
          data={businesses}
          page={page}
          pageSize={15}
          total={total}
          onPageChange={setPage}
          onRowClick={setViewing}
          emptyTitle="No businesses found"
          columns={[
            { key: 'businessName', header: 'Business' },
            { key: 'industry', header: 'Industry' },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'verificationStatus', header: 'Verification', render: (row) => <StatusBadge status={row.verificationStatus} /> },
            { key: 'createdAt', header: 'Registered', render: (row) => new Date(row.createdAt).toLocaleDateString() },
          ]}
        />
      </Card>

      {viewing && (
        <BusinessDetailModal
          business={viewing}
          onClose={() => setViewing(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

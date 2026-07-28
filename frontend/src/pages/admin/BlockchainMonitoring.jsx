import { useEffect, useState } from 'react';
import blockchainService from '../../services/blockchain';
import supplyChainService from '../../services/supplychain';
import Card, { CardHeader } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const RETRYABLE = ['PENDING', 'FAILED'];

function RetryButton({ status, retrying, onRetry }) {
  if (!RETRYABLE.includes(status)) return null;

  return (
    <Button
      variant="secondary"
      icon="refresh"
      loading={retrying}
      onClick={(e) => {
        e.stopPropagation();
        onRetry();
      }}
    >
      Retry
    </Button>
  );
}

function EventInspectorModal({ event, onClose, onRetried }) {
  const [anchor, setAnchor] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    Promise.all([
      blockchainService.getAnchorStatus(event.id),
      blockchainService.getEventHistory(event.id).catch(() => ({ data: { data: { history: [] } } })),
    ])
      .then(([anchorRes, historyRes]) => {
        setAnchor(anchorRes.data?.data);
        setHistory(historyRes.data?.data?.history || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load ledger details.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, [event.id]);

  function retry() {
    setRetrying(true);
    setError('');
    blockchainService
      .recordEvent(event.id)
      .then(() => {
        load();
        onRetried?.();
      })
      .catch((err) => setError(err.response?.data?.message || 'Retry failed.'))
      .finally(() => setRetrying(false));
  }

  return (
    <Modal open onClose={onClose} title={`Ledger Inspector — ${event.title}`} size="lg">
      {loading ? (
        <div className="flex justify-center py-lg"><Spinner className="text-primary" /></div>
      ) : (
        <div className="space-y-lg">
          <dl className="grid grid-cols-2 gap-md">
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Event Status</dt>
              <dd><StatusBadge status={anchor?.eventStatus} /></dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Blockchain Status</dt>
              <dd><StatusBadge status={anchor?.blockchainStatus} /></dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Transaction ID</dt>
              <dd className="font-mono font-body-sm text-body-sm text-on-surface">{anchor?.blockchainTransactionId || '—'}</dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Block Number</dt>
              <dd className="font-body-sm text-body-sm text-on-surface">{anchor?.blockchainBlockNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Recorded At</dt>
              <dd className="font-body-sm text-body-sm text-on-surface">
                {anchor?.blockchainRecordedAt ? new Date(anchor.blockchainRecordedAt).toLocaleString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Retry Count</dt>
              <dd className="font-body-sm text-body-sm text-on-surface">{anchor?.blockchainRetryCount ?? 0}</dd>
            </div>
          </dl>
          {error && (
            <div className="p-md bg-error-container text-on-error-container rounded-lg font-body-sm text-body-sm">
              {error}
            </div>
          )}
          {!error && anchor?.blockchainLastError && (
            <div className="p-md bg-error-container text-on-error-container rounded-lg font-body-sm text-body-sm">
              {anchor.blockchainLastError}
            </div>
          )}
          {RETRYABLE.includes(anchor?.blockchainStatus) && (
            <Button variant="primary" icon="refresh" loading={retrying} onClick={retry}>
              Retry Anchoring
            </Button>
          )}
          <div>
            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide mb-sm">
              On-Chain History
            </h4>
            {!history || history.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No on-chain history available (the Fabric network may not be connected in this environment).
              </p>
            ) : (
              <pre className="text-xs bg-surface-container-low p-md rounded-lg overflow-auto max-h-64">
                {JSON.stringify(history, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function BlockchainMonitoring() {
  const [networkStatus, setNetworkStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [identities, setIdentities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspecting, setInspecting] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  function load() {
    setLoading(true);
    Promise.all([
      blockchainService.getNetworkStatus(),
      supplyChainService.getAll({ page: 1, limit: 20, sortBy: 'occurredAt', sortOrder: 'desc' }),
      blockchainService.getRecentProducts(),
      blockchainService.getRecentIdentities(),
    ])
      .then(([statusRes, eventsRes, productsRes, identitiesRes]) => {
        setNetworkStatus(statusRes.data?.data);
        setEvents(eventsRes.data?.data?.items || []);
        setProducts(productsRes.data?.data || []);
        setIdentities(identitiesRes.data?.data || []);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function retryProduct(product) {
    setRetryingId(product.id);
    blockchainService
      .anchorProduct(product.id)
      .catch(() => {})
      .finally(() => {
        setRetryingId(null);
        load();
      });
  }

  function retryIdentity(identity) {
    setRetryingId(identity.id);
    blockchainService
      .anchorIdentity(identity.id)
      .catch(() => {})
      .finally(() => {
        setRetryingId(null);
        load();
      });
  }

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">Blockchain Monitoring</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Hyperledger Fabric gateway status and per-record ledger anchoring inspection.
        </p>
      </div>

      <Card className="p-lg">
        <div className="flex items-center justify-between mb-md">
          <h3 className="font-headline text-headline-md text-on-surface">Network Status</h3>
          <StatusBadge
            status={networkStatus?.networkStatus === 'UP' ? 'ACTIVE' : 'INACTIVE'}
            label={networkStatus?.connectionStatus}
          />
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-lg">
          <div>
            <dt className="font-label-sm text-label-sm text-on-surface-variant">Channel</dt>
            <dd className="font-body-md text-body-md text-on-surface">{networkStatus?.channel || '—'}</dd>
          </div>
          <div>
            <dt className="font-label-sm text-label-sm text-on-surface-variant">Chaincode</dt>
            <dd className="font-body-md text-body-md text-on-surface">{networkStatus?.chaincodeName || '—'}</dd>
          </div>
          <div>
            <dt className="font-label-sm text-label-sm text-on-surface-variant">Peer Status</dt>
            <dd className="font-body-md text-body-md text-on-surface">{networkStatus?.peerStatus || '—'}</dd>
          </div>
          <div>
            <dt className="font-label-sm text-label-sm text-on-surface-variant">Chaincode Version</dt>
            <dd className="font-body-md text-body-md text-on-surface">{networkStatus?.chaincodeVersion || '—'}</dd>
          </div>
        </dl>
        {networkStatus?.message && (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-md italic">{networkStatus.message}</p>
        )}
      </Card>

      <Card>
        <CardHeader title="Recent Supply Chain Events" description="Click an event to inspect its ledger anchor status." />
        <DataTable
          loading={loading}
          data={events}
          onRowClick={setInspecting}
          emptyTitle="No supply chain events found"
          columns={[
            { key: 'title', header: 'Event' },
            { key: 'eventType', header: 'Type', render: (row) => row.eventType?.name },
            { key: 'eventStatus', header: 'Status', render: (row) => <StatusBadge status={row.eventStatus} /> },
            { key: 'blockchainStatus', header: 'Ledger', render: (row) => <StatusBadge status={row.blockchainStatus} /> },
            { key: 'occurredAt', header: 'Occurred', render: (row) => new Date(row.occurredAt).toLocaleString() },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Recent Products" description="Product-registration anchors — a contract is issued on creation and re-issued on every edit." />
        <DataTable
          loading={loading}
          data={products}
          emptyTitle="No products found"
          columns={[
            { key: 'productName', header: 'Product' },
            { key: 'businessName', header: 'Business' },
            { key: 'blockchainStatus', header: 'Ledger', render: (row) => <StatusBadge status={row.blockchainStatus} /> },
            { key: 'blockchainRetryCount', header: 'Retries' },
            { key: 'blockchainTransactionId', header: 'Transaction ID', render: (row) => (
              <span className="font-mono text-xs">{row.blockchainTransactionId ? `${row.blockchainTransactionId.slice(0, 12)}…` : '—'}</span>
            ) },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <RetryButton
                  status={row.blockchainStatus}
                  retrying={retryingId === row.id}
                  onRetry={() => retryProduct(row)}
                />
              ),
            },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Recent Digital Identities" description="QR verification-identity anchors, issued when a product's digital identity is generated." />
        <DataTable
          loading={loading}
          data={identities}
          emptyTitle="No digital identities found"
          columns={[
            { key: 'productName', header: 'Product' },
            { key: 'qrStatus', header: 'QR Status', render: (row) => <StatusBadge status={row.qrStatus} /> },
            { key: 'blockchainStatus', header: 'Ledger', render: (row) => <StatusBadge status={row.blockchainStatus} /> },
            { key: 'blockchainRetryCount', header: 'Retries' },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <RetryButton
                  status={row.blockchainStatus}
                  retrying={retryingId === row.id}
                  onRetry={() => retryIdentity(row)}
                />
              ),
            },
          ]}
        />
      </Card>

      {inspecting && (
        <EventInspectorModal event={inspecting} onClose={() => setInspecting(null)} onRetried={load} />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productsService from '../../services/products';
import qrService, { QR_FORMATS, QR_STATUSES } from '../../services/qr';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import DataTable from '../../components/ui/DataTable';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';
import { useAuth } from '../../context/AuthContext';

export default function QrCodeManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [product, setProduct] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [assets, setAssets] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState('PNG');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  async function loadIdentity() {
    try {
      const res = await qrService.getIdentity(id);
      const data = res.data?.data?.identity;
      setIdentity(data);
      if (data) {
        const assetsRes = await qrService.getAssets(id);
        setAssets(assetsRes.data?.data?.assets || []);
      }
    } catch {
      setIdentity(null);
      setAssets([]);
    }
  }

  async function loadAll() {
    setLoading(true);
    try {
      const prodRes = await productsService.getById(id);
      setProduct(prodRes.data?.data?.product);
      await loadIdentity();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setPreviewUrl(null);
    if (!identity) return;
    let objectUrl;
    qrService
      .previewImage(id, format)
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setPreviewUrl(objectUrl);
      })
      .catch(() => setPreviewUrl(null));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [identity, format, id]);

  async function handleCreateIdentity() {
    setError('');
    try {
      await qrService.createIdentity(id);
      await loadIdentity();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create a digital identity for this product.'));
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      await qrService.generate(id, { format, imageSize: 300 });
      await loadIdentity();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not generate QR code.'));
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    try {
      const res = await qrService.downloadImage(id, format);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${product?.sku || id}.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not download QR code.'));
    }
  }

  async function handleStatusChange(status) {
    try {
      await qrService.updateStatus(id, status);
      await loadIdentity();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update identity status.'));
    }
  }

  async function handleDeleteAsset(assetId) {
    if (!window.confirm('Delete this QR asset?')) return;
    await qrService.deleteAsset(id, assetId);
    await loadIdentity();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} className="text-primary" />
      </div>
    );
  }

  const eligible = product && product.status === 'ACTIVE';

  return (
    <div className="space-y-lg max-w-3xl mx-auto">
      <div>
        <button
          onClick={() => navigate(`/products/${id}`)}
          className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm mb-xs"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Product
        </button>
        <h2 className="font-headline text-headline-lg text-on-surface">
          QR Code Management — {product?.productName}
        </h2>
      </div>

      <ErrorBanner>{error}</ErrorBanner>

      {!identity ? (
        <Card>
          <EmptyState
            icon="qr_code_2"
            title="No digital identity yet"
            description={
              eligible
                ? 'Create a digital identity to generate a scannable, verifiable QR code for this product.'
                : 'Only ACTIVE products can generate a digital identity. Update this product\'s status first.'
            }
            action={
              eligible &&
              hasPermission('product-identity:create') && (
                <Button icon="fingerprint" onClick={handleCreateIdentity}>
                  Create Digital Identity
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <>
          <Card className="p-lg">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline text-headline-md text-on-surface">Digital Identity</h3>
              <StatusBadge status={identity.qrStatus} />
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-lg mb-lg">
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Version</dt>
                <dd className="font-body-md text-body-md text-on-surface">v{identity.qrVersion}</dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Total Scans</dt>
                <dd className="font-body-md text-body-md text-on-surface">{identity.totalScans}</dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Last Scan</dt>
                <dd className="font-body-md text-body-md text-on-surface">
                  {identity.lastScanAt ? new Date(identity.lastScanAt).toLocaleDateString() : '—'}
                </dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Expires</dt>
                <dd className="font-body-md text-body-md text-on-surface">
                  {identity.expiresAt ? new Date(identity.expiresAt).toLocaleDateString() : 'Never'}
                </dd>
              </div>
            </dl>

            {hasPermission('product-identity:update') && (
              <div className="flex items-center gap-md">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Status:</span>
                <select
                  className="border border-outline-variant rounded-md px-2 py-1 font-body-sm text-body-sm bg-transparent"
                  value={identity.qrStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {QR_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </Card>

          <Card className="p-lg">
            <CardHeader title="QR Asset" description="Generate a printable QR code linked to the public trust card." />
            <div className="p-lg flex flex-col md:flex-row gap-lg items-start">
              <div className="w-48 h-48 shrink-0 border border-outline-variant rounded-lg flex items-center justify-center bg-surface-container-low overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="QR code preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-outline text-[64px]">qr_code_2</span>
                )}
              </div>
              <div className="flex-1 space-y-md">
                <div className="flex items-center gap-md">
                  <select
                    className="border border-outline-variant rounded-md px-2 py-2 font-body-sm text-body-sm bg-transparent"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    {QR_FORMATS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  {hasPermission('qr:generate') && (
                    <Button icon="qr_code_2" loading={generating} onClick={handleGenerate}>
                      Generate
                    </Button>
                  )}
                  {hasPermission('qr:download') && (
                    <Button variant="secondary" icon="download" onClick={handleDownload}>
                      Download
                    </Button>
                  )}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  This QR resolves to the public verification page at{' '}
                  <span className="font-mono">/verify/{identity.verificationToken}</span>.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Generated Assets" description="Every QR file generated for this identity." />
            <DataTable
              data={assets}
              emptyTitle="No QR assets generated yet"
              columns={[
                { key: 'imageFormat', header: 'Format' },
                { key: 'imageSize', header: 'Size (bytes)' },
                { key: 'downloadCount', header: 'Downloads' },
                { key: 'printCount', header: 'Prints' },
                { key: 'createdAt', header: 'Created', render: (row) => new Date(row.createdAt).toLocaleString() },
                {
                  key: 'actions',
                  header: '',
                  render: (row) =>
                    hasPermission('qr:generate') && (
                      <button onClick={() => handleDeleteAsset(row.id)} className="text-error hover:underline font-label-sm text-label-sm">
                        Delete
                      </button>
                    ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}

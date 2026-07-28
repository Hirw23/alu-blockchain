import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import productsService, { PRODUCT_DOCUMENT_TYPES, PRODUCT_STATUSES } from '../../services/products';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import DataTable from '../../components/ui/DataTable';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'info' },
  { key: 'variants', label: 'Variants', icon: 'category' },
  { key: 'images', label: 'Images', icon: 'image' },
  { key: 'documents', label: 'Documents', icon: 'description' },
];

function OverviewTab({ product, onChanged }) {
  const { hasPermission } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    productName: product.productName,
    description: product.description || '',
    productType: product.productType,
    countryOfOrigin: product.countryOfOrigin,
    productionFacility: product.productionFacility || '',
    batchNumber: product.batchNumber || '',
    storageRequirements: product.storageRequirements || '',
  });
  const [quantity, setQuantity] = useState(product.quantity);
  const [status, setStatus] = useState(product.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await productsService.update(product.id, form);
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update product.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleQuantitySave() {
    setSaving(true);
    setError('');
    try {
      await productsService.updateInventory(product.id, { quantity: Number(quantity) });
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update inventory.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus) {
    setStatus(newStatus);
    try {
      await productsService.updateStatus(product.id, newStatus);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update status.'));
    }
  }

  async function handleVerify(verificationStatus) {
    try {
      await productsService.verify(product.id, verificationStatus);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update verification status.'));
    }
  }

  return (
    <div className="space-y-lg">
      <ErrorBanner>{error}</ErrorBanner>
      <Card className="p-lg">
        <div className="flex items-center justify-between mb-md">
          <h3 className="font-headline text-headline-md text-on-surface">Product Details</h3>
          {hasPermission('product:update') && (
            <Button variant="secondary" icon={editing ? 'close' : 'edit'} onClick={() => setEditing((v) => !v)}>
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <FormField label="Product Name" required>
                <input className={inputClassName} value={form.productName} onChange={(e) => set('productName', e.target.value)} required />
              </FormField>
              <FormField label="Product Type" required>
                <input className={inputClassName} value={form.productType} onChange={(e) => set('productType', e.target.value)} required />
              </FormField>
              <FormField label="Country of Origin" required>
                <input className={inputClassName} value={form.countryOfOrigin} onChange={(e) => set('countryOfOrigin', e.target.value)} required />
              </FormField>
              <FormField label="Production Facility">
                <input className={inputClassName} value={form.productionFacility} onChange={(e) => set('productionFacility', e.target.value)} />
              </FormField>
              <FormField label="Batch Number">
                <input className={inputClassName} value={form.batchNumber} onChange={(e) => set('batchNumber', e.target.value)} />
              </FormField>
              <FormField label="Storage Requirements">
                <input className={inputClassName} value={form.storageRequirements} onChange={(e) => set('storageRequirements', e.target.value)} />
              </FormField>
            </div>
            <FormField label="Description">
              <textarea className={`${inputClassName} min-h-[100px]`} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </FormField>
            <div className="flex justify-end">
              <Button type="submit" loading={saving} icon="save">
                Save
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Product Code</dt>
              <dd className="font-body-md text-body-md text-on-surface">{product.productCode}</dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">SKU / Barcode</dt>
              <dd className="font-body-md text-body-md text-on-surface">{product.sku} / {product.barcode}</dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Type</dt>
              <dd className="font-body-md text-body-md text-on-surface">{product.productType}</dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Country of Origin</dt>
              <dd className="font-body-md text-body-md text-on-surface">{product.countryOfOrigin}</dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Production Facility</dt>
              <dd className="font-body-md text-body-md text-on-surface">{product.productionFacility || '—'}</dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Batch Number</dt>
              <dd className="font-body-md text-body-md text-on-surface">{product.batchNumber || '—'}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Description</dt>
              <dd className="font-body-md text-body-md text-on-surface">{product.description || '—'}</dd>
            </div>
          </dl>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <Card className="p-lg">
          <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide mb-md">
            Inventory
          </h4>
          <div className="flex items-end gap-md">
            <FormField label="Quantity" className="flex-1">
              <input
                type="number"
                className={inputClassName}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={!hasPermission('product:update')}
              />
            </FormField>
            <span className="font-body-sm text-body-sm text-on-surface-variant pb-md">
              {product.unitOfMeasure}
            </span>
            {hasPermission('product:update') && (
              <Button variant="secondary" onClick={handleQuantitySave} loading={saving}>
                Update
              </Button>
            )}
          </div>
        </Card>
        <Card className="p-lg">
          <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide mb-md">
            Lifecycle Status
          </h4>
          <select
            className={inputClassName}
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={!hasPermission('product:archive')}
          >
            {PRODUCT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </Card>
        <Card className="p-lg">
          <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide mb-md">
            Verification
          </h4>
          <StatusBadge status={product.verificationStatus} />
          {hasPermission('product:verify') && product.verificationStatus === 'PENDING' && (
            <div className="flex gap-sm mt-md">
              <Button icon="check_circle" onClick={() => handleVerify('VERIFIED')}>Approve</Button>
              <Button variant="danger" icon="cancel" onClick={() => handleVerify('REJECTED')}>Reject</Button>
            </div>
          )}
          {!hasPermission('product:verify') && product.verificationStatus === 'PENDING' && (
            <p className="font-label-sm text-label-sm text-on-surface-variant italic mt-md">
              Awaiting platform administrator review.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function VariantsTab({ productId }) {
  const { hasPermission } = useAuth();
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ variantName: '', sku: '', barcode: '', quantity: 0, unitOfMeasure: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    productsService.getVariants(productId).then((res) => setVariants(res.data?.data?.variants || [])).finally(() => setLoading(false));
  }
  useEffect(load, [productId]);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await productsService.addVariant(productId, { ...form, quantity: Number(form.quantity) });
      setForm({ variantName: '', sku: '', barcode: '', quantity: 0, unitOfMeasure: '' });
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not add variant.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(variantId) {
    if (!window.confirm('Delete this variant?')) return;
    await productsService.deleteVariant(productId, variantId);
    load();
  }

  return (
    <Card className="p-lg">
      <CardHeader title="Product Variants" description="Track alternate SKUs (sizes, packaging, etc.)." />
      <div className="p-lg space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        {hasPermission('product:update') && (
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-md items-end">
            <FormField label="Variant Name">
              <input className={inputClassName} value={form.variantName} onChange={(e) => setForm((f) => ({ ...f, variantName: e.target.value }))} required />
            </FormField>
            <FormField label="SKU">
              <input className={inputClassName} value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} required />
            </FormField>
            <FormField label="Barcode">
              <input className={inputClassName} value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} required />
            </FormField>
            <FormField label="Quantity">
              <input type="number" className={inputClassName} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
            </FormField>
            <FormField label="Unit">
              <input className={inputClassName} value={form.unitOfMeasure} onChange={(e) => setForm((f) => ({ ...f, unitOfMeasure: e.target.value }))} required />
            </FormField>
            <Button type="submit" loading={saving} className="md:col-span-5 justify-self-start" icon="add">
              Add Variant
            </Button>
          </form>
        )}
        <DataTable
          loading={loading}
          data={variants}
          emptyTitle="No variants yet"
          columns={[
            { key: 'variantName', header: 'Name' },
            { key: 'sku', header: 'SKU' },
            { key: 'barcode', header: 'Barcode' },
            { key: 'quantity', header: 'Quantity', render: (row) => `${row.quantity} ${row.unitOfMeasure}` },
            {
              key: 'actions',
              header: '',
              render: (row) =>
                hasPermission('product:update') && (
                  <button onClick={() => handleDelete(row.id)} className="text-error hover:underline font-label-sm text-label-sm">
                    Delete
                  </button>
                ),
            },
          ]}
        />
      </div>
    </Card>
  );
}

function ImagesTab({ productId }) {
  const { hasPermission } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    productsService.getImages(productId).then((res) => setImages(res.data?.data?.images || [])).finally(() => setLoading(false));
  }
  useEffect(load, [productId]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('displayOrder', String(images.length));
      await productsService.addImage(productId, formData);
      setFile(null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not add image.'));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId) {
    if (!window.confirm('Remove this image?')) return;
    await productsService.deleteImage(productId, imageId);
    load();
  }

  return (
    <Card className="p-lg">
      <CardHeader title="Product Images" description="Reference photos recorded against this product." />
      <div className="p-lg space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        {hasPermission('product:manage-images') && (
          <form onSubmit={handleUpload} className="flex gap-md items-end">
            <FormField label="Image" className="flex-1">
              <input type="file" accept="image/*" className={inputClassName} onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </FormField>
            <Button type="submit" loading={uploading} disabled={!file} icon="upload">
              Add
            </Button>
          </form>
        )}
        {loading ? (
          <div className="flex justify-center py-lg">
            <Spinner className="text-primary" />
          </div>
        ) : images.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No images recorded.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
            {images.map((img) => (
              <div key={img.id} className="relative group border border-outline-variant rounded-lg p-md text-center">
                <span className="material-symbols-outlined text-outline text-[32px]">image</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-1">{img.fileName}</p>
                {hasPermission('product:manage-images') && (
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="absolute top-1 right-1 p-1 bg-error text-on-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function DocumentsTab({ productId }) {
  const { hasPermission } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentType, setDocumentType] = useState(PRODUCT_DOCUMENT_TYPES[0]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    productsService.getDocuments(productId).then((res) => setDocuments(res.data?.data?.documents || [])).finally(() => setLoading(false));
  }
  useEffect(load, [productId]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('file', file);
      await productsService.addDocument(productId, formData);
      setFile(null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not record document.'));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(documentId) {
    if (!window.confirm('Remove this document?')) return;
    await productsService.deleteDocument(productId, documentId);
    load();
  }

  return (
    <Card className="p-lg">
      <CardHeader title="Product Documents" description="Certificates, safety sheets, and labels on file." />
      <div className="p-lg space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        {hasPermission('product:manage-documents') && (
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-md items-end">
            <FormField label="Document Type" className="w-full sm:w-56">
              <select className={inputClassName} value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                {PRODUCT_DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FormField>
            <FormField label="File" className="w-full">
              <input type="file" accept=".pdf,image/*" className={inputClassName} onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </FormField>
            <Button type="submit" loading={uploading} disabled={!file} icon="upload_file">
              Upload
            </Button>
          </form>
        )}
        <DataTable
          loading={loading}
          data={documents}
          emptyTitle="No documents on file"
          columns={[
            { key: 'documentType', header: 'Type' },
            { key: 'fileName', header: 'File' },
            { key: 'uploadedAt', header: 'Uploaded', render: (row) => new Date(row.uploadedAt).toLocaleDateString() },
            {
              key: 'actions',
              header: '',
              render: (row) =>
                hasPermission('product:manage-documents') && (
                  <button onClick={() => handleDelete(row.id)} className="text-error hover:underline font-label-sm text-label-sm">
                    Remove
                  </button>
                ),
            },
          ]}
        />
      </div>
    </Card>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const { hasPermission } = useAuth();

  function load() {
    setLoading(true);
    productsService
      .getById(id)
      .then((res) => setProduct(res.data?.data?.product))
      .finally(() => setLoading(false));
  }
  useEffect(load, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} className="text-primary" />
      </div>
    );
  }

  if (!product) {
    return <Card className="p-lg">Product not found.</Card>;
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm mb-xs"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Products
          </button>
          <div className="flex items-center gap-3">
            <h2 className="font-headline text-headline-lg text-on-surface">{product.productName}</h2>
            <StatusBadge status={product.status} />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {product.category?.categoryName} · {product.business?.businessName}
          </p>
        </div>
        {hasPermission('product:delete') && (
          <Button
            variant="danger"
            icon="delete"
            onClick={async () => {
              if (!window.confirm('Delete this product? This cannot be undone.')) return;
              await productsService.delete(product.id);
              navigate('/products');
            }}
          >
            Delete Product
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        <Link to={`/products/${id}/timeline`}>
          <Card className="p-md flex items-center gap-3 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-primary">account_tree</span>
            <span className="font-label-md text-label-md text-on-surface">Supply Chain Timeline</span>
            <span className="material-symbols-outlined text-outline ml-auto">chevron_right</span>
          </Card>
        </Link>
        <Link to={`/products/${id}/qr`}>
          <Card className="p-md flex items-center gap-3 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-primary">qr_code_2</span>
            <span className="font-label-md text-label-md text-on-surface">QR Code Management</span>
            <span className="material-symbols-outlined text-outline ml-auto">chevron_right</span>
          </Card>
        </Link>
        <Link to={`/products/${id}/verifications`}>
          <Card className="p-md flex items-center gap-3 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
            <span className="font-label-md text-label-md text-on-surface">Verification History</span>
            <span className="material-symbols-outlined text-outline ml-auto">chevron_right</span>
          </Card>
        </Link>
      </div>

      <div className="flex gap-1 border-b border-outline-variant overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-md py-sm font-label-md text-label-md border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab product={product} onChanged={load} />}
      {tab === 'variants' && <VariantsTab productId={id} />}
      {tab === 'images' && <ImagesTab productId={id} />}
      {tab === 'documents' && <DocumentsTab productId={id} />}
    </div>
  );
}

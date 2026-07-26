import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import productsService, { PRODUCT_STATUSES } from '../../services/products';
import productCategoriesService from '../../services/productCategories';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import { inputClassName } from '../../components/ui/FormField';
import { useAuth } from '../../context/AuthContext';

export default function ProductManagement() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    productCategoriesService
      .getAll()
      .then((res) => setCategories(res.data?.data?.items || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    productsService
      .getMe()
      .then((res) => setProducts(res.data?.data?.items || []))
      .finally(() => setLoading(false));
  }, []);

  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.categoryName;
    });
    return map;
  }, [categories]);

  const filtered = products.filter((p) => {
    if (status !== 'ALL' && p.status !== status) return false;
    if (search) {
      const term = search.toLowerCase();
      const haystack = `${p.productName} ${p.sku} ${p.productCode} ${p.barcode}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    await productsService.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline text-headline-lg text-on-surface">Products</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your registered product catalog.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          {hasPermission('product:manage-categories') && (
            <Link to="/products/categories">
              <Button variant="secondary" icon="category">
                Categories
              </Button>
            </Link>
          )}
          {hasPermission('product:create') && (
            <Link to="/products/new">
              <Button icon="add_box">New Product</Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="p-md">
        <div className="flex flex-col sm:flex-row gap-md items-stretch sm:items-center">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              className={`${inputClassName} pl-10`}
              placeholder="Search by name, SKU, barcode..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchParams(e.target.value ? { search: e.target.value } : {});
              }}
            />
          </div>
          <select className={`${inputClassName} sm:w-56`} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            {PRODUCT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <DataTable
          loading={loading}
          data={filtered}
          onRowClick={(row) => navigate(`/products/${row.id}`)}
          emptyTitle="No products found"
          emptyDescription="Try adjusting your filters, or register your first product."
          columns={[
            {
              key: 'productName',
              header: 'Product',
              render: (row) => (
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{row.productName}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{row.sku}</p>
                </div>
              ),
            },
            {
              key: 'category',
              header: 'Category',
              render: (row) => categoryNameById[row.categoryId] || '—',
            },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              key: 'verificationStatus',
              header: 'Verification',
              render: (row) => <StatusBadge status={row.verificationStatus} />,
            },
            {
              key: 'quantity',
              header: 'Quantity',
              render: (row) => `${row.quantity} ${row.unitOfMeasure}`,
            },
            {
              key: 'createdAt',
              header: 'Registered',
              render: (row) => new Date(row.createdAt).toLocaleDateString(),
            },
            {
              key: 'actions',
              header: '',
              render: (row) =>
                hasPermission('product:delete') && (
                  <button
                    onClick={(e) => handleDelete(e, row.id)}
                    className="text-error hover:underline font-label-sm text-label-sm"
                  >
                    Delete
                  </button>
                ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

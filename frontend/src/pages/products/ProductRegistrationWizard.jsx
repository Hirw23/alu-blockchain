import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productsService from '../../services/products';
import productCategoriesService from '../../services/productCategories';
import businessesService from '../../services/businesses';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Stepper from '../../components/ui/Stepper';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';
import { flattenCategories } from '../../utils/categoryTree';

const STEPS = ['Basic Info', 'Details', 'Inventory & Review'];

export default function ProductRegistrationWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const [form, setForm] = useState({
    categoryId: '',
    productName: '',
    productCode: '',
    sku: '',
    barcode: '',
    productType: '',
    description: '',
    countryOfOrigin: '',
    productionFacility: '',
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    storageRequirements: '',
    quantity: 0,
    unitOfMeasure: '',
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    Promise.all([businessesService.getMe(), productCategoriesService.getAll()])
      .then(([bizRes, catRes]) => {
        const items = bizRes.data?.data?.items || [];
        const verified = items.find((b) => b.status === 'ACTIVE' && b.verificationStatus === 'VERIFIED');
        setBusiness(verified || items[0] || null);
        setCategories(catRes.data?.data?.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const flatCategories = flattenCategories(categories);
  const businessEligible = business && business.status === 'ACTIVE' && business.verificationStatus === 'VERIFIED';

  async function handleCreateCategory(e) {
    e.preventDefault();
    setCreatingCategory(true);
    setCategoryError('');
    try {
      const res = await productCategoriesService.create({ categoryName: newCategoryName });
      const category = res.data?.data?.category;
      setCategories((prev) => [...prev, category]);
      set('categoryId', category.id);
      setShowNewCategory(false);
      setNewCategoryName('');
    } catch (err) {
      setCategoryError(extractErrorMessage(err, 'Could not create category.'));
    } finally {
      setCreatingCategory(false);
    }
  }

  function validateStep(current) {
    if (current === 1) {
      return form.categoryId && form.productName && form.productCode && form.sku && form.barcode && form.productType;
    }
    if (current === 2) {
      return form.countryOfOrigin;
    }
    return form.unitOfMeasure;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        businessId: business.id,
        quantity: Number(form.quantity) || 0,
        manufacturingDate: form.manufacturingDate || null,
        expiryDate: form.expiryDate || null,
      };
      const res = await productsService.create(payload);
      const product = res.data?.data?.product;
      navigate(`/products/${product.id}`);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not register product.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} className="text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <Card>
        <EmptyState
          icon="business_center"
          title="You need a business first"
          description="Set up your business before you can register products."
          action={
            <Button icon="add_business" onClick={() => navigate('/onboarding/business-setup')}>
              Set Up Business
            </Button>
          }
        />
      </Card>
    );
  }

  if (!businessEligible) {
    return (
      <Card>
        <EmptyState
          icon="hourglass_top"
          title="Business verification pending"
          description="Only verified, active businesses can register products. Track your verification status from Business Management."
          action={
            <Button icon="business_center" onClick={() => navigate('/business')}>
              Go to Business Management
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-lg">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">Register a Product</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Registering to {business.businessName}
        </p>
      </div>

      <Card className="p-lg">
        <Stepper steps={STEPS} currentStep={step} />
        <ErrorBanner>{error}</ErrorBanner>

        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-lg">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <FormField label="Category" required className="md:col-span-2">
                <div className="flex gap-sm">
                <select className={inputClassName} value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} required>
                  <option value="">Select a category</option>
                  {flatCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {'  '.repeat(c.depth)}
                      {c.categoryName}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="secondary" icon="add" onClick={() => setShowNewCategory(true)}>
                  New
                </Button>
                </div>
                {flatCategories.length === 0 && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    No categories yet — create one to get started.
                  </p>
                )}
              </FormField>
              <FormField label="Product Name" required>
                <input className={inputClassName} value={form.productName} onChange={(e) => set('productName', e.target.value)} required />
              </FormField>
              <FormField label="Product Type" required hint="e.g. Raw Material, Finished Good">
                <input className={inputClassName} value={form.productType} onChange={(e) => set('productType', e.target.value)} required />
              </FormField>
              <FormField label="Product Code" required>
                <input className={inputClassName} value={form.productCode} onChange={(e) => set('productCode', e.target.value)} required />
              </FormField>
              <FormField label="SKU" required>
                <input className={inputClassName} value={form.sku} onChange={(e) => set('sku', e.target.value)} required />
              </FormField>
              <FormField label="Barcode" required>
                <input className={inputClassName} value={form.barcode} onChange={(e) => set('barcode', e.target.value)} required />
              </FormField>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <FormField label="Country of Origin" required>
                <input className={inputClassName} value={form.countryOfOrigin} onChange={(e) => set('countryOfOrigin', e.target.value)} required />
              </FormField>
              <FormField label="Production Facility" hint="Optional">
                <input className={inputClassName} value={form.productionFacility} onChange={(e) => set('productionFacility', e.target.value)} />
              </FormField>
              <FormField label="Batch Number" hint="Optional">
                <input className={inputClassName} value={form.batchNumber} onChange={(e) => set('batchNumber', e.target.value)} />
              </FormField>
              <FormField label="Storage Requirements" hint="Optional">
                <input className={inputClassName} value={form.storageRequirements} onChange={(e) => set('storageRequirements', e.target.value)} />
              </FormField>
              <FormField label="Manufacturing Date" hint="Optional">
                <input type="date" className={inputClassName} value={form.manufacturingDate} onChange={(e) => set('manufacturingDate', e.target.value)} />
              </FormField>
              <FormField label="Expiry Date" hint="Optional">
                <input type="date" className={inputClassName} value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
              </FormField>
              <FormField label="Description" className="md:col-span-2" hint="Optional">
                <textarea className={`${inputClassName} min-h-[100px]`} value={form.description} onChange={(e) => set('description', e.target.value)} />
              </FormField>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <FormField label="Initial Quantity" required>
                <input type="number" min="0" className={inputClassName} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} required />
              </FormField>
              <FormField label="Unit of Measure" required hint="e.g. kg, litres, units">
                <input className={inputClassName} value={form.unitOfMeasure} onChange={(e) => set('unitOfMeasure', e.target.value)} required />
              </FormField>
              <div className="md:col-span-2 bg-surface-container-low rounded-lg p-md">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Review</p>
                <p className="font-body-sm text-body-sm text-on-surface">
                  {form.productName} · {form.sku} · {form.productType}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-md border-t border-outline-variant">
            <Button
              type="button"
              variant="secondary"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button type="button" disabled={!validateStep(step)} onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            ) : (
              <Button type="submit" loading={submitting} disabled={!validateStep(3)} icon="check_circle">
                Register Product
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Modal
        open={showNewCategory}
        onClose={() => {
          setShowNewCategory(false);
          setCategoryError('');
        }}
        title="New Category"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNewCategory(false)}>
              Cancel
            </Button>
            <Button
              form="new-category-form"
              type="submit"
              loading={creatingCategory}
              disabled={!newCategoryName.trim()}
            >
              Create
            </Button>
          </>
        }
      >
        <form id="new-category-form" onSubmit={handleCreateCategory} className="space-y-md">
          <ErrorBanner>{categoryError}</ErrorBanner>
          <FormField label="Category Name" required>
            <input
              className={inputClassName}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}

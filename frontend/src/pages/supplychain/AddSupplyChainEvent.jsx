import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import productsService from '../../services/products';
import supplyChainService from '../../services/supplychain';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';

export default function AddSupplyChainEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [includeLocation, setIncludeLocation] = useState(false);

  const [form, setForm] = useState({
    productId: searchParams.get('productId') || '',
    eventTypeId: '',
    title: '',
    description: '',
    occurredAt: '',
  });
  const [location, setLocation] = useState({
    country: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    address: '',
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    Promise.all([productsService.getMe(), supplyChainService.getEventTypes()])
      .then(([prodRes, typeRes]) => {
        const items = (prodRes.data?.data?.items || []).filter((p) => p.status === 'ACTIVE');
        setProducts(items);
        setEventTypes(typeRes.data?.data?.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const groupedEventTypes = useMemo(() => {
    const groups = {};
    eventTypes.forEach((t) => {
      groups[t.category] = groups[t.category] || [];
      groups[t.category].push(t);
    });
    return groups;
  }, [eventTypes]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        productId: form.productId,
        eventTypeId: form.eventTypeId,
        title: form.title,
        description: form.description || undefined,
        occurredAt: form.occurredAt || undefined,
        location: includeLocation ? location : undefined,
      };
      const res = await supplyChainService.create(payload);
      const event = res.data?.data?.event;
      navigate(`/products/${event?.productId || form.productId}/timeline`);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not log event.'));
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

  return (
    <div className="max-w-2xl mx-auto space-y-lg">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">Log Supply Chain Event</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Record a new stage in a product's trace timeline.
        </p>
      </div>

      <Card className="p-lg">
        <ErrorBanner>{error}</ErrorBanner>

        {products.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You need at least one ACTIVE product to log supply chain events.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-lg">
            <FormField label="Product" required>
              <select className={inputClassName} value={form.productId} onChange={(e) => set('productId', e.target.value)} required>
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName} ({p.sku})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Event Type" required>
              <select className={inputClassName} value={form.eventTypeId} onChange={(e) => set('eventTypeId', e.target.value)} required>
                <option value="">Select an event type</option>
                {Object.entries(groupedEventTypes).map(([category, types]) => (
                  <optgroup key={category} label={category}>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </FormField>

            <FormField label="Title" required hint="3-100 characters">
              <input className={inputClassName} value={form.title} onChange={(e) => set('title', e.target.value)} required minLength={3} maxLength={100} />
            </FormField>

            <FormField label="Occurred At" hint="Defaults to now if left blank">
              <input type="datetime-local" className={inputClassName} value={form.occurredAt} onChange={(e) => set('occurredAt', e.target.value)} />
            </FormField>

            <FormField label="Description" hint="Optional, up to 500 characters">
              <textarea
                className={`${inputClassName} min-h-[100px]`}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                maxLength={500}
              />
            </FormField>

            <div>
              <label className="flex items-center gap-2 font-label-md text-label-md text-on-surface cursor-pointer">
                <input type="checkbox" checked={includeLocation} onChange={(e) => setIncludeLocation(e.target.checked)} />
                Record a location for this event
              </label>
            </div>

            {includeLocation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg p-lg bg-surface-container-low rounded-lg">
                <FormField label="Country" required>
                  <input className={inputClassName} value={location.country} onChange={(e) => setLocation((l) => ({ ...l, country: e.target.value }))} required={includeLocation} />
                </FormField>
                <FormField label="Province" required>
                  <input className={inputClassName} value={location.province} onChange={(e) => setLocation((l) => ({ ...l, province: e.target.value }))} required={includeLocation} />
                </FormField>
                <FormField label="District" required>
                  <input className={inputClassName} value={location.district} onChange={(e) => setLocation((l) => ({ ...l, district: e.target.value }))} required={includeLocation} />
                </FormField>
                <FormField label="Sector" required>
                  <input className={inputClassName} value={location.sector} onChange={(e) => setLocation((l) => ({ ...l, sector: e.target.value }))} required={includeLocation} />
                </FormField>
                <FormField label="Cell" required>
                  <input className={inputClassName} value={location.cell} onChange={(e) => setLocation((l) => ({ ...l, cell: e.target.value }))} required={includeLocation} />
                </FormField>
                <FormField label="Village" required>
                  <input className={inputClassName} value={location.village} onChange={(e) => setLocation((l) => ({ ...l, village: e.target.value }))} required={includeLocation} />
                </FormField>
                <FormField label="Address" className="md:col-span-2" hint="Optional">
                  <input className={inputClassName} value={location.address} onChange={(e) => setLocation((l) => ({ ...l, address: e.target.value }))} />
                </FormField>
              </div>
            )}

            <div className="flex justify-end gap-md pt-md border-t border-outline-variant">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} icon="add_task">
                Log Event
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

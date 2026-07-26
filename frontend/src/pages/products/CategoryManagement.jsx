import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productCategoriesService from '../../services/productCategories';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';
import { flattenCategories } from '../../utils/categoryTree';

const EMPTY_FORM = { categoryName: '', description: '', parentCategoryId: '' };

export default function CategoryManagement() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [listError, setListError] = useState('');

  function load() {
    setLoading(true);
    return productCategoriesService
      .getAll()
      .then((res) => setCategories(res.data?.data?.items || []))
      .catch((err) => setListError(extractErrorMessage(err, 'Could not load categories.')))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const flat = flattenCategories(categories);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setForm({
      categoryName: category.categoryName,
      description: category.description || '',
      parentCategoryId: category.parentCategoryId || '',
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        categoryName: form.categoryName,
        description: form.description || null,
        parentCategoryId: form.parentCategoryId || null,
      };
      if (editing) {
        await productCategoriesService.update(editing.id, payload);
      } else {
        await productCategoriesService.create(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not save category.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    if (category.subCategories?.length || flat.some((c) => c.parentCategoryId === category.id)) {
      window.alert('Remove or reassign its subcategories before deleting this category.');
      return;
    }
    if (!window.confirm(`Delete category "${category.categoryName}"? Products already using it will need reassignment.`)) return;
    try {
      await productCategoriesService.delete(category.id);
      await load();
    } catch (err) {
      window.alert(extractErrorMessage(err, 'Could not delete category — it may still be in use by products.'));
    }
  }

  // Parent options exclude the category being edited (and its own descendants) to prevent cycles.
  const parentOptions = flat.filter((c) => {
    if (!editing) return true;
    if (c.id === editing.id) return false;
    let current = c;
    const byId = Object.fromEntries(categories.map((cat) => [cat.id, cat]));
    const seen = new Set();
    while (current.parentCategoryId && !seen.has(current.id)) {
      if (current.parentCategoryId === editing.id) return false;
      seen.add(current.id);
      current = byId[current.parentCategoryId] || {};
    }
    return true;
  });

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <div className="flex items-center gap-sm">
            <button
              onClick={() => navigate('/products')}
              className="p-xs rounded-full hover:bg-surface-container-high transition-colors"
              aria-label="Back to Products"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h2 className="font-headline text-headline-lg text-on-surface">Product Categories</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage the category hierarchy used when registering products.
          </p>
        </div>
        <Button icon="add" onClick={openCreate}>
          New Category
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Categories"
          description={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
        />
        {listError && <ErrorBanner className="m-lg">{listError}</ErrorBanner>}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={32} className="text-primary" />
          </div>
        ) : flat.length === 0 ? (
          <EmptyState
            icon="category"
            title="No categories yet"
            description="Create your first category so products can be registered against it."
            action={
              <Button icon="add" onClick={openCreate}>
                New Category
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-outline-variant">
            {flat.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-md p-lg">
                <div className="flex items-center gap-sm min-w-0" style={{ paddingLeft: `${c.depth * 24}px` }}>
                  {c.depth > 0 && (
                    <span className="material-symbols-outlined text-outline text-[18px]">subdirectory_arrow_right</span>
                  )}
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md text-on-surface truncate">{c.categoryName}</p>
                    {c.description && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{c.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-sm shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-sm rounded-full hover:bg-surface-container-high transition-colors"
                    aria-label={`Edit ${c.categoryName}`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-sm rounded-full hover:bg-error-container transition-colors"
                    aria-label={`Delete ${c.categoryName}`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'New Category'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button form="category-form" type="submit" loading={saving} disabled={!form.categoryName.trim()}>
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-md">
          <ErrorBanner>{formError}</ErrorBanner>
          <FormField label="Category Name" required>
            <input
              className={inputClassName}
              value={form.categoryName}
              onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))}
              autoFocus
              required
            />
          </FormField>
          <FormField label="Parent Category" hint="Optional — leave blank for a top-level category">
            <select
              className={inputClassName}
              value={form.parentCategoryId}
              onChange={(e) => setForm((f) => ({ ...f, parentCategoryId: e.target.value }))}
            >
              <option value="">None (top-level)</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {'  '.repeat(c.depth)}
                  {c.categoryName}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Description" hint="Optional">
            <textarea
              className={`${inputClassName} min-h-[80px]`}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}

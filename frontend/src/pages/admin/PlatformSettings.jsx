import { useEffect, useState } from 'react';
import adminService from '../../services/admin';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';

const TABS = [
  { key: 'settings', label: 'Platform Settings', icon: 'settings_suggest' },
  { key: 'features', label: 'Feature Flags', icon: 'toggle_on' },
  { key: 'maintenance', label: 'Maintenance Windows', icon: 'build' },
];

function SettingsTab() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  function load() {
    setLoading(true);
    adminService.getSettings().then((res) => setSettings(res.data?.data?.settings || [])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleSave(settingKey) {
    setSaving(settingKey);
    setError('');
    try {
      await adminService.updateSetting(settingKey, edits[settingKey]);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update setting.'));
    } finally {
      setSaving(null);
    }
  }

  async function handleAddSetting(e) {
    e.preventDefault();
    if (!newKey.trim()) return;
    try {
      await adminService.updateSetting(newKey.trim(), newValue);
      setNewKey('');
      setNewValue('');
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not add setting.'));
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner className="text-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader title="Platform Settings" description="Key/value configuration used across the platform." />
      <div className="p-lg space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        <div className="space-y-md">
          {settings.map((s) => (
            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-md p-md border border-outline-variant rounded-lg">
              <div className="sm:w-56 shrink-0">
                <p className="font-label-md text-label-md text-on-surface">{s.settingKey}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{s.category}</p>
              </div>
              <input
                className={`${inputClassName} flex-1`}
                defaultValue={s.settingValue}
                onChange={(e) => setEdits((prev) => ({ ...prev, [s.settingKey]: e.target.value }))}
              />
              <Button variant="secondary" loading={saving === s.settingKey} onClick={() => handleSave(s.settingKey)}>
                Save
              </Button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddSetting} className="flex flex-col sm:flex-row gap-md items-end pt-md border-t border-outline-variant">
          <FormField label="New Setting Key" className="flex-1">
            <input className={inputClassName} value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          </FormField>
          <FormField label="Value" className="flex-1">
            <input className={inputClassName} value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          </FormField>
          <Button type="submit" icon="add">Add Setting</Button>
        </form>
      </div>
    </Card>
  );
}

function FeatureFlagsTab() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    adminService.getFeatureFlags().then((res) => setFeatures(res.data?.data?.features || [])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleToggle(flag) {
    await adminService.updateFeatureFlag(flag.id, !flag.enabled);
    load();
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner className="text-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader title="Feature Flags" description="Toggle platform features on or off." />
      <div className="p-lg space-y-md">
        {features.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No feature flags configured yet.</p>
        )}
        {features.map((f) => (
          <div key={f.id} className="flex items-center justify-between p-md border border-outline-variant rounded-lg">
            <div>
              <p className="font-label-md text-label-md text-on-surface">{f.featureName}</p>
              {f.description && <p className="font-body-sm text-body-sm text-on-surface-variant">{f.description}</p>}
            </div>
            <button
              onClick={() => handleToggle(f)}
              className={`relative w-12 h-6 rounded-full transition-colors ${f.enabled ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${f.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MaintenanceTab() {
  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalEnabled, setGlobalEnabled] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startsAt: '', endsAt: '', enabled: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    Promise.all([adminService.getMaintenanceWindows(), adminService.getSettings()])
      .then(([winRes, settingsRes]) => {
        setWindows(winRes.data?.data?.windows || []);
        const settings = settingsRes.data?.data?.settings || [];
        const maintenanceSetting = settings.find((s) => s.settingKey === 'Maintenance Mode');
        setGlobalEnabled(maintenanceSetting?.settingValue === 'true');
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleToggleGlobal() {
    await adminService.toggleMaintenanceMode(!globalEnabled);
    load();
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminService.createMaintenanceWindow(form);
      setForm({ title: '', description: '', startsAt: '', endsAt: '', enabled: false });
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create maintenance window.'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner className="text-primary" /></div>;
  }

  return (
    <div className="space-y-lg">
      <Card className="p-lg flex items-center justify-between">
        <div>
          <h3 className="font-headline text-headline-md text-on-surface">Global Maintenance Lockdown</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            When enabled, every request except /health is blocked with a 503 response.
          </p>
        </div>
        <Button variant={globalEnabled ? 'danger' : 'primary'} onClick={handleToggleGlobal}>
          {globalEnabled ? 'Disable Lockdown' : 'Enable Lockdown'}
        </Button>
      </Card>

      <Card>
        <CardHeader title="Scheduled Maintenance Windows" />
        <div className="p-lg space-y-lg">
          <ErrorBanner>{error}</ErrorBanner>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <FormField label="Title" required>
              <input className={inputClassName} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </FormField>
            <FormField label="Description" hint="Optional">
              <input className={inputClassName} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </FormField>
            <FormField label="Starts At" required>
              <input type="datetime-local" className={inputClassName} value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} required />
            </FormField>
            <FormField label="Ends At" required>
              <input type="datetime-local" className={inputClassName} value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} required />
            </FormField>
            <Button type="submit" loading={saving} className="md:col-span-2 justify-self-start" icon="add">
              Schedule Window
            </Button>
          </form>

          <div className="space-y-sm pt-md border-t border-outline-variant">
            {windows.length === 0 && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">No maintenance windows scheduled.</p>
            )}
            {windows.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-md border border-outline-variant rounded-lg">
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{w.title}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {new Date(w.startsAt).toLocaleString()} → {new Date(w.endsAt).toLocaleString()}
                  </p>
                </div>
                <span className={`font-label-sm text-label-sm ${w.enabled ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {w.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function PlatformSettings() {
  const [tab, setTab] = useState('settings');

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">Platform Settings</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Configure platform-wide settings, feature flags, and maintenance windows.
        </p>
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

      {tab === 'settings' && <SettingsTab />}
      {tab === 'features' && <FeatureFlagsTab />}
      {tab === 'maintenance' && <MaintenanceTab />}
    </div>
  );
}

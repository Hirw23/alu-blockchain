import { useEffect, useState } from 'react';
import reportsService, {
  REPORT_FORMATS,
  REPORT_SCHEDULE_FREQUENCIES,
  REPORT_TYPES,
  SIMULATED_REPORT_FORMATS,
} from '../../services/reports';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';
import { useAuth } from '../../context/AuthContext';

function CreateDefinitionModal({ open, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await reportsService.createDefinition({ name, reportType, filters: {} });
      setName('');
      onSaved();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create report definition.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Report Definition"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="report-def-form" loading={saving}>Create</Button>
        </>
      }
    >
      <form id="report-def-form" onSubmit={handleSubmit} className="space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        <FormField label="Report Name" required>
          <input className={inputClassName} value={name} onChange={(e) => setName(e.target.value)} required minLength={3} maxLength={100} />
        </FormField>
        <FormField label="Report Type" required>
          <select className={inputClassName} value={reportType} onChange={(e) => setReportType(e.target.value)}>
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>
            ))}
          </select>
        </FormField>
      </form>
    </Modal>
  );
}

function DefinitionRow({ definition, onChanged }) {
  const [format, setFormat] = useState('CSV');
  const [exporting, setExporting] = useState(false);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  async function handleExport() {
    setExporting(true);
    setError('');
    try {
      await reportsService.exportReport(definition.id, format);
      loadHistory();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not export report.'));
    } finally {
      setExporting(false);
    }
  }

  function loadHistory() {
    reportsService.getExportHistory(definition.id).then((res) => setHistory(res.data?.data?.history || []));
  }

  async function handleDownload() {
    try {
      const res = await reportsService.downloadReport(definition.id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${definition.name}.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(extractErrorMessage(err, 'No exported file available yet.'));
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete report "${definition.name}"?`)) return;
    await reportsService.deleteDefinition(definition.id);
    onChanged();
  }

  return (
    <div className="p-lg border border-outline-variant rounded-lg space-y-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-label-md text-label-md text-on-surface">{definition.name}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{definition.reportType.replaceAll('_', ' ')}</p>
        </div>
        <button onClick={handleDelete} className="text-error hover:underline font-label-sm text-label-sm">
          Delete
        </button>
      </div>
      <ErrorBanner>{error}</ErrorBanner>
      <div className="flex flex-wrap items-center gap-md">
        <select className={`${inputClassName} w-32`} value={format} onChange={(e) => setFormat(e.target.value)}>
          {REPORT_FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
              {SIMULATED_REPORT_FORMATS.includes(f) ? ' (simulated)' : ''}
            </option>
          ))}
        </select>
        <Button variant="secondary" loading={exporting} icon="play_arrow" onClick={handleExport}>
          Generate Export
        </Button>
        <Button variant="secondary" icon="download" onClick={handleDownload}>
          Download Latest
        </Button>
        <button onClick={loadHistory} className="text-primary hover:underline font-label-sm text-label-sm">
          {history ? 'Refresh History' : 'View History'}
        </button>
      </div>
      {history && (
        <DataTable
          data={history}
          emptyTitle="No exports generated yet"
          columns={[
            { key: 'format', header: 'Format' },
            { key: 'generatedAt', header: 'Generated', render: (row) => new Date(row.generatedAt).toLocaleString() },
          ]}
        />
      )}
    </div>
  );
}

function SchedulesTab() {
  const [schedules, setSchedules] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ reportDefinitionId: '', frequency: REPORT_SCHEDULE_FREQUENCIES[0], recipient: '', format: 'CSV' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    Promise.all([reportsService.getSchedules(), reportsService.getDefinitions()])
      .then(([schedRes, defRes]) => {
        setSchedules(schedRes.data?.data?.schedules || []);
        setDefinitions(defRes.data?.data?.definitions || []);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await reportsService.createSchedule(form);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create schedule.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this schedule?')) return;
    await reportsService.deleteSchedule(id);
    load();
  }

  return (
    <Card>
      <CardHeader title="Scheduled Exports" description="Automatically generate and email reports on a recurring basis." />
      <div className="p-lg space-y-lg">
        <ErrorBanner>{error}</ErrorBanner>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-md items-end">
          <FormField label="Report">
            <select className={inputClassName} value={form.reportDefinitionId} onChange={(e) => setForm((f) => ({ ...f, reportDefinitionId: e.target.value }))} required>
              <option value="">Select report</option>
              {definitions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Frequency">
            <select className={inputClassName} value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}>
              {REPORT_SCHEDULE_FREQUENCIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Recipient Email">
            <input type="email" className={inputClassName} value={form.recipient} onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))} required />
          </FormField>
          <Button type="submit" loading={saving} icon="schedule_send">Add Schedule</Button>
        </form>
        <DataTable
          loading={loading}
          data={schedules}
          emptyTitle="No scheduled exports"
          columns={[
            { key: 'reportDefinition', header: 'Report', render: (row) => row.reportDefinition?.name },
            { key: 'frequency', header: 'Frequency' },
            { key: 'recipient', header: 'Recipient' },
            { key: 'format', header: 'Format' },
            {
              key: 'actions',
              header: '',
              render: (row) => (
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

export default function ReportsCenter() {
  const { hasPermission } = useAuth();
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [tab, setTab] = useState('reports');

  function load() {
    setLoading(true);
    reportsService.getDefinitions().then((res) => setDefinitions(res.data?.data?.definitions || [])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-headline-lg text-on-surface">Reports Center</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Build, export, and schedule reports. CSV and JSON exports are real files; PDF and Excel
            currently write placeholder content on the backend.
          </p>
        </div>
        {hasPermission('reports:create') && (
          <Button icon="add" onClick={() => setCreateOpen(true)}>New Report</Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-outline-variant">
        <button
          onClick={() => setTab('reports')}
          className={`px-md py-sm font-label-md text-label-md border-b-2 ${tab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
        >
          Reports
        </button>
        {hasPermission('reports:manage') && (
          <button
            onClick={() => setTab('schedules')}
            className={`px-md py-sm font-label-md text-label-md border-b-2 ${tab === 'schedules' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}
          >
            Schedules
          </button>
        )}
      </div>

      {tab === 'reports' ? (
        <div className="space-y-md">
          {loading ? null : definitions.length === 0 ? (
            <Card className="p-xl text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">No reports yet. Create your first one.</p>
            </Card>
          ) : (
            definitions.map((d) => <DefinitionRow key={d.id} definition={d} onChanged={load} />)
          )}
        </div>
      ) : (
        <SchedulesTab />
      )}

      <CreateDefinitionModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={load} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import productsService from '../../services/products';
import supplyChainService, { ATTACHMENT_DOCUMENT_TYPES, EVENT_STATUSES } from '../../services/supplychain';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FormField, { inputClassName } from '../../components/ui/FormField';
import ErrorBanner, { extractErrorMessage } from '../../components/ui/ErrorBanner';
import { useAuth } from '../../context/AuthContext';

function EventCard({ event, onChanged, canChangeStatus, canUpdate, canComment, canAttach }) {
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [showAttachmentForm, setShowAttachmentForm] = useState(false);
  const [attachment, setAttachment] = useState({ documentType: ATTACHMENT_DOCUMENT_TYPES[0], file: null });
  const [error, setError] = useState('');

  async function handleStatusChange(status) {
    setError('');
    try {
      await supplyChainService.updateStatus(event.id, status);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update status.'));
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await supplyChainService.delete(event.id);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not delete event.'));
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await supplyChainService.postComment(event.id, commentText.trim());
      setCommentText('');
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not post comment.'));
    } finally {
      setPosting(false);
    }
  }

  async function handleAddAttachment(e) {
    e.preventDefault();
    if (!attachment.file) return;
    try {
      const formData = new FormData();
      formData.append('documentType', attachment.documentType);
      formData.append('file', attachment.file);
      await supplyChainService.addAttachment(event.id, formData);
      setAttachment({ documentType: ATTACHMENT_DOCUMENT_TYPES[0], file: null });
      setShowAttachmentForm(false);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not add attachment.'));
    }
  }

  const isLocked = event.eventStatus === 'LOCKED';

  return (
    <Card className="p-lg">
      <ErrorBanner>{error}</ErrorBanner>
      <div className="flex items-start justify-between gap-md mb-sm">
        <div>
          <p className="font-label-sm text-label-sm text-primary uppercase tracking-wide">{event.eventType?.name}</p>
          <h4 className="font-headline text-headline-md text-on-surface">{event.title}</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {new Date(event.occurredAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={event.eventStatus} />
          <StatusBadge status={event.blockchainStatus} label={`Ledger: ${event.blockchainStatus}`} />
        </div>
      </div>

      {event.description && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">{event.description}</p>
      )}

      {event.location && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-md flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          {[event.location.village, event.location.cell, event.location.sector, event.location.district, event.location.province, event.location.country]
            .filter(Boolean)
            .join(', ')}
        </p>
      )}

      {event.blockchainTransactionId && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
          Tx: <span className="font-mono">{event.blockchainTransactionId}</span>
        </p>
      )}

      {event.attachments?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-md">
          {event.attachments.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container-low rounded-md font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">attach_file</span>
              {a.fileName}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-md">
        {canChangeStatus && !isLocked && (
          <select
            className="text-label-sm font-label-sm border border-outline-variant rounded-md px-2 py-1 bg-transparent"
            value=""
            onChange={(e) => e.target.value && handleStatusChange(e.target.value)}
          >
            <option value="">Change status…</option>
            {EVENT_STATUSES.filter((s) => s !== event.eventStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        {canUpdate && !isLocked && (
          <button onClick={handleDelete} className="text-error hover:underline font-label-sm text-label-sm">
            Delete Event
          </button>
        )}
        {canAttach && !isLocked && (
          <button
            onClick={() => setShowAttachmentForm((v) => !v)}
            className="text-primary hover:underline font-label-sm text-label-sm"
          >
            {showAttachmentForm ? 'Cancel' : 'Add Attachment'}
          </button>
        )}
      </div>

      {!canChangeStatus && (
        <p className="font-label-sm text-label-sm text-on-surface-variant italic mb-md">
          Status changes require platform administrator confirmation.
        </p>
      )}

      {showAttachmentForm && (
        <form onSubmit={handleAddAttachment} className="flex flex-col sm:flex-row gap-md items-end mb-md p-md bg-surface-container-low rounded-lg">
          <FormField label="Type" className="w-full sm:w-48">
            <select className={inputClassName} value={attachment.documentType} onChange={(e) => setAttachment((a) => ({ ...a, documentType: e.target.value }))}>
              {ATTACHMENT_DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>
          <FormField label="File" className="w-full">
            <input type="file" className={inputClassName} onChange={(e) => setAttachment((a) => ({ ...a, file: e.target.files?.[0] || null }))} />
          </FormField>
          <Button type="submit" disabled={!attachment.file} icon="attach_file">Add</Button>
        </form>
      )}

      <div className="border-t border-outline-variant pt-md space-y-sm">
        {event.comments?.map((c) => (
          <div key={c.id} className="text-body-sm font-body-sm">
            <span className="font-medium text-on-surface">{c.user?.firstName} {c.user?.lastName}: </span>
            <span className="text-on-surface-variant">{c.comment}</span>
          </div>
        ))}
        {canComment && (
          <form onSubmit={handleComment} className="flex gap-sm">
            <input
              className={`${inputClassName} flex-1`}
              placeholder="Add an audit comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button type="submit" variant="secondary" loading={posting} disabled={!commentText.trim()}>
              Post
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}

export default function SupplyChainTimeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [product, setProduct] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      productsService.getById(id),
      productsService.getTimeline(id),
      productsService.getCurrentStage(id),
    ])
      .then(([prodRes, timelineRes, stageRes]) => {
        setProduct(prodRes.data?.data?.product);
        setTimeline(timelineRes.data?.data?.timeline || []);
        setStage(stageRes.data?.data);
      })
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h2 className="font-headline text-headline-lg text-on-surface">
              Supply Chain Timeline — {product?.productName}
            </h2>
            {stage && (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Current stage: <span className="font-medium text-on-surface">{stage.stage}</span>
                {stage.lastUpdated && ` · Updated ${new Date(stage.lastUpdated).toLocaleDateString()}`}
              </p>
            )}
          </div>
          {hasPermission('supply-chain:create') && (
            <Link to={`/supply-chain/events/new?productId=${id}`}>
              <Button icon="add_task">Log Event</Button>
            </Link>
          )}
        </div>
      </div>

      {timeline.length === 0 ? (
        <Card>
          <EmptyState
            icon="account_tree"
            title="No events logged yet"
            description="Start building this product's trace record by logging its first supply chain event."
          />
        </Card>
      ) : (
        <div className="space-y-lg">
          {timeline.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onChanged={load}
              canChangeStatus={hasPermission('supply-chain:lock')}
              canUpdate={hasPermission('supply-chain:update')}
              canComment={hasPermission('supply-chain:comment')}
              canAttach={hasPermission('supply-chain:attachments')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

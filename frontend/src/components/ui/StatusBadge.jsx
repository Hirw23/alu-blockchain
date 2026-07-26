// Maps the many enum status strings used across the schema (Business.status,
// Product.status, SupplyChainEvent.eventStatus, ProductIdentity.qrStatus,
// VerificationEvent.verificationStatus, User.status, etc.) to one consistent pill style.
const SUCCESS = 'bg-secondary-container/40 text-on-secondary-container';
const WARNING = 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
const DANGER = 'bg-error-container text-on-error-container';
const NEUTRAL = 'bg-surface-container-high text-on-surface-variant';

const STATUS_STYLES = {
  VERIFIED: SUCCESS,
  ACTIVE: SUCCESS,
  CONFIRMED: SUCCESS,
  DELIVERED: SUCCESS,
  SUCCESS: SUCCESS,
  ACTIVATED: SUCCESS,
  PRINTED: SUCCESS,

  PENDING: WARNING,
  PENDING_VERIFICATION: WARNING,
  SUBMITTED: WARNING,
  GENERATED: WARNING,
  PROCESSING: WARNING,
  OUT_OF_STOCK: WARNING,

  LOCKED: 'bg-primary-fixed text-on-primary-fixed-variant',

  SUSPENDED: DANGER,
  REJECTED: DANGER,
  FAILED: DANGER,
  REVOKED: DANGER,
  EXPIRED: DANGER,
  INVALID_TOKEN: DANGER,
  DISCONTINUED: DANGER,
  LOCKED_ACCOUNT: DANGER,

  DRAFT: NEUTRAL,
  INACTIVE: NEUTRAL,
  ARCHIVED: NEUTRAL,
};

export default function StatusBadge({ status, label }) {
  const style = STATUS_STYLES[status] || NEUTRAL;
  const text = label || (status ? status.replaceAll('_', ' ') : 'Unknown');
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full font-label-sm text-label-sm font-medium whitespace-nowrap ${style}`}
    >
      {text}
    </span>
  );
}

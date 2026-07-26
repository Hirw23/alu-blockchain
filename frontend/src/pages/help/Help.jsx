import { useState } from 'react';
import Card from '../../components/ui/Card';

const FAQS = [
  {
    q: 'How do I register my business?',
    a: "After creating your account, you'll be guided through business setup: enter your business details, add your address, and upload your registration documents. A platform administrator then reviews and verifies your business before you can register products.",
  },
  {
    q: 'Why can\'t I register a product yet?',
    a: 'Only ACTIVE, VERIFIED businesses can register products. Check your business verification status from Business Management — if it still says Pending, an administrator has not yet approved your documents.',
  },
  {
    q: 'How does QR verification work?',
    a: "Each product can have a digital identity with a unique verification token. Generating a QR code creates a scannable image that links to a public trust page (/verify/:token) showing the product's supply chain history — no login required for whoever scans it.",
  },
  {
    q: 'What happens when I lock a supply chain event?',
    a: 'Locking an event (CONFIRMED or LOCKED status) is only available to a platform administrator, and it freezes the event permanently — it can no longer be edited or deleted, and it queues for anchoring to the blockchain ledger.',
  },
  {
    q: 'Are PDF and Excel report exports real files?',
    a: 'Not yet — the backend currently writes placeholder text for PDF and Excel exports. CSV and JSON exports produce real files you can download and use immediately.',
  },
  {
    q: 'Is email verification and password reset really sent by email?',
    a: 'In this environment, verification and reset tokens are logged to the backend console instead of being emailed by the server — the frontend relays them via a client-side email service during registration and password reset.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-md text-left font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
      >
        {q}
        <span className="material-symbols-outlined">{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div className="p-md pt-0 font-body-sm text-body-sm text-on-surface-variant">{a}</div>
      )}
    </div>
  );
}

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto space-y-lg">
      <div>
        <h2 className="font-headline text-headline-lg text-on-surface">Help &amp; Support</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Answers to common questions about using SupplyChain+.
        </p>
      </div>

      <Card className="p-lg space-y-sm">
        {FAQS.map((faq) => (
          <FaqItem key={faq.q} {...faq} />
        ))}
      </Card>

      <Card className="p-lg text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Need something not covered here? Contact your platform administrator directly — there is
          no in-app support ticketing system yet.
        </p>
      </Card>
    </div>
  );
}

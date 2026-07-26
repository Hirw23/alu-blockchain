import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import qrService from '../../services/qr';

export default function PublicVerify() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    qrService
      .verifyToken(token)
      .then((res) => setResult(res.data?.data))
      .catch(() => setError('Could not reach the verification service. Please try again later.'))
      .finally(() => setLoading(false));
  }, [token]);

  const verified = result?.verificationStatus === 'SUCCESS';

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center px-margin-mobile py-xl">
      <div className="mb-lg flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[28px]">verified_user</span>
        <span className="font-headline text-headline-md font-bold text-primary">SupplyChain+</span>
      </div>

      <div className="w-full max-w-lg">
        {loading ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">Verifying…</p>
          </div>
        ) : error ? (
          <div className="bg-error-container text-on-error-container rounded-xl p-xl text-center">
            <p className="font-body-md text-body-md">{error}</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-md">
            <div className={`p-lg text-center ${verified ? 'bg-secondary-container/30' : 'bg-error-container'}`}>
              <span
                className={`material-symbols-outlined text-[48px] ${verified ? 'text-secondary' : 'text-error'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {verified ? 'verified' : 'gpp_bad'}
              </span>
              <h1 className="font-headline text-headline-lg text-on-surface mt-xs">
                {verified ? 'Authentic Product' : 'Verification Failed'}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{result?.verificationMessage}</p>
            </div>

            {verified && (
              <div className="p-lg space-y-lg">
                <div>
                  <h2 className="font-headline text-headline-md text-on-surface">{result.productName}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {result.categoryName} · Produced in {result.countryOfOrigin}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Producer: <span className="font-medium text-on-surface">{result.businessName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 p-md bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary">account_tree</span>
                  <span className="font-label-md text-label-md text-on-surface">
                    Current stage: {result.currentSupplyChainStage}
                  </span>
                </div>

                {result.blockchainVerified && (
                  <div className="flex items-center gap-2 p-md bg-secondary-container/20 rounded-lg">
                    <span className="material-symbols-outlined text-secondary">hub</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">Ledger Verified</p>
                      {result.blockchainTransactionId && (
                        <p className="font-mono font-label-sm text-label-sm text-on-surface-variant break-all">
                          {result.blockchainTransactionId}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {result.timeline?.length > 0 && (
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide mb-sm">
                      Supply Chain Journey
                    </h3>
                    <div className="space-y-md border-l-2 border-outline-variant pl-md">
                      {result.timeline.map((step, idx) => (
                        <div key={idx}>
                          <p className="font-label-md text-label-md text-on-surface">{step.stage}</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{step.title}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">
                            {new Date(step.occurredAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="font-label-sm text-label-sm text-on-surface-variant mt-xl">
        Secured by SupplyChain+ — tamper-evident product verification.
      </p>
    </div>
  );
}

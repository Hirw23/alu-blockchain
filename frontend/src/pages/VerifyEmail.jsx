import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token is missing from the link.');
        return;
      }

      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (err) {
        console.error(err);
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Verification failed. The token may be expired or invalid.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-md text-center">
      <main className="w-full max-w-[480px]">
        <div className="text-center mb-xl">
          <span className="text-primary font-headline text-headline-md font-bold tracking-tight">SupplyChain+</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg md:p-xl shadow-sm relative">
          <div className="flex flex-col items-center">
            
            {status === 'verifying' && (
              <>
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-md border border-outline-variant">
                  <span className="material-symbols-outlined text-primary text-[28px] animate-spin">progress_activity</span>
                </div>
                <h1 className="font-headline text-headline-md text-on-surface mb-sm">Verifying your email</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Please hold on while we verify your digital identity registration token...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-secondary-container/20 text-secondary rounded-full flex items-center justify-center mb-md border border-secondary/20">
                  <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h1 className="font-headline text-headline-md text-on-surface mb-sm">Email Verified!</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl">
                  Thank you! Your email address has been successfully verified. You can now log in to proceed with your business onboarding.
                </p>
                <Link className="w-full bg-primary text-on-primary font-label-md text-label-md py-md px-lg rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all text-center" to="/login">
                  Log in to your account
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mb-md border border-error/20">
                  <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                </div>
                <h1 className="font-headline text-headline-md text-on-surface mb-sm">Verification Failed</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl">
                  {errorMessage}
                </p>
                <Link className="w-full border border-outline-variant text-on-surface font-label-md text-label-md py-md px-lg rounded-lg hover:bg-surface-container-low transition-colors block text-center" to="/login">
                  Back to Login
                </Link>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

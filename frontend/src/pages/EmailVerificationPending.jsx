import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function EmailVerificationPending() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = () => {
    setLoading(true);
    // Simulate/Trigger resend logic (can hook up to backend in future if resend endpoint exists)
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      setTimeout(() => setSent(false), 4000);
    }, 1500);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-lg py-xl">
        <div className="max-w-[480px] w-full">
          <div className="text-center mb-xl">
            <span className="text-primary font-headline text-headline-md font-bold tracking-tight">SupplyChain+</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg md:p-xl shadow-sm overflow-hidden relative text-center">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-fixed opacity-20 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col items-center">
              
              {/* Envelope Floating Illustration */}
              <div className="w-48 h-48 mb-lg flex items-center justify-center animate-bounce duration-[3000ms]">
                <img 
                  className="w-full h-full object-contain" 
                  alt="Envelope illustration" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu8q6JfYzz_H0kDPF5cLXVpt1_e5xxj4NinMugRuzn_wtFXr5ORS-YyhtuJztcmLCncSF-TKiOIknSRRzlhf1FYG4jgLf3cRjUBobE0H0Bdgi4O2ceXX60PA8g9daQ8uGWUXXboTtNUtk3w-O8iRDvzT_6iWMTXFRAxuOeO0vkuvZzkxLRVPPK5eMA-358Lpki1LAvL0kpAPrNfEZgOqVp0qgb47Vbm_g0A-Ids9f3U-wUwsm2C3wQfp15ZqKIUhr957XatUnA3Lk"
                />
              </div>

              <h1 className="font-headline text-headline-md text-on-surface mb-sm">Check your email</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-xl px-sm">
                We've sent a verification link to your email address. Please click the link in the message to activate your account.
              </p>

              <div className="w-full space-y-md">
                <button 
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-md px-lg rounded-lg transition-all flex items-center justify-center gap-sm shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50"
                  onClick={handleResend}
                  disabled={loading}
                >
                  <span className="material-symbols-outlined text-[20px]">forward_to_inbox</span>
                  {loading ? 'Resending...' : 'Resend Email'}
                </button>
                {sent && (
                  <div className="font-label-sm text-label-sm text-secondary animate-pulse">
                    A new link has been sent!
                  </div>
                )}
              </div>

              <div className="mt-xl pt-lg border-t border-outline-variant w-full flex flex-col gap-md">
                <Link className="inline-flex items-center justify-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" to="/login">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Login
                </Link>
              </div>

            </div>
          </div>

          <div className="mt-lg text-center">
            <p className="font-body-sm text-body-sm text-outline">
              Didn't receive anything? Check your spam folder or contact <a className="text-primary hover:underline" href="#">Support</a>.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-lg px-lg border-t border-outline-variant bg-surface-container-low mt-auto">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="font-label-sm text-label-sm text-on-surface-variant">
            © 2024 SupplyChain+. Industrial Integrity in every block.
          </div>
          <div className="flex gap-lg">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

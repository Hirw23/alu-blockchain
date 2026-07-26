import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { sendPasswordResetEmail } from '../utils/email';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      const { resetToken } = response.data.data || {};
      
      if (resetToken) {
        await sendPasswordResetEmail(email, email, resetToken);
      } else {
        console.warn('Backend did not return resetToken. Cannot dispatch EmailJS notification.');
      }
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <main className="relative z-10 w-full max-w-[440px] px-margin-mobile">
        
        {/* Branding header */}
        <div className="flex justify-center mb-xl">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[32px]">hub</span>
            <span className="text-headline-md font-headline font-bold text-primary tracking-tight">SupplyChain+</span>
          </div>
        </div>

        {/* Form state */}
        {!success ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg md:p-xl shadow-sm text-left">
            <div className="text-center mb-xl">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-md border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-[28px]">lock_reset</span>
              </div>
              <h1 className="font-headline text-headline-md text-on-surface mb-sm">Reset your password</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="p-md mb-md bg-error-container text-on-error-container rounded-lg border border-error/20 font-body-sm text-body-sm">
                {error}
              </div>
            )}

            <form className="space-y-lg" onSubmit={handleSubmit}>
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant block ml-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-md font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200" 
                    id="email" 
                    name="email" 
                    placeholder="name@company.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button 
                className="w-full bg-primary text-on-primary font-label-md text-label-md h-12 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm shadow-md disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            <div className="mt-xl text-center">
              <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-xs" to="/login">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg md:p-xl shadow-lg text-center">
            <div className="w-16 h-16 bg-secondary-container/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-md border border-secondary/20">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="font-headline text-headline-md text-on-surface mb-sm">Check your email</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl">
              We've sent a password reset link to <span className="font-medium text-on-surface">{email}</span> if it is registered in our platform. Please check your inbox and spam folder.
            </p>
            <button 
              className="w-full border border-outline-variant text-on-surface font-label-md text-label-md h-12 rounded-lg hover:bg-surface-container-low transition-colors" 
              onClick={() => setSuccess(false)}
            >
              Didn't receive it? Try another address
            </button>
          </div>
        )}

        <div className="mt-xl flex flex-col items-center gap-sm text-center">
          <p className="font-label-sm text-label-sm text-outline">
            © 2024 SupplyChain+. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}

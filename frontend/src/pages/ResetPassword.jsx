import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState({ score: 0, text: 'Enter a password' });
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const checkStrength = (val) => {
    let score = 0;
    if (!val) {
      setStrength({ score: 0, text: 'Enter a password' });
      return;
    }
    if (val.length > 5) score++;
    if (val.length > 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const texts = ['Weak password', 'Weak password', 'Fair password', 'Strong password', 'Very strong password'];
    setStrength({ score, text: texts[score] });
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    checkStrength(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from the link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthBarClass = (index) => {
    const defaultClass = "h-[4px] flex-1 rounded-sm transition-all ";
    if (index >= strength.score) return defaultClass + "bg-outline-variant";

    const colors = ['bg-error', 'bg-tertiary', 'bg-secondary', 'bg-secondary'];
    return defaultClass + colors[strength.score - 1];
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-lg h-16 max-w-container-max mx-auto bg-surface-container-lowest border-b border-outline-variant">
        <div className="flex items-center gap-sm">
          <span className="text-headline-md font-headline font-bold text-primary">SupplyChain+</span>
        </div>
        <div className="flex items-center gap-md">
          <Link className="font-label-md text-label-md text-primary hover:underline" to="/login">Login</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-20 px-margin-mobile md:px-lg">
        <div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant text-left">
          
          {/* Left Side: Info */}
          <div className="hidden md:flex flex-col justify-between p-xl bg-surface-container-low relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-headline text-headline-lg text-on-surface mb-md">Industrial Integrity</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Secure your node. Our blockchain-backed ledger ensures that every credential update is verified and immutable.
              </p>
            </div>
            <div className="mt-xl relative z-10">
              <div className="flex items-center gap-sm mb-lg">
                <div className="p-base bg-primary-container rounded-lg text-white">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface">SOC2 Type II Certified</span>
              </div>
            </div>
            {/* Crystalline rendering placeholder */}
            <div 
              className="absolute bottom-0 right-0 w-64 h-64 opacity-10 bg-cover" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAL44V1DLaPUsMYH3qfyck0teYZ1tN7LQbZd4mUQl33MNhZ8RfIlQNDFVSu4wWKKsy9-9BpBRvuFzpS7SeJkftNU9--x0Dwi54oF5gw5uDVPzW-k4b3j1Zl4mYyQOjkx2nPJrDWQE8PmDTv9MjKsBB3-Y0Vn7KG2rmmCJasScUxKvqnN8EaXO4zBAqUJ-RglqdZqto2xPAijUwQRscsyUUI3IfUPXvOpZeP-VIWuOl9tB8ScJJBZ4B6BazYVTpXF3WWm0_UEBk5PtA')" }}
            ></div>
          </div>

          {/* Right Side: Form */}
          <div className="p-xl md:p-16 flex flex-col justify-center">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary-container/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-md border border-secondary/20">
                  <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h1 className="font-headline text-headline-lg text-on-surface mb-xs">Password Set!</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Your password has been successfully updated. Redirecting to login...
                </p>
              </div>
            ) : (
              <>
                <div className="mb-xl">
                  <h1 className="font-headline text-headline-lg text-on-surface mb-xs">Set new password</h1>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Ensure your new password is unique and at least 6 characters long.</p>
                </div>

                {error && (
                  <div className="p-md mb-md bg-error-container text-on-error-container rounded-lg border border-error/20 font-body-sm text-body-sm">
                    {error}
                  </div>
                )}

                <form className="space-y-lg" onSubmit={handleSubmit}>
                  {/* New Password */}
                  <div className="space-y-xs">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">New Password</label>
                    <div className="relative">
                      <input 
                        className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-on-surface font-body-md outline-none" 
                        id="password" 
                        required
                        placeholder="••••••••••••" 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                      />
                      <button 
                        className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface" 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {/* Strength bars */}
                    <div className="pt-base space-y-xs">
                      <div className="flex gap-xs">
                        <div className={getStrengthBarClass(0)}></div>
                        <div className={getStrengthBarClass(1)}></div>
                        <div className={getStrengthBarClass(2)}></div>
                        <div className={getStrengthBarClass(3)}></div>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">{strength.text}</span>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-xs">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="confirm_password">Confirm Password</label>
                    <div className="relative">
                      <input 
                        className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-on-surface font-body-md outline-none" 
                        id="confirm_password" 
                        required
                        placeholder="••••••••••••" 
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button 
                        className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface" 
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        <span className="material-symbols-outlined text-[20px]">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-md">
                    <button 
                      className="w-full py-md px-lg bg-primary text-white font-label-md text-label-md rounded-lg hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-50" 
                      type="submit"
                      disabled={loading}
                    >
                      <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </form>

                <div className="mt-xl text-center">
                  <Link className="font-label-sm text-label-sm text-primary hover:underline transition-all inline-flex items-center gap-xs" to="/login">
                    <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                    Back to secure login
                  </Link>
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

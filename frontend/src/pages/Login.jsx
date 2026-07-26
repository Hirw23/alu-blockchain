import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      // The backend response field is `accessToken` (see authService.login), not `token` —
      // destructuring `token` here silently stored `undefined`, so no one could actually stay
      // logged in past this point (every subsequent authenticated request 401'd and bounced
      // back to /login via the response interceptor's refresh-failure handler).
      const { accessToken, refreshToken, user: rawUser } = response.data.data;

      // The API returns `role` as a nested object ({ id, name, ... }), not a plain string —
      // normalize it here so every downstream consumer of the stored `user` (AuthContext,
      // Sidebar, dashboards) can rely on `user.role` always being the role name string.
      const user = { ...rawUser, role: rawUser.role?.name || rawUser.role };

      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));
      // AuthContext only re-reads localStorage on mount or on a cross-tab 'storage' event —
      // neither fires for a write made by this same tab, so without this the Sidebar/Dashboard
      // would render with a stale (null) role immediately after login until a hard reload.
      refreshUser();

      // After login, check if Entrepreneur needs onboarding
      if (user.role === 'Entrepreneur') {
        try {
          const bizResponse = await api.get('/businesses/me');
          // GET /businesses/me responds with { data: { items: [...] } }, not a bare array.
          const businesses = bizResponse.data.data?.items || [];
          if (businesses.length === 0) {
            navigate('/onboarding/business-setup');
            return;
          }

          const business = businesses[0];
          if (business.status === 'DRAFT' || business.verificationStatus === 'PENDING') {
            // Check if documents are uploaded
            const docsRes = await api.get(`/businesses/${business.id}/documents`);
            // GET /businesses/:id/documents responds with { data: { documents: [...] } }.
            const hasDocs = (docsRes.data.data?.documents || []).length > 0;
            if (!hasDocs) {
              navigate(`/onboarding/documents-upload/${business.id}`);
            } else {
              navigate('/onboarding/pending-approval');
            }
            return;
          }
        } catch (bizErr) {
          // If we fail to fetch business, redirect to onboarding to be safe
          navigate('/onboarding/business-setup');
          return;
        }
      }

      // Default redirect
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen w-full flex items-center justify-center p-md md:p-0">
      <main className="w-full max-w-container-max mx-auto md:h-screen flex items-center justify-center">
        <div className="flex flex-col md:flex-row w-full h-full max-h-[850px] overflow-hidden bg-surface-container-lowest md:rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-2px_rgba(0,0,0,0.05)] border border-outline-variant">
          
          {/* Left Side: Form Section */}
          <section className="w-full md:w-1/2 flex flex-col justify-center px-lg py-xl md:px-xl lg:px-24">
            <div className="mb-xl">
              <h1 className="font-headline text-headline-md text-primary font-bold mb-xs">SupplyChain+</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Industrial integrity in every block.</p>
            </div>
            <div className="mb-lg">
              <h2 className="font-headline text-headline-lg text-on-surface mb-xs">Welcome back</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Please enter your credentials to access your node.</p>
            </div>

            {error && (
              <div className="p-md mb-md bg-error-container text-on-error-container rounded-lg border border-error/20 font-body-sm text-body-sm text-left">
                {error}
              </div>
            )}

            <form className="space-y-lg text-left" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant block" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input 
                    className="w-full pl-10 pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" 
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

              {/* Password Field */}
              <div className="space-y-xs">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm text-label-sm text-on-surface-variant block" htmlFor="password">Password</label>
                  <Link className="font-label-sm text-label-sm text-primary hover:underline transition-all" to="/forgot-password">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input 
                    className="w-full pl-10 pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-sm">
                <input 
                  className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary-container focus:ring-offset-0" 
                  id="remember" 
                  name="remember" 
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember Me</label>
              </div>

              {/* Login Button */}
              <button 
                className="w-full bg-primary text-on-primary py-md rounded-lg font-label-md text-label-md hover:opacity-90 transition-all active:scale-95 flex items-center justify-center space-x-sm shadow-sm disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Logging in...' : 'Login'}</span>
                <span className="material-symbols-outlined text-[18px]">login</span>
              </button>
            </form>

            <div className="mt-xl pt-lg border-t border-outline-variant text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Don't have an account? <Link className="text-primary font-medium hover:underline" to="/register">Sign Up</Link>
              </p>
            </div>
            <div className="mt-xl flex items-center justify-center space-x-md text-outline">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest">Enterprise Grade Security</span>
            </div>
          </section>

          {/* Right Side: Illustration Section */}
          <section className="hidden md:block md:w-1/2 relative bg-surface-container-low overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay z-10"></div>
            <div className="w-full h-full flex flex-col items-center justify-center relative p-xl">
              <div className="w-full h-full rounded-lg overflow-hidden relative border border-outline-variant/30">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDe4CkdwH2UIhCXKFptchvgaoY05qfAFSJJq9J6ZMHvw6TPcpaCzHK7p97d4HOBaMDnIvjTzqFPzcGGgoqfKLbJ_Za8xhrwnZmi-brvcL92vrtW9_vsfUrEDCPd76usf1KzdKY4CmzNPvInKgloZLO-j5VXHouT4CeI0sAOLYqDGAUr6H3xvqkdvd-CPRe-LnzQe7InFzEUPur9f6mAPrV1d6KoUoFHmG1nTlwT7xVNsVj2H5mPU32ijRET4kL61-3-JWO3Z6ox9ek')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent text-white flex flex-col justify-end p-xl text-left">
                  <div className="max-w-md">
                    <div className="flex items-center space-x-sm mb-sm text-primary-fixed">
                      <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider">Trusted by Industry Leaders</span>
                    </div>
                    <h3 className="font-headline text-headline-md mb-xs">Next-Gen Transparency</h3>
                    <p className="font-body-sm text-body-sm opacity-90">Experience the reliability of traditional enterprise software with the velocity of modern blockchain tools.</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Data Pill */}
              <div className="absolute top-10 right-10 bg-surface-container-lowest/90 backdrop-blur-md p-md rounded-xl border border-outline-variant shadow-lg z-20 flex items-center space-x-sm text-left">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant leading-none">Shipment Verified</p>
                  <p className="font-headline text-[16px] text-on-surface font-bold">#SC-82910-X</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

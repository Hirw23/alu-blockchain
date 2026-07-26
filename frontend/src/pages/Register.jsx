import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { sendVerificationEmail } from '../utils/email';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!terms) {
      setError('You must agree to the Terms of Service and Data Integrity Policy.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        phoneNumber: phoneNumber || undefined,
      });

      const { user } = response.data.data;
      
      // If the backend has been updated to return the verification token, send the email
      if (user && user.verificationToken) {
        await sendVerificationEmail(user.email, `${user.firstName} ${user.lastName}`, user.verificationToken);
      } else {
        console.warn('Backend did not return verificationToken. Cannot dispatch EmailJS notification.');
      }

      // Redirect to check email notice
      navigate('/verify-email-notice');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-container-max mx-auto h-16 px-lg flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <span className="text-headline-md font-headline font-bold text-primary">SupplyChain+</span>
          </div>
          <div className="flex items-center gap-md">
            <span className="font-label-sm text-label-sm text-on-surface-variant hidden md:block">Already have an account?</span>
            <Link className="font-label-md text-label-md text-primary hover:underline" to="/login">Login</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 flex flex-col items-center justify-start">
        {/* Simplified Progress Indicator: Step 1 (Register Account) */}
        <section className="w-full max-w-4xl px-lg mt-md mb-xl">
          <div className="relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-outline-variant -z-10"></div>
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center gap-base">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shadow-sm">
                  1
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold">Personal Info</span>
              </div>
              <div className="flex flex-col items-center gap-base opacity-40">
                <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant flex items-center justify-center font-label-md text-label-md">
                  2
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Business Info</span>
              </div>
              <div className="flex flex-col items-center gap-base opacity-40">
                <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant flex items-center justify-center font-label-md text-label-md">
                  3
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Verification</span>
              </div>
              <div className="flex flex-col items-center gap-base opacity-40">
                <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant flex items-center justify-center font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Complete</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Registration Form Card */}
        <div className="w-full max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter px-lg pb-xl">
          {/* Left Side: Form Content */}
          <div className="md:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm text-left">
            <div className="mb-lg">
              <h1 className="font-headline text-headline-lg text-on-surface mb-xs">Welcome to the Network</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Step 1: Tell us about yourself. This helps us personalize your node experience and secure your digital identity.
              </p>
            </div>

            {error && (
              <div className="p-md mb-md bg-error-container text-on-error-container rounded-lg border border-error/20 font-body-sm text-body-sm">
                {error}
              </div>
            )}

            <form className="space-y-lg" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="firstName">First Name</label>
                  <input 
                    className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                    id="firstName" 
                    placeholder="e.g. Alexander" 
                    required 
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="lastName">Last Name</label>
                  <input 
                    className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                    id="lastName" 
                    placeholder="e.g. Sterling" 
                    required 
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">Work Email</label>
                  <input 
                    className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                    id="email" 
                    placeholder="alex@enterprise.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="phone">Phone Number</label>
                  <input 
                    className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                    id="phone" 
                    placeholder="+1 (555) 000-0000" 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">Password</label>
                <input 
                  className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                  id="password" 
                  placeholder="At least 6 characters" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-md p-md bg-surface-container-low rounded-lg border border-outline-variant/50">
                <div className="mt-0.5">
                  <input 
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" 
                    id="terms" 
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                  />
                </div>
                <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="terms">
                  I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Data Integrity Policy</a>. I understand my data will be handled according to enterprise-grade security standards.
                </label>
              </div>

              <div className="pt-md flex items-center justify-between">
                <Link className="px-lg py-sm font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" to="/login">
                  Cancel
                </Link>
                <button 
                  className="bg-primary text-on-primary px-xl py-sm rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Register & Continue'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Bento Promotional Content */}
          <div className="md:col-span-5 flex flex-col gap-gutter text-left">
            <div className="relative h-64 rounded-xl overflow-hidden shadow-sm group">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLLbr_qXGUjfA8f8JQH2m-MX_IX6DmzwxXMHX4ODtMowY42I-ThUK9lYyfYXogdxBo70RXT2jubUA8TKX7XCSwYNm4pxdOYK9afq40M3lUZh7wNwUizyb62JNOw-wLA3JVtEveK_6cEuY0RaXxNvpQMaUn4X21E7ClScRIXpN-VrM10nUXVsc3gpbpBfoWiL-Bsf4lvIZ0A5CuHOZ-6wPvId-unsbyQbg3jYW6hYxHqt08aI5FCKQCZYTBziBfMp7xDwhXS_wEW2E')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-md left-md right-md text-white">
                <h3 className="font-headline text-headline-md mb-xs">Trusted by 5,000+ Enterprises</h3>
                <p className="font-body-sm text-body-sm opacity-90">Join the world's most transparent supply chain network.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary mb-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <h4 className="font-label-md text-label-md text-on-surface mb-xs">Bank-Grade Security</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Your information is encrypted with AES-256 protocols.</p>
              </div>
              <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary mb-sm" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
                <h4 className="font-label-md text-label-md text-on-surface mb-xs">Fast Verification</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Most accounts are verified within 24 business hours.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-xl px-lg border-t border-outline-variant bg-surface-container-low mt-auto">
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

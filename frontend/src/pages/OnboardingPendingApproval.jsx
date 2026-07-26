import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function OnboardingPendingApproval() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('PENDING');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/businesses/me');
        if (res.data.data && res.data.data.items && res.data.data.items.length > 0) {
          const business = res.data.data.items[0];
          setStatus(business.verificationStatus);
          
          if (business.verificationStatus === 'VERIFIED' || business.status === 'ACTIVE') {
            // Once approved, route user to dashboard
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Failed to query onboarding verification status:', err);
      }
    };

    // Poll status every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, [navigate]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await api.get('/businesses/me');
      if (res.data.data && res.data.data.items && res.data.data.items.length > 0) {
        const business = res.data.data.items[0];
        setStatus(business.verificationStatus);
        if (business.verificationStatus === 'VERIFIED' || business.status === 'ACTIVE') {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-container-max mx-auto h-16 px-lg flex items-center justify-between">
          <span className="text-headline-md font-headline font-bold text-primary">SupplyChain+</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Account Status</span>
        </div>
      </header>

      <main className="flex-grow pt-24 flex items-center justify-center px-margin-mobile md:px-lg py-xl">
        <div className="max-w-[540px] w-full">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg md:p-xl shadow-sm text-center">
            
            <div className="w-20 h-20 bg-surface-container-low text-primary rounded-full flex items-center justify-center mx-auto mb-md border border-outline-variant relative">
              <span className="material-symbols-outlined text-[36px] animate-pulse">lock_clock</span>
            </div>

            <h1 className="font-headline text-headline-md text-on-surface mb-sm">Verification In Progress</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              We have received your corporate details and documentation. The system is verifying your information against standard registration criteria.
            </p>

            <div className="p-md mb-xl bg-surface-container-low rounded-lg border border-outline-variant/50 text-left font-body-sm text-body-sm space-y-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Node Registration:</span>
                <span className="text-secondary font-bold">SUBMITTED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Verification Status:</span>
                <span className="text-primary font-bold">{status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant font-medium">Average Processing:</span>
                <span className="text-on-surface">Within 24 business hours</span>
              </div>
            </div>

            <button 
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-md px-lg rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-sm disabled:opacity-50"
              onClick={handleRefresh}
              disabled={loading}
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              {loading ? 'Checking status...' : 'Check Verification Status'}
            </button>

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

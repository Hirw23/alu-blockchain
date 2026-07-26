import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function OnboardingBusinessSetup() {
  // Business fields
  const [businessName, setBusinessName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [description, setDescription] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [industry, setIndustry] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [taxIdentificationNumber, setTaxIdentificationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Address fields
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [cell, setCell] = useState('');
  const [village, setVillage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Business
      const bizRes = await api.post('/businesses', {
        businessName,
        tradingName,
        description: description || undefined,
        businessType,
        industry,
        registrationNumber,
        taxIdentificationNumber,
        email,
        phoneNumber,
      });

      // POST /businesses responds with { data: { business: {...} } }, not a bare business object.
      const businessId = bizRes.data.data.business.id;

      // 2. Create Address
      await api.post(`/businesses/${businessId}/address`, {
        country,
        province,
        district,
        sector,
        cell,
        village,
      });

      // 3. Navigate to document upload step
      navigate(`/onboarding/documents-upload/${businessId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit business details. Please check the fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-container-max mx-auto h-16 px-lg flex items-center justify-between">
          <span className="text-headline-md font-headline font-bold text-primary">SupplyChain+</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Authenticated Onboarding</span>
        </div>
      </header>

      <main className="flex-grow pt-24 flex flex-col items-center justify-start pb-xl">
        {/* Progress Indicator: Step 2 (Business Info) */}
        <section className="w-full max-w-4xl px-lg mt-md mb-xl">
          <div className="relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-outline-variant -z-10"></div>
            <div className="absolute top-5 left-0 w-1/2 h-0.5 bg-primary -z-10"></div>
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center gap-base">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Personal Info</span>
              </div>
              <div className="flex flex-col items-center gap-base">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shadow-lg">
                  2
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold">Business Info</span>
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

        {/* Main Onboarding Card */}
        <div className="w-full max-w-container-max mx-auto px-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm text-left">
            <div className="mb-lg">
              <h1 className="font-headline text-headline-lg text-on-surface mb-xs">Setup Your Business Node</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Please register your company details and physical operating address below to establish your node profile.
              </p>
            </div>

            {error && (
              <div className="p-md mb-md bg-error-container text-on-error-container rounded-lg border border-error/20 font-body-sm text-body-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-xl">
              {/* Section 1: Corporate Profile */}
              <div>
                <h3 className="font-headline text-headline-md border-b border-outline-variant pb-xs mb-md text-primary">Corporate Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="bizName">Registered Business Name</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="bizName" required placeholder="e.g. AgriTrade Ltd" type="text"
                      value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="tradName">Trading Name / Brand</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="tradName" required placeholder="e.g. AgriTrade" type="text"
                      value={tradingName} onChange={(e) => setTradingName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="bizType">Business Type</label>
                    <select 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm"
                      id="bizType" required value={businessType} onChange={(e) => setBusinessType(e.target.value)}
                    >
                      <option value="">Select type</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Limited Liability Company (LLC)">LLC</option>
                      <option value="Cooperative">Cooperative</option>
                      <option value="Corporation">Corporation</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="industry">Industry</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="industry" required placeholder="e.g. Agriculture, Logistics" type="text"
                      value={industry} onChange={(e) => setIndustry(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="regNum">Official Registration Number</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="regNum" required placeholder="e.g. RC-99102-X" type="text"
                      value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="tin">Tax Identification Number (TIN)</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="tin" required placeholder="e.g. TIN-8820-A" type="text"
                      value={taxIdentificationNumber} onChange={(e) => setTaxIdentificationNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="bizEmail">Business Email</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="bizEmail" required placeholder="contact@agritrade.com" type="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="bizPhone">Business Phone</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="bizPhone" required placeholder="+1 (555) 000-0000" type="text"
                      value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-xs mt-md">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="desc">Business Description</label>
                  <textarea 
                    className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                    id="desc" placeholder="Briefly describe your business operation..." rows="3"
                    value={description} onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 2: Operating Address */}
              <div>
                <h3 className="font-headline text-headline-md border-b border-outline-variant pb-xs mb-md text-primary">Operating Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="country">Country</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="country" required placeholder="e.g. Rwanda" type="text"
                      value={country} onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="province">Province / Region</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="province" required placeholder="e.g. Kigali Province" type="text"
                      value={province} onChange={(e) => setProvince(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="district">District</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="district" required placeholder="e.g. Gasabo" type="text"
                      value={district} onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-md mt-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="sector">Sector</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="sector" required placeholder="e.g. Kacyiru" type="text"
                      value={sector} onChange={(e) => setSector(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="cell">Cell</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="cell" required placeholder="e.g. Kamatamu" type="text"
                      value={cell} onChange={(e) => setCell(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="village">Village</label>
                    <input 
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                      id="village" required placeholder="e.g. Umucyo" type="text"
                      value={village} onChange={(e) => setVillage(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-md flex justify-end">
                <button 
                  className="bg-primary text-on-primary px-xl py-md rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50" 
                  type="submit" disabled={loading}
                >
                  {loading ? 'Submitting Details...' : 'Save & Continue to Documents'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

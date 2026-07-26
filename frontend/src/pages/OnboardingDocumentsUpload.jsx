import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function OnboardingDocumentsUpload() {
  const { id } = useParams(); // Business ID
  const navigate = useNavigate();

  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!documentType || !selectedFile) {
      setError('Please select both a document type and a file.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('file', selectedFile);

      const response = await api.post(`/businesses/${id}/documents`, formData);

      const newDoc = response.data.data.document;
      setUploadedDocs([...uploadedDocs, newDoc]);
      setSuccessMsg('Document uploaded successfully!');
      setSelectedFile(null);
      setDocumentType('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (uploadedDocs.length === 0) {
      setError('Please upload at least one verification document before completing.');
      return;
    }

    setLoading(true);
    try {
      // Update business status to SUBMITTED / PENDING_VERIFICATION
      await api.patch(`/businesses/${id}/status`, {
        status: 'PENDING_VERIFICATION',
      });
      navigate('/onboarding/pending-approval');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update business status.');
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
        {/* Progress Indicator: Step 3 (Verification) */}
        <section className="w-full max-w-4xl px-lg mt-md mb-xl">
          <div className="relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-outline-variant -z-10"></div>
            <div className="absolute top-5 left-0 w-3/4 h-0.5 bg-primary -z-10"></div>
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center gap-base">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Personal Info</span>
              </div>
              <div className="flex flex-col items-center gap-base">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Business Info</span>
              </div>
              <div className="flex flex-col items-center gap-base">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shadow-lg animate-pulse">
                  3
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold">Verification</span>
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

        {/* Form Container */}
        <div className="w-full max-w-4xl px-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm text-left">
            <div className="mb-lg">
              <h1 className="font-headline text-headline-lg text-on-surface mb-xs">Upload Verification Documents</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Upload your business registration credentials or identification cards. These files will be audited securely to verify your node operations.
              </p>
            </div>

            {error && (
              <div className="p-md mb-md bg-error-container text-on-error-container rounded-lg border border-error/20 font-body-sm text-body-sm">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-md mb-md bg-secondary-container/10 text-secondary rounded-lg border border-secondary/20 font-body-sm text-body-sm">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleAddDocument} className="space-y-lg mb-xl p-lg bg-surface-container-low rounded-xl border border-outline-variant/30">
              <h3 className="font-headline text-[18px] text-on-surface font-semibold">Add Document</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="docType">Document Type</label>
                  <select 
                    className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm"
                    id="docType" required value={documentType} onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="">Select type</option>
                    <option value="Registration Certificate">Registration Certificate</option>
                    <option value="Tax Certificate">Tax Certificate</option>
                    <option value="Business Permit">Business Permit</option>
                    <option value="National ID">National ID</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="fileInput">Choose File (PDF or Image)</label>
                  <input 
                    className="w-full px-md py-1 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-sm text-body-sm" 
                    id="fileInput" required type="file" accept=".pdf,image/*" onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-sm">
                <button 
                  className="bg-primary-container text-primary border border-primary/20 px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-primary hover:text-white transition-all shadow-sm disabled:opacity-50"
                  type="submit" disabled={loading}
                >
                  {loading ? 'Adding Document...' : 'Add Document'}
                </button>
              </div>
            </form>

            {/* List of uploaded documents */}
            {uploadedDocs.length > 0 && (
              <div className="mb-lg text-left">
                <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-sm">Uploaded Documents</h4>
                <ul className="divide-y divide-outline-variant border border-outline-variant rounded-lg overflow-hidden bg-surface-container-lowest">
                  {uploadedDocs.map((doc, idx) => (
                    <li key={idx} className="flex justify-between items-center p-md">
                      <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-primary">description</span>
                        <div>
                          <p className="font-label-sm text-label-sm text-on-surface font-medium">{doc.documentType}</p>
                          <p className="font-body-sm text-xs text-on-surface-variant">{doc.fileName}</p>
                        </div>
                      </div>
                      <span className="px-sm py-0.5 rounded-full font-label-sm text-[10px] uppercase tracking-wider bg-surface-container-high text-on-surface-variant border border-outline-variant">
                        {doc.verificationStatus || 'PENDING'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-md border-t border-outline-variant flex justify-between items-center">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {uploadedDocs.length === 0 ? 'Upload at least one document to proceed' : `${uploadedDocs.length} document(s) ready`}
              </span>
              <button 
                className="bg-primary text-on-primary px-xl py-md rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
                onClick={handleComplete} disabled={loading || uploadedDocs.length === 0}
              >
                {loading ? 'Submitting Registration...' : 'Submit Node for Verification'}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// Extracted verbatim from the pattern already copy-pasted across Register.jsx, ForgotPassword.jsx,
// ResetPassword.jsx, OnboardingBusinessSetup.jsx, OnboardingDocumentsUpload.jsx.
export default function ErrorBanner({ children, className = '' }) {
  if (!children) return null;
  return (
    <div
      className={`p-md mb-md bg-error-container text-on-error-container rounded-lg border border-error/20 font-body-sm text-body-sm text-left ${className}`}
    >
      {children}
    </div>
  );
}

export function extractErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.message).join(', ');
  }
  return data?.message || fallback;
}

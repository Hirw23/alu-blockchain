// Extracts the 3x-duplicated step-indicator markup from Register.jsx / OnboardingBusinessSetup.jsx
// / OnboardingDocumentsUpload.jsx into one shared component.
export default function Stepper({ steps, currentStep }) {
  return (
    <ol className="flex items-center w-full mb-xl">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isComplete = stepNum < currentStep;
        return (
          <li key={label} className={`flex items-center ${idx !== steps.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-label-sm text-label-sm font-bold border-2 shrink-0 ${
                  isComplete
                    ? 'bg-primary border-primary text-on-primary'
                    : isActive
                      ? 'border-primary text-primary bg-surface-container-lowest'
                      : 'border-outline-variant text-outline bg-surface-container-lowest'
                }`}
              >
                {isComplete ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`mt-xs font-label-sm text-label-sm text-center whitespace-nowrap ${
                  isActive || isComplete ? 'text-on-surface' : 'text-on-surface-variant'
                }`}
              >
                {label}
              </span>
            </div>
            {idx !== steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-sm ${isComplete ? 'bg-primary' : 'bg-outline-variant'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

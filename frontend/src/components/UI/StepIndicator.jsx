const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center mb-4 px-4">
    {[1, 2, 3].map((step) => (
      <div key={step} className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {step}
        </div>
        {step < 3 && (
          <div
            className={`w-8 h-0.5 mx-2 ${
              step < currentStep ? "bg-blue-500" : "bg-gray-200"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

export default StepIndicator;

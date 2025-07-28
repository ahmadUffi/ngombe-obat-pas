import React from "react";

const LoadingSpinner = ({ size = "md", color = "blue" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colorClasses = {
    blue: "border-blue-500",
    green: "border-green-500",
    orange: "border-orange-500",
    purple: "border-purple-500",
    gray: "border-gray-500",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          animate-spin rounded-full border-4 border-gray-200 
          ${sizeClasses[size]} ${colorClasses[color]}
        `}
        style={{ borderTopColor: "transparent" }}
      />
    </div>
  );
};

const LoadingCard = ({ title = "Memuat data..." }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <LoadingSpinner size="lg" color="blue" />
        <p className="text-gray-600 mt-4 font-medium">{title}</p>
        <p className="text-gray-400 text-sm mt-1">Mohon tunggu sebentar...</p>
      </div>
    </div>
  </div>
);

const LoadingStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[1, 2, 3, 4].map((item) => (
      <div
        key={item}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export { LoadingSpinner, LoadingCard, LoadingStats };
export default LoadingSpinner;

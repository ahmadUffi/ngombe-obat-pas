import React from "react";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Ngompas</h1>
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="flex justify-center items-center space-x-2">
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>

        {/* Loading Message */}
        <p className="text-gray-600 text-lg">{message}</p>

        {/* Progress Bar */}
        <div className="mt-4 w-64 mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full animate-pulse"
              style={{
                width: "70%",
                animation: "loading-progress 2s ease-in-out infinite",
              }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-progress {
          0% {
            width: 20%;
          }
          50% {
            width: 80%;
          }
          100% {
            width: 20%;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;

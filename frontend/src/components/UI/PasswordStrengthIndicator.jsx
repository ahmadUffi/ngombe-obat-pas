import React from "react";
import { getPasswordStrengthProps } from "../../utils/passwordValidation";

const PasswordStrengthIndicator = ({
  password,
  showText = true,
  className = "",
}) => {
  const { percentage, color, text, textColor } =
    getPasswordStrengthProps(password);

  if (!password) {
    return null;
  }

  return (
    <div className={`mt-2 ${className}`}>
      {/* Strength bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Strength text */}
      {showText && (
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs font-medium ${textColor}`}>{text}</span>
          <span className="text-xs text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;

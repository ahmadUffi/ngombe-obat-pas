// Password validation utility
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`Minimal ${minLength} karakter`);
  }
  if (!hasUpperCase) {
    errors.push("Minimal 1 huruf besar");
  }
  if (!hasLowerCase) {
    errors.push("Minimal 1 huruf kecil");
  }
  if (!hasNumbers) {
    errors.push("Minimal 1 angka");
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password),
  };
};

// Calculate password strength percentage
const calculatePasswordStrength = (password) => {
  let strength = 0;
  const checks = [
    password.length >= 6, // Length check
    /[A-Z]/.test(password), // Uppercase
    /[a-z]/.test(password), // Lowercase
    /\d/.test(password), // Numbers
    /[^A-Za-z0-9]/.test(password), // Special characters (optional)
    password.length >= 12, // Strong length (optional)
  ];

  // Calculate percentage based on passed checks
  const passedChecks = checks.slice(0, 4).filter(Boolean).length; // Only count required checks
  strength = (passedChecks / 4) * 100;

  // Bonus points for special characters and long length
  if (checks[4]) strength += 10; // Special characters bonus
  if (checks[5]) strength += 10; // Long length bonus

  return Math.min(strength, 100); // Cap at 100%
};

// Get strength color and text
export const getPasswordStrengthInfo = (password) => {
  const strength = calculatePasswordStrength(password);

  if (strength < 25) {
    return {
      color: "bg-red-500",
      text: "Sangat Lemah",
      textColor: "text-red-600",
    };
  } else if (strength < 50) {
    return {
      color: "bg-yellow-500",
      text: "Lemah",
      textColor: "text-yellow-600",
    };
  } else if (strength < 75) {
    return { color: "bg-blue-500", text: "Sedang", textColor: "text-blue-600" };
  } else if (strength < 90) {
    return { color: "bg-green-500", text: "Kuat", textColor: "text-green-600" };
  } else {
    return {
      color: "bg-green-600",
      text: "Sangat Kuat",
      textColor: "text-green-700",
    };
  }
};

// Password strength indicator component props helper
export const getPasswordStrengthProps = (password) => {
  const strength = calculatePasswordStrength(password);
  const strengthInfo = getPasswordStrengthInfo(password);

  return {
    percentage: strength,
    ...strengthInfo,
  };
};

// Frontend Error Handling Utility untuk WhatsApp Message API
// File: frontend/src/utils/phoneValidation.js

/**
 * Utility functions untuk handling error dari WhatsApp Message API di frontend
 */

// Phone validation error types mapping
export const PHONE_ERROR_TYPES = {
  REQUIRED: "REQUIRED",
  TOO_SHORT: "TOO_SHORT",
  TOO_LONG: "TOO_LONG",
  INVALID_PROVIDER: "INVALID_PROVIDER",
  INVALID_FORMAT: "INVALID_FORMAT",
  SERVER_ERROR: "SERVER_ERROR",
};

// User-friendly error messages dalam bahasa Indonesia
export const PHONE_ERROR_MESSAGES = {
  [PHONE_ERROR_TYPES.REQUIRED]: "Nomor telepon wajib diisi",
  [PHONE_ERROR_TYPES.TOO_SHORT]:
    "Nomor telepon terlalu pendek (minimal 10 digit)",
  [PHONE_ERROR_TYPES.TOO_LONG]:
    "Nomor telepon terlalu panjang (maksimal 15 digit)",
  [PHONE_ERROR_TYPES.INVALID_PROVIDER]:
    "Nomor telepon harus menggunakan provider Indonesia (Telkomsel, Indosat, XL, Axis, Three, atau Smartfren)",
  [PHONE_ERROR_TYPES.INVALID_FORMAT]:
    "Format nomor telepon tidak valid. Gunakan format: +62xxx, 62xxx, 08xxx, atau 8xxx",
  [PHONE_ERROR_TYPES.SERVER_ERROR]:
    "Terjadi kesalahan server. Silakan coba lagi.",
};

/**
 * Parse error response dari API dan return user-friendly message
 * @param {Object} error - Error object dari axios
 * @returns {Object} - { type, message, originalError }
 */
export const parsePhoneValidationError = (error) => {
  // Default error response
  const defaultError = {
    type: PHONE_ERROR_TYPES.SERVER_ERROR,
    message: PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.SERVER_ERROR],
    originalError: error,
  };

  // Jika tidak ada response dari server
  if (!error.response || !error.response.data) {
    return defaultError;
  }

  const errorData = error.response.data;
  const errorMessage = errorData.message || "";

  // Map server error message ke error type
  if (errorMessage.includes("Phone number and message are required")) {
    return {
      type: PHONE_ERROR_TYPES.REQUIRED,
      message: PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.REQUIRED],
      originalError: error,
    };
  }

  if (errorMessage.includes("must be between 10-15 digits")) {
    const phone = errorData.details?.provided || "";
    if (phone.replace(/\D/g, "").length < 10) {
      return {
        type: PHONE_ERROR_TYPES.TOO_SHORT,
        message: PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.TOO_SHORT],
        originalError: error,
      };
    } else {
      return {
        type: PHONE_ERROR_TYPES.TOO_LONG,
        message: PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.TOO_LONG],
        originalError: error,
      };
    }
  }

  if (errorMessage.includes("Invalid Indonesian mobile provider")) {
    return {
      type: PHONE_ERROR_TYPES.INVALID_PROVIDER,
      message: PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.INVALID_PROVIDER],
      originalError: error,
    };
  }

  if (errorMessage.includes("Invalid Indonesian phone number format")) {
    return {
      type: PHONE_ERROR_TYPES.INVALID_FORMAT,
      message: PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.INVALID_FORMAT],
      originalError: error,
    };
  }

  // Return server message as fallback
  return {
    type: PHONE_ERROR_TYPES.SERVER_ERROR,
    message:
      errorMessage || PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.SERVER_ERROR],
    originalError: error,
  };
};

/**
 * Validasi nomor telepon di frontend (basic validation sebelum kirim ke server)
 * @param {string} phone - Nomor telepon
 * @returns {Object} - { isValid, error }
 */
export const validatePhoneClient = (phone) => {
  if (!phone || phone.trim() === "") {
    return {
      isValid: false,
      error: {
        type: PHONE_ERROR_TYPES.REQUIRED,
        message: PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.REQUIRED],
      },
    };
  }

  // Clean phone number (remove non-digits)
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length < 10) {
    return {
      isValid: false,
      error: {
        type: PHONE_ERROR_TYPES.TOO_SHORT,
        message: PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.TOO_SHORT],
      },
    };
  }

  if (cleanPhone.length > 15) {
    return {
      isValid: false,
      error: {
        type: PHONE_ERROR_TYPES.TOO_LONG,
        message: PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.TOO_LONG],
      },
    };
  }

  // Basic Indonesia format check
  if (
    !cleanPhone.startsWith("62") &&
    !cleanPhone.startsWith("0") &&
    !cleanPhone.startsWith("8")
  ) {
    return {
      isValid: false,
      error: {
        type: PHONE_ERROR_TYPES.INVALID_FORMAT,
        message: PHONE_ERROR_MESSAGES[PHONE_ERROR_TYPES.INVALID_FORMAT],
      },
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Format nomor telepon untuk display (add spaces for readability)
 * @param {string} phone - Nomor telepon
 * @returns {string} - Formatted phone number
 */
export const formatPhoneDisplay = (phone) => {
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.startsWith("62")) {
    // Format: +62 8xx xxx xxx xxx
    return `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(
      2,
      5
    )} ${cleanPhone.slice(5, 8)} ${cleanPhone.slice(8, 11)} ${cleanPhone.slice(
      11
    )}`.trim();
  } else if (cleanPhone.startsWith("0")) {
    // Format: 08xx xxx xxx xxx
    return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(
      4,
      7
    )} ${cleanPhone.slice(7, 10)} ${cleanPhone.slice(10)}`.trim();
  }

  return phone;
};

/**
 * Get provider name dari nomor telepon
 * @param {string} phone - Nomor telepon
 * @returns {string} - Provider name atau 'Unknown'
 */
export const getPhoneProvider = (phone) => {
  const cleanPhone = phone.replace(/\D/g, "");
  let checkPhone = cleanPhone;

  // Normalize to 62 format
  if (checkPhone.startsWith("0")) {
    checkPhone = "62" + checkPhone.substring(1);
  } else if (!checkPhone.startsWith("62")) {
    checkPhone = "62" + checkPhone;
  }

  const providers = {
    62811: "Telkomsel",
    62812: "Telkomsel",
    62813: "Telkomsel",
    62821: "Telkomsel",
    62822: "Telkomsel",
    62814: "Indosat",
    62815: "Indosat",
    62816: "Indosat",
    62855: "Indosat",
    62856: "Indosat",
    62857: "Indosat",
    62858: "Indosat",
    62817: "XL",
    62818: "XL",
    62819: "XL",
    62859: "XL",
    62877: "XL",
    62878: "XL",
    62838: "Axis",
    62831: "Axis",
    62832: "Axis",
    62833: "Axis",
    62834: "Axis",
    62895: "Three",
    62896: "Three",
    62897: "Three",
    62898: "Three",
    62899: "Three",
    62881: "Smartfren",
    62882: "Smartfren",
    62883: "Smartfren",
    62884: "Smartfren",
    62885: "Smartfren",
    62886: "Smartfren",
    62887: "Smartfren",
    62888: "Smartfren",
    62889: "Smartfren",
  };

  for (const [prefix, provider] of Object.entries(providers)) {
    if (checkPhone.startsWith(prefix)) {
      return provider;
    }
  }

  return "Unknown";
};

/**
 * Hook untuk handle phone validation dengan toast notifications
 * Gunakan ini dengan useToast hook yang sudah ada
 */
export const usePhoneValidation = () => {
  /**
   * Validate phone dan show error toast jika tidak valid
   * @param {string} phone - Nomor telepon
   * @param {Function} showToast - Function dari useToast untuk show toast
   * @returns {boolean} - true jika valid
   */
  const validateAndShowError = (phone, showToast) => {
    const validation = validatePhoneClient(phone);

    if (!validation.isValid) {
      showToast({
        type: "error",
        message: validation.error.message,
        duration: 5000,
      });
      return false;
    }

    return true;
  };

  /**
   * Handle API error dan show appropriate toast
   * @param {Object} error - Error dari axios
   * @param {Function} showToast - Function dari useToast
   */
  const handleApiError = (error, showToast) => {
    const parsedError = parsePhoneValidationError(error);

    showToast({
      type: "error",
      message: parsedError.message,
      duration: 5000,
    });
  };

  return {
    validateAndShowError,
    handleApiError,
    validatePhoneClient,
    formatPhoneDisplay,
    getPhoneProvider,
  };
};

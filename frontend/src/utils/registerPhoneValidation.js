// Frontend Phone Validation Utility khusus untuk Register Form
// File: frontend/src/utils/registerPhoneValidation.js

/**
 * Utility functions untuk validasi nomor telepon pada form Register
 */

// Phone validation error types untuk register
export const REGISTER_PHONE_ERROR_TYPES = {
  REQUIRED: "REQUIRED",
  TOO_SHORT: "TOO_SHORT",
  TOO_LONG: "TOO_LONG",
  INVALID_PROVIDER: "INVALID_PROVIDER",
  INVALID_FORMAT: "INVALID_FORMAT",
  ALREADY_EXISTS: "ALREADY_EXISTS",
};

// User-friendly error messages dalam bahasa Indonesia untuk register
export const REGISTER_PHONE_ERROR_MESSAGES = {
  [REGISTER_PHONE_ERROR_TYPES.REQUIRED]: "Nomor telepon wajib diisi",
  [REGISTER_PHONE_ERROR_TYPES.TOO_SHORT]:
    "Nomor telepon terlalu pendek (minimal 10 digit)",
  [REGISTER_PHONE_ERROR_TYPES.TOO_LONG]:
    "Nomor telepon terlalu panjang (maksimal 15 digit)",
  [REGISTER_PHONE_ERROR_TYPES.INVALID_PROVIDER]:
    "Gunakan nomor telepon Indonesia",
  [REGISTER_PHONE_ERROR_TYPES.INVALID_FORMAT]:
    "Format nomor tidak valid. Gunakan: 08xxx, 628xxx, atau 8xxx",
  [REGISTER_PHONE_ERROR_TYPES.ALREADY_EXISTS]:
    "Nomor telepon sudah terdaftar. Gunakan nomor lain atau login.",
};

/**
 * Validasi nomor telepon untuk form Register
 * @param {string} phone - Nomor telepon
 * @returns {Object} - { isValid, error, normalizedPhone }
 */
export const validateRegisterPhone = (phone) => {
  // Check if empty
  if (!phone || phone.trim() === "") {
    return {
      isValid: false,
      error: {
        type: REGISTER_PHONE_ERROR_TYPES.REQUIRED,
        message:
          REGISTER_PHONE_ERROR_MESSAGES[REGISTER_PHONE_ERROR_TYPES.REQUIRED],
      },
      normalizedPhone: null,
    };
  }

  // Clean phone number (remove non-digits)
  const cleanPhone = phone.replace(/\D/g, "");

  // Check length
  if (cleanPhone.length < 10) {
    return {
      isValid: false,
      error: {
        type: REGISTER_PHONE_ERROR_TYPES.TOO_SHORT,
        message:
          REGISTER_PHONE_ERROR_MESSAGES[REGISTER_PHONE_ERROR_TYPES.TOO_SHORT],
      },
      normalizedPhone: null,
    };
  }

  if (cleanPhone.length > 15) {
    return {
      isValid: false,
      error: {
        type: REGISTER_PHONE_ERROR_TYPES.TOO_LONG,
        message:
          REGISTER_PHONE_ERROR_MESSAGES[REGISTER_PHONE_ERROR_TYPES.TOO_LONG],
      },
      normalizedPhone: null,
    };
  }

  // Normalize phone number
  let normalizedPhone = cleanPhone;

  if (cleanPhone.startsWith("0")) {
    normalizedPhone = "62" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("62")) {
    normalizedPhone = "62" + cleanPhone;
  }

  // Validate Indonesian phone patterns (62 + 8 + 8-12 digits)
  const indonesianPattern = /^62[8][0-9]{8,12}$/;
  if (!indonesianPattern.test(normalizedPhone)) {
    return {
      isValid: false,
      error: {
        type: REGISTER_PHONE_ERROR_TYPES.INVALID_FORMAT,
        message:
          REGISTER_PHONE_ERROR_MESSAGES[
            REGISTER_PHONE_ERROR_TYPES.INVALID_FORMAT
          ],
      },
      normalizedPhone: null,
    };
  }

  // All validation passed
  return {
    isValid: true,
    error: null,
    normalizedPhone: normalizedPhone,
  };
};

/**
 * Format nomor telepon untuk display di register form
 * @param {string} phone - Nomor telepon
 * @returns {string} - Formatted phone number
 */
export const formatRegisterPhoneDisplay = (phone) => {
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.startsWith("62")) {
    // Format: +62 8xx-xxxx-xxxx
    return `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(
      2,
      5
    )}-${cleanPhone.slice(5, 9)}-${cleanPhone.slice(9)}`.trim();
  } else if (cleanPhone.startsWith("0")) {
    // Format: 08xx-xxxx-xxxx
    return `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(
      4,
      8
    )}-${cleanPhone.slice(8)}`.trim();
  }

  return phone;
};

/**
 * Get provider name dari nomor telepon untuk register (optional, untuk display saja)
 * @param {string} phone - Nomor telepon
 * @returns {string} - "Indonesia" jika valid, null jika tidak valid
 */
export const getRegisterPhoneProvider = (phone) => {
  const validation = validateRegisterPhone(phone);
  if (!validation.isValid) {
    return null;
  }

  // Hanya return "Indonesia" untuk semua nomor valid
  return "Indonesia";
};

/**
 * Hook khusus untuk register phone validation
 */
export const useRegisterPhoneValidation = () => {
  /**
   * Real-time validation saat user mengetik
   * @param {string} phone - Nomor telepon
   * @returns {Object} - validation result
   */
  const validateRealtime = (phone) => {
    if (!phone) {
      return { isValid: true, error: null }; // Don't show error for empty field
    }

    return validateRegisterPhone(phone);
  };

  /**
   * Final validation sebelum submit
   * @param {string} phone - Nomor telepon
   * @returns {Object} - validation result
   */
  const validateOnSubmit = (phone) => {
    return validateRegisterPhone(phone);
  };

  /**
   * Parse server error untuk phone field
   * @param {Object} error - Error dari server
   * @returns {string} - Error message
   */
  const parseServerError = (error) => {
    if (
      error?.message?.includes("already exists") ||
      error?.message?.includes("sudah terdaftar")
    ) {
      return REGISTER_PHONE_ERROR_MESSAGES[
        REGISTER_PHONE_ERROR_TYPES.ALREADY_EXISTS
      ];
    }

    return error?.message || "Terjadi kesalahan validasi nomor telepon";
  };

  return {
    validateRealtime,
    validateOnSubmit,
    parseServerError,
    formatRegisterPhoneDisplay,
    getRegisterPhoneProvider,
  };
};

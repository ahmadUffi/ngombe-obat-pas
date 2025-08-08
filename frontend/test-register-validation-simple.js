// Test validasi nomor telepon untuk register form - simple version
// Copy fungsi validasi dari registerPhoneValidation.js

const validateRegisterPhone = (phone) => {
  if (!phone || phone.trim() === "") {
    return {
      isValid: false,
      error: "Nomor telepon wajib diisi",
      errorType: "REQUIRED",
    };
  }

  // Hapus semua karakter non-digit
  const cleanPhone = phone.replace(/\D/g, "");

  // Cek panjang minimum dan maksimum
  if (cleanPhone.length < 10) {
    return {
      isValid: false,
      error: "Nomor telepon terlalu pendek (minimal 10 digit)",
      errorType: "TOO_SHORT",
    };
  }

  if (cleanPhone.length > 15) {
    return {
      isValid: false,
      error: "Nomor telepon terlalu panjang (maksimal 15 digit)",
      errorType: "TOO_LONG",
    };
  }

  let formattedPhone = cleanPhone;

  // Format nomor ke 62xxx
  if (cleanPhone.startsWith("0")) {
    // Format lokal Indonesia (08xxx), convert ke internasional
    formattedPhone = "62" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("62")) {
    // Format tanpa 0 dan 62, tambahkan 62
    formattedPhone = "62" + cleanPhone;
  }

  // Validasi format Indonesia sederhana (62 + 8 + 8-12 digits)
  const indonesianPattern = /^62[8][0-9]{8,12}$/;

  if (!indonesianPattern.test(formattedPhone)) {
    return {
      isValid: false,
      error:
        "Format nomor tidak valid. Gunakan format: 08xxx, 628xxx, atau 8xxx",
      errorType: "INVALID_FORMAT",
    };
  }

  return {
    isValid: true,
    formattedPhone: formattedPhone,
    error: null,
    errorType: null,
  };
};

const testPhoneNumbers = [
  "08123456789", // Format lokal - valid
  "628123456789", // Format internasional - valid
  "8123456789", // Format tanpa 0 - valid
  "+628123456789", // Format dengan + - valid
  "081234567890123", // Terlalu panjang
  "0812345", // Terlalu pendek
  "07123456789", // Dimulai dengan 07 (bukan 08)
  "627123456789", // Dimulai dengan 627 (bukan 628)
  "81234567890", // Format 8xxx yang valid
  "629123456789", // Dimulai dengan 629 (bukan 628)
  "abc123456789", // Dengan huruf
  "", // Kosong
  "123", // Terlalu pendek
  "08912345678", // Format 089 yang valid
];

console.log("🧪 Testing Frontend Register Phone Validation");
console.log("============================================\n");

testPhoneNumbers.forEach((phone, index) => {
  const result = validateRegisterPhone(phone);
  console.log(`Test ${index + 1}: "${phone}"`);
  console.log(`✅ Valid: ${result.isValid}`);
  if (result.isValid && result.formattedPhone) {
    console.log(`📞 Formatted: ${result.formattedPhone}`);
  } else if (!result.isValid) {
    console.log(`❌ Error: ${result.error}`);
    console.log(`🏷️  Type: ${result.errorType}`);
  }
  console.log("---");
});

console.log("\n✨ Frontend validation test completed!");

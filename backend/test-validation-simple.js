// Test validasi nomor telepon sederhana
const testPhoneNumbers = [
  "08123456789", // Format lokal
  "628123456789", // Format internasional
  "8123456789", // Format tanpa 0
  "+628123456789", // Format dengan +
  "081234567890123", // Terlalu panjang
  "0812345", // Terlalu pendek
  "08912345678", // Dimulai dengan 089 (bukan 08)
  "628912345678", // Dimulai dengan 6289 (bukan 628)
  "81234567890", // Format 8xxx yang valid
  "629123456789", // Dimulai dengan 629 (bukan 628)
];

// Fungsi validasi nomor telepon Indonesia (sederhana) - copy dari controller
const validateIndonesianPhoneNumber = (phone) => {
  // Hapus semua karakter non-digit
  const cleanPhone = phone.replace(/\D/g, "");

  // Cek panjang minimum dan maksimum
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return {
      isValid: false,
      error: "Phone number must be between 10-15 digits",
      cleanPhone: null,
    };
  }

  let formattedPhone = cleanPhone;

  // Format nomor ke 62xxx
  if (cleanPhone.startsWith("0")) {
    // Format lokal, convert ke internasional
    formattedPhone = "62" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("62")) {
    // Format tanpa 0 dan 62, tambahkan 62
    formattedPhone = "62" + cleanPhone;
  }

  // Validasi format Indonesia (62 + 8 + 8-12 digits)
  const indonesianPattern = /^62[8][0-9]{8,12}$/;
  if (!indonesianPattern.test(formattedPhone)) {
    return {
      isValid: false,
      error:
        "Invalid Indonesian phone number format. Use format: +62xxx, 62xxx, 08xxx, or 8xxx",
      cleanPhone: null,
    };
  }

  return {
    isValid: true,
    error: null,
    cleanPhone: formattedPhone,
  };
};

console.log("🧪 Testing Simplified Phone Validation");
console.log("=====================================\n");

testPhoneNumbers.forEach((phone, index) => {
  const result = validateIndonesianPhoneNumber(phone);
  console.log(`Test ${index + 1}: ${phone}`);
  console.log(`✅ Valid: ${result.isValid}`);
  if (result.isValid) {
    console.log(`📞 Formatted: ${result.cleanPhone}`);
  } else {
    console.log(`❌ Error: ${result.error}`);
  }
  console.log("---");
});

console.log("\n✨ Test completed!");

// Test validasi nomor telepon untuk register form
import { validateRegisterPhone } from "../src/utils/registerPhoneValidation.js";

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
  }
  console.log("---");
});

console.log("\n✨ Frontend validation test completed!");

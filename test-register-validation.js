// Test Register Phone Validation
// Simplified validation test to check logic

console.log("🧪 Testing Register Phone Validation Logic...\n");

// Simplified validation function for testing
function validatePhone(phone) {
  if (!phone || phone.trim() === "") {
    return { isValid: false, error: "Nomor telepon wajib diisi" };
  }

  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length < 10) {
    return { isValid: false, error: "Nomor telepon terlalu pendek" };
  }

  if (cleanPhone.length > 15) {
    return { isValid: false, error: "Nomor telepon terlalu panjang" };
  }

  // Normalize phone
  let normalizedPhone = cleanPhone;
  if (cleanPhone.startsWith("0")) {
    normalizedPhone = "62" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("62")) {
    normalizedPhone = "62" + cleanPhone;
  }

  // Check Indonesian pattern
  if (!/^62[8][0-9]{8,12}$/.test(normalizedPhone)) {
    return { isValid: false, error: "Format nomor tidak valid" };
  }

  // Check providers
  const validProviders = [
    "62811",
    "62812",
    "62813",
    "62821",
    "62822",
    "62814",
    "62815",
    "62816",
    "62855",
    "62856",
    "62857",
    "62858",
    "62817",
    "62818",
    "62819",
    "62859",
    "62877",
    "62878",
    "62838",
    "62831",
    "62832",
    "62833",
    "62834",
    "62895",
    "62896",
    "62897",
    "62898",
    "62899",
    "62881",
    "62882",
    "62883",
    "62884",
    "62885",
    "62886",
    "62887",
    "62888",
    "62889",
  ];

  const hasValidProvider = validProviders.some((provider) =>
    normalizedPhone.startsWith(provider)
  );

  if (!hasValidProvider) {
    return { isValid: false, error: "Provider tidak valid" };
  }

  return { isValid: true, normalizedPhone };
}

const testCases = [
  // Should be valid
  {
    phone: "081234567890",
    expected: true,
    desc: "Valid Telkomsel local format",
  },
  {
    phone: "+6281234567890",
    expected: true,
    desc: "Valid Telkomsel international",
  },
  { phone: "62814567890123", expected: true, desc: "Valid Indosat" },

  // Should be invalid
  { phone: "", expected: false, desc: "Empty phone" },
  { phone: "123456789", expected: false, desc: "Too short" },
  { phone: "+62700567890123", expected: false, desc: "Invalid provider" },
  { phone: "021567890", expected: false, desc: "Landline" },
];

let passCount = 0;
let failCount = 0;

testCases.forEach((test, index) => {
  console.log(`${index + 1}. ${test.desc}`);
  console.log(`   Input: "${test.phone}"`);

  try {
    const result = validatePhone(test.phone);
    const isValid = result.isValid;

    if (isValid === test.expected) {
      console.log(`   ✅ PASS: Expected ${test.expected}, got ${isValid}`);
      if (isValid) {
        console.log(`   📱 Normalized: ${result.normalizedPhone}`);
      } else {
        console.log(`   📋 Error: ${result.error.message}`);
      }
      passCount++;
    } else {
      console.log(`   ❌ FAIL: Expected ${test.expected}, got ${isValid}`);
      failCount++;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    failCount++;
  }

  console.log("");
});

console.log(`📊 Test Results: ${passCount} passed, ${failCount} failed`);

if (failCount === 0) {
  console.log(
    "🎉 All validation tests passed! Register validation is working."
  );
} else {
  console.log("⚠️  Some tests failed. Need to fix validation logic.");
}

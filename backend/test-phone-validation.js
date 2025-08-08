// Test validasi nomor telepon Indonesia yang lebih ketat
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:5000/v1/api/message/test";

async function testPhoneValidation() {
  console.log("🧪 Testing Enhanced Indonesian Phone Number Validation...\n");

  const testCases = [
    // Valid numbers
    {
      phone: "+62811234567890",
      expected: "valid",
      description: "Telkomsel +62 format",
    },
    {
      phone: "62811234567890",
      expected: "valid",
      description: "Telkomsel 62 format",
    },
    {
      phone: "0811234567890",
      expected: "valid",
      description: "Telkomsel 08 format",
    },
    {
      phone: "811234567890",
      expected: "valid",
      description: "Telkomsel 8 format",
    },
    {
      phone: "+62-811-234-567-890",
      expected: "valid",
      description: "Telkomsel with dashes",
    },
    {
      phone: "+62 811 234 567 890",
      expected: "valid",
      description: "Telkomsel with spaces",
    },

    // Valid providers
    { phone: "+62814567890123", expected: "valid", description: "Indosat" },
    { phone: "+62817567890123", expected: "valid", description: "XL" },
    { phone: "+62838567890123", expected: "valid", description: "Axis" },
    { phone: "+62895567890123", expected: "valid", description: "Three" },
    { phone: "+62881567890123", expected: "valid", description: "Smartfren" },

    // Invalid numbers
    { phone: "123456789", expected: "invalid", description: "Too short" },
    {
      phone: "+62123456789012345",
      expected: "invalid",
      description: "Too long",
    },
    {
      phone: "+62700567890123",
      expected: "invalid",
      description: "Invalid provider (700)",
    },
    {
      phone: "+62900567890123",
      expected: "invalid",
      description: "Invalid provider (900)",
    },
    {
      phone: "+1234567890123",
      expected: "invalid",
      description: "Non-Indonesian country code",
    },
    {
      phone: "021567890123",
      expected: "invalid",
      description: "Landline number (021)",
    },
    { phone: "", expected: "invalid", description: "Empty string" },
    {
      phone: "abc123def456",
      expected: "invalid",
      description: "Contains letters",
    },
    {
      phone: "+62812345",
      expected: "invalid",
      description: "Too short for provider",
    },
    {
      phone: "+6281234567890123456",
      expected: "invalid",
      description: "Way too long",
    },
  ];

  let validCount = 0;
  let invalidCount = 0;
  let errors = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i + 1}. Testing: ${testCase.description}`);
    console.log(`   Phone: "${testCase.phone}"`);

    try {
      const response = await axios.post(
        `${BASE_URL}/send`,
        {
          phone: testCase.phone,
          message: "Test message",
          type: "text",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (testCase.expected === "valid") {
        console.log(`   ✅ PASS: Accepted as valid`);
        console.log(`   📱 Normalized to: ${response.data.data?.phone}`);
        validCount++;
      } else {
        console.log(`   ❌ FAIL: Should be invalid but was accepted`);
        errors.push(
          `${testCase.description}: Expected invalid but was accepted`
        );
      }
    } catch (error) {
      if (testCase.expected === "invalid") {
        console.log(`   ✅ PASS: Correctly rejected`);
        console.log(`   📋 Error: ${error.response?.data?.message}`);
        invalidCount++;
      } else {
        console.log(`   ❌ FAIL: Should be valid but was rejected`);
        console.log(`   📋 Error: ${error.response?.data?.message}`);
        errors.push(
          `${testCase.description}: Expected valid but was rejected - ${error.response?.data?.message}`
        );
      }
    }

    console.log("");

    // Delay kecil untuk avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("📊 VALIDATION TEST SUMMARY:");
  console.log(`✅ Valid numbers processed: ${validCount}`);
  console.log(`❌ Invalid numbers rejected: ${invalidCount}`);
  console.log(`🚫 Test failures: ${errors.length}`);

  if (errors.length > 0) {
    console.log("\n🚨 FAILED TESTS:");
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  console.log("\n🎯 Expected Results:");
  const expectedValid = testCases.filter((t) => t.expected === "valid").length;
  const expectedInvalid = testCases.filter(
    (t) => t.expected === "invalid"
  ).length;
  console.log(`Expected valid: ${expectedValid}, Got: ${validCount}`);
  console.log(`Expected invalid: ${expectedInvalid}, Got: ${invalidCount}`);

  if (
    validCount === expectedValid &&
    invalidCount === expectedInvalid &&
    errors.length === 0
  ) {
    console.log("\n🎉 ALL VALIDATION TESTS PASSED!");
  } else {
    console.log("\n⚠️  Some validation tests failed. Please review.");
  }
}

async function testErrorResponseFormat() {
  console.log("\n🧪 Testing Error Response Format for Frontend...\n");

  const invalidPhones = [
    "+62700567890123", // Invalid provider
    "123456789", // Too short
    "021567890123", // Landline
    "", // Empty
  ];

  console.log("📋 Error Response Structure Analysis:");

  for (const phone of invalidPhones) {
    try {
      await axios.post(
        `${BASE_URL}/send`,
        {
          phone: phone,
          message: "Test message",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.log(`\n📞 Phone: "${phone}"`);
      console.log("📋 Error Response Structure:");
      console.log(JSON.stringify(error.response?.data, null, 2));
    }
  }
}

// Jalankan tests
async function runValidationTests() {
  await testPhoneValidation();
  await testErrorResponseFormat();
}

runValidationTests();

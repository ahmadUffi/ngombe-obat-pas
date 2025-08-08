// Test WhatsApp Message API
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:5000/v1/api/message/test";

// Test JWT token - pastikan ini valid token dari Supabase
const AUTH_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3OC05MGFiLWNkZWYtMTIzNC01Njc4OTBhYmNkZWYiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.G8p5pTXzSgWJdNjP_QYpYTf0-EAGHLJGnbWDy8z3Krk";

async function testSingleMessage() {
  console.log("🚀 Testing Single WhatsApp Message API...\n");

  try {
    const messageData = {
      phone: "+6281575851730",
      message: "Hello! This is a test message from SmedBox WhatsApp API 📱",
      type: "text",
    };

    console.log("📤 Sending single message...");
    console.log("📋 Data:", JSON.stringify(messageData, null, 2));

    const response = await axios.post(`${BASE_URL}/send`, messageData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Single message sent successfully!");
    console.log("📋 Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(
      "❌ Error sending single message:",
      error.response?.data || error.message
    );
  }
}

async function testBulkMessage() {
  console.log("\n🚀 Testing Bulk WhatsApp Message API...\n");

  try {
    const bulkData = {
      recipients: [
        "+6281234567890",
        "+6289876543210",
        {
          phone: "+6285555555555",
          message: "minum obat woy 🎯",
        },
      ],
      message: "Default bulk message from SmedBox API! 📢",
      type: "text",
    };

    console.log("📤 Sending bulk messages...");
    console.log("📋 Data:", JSON.stringify(bulkData, null, 2));

    const response = await axios.post(`${BASE_URL}/send-bulk`, bulkData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Bulk messages processed!");
    console.log("📋 Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(
      "❌ Error sending bulk messages:",
      error.response?.data || error.message
    );
  }
}

async function testErrorCases() {
  console.log("\n🚀 Testing Error Cases...\n");

  // Test missing phone
  try {
    console.log("1️⃣ Testing missing phone number...");
    await axios.post(
      `${BASE_URL}/send`,
      {
        message: "Test message without phone",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.log(
      "✅ Correctly caught missing phone error:",
      error.response?.data?.message
    );
  }

  // Test missing message
  try {
    console.log("2️⃣ Testing missing message...");
    await axios.post(
      `${BASE_URL}/send`,
      {
        phone: "+6281234567890",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.log(
      "✅ Correctly caught missing message error:",
      error.response?.data?.message
    );
  }

  // Test invalid phone format
  try {
    console.log("3️⃣ Testing invalid phone format...");
    await axios.post(
      `${BASE_URL}/send`,
      {
        phone: "123",
        message: "Test message",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.log(
      "✅ Correctly caught invalid phone error:",
      error.response?.data?.message
    );
  }
}

async function testPhoneNumberFormats() {
  console.log("\n🚀 Testing Phone Number Format Handling...\n");

  const testPhones = [
    "+6281234567890", // International format with +
    "6281234567890", // International format without +
    "081234567890", // Local format (should convert to 62xxx)
    "08123-456-7890", // Local format with dashes
    "+62 812 3456 7890", // International format with spaces
  ];

  for (let i = 0; i < testPhones.length; i++) {
    try {
      const phone = testPhones[i];
      console.log(`${i + 1}️⃣ Testing phone format: ${phone}`);

      const response = await axios.post(
        `${BASE_URL}/send`,
        {
          phone: phone,
          message: `Test message for phone format: ${phone}`,
          type: "text",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        `✅ Format accepted. Normalized to: ${response.data.data?.phone}`
      );

      // Wait 2 seconds between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(`❌ Format rejected: ${error.response?.data?.message}`);
    }
  }
}

async function runAllTests() {
  console.log("🧪 Starting WhatsApp Message API Tests...\n");
  console.log("🔗 Testing endpoint: " + BASE_URL);
  console.log("🔐 Using auth token: " + AUTH_TOKEN.substring(0, 20) + "...\n");

  await testSingleMessage();
  await testBulkMessage();
  await testErrorCases();
  await testPhoneNumberFormats();

  console.log("\n✅ All WhatsApp Message API tests completed!");
  console.log("📝 Check server logs for detailed message sending attempts.");
}

// Jalankan semua tests
runAllTests();

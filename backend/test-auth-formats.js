// Test berbagai format authorization untuk Wablas

import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const WABLAS_BASE_URL = "https://sby.wablas.com/api";
const WABLAS_TOKEN = process.env.WABLAS_TOKEN || "";
const WABLAS_SECRET_KEY = process.env.WABLAS_SECRET_KEY || "";

console.log("🧪 Testing Different Authorization Formats\n");

const testReminderId = "test-id-12345";

const authFormats = [
  {
    name: "Current: token.secret",
    value: `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`,
  },
  {
    name: "Space: token secret",
    value: `${WABLAS_TOKEN} ${WABLAS_SECRET_KEY}`,
  },
  {
    name: "Bearer: Bearer token.secret",
    value: `Bearer ${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`,
  },
  {
    name: "Token only",
    value: WABLAS_TOKEN,
  },
];

async function testAuthFormat(format) {
  try {
    console.log(`🔧 Testing: ${format.name}`);

    const response = await axios.delete(
      `${WABLAS_BASE_URL}/reminder/${testReminderId}`,
      {
        headers: {
          Authorization: format.value,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: "",
      }
    );

    console.log("✅ SUCCESS with format:", format.name);
    console.log("Response:", response.data);
    return true;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    console.log(`   Status: ${status}, Message: ${message}`);

    if (status === 404) {
      console.log("✅ AUTH OK (404 = reminder not found)");
      return true;
    } else if (message?.includes("token invalid")) {
      console.log("❌ AUTH FAILED");
      return false;
    } else {
      console.log("⚠️ OTHER ERROR");
      return false;
    }
  }
}

// Test semua format
for (const format of authFormats) {
  const success = await testAuthFormat(format);
  if (success) {
    console.log(`\n🎯 WORKING FORMAT: ${format.name}`);
    console.log(`Authorization: ${format.value}`);
    break;
  }
  console.log("");
}

console.log("\n📝 Notes:");
console.log("- 404 = Auth OK, reminder not found");
console.log('- 500 + "token invalid" = Auth failed');
console.log("- Looking for the working format...");

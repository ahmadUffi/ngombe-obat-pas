// Test delete dengan credentials asli (untuk debug)

import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const WABLAS_BASE_URL = "https://sby.wablas.com/api";
const WABLAS_TOKEN = process.env.WABLAS_TOKEN || "";
const WABLAS_SECRET_KEY = process.env.WABLAS_SECRET_KEY || "";

console.log("🧪 Testing Wablas Delete with Real Credentials\n");

console.log("📋 Configuration:");
console.log("- Token exists:", !!WABLAS_TOKEN);
console.log("- Secret exists:", !!WABLAS_SECRET_KEY);
console.log("- Token preview:", WABLAS_TOKEN.substring(0, 10) + "...");
console.log("- Secret preview:", WABLAS_SECRET_KEY.substring(0, 5) + "...");
console.log("");

// Test dengan ID yang mungkin tidak ada (untuk test format)
const testReminderId = "test-id-12345";

async function testDeleteFormat() {
  try {
    console.log("🚀 Testing delete format...");

    const response = await axios.delete(
      `${WABLAS_BASE_URL}/reminder/${testReminderId}`,
      {
        headers: {
          Authorization: `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: "", // Empty data seperti PHP
      }
    );

    console.log("✅ Request successful!");
    console.log("Response:", response.data);
  } catch (error) {
    console.log("📊 Request details:");
    console.log("- Status:", error.response?.status);
    console.log("- Status Text:", error.response?.statusText);
    console.log("- Response Data:", error.response?.data);

    if (error.response?.status === 404) {
      console.log(
        "✅ 404 Not Found - Format request correct, reminder tidak ada"
      );
    } else if (error.response?.status === 401) {
      console.log("❌ 401 Unauthorized - Ada masalah dengan credentials");
    } else {
      console.log("⚠️ Other error:", error.message);
    }
  }
}

if (WABLAS_TOKEN && WABLAS_SECRET_KEY) {
  await testDeleteFormat();
} else {
  console.log("❌ Missing credentials - check .env file");
}

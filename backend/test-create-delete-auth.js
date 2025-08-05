// Test create reminder untuk memastikan format auth yang benar

import dotenv from "dotenv";
import axios from "axios";
import {
  generateReminderMessage,
  formatStartDate,
} from "./src/services/wablasService.js";

dotenv.config();

const WABLAS_BASE_URL = "https://sby.wablas.com/api";
const WABLAS_TOKEN = process.env.WABLAS_TOKEN || "";
const WABLAS_SECRET_KEY = process.env.WABLAS_SECRET_KEY || "";

console.log("🧪 Testing Create Reminder Auth Formats\n");

const testData = {
  phone: "628123456789",
  start_date: "2025-08-06 10:00:00",
  message: "Test reminder",
  periode: "daily",
  title: "Test",
};

const authFormats = [
  {
    name: "token.secret",
    value: `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`,
  },
  {
    name: "token only",
    value: WABLAS_TOKEN,
  },
];

async function testCreateAuth(format) {
  try {
    console.log(`🔧 Testing CREATE with: ${format.name}`);

    const response = await axios.post(`${WABLAS_BASE_URL}/reminder`, testData, {
      headers: {
        Authorization: format.value,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      transformRequest: [
        (data) => {
          return Object.keys(data)
            .map(
              (key) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
            )
            .join("&");
        },
      ],
    });

    console.log("✅ CREATE SUCCESS with:", format.name);
    console.log("Reminder ID:", response.data.data?.id);
    return { success: true, id: response.data.data?.id };
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    console.log(`   Status: ${status}, Message: ${message}`);

    if (message?.includes("token invalid")) {
      console.log("❌ CREATE AUTH FAILED");
    } else {
      console.log("⚠️ CREATE OTHER ERROR");
    }
    return { success: false };
  }
}

// Test create dengan different auth formats
for (const format of authFormats) {
  const result = await testCreateAuth(format);
  if (result.success) {
    console.log(`\n🎯 CREATE WORKING FORMAT: ${format.name}`);

    // Test delete dengan reminder yang baru dibuat
    if (result.id) {
      console.log(`\n🗑️ Testing DELETE with same format...`);

      try {
        const deleteResponse = await axios.delete(
          `${WABLAS_BASE_URL}/reminder/${result.id}`,
          {
            headers: {
              Authorization: format.value,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            data: "",
          }
        );

        console.log("✅ DELETE SUCCESS!");
        console.log("Delete response:", deleteResponse.data);
      } catch (deleteError) {
        console.log("❌ DELETE FAILED:", deleteError.response?.data?.message);
      }
    }
    break;
  }
  console.log("");
}

console.log(
  "\n📝 Result: Will determine consistent auth format for both create and delete"
);

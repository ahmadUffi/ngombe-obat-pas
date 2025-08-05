// Test delete dengan token only menggunakan reminder ID yang baru dibuat

import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const WABLAS_BASE_URL = "https://sby.wablas.com/api";
const WABLAS_TOKEN = process.env.WABLAS_TOKEN || "";

console.log("🧪 Testing Delete with Token Only\n");

// ID dari create test sebelumnya
const reminderId = "69a7736c-569d-436b-b978-6021156b6977";

async function testDeleteTokenOnly() {
  try {
    console.log(`🗑️ Deleting reminder: ${reminderId}`);

    const response = await axios.delete(
      `${WABLAS_BASE_URL}/reminder/${reminderId}`,
      {
        headers: {
          Authorization: WABLAS_TOKEN, // Token only
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: "",
      }
    );

    console.log("✅ DELETE SUCCESS!");
    console.log("Response:", response.data);
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    console.log(`Status: ${status}`);
    console.log(`Message: ${message}`);

    if (message?.includes("token invalid")) {
      console.log("❌ Still auth failed");
    } else if (message?.includes("not found")) {
      console.log("✅ Auth OK, reminder already deleted or not found");
    } else {
      console.log("⚠️ Other error");
    }
  }
}

await testDeleteTokenOnly();

console.log("\n📝 Conclusion:");
console.log("- CREATE: Use token.secret");
console.log("- DELETE: Use token only");
console.log(
  "- Wablas API has different auth requirements for different endpoints"
);

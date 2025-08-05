import dotenv from "dotenv";
import { deleteWablasReminder } from "./src/services/wablasService.js";

// Load environment variables
dotenv.config();

console.log("🧪 Testing Delete Wablas Reminder\n");

// Test dengan dummy ID untuk melihat response
async function testDeleteReminder() {
  try {
    console.log("Testing delete dengan dummy ID...");

    const result = await deleteWablasReminder("dummy-id-123");

    console.log("✅ Result:", result);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Test dengan environment variables
console.log("🔧 Environment Check:");
console.log(
  "WABLAS_TOKEN:",
  process.env.WABLAS_TOKEN
    ? "✅ Set (" + process.env.WABLAS_TOKEN.substring(0, 10) + "...)"
    : "❌ Not Set"
);
console.log(
  "WABLAS_SECRET_KEY:",
  process.env.WABLAS_SECRET_KEY
    ? "✅ Set (" + process.env.WABLAS_SECRET_KEY + ")"
    : "❌ Not Set"
);
console.log("");

// Run test
testDeleteReminder();

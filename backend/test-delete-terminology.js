// Test untuk memastikan terminology "delete" bekerja dengan benar
import axios from "axios";

const BASE_URL = "http://localhost:5000/v1/api";
const AUTH_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3OC05MGFiLWNkZWYtMTIzNC01Njc4OTBhYmNkZWYiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.G8p5pTXzSgWJdNjP_QYpYTf0-EAGHLJGnbWDy8z3Krk";

async function testDeleteTerminology() {
  console.log("🚀 Testing DELETE Terminology Implementation...\n");

  try {
    // 1. Create control dengan WhatsApp schedule
    console.log("1️⃣ Creating control with WhatsApp schedules...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const controlData = {
      pasien: "Test Patient DELETE",
      tanggal: tomorrow.toISOString().split("T")[0], // YYYY-MM-DD
      waktu: "14:00",
      whatsapp: "+6281234567890",
      catatan: "Test delete terminology",
    };

    const createResponse = await axios.post(
      `${BASE_URL}/kontrol`,
      controlData,
      {
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const kontrolId = createResponse.data.data.id;
    console.log(`✅ Control created: ${kontrolId}\n`);

    // 2. Mark control as done (should trigger delete terminology)
    console.log("2️⃣ Marking control as completed (should DELETE schedules)...");
    const updateResponse = await axios.put(
      `${BASE_URL}/kontrol/${kontrolId}`,
      { isDone: true },
      {
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Control marked as completed successfully");
    console.log("📋 Response message:", updateResponse.data.message);
    console.log("📋 Success status:", updateResponse.data.success, "\n");

    // Wait a bit to see server logs
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Create another control to test DELETE endpoint
    console.log("3️⃣ Creating second control for DELETE test...");
    const control2Data = {
      pasien: "Test Patient DELETE 2",
      tanggal: tomorrow.toISOString().split("T")[0],
      waktu: "15:00",
      whatsapp: "+6281234567891",
      catatan: "Test delete endpoint",
    };

    const createResponse2 = await axios.post(
      `${BASE_URL}/kontrol`,
      control2Data,
      {
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const kontrolId2 = createResponse2.data.data.id;
    console.log(`✅ Second control created: ${kontrolId2}\n`);

    // 4. Delete control (should trigger delete terminology)
    console.log("4️⃣ Deleting control (should DELETE schedules)...");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/kontrol/${kontrolId2}`,
      {
        headers: {
          Authorization: AUTH_TOKEN,
        },
      }
    );

    console.log("✅ Control deleted successfully");
    console.log("📋 Response message:", deleteResponse.data.message);
    console.log("📋 Success status:", deleteResponse.data.success, "\n");

    console.log("✅ DELETE terminology test completed!");
    console.log('🔍 Check server logs for "DELETE" messages (not "cancel")');
  } catch (error) {
    console.log("❌ Error during test:", error.response?.data || error.message);
  }
}

// Jalankan test
testDeleteTerminology();

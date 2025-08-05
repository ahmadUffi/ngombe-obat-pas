import axios from "axios";

// Test delete jadwal
async function testDeleteJadwal() {
  try {
    // You need to replace these with actual values
    const jadwal_id = "your_jadwal_id_here";
    const jwt_token = "your_jwt_token_here";

    console.log("🗑️  Testing Delete Jadwal...");
    console.log("Jadwal ID:", jadwal_id);
    console.log("");

    const response = await axios.delete(
      `http://localhost:5001/v1/api/jadwal/delete/${jadwal_id}`,
      {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Delete successful!");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("❌ Delete failed!");
    console.error("Status:", error.response?.status);
    console.error("Error:", error.response?.data || error.message);

    // Show more details
    if (error.response?.data) {
      console.log("\n📋 Full Error Response:");
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test waReminderService functions directly
async function testWaReminderService() {
  try {
    console.log("🧪 Testing waReminderService functions...\n");

    // Import the services
    const { getWaRemindersByJadwal, deleteWaRemindersByJadwal } = await import(
      "./src/services/waReminderService.js"
    );

    const testJadwalId = "test-jadwal-id";

    // Test get reminders
    console.log("1. Testing getWaRemindersByJadwal...");
    const reminders = await getWaRemindersByJadwal(testJadwalId);
    console.log("Found reminders:", reminders.length);

    // Test delete reminders
    if (reminders.length > 0) {
      console.log("2. Testing deleteWaRemindersByJadwal...");
      const deleteResult = await deleteWaRemindersByJadwal(testJadwalId);
      console.log("Delete result:", deleteResult);
    }
  } catch (error) {
    console.error("❌ Service test failed:", error.message);
  }
}

// Test wablasService delete function
async function testWablasService() {
  try {
    console.log("🧪 Testing wablasService delete function...\n");

    const { deleteWablasReminder } = await import(
      "./src/services/wablasService.js"
    );

    const testReminderId = "test-reminder-id";

    console.log("Testing deleteWablasReminder...");
    const result = await deleteWablasReminder(testReminderId);
    console.log("Delete result:", result);
  } catch (error) {
    console.error("❌ Wablas service test failed:", error.message);
    console.log("This is expected if using fake reminder ID");
  }
}

// Check server connectivity
async function testServerConnectivity() {
  try {
    console.log("🌐 Testing server connectivity...\n");

    const response = await axios.get(
      "http://localhost:5001/v1/api/jadwal/get-for-web",
      {
        headers: {
          Authorization: "Bearer fake-token",
        },
      }
    );

    console.log("Server response:", response.status);
  } catch (error) {
    console.log(
      "Server status:",
      error.response?.status || "Connection failed"
    );
    console.log(
      "Expected error for fake token:",
      error.response?.status === 401 ? "✅" : "❌"
    );
  }
}

// Main test function
async function runDeleteTests() {
  console.log("🚀 Testing Delete Functionality\n");
  console.log("=====================================\n");

  // Test server connectivity first
  await testServerConnectivity();
  console.log("");

  // Test service functions
  // await testWaReminderService();
  // console.log('');

  // await testWablasService();
  // console.log('');

  // Test actual delete (uncomment when you have real IDs)
  // await testDeleteJadwal();

  console.log("✅ Tests completed!");
  console.log("\n📝 To test actual delete:");
  console.log("1. Create a jadwal first to get jadwal_id");
  console.log("2. Get valid JWT token");
  console.log("3. Update jadwal_id and jwt_token in this file");
  console.log("4. Uncomment testDeleteJadwal() call");
}

// Run tests
runDeleteTests();

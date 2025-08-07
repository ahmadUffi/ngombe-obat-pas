// Test script untuk test cancel schedule functionality
import http from "http";

const baseURL = "http://localhost:5000/v1/api/kontrol";
const authToken =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzIzMDA0MDAzLCJpYXQiOjE3MjMwMDA0MDMsImlzcyI6Imh0dHBzOi8vbXVrbXpoc2JlYXNrZWN0cGh5d3Iuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjlkNzQ3NzVkLTI5ODktNGI5Ny05NDY3LWUyNGVmM2Q2YTc0YyIsImVtYWlsIjoiYWhtYWRAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3MjMwMDA0MDN9XSwic2Vzc2lvbl9pZCI6IjYzNmY5NWMzLTQyNmYtNGU3Yi04MWVhLTJhY2ZlMzcxNGZjNSJ9.tDp59M0wMbejBqhOD0QHbGz6-z-J5UEpEOgEZNfP6t8";

// Helper function untuk HTTP request
function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: "localhost",
      port: 5000,
      path: `/v1/api/kontrol${path}`,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
        ...(postData && { "Content-Length": Buffer.byteLength(postData) }),
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testScheduleCancellation() {
  console.log("🧪 Testing Control Schedule Cancellation Feature\n");

  try {
    // Step 1: Create control with schedules
    console.log("1️⃣ Creating control with WhatsApp schedules...");
    const createResult = await makeRequest("POST", "/create-kontrol", {
      tanggal: "2025-08-15",
      waktu: "14:30",
      dokter: "Dr. Test Cancel",
      nama_pasien: "Test Patient Cancel",
    });

    if (createResult.status !== 201) {
      throw new Error(
        `Failed to create control: ${JSON.stringify(createResult)}`
      );
    }

    const controlId = createResult.data.data.id;
    console.log(`✅ Control created: ${controlId}\n`);

    // Wait a bit for async operations
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 2: Test update isDone = true (should cancel schedules)
    console.log("2️⃣ Marking control as completed (should cancel schedules)...");
    const updateResult = await makeRequest("PATCH", "/done", {
      id: controlId,
      isDone: true,
    });

    if (updateResult.status === 200) {
      console.log("✅ Control marked as completed successfully\n");
    } else {
      console.log(
        `❌ Failed to update control: ${JSON.stringify(updateResult)}\n`
      );
    }

    // Step 3: Clean up - delete the test control
    console.log("3️⃣ Cleaning up - deleting test control...");
    const deleteResult = await makeRequest("DELETE", `/delete/${controlId}`);

    if (deleteResult.status === 200) {
      console.log("✅ Test control deleted successfully");
    } else {
      console.log(
        `❌ Failed to delete control: ${JSON.stringify(deleteResult)}`
      );
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

// Alternative test - just test delete functionality
async function testDeleteWithSchedules() {
  console.log("\n🧪 Testing Delete Control with Schedule Cancellation\n");

  try {
    // Step 1: Create control
    console.log("1️⃣ Creating control for delete test...");
    const createResult = await makeRequest("POST", "/create-kontrol", {
      tanggal: "2025-08-20",
      waktu: "16:00",
      dokter: "Dr. Delete Test",
      nama_pasien: "Test Patient Delete",
    });

    if (createResult.status !== 201) {
      throw new Error(
        `Failed to create control: ${JSON.stringify(createResult)}`
      );
    }

    const controlId = createResult.data.data.id;
    console.log(`✅ Control created: ${controlId}\n`);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 2: Delete control (should cancel schedules)
    console.log("2️⃣ Deleting control (should cancel schedules)...");
    const deleteResult = await makeRequest("DELETE", `/delete/${controlId}`);

    if (deleteResult.status === 200) {
      console.log("✅ Control deleted successfully with schedule cancellation");
    } else {
      console.log(
        `❌ Failed to delete control: ${JSON.stringify(deleteResult)}`
      );
    }
  } catch (error) {
    console.error("❌ Delete test error:", error.message);
  }
}

// Run tests
console.log("🚀 Starting Schedule Cancellation Tests...\n");

testScheduleCancellation()
  .then(() => testDeleteWithSchedules())
  .then(() => {
    console.log("\n✅ All tests completed!");
    console.log("Check server logs for detailed cancellation attempts.");
  })
  .catch((error) => {
    console.error("❌ Test suite failed:", error);
  });

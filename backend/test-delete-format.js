// Test delete reminder dengan format yang benar

import { deleteWablasReminder } from "./src/services/wablasService.js";

console.log("🧪 Testing Wablas Delete with PHP-compatible format\n");

// Test dengan mock reminder ID
const testReminderId = "7055c898-51c3-42da-80bc-4ade8fa5e07a";

console.log("📋 Testing Delete Configuration:");
console.log("- URL: https://sby.wablas.com/api/reminder/" + testReminderId);
console.log("- Method: DELETE");
console.log("- Headers:");
console.log("  - Authorization: token.secret_key");
console.log("  - Content-Type: application/x-www-form-urlencoded");
console.log("- Body: (empty string)");
console.log("");

console.log("🔧 PHP equivalent:");
console.log(`
$curl = curl_init();
$token = "your_token";
$secret_key = "your_secret";
$id = "${testReminderId}";

curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    "Authorization: $token.$secret_key",
));
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data)); // $data = []
curl_setopt($curl, CURLOPT_URL, "https://sby.wablas.com/api/reminder/$id");
`);

console.log("🚀 Testing delete...");

// Test delete function
try {
  const result = await deleteWablasReminder(testReminderId);

  console.log("📊 Delete Result:");
  console.log("- Success:", result.success);

  if (result.success) {
    console.log("✅ Delete successful!");
    console.log("- Response:", result.data);
  } else {
    console.log("⚠️ Delete failed:");
    console.log("- Error:", result.error);
  }
} catch (error) {
  console.error("❌ Test error:", error.message);
}

console.log("\n📝 Implementation Notes:");
console.log("- Following exact PHP format");
console.log("- Same headers as create (with Content-Type)");
console.log("- Empty body data (not undefined)");
console.log("- Graceful error handling");

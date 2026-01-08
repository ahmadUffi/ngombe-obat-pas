// Simple test untuk melihat apakah terminology "delete" sudah benar
// tanpa perlu auth yang rumit

import fs from "fs";
import path from "path";

console.log("🔍 Checking DELETE terminology in codebase...\n");

// Function untuk check file dan cari text "cancel" atau "delete"
function checkTerminology(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    const cancelMatches = [];
    const deleteMatches = [];

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();

      // Skip komentar dalam bahasa Indonesia dan variable names
      if (
        lowerLine.includes("cancel") &&
        !lowerLine.includes("// ") &&
        !lowerLine.includes("* ") &&
        !lowerLine.includes("membatalkan") &&
        !lowerLine.includes("batal")
      ) {
        cancelMatches.push({
          line: index + 1,
          content: line.trim(),
        });
      }

      if (
        lowerLine.includes("delete") &&
        !lowerLine.includes("// ") &&
        !lowerLine.includes("* ")
      ) {
        deleteMatches.push({
          line: index + 1,
          content: line.trim(),
        });
      }
    });

    return { cancelMatches, deleteMatches };
  } catch (error) {
    return { error: error.message };
  }
}

// Check files yang sudah kita update
const filesToCheck = [
  "src/services/wablasScheduleService.js",
  "src/services/controlService.js",
];

console.log("📁 Checking files for terminology consistency:\n");

filesToCheck.forEach((file) => {
  console.log(`🔍 Checking: ${file}`);
  const result = checkTerminology(file);

  if (result.error) {
    console.log(`❌ Error reading file: ${result.error}`);
    return;
  }

  console.log(`   🔴 "cancel" occurrences: ${result.cancelMatches.length}`);
  if (result.cancelMatches.length > 0) {
    result.cancelMatches.forEach((match) => {
      console.log(`      Line ${match.line}: ${match.content}`);
    });
  }

  console.log(`   🟢 "delete" occurrences: ${result.deleteMatches.length}`);
  if (result.deleteMatches.length > 0) {
    result.deleteMatches.slice(0, 5).forEach((match) => {
      // Show only first 5
      console.log(`      Line ${match.line}: ${match.content}`);
    });
    if (result.deleteMatches.length > 5) {
      console.log(`      ... and ${result.deleteMatches.length - 5} more`);
    }
  }

  console.log("");
});

console.log("✅ Terminology check completed!");
console.log(
  '🎯 Goal: Zero "cancel" occurrences, multiple "delete" occurrences'
);

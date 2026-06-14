// Debug script to test import naming logic

// Simulate the import logic
function testImportLogic() {
  console.log("=== Testing Import Logic ===");

  // Test CSV import
  const csvCustomName = "Tên Bộ Thẻ Từ CSV";
  const csvSetName =
    csvCustomName || `Imported from CSV - ${new Date().toLocaleString()}`;
  console.log("CSV Test:");
  console.log("  customName:", csvCustomName);
  console.log("  final setName:", csvSetName);
  console.log("");

  // Test JSON import
  const jsonCustomName = "Tên Bộ Thẻ Từ JSON";
  const jsonData = { title: "Original Title from Data" };
  const jsonSetName =
    jsonCustomName ||
    jsonData.title ||
    jsonData.name ||
    "Imported from Quizlet";
  console.log("JSON Test:");
  console.log("  customName:", jsonCustomName);
  console.log("  data.title:", jsonData.title);
  console.log("  final setName:", jsonSetName);
  console.log("");

  // Test with empty customName
  const emptyCustomName = "";
  const emptySetName = emptyCustomName || jsonData.title || "Default Name";
  console.log("Empty customName Test:");
  console.log("  customName:", `"${emptyCustomName}"`);
  console.log("  data.title:", jsonData.title);
  console.log("  final setName:", emptySetName);
  console.log("");

  // Test with null customName
  const nullCustomName = null;
  const nullSetName = nullCustomName || jsonData.title || "Default Name";
  console.log("Null customName Test:");
  console.log("  customName:", nullCustomName);
  console.log("  data.title:", jsonData.title);
  console.log("  final setName:", nullSetName);
  console.log("");

  // Test the improved logic
  function improvedCheck(customName, fallbackTitle) {
    return customName && customName.trim()
      ? customName.trim()
      : fallbackTitle || "Default";
  }

  console.log("=== Improved Logic Tests ===");
  console.log(
    "improvedCheck('Tên Test', 'Fallback'):",
    improvedCheck("Tên Test", "Fallback")
  );
  console.log("improvedCheck('', 'Fallback'):", improvedCheck("", "Fallback"));
  console.log(
    "improvedCheck('   ', 'Fallback'):",
    improvedCheck("   ", "Fallback")
  );
  console.log(
    "improvedCheck(null, 'Fallback'):",
    improvedCheck(null, "Fallback")
  );
  console.log(
    "improvedCheck(undefined, 'Fallback'):",
    improvedCheck(undefined, "Fallback")
  );
}

testImportLogic();

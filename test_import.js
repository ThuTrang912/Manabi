// Test script to debug import functionality
const testData = {
  csvText: "Hello,Xin chào\nGoodbye,Tạm biệt",
  jsonText: JSON.stringify([
    { term: "Cat", definition: "Con mèo" },
    { term: "Dog", definition: "Con chó" },
  ]),
  customName: "Tên Bộ Thẻ Tùy Chỉnh",
};

console.log("Test data for debugging:");
console.log("CSV Text:", testData.csvText);
console.log("JSON Text:", testData.jsonText);
console.log("Custom Name:", testData.customName);

// This can be used to test the import endpoints
const testRequest = {
  csvText: testData.csvText,
  customName: testData.customName,
};

console.log("Request body that should be sent:");
console.log(JSON.stringify(testRequest, null, 2));

// Simple API test script
const axios = require("axios");

async function testImportAPI() {
  const testData = {
    csvText: "hello,xin chào\ngoodbye,tạm biệt",
    customName: "Bộ Thẻ Test Từ Script",
  };

  console.log("Sending test request:", testData);

  try {
    const response = await axios.post(
      "http://localhost:5001/api/cards/import/quizlet",
      testData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_JWT_TOKEN_HERE", // Replace with real token
        },
      }
    );

    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
    console.log("Card set name:", response.data.cardSet?.name);
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run if backend is available
testImportAPI();

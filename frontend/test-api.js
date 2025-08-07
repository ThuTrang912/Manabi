// Test script để kiểm tra kết nối API
const testAPI = async () => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    console.error("❌ No auth token found. Please login first.");
    return;
  }

  console.log("🔧 Testing API connection...");
  console.log("Token present:", !!token);

  try {
    // Test 1: Get card sets
    console.log("\n1. Testing GET /api/cards/sets");
    const response1 = await fetch("http://localhost:5001/api/cards/sets", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", response1.status);
    if (response1.ok) {
      const data1 = await response1.json();
      console.log("✅ GET card sets successful:", data1);
    } else {
      const error1 = await response1.text();
      console.error("❌ GET card sets failed:", error1);
    }

    // Test 2: Create card set
    console.log("\n2. Testing POST /api/cards/sets");
    const testCardSet = {
      name: `Test Card Set ${Date.now()}`,
      description: "Test card set for debugging",
      source: "manual",
    };

    const response2 = await fetch("http://localhost:5001/api/cards/sets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(testCardSet),
    });

    console.log("Response status:", response2.status);
    if (response2.ok) {
      const data2 = await response2.json();
      console.log("✅ CREATE card set successful:", data2);
    } else {
      const error2 = await response2.text();
      console.error("❌ CREATE card set failed:", error2);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
};

// Call the test function
testAPI();

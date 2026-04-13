async function testValidation() {
  const url = "http://localhost:5001/api/admin/products";
  
  // Test case: Missing fields
  const payload = {
    name: "",
    price: -10,
    // missing other fields
  };

  console.log("Testing POST /api/admin/products with invalid payload...");
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // No auth header here, so it should fail with 401 first if logic is right,
        // but I want to see if validation kicks in if auth is bypassed or for staff.
        // Actually, the middleware order is authenticateAdmin, then validator.
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

testValidation();

const axios = require("axios");
require("dotenv").config();

async function testWPEndpoint() {
  const WP_ENDPOINT = process.env.WP_API_IMPORT_URL;

  if (!WP_ENDPOINT) {
    console.error("❌ WP_PAGE_GENERATE is NOT defined!");
    return;
  }

  console.log("🚀 Testing WordPress import endpoint...");
  console.log("URL:", WP_ENDPOINT);

  try {
    const response = await axios.post(WP_ENDPOINT, {
      name: "Test Template",
      json: {
        content: [],
        page_settings: {},
        version: "0.4"
      }
    });

    console.log("✅ Response:", response.data);
  } catch (err) {
    console.error("❌ Axios error:", err.message);
    if (err.response) {
      console.error("Status code:", err.response.status);
      console.error("Response data:", err.response.data);
    }
  }
}

testWPEndpoint();
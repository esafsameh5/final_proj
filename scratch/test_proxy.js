async function test() {
  try {
    console.log("Fetching from local proxy...");
    const res = await fetch('http://127.0.0.1:5173/api/v1/facilities');
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data length:", JSON.stringify(data).length);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();

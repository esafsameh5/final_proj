async function test() {
  try {
    const res = await fetch('https://digital-health-rest-api.runasp.net/api/v1/facilities');
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", JSON.stringify(data, null, 2).substring(0, 3000));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();

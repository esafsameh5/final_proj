async function test() {
  try {
    console.log("Sending login request directly to backend...");
    const start = Date.now();
    const res = await fetch('https://digital-health-rest-api.runasp.net/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'test_user',
        password: 'Password123!'
      })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response time:", Date.now() - start, "ms");
    console.log("Data:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();

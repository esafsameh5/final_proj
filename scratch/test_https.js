import https from 'https';

console.log("Starting native https request...");
const req = https.get('https://digital-health-rest-api.runasp.net/api/v1/facilities', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body length:', data.length);
  });
});

req.on('error', (e) => {
  console.error('Error occurred:', e);
});

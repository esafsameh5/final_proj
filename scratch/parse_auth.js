import fs from 'fs';

try {
  const swagger = JSON.parse(fs.readFileSync('scratch/swagger.json', 'utf8'));
  
  const endpoints = [
    '/api/v1/facilities/{facilityId}/reports/performance',
    '/api/v1/facilities/{facilityId}/reports/occupancy',
    '/api/v1/facilities/{facilityId}/reports/departments',
    '/api/v1/facilities/{facilityId}/reports/operations',
    '/api/v1/facilities/{facilityId}/reports/patients',
    '/api/v1/facilities/{facilityId}/analytics',
    '/api/v1/users'
  ];

  for (const path of endpoints) {
    console.log(`\n========================================`);
    console.log(`PATH: ${path}`);
    console.log(`========================================`);
    
    const pathObj = swagger.paths[path];
    if (!pathObj) {
      console.log("Not found in swagger.");
      continue;
    }

    const methods = Object.keys(pathObj);
    for (const method of methods) {
      console.log(`Method: ${method.toUpperCase()}`);
      const op = pathObj[method];
      if (op.description) console.log(`Description: ${op.description}`);
      if (op.summary) console.log(`Summary: ${op.summary}`);
      if (op.security) console.log(`Security:`, JSON.stringify(op.security, null, 2));
      
      // Look at parameters
      if (op.parameters) {
        console.log("Parameters:");
        op.parameters.forEach(p => {
          console.log(`- Name: ${p.name}, In: ${p.in}, Description: ${p.description || 'None'}`);
        });
      }
    }
  }
} catch (err) {
  console.error("Error reading swagger:", err);
}

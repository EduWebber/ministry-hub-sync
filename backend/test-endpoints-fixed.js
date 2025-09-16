const http = require('http');

// Simple HTTP client function
function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testEndpoint(path, method = 'GET', postData = null) {
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await httpRequest(options, postData);
    console.log(`✅ ${method} ${path}: ${response.statusCode}`);
    return response;
  } catch (error) {
    console.log(`❌ ${method} ${path}: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Backend Endpoints...\n');

  // Test status endpoint
  await testEndpoint('/api/status');

  // Test programacoes mock endpoint
  await testEndpoint('/api/programacoes/mock?mes=2024-12');

  // Test auth endpoints
  await testEndpoint('/auth/login', 'POST', JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }));

  // Test family members endpoint
  await testEndpoint('/family-members');

  console.log('\n🎯 Test completed!');
}

runTests();
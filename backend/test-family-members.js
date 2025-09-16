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

async function testEndpoint(path, method = 'GET', postData = null, headers = {}) {
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const response = await httpRequest(options, postData);
    console.log(`✅ ${method} ${path}: ${response.statusCode}`);
    if (response.data) {
      try {
        const jsonData = JSON.parse(response.data);
        console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
      } catch (e) {
        console.log(`   Response: ${response.data}`);
      }
    }
    return response;
  } catch (error) {
    console.log(`❌ ${method} ${path}: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Family Members Endpoints...\n');

  // Test list family members
  await testEndpoint('/family-members');

  // Test create family member
  const createResponse = await testEndpoint('/family-members', 'POST', JSON.stringify({
    name: 'John Doe',
    relationship: 'Father'
  }));

  // Test get family member (if created)
  if (createResponse && createResponse.data) {
    try {
      const jsonData = JSON.parse(createResponse.data);
      if (jsonData.familyMember && jsonData.familyMember.id) {
        await testEndpoint(`/family-members/${jsonData.familyMember.id}`);
        
        // Test update family member
        await testEndpoint(`/family-members/${jsonData.familyMember.id}`, 'PUT', JSON.stringify({
          name: 'John Smith',
          relationship: 'Father'
        }));
        
        // Test delete family member
        await testEndpoint(`/family-members/${jsonData.familyMember.id}`, 'DELETE');
      }
    } catch (e) {
      console.log('Error parsing response:', e.message);
    }
  }

  console.log('\n🎯 Family Members tests completed!');
}

runTests();
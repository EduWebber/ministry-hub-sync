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

async function testDesignacoesEndpoint() {
  console.log('🧪 Testing Designacoes Generation Endpoint...\n');

  try {
    const postData = JSON.stringify({
      programacao_id: '11111111-1111-1111-1111-111111111111',
      congregacao_id: '7e90ac8e-d2f4-403a-b78f-55ff20ab7edf'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/designacoes/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const response = await httpRequest(options, postData);
    console.log(`✅ POST /api/designacoes/generate: ${response.statusCode}`);
    
    // Try to parse JSON response
    try {
      const jsonData = JSON.parse(response.data);
      console.log('Response data:', JSON.stringify(jsonData, null, 2));
    } catch (parseError) {
      console.log('Response data (raw):', response.data);
    }
    
    return response;
  } catch (error) {
    console.log(`❌ POST /api/designacoes/generate: ${error.message}`);
    return null;
  }
}

// Run the test
testDesignacoesEndpoint().then(() => {
  console.log('\n🎯 Test completed!');
});
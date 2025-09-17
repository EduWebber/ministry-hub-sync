#!/usr/bin/env node

/**
 * Script to verify that the designacoes endpoint is working correctly
 * Run this after refreshing the Supabase schema cache
 */

const http = require('http');

// Test data
const TEST_DATA = {
  programacao_id: '11111111-1111-1111-1111-111111111111',
  congregacao_id: '7e90ac8e-d2f4-403a-b78f-55ff20ab7edf'
};

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
    const postData = JSON.stringify(TEST_DATA);

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
    
    try {
      const jsonData = JSON.parse(response.data);
      console.log('Response:', JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('\n🎉 SUCCESS: The endpoint is working correctly!');
        console.log('📋 Summary:');
        console.log(`   - Total items: ${jsonData.summary?.total_itens || 0}`);
        console.log(`   - OK assignments: ${jsonData.summary?.designacoes_ok || 0}`);
        console.log(`   - Pending assignments: ${jsonData.summary?.designacoes_pendentes || 0}`);
      } else {
        console.log('\n❌ ISSUE: The endpoint returned an error:');
        console.log(`   - Error: ${jsonData.error}`);
        console.log(`   - Details: ${jsonData.details}`);
      }
    } catch (parseError) {
      console.log('Response (raw):', response.data);
    }
    
  } catch (error) {
    console.log(`❌ POST /api/designacoes/generate: ${error.message}`);
  }
}

// Run the test
testDesignacoesEndpoint().then(() => {
  console.log('\n🎯 Test completed!');
});
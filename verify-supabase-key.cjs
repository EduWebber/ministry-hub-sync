// Let's verify the Supabase key by checking its format and attempting to decode it
const fs = require('fs');

// Read the backend .env file
const envContent = fs.readFileSync('./backend/.env', 'utf8');

// Extract the SUPABASE_SERVICE_ROLE_KEY
const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
if (!match) {
  console.log('❌ Could not find SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const key = match[1].trim();
console.log('Found key:', key.substring(0, 20) + '...');

// Try to decode the JWT token to see if it's valid
try {
  const base64Url = key.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  const payload = JSON.parse(jsonPayload);
  console.log('✅ Key appears to be a valid JWT token');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  // Check if it has the right role
  if (payload.role === 'service_role') {
    console.log('✅ Key has service_role permissions');
  } else {
    console.log('⚠️ Key role:', payload.role);
  }
} catch (error) {
  console.log('❌ Key is not a valid JWT token:', error.message);
}
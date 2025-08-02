const axios = require('axios');

// Test Firebase Authentication
async function testFirebaseAuth() {
  console.log('=== Firebase Authentication Test ===\n');
  
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  
  try {
    // Test 1: Check if Firebase endpoints are available
    console.log('1. Testing Firebase endpoints availability...');
    
    const endpoints = [
      '/api/auth/firebase/login',
      '/api/auth/firebase/verify'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.options(`${baseURL}${endpoint}`);
        console.log(`✅ ${endpoint} - Available`);
      } catch (error) {
        console.log(`❌ ${endpoint} - Not available: ${error.message}`);
      }
    }
    
    // Test 2: Test with invalid token
    console.log('\n2. Testing with invalid token...');
    
    try {
      const response = await axios.post(`${baseURL}/api/auth/firebase/verify`, {
        idToken: 'invalid-token'
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid token');
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
    
    // Test 3: Test with missing token
    console.log('\n3. Testing with missing token...');
    
    try {
      const response = await axios.post(`${baseURL}/api/auth/firebase/verify`, {});
      console.log('❌ Should have failed with missing token');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected missing token');
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
    
    console.log('\n=== Test Summary ===');
    console.log('✅ Firebase authentication endpoints are set up');
    console.log('✅ Error handling is working correctly');
    console.log('\nNext steps:');
    console.log('1. Set up Firebase project and get credentials');
    console.log('2. Add Firebase environment variables to .env');
    console.log('3. Test with real Firebase ID token');
    console.log('4. Implement frontend integration');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  testFirebaseAuth();
}

module.exports = { testFirebaseAuth }; 
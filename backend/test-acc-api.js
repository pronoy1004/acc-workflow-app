const axios = require('axios');

// Test ACC API endpoints
async function testACCApi() {
  const baseUrl = 'http://localhost:5001/api';
  
  try {
    console.log('Testing ACC API endpoints...\n');
    
    // Test 1: Get accounts (should return user info and hubs)
    console.log('1. Testing /api/acc/accounts endpoint...');
    try {
      const accountsResponse = await axios.get(`${baseUrl}/acc/accounts`);
      console.log('✅ Success:', accountsResponse.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n2. Testing /api/acc/hubs endpoint...');
    try {
      const hubsResponse = await axios.get(`${baseUrl}/acc/hubs`);
      console.log('✅ Success:', hubsResponse.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n3. Testing /api/acc/accounts/SLLJDVUBNU3JREXS/projects endpoint...');
    try {
      const projectsResponse = await axios.get(`${baseUrl}/acc/accounts/SLLJDVUBNU3JREXS/projects`);
      console.log('✅ Success:', projectsResponse.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testACCApi();

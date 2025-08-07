// Test API connectivity from Node.js
const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    const response = await axios.get('http://localhost:5001/api/products');
    console.log('Success! Products found:', response.data.products.length);
    console.log('Response status:', response.status);
    console.log('First product:', response.data.products[0]);
  } catch (error) {
    console.error('Error connecting to API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();

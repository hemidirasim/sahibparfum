// Debug script to test upload API locally
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
  console.log('=== UPLOAD API DEBUG TEST ===');
  
  // Check environment variables
  console.log('Environment check:', {
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    blobTokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV
  });
  
  // Create a test image file
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
  
  const form = new FormData();
  form.append('file', testImageBuffer, {
    filename: 'test.png',
    contentType: 'image/png'
  });
  
  try {
    console.log('Sending test request to /api/upload...');
    
    const response = await fetch('https://sahibparfum.az/api/upload', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        'Cookie': 'next-auth.session-token=test' // Mock session
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testUpload();

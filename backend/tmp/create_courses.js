const fs = require('fs');
const http = require('http');
const https = require('https');
const payloadPath = 'c:/Users/gtoal/OneDrive/Escritorio/arg-academy-fe/backend/tmp/payload.json';
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
const data = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/institution-curriculum/ai-generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(data);
req.end();

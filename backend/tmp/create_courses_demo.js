const fs = require('fs');
const http = require('http');
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const schema = require('../src/shared/schema');
const { eq } = require('drizzle-orm');

// Load curriculum payload (the large text you provided)
const payloadPath = 'c:/Users/gtoal/OneDrive/Escritorio/arg-academy-fe/backend/tmp/payload.json';
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

// Database connection (same as seed script)
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_6Mlaq1ZKAuTV@ep-lively-firefly-a5q89531-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
});
const db = drizzle(pool, { schema });

async function getDemoInstitutionId() {
  const result = await db
    .select()
    .from(schema.instituciones)
    .where(eq(schema.instituciones.nombre, 'Colegio Tech Demo'))
    .limit(1);
  if (result.length === 0) {
    throw new Error('Demo institution not found. Run the seed script first.');
  }
  return result[0].id;
}

async function createCurriculum() {
  const institucionId = await getDemoInstitutionId();
  const data = {
    institucionId,
    text: payload.text,
  };
  const json = JSON.stringify(data);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/institution-curriculum/ai-generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json),
    },
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
    });
  });

  req.on('error', (e) => console.error('Request error:', e));
  req.write(json);
  req.end();
}

createCurriculum()
  .catch((e) => console.error('❌', e))
  .finally(() => pool.end());

/**
 * run_seed_colegio_tech.js
 * -------------------------------------------------------
 * Ejecutor del seed de "Colegio Tech Demo" para PostgreSQL.
 * 
 * USO:
 *   node backend/seeds/run_seed_colegio_tech.js
 *
 * REQUISITOS:
 *   - Tener el paquete 'pg' disponible (viene con el backend)
 *   - Tener el .env configurado con DATABASE_URL
 * -------------------------------------------------------
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const SQL_FILE = path.join(__dirname, 'seed_colegio_tech_demo.sql');

async function generatePasswordHash(password = 'Demo2024!') {
  const hash = await bcrypt.hash(password, 10);
  console.log(`\n🔑 Hash para la contraseña "${password}":\n   ${hash}\n`);
  return hash;
}

async function run() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ ERROR: Variable DATABASE_URL no encontrada.');
    console.error('   Asegúrate de tener un archivo .env en la carpeta /backend/');
    process.exit(1);
  }

  // 1. Generar hash real de contraseña
  const hash = await generatePasswordHash('Demo2024!');

  // 2. Leer el archivo SQL y reemplazar el hash placeholder
  let sql = fs.readFileSync(SQL_FILE, 'utf8');
  // Reemplazar todos los hashes placeholder por el hash real generado
  sql = sql.split('$2b$10$Xm3Gg8Rk1vZ2oP5tN6wDJuUaV0BmCfQ9YsHjKlD7ExWzAn4FcMiO').join(hash);

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL.');
    console.log('🌱 Ejecutando seed de Colegio Tech Demo...\n');

    await client.query(sql);

    console.log('\n✅ Seed completado exitosamente.');
    console.log('\n📋 CREDENCIALES DE ACCESO (contraseña: Demo2024!):');
    console.log('┌────────────────────────────────────────────────────────────────────────┐');
    console.log('│  ROL         │  EMAIL                                   │  CONTRASEÑA   │');
    console.log('├────────────────────────────────────────────────────────────────────────┤');
    console.log('│  Admin       │  admin@colegio-tech.demo                 │  Demo2024!    │');
    console.log('│  Profesor 1  │  rodrigo.mendez@colegio-tech.demo        │  Demo2024!    │');
    console.log('│  Profesor 2  │  laura.castillo@colegio-tech.demo        │  Demo2024!    │');
    console.log('│  Tutor       │  carmen.rios@colegio-tech.demo           │  Demo2024!    │');
    console.log('│  Estudiante  │  valeria.torres@colegio-tech.demo        │  Demo2024!    │');
    console.log('│  Estudiante  │  diego.morales@colegio-tech.demo         │  Demo2024!    │');
    console.log('│  Estudiante  │  sofia.guerrero@colegio-tech.demo        │  Demo2024!    │');
    console.log('│  Especialista│  andres.perez@colegio-tech.demo          │  Demo2024!    │');
    console.log('│  Especialista│  isabella.vargas@colegio-tech.demo       │  Demo2024!    │');
    console.log('└────────────────────────────────────────────────────────────────────────┘');

  } catch (err) {
    console.error('\n❌ Error durante el seed:', err.message);
    if (err.detail) console.error('   Detalle:', err.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

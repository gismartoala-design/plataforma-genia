
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/shared/schema';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';

dotenv.config({ path: join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function checkData() {
  const allInsts = await db.select().from(schema.instituciones);
  const allUsers = await db.select().from(schema.usuarios);
  const allCursos = await db.select().from(schema.cursos);

  const report = {
    instituciones: allInsts,
    usuarios: allUsers.map(u => ({ id: u.id, nombre: u.nombre, email: u.email, roleId: u.roleId, institucionId: u.institucionId })),
    cursos: allCursos
  };

  fs.writeFileSync('db_report.json', JSON.stringify(report, null, 2));
  console.log('Report written to db_report.json');

  await pool.end();
}

checkData();

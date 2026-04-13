
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../shared/schema';
import { eq, or, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function findStaleIds() {
  console.log('--- FINDING STALE CURSO_ID = 1 ---');
  
  // 1. Check in modulos
  const mod1 = await db.select().from(schema.modulos).where(eq(schema.modulos.cursoId, 1));
  console.log('Modulos with curso_id=1:', mod1.map(m => m.id));

  // 2. Check in usuarios
  const u1 = await db.select().from(schema.usuarios).where(eq(schema.usuarios.cursoId, 1));
  console.log('Usuarios with curso_id=1:', u1.map(u => u.id));

  // 3. Check in asignaciones
  const a1 = await db.select().from(schema.asignaciones).where(eq(schema.asignaciones.moduloId, 1)); // Assuming module 1 might be the problem
  console.log('Asignaciones for module_id=1:', a1.map(a => a.id));

  // 4. Check teacher 145's modules specifically
  const tMods = await db.select().from(schema.modulos).where(eq(schema.modulos.profesorId, 145));
  console.log('Teacher 145 Module curso_ids:', tMods.map(m => m.cursoId));

  process.exit(0);
}

findStaleIds().catch(err => {
  console.error(err);
  process.exit(1);
});

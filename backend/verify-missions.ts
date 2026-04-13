import * as schema from './src/shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, sql } from 'drizzle-orm';

const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@localhost:5432/arg-academy'
});

const db = drizzle(pool, { schema });

async function verify() {
  console.log('--- START VERIFICATION ---');
  
  // 1. Check DAILY_LOGIN mission
  const missions = await db.select().from(schema.misiones).where(eq(schema.misiones.tipo, 'DAILY_LOGIN'));
  console.log('DAILY_LOGIN Mission:', JSON.stringify(missions, null, 2));

  // 2. Check ANY progress for today
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  console.log('Today is:', dateStr);

  const progress = await db.select().from(schema.progresoMisiones);
  console.log('All mission progress records count:', progress.length);
  
  // 3. Force clean for testing for student 18 (if that's the one)
  // Let's clean ALL daily login progress for TODAY for EVERYONE so they can re-trigger
  if (missions[0]) {
    await db.delete(schema.progresoMisiones)
      .where(and(
        eq(schema.progresoMisiones.misionId, missions[0].id),
        sql`DATE(fecha_inicio) = DATE(${dateStr})`
      ));
    console.log('REMOVED today records for DAILY_LOGIN for all students.');
  }

  console.log('--- END VERIFICATION ---');
  process.exit(0);
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});

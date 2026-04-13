import * as schema from './src/shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, sql } from 'drizzle-orm';

const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@localhost:5432/arg-academy'
});

const db = drizzle(pool, { schema });

async function reset() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateStr = today.toISOString().split('T')[0];

  console.log(`Resetting DAILY_LOGIN missions for all students on ${dateStr}...`);

  // Find the DAILY_LOGIN mission ID
  const [mission] = await db.select()
    .from(schema.misiones)
    .where(eq(schema.misiones.tipo, 'DAILY_LOGIN'))
    .limit(1);

  if (!mission) {
    console.log('Mission not found');
    process.exit(0);
  }

  // Delete progress for today
  await db.delete(schema.progresoMisiones)
    .where(and(
      eq(schema.progresoMisiones.misionId, mission.id),
      sql`DATE(fecha_inicio) = DATE(${dateStr})`
    ));

  console.log('SUCCESS: Mission progress reset. Please refresh your dashboard.');
  process.exit(0);
}

reset().catch(e => {
  console.error(e);
  process.exit(1);
});

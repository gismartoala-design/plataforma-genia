import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const sql = postgres(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6Mlaq1ZKAuTV@ep-lively-firefly-a5q89531-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require');
  
  console.log('Adding calificacion_numerica columns to tables...');
  try {
    const tables = ['entregas_bd', 'entregas_pim', 'entregas_it', 'entregas_pic', 'entregas_kids'];
    for (const table of tables) {
        await sql.unsafe(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "calificacion_numerica" integer;`);
        console.log(`Added column to ${table}`);
    }

    console.log('Migration successfully applied!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();

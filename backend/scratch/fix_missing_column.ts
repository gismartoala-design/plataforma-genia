import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function fixDb() {
  const sql = postgres(process.env.DATABASE_URL!);
  
  console.log('Adding "activo" column to "secciones_inst"...');
  try {
    await sql.unsafe('ALTER TABLE secciones_inst ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;');
    console.log('Column added successfully!');
  } catch (err) {
    console.error('Failed to add column:', err);
  } finally {
    await sql.end();
  }
}

fixDb();


import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log('🚀 Iniciando migración de Geniomonedas y Skins...');

  try {
    // 1. Nuevas columnas en Usuarios
    console.log('--- Actualizando tabla usuarios ---');
    await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS geniomonedas INTEGER DEFAULT 0;`;
    await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS skin_equipada_id INTEGER;`;

    // 2. Nuevas columnas en Niveles
    console.log('--- Actualizando tabla niveles ---');
    await sql`ALTER TABLE niveles ADD COLUMN IF NOT EXISTS google_meet_url TEXT;`;
    await sql`ALTER TABLE niveles ADD COLUMN IF NOT EXISTS google_calendar_url TEXT;`;

    // 3. Nueva tabla Skins
    console.log('--- Creando tabla skins ---');
    await sql`
      CREATE TABLE IF NOT EXISTS skins (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio_geniomonedas INTEGER DEFAULT 0,
        imagen_url TEXT NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        disponible BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      );
    `;

    // 4. Nueva tabla Usuarios Skins
    console.log('--- Creando tabla usuarios_skins ---');
    await sql`
      CREATE TABLE IF NOT EXISTS usuarios_skins (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        skin_id INTEGER REFERENCES skins(id),
        fecha_adquisicion TIMESTAMP DEFAULT NOW()
      );
    `;

    // 5. Insertar some default skins
    console.log('--- Insertando skins iniciales ---');
    await sql`
      INSERT INTO skins (nombre, descripcion, precio_geniomonedas, imagen_url, tipo)
      VALUES 
        ('Gorra de Hacker', 'Para los genios de la ciberseguridad', 1, 'skin_hacker_cap', 'avatar_head'),
        ('Capa de Innovador', 'Solo para los que rompen esquemas', 2, 'skin_innovator_cape', 'avatar_body'),
        ('Marco de Oro', 'Demuestra tu estatus premium', 3, 'skin_gold_frame', 'profile_frame')
      ON CONFLICT DO NOTHING;
    `;

    console.log('✅ Migración completada con éxito.');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

migrate();

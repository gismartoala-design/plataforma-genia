import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log('🌱 Seeding Latam Companies...');

  const companies = [
    {
      nombre: 'Game Creators Company',
      especializacion: 'Desarrollo de Videojuegos',
      descripcion: 'En esta compañía los estudiantes aprenden a diseñar y desarrollar videojuegos interactivos, comprendiendo los principios de la lógica de programación y el diseño de experiencias digitales.',
      competencias: [
        'Pensamiento computacional',
        'Lógica de programación',
        'Diseño de videojuegos',
        'Creación de personajes y mundos interactivos',
        'Programación por bloques'
      ],
      proyectos: [
        'Videojuegos educativos',
        'Juegos interactivos',
        'Experiencias narrativas digitales'
      ]
    },
    {
      nombre: 'AI Explorers Company',
      especializacion: 'Inteligencia Artificial',
      descripcion: 'Esta compañía introduce a los estudiantes en el concepto de inteligencia artificial mediante herramientas visuales y experiencias interactivas.',
      competencias: [
        'Comprensión básica de inteligencia artificial',
        'Análisis de patrones',
        'Lógica de automatización',
        'Uso de herramientas de IA educativas'
      ],
      proyectos: [
        'Sistemas simples de reconocimiento',
        'Experiencias interactivas con IA',
        'Juegos inteligentes'
      ]
    },
    {
      nombre: 'App Builders Company',
      especializacion: 'Desarrollo de aplicaciones móviles',
      descripcion: 'En esta compañía los estudiantes aprenden a crear aplicaciones móviles simples orientadas a resolver problemas cotidianos.',
      competencias: [
        'Lógica de aplicaciones',
        'Diseño de interfaces',
        'Interacción digital',
        'Pensamiento de solución de problemas'
      ],
      proyectos: [
        'Aplicaciones educativas',
        'Apps de organización'
      ]
    }
  ];

  for (const company of companies) {
    const existing = await db.select().from(schema.latamCompanias).where(sql`nombre = ${company.nombre}`);
    if (existing.length === 0) {
      await db.insert(schema.latamCompanias).values(company as any);
      console.log(`✅ Created company: ${company.nombre}`);
    } else {
      console.log(`⚠️ Company ${company.nombre} already exists, skipping.`);
    }
  }

  console.log('✅ Seeding completed.');
  process.exit(0);
}

// Helper for raw SQL until eq is imported or similar
import { sql } from 'drizzle-orm';

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/edu_connect');
  
  console.log('Applying targeted migration for Kids tables...');
  try {
    await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS "plantillas_kids" (
            "id" serial PRIMARY KEY NOT NULL,
            "nivel_id" integer,
            "titulo" varchar(255),
            "descripcion" text,
            "actividades" jsonb,
            "configuracion" jsonb,
            "tipo" varchar(50) DEFAULT 'adventure',
            "video_url" text,
            "fecha_creacion" timestamp DEFAULT now()
        );
    `);
    console.log('plantillas_kids created or exists');

    await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS "entregas_kids" (
            "id" serial PRIMARY KEY NOT NULL,
            "estudiante_id" integer,
            "plantilla_kids_id" integer,
            "resultados" jsonb,
            "calificacion_numerica" integer,
            "feedback_profe" text,
            "fecha_subida" timestamp DEFAULT now()
        );
    `);
    console.log('entregas_kids created or exists');

    try {
        await sql.unsafe(`ALTER TABLE "plantillas_kids" ADD CONSTRAINT "plantillas_kids_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;`);
        console.log('Added foreign key for plantillas_kids');
    } catch(e) { console.log('Notice: FK for plantillas_kids might already exist.'); }
    
    try {
        await sql.unsafe(`ALTER TABLE "entregas_kids" ADD CONSTRAINT "entregas_kids_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;`);
        console.log('Added foreign key for entregas_kids to usuarios');
    } catch(e) { console.log('Notice: FK for entregas_kids to usuarios might already exist.'); }
    
    try {
        await sql.unsafe(`ALTER TABLE "entregas_kids" ADD CONSTRAINT "entregas_kids_plantilla_kids_id_plantillas_kids_id_fk" FOREIGN KEY ("plantilla_kids_id") REFERENCES "public"."plantillas_kids"("id") ON DELETE no action ON UPDATE no action;`);
        console.log('Added foreign key for entregas_kids to plantillas_kids');
    } catch(e) { console.log('Notice: FK for entregas_kids to plantillas_kids might already exist.'); }

    console.log('Migration successfully applied!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();

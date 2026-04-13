
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6Mlaq1ZKAuTV@ep-lively-firefly-a5q89531-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
});

const db = drizzle(pool, { schema });

async function main() {
    console.log('Seeding database...');

    // 1. Seed Roles
    console.log('Seeding Roles...');
    const rolesData = [
        { id: 1, nombreRol: 'Admin' },
        { id: 2, nombreRol: 'Profesor' },
        { id: 3, nombreRol: 'Estudiante' },
        { id: 6, nombreRol: 'Kids' },
        { id: 7, nombreRol: 'Profesor Kids' },
        { id: 8, nombreRol: 'Admin Institucional' },
        { id: 9, nombreRol: 'Profesor Institucional' },
        { id: 10, nombreRol: 'Estudiante Institucional' },
        { id: 11, nombreRol: 'Profesor LATAM' },
        { id: 12, nombreRol: 'Estudiante LATAM' },
        { id: 13, nombreRol: 'Profesor Tutor Institucional' }
    ];

    for (const role of rolesData) {
        await db.insert(schema.roles).values(role).onConflictDoNothing().execute();
    }

    // 2. Seed Planes
    console.log('Seeding Planes...');
    const plansData = [
        { id: 1, nombrePlan: 'Básico', precio: '0.00' },
        { id: 2, nombrePlan: 'Digital', precio: '29.99' },
        { id: 3, nombrePlan: 'Pro', precio: '59.99' }
    ];

    for (const plan of plansData) {
        await db.insert(schema.planes).values(plan).onConflictDoNothing().execute();
    }

    // 3. Seed Admin User
    console.log('Seeding Admin User...');
    const adminEmail = 'admin@edu.com';
    const existingAdmin = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, adminEmail)).limit(1);

    if (existingAdmin.length === 0) {
        await db.insert(schema.usuarios).values({
            nombre: 'Administrador Principal',
            email: adminEmail,
            password: 'admin',
            roleId: 1,
            planId: 3,
            activo: true
        }).execute();
    }

    // 7. Seed Institutional Demo
    console.log('Seeding Institutional Demo...');
    let demoInstId: number | undefined;
    const existingInst = await db.select().from(schema.instituciones).where(eq(schema.instituciones.nombre, 'Colegio Tech Demo')).limit(1);
    if (existingInst.length === 0) {
        const [inst] = await db.insert(schema.instituciones).values({
            nombre: 'Colegio Tech Demo'
        }).returning();
        demoInstId = inst.id;
    } else {
        demoInstId = existingInst[0].id;
    }

    const instAdminEmail = 'admin.inst@edu.com';
    const existingInstAdmin = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, instAdminEmail)).limit(1);
    if (existingInstAdmin.length === 0) {
        await db.insert(schema.usuarios).values({
            nombre: 'Admin Institucional Demo',
            email: instAdminEmail,
            password: 'admin',
            roleId: 8,
            planId: 3,
            activo: true,
            institucionId: demoInstId
        }).execute();
    }

    const instProfEmail = 'prof.inst@edu.com';
    const existingInstProf = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, instProfEmail)).limit(1);
    if (existingInstProf.length === 0) {
        await db.insert(schema.usuarios).values({
            nombre: 'Profesor Institucional Demo',
            email: instProfEmail,
            password: 'admin',
            roleId: 9,
            planId: 3,
            activo: true,
            institucionId: demoInstId
        }).execute();
    }

    // 8. Seed Latam Academy Demo
    console.log('Seeding Latam Academy Demo...');
    const latamProfEmail = 'profe.latam@genios.com';
    const existingLatamProf = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, latamProfEmail)).limit(1);
    if (existingLatamProf.length === 0) {
        await db.insert(schema.usuarios).values({
            nombre: 'Líder de Innovación LATAM',
            email: latamProfEmail,
            password: 'admin',
            roleId: 11,
            planId: 3,
            activo: true
        }).execute();
    }

    const latamStudentEmail = 'student.latam@genios.com';
    const existingLatamStudent = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, latamStudentEmail)).limit(1);
    if (existingLatamStudent.length === 0) {
        await db.insert(schema.usuarios).values({
            nombre: 'Talento LATAM 001',
            email: latamStudentEmail,
            password: 'admin',
            roleId: 12,
            planId: 3,
            activo: true
        }).execute();
    }

    // 9. Seed Latam Companies
    console.log('Seeding Latam Companies...');
    const companies = [
        {
            nombre: 'Game Creators Company',
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
        const existing = await db.select().from(schema.latamCompanias).where(eq(schema.latamCompanias.nombre, company.nombre)).limit(1);
        if (existing.length === 0) {
            await db.insert(schema.latamCompanias).values(company as any).execute();
            console.log(`✅ Created company: ${company.nombre}`);
        }
    }

    console.log('Seeding complete.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

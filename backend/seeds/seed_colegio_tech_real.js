/**
 * seed_colegio_tech_real.js
 * -------------------------------------------------------
 * Script de migración de datos REALES del Colegio Tech Demo.
 * 
 * Este script recrea la estructura completa:
 * - Institución
 * - Cursos (1ero EGB a 3ro Bachillerato)
 * - Secciones Institucionales
 * - Lecciones/Módulos Institucionales
 * - Usuarios (Admin, Profesores, Estudiantes)
 * 
 * USO:
 *   DATABASE_URL=tu_url_de_postgres node backend/seeds/seed_colegio_tech_real.js
 * -------------------------------------------------------
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const DATA = {
  institucion: {
    nombre: "Colegio Tech Demo",
    logoUrl: "https://via.placeholder.com/150?text=CTD",
    configuracionVisual: { theme: "cyberpunk", primaryColor: "#0ea5e9" }
  },
  cursos: [
    { id: 11, nombre: "Nivel 1 · Reconocimiento – 2.º de EGB" },
    { id: 12, nombre: "Nivel 2 · Comprensión – 3.º de EGB" },
    { id: 13, nombre: "Nivel 2 · Comprensión – 4.º de EGB" },
    { id: 14, nombre: "Nivel 3 · Aplicación – 5.º de EGB" },
    { id: 15, nombre: "Nivel 3 · Aplicación – 6.º de EGB" },
    { id: 16, nombre: "Nivel 3 · Aplicación – 7.º de EGB" },
    { id: 17, nombre: "Nivel 4 · Diseño – 8.º de EGB" },
    { id: 18, nombre: "Nivel 4 · Diseño – 9.º de EGB" },
    { id: 19, nombre: "Nivel 4 · Diseño – 10.º de EGB" },
    { id: 20, nombre: "Nivel 5 · Innovación – 1.º de BGU (Innovación emergente)" },
    { id: 21, nombre: "Nivel 5 · Innovación – 2.º de BGU (Innovación aplicada)" },
    { id: 22, nombre: "Nivel 5 · Innovación – 3.º de BGU (Innovación proyectiva)" }
  ],
  secciones: [
    { id: 5, curso_id: 11, nombre: "Reconozco usos, funciones y secuencias del entorno", orden: 0 },
    { id: 6, curso_id: 11, nombre: "Comprendo respuestas, cambios y relaciones simples", orden: 1 },
    { id: 7, curso_id: 11, nombre: "Imagino, represento y mejoro soluciones sencillas", orden: 2 },
    { id: 8, curso_id: 11, nombre: "Creo soluciones simples y explico cómo ayudan", orden: 3 },
    { id: 9, curso_id: 12, nombre: "Comprendo objetos, componentes y funciones", orden: 0 },
    { id: 10, curso_id: 12, nombre: "Represento procesos, patrones y decisiones simples", orden: 1 },
    { id: 11, curso_id: 12, nombre: "Diseño y construyo soluciones sencillas con criterios básicos", orden: 2 },
    { id: 12, curso_id: 12, nombre: "Organizo información y explico cómo una solución responde a una necesidad", orden: 3 },
    { id: 13, curso_id: 13, nombre: "Analizo funciones, estructuras y soluciones sencillas", orden: 0 },
    { id: 14, curso_id: 13, nombre: "Organizo procesos y resuelvo retos con secuencias, patrones y decisiones", orden: 1 },
    { id: 15, curso_id: 13, nombre: "Diseño, pruebo y mejoro prototipos sencillos", orden: 2 },
    { id: 16, curso_id: 13, nombre: "Uso información simple para elegir, comunicar y valorar soluciones", orden: 3 },
    { id: 17, curso_id: 14, nombre: "Aplico lógica y estructura para resolver retos funcionales", orden: 0 },
    { id: 18, curso_id: 14, nombre: "Construyo soluciones guiadas con entradas, procesos y salidas", orden: 1 },
    { id: 19, curso_id: 14, nombre: "Integro componentes y mejoro el funcionamiento de una solución", orden: 2 },
    { id: 20, curso_id: 14, nombre: "Uso información simple para evaluar, comunicar e impactar", orden: 3 },
    { id: 21, curso_id: 15, nombre: "Modelo procesos y construyo soluciones funcionales más estables", orden: 0 },
    { id: 22, curso_id: 15, nombre: "Integro entradas, decisiones y control en sistemas simples", orden: 1 },
    { id: 23, curso_id: 15, nombre: "Ajusto, optimizo y mejoro soluciones guiadas", orden: 2 },
    { id: 24, curso_id: 15, nombre: "Uso datos simples para evaluar desempeño y tomar decisiones responsables", orden: 3 },
    { id: 25, curso_id: 16, nombre: "Aplico modelos lógicos para resolver problemas funcionales más integrados", orden: 0 },
    { id: 26, curso_id: 16, nombre: "Integro componentes físicos o digitales para lograr comportamientos funcionales claros", orden: 1 },
    { id: 27, curso_id: 16, nombre: "Pruebo, ajusto y justifico mejoras en soluciones guiadas", orden: 2 },
    { id: 28, curso_id: 16, nombre: "Uso pruebas e información para valorar desempeño, comunicar resultados e identificar impacto", orden: 3 },
    { id: 29, curso_id: 17, nombre: "Analizo sistemas y formulo retos de diseño con criterios iniciales", orden: 0 },
    { id: 30, curso_id: 17, nombre: "Modelo lógicamente soluciones para organizar procesos y decisiones", orden: 1 },
    { id: 31, curso_id: 17, nombre: "Represento propuestas y planifico soluciones con intención de diseño", orden: 2 },
    { id: 32, curso_id: 17, nombre: "Construyo prototipos iniciales e integro componentes con coherencia funcional", orden: 3 },
    { id: 33, curso_id: 17, nombre: "Uso datos simples y pruebas para mejorar soluciones de diseño", orden: 4 },
    { id: 34, curso_id: 17, nombre: "Diseño sistemas que responden a condiciones, eventos o datos básicos", orden: 5 },
    { id: 35, curso_id: 17, nombre: "Reviso el diseño desde el usuario, la seguridad e impacto", orden: 6 },
    { id: 36, curso_id: 17, nombre: "Desarrollo un proyecto integrador de diseño intencional", orden: 7 },
    { id: 37, curso_id: 18, nombre: "Analizo retos y sistemas con mayor precisión técnica escolar", orden: 0 },
    { id: 38, curso_id: 18, nombre: "Organizo la arquitectura lógica de soluciones más integradas", orden: 1 },
    { id: 39, curso_id: 18, nombre: "Comparo alternativas y selecciono propuestas con criterios múltiples", orden: 2 },
    { id: 40, curso_id: 18, nombre: "Integro componentes y desarrollo prototipos funcionales más robustos", orden: 3 },
    { id: 41, curso_id: 18, nombre: "Uso pruebas y evidencia para optimizar soluciones tecnológicas", orden: 4 },
    { id: 42, curso_id: 18, nombre: "Desarrollo sistemas responsivos y automatización escolar con mayor control", orden: 5 },
    { id: 43, curso_id: 18, nombre: "Evalúo experiencia de usuario, sostenibilidad y ética del diseño", orden: 6 },
    { id: 44, curso_id: 18, nombre: "Desarrollo un proyecto integrador de integración y optimización", orden: 7 },
    { id: 45, curso_id: 19, nombre: "Analizo desafíos tecnológicos como sistemas y defino arquitecturas de solución", orden: 0 },
    { id: 46, curso_id: 19, nombre: "Modelo la lógica de control y el comportamiento de soluciones complejas a nivel escolar", orden: 1 },
    { id: 47, curso_id: 19, nombre: "Tomo decisiones de diseño considerando viabilidad, trade-offs e impacto", orden: 2 },
    { id: 48, curso_id: 19, nombre: "Integro y valido prototipos desde una lógica sistémica", orden: 3 },
    { id: 49, curso_id: 19, nombre: "Uso indicadores, datos y evidencia para valorar desempeño y mejorar", orden: 4 },
    { id: 50, curso_id: 19, nombre: "Desarrollo sistemas responsivos o automatizados con criterio y control", orden: 5 },
    { id: 51, curso_id: 19, nombre: "Evalúo sostenibilidad, ciudadanía e impacto de implementación", orden: 6 },
    { id: 52, curso_id: 19, nombre: "Desarrollo un proyecto integrador de diseño sistémico y validación", orden: 7 },
    { id: 53, curso_id: 20, nombre: "Identifico oportunidades de innovación en sistemas, contextos y necesidades reales", orden: 0 },
    { id: 54, curso_id: 20, nombre: "Modelo soluciones innovadoras integrando lógica, datos y comportamiento", orden: 1 },
    { id: 55, curso_id: 20, nombre: "Diseño propuestas con valor, viabilidad e impacto inicial", orden: 2 },
    { id: 56, curso_id: 20, nombre: "Desarrollo prototipos funcionales para explorar y validar innovación", orden: 3 },
    { id: 57, curso_id: 20, nombre: "Valido propuestas mediante pruebas, datos y retroalimentación de usuarios", orden: 4 },
    { id: 58, curso_id: 20, nombre: "Desarrollo soluciones automatizadas, conectadas o inteligentes con intención de uso", orden: 5 },
    { id: 59, curso_id: 20, nombre: "Evalúo impacto, sostenibilidad y responsabilidad de la innovación", orden: 6 },
    { id: 60, curso_id: 20, nombre: "Desarrollo un proyecto integrador de innovación emergente", orden: 7 },
    { id: 61, curso_id: 21, nombre: "Analizo oportunidades de innovación con foco en valor, contexto y factibilidad", orden: 0 },
    { id: 62, curso_id: 21, nombre: "Modelo arquitecturas de solución con integración funcional y estratégica", orden: 1 },
    { id: 63, curso_id: 21, nombre: "Diseño propuestas innovadoras considerando viabilidad, diferenciación y sostenibilidad", orden: 2 },
    { id: 64, curso_id: 21, nombre: "Desarrollo prototipos funcionales para validación aplicada", orden: 3 },
    { id: 65, curso_id: 21, nombre: "Valido soluciones mediante pruebas, datos y retroalimentación ampliada", orden: 4 },
    { id: 66, curso_id: 21, nombre: "Integro automatización, conectividad o inteligencia con criterio de uso e impacto", orden: 5 },
    { id: 67, curso_id: 21, nombre: "Evalúo implementación, impacto y responsabilidad de la innovación aplicada", orden: 6 },
    { id: 68, curso_id: 21, nombre: "Desarrollo un proyecto integrador de innovación aplicada y validación ampliada", orden: 7 },
    { id: 69, curso_id: 22, nombre: "Identifico desafíos estratégicos y proyecto oportunidades de innovación con impacto", orden: 0 },
    { id: 70, curso_id: 22, nombre: "Diseño arquitecturas de solución con integración avanzada y criterio técnico", orden: 1 },
    { id: 71, curso_id: 22, nombre: "Tomo decisiones de innovación considerando valor, diferenciación, viabilidad y sostenibilidad", orden: 2 },
    { id: 72, curso_id: 22, nombre: "Desarrollo prototipos integrados para validación avanzada y escenarios de uso", orden: 3 },
    { id: 73, curso_id: 22, nombre: "Valido soluciones con evidencia, datos y retroalimentación para sustentar decisiones", orden: 4 },
    { id: 74, curso_id: 22, nombre: "Integro automatización, conectividad o inteligencia con propósito, límites y responsabilidad", orden: 5 },
    { id: 75, curso_id: 22, nombre: "Evalúo implementación, impacto y proyección de la innovación en contextos reales o simulados", orden: 6 },
    { id: 76, curso_id: 22, nombre: "Desarrollo un proyecto integrador de innovación proyectiva como síntesis del perfil de egreso", orden: 7 }
  ],
  usuarios: [
    { nombre: "Admin Institucional Demo", email: "admin.inst@edu.com", role_id: 8, avatar: "avatar_boy" },
    { nombre: "D I", email: "d.i@geniosbot.org", role_id: 8, avatar: "avatar_boy" },
    { nombre: "Profesor Institucional Demo", email: "prof.inst@edu.com", role_id: 9, avatar: "avatar_boy" },
    { nombre: "Jostin Duarte", email: "jostin.d@geniosbot.org", role_id: 9, curso_id: 11, avatar: "avatar_boy" },
    { nombre: "Estudiante I", email: "estudiante.i@geniosbot.org", role_id: 10, avatar: "avatar_boy" }
  ]
};

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL.');

    // 1. Obtener planes y roles básicos (para evitar fallos por FKs)
    let planId;
    const planRes = await client.query("SELECT id FROM planes WHERE nombre_plan = 'Basic' LIMIT 1");
    if (planRes.rows.length > 0) {
      planId = planRes.rows[0].id;
    } else {
      const newPlan = await client.query("INSERT INTO planes (nombre_plan, precio) VALUES ('Basic', 0) RETURNING id");
      planId = newPlan.rows[0].id;
    }

    // 2. Crear Institución
    console.log('🏫 Creando institución...');
    const instRes = await client.query(`
      INSERT INTO instituciones (nombre, logo_url, configuracion_visual)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [DATA.institucion.nombre, DATA.institucion.logoUrl, JSON.stringify(DATA.institucion.configuracionVisual)]);
    
    let instId;
    if (instRes.rows.length > 0) {
      instId = instRes.rows[0].id;
    } else {
      const existing = await client.query("SELECT id FROM instituciones WHERE nombre = $1", [DATA.institucion.nombre]);
      instId = existing.rows[0].id;
    }

    // 3. Crear Cursos
    console.log('📘 Creando cursos (2.º EGB - 3.º BGU)...');
    const cursoMap = {}; // original_id -> new_id
    for (const curso of DATA.cursos) {
      const res = await client.query(`
        INSERT INTO cursos (nombre, institucion_id)
        VALUES ($1, $2)
        RETURNING id
      `, [curso.nombre, instId]);
      cursoMap[curso.id] = res.rows[0].id;
    }

    // 4. Crear Secciones y Módulos Institucionales
    console.log('📦 Creando currículo institucional (Secciones y Lecciones)...');
    const seccionMap = {}; // original_id -> new_id
    for (const seccion of DATA.secciones) {
      const res = await client.query(`
        INSERT INTO secciones_inst (curso_id, nombre, orden)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [cursoMap[seccion.curso_id], seccion.nombre, seccion.orden]);
      seccionMap[seccion.id] = res.rows[0].id;

      // Cada sección tiene un módulo institucional por defecto con el mismo título (según data real)
      await client.query(`
        INSERT INTO modulos_inst (seccion_id, curso_id, titulo, orden, tipo)
        VALUES ($1, $2, $3, $4, $5)
      `, [seccionMap[seccion.id], cursoMap[seccion.curso_id], "Introducción y Actividades", 0, "lesson"]);
    }

    // 5. Crear Usuarios
    console.log('👥 Creando usuarios...');
    const passwordHash = await bcrypt.hash('Demo2024!', 10);
    for (const user of DATA.usuarios) {
      const cursoId = user.curso_id ? cursoMap[user.curso_id] : null;
      await client.query(`
        INSERT INTO usuarios (role_id, plan_id, nombre, email, password, activo, institucion_id, curso_id, avatar, institucion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (email) DO NOTHING
      `, [user.role_id, planId, user.nombre, user.email, passwordHash, true, instId, cursoId, user.avatar, DATA.institucion.nombre]);
    }

    console.log('\n🚀 MIGRACIÓN COMPLETADA EXITOSAMENTE.');
    console.log('--------------------------------------------------');
    console.log('Institución: Colegio Tech Demo');
    console.log(`Cursos creados: ${DATA.cursos.length}`);
    console.log(`Unidades curriculares: ${DATA.secciones.length}`);
    console.log('Acceso Admin: admin.inst@edu.com / Demo2024!');
    console.log('--------------------------------------------------');

  } catch (err) {
    console.error('❌ ERROR DURANTE LA MIGRACIÓN:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

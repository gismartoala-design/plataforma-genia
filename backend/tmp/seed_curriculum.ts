import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6Mlaq1ZKAuTV@ep-lively-firefly-a5q89531-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require');

// ────────────────────────────────────────────
// CURRICULUM DATA
// Each entry = one course with its modules
// ────────────────────────────────────────────
const CURRICULUM: { courseName: string; modules: string[] }[] = [
  {
    courseName: 'Nivel 1 · Reconocimiento – 2.º de EGB',
    modules: [
      'Reconozco usos, funciones y secuencias del entorno',
      'Comprendo respuestas, cambios y relaciones simples',
      'Imagino, represento y mejoro soluciones sencillas',
      'Creo soluciones simples y explico cómo ayudan',
    ],
  },
  {
    courseName: 'Nivel 2 · Comprensión – 3.º de EGB',
    modules: [
      'Comprendo objetos, componentes y funciones',
      'Represento procesos, patrones y decisiones simples',
      'Diseño y construyo soluciones sencillas con criterios básicos',
      'Organizo información y explico cómo una solución responde a una necesidad',
    ],
  },
  {
    courseName: 'Nivel 2 · Comprensión – 4.º de EGB',
    modules: [
      'Analizo funciones, estructuras y soluciones sencillas',
      'Organizo procesos y resuelvo retos con secuencias, patrones y decisiones',
      'Diseño, pruebo y mejoro prototipos sencillos',
      'Uso información simple para elegir, comunicar y valorar soluciones',
    ],
  },
  {
    courseName: 'Nivel 3 · Aplicación – 5.º de EGB',
    modules: [
      'Aplico lógica y estructura para resolver retos funcionales',
      'Construyo soluciones guiadas con entradas, procesos y salidas',
      'Integro componentes y mejoro el funcionamiento de una solución',
      'Uso información simple para evaluar, comunicar e impactar',
    ],
  },
  {
    courseName: 'Nivel 3 · Aplicación – 6.º de EGB',
    modules: [
      'Modelo procesos y construyo soluciones funcionales más estables',
      'Integro entradas, decisiones y control en sistemas simples',
      'Ajusto, optimizo y mejoro soluciones guiadas',
      'Uso datos simples para evaluar desempeño y tomar decisiones responsables',
    ],
  },
  {
    courseName: 'Nivel 3 · Aplicación – 7.º de EGB',
    modules: [
      'Aplico modelos lógicos para resolver problemas funcionales más integrados',
      'Integro componentes físicos o digitales para lograr comportamientos funcionales claros',
      'Pruebo, ajusto y justifico mejoras en soluciones guiadas',
      'Uso pruebas e información para valorar desempeño, comunicar resultados e identificar impacto',
    ],
  },
  {
    courseName: 'Nivel 4 · Diseño – 8.º de EGB',
    modules: [
      'Analizo sistemas y formulo retos de diseño con criterios iniciales',
      'Modelo lógicamente soluciones para organizar procesos y decisiones',
      'Represento propuestas y planifico soluciones con intención de diseño',
      'Construyo prototipos iniciales e integro componentes con coherencia funcional',
      'Uso datos simples y pruebas para mejorar soluciones de diseño',
      'Diseño sistemas que responden a condiciones, eventos o datos básicos',
      'Reviso el diseño desde el usuario, la seguridad y el impacto',
      'Desarrollo un proyecto integrador de diseño intencional',
    ],
  },
  {
    courseName: 'Nivel 4 · Diseño – 9.º de EGB',
    modules: [
      'Analizo retos y sistemas con mayor precisión técnica escolar',
      'Organizo la arquitectura lógica de soluciones más integradas',
      'Comparo alternativas y selecciono propuestas con criterios múltiples',
      'Integro componentes y desarrollo prototipos funcionales más robustos',
      'Uso pruebas y evidencia para optimizar soluciones tecnológicas',
      'Desarrollo sistemas responsivos y automatización escolar con mayor control',
      'Evalúo experiencia de usuario, sostenibilidad y ética del diseño',
      'Desarrollo un proyecto integrador de integración y optimización',
    ],
  },
  {
    courseName: 'Nivel 4 · Diseño – 10.º de EGB',
    modules: [
      'Analizo desafíos tecnológicos como sistemas y defino arquitecturas de solución',
      'Modelo la lógica de control y el comportamiento de soluciones complejas a nivel escolar',
      'Tomo decisiones de diseño considerando viabilidad, trade-offs e impacto',
      'Integro y valido prototipos desde una lógica sistémica',
      'Uso indicadores, datos y evidencia para valorar desempeño y mejorar',
      'Desarrollo sistemas responsivos o automatizados con criterio y control',
      'Evalúo sostenibilidad, ciudadanía e impacto de implementación',
      'Desarrollo un proyecto integrador de diseño sistémico y validación',
    ],
  },
  {
    courseName: 'Nivel 5 · Innovación – 1.º de BGU (Innovación emergente)',
    modules: [
      'Identifico oportunidades de innovación en sistemas, contextos y necesidades reales',
      'Modelo soluciones innovadoras integrando lógica, datos y comportamiento',
      'Diseño propuestas con valor, viabilidad e impacto inicial',
      'Desarrollo prototipos funcionales para explorar y validar innovación',
      'Valido propuestas mediante pruebas, datos y retroalimentación de usuarios',
      'Desarrollo soluciones automatizadas, conectadas o inteligentes con intención de uso',
      'Evalúo impacto, sostenibilidad y responsabilidad de la innovación',
      'Desarrollo un proyecto integrador de innovación emergente',
    ],
  },
  {
    courseName: 'Nivel 5 · Innovación – 2.º de BGU (Innovación aplicada)',
    modules: [
      'Analizo oportunidades de innovación con foco en valor, contexto y factibilidad',
      'Modelo arquitecturas de solución con integración funcional y estratégica',
      'Diseño propuestas innovadoras considerando viabilidad, diferenciación y sostenibilidad',
      'Desarrollo prototipos funcionales para validación aplicada',
      'Valido soluciones mediante pruebas, datos y retroalimentación ampliada',
      'Integro automatización, conectividad o inteligencia con criterio de uso e impacto',
      'Evalúo implementación, impacto y responsabilidad de la innovación aplicada',
      'Desarrollo un proyecto integrador de innovación aplicada y validación ampliada',
    ],
  },
  {
    courseName: 'Nivel 5 · Innovación – 3.º de BGU (Innovación proyectiva)',
    modules: [
      'Identifico desafíos estratégicos y proyecto oportunidades de innovación con impacto',
      'Diseño arquitecturas de solución con integración avanzada y criterio técnico',
      'Tomo decisiones de innovación considerando valor, diferenciación, viabilidad y sostenibilidad',
      'Desarrollo prototipos integrados para validación avanzada y escenarios de uso',
      'Valido soluciones con evidencia, datos y retroalimentación para sustentar decisiones',
      'Integro automatización, conectividad o inteligencia con propósito, límites y responsabilidad',
      'Evalúo implementación, impacto y proyección de la innovación en contextos reales o simulados',
      'Desarrollo un proyecto integrador de innovación proyectiva como síntesis del perfil de egreso',
    ],
  },
];

async function main() {
  console.log('🔍 Finding institution "Colegio Tech Demo"...');
  const instResult = await sql`SELECT id FROM instituciones WHERE nombre = 'Unidad Educativa los Ateneos' LIMIT 1`;
  if (instResult.length === 0) {
    throw new Error('Institution "Colegio Tech Demo" not found! Run the seed script first.');
  }
  const institucionId = instResult[0].id;
  console.log(`✅ Found institution with ID: ${institucionId}`);

  for (const { courseName, modules } of CURRICULUM) {
    console.log(`\n📚 Creating course: "${courseName}"...`);

    // Create the course
    const [course] = await sql`
      INSERT INTO cursos (nombre, institucion_id)
      VALUES (${courseName}, ${institucionId})
      RETURNING id, nombre
    `;
    console.log(`   ✅ Course created: ID=${course.id}`);

    // Create sections (modules) and a default lesson each
    for (let i = 0; i < modules.length; i++) {
      const moduleName = modules[i];
      const [section] = await sql`
        INSERT INTO secciones_inst (curso_id, nombre, orden)
        VALUES (${course.id}, ${moduleName}, ${i})
        RETURNING id
      `;

      await sql`
        INSERT INTO modulos_inst (seccion_id, curso_id, titulo, tipo, orden)
        VALUES (${section.id}, ${course.id}, 'Introducción y Actividades', 'lesson', 0)
      `;
    }
    console.log(`   ✅ ${modules.length} módulos created for this course.`);
  }

  console.log('\n🎉 All courses and modules created successfully!');
  await sql.end();
}

main().catch((e) => {
  console.error('❌ Error:', e);
  sql.end();
  process.exit(1);
});

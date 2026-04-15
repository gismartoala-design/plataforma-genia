const { Client } = require('pg');

const client = new Client({ 
  connectionString: 'postgresql://emerson:memerson19@194.140.198.128/bd_instituciones' 
});

const generateLab1Moments = () => {
  return {
    "mission": {
      "title": "Laboratorio Maker de Expansión 1: Disección de un Sistema Real",
      "level": "6to EGB",
      "duration_minutes": 55
    },
    "moments": [
      {
        "id": "m1",
        "title": "Fase 1: Selección del sistema",
        "time_minutes": 5,
        "blocks": [
          { "id": "b1_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "Todo sistema comienza con algo cotidiano. Las grandes tecnologías nacen de observar acciones simples." } },
          { "id": "b1_2", "type": "student_activity", "visibleToStudent": true, "content": { "text": "Selecciona un proceso de tu vida diaria que puedas analizar paso a paso." } },
          { "id": "b1_3", "type": "interaction_choice", "visibleToStudent": true, "content": { "question": "¿Qué proceso vas a analizar?", "options": [{ "text": "Preparar comida" }, { "text": "Organizar mochila" }, { "text": "Rutina antes de dormir" }, { "text": "Otro" }], "correct_answer": 0 } }
        ]
      },
      {
        "id": "m2",
        "title": "Fase 2: Identificación de pasos",
        "time_minutes": 10,
        "blocks": [
          { "id": "b2_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "Para que un sistema funcione, primero debemos conocer todos sus pasos. Un error común es olvidar acciones importantes." } },
          { "id": "b2_2", "type": "interaction_open", "visibleToStudent": true, "content": { "question": "Descompón el proceso seleccionado en al menos 5 pasos claros.", "placeholder_hint": "Escribe los pasos en orden (1, 2, 3...)" } }
        ]
      },
      {
        "id": "m3",
        "title": "Fase 3: Detección de errores",
        "time_minutes": 10,
        "blocks": [
          { "id": "b3_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "Los sistemas fallan cuando el orden es incorrecto o faltan pasos." } },
          { "id": "b3_2", "type": "interaction_truefalse", "visibleToStudent": true, "content": { "statement": "¿Es correcto ponerse zapatos antes de las medias?", "correct_answer": false } },
          { "id": "b3_3", "type": "interaction_truefalse", "visibleToStudent": true, "content": { "statement": "¿Es correcto lavarse las manos solo después de comer?", "correct_answer": false } }
        ]
      },
      {
        "id": "m4",
        "title": "Fase 4: Conexión lógica",
        "time_minutes": 10,
        "blocks": [
          { "id": "b4_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "Un sistema no solo tiene pasos, los pasos deben estar conectados en un orden lógico." } },
          { "id": "b4_2", "type": "interaction_sequence", "visibleToStudent": true, "content": { "items": [{ "text": "Identificar necesidad" }, { "text": "Planificar pasos" }, { "text": "Ejecutar acción" }, { "text": "Verificar resultado" }] } }
        ]
      },
      {
        "id": "m5",
        "title": "Fase 5: Decisiones",
        "time_minutes": 10,
        "blocks": [
          { "id": "b5_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "Los sistemas inteligentes toman decisiones dependiendo de lo que ocurre." } },
          { "id": "b5_2", "type": "interaction_open", "visibleToStudent": true, "content": { "question": "Escribe una condición lógica para tu sistema (SI... ENTONCES...)", "placeholder_hint": "Ej: SI llueve → ENTONCES uso paraguas" } }
        ]
      },
      {
        "id": "m6",
        "title": "Fase 6: Entrega Final",
        "time_minutes": 10,
        "blocks": [
          { "id": "b6_1", "type": "student_activity", "visibleToStudent": true, "content": { "text": "Sube una foto u hoja de trabajo de tu sistema rediseñado." } },
          { "id": "b6_2", "type": "interaction_upload", "visibleToStudent": true, "content": { "instruction": "Sube el archivo aquí", "format_hint": "JPG, PDF o PNG" } }
        ]
      }
    ]
  };
};

const generateLab2Moments = () => {
  return {
    "mission": {
      "title": "Laboratorio Maker de Expansión 2: Sistemas Inteligentes",
      "level": "6to EGB",
      "duration_minutes": 55
    },
    "moments": [
      {
        "id": "m1",
        "title": "Fase 1: Exploración de decisiones",
        "time_minutes": 8,
        "blocks": [
          { "id": "b1_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "La ciudad ha avanzado… Ahora los sistemas ya no solo siguen pasos, también toman decisiones automáticamente." } },
          { "id": "b1_2", "type": "interaction_choice", "visibleToStudent": true, "content": { "question": "Situación: Está lloviendo. ¿Cuál es la decisión correcta?", "options": [{ "text": "Salir sin paraguas" }, { "text": "Usar paraguas" }], "correct_answer": 1 } },
          { "id": "b1_3", "type": "interaction_choice", "visibleToStudent": true, "content": { "question": "Situación: Hay tráfico. ¿Cuál es la decisión correcta?", "options": [{ "text": "Seguir igual" }, { "text": "Buscar otra ruta" }], "correct_answer": 1 } }
        ]
      },
      {
        "id": "m2",
        "title": "Fase 2: Detección de errores",
        "time_minutes": 10,
        "blocks": [
          { "id": "b2_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "Un sistema falla cuando toma decisiones incorrectas. Detecta los errores en la unidad de control." } },
          { "id": "b2_2", "type": "interaction_truefalse", "visibleToStudent": true, "content": { "statement": "Un semáforo en verde cuando no hay autos es eficiente.", "correct_answer": false } },
          { "id": "b2_3", "type": "interaction_truefalse", "visibleToStudent": true, "content": { "statement": "Las luces automáticas que prenden de día están fallando.", "correct_answer": true } },
          { "id": "b2_4", "type": "interaction_open", "visibleToStudent": true, "content": { "question": "Explica cómo corregirías un sensor de riego que funciona mientras llueve.", "placeholder_hint": "Escribe tu solución técnica..." } }
        ]
      },
      {
        "id": "m3",
        "title": "Fase 3: Construcción lógica (IF)",
        "time_minutes": 10,
        "blocks": [
          { "id": "b3_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "Los sistemas inteligentes usan condiciones: SI ocurre algo → ENTONCES actúa." } },
          { "id": "b3_2", "type": "interaction_open", "visibleToStudent": true, "content": { "question": "Completa estas condiciones:\n1. SI está oscuro → ...\n2. SI el suelo está seco → ...\n3. SI pasan autos → ...", "placeholder_hint": "Ej: → ENTONCES enciendo luces" } }
        ]
      },
      {
        "id": "m4",
        "title": "Fase 4: Automatización (Repetición)",
        "time_minutes": 7,
        "blocks": [
          { "id": "b4_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "Un sistema inteligente no funciona una sola vez… funciona constantemente para monitorear el entorno." } },
          { "id": "b4_2", "type": "interaction_choice", "visibleToStudent": true, "content": { "question": "¿Cómo debe ejecutarse el bucle de control?", "options": [{ "text": "Se ejecuta una sola vez al inicio" }, { "text": "Se ejecuta continuamente" }], "correct_answer": 1 } }
        ]
      },
      {
        "id": "m5",
        "title": "Fase 5: Diseño del sistema",
        "time_minutes": 10,
        "blocks": [
          { "id": "b5_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "Ahora es tu turno de ser ingeniero de la ciudad." } },
          { "id": "b5_2", "type": "interaction_open", "visibleToStudent": true, "content": { "question": "Describe tu sistema: NOMBRE, LÓGICA (Si... Entonces...) y REPETICIÓN.", "placeholder_hint": "Ej: Sistema de luces de túnel inteligente..." } }
        ]
      },
      {
        "id": "m6",
        "title": "Fase 6: Entrega Final",
        "time_minutes": 10,
        "blocks": [
          { "id": "b6_1", "type": "student_activity", "visibleToStudent": true, "content": { "text": "Sube tu evidencia final del Laboratorio 2." } },
          { "id": "b6_2", "type": "interaction_upload", "visibleToStudent": true, "content": { "instruction": "Sube o arrastra el archivo", "format_hint": "Soportados: JPG, PDF, PNG" } }
        ]
      }
    ]
  };
};

async function migrateLabs() {
  try {
    await client.connect();
    console.log('Connected to DB for migration...');

    // Update Lab 1
    const l1 = generateLab1Moments();
    await client.query('UPDATE modulos_inst SET contenido = $1 WHERE id = 98', [JSON.stringify(l1)]);
    console.log('Lab 1 (ID 98) restructured to moments/blocks.');

    // Update Lab 2
    const l2 = generateLab2Moments();
    await client.query('UPDATE modulos_inst SET contenido = $1 WHERE id = 99', [JSON.stringify(l2)]);
    console.log('Lab 2 (ID 99) restructured to moments/blocks.');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrateLabs();

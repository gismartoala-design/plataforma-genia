const { Client } = require('pg');

const client = new Client({ 
  connectionString: 'postgresql://emerson:memerson19@194.140.198.128/bd_instituciones' 
});

const lab2Blocks = {
  "metadata": {
    "title": "Laboratorio Maker de Expansión 2: Sistemas Inteligentes",
    "description": "Análisis, corrección y diseño de sistemas automáticos que toman decisiones."
  },
  "blocks": [
    {
      "id": "l2_header",
      "type": "NARRATIVE",
      "data": {
        "titulo": "📦 LABORATORIO MAKER 2",
        "texto": "🎮 OPERACIÓN: SISTEMAS QUE TOMAN DECISIONES\n🌆 División de Automatización – Ciudad Inteligente\n\nLa ciudad ha avanzado… Ahora los sistemas ya no solo siguen pasos. También toman decisiones automáticamente.\nEjemplo: Un semáforo cambia según el tráfico, una luz se enciende cuando oscurece, un sistema de riego funciona solo si el suelo está seco.\n🚨 Muchos sistemas están tomando malas decisiones. Tu misión será analizar, corregir y diseñar un sistema inteligente."
      }
    },
    {
      "id": "l2_f1",
      "type": "NARRATIVE",
      "data": {
        "titulo": "🧠 FASE 1: EXPLORACIÓN DE DECISIONES",
        "texto": "En la vida diaria tomamos decisiones constantemente. No siempre hacemos lo mismo, actuamos según lo que ocurre.\n\nInstrucción: Analiza las siguientes situaciones y marca la mejor decisión."
      }
    },
    {
      "id": "l2_f1_q1",
      "type": "EVALUATION",
      "data": {
        "pregunta": "Situación: Está lloviendo",
        "opciones": ["Salir sin paraguas", "Usar paraguas"],
        "respuestaIndex": 1
      }
    },
    {
      "id": "l2_f1_q2",
      "type": "EVALUATION",
      "data": {
        "pregunta": "Situación: Hay tráfico",
        "opciones": ["Seguir igual", "Buscar otra ruta"],
        "respuestaIndex": 1
      }
    },
    {
      "id": "l2_f1_q3",
      "type": "EVALUATION",
      "data": {
        "pregunta": "Situación: Está oscuro",
        "opciones": ["No encender luz", "Encender luz"],
        "respuestaIndex": 1
      }
    },
    {
      "id": "l2_f2",
      "type": "NARRATIVE",
      "data": {
        "titulo": "🧩 FASE 2: DETECCIÓN DE ERRORES",
        "texto": "Un sistema falla cuando toma decisiones incorrectas.\n\nInstrucción: Detecta los errores en estos sistemas."
      }
    },
    {
      "id": "l2_f2_ex1",
      "type": "EVALUATION",
      "data": {
        "pregunta": "Sistema: Luz automática. Comportamiento: Se enciende de día.",
        "opciones": ["Correcto", "Incorrecto"],
        "respuestaIndex": 1
      }
    },
    {
      "id": "l2_f2_ex2",
      "type": "EVALUATION",
      "data": {
        "pregunta": "Sistema: Riego automático. Comportamiento: Funciona cuando llueve.",
        "opciones": ["Correcto", "Incorrecto"],
        "respuestaIndex": 1
      }
    },
    {
      "id": "l2_f2_ex3",
      "type": "EVALUATION",
      "data": {
        "pregunta": "Sistema: Semáforo. Comportamiento: Verde sin autos.",
        "opciones": ["Correcto", "Incorrecto"],
        "respuestaIndex": 1
      }
    },
    {
      "id": "l2_f2_task",
      "type": "OPEN_QUESTION",
      "data": {
        "titulo": "✏️ CORRIGE",
        "pregunta": "Explica qué debería hacer el sistema para corregir estos fallos."
      }
    },
    {
      "id": "l2_f3",
      "type": "NARRATIVE",
      "data": {
        "titulo": "🔗 FASE 3: CONSTRUCCIÓN DE DECISIONES (IF)",
        "texto": "Los sistemas inteligentes usan condiciones: SI ocurre algo → ENTONCES actúa."
      }
    },
    {
      "id": "l2_f3_task",
      "type": "OPEN_QUESTION",
      "data": {
        "pregunta": "Completa la lógica:\nSI está oscuro → ...\nSI el suelo está seco → ...\nSI hay autos → ..."
      }
    },
    {
      "id": "l2_f4",
      "type": "NARRATIVE",
      "data": {
        "titulo": "🔁 FASE 4: AUTOMATIZACIÓN (REPETICIÓN)",
        "texto": "Un sistema inteligente no funciona una sola vez… funciona constantemente."
      }
    },
    {
      "id": "l2_f4_q",
      "type": "EVALUATION",
      "data": {
        "pregunta": "¿Cómo debe ejecutarse un sistema inteligente?",
        "opciones": ["Se ejecuta una vez", "Se ejecuta continuamente"],
        "respuestaIndex": 1
      }
    },
    {
      "id": "l2_f4_task",
      "type": "OPEN_QUESTION",
      "data": {
        "pregunta": "Explica ¿Por qué debe ser así?"
      }
    },
    {
      "id": "l2_f5",
      "type": "NARRATIVE",
      "data": {
        "titulo": "🏗 FASE 5: DISEÑO DEL SISTEMA INTELIGENTE",
        "texto": "Ahora vas a diseñar un sistema real automático."
      }
    },
    {
      "id": "l2_f5_task",
      "type": "OPEN_QUESTION",
      "data": {
        "pregunta": "Crea tu propio sistema automático. Describe NOMBRE, LÓGICA (Condición y Acción) y REPETICIÓN (Automático/Manual)."
      }
    },
    {
      "id": "l2_f6",
      "type": "EVALUATION",
      "data": {
        "titulo": "🎮 FASE 6: SIMULACIÓN",
        "pregunta": "Si la condición de tu sistema no se cumple:",
        "opciones": ["(A) El sistema actúa igual", "(B) El sistema no actúa"],
        "respuestaIndex": 1
      }
    },
    {
      "id": "l2_f7",
      "type": "OPEN_QUESTION",
      "data": {
        "titulo": "🧠 FASE 7: ANÁLISIS Y MEJORA",
        "pregunta": "¿Tu sistema puede fallar? ¿Qué mejorarías de tu diseño?"
      }
    },
    {
      "id": "l2_f8",
      "type": "REWARD",
      "data": {
        "insignia": "Diseñador de Sistemas Inteligentes – Nivel 2",
        "xp": 200
      }
    },
    {
      "id": "l2_final",
      "type": "DELIVERABLE",
      "data": {
        "descripcion": "Sube tu evidencia final del trabajo realizado (foto, documento o captura).",
        "tipo": "ARCHIVO"
      }
    }
  ]
};

async function insertLab2() {
  try {
    await client.connect();
    console.log('Connected to DB.');

    // 1. Get max order in section 73
    const resOrder = await client.query(
      'SELECT MAX(orden) FROM modulos_inst WHERE seccion_id = $1',
      [73]
    );
    const nextOrder = (resOrder.rows[0].max || 0) + 1;

    // 2. Insert Lab 2
    const query = `
      INSERT INTO modulos_inst (seccion_id, curso_id, titulo, tipo, contenido, orden, activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const values = [
      73, 
      7, 
      "Laboratorio Maker de Expansión 2", 
      'maker_lab', 
      JSON.stringify(lab2Blocks), 
      nextOrder, 
      true
    ];

    const resInsert = await client.query(query, values);
    console.log('Lab 2 inserted successfully with ID:', resInsert.rows[0].id);

  } catch (err) {
    console.error('Error inserting Lab 2:', err);
  } finally {
    await client.end();
  }
}

insertLab2();

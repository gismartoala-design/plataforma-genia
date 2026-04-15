const { Client } = require('pg');

const client = new Client({ 
  connectionString: 'postgresql://emerson:memerson19@194.140.198.128/bd_instituciones' 
});

const lab1Blocks = {
  "metadata": {
    "title": "Laboratorio Maker de Expansión 1: Disección de un Sistema Real",
    "description": "Fase de análisis y rediseño de procesos cotidianos."
  },
  "blocks": [
    {
      "id": "l1_header",
      "type": "NARRATIVE",
      "data": {
        "titulo": "📦 LABORATORIO MAKER 1",
        "texto": "🌆 División de Análisis – Ciudad Inteligente\n\nEn la ciudad inteligente, antes de automatizar cualquier sistema, los ingenieros deben entender cómo funcionan los procesos en la vida real. Hoy asumirás ese rol. No vas a programar todavía, vas a pensar como un ingeniero de sistemas. Tu misión será analizar, detectar errores y rediseñar un proceso real."
      }
    },
    {
      "id": "l1_f1",
      "type": "NARRATIVE",
      "data": {
        "titulo": "Fase 1: Selección del sistema",
        "texto": "Todo sistema comienza con algo cotidiano. Las grandes tecnologías nacen de observar acciones simples.\n\nInstrucción: Selecciona un proceso de tu vida diaria que puedas analizar paso a paso."
      }
    },
    {
      "id": "l1_f1_task",
      "type": "EVALUATION",
      "data": {
        "pregunta": "¿Qué proceso diario vas a analizar?",
        "opciones": ["Preparar comida", "Organizar mochila", "Rutina antes de dormir", "Otro (describir en bitácora)"],
        "respuestaIndex": 0
      }
    },
    {
      "id": "l1_f2",
      "type": "NARRATIVE",
      "data": {
        "titulo": "Fase 2: Identificación de pasos",
        "texto": "Para que un sistema funcione, primero debemos conocer todos sus pasos. Un error común es olvidar acciones importantes.\n\nInstrucción: Descompón el proceso en al menos 5 pasos claros."
      }
    },
    {
      "id": "l1_f2_task",
      "type": "OPEN_QUESTION",
      "data": {
        "pregunta": "Escribe los pasos de tu proceso (Paso 1, 2, 3...)"
      }
    },
    {
      "id": "l1_f3",
      "type": "NARRATIVE",
      "data": {
        "titulo": "Fase 3: Detección de errores",
        "texto": "Los sistemas fallan cuando el orden es incorrecto o faltan pasos.\n\nInstrucción: Analiza los siguientes ejemplos y detecta si son correctos."
      }
    },
    {
      "id": "l1_f3_ex1",
      "type": "EVALUATION",
      "data": {
        "pregunta": "¿Es correcto: 'Ponerse zapatos antes de medias'?",
        "opciones": ["Correcto", "Incorrecto (Error de orden)"],
        "respuestaIndex": 1
      }
    },
    {
      "id": "l1_f3_ex2",
      "type": "EVALUATION",
      "data": {
        "pregunta": "¿Es correcto: 'Lavarse manos después de comer'?",
        "opciones": ["Correcto", "Incorrecto (Debe ser antes y después)"],
        "respuestaIndex": 0
      }
    },
    {
      "id": "l1_f4",
      "type": "NARRATIVE",
      "data": {
        "titulo": "Fase 4: Conexión lógica",
        "texto": "Un sistema no solo tiene pasos, los pasos deben estar conectados en un orden lógico."
      }
    },
    {
      "id": "l1_f4_task",
      "type": "OPEN_QUESTION",
      "data": {
        "pregunta": "Construye tu secuencia lógica ideal: () → () → () → ()"
      }
    },
    {
      "id": "l1_f5",
      "type": "NARRATIVE",
      "data": {
        "titulo": "Fase 5: Decisiones (condiciones)",
        "texto": "Los sistemas inteligentes toman decisiones dependiendo de lo que ocurre.\n\nInstrucción: Define al menos dos decisiones (SI... ENTONCES...)"
      }
    },
    {
      "id": "l1_f5_task",
      "type": "OPEN_QUESTION",
      "data": {
        "pregunta": "Escribe tus condiciones lógicas para el sistema."
      }
    },
    {
      "id": "l1_f6",
      "type": "EVALUATION",
      "data": {
        "titulo": "Fase 6: Repetición",
        "pregunta": "¿Tu sistema tiene partes que se repiten constantemente?",
        "opciones": ["Ocurre una sola vez", "Se repite constantemente (Bucle)"],
        "respuestaIndex": 0
      }
    },
    {
      "id": "l1_f7",
      "type": "NARRATIVE",
      "data": {
        "titulo": "Fase 7: Diseño final (Agoritmo)",
        "texto": "Ahora vas a construir una solución clara y ordenada mejorada."
      }
    },
    {
      "id": "l1_f8",
      "type": "EVALUATION",
      "data": {
        "titulo": "Fase 8: Simulación",
        "pregunta": "¿Qué ocurre si eliminas un paso importante del sistema?",
        "opciones": ["Funciona igual", "Falla el sistema"],
        "respuestaIndex": 1
      }
    },
    {
      "id": "l1_f9",
      "type": "REWARD",
      "data": {
        "insignia": "Diseñador de Sistemas - Nivel Inicial",
        "xp": 100
      }
    },
    {
      "id": "l1_final",
      "type": "DELIVERABLE",
      "data": {
        "descripcion": "Sube una foto de tu proceso rediseñado o una captura de tu trabajo.",
        "tipo": "ARCHIVO"
      }
    }
  ]
};

async function updateLab1() {
  try {
    await client.connect();
    console.log('Connected to DB.');
    const query = 'UPDATE modulos_inst SET contenido = $1 WHERE id = 98';
    await client.query(query, [JSON.stringify(lab1Blocks)]);
    console.log('Lab 1 updated successfully with new block structure.');
  } catch (err) {
    console.error('Error updating Lab 1:', err);
  } finally {
    await client.end();
  }
}

updateLab1();

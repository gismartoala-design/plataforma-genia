const { Client } = require('pg');

const client = new Client({ 
  connectionString: 'postgresql://emerson:memerson19@194.140.198.128/bd_instituciones' 
});

const makerLabContent = {
  "titulo": "Laboratorio Maker de Expansión 1",
  "operacion": "Disección de un Sistema Real",
  "division": "División de Análisis – Ciudad Inteligente",
  "contexto_general": "En la ciudad inteligente, antes de automatizar cualquier sistema, los ingenieros deben entender cómo funcionan los procesos en la vida real. Hoy asumirás ese rol. No vas a programar todavía, vas a pensar como un ingeniero de sistemas. Tu misión será analizar, detectar errores y rediseñar un proceso real.",
  "fases": [
    {
      "fase": 1,
      "nombre": "Selección del sistema",
      "contexto": "Todo sistema comienza con algo cotidiano. Las grandes tecnologías nacen de observar acciones simples.",
      "instruccion": "Selecciona un proceso de tu vida diaria que puedas analizar paso a paso.",
      "opciones": [
        "Preparar comida",
        "Organizar mochila",
        "Rutina antes de dormir",
        "Otro: __________"
      ]
    },
    {
      "fase": 2,
      "nombre": "Identificación de pasos",
      "contexto": "Para que un sistema funcione, primero debemos conocer todos sus pasos. Un error común es olvidar acciones importantes.",
      "instruccion": "Descompón el proceso en pasos claros.",
      "tabla": [
        { "paso": 1, "accion": "__________", "necesaria": false },
        { "paso": 2, "accion": "__________", "necesaria": false },
        { "paso": 3, "accion": "__________", "necesaria": false },
        { "paso": 4, "accion": "__________", "necesaria": false },
        { "paso": 5, "accion": "__________", "necesaria": false }
      ]
    },
    {
      "fase": 3,
      "nombre": "Detección de errores",
      "contexto": "Los sistemas fallan cuando el orden es incorrecto, faltan pasos o hay acciones innecesarias.",
      "instruccion": "Analiza los ejemplos y detecta errores.",
      "ejemplos": [
        { "accion": "Ponerse zapatos antes de medias", "correcto": null },
        { "accion": "Lavarse manos después de comer", "correcto": null },
        { "accion": "Cocinar sin ingredientes", "correcto": null }
      ],
      "correccion": "Explica cómo debería hacerse correctamente"
    },
    {
      "fase": 4,
      "nombre": "Conexión lógica",
      "contexto": "Un sistema no solo tiene pasos, los pasos deben estar conectados en un orden lógico.",
      "instruccion": "Construye la secuencia correcta.",
      "secuencia_base": "(Despertarse) → () → () → (Ir a clases)",
      "secuencia_propia": "() → () → () → ()"
    },
    {
      "fase": 5,
      "nombre": "Decisiones (condiciones)",
      "contexto": "Los sistemas inteligentes toman decisiones dependiendo de lo que ocurre.",
      "instruccion": "Define al menos dos decisiones dentro de tu proceso.",
      "condiciones": [
        "SI __________ → ENTONCES __________",
        "SI __________ → ENTONCES __________"
      ]
    },
    {
      "fase": 6,
      "nombre": "Repetición",
      "contexto": "Algunos procesos se repiten constantemente como sistemas automáticos.",
      "instruccion": "Identifica si tu sistema tiene partes repetitivas.",
      "pregunta": "¿Qué parte se repite?",
      "opciones": [
        "Ocurre una sola vez",
        "Se repite constantemente"
      ]
    },
    {
      "fase": 7,
      "nombre": "Diseño final (algoritmo)",
      "contexto": "Ahora vas a construir una solución clara y ordenada.",
      "instruccion": "Diseña tu sistema final mejorado.",
      "tabla": [
        { "paso": 1, "accion": "__________" },
        { "paso": 2, "accion": "__________" },
        { "paso": 3, "accion": "__________" },
        { "paso": 4, "accion": "__________" }
      ],
      "condicion": "SI __________ → __________",
      "repeticion": [
        "Se ejecuta una vez",
        "Se repite"
      ]
    },
    {
      "fase": 8,
      "nombre": "Simulación",
      "contexto": "Un sistema debe ser probado antes de implementarse.",
      "instruccion": "Analiza qué ocurriría si el sistema falla.",
      "pregunta": "Si eliminas un paso importante:",
      "opciones": [
        "Funciona igual",
        "Falla el sistema"
      ]
    },
    {
      "fase": 9,
      "nombre": "Resultado y aprendizaje",
      "contexto": "Has realizado el mismo proceso que un ingeniero de sistemas.",
      "logros": [
        "Analizar un sistema real",
        "Detectar errores",
        "Organizar pasos",
        "Diseñar una solución"
      ],
      "identidad": "Diseñador de Sistemas – Nivel Inicial"
    }
  ],
  "entrega_final": {
    "instruccion": "Sube tu trabajo en uno de estos formatos",
    "formatos": [
      "Foto",
      "Documento",
      "Captura"
    ]
  }
};

async function insertLab() {
  try {
    await client.connect();
    console.log('Connected to DB.');

    // 1. Find max order in section 73
    const resOrder = await client.query(
      'SELECT MAX(orden) FROM modulos_inst WHERE seccion_id = $1',
      [73]
    );
    const nextOrder = (resOrder.rows[0].max || 0) + 1;

    // 2. Insert the lab
    const query = `
      INSERT INTO modulos_inst (seccion_id, curso_id, titulo, tipo, contenido, orden, activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const values = [
      73, 
      7, 
      makerLabContent.titulo, 
      'maker_lab', 
      JSON.stringify(makerLabContent), 
      nextOrder, 
      true
    ];

    const resInsert = await client.query(query, values);
    console.log('Lab inserted successfully with ID:', resInsert.rows[0].id);

  } catch (err) {
    console.error('Error during insertion:', err);
  } finally {
    await client.end();
  }
}

insertLab();

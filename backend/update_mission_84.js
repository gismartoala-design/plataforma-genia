const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://emerson:memerson19@194.140.198.128/bd_instituciones' });
  await client.connect();

  const newContent = {
    "mission": {
      "title": "Misión 1: Operación Caos Vial",
      "level": "6to EGB",
      "duration_minutes": 45,
      "domain": "Pensamiento Computacional",
      "type": ["logica", "repaso"]
    },
    "moments": [
      {
        "id": "momento_1",
        "title": "ACTO 1: ¡Emergencia en la Ciudad!",
        "time_minutes": 8,
        "blocks": [
          { "id": "b1_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "¡Bip bup! ¡Hola Agente de Innovación! 👋 Aquí Genia, tu asistente de sistemas." } },
          { "id": "b1_2", "type": "student_context", "visibleToStudent": true, "content": { "text": "🚨 ¡NECESITAMOS TU AYUDA URGENTE! 🚨\n\nEl sistema central de movilidad ha sufrido un cortocircuito y los semáforos de la 'Avenida Lógica' están funcionando en total desorden." } },
          { "id": "b1_3", "type": "student_context", "visibleToStudent": true, "content": { "text": "Esto es lo que está pasando ahora:\n\n• Los autos frenan de golpe.\n• Los peatones no saben cuándo cruzar.\n• El caos se extiende por toda la ciudad." } },
          { "id": "b1_4", "type": "student_activity", "visibleToStudent": true, "content": { "text": "¡Tú tienes la mente analítica necesaria para restaurar el orden! ¿Estás listo para esta misión?" } },
          { "id": "b1_5", "type": "interaction_open", "visibleToStudent": true, "content": { "question": "¿Qué es lo primero que harías si llegaras a un cruce donde todos los semáforos están apagados?" } }
        ]
      },
      {
        "id": "momento_2",
        "title": "ACTO 1: El Sensor Defectuoso",
        "time_minutes": 7,
        "blocks": [
          { "id": "b2_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "¡Excelente respuesta! Mantener la calma es parte del protocolo de un gran Agente. 🧠" } },
          { "id": "b2_2", "type": "student_context", "visibleToStudent": true, "content": { "text": "He detectado que el problema está en el 'Secuenciador de Ciclos'. Alguien mezcló los cables y ahora el orden de las luces no tiene sentido." } },
          { "id": "b2_3", "type": "student_activity", "visibleToStudent": true, "content": { "text": "¡Ayúdame a reconectar el sistema! Arrastra los pasos para que el semáforo funcione correctamente de forma segura." } },
          { 
            "id": "b2_4", "type": "interaction_sequence", "visibleToStudent": true, 
            "content": { 
              "items": [
                { "text": "Luz ROJA (Detener tráfico completamente)" },
                { "text": "Luz VERDE (Permitir circulación segura)" },
                { "text": "Luz AMARILLA (Advertencia de cambio)" }
              ] 
            } 
          },
          { 
            "id": "b2_5", "type": "interaction_truefalse", "visibleToStudent": true, 
            "content": { "statement": "Si el semáforo pasa de VERDE a ROJO instantáneamente sin pasar por AMARILLO, ¿el sistema es seguro para los conductores?", "correct_answer": false } 
          },
          { "id": "b2_6", "type": "kpi_feedback", "visibleToStudent": false, "content": { "feedback_correct": "¡Increíble! Has evitado un choque en la Avenida Lógica. +15 KPI", "kpi_correct": 15, "feedback_incorrect": "¡Cuidado! Sin la luz amarilla, los autos no tendrían tiempo de frenar. ¡Inténtalo de nuevo!" } }
        ]
      },
      {
        "id": "momento_3",
        "title": "ACTO 2: Rastreando la Lógica",
        "time_minutes": 10,
        "blocks": [
          { "id": "b3_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "¡Bip! ¡Detecto una eficiencia del 100%! Eres un experto en secuencias. 🌟" } },
          { "id": "b3_2", "type": "student_context", "visibleToStudent": true, "content": { "text": "Lo que acabas de arreglar se llama ALGORITMO. Es una serie de instrucciones paso a paso para resolver un problema." } },
          { "id": "b3_3", "type": "student_concept", "visibleToStudent": true, "content": { "text": "CARACTERÍSTICAS DE UN BUEN ALGORITMO:\n\n1. TIENE UN INICIO Y UN FIN.\n2. ES PRECISO (No hay dudas).\n3. EL ORDEN ES VITAL (Si cambias un paso, el resultado falla)." } },
          { "id": "b3_4", "type": "interaction_choice", "visibleToStudent": true, "content": { "question": "¿Qué pasaría en una receta de cocina si primero horneas la masa y luego mezclas los ingredientes?", "options": [{"text": "El pastel saldría perfecto"}, {"text": "El resultado sería un desastre total"}, {"text": "No pasaría nada, el orden no importa"}], "correct_answer": 1 } }
        ]
      },
      {
        "id": "momento_4",
        "title": "ACTO 2: El Algoritmo Maestro",
        "time_minutes": 8,
        "blocks": [
          { "id": "b4_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "¡Exacto! El orden lo es todo en nuestro mundo digital. 💻" } },
          { "id": "b4_2", "type": "student_activity", "visibleToStudent": true, "content": { "text": "Genia necesita que diseñes un algoritmo para algo cotidiano. Vamos a ver si puedes organizar esta rutina matutina para que el robot de casa no se confunda." } },
          { 
            "id": "b4_3", "type": "interaction_sequence", "visibleToStudent": true, 
            "content": { 
              "items": [
                { "text": "Despertar al sonar la alarma" },
                { "text": "Ponerse las medias y zapatos" },
                { "text": "Lavarse la cara y desayunar" },
                { "text": "Salir hacia la escuela" }
              ] 
            } 
          }
        ]
      },
      {
        "id": "momento_5",
        "title": "ACTO 2: Estabilizando la Red",
        "time_minutes": 12,
        "blocks": [
          { "id": "b5_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "¡Uf! Casi terminamos de limpiar todo el código defectuoso de la ciudad. ¡Eres incansable! ⚡" } },
          { "id": "b5_2", "type": "student_context", "visibleToStudent": true, "content": { "text": "Este es el reto final: un sistema de tráfico inteligente que detecta si hay peatones esperando." } },
          { "id": "b5_3", "type": "student_activity", "visibleToStudent": true, "content": { "text": "¿Crees que un algoritmo puede tomar decisiones basadas en lo que ve?" } },
          { "id": "b5_4", "type": "interaction_truefalse", "visibleToStudent": true, "content": { "statement": "Si un semáforo detecta que no hay autos, ¿puede decidir cambiar a verde para los peatones?", "correct_answer": true } },
          { "id": "b5_5", "type": "kpi_feedback", "visibleToStudent": false, "content": { "feedback_correct": "¡SÍ! A eso le llamamos Lógica de Decisión. ¡Has completado la reparación técnica! 🏆", "kpi_correct": 30 } }
        ]
      },
      {
        "id": "momento_6",
        "title": "ACTO 3: Bitácora del Agente",
        "time_minutes": 5,
        "blocks": [
          { "id": "b6_1", "type": "student_context", "visibleToStudent": true, "content": { "text": "¡GENIAL, GENIAL, GENIAL! 🎉 La ciudad ha vuelto a la normalidad gracias a tu intervención." } },
          { "id": "b6_2", "type": "interaction_open", "visibleToStudent": true, "content": { "question": "Escribe un breve reporte para la 'Central de Inteligencia': ¿Cuál fue el error más crítico que encontraste hoy en el sistema de semáforos?" } }
        ]
      },
      {
        "id": "momento_7",
        "title": "ACTO 3: Informe de Éxito",
        "time_minutes": 3,
        "blocks": [
          { "id": "b7_1", "type": "kpi_feedback", "visibleToStudent": false, "content": { "feedback_correct": "Misión Finalizada con éxito. Certificación de Lógica Nivel 1 obtenida para 6to EGB." } },
          { "id": "b7_2", "type": "student_context", "visibleToStudent": true, "content": { "text": "¡Estoy muy orgullosa de tu trabajo hoy, Agente! Has demostrado que con orden y lógica, no hay sistema que no se pueda arreglar. 😎" } }
        ]
      },
      {
        "id": "momento_8",
        "title": "ACTO 3: Evidencia de Campo",
        "time_minutes": 3,
        "blocks": [
          { "id": "b8_1", "type": "interaction_upload", "visibleToStudent": true, "content": { "instruction": "Dibuja en tu cuaderno tu propio sistema de semáforos con 4 pasos lógicos y sube una foto aquí. ¡Quiero ver tu creatividad!", "format_hint": "FOTO (JPG/PNG)" } }
        ]
      }
    ],
    "platform": { "name": "Misiones Avanzadas", "levels": [] },
    "visibility": {
      "student": { "show_kpi": true, "show_context": true, "show_feedback": true, "show_questions": true, "show_interaction": true, "show_achievements": true, "show_evidence_upload": true },
      "teacher": { "show_script": true, "show_pedagogy": true, "show_intention": true, "show_evaluation": true, "show_observation": true, "show_intervention": true, "show_common_errors": true }
    }
  };

  try {
    const res = await client.query(
      "UPDATE modulos_inst SET titulo = $1, contenido = $2 WHERE id = 84",
      ["Misión 1: Operación Caos Vial", JSON.stringify(newContent)]
    );
    console.log("Mission updated successfully:", res.rowCount);
  } catch (err) {
    console.error("Error updating mission:", err);
  } finally {
    await client.end();
  }
}

main();

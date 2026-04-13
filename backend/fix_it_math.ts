import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/shared/schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function fixIT() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // Module 35
  const levels = await db.select().from(schema.niveles).where(eq(schema.niveles.moduloId, 35));
  
  const level4 = levels.find(l => l.orden === 4);
  const level7 = levels.find(l => l.orden === 7);

  if (!level4 || !level7) {
    console.log('Levels not found');
    process.exit(1);
  }

  const itLevel4Fases = {
    // 1. Datos Generales
    codigo: "IT-PEC-L4",
    mes: "Mes 2",
    duracion: "2h 00m",
    modalidad: "Aplicación y Simulación",
    requisito: "",

    // 2. Propósito
    proposito: "Aplicar conceptos de variables aleatorias y distribuciones de probabilidad mediante la simulación de eventos estocásticos aplicados a videojuegos o simuladores.",

    // 3. Conexión Curricular
    conexionConsolida: [
        "Variables Aleatorias Discretas y Continuas",
        "Funciones de Densidad de Probabilidad (PDF)",
        "Generación de Números Pseudoaleatorios"
    ],
    conexionPrepara: [
        "Inferencia Estadística",
        "Modelos de Cadenas de Markov",
        "Algoritmos de Monte Carlo"
    ],

    // 4. Caso Aplicado
    casoEscenario: "El equipo de desarrollo de un juego RPG necesita balancear el sistema de recompensas (loot drops) de los jefes. Actualmente, los jugadores se quejan de que los objetos raros nunca caen o caen demasiadas veces seguidas.\nEl sistema actual usa un Math.random() básico sin contemplar probabilidades ponderadas o 'pity systems' (sistemas de compensación por mala racha).",
    casoProblemas: [
        "Falta de balance y previsibilidad estadística (Varianza extrema).",
        "Ausencia de probabilidades condicionadas para equilibrar el juego."
    ],

    // 5. Desafío Técnico
    desafioEstudiante: "Analiza el requerimiento: Define al menos 5 items posibles, asigna una probabilidad teórica exacta a cada uno y describe matemáticamente qué distribución empírica crees que seguirá tu experimento.",
    desafioEstudiante_blocks: [],

    // 6. Estructura de Desarrollo (Actividades Modulares)
    estructura_blocks: [],
    fase1MinLines: 10,
    fase2Filas: [
        {
            criterio: "Método de Generación Aleatoria",
            opcionA: { nombre: "Distribución Uniforme Básica", ventajas: "Fácil de invocar (O(1))", desventajas: "No soporta probabilidades personalizadas" },
            opcionB: { nombre: "Ruleta Ponderada (CDF Array)", ventajas: "Permite asignar porcentajes exactos (PDF discreta)", desventajas: "Requiere sumarizar vectores (cumulative sum)" }
        },
        {
            criterio: "Manejo de Series Temporales (Pity System)",
            opcionA: { nombre: "Eventos Independientes Completos", ventajas: "Estadística pura", desventajas: "Puede frustrar al jugador (mala experiencia si falla repetidamente)" },
            opcionB: { nombre: "Eventos Condicionados (Crecen prob.)", ventajas: "Alineado a Game Design UX", desventajas: "Estructura de probabilidad dinámica compleja" }
        }
    ],
    fase3Instrucciones: "Elige la propuesta ganadora y adjunta el algoritmo o la arquitectura principal de tu generador estocástico justificado.",
    fase4Instrucciones: "Escribe tu código en Python o JS y ejecuta el simulador 10.000 veces. Escribe un análisis del resultado contrastando la frecuencia de apariciones empíricas contra tus probabilidades teóricas (Ley de Grandes Números).",

    // 7. Producto Entregable
    entregables: [
        "Notebook interactivo o script documentado con el código.",
        "Pantallazo del log de simulaciones (10.000 iteraciones).",
        "Análisis de varianza final resultante."
    ],
    
    // 8. Rúbrica Oficial
    rubrica: [
        { criterio: "Exactitud Probabilística", porcentaje: 40 },
        { criterio: "Lógica de Programación", porcentaje: 30 },
        { criterio: "Análisis y Demostración", porcentaje: 30 }
    ],

    fase1: { instrucciones: "Analiza el requerimiento: Define al menos 5 items posibles, asigna una probabilidad teórica exacta a cada uno y describe matemáticamente qué distribución empírica crees que seguirá tu experimento." }
  };

  const itLevel7Fases = {
    // 1. Datos Generales
    codigo: "IT-PEC-L7",
    mes: "Mes 4",
    duracion: "2h 30m",
    modalidad: "Desarrollo Algorítmico",
    requisito: "",

    // 2. Propósito
    proposito: "Diseñar y construir un motor de clasificación inicial utilizando el Teorema de Bayes (Naive Bayes Empírico) aplicado al filtrado de datos textuales.",

    // 3. Conexión Curricular
    conexionConsolida: [
        "Probabilidad Condicional",
        "Teorema de Bayes",
        "Independencia Estocástica"
    ],
    conexionPrepara: [
        "Machine Learning Probabilístico",
        "Procesamiento de Lenguaje Natural"
    ],

    // 4. Caso Aplicado
    casoEscenario: "La plataforma de foros de tu base de datos sufre miles de mensajes marcados como 'Spam' manuales, dificultando enormemente la lectura de consultas y desgastando a los moderadores.\nActualmente existe un Simple Ruleset de palabras prohibidas estrictas, el cual es ineficiente y no escala con las variantes morfológicas.",
    casoProblemas: [
        "Reglas estáticas incapaces de asignar un nivel de riesgo (Score).",
        "Muchos Falsos Positivos donde se bloquean correos genuinos (HAM)."
    ],

    // 5. Desafío Técnico
    desafioEstudiante: "Formula matemáticamente el problema. Define unas frecuencias de prueba (ej: 50% Spam, 50% Ham globalmente) e inventa 4 palabras clave a ponderar. Escribe explícitamente la fórmula de Bayes aplicada a tu modelo documental.",
    desafioEstudiante_blocks: [],

    // 6. Estructura de Desarrollo (Actividades Modulares)
    estructura_blocks: [],
    fase1MinLines: 12,
    fase2Filas: [
        {
            criterio: "Manejo de Probabilidades Pequeñas",
            opcionA: { nombre: "Multiplicación Directa Normal", ventajas: "Traducción fiel de la fórmula matemática al código", desventajas: "Underflow System Error (0.0)" },
            opcionB: { nombre: "Log-Probability", ventajas: "Evita el underflow computacional", desventajas: "Agrega abstracción matemática extra en el código" }
        },
        {
            criterio: "Manejo de Probabilidad Cero",
            opcionA: { nombre: "Cero Absoluto (0%)", ventajas: "Ninguna", desventajas: "Anula (multiplica por cero) el score entero" },
            opcionB: { nombre: "Corrección de Laplace (+1)", ventajas: "Impide el cero total y división por cero", desventajas: "Altera muy levemente la realidad estadística" }
        }
    ],
    fase3Instrucciones: "Detalla con precisión el modelo ganador: ¿Cómo estructurarás los diccionarios de frecuencias y de qué manera evitarás que una frase con una palabra inexistente colapse tu predictor (Smoothing)?",
    fase4Instrucciones: "Sube un script empírico que tome una frase nueva, evalúe matemáticamente su probabilidad bayesiana posterior total, y retorne un booleano (SPAM/HAM).",

    // 7. Producto Entregable
    entregables: [
        "Documento con el cálculo probabilístico previo.",
        "Script Python/NodeJS validando 4 frases de prueba."
    ],
    
    // 8. Rúbrica Oficial
    rubrica: [
        { criterio: "Desarrollo del Modelo Bayesiano", porcentaje: 40 },
        { criterio: "Manejo Correctivo de Errores Numéricos", porcentaje: 30 },
        { criterio: "Resultado Práctico Script", porcentaje: 30 }
    ],

    fase1: { instrucciones: "Formula matemáticamente el problema. Define unas frecuencias de prueba (ej: 50% Spam, 50% Ham globalmente) e inventa 4 palabras clave a ponderar. Escribe explícitamente la fórmula de Bayes aplicada a tu modelo documental." }
  };

  // Update Level 4
  await db.update(schema.plantillasIt).set({
    titulo: 'Simulador Estocástico de Recompensas',
    descripcion: 'Aplicación de Variables Aleatorias y Simuladores Numéricos Estocásticos.',
    fases: itLevel4Fases
  }).where(eq(schema.plantillasIt.nivelId, level4.id));
  console.log(`Updated IT Level 4 Fases format`);

  // Update Level 7
  await db.update(schema.plantillasIt).set({
    titulo: 'Motor Híbrido Clasificador Bayesiano',
    descripcion: 'Desarrollo de un Clasificador Algorítmico de SPAM basado en el Teorema de Bayes empírico.',
    fases: itLevel7Fases
  }).where(eq(schema.plantillasIt.nivelId, level7.id));
  console.log(`Updated IT Level 7 Fases format`);

  process.exit(0);
}

fixIT().catch(console.error);


import { 
  Gamepad2, 
  Rocket, 
  Target, 
  Zap, 
  Star, 
  BrainCircuit,
  Layout,
  Layers,
  Code2,
  Video,
  PlayCircle,
  Lightbulb,
  MessageSquare,
  Award,
  FlaskConical,
  Clock,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Upload,
  Badge,
  Info
} from 'lucide-react';

export interface SessionStep {
    id: number;
    type: 'story' | 'challenge' | 'concept' | 'question' | 'exploration' | 'live' | 'improve' | 'showcase' | 'evaluation' | 'achievement';
    title: string;
    subtitle?: string;
    narrative?: string;
    narrativePoints?: string[];
    conceptTitle?: string;
    conceptText?: string;
    conceptIcon?: any;
    question?: string;
    options?: { label: string, correct: boolean }[];
    steps?: { title: string, desc: string }[];
    visualType?: 'video' | 'gif' | 'image' | 'badge';
    visualUrl?: string;
    badgeName?: string;
    reflectionPrompt?: string;
    rewardXp?: number;
    rewardCoins?: number;
    mentorMood?: 'neutral' | 'excited' | 'thinking' | 'proud' | 'serious';
    mentorTitle?: string;
}

export interface SessionConfig {
    id: string;
    code: string;
    title: string;
    module: string;
    level: string;
    totalScreens: number;
    steps: SessionStep[];
}

export const SESSIONS_DATA: Record<string, SessionConfig> = {
    "DB-GC-01": {
        id: "DB-GC-01",
        code: "DB-GC-01",
        title: "Tu primer día en la Compañía",
        module: "Introducción al Pensmiento Computacional",
        level: "Exploradores Tecnológicos",
        totalScreens: 6,
        steps: [
            {
                id: 1,
                type: 'story',
                title: "Tu primer día en Game Creators Company",
                narrative: "¡Hola! Soy tu mentor y hoy te acompañaré en tu gran aventura. Bienvenido a Game Creators Company. Esta es la compañía donde los desarrolladores crean videojuegos increíbles.",
                visualType: 'image',
                mentorMood: 'excited',
                mentorTitle: "¡BIENVENIDO, CADETE!"
            },
            {
                id: 2,
                type: 'challenge',
                title: "Misión del día",
                subtitle: "El Reto de la Compañía",
                narrative: "Necesitamos tu ayuda. La compañía está preparando un nuevo videojuego, pero antes de comenzar, debemos construir la escena inicial.",
                mentorMood: 'serious',
                mentorTitle: "PROTOCOLO DE MISIÓN",
                steps: [
                    { title: "Abrir GDevelop", desc: "Localiza el icono de GDevelop" },
                    { title: "Crear Proyecto", desc: "Empezar desde cero" },
                    { title: "Crear Escena", desc: "Añadir nueva escena" },
                    { title: "Agregar Personaje", desc: "Importar un Sprite" }
                ]
            },
            {
                id: 3,
                type: 'concept',
                title: "Conceptos Clave",
                conceptTitle: "Motor de Videojuegos & Escena",
                narrative: "¡Atención! Para ser un creador, debes conocer las herramientas de la industria. Un motor es como tu caja de herramientas digital.",
                mentorMood: 'thinking',
                mentorTitle: "ANÁLISIS TÉCNICO",
                steps: [
                    { title: "GDevelop", desc: "Es el motor que usaremos para construir el juego." },
                    { title: "Escena", desc: "Es el lugar donde ocurre la acción del videojuego." }
                ]
            },
            {
                id: 4,
                type: 'exploration',
                title: "Construye tu Videojuego",
                subtitle: "Guía paso a paso",
                narrative: "Es hora de ensuciarse las alas... digo, ¡las manos! Sigue mis instrucciones para dar tus primeros pasos en el software.",
                mentorMood: 'neutral',
                mentorTitle: "GUÍA DE CAMPO",
                steps: [
                    { title: "Abrir Software", desc: "Doble clic en GDevelop." },
                    { title: "Nuevo Proyecto", desc: "Haz clic en 'Crear nuevo proyecto'." },
                    { title: "Crear Escena", desc: "Añade una nueva escena en el panel lateral." },
                    { title: "Personaje (Sprite)", desc: "Importa un personaje de la biblioteca." }
                ]
            },
            {
                id: 5,
                type: 'improve',
                title: "Mejora tu Creación",
                narrative: "¿Notas algo? Tu escena se ve bien, pero los mejores creadores siempre buscan la perfección. ¿Qué le falta a tu mundo?",
                mentorMood: 'excited',
                mentorTitle: "OPTIMIZACIÓN CREATIVA",
                steps: [
                    { title: "Multi-Personajes", desc: "Agrega otros elementos interactivos." },
                    { title: "Objetos Extra", desc: "Dales vida con obstáculos o premios." }
                ]
            },
            {
                id: 6,
                type: 'achievement',
                title: "¡Logro Desbloqueado!",
                badgeName: "Explorador de Videojuegos",
                narrative: "¡Extraordinario! Has superado tu primer contacto con el desarrollo. Tu futuro en la industria se ve brillante.",
                mentorMood: 'proud',
                mentorTitle: "CORE SINCRONIZADO",
                reflectionPrompt: "¿Qué tipo de videojuego te gustaría crear en el futuro?",
                rewardXp: 250,
                rewardCoins: 0.25
            }
        ]
    },
    "DB-GC-02": {
        id: "DB-GC-02",
        code: "DB-GC-02",
        title: "Las instrucciones del juego",
        module: "Introducción al Pensmiento Computacional",
        level: "Exploradores Tecnológicos",
        totalScreens: 9,
        steps: [
            {
                id: 1,
                type: 'story',
                title: "Historia de la Compañía",
                subtitle: "Las instrucciones del juego",
                narrative: "¡Detecto un error de lógica! Los personajes están quietos. No saben qué hacer porque nadie les ha dado instrucciones.",
                visualType: 'video',
                visualUrl: "https://www.youtube.com/embed/placeholder",
                mentorMood: 'serious',
                mentorTitle: "DIAGNÓSTICO DEL SISTEMA"
            },
            {
                id: 2,
                type: 'challenge',
                title: "Misión del día",
                subtitle: "Enseñar al personaje qué hacer",
                narrative: "Estamos a punto de programar una secuencia. Necesito que seas preciso. El personaje debe avanzar, girar y avanzar de nuevo.",
                mentorMood: 'thinking',
                mentorTitle: "RETO DE PROGRAMACIÓN",
                narrativePoints: [
                    "1. Avanzar",
                    "2. Girar",
                    "3. Avanzar de nuevo"
                ]
            },
            {
                id: 3,
                type: 'concept',
                title: "Concepto Interactivo",
                conceptTitle: "Instrucción & Secuencia",
                narrative: "RecuerdaCadete: en programación, el orden lo es todo. Una instrucción mal colocada puede causar un 'bug' gigante.",
                mentorMood: 'neutral',
                mentorTitle: "DATOS DEL NÚCLEO",
                steps: [
                    { title: "Instrucción", desc: "Una orden individual (ej: Mover)." },
                    { title: "Secuencia", desc: "Conjunto de instrucciones en orden." }
                ]
            },
            {
                id: 4,
                type: 'question',
                title: "Puesta a prueba",
                question: "¿Qué pasaría si las instrucciones se mezclan y pierden el orden?",
                mentorMood: 'thinking',
                mentorTitle: "ANÁLISIS CRÍTICO",
                options: [
                    { label: "El juego funciona bien", correct: false },
                    { label: "El personaje hace cosas incorrectas", correct: true },
                    { label: "No pasa nada", correct: false }
                ]
            },
            {
                id: 5,
                type: 'exploration',
                title: "Exploración en GDevelop",
                subtitle: "Creación de Eventos",
                narrative: "Sigue la proyección del docente. Vamos a convertir esas ideas en eventos reales dentro de GDevelop.",
                mentorMood: 'neutral',
                mentorTitle: "PROTOCOLO DE ENLACE",
                steps: [
                    { title: "Paso 1", desc: "Abrir el proyecto anterior." },
                    { title: "Paso 2", desc: "Seleccionar la escena." },
                    { title: "Paso 3", desc: "Agregar un evento y una acción." }
                ]
            },
            {
                id: 6,
                type: 'live',
                title: "RETO EN VIVO",
                subtitle: "Activado por el Docente",
                narrative: "¡CUIDADO! Un reto de tiempo real está por comenzar. Sincroniza tus circuitos, ¡tienes 5 minutos!",
                mentorMood: 'excited',
                mentorTitle: "ALERTA DE RETO",
                rewardXp: 50
            },
            {
                id: 7,
                type: 'improve',
                title: "Mejora Creativa",
                narrative: "¿Y si hacemos que el personaje salte o cambie de color? La creatividad es el combustible de un desarrollador.",
                mentorMood: 'proud',
                mentorTitle: "MODO CREATIVO",
                steps: [
                    { title: "Movimiento lateral", desc: "Izquierda y derecha." },
                    { title: "Animación", desc: "Cambia el estado del Sprite." }
                ]
            },
            {
                id: 8,
                type: 'evaluation',
                title: "Evaluación Rápida",
                question: "¿Qué es una secuencia?",
                mentorMood: 'serious',
                mentorTitle: "EXAMEN DE DATOS",
                options: [
                    { label: "Instrucciones en orden", correct: true },
                    { label: "Un personaje", correct: false },
                    { label: "Un sonido", correct: false }
                ],
                reflectionPrompt: "Sube captura de tu secuencia en GDevelop."
            },
            {
                id: 9,
                type: 'achievement',
                title: "¡Insignia Desbloqueada!",
                badgeName: "Programador de Instrucciones",
                narrative: "¡Secuencia completa! Has demostrado un gran entendimiento de la lógica secuencial. ¡Sigue así!",
                mentorMood: 'proud',
                mentorTitle: "META ALCANZADA",
                rewardXp: 250,
                rewardCoins: 0.25
            }
        ]
    }
};

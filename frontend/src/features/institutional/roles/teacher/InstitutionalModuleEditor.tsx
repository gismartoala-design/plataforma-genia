import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Video,
    FileText,
    Link as LinkIcon,
    Trash2,
    ChevronRight,
    ChevronLeft,
    Settings,
    Save,
    Loader2,
    AlertCircle,
    GripVertical,
    Activity,
    Map as MapIcon,
    HelpCircle,
    Layers,
    Cpu as CpuIcon,
    ChevronUp,
    ChevronDown,
    Hammer,
    Construction,
    Home,
    ArrowLeft,
    PenTool,
    CheckSquare,
    ClipboardList,
    Terminal,
    Edit2,
    Workflow,
    Sparkles,
    Upload,
    X,
    MessageSquare,
    Trophy,
    Gamepad2,
    Lightbulb,
    Target,
    Wand2,
    Download,
    Eye
} from 'lucide-react';
import { MissionCinematicViewer } from '../../roles/student/MissionCinematicViewer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { institutionalCurriculumApi, SectionInst, ModuloInst } from '@/features/institutional/services/curriculum.api';
import { AlgoritmoEditor } from '@/features/institutional/components/editors/AlgoritmoEditor';
import { PreguntaEditor } from '@/features/institutional/components/editors/PreguntaEditor';
import { ClasificacionEditor } from '@/features/institutional/components/editors/ClasificacionEditor';
import { ArduinoLabEditor } from '@/features/institutional/components/editors/ArduinoLabEditor';
import { QuizEditor } from '@/features/institutional/components/editors/QuizEditor';
import { TareaEditor } from '@/features/institutional/components/editors/TareaEditor';
import { NotaEditor } from '@/features/institutional/components/editors/NotaEditor';
import { VideoEditor } from '@/features/institutional/components/editors/VideoEditor';
import { PdfEditor } from '@/features/institutional/components/editors/PdfEditor';
import { LinkEditor } from '@/features/institutional/components/editors/LinkEditor';
import { PythonLabEditor } from '@/features/institutional/components/editors/PythonLabEditor';
import { ActivityToolbox } from '@/features/institutional/components/editors/ActivityToolbox';
import { InstitutionalClassBuilder } from '@/features/institutional/components/editors/InstitutionalClassBuilder';
import { MissionEditor } from '@/features/institutional/components/editors/MissionEditor';
import { toast } from 'sonner';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import '../../styles/ConstructionTheme.css';
import { UserRole } from '@/types/common.types';

// Initial state for new activities
const INITIAL_ACTIVITY_DATA: Record<string, any> = {
    desafio_algoritmo: { grid: Array(25).fill(0), startIdx: 0, targetIdx: 24, obstacles: [] },
    pregunta_abierta: { pregunta: '', feedback: '' },
    clasificacion: { categories: ['Software', 'Hardware'], items: [] },
    arduino_lab: { parts: [] },
    quiz: { pregunta: '', opciones: ['', ''], respuestaCorrecta: 0, feedback: '' },
    tarea: { titulo: '', consigna: '', puntos: 100, criterio: '' },
    nota: { titulo: '', contenido: '', categoria: 'tecnica' },
    python_lab: {
        titulo: 'Reto Python 1',
        instrucciones: 'Programa las teclas para llegar a la meta.',
        mapa: [0, 0, 0, 1, 0, 0, 1, 0, 0, 2],
        codigoBase: '# Mapeo de teclas\nbind_key("ArrowRight", "walk")\nbind_key(" ", "jump")'
    },
    modular_class: {
        metadata: { title: 'Nueva Sesión Modular', description: '' },
        blocks: []
    },
    video: { titulo: '', url: '', descripcion: '' },
    pdf: { titulo: '', url: '', descripcion: '' },
    link: { titulo: '', url: '', descripcion: '' },
    mission: {
        platform: { name: "Misiones Avanzadas", levels: [] },
        mission: { 
            id: `mision_${Math.random().toString(36).substr(2, 5)}`,
            title: "Nueva Misión",
            level: "6to EGB",
            duration_minutes: 45,
            module: "Módulo Base",
            domain: "Pensamiento Computacional",
            type: ["activacion"],
            system_context: { name: "Entorno Base", initial_kpi: 0, status: "normal" }
        },
        visibility: {
            teacher: { show_intention: true, show_pedagogy: true, show_script: true, show_observation: true, show_common_errors: true, show_intervention: true, show_evaluation: true },
            student: { show_context: true, show_questions: true, show_interaction: true, show_feedback: true, show_kpi: true, show_achievements: true, show_evidence_upload: true }
        },
        moments: [
            { id: "momento_1", title: "1. Activación", time_minutes: 5, config: { interaction_type: "open_response" }, teacher: { intention: "", script: "" }, student: { content: "" } },
            { id: "momento_2", title: "2. Conflicto Cognitivo", time_minutes: 5, config: { interaction_type: "multiple_choice" }, teacher: { intention: "", script: "" }, student: { content: "" } },
            { id: "momento_3", title: "3. Construcción", time_minutes: 10, config: { interaction_type: "interactive_lab" }, teacher: { intention: "", script: "" }, student: { content: "" } },
            { id: "momento_4", title: "4. Conceptualización", time_minutes: 5, config: { interaction_type: "content_plus_question" }, teacher: { intention: "", script: "" }, student: { content: "" } },
            { id: "momento_5", title: "5. Aplicación Tecnológica", time_minutes: 10, config: { interaction_type: "sequence_order" }, teacher: { intention: "", script: "" }, student: { content: "" } },
            { id: "momento_6", title: "6. Reflexión", time_minutes: 5, config: { interaction_type: "open_response" }, teacher: { intention: "", script: "" }, student: { content: "" } },
            { id: "momento_7", title: "7. Cierre e Impacto", time_minutes: 3, config: { interaction_type: "auto_display" }, teacher: { intention: "", script: "" }, student: { content: "" } },
            { id: "momento_8", title: "8. Evidencia", time_minutes: 2, config: { interaction_type: "file_upload" }, teacher: { intention: "", script: "" }, student: { content: "" } }
        ],
        engine: { kpi_dynamic: true, track_attempts: true, auto_hint_system: true, progression_system: true, role_based_views: true }
    }
};

const TYPE_CONFIG = {
    video: { label: 'Video', icon: Video, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    pdf: { label: 'PDF', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    link: { label: 'Link', icon: LinkIcon, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    pregunta_abierta: { label: 'Reflexión', icon: HelpCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    desafio_algoritmo: { label: 'Lógica', icon: MapIcon, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    clasificacion: { label: 'Clasificar', icon: Layers, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    arduino_lab: { label: 'Arduino', icon: CpuIcon, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    quiz: { label: 'Quiz', icon: CheckSquare, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    tarea: { label: 'Entrega', icon: ClipboardList, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    nota: { label: 'Nota', icon: PenTool, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    python_lab: { label: 'Python Lab', icon: Terminal, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    modular_class: { label: 'Sesión Modular', icon: Workflow, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    mission: { label: 'Misión', icon: Target, color: 'text-rose-500', bg: 'bg-rose-500/10' },
};

export const InstitutionalModuleEditor = () => {
    const params = useParams() as { moduleId?: string };
    const courseId = parseInt(params.moduleId || "0");
    const [, setLocation] = useLocation();
    const [user] = useState<{ id: string; role: UserRole; roleId?: number } | null>(() => {
        const saved = localStorage.getItem("edu_user");
        return saved ? JSON.parse(saved) : null;
    });

    const handleDownloadAIPrompt = () => {
        const prompt = `Actúa como un Diseñador Instruccional Senior y Desarrollador de Contenido Curricular GenIA. 
Tu tarea es generar el JSON para una MISIÓN AVANZADA (Nivel: 4to EGB - 3ro Bachillerato).
1. ENTORNO: ${selectedSection?.nombre || "Unidad de Aprendizaje"}
2. TEMA: ${selectedSection?.nombre || "Tema General"}
3. AUDIENCIA: Estudiantes de 4to de básica hasta 3ro de bachillerato.
4. ESTRUCTURA: 8 Momentos (Netflix-Style):
   - M1: Lanzamiento/Hook cinemático.
   - M2: Diagnóstico/HUD.
   - M3: Teoría en Acción.
   - M4: Laboratorio/Clasificación.
   - M5: Desafío de Ingeniería.
   - M6: Reflexión con IA.
   - M7: Cierre/Recompensa.
   - M8: Evidencia/Producto.
5. FORMATO TÉCNICO: JSON puro con este esquema:
{
  "mission": { "title": "...", "duration_minutes": 60, "level": "4to EGB - 3ro BGU" },
  "moments": [
    {
      "id": "m1", "title": "...", "time_minutes": 5, "isVisible": true,
      "config": { "interaction_type": "content_only" },
      "teacher": { "intention": "...", "script": "..." },
      "student": { "concept": "...", "content": "..." }
    },
    ... (hasta momento 8)
  ]
}

Genera un guión narrativo emocionante.`;
        
        const blob = new Blob([prompt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PROMPT_IA_MISION_AVANZADA_GENIA.txt`;
        a.click();
    };

    const isReadOnly = user?.role === "profesor_vista" || user?.roleId === 13;

    const [sections, setSections] = useState<SectionInst[]>([]);
    const [selectedSection, setSelectedSection] = useState<SectionInst | null>(null);
    const [modules, setModules] = useState<ModuloInst[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isToolboxOpen, setIsToolboxOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importText, setImportText] = useState('');
    const [editingActivity, setEditingActivity] = useState<{ id: number, tipo: string, data: any } | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<ModuloInst | null>(null);
    const [isEditingSectionName, setIsEditingSectionName] = useState<number | null>(null);

    // Preview states
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewModule, setPreviewModule] = useState<ModuloInst | null>(null);

    // Inline Creation State
    const [isInlineCreating, setIsInlineCreating] = useState(false);
    const [inlineLevelName, setInlineLevelName] = useState('');
    const [creationType, setCreationType] = useState<'modular' | 'mission' | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<string>("6to EGB");

    const MISSION_GRADES = [
        "4to EGB", "5to EGB", "6to EGB", "7mo EGB", "8vo EGB", "9no EGB", "10mo EGB",
        "1ro Bachillerato", "2do Bachillerato", "3ro Bachillerato"
    ];

    useEffect(() => {
        if (courseId) {
            fetchSections();
        }
    }, [courseId]);

    useEffect(() => {
        if (selectedSection) {
            fetchModules(selectedSection.id);
        } else {
            setModules([]);
        }
    }, [selectedSection]);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const data = await institutionalCurriculumApi.getSections(courseId);
            setSections(data);
            if (data.length > 0 && !selectedSection) {
                setSelectedSection(data[0]);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            toast.error("Error al cargar la estructura del curso");
        } finally {
            setLoading(false);
        }
    };

    const fetchModules = async (sectionId: number) => {
        try {
            const data = await institutionalCurriculumApi.getModulesBySection(sectionId);
            setModules(data);
        } catch (error) {
            console.error('Error fetching modules:', error);
        }
    };

    const handleAddSection = async () => {
        if (isReadOnly) return;
        setSaving(true);
        try {
            const newSection = await institutionalCurriculumApi.createSection({
                cursoId: courseId,
                nombre: `NUEVA UNIDAD ${sections.length + 1}`,
                orden: sections.length + 1
            });
            setSections([...sections, newSection]);
            setSelectedSection(newSection);
            toast.success("Nueva unidad académica añadida");
        } catch (error) {
            toast.error("Error al crear unidad");
        } finally {
            setSaving(false);
        }
    };

    const handleAddModule = async (tipo: string, customTitle?: string, customContent?: any) => {
        if (!selectedSection || !user || isReadOnly) return;

        const initialData = customContent || INITIAL_ACTIVITY_DATA[tipo] || {};
        const label = TYPE_CONFIG[tipo as keyof typeof TYPE_CONFIG]?.label || 'Nivel';
        const finalTitle = customTitle || `Nuevo ${label}`;

        try {
            const newModule = await institutionalCurriculumApi.createModule({
                seccionId: selectedSection.id,
                cursoId: courseId,
                titulo: finalTitle,
                tipo,
                contenido: initialData,
                profesorId: parseInt(user.id),
                orden: modules.length + 1
            });

            setModules(prev => [...prev, newModule]);
            return newModule;
        } catch (error) {
            console.error('Error adding module:', error);
            throw error;
        }
    };

    const handleInlineCreateConfirm = async () => {
        if (!inlineLevelName.trim() || isReadOnly) {
            setIsInlineCreating(false);
            setCreationType(null);
            return;
        }

        setSaving(true);
        try {
            const finalType = creationType === 'mission' ? 'mission' : 'modular_class';
            const initialContent = finalType === 'mission' ? {
                ...INITIAL_ACTIVITY_DATA.mission,
                mission: { ...INITIAL_ACTIVITY_DATA.mission.mission, title: inlineLevelName.trim(), level: selectedGrade }
            } : undefined;

            const newMod = await handleAddModule(finalType, inlineLevelName.trim(), initialContent);
            if (newMod) {
                setSelectedLevel(newMod);
                toast.success(`${finalType === 'mission' ? 'Misión' : 'Nivel'} "${inlineLevelName}" creado`);
            }
            setInlineLevelName('');
            setIsInlineCreating(false);
            setCreationType(null);
        } catch (error) {
            toast.error("Error al crear");
        } finally {
            setSaving(false);
        }
    };

    const handleAIImport = async () => {
        if (!importText.trim() || !selectedSection || isReadOnly) return;

        setSaving(true);
        try {
            // 1. Intentar detectar si es un JSON de Misión (8 momentos)
            try {
                const parsed = JSON.parse(importText);
                if (parsed.mission || parsed.moments) {
                    const title = parsed.mission?.title || "Misión GenIA";
                    const newMod = await handleAddModule('mission', title, parsed);
                    if (newMod) {
                        toast.success("Misión IA instalada exitosamente");
                        fetchModules(selectedSection.id);
                        setIsImportOpen(false);
                        setImportText('');
                        return;
                    }
                }
            } catch (jsonErr) {
                // No es JSON, intentar parseo de texto Legacy "CLASE 1:"
            }

            // 2. Lógica Legacy de Texto (CLASE 1: ...)
            const chunks = importText.split(/(?=CLASE\s+\d+:)/i);
            let createdCount = 0;

            for (const chunk of chunks) {
                if (!chunk.toUpperCase().includes('CLASE')) continue;

                const lines = chunk.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                if (lines.length === 0) continue;

                const titleLine = lines[0];
                const titleMatch = titleLine.match(/CLASE\s+\d+:\s*(.+)/i);
                const title = titleMatch ? titleMatch[1].trim() : titleLine.trim();

                const blocks: any[] = [];

                lines.forEach(line => {
                    if (line.includes('🎮 Actividad:')) {
                        blocks.push({
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'NARRATIVE',
                            data: { titulo: 'Misión del Día', texto: line.replace('🎮 Actividad:', '').trim() }
                        });
                    }
                    if (line.includes('humano') && line.includes('naturaleza')) {
                        blocks.push({
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'EVALUATION',
                            data: {
                                pregunta: '¿Quién creó estos objetos? (Lápiz, Árbol, Celular)',
                                opciones: ['👤 El Ser Humano (Tecnológico)', '🌿 La Naturaleza (Natural)'],
                                respuestaIndex: 0
                            }
                        });
                    }
                    if (line.includes('⭐ Gamificación:')) {
                        blocks.push({
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'REWARD',
                            data: { insignia: 'Genio Explorador', xp: 50 }
                        });
                    }
                });

                const newMod = await handleAddModule('modular_class', title, {
                    metadata: { title, description: 'Sesión generada por AI Builder' },
                    blocks: blocks.length > 0 ? blocks : []
                });

                if (newMod) createdCount++;
            }

            if (createdCount > 0) {
                toast.success(`${createdCount} niveles generados`);
                fetchModules(selectedSection.id);
                setIsImportOpen(false);
                setImportText('');
            } else {
                toast.error("No se reconoció el formato. Usa el Prompt Maestro.");
            }
        } catch (error) {
            toast.error("Error durante la generación.");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateDemoMission = async () => {
        if (!selectedSection || isReadOnly) return;
        setSaving(true);
        try {
            const title = "SESIÓN 1: Secuencias y Orden";
            const blocks = [
                {
                    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
                    type: 'KIDS_WELCOME',
                    data: {
                        titulo: "FASE 1: Bienvenida",
                        texto: "¡Hola amigos! ¿Cómo están hoy? Me da mucho gusto verlos. Hoy vamos a aprender algo muy especial: las secuencias.",
                        globalPerms: { visible: true, interactive: true, autoplay: true, trackProgress: true },
                        blockPerms: { allowSkip: false, bgMusic: true }
                    }
                },
                {
                    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
                    type: 'KIDS_WARMUP',
                    data: {
                        titulo: "FASE 2: Calentamiento 'Simón Dice'",
                        texto: "Juego: Simón Dice. Lógico va a mostrar movimientos. ¡Síguelos en el MISMO ORDEN!",
                        globalPerms: { visible: true, interactive: true, autoplay: true, trackProgress: true },
                        blockPerms: { enableCamera: false, manualTime: true }
                    }
                },
                {
                    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
                    type: 'KIDS_THEORY',
                    data: {
                        titulo: "FASE 3: Enseñanza - ¿Qué es una Secuencia?",
                        texto: "Una secuencia es cuando hacemos cosas en un orden especial. Primero → Después → Luego.",
                        globalPerms: { visible: true, interactive: true, autoplay: true, trackProgress: true },
                        blockPerms: { forceAudio: true }
                    }
                },
                {
                    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
                    type: 'KIDS_ERROR_LAB',
                    data: {
                        titulo: "FASE 4: Laboratorio de Error",
                        texto: "Orden Incorrecto: Comer con cuchara -> Echar leche -> Poner cereal -> Traer plato. ¡Eso está MAL!",
                        globalPerms: { visible: true, interactive: true, autoplay: true, trackProgress: true },
                        blockPerms: { soundFeedback: true, showRetry: true }
                    }
                }
            ];

            const newMod = await handleAddModule('modular_class', title, {
                metadata: { title, description: 'Plan de Clases Digital - Segundo de Básica (5-6 años)' },
                blocks
            });

            if (newMod) setSelectedLevel(newMod);
            toast.success("Secuencia Didáctica: 'Secuencias y Orden' Instalada correctamente");
            fetchModules(selectedSection.id);
        } catch (error) {
            toast.error("Error al instalar demo");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateDemoMission6EGB = async () => {
        if (!selectedSection || isReadOnly) return;
        setSaving(true);
        try {
            const title = "MISIÓN: Falla en la secuencia de semáforos";
            const content = {
                platform: {
                    name: "Misiones Avanzadas",
                    levels: ["4to EGB", "5to EGB", "6to EGB", "7mo EGB", "8vo EGB", "9no EGB", "10mo EGB", "1ro Bachillerato", "2do Bachillerato", "3ro Bachillerato"]
                },
                mission: {
                    id: "mision_001",
                    title: "Falla en la secuencia de semáforos",
                    level: "6to EGB",
                    duration_minutes: 55,
                    module: "Programación básica",
                    domain: "Secuencias y algoritmos",
                    type: ["activacion", "diagnostico"],
                    system_context: {
                        name: "Red de semáforos inteligentes",
                        initial_kpi: 30,
                        status: "riesgo_alto"
                    }
                },
                visibility: {
                    teacher: { show_intention: true, show_pedagogy: true, show_script: true, show_observation: true, show_common_errors: true, show_intervention: true, show_evaluation: true },
                    student: { show_context: true, show_questions: true, show_interaction: true, show_feedback: true, show_kpi: true, show_achievements: true, show_evidence_upload: true }
                },
                moments: [
                    {
                        id: "momento_1",
                        title: "Activación del conocimiento previo",
                        time_minutes: 8,
                        config: { interaction_type: "open_response", input_mode: ["text", "oral"], affects_kpi: false, max_attempts: null, auto_feedback: false },
                        teacher: {
                            intention: "Activar noción de secuencia en acciones cotidianas",
                            pedagogy: ["constructivismo", "aprendizaje_significativo"],
                            script: "¿Qué haces primero al salir de casa? ¿Y después?",
                            observation: "Identifica si el estudiante reconoce orden lógico",
                            common_errors: ["No importa el orden"],
                            intervention: "¿Puedes vestirte antes de levantarte?"
                        },
                        student: { content: "¿Qué haces primero al salir de casa? ¿Qué haces después?", activity: "Responder en orden lógico" },
                        logic: { validation: "manual", store_response: true }
                    },
                    {
                        id: "momento_2",
                        title: "Conflicto cognitivo",
                        time_minutes: 7,
                        config: { interaction_type: "multiple_choice", affects_kpi: true, max_attempts: 2, auto_feedback: true },
                        student: { context: "Secuencia actual: Verde → Rojo → Amarillo", question: "¿Este sistema es seguro?", options: [{ id: "A", text: "Sí" }, { id: "B", text: "No" }] },
                        logic: { correct_answer: "B", feedback: { correct: "Correcto. El sistema es peligroso.", incorrect: "Observa el orden nuevamente." }, kpi: { correct: 0, incorrect: -5, min_value: 25 }, hint: { enabled: true, after_attempts: 2, text: "Observa el orden de los colores" } }
                    },
                    {
                        id: "momento_3",
                        title: "Construcción de la solución",
                        time_minutes: 10,
                        config: { interaction_type: "sequence_order", affects_kpi: true, max_attempts: null },
                        student: { instruction: "Organiza correctamente el sistema de semáforos", items: ["Verde", "Amarillo", "Rojo"] },
                        logic: { correct_sequence: ["Verde", "Amarillo", "Rojo"], feedback: { correct: "El sistema comienza a estabilizarse", incorrect: "El sistema sigue fallando" }, kpi: { correct: 25, total_expected: 50 } }
                    },
                    {
                        id: "momento_4",
                        title: "Conceptualización",
                        time_minutes: 8,
                        config: { interaction_type: "content_plus_question", affects_kpi: false },
                        student: { concept: "Un algoritmo es una secuencia de pasos ordenados", question: "¿Qué es un algoritmo?", options: [{ id: "A", text: "Acciones desordenadas" }, { id: "B", text: "Acciones en orden" }] },
                        logic: { correct_answer: "B", auto_feedback: true }
                    },
                    {
                        id: "momento_5",
                        title: "Aplicación tecnológica",
                        time_minutes: 12,
                        config: { interaction_type: "sequence_order", affects_kpi: true, max_attempts: 3 },
                        student: { context: "Robot debe completar una tarea", items: ["Encender", "Caminar", "Girar", "Llegar"] },
                        logic: { correct_sequence: ["Encender", "Caminar", "Girar", "Llegar"], feedback: { correct: "Robot operativo", incorrect: "Error en ejecución" }, hint: { enabled: true, after_attempts: 1, text: "¿Qué ocurre primero en la vida real?" }, kpi: { correct: 30, total_expected: 80 } }
                    },
                    {
                        id: "momento_6",
                        title: "Reflexión",
                        time_minutes: 5,
                        config: { interaction_type: "open_response", affects_kpi: false, teacher_review: true },
                        student: { questions: ["¿Por qué fallaba el sistema?", "¿Qué aprendiste hoy?"] },
                        logic: { store_response: true, evaluation_mode: "teacher" }
                    },
                    {
                        id: "momento_7",
                        title: "Cierre e impacto",
                        time_minutes: 3,
                        config: { interaction_type: "auto_display" },
                        student: { final_kpi: 90, achievements: ["Restaurador del sistema de movilidad", "Pensamiento computacional activado"] }
                    },
                    {
                        id: "momento_8",
                        title: "Evidencia",
                        time_minutes: 2,
                        config: { interaction_type: "file_upload", allowed_formats: ["jpg", "png", "pdf"], required: false },
                        logic: { store_file: true, visible_to_teacher: true }
                    }
                ],
                engine: { kpi_dynamic: true, track_attempts: true, auto_hint_system: true, progression_system: true, role_based_views: true }
            };

            const newMod = await handleAddModule('mission', title, content);

            if (newMod) setSelectedLevel(newMod);
            toast.success("Misión 'Falla en la secuencia de semáforos' (6to EGB) Instalada correctamente");
            fetchModules(selectedSection.id);
        } catch (error) {
            toast.error("Error al instalar misión avanzada");
        } finally {
            setSaving(false);
        }
    };

    const handleEditActivity = (mod: ModuloInst) => {
        if (mod.tipo === 'modular_class' || mod.tipo === 'mission' || (mod.contenido && Array.isArray(mod.contenido?.blocks))) {
            setSelectedLevel(mod);
        } else {
            setEditingActivity({ id: mod.id, tipo: mod.tipo, data: mod.contenido || {} });
        }
    };

    const handleLevelSave = async (modId: number, content: any) => {
        if (isReadOnly) return;
        setSaving(true);
        try {
            await institutionalCurriculumApi.updateModule(modId, { contenido: content });
            toast.success("Progreso guardado");
            fetchModules(selectedSection!.id);
            setSelectedLevel(null);
        } catch (error) {
            toast.error("Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveActivityConfig = async (data: any) => {
        if (!editingActivity || isReadOnly) return;
        try {
            await institutionalCurriculumApi.updateModule(editingActivity.id, {
                contenido: data,
                titulo: data.titulo || data.pregunta || undefined
            });
            setModules(modules.map(m => m.id === editingActivity.id ? { ...m, contenido: data, titulo: data.titulo || data.pregunta || m.titulo } : m));
            setEditingActivity(null);
            toast.success("Módulo actualizado");
        } catch (error) {
            toast.error("Error al guardar");
        }
    };

    const handleDeleteModule = async (moduleId: number) => {
        if (isReadOnly || !window.confirm('¿Eliminar esta lección?')) return;
        try {
            await institutionalCurriculumApi.deleteModule(moduleId);
            setModules(modules.filter(m => m.id !== moduleId));
            toast.success("Lección retirada");
        } catch (error) {
            console.error('Error deleting module:', error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="flex h-screen font-sans overflow-hidden relative" style={{ background: 'var(--inst-bg)' }}>
            <div className="absolute inset-0 construction-grid pointer-events-none opacity-40" />

            {/* Sidebar */}
            {!selectedLevel && (
                <aside className="w-80 border-r bg-white flex flex-col z-20 relative shrink-0 shadow-2xl shadow-blue-500/5">
                    <div className="p-6 border-b flex items-center justify-between min-h-[90px]">
                        {selectedSection ? (
                            <div className="flex items-center gap-3 w-full">
                                <Button
                                    onClick={() => setSelectedSection(null)}
                                    variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border shrink-0"
                                >
                                    <ChevronLeft className="w-5 h-5 text-blue-600" />
                                </Button>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-[10px] font-black tracking-widest uppercase opacity-40 leading-none mb-1">Unidad</h2>
                                    <p className="text-sm font-black truncate uppercase tracking-tight text-slate-800">{selectedSection.nombre}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Layers className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight text-slate-800">Currículo</h2>
                                    <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest leading-none">Mapa Institucional</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {selectedSection ? (
                            <>
                                {modules.map((mod, i) => {
                                    const config = TYPE_CONFIG[mod.tipo as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.nota;
                                    const Icon = config.icon;
                                    return (
                                        <motion.div
                                            key={mod.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={cn(
                                                "group p-4 rounded-2xl cursor-pointer transition-all border-2 flex items-center gap-4 relative bg-slate-50/50 border-transparent hover:bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5",
                                                selectedLevel?.id === mod.id && "border-blue-500 bg-white shadow-xl shadow-blue-500/10"
                                            )}
                                            onClick={() => handleEditActivity(mod)}
                                        >
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110", config.bg)}>
                                                <Icon className={cn("w-5 h-5", config.color)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Badge variant="outline" className="text-[8px] font-black px-1.5 h-4 mb-1 border-slate-200 text-slate-400">POS. {i + 1}</Badge>
                                                <h4 className="font-black text-xs truncate text-slate-800 uppercase tracking-tight">{mod.titulo}</h4>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {mod.tipo === 'mission' && (
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="w-8 h-8 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setPreviewModule(mod);
                                                            setIsPreviewOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {!isReadOnly && (
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {isInlineCreating && !isReadOnly ? (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-3xl bg-white border-2 border-blue-600 shadow-xl shadow-blue-500/10 space-y-4">
                                        {!creationType ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                                        <Plus className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Contenido</span>
                                                </div>
                                                <button 
                                                    onClick={() => setCreationType('modular')}
                                                    className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-blue-200 transition-all text-left flex items-center gap-3 group"
                                                >
                                                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform"><Workflow className="w-4 h-4 text-indigo-500" /></div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-tight text-slate-800">Sesión Modular</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Clase Interactiva Normal</p>
                                                    </div>
                                                </button>
                                                <button 
                                                    onClick={() => setCreationType('mission')}
                                                    className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-blue-200 transition-all text-left flex items-center gap-3 group"
                                                >
                                                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform"><Target className="w-4 h-4 text-rose-500" /></div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-tight text-slate-800">Misión Avanzada</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">4to EGB a 3ro Bachillerato</p>
                                                    </div>
                                                </button>

                                                <button 
                                                    onClick={() => {
                                                        setCreationType('mission');
                                                        handleDownloadAIPrompt();
                                                    }}
                                                    className="w-full p-4 rounded-2xl bg-blue-50 hover:bg-white border-2 border-blue-100 hover:border-blue-400 transition-all text-left flex items-center gap-3 group"
                                                >
                                                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform"><Wand2 className="w-4 h-4 text-white" /></div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-tight text-blue-700">Misión con IA</p>
                                                        <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none mt-0.5">4to EGB a 3ro BGU</p>
                                                    </div>
                                                </button>
                                                <Button onClick={() => setIsInlineCreating(false)} variant="ghost" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <button onClick={() => setCreationType(null)} className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-1">
                                                        <ChevronLeft className="w-3 h-3" /> Volver
                                                    </button>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">{creationType === 'mission' ? 'Misión Avanzada' : 'Sesión Modular'}</span>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Título del Nivel</label>
                                                        <Input
                                                            autoFocus
                                                            placeholder={creationType === 'mission' ? "Ej: Misión Espacial..." : "Ej: Los Objetos..."}
                                                            className="h-10 border-none bg-slate-50 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-500/20"
                                                            value={inlineLevelName}
                                                            onChange={(e) => setInlineLevelName(e.target.value)}
                                                        />
                                                    </div>

                                                    {creationType === 'mission' && (
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nivel Educativo</label>
                                                            <select 
                                                                value={selectedGrade}
                                                                onChange={(e) => setSelectedGrade(e.target.value)}
                                                                className="w-full h-10 px-4 bg-slate-50 rounded-xl border-none font-bold text-xs"
                                                            >
                                                                {MISSION_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 pt-1 border-t border-slate-50 mt-4">
                                                    <Button onClick={handleInlineCreateConfirm} disabled={saving || !inlineLevelName.trim()} className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                                                    </Button>
                                                    <Button onClick={() => { setIsInlineCreating(false); setCreationType(null); }} variant="ghost" className="w-10 h-10 rounded-xl border p-0 hover:bg-slate-50">
                                                        <X className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : !isReadOnly && (
                                    <div className="pt-4 space-y-3">
                                        <Button
                                            onClick={() => setIsInlineCreating(true)}
                                            className="w-full h-14 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl gap-3 font-black uppercase tracking-[0.1em] text-xs shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Nuevo Nivel
                                        </Button>

                                        <div className="flex flex-col gap-2">
                                            <Button
                                                onClick={() => setIsImportOpen(true)}
                                                className="h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 font-black uppercase text-[9px] tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                            >
                                                <Wand2 className="w-4 h-4" /> Arquitecto IA (Prompts & Import)
                                            </Button>
                                            
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    onClick={() => setIsImportOpen(true)}
                                                    variant="outline"
                                                    className="h-11 border-2 border-dashed rounded-xl gap-2 font-black uppercase text-[8px] tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all font-sans"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                    Importar AI
                                                </Button>
                                                <Button
                                                    onClick={() => setIsToolboxOpen(true)}
                                                    variant="outline"
                                                    className="h-11 border-2 border-dashed rounded-xl gap-2 font-black uppercase text-[8px] tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all font-sans"
                                                >
                                                    <Settings className="w-3.5 h-3.5" />
                                                    Toolbox
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-3">
                                {sections.map((sec, i) => (
                                    <div
                                        key={sec.id}
                                        className="group p-4 rounded-2xl cursor-pointer transition-all border-2 bg-white/50 border-transparent hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 flex items-center gap-4"
                                        onClick={() => setSelectedSection(sec)}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-sm shadow-inner">{i + 1}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Unidad</p>
                                            <h4 className="font-black text-xs truncate text-slate-800 uppercase tracking-tight">{sec.nombre}</h4>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t mt-auto">
                        <Button
                            onClick={() => setLocation(user?.role === 'institutional_admin' ? '/institucional-dashboard' : '/institucional-teach')}
                            className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-black text-white gap-3 font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" /> Finalizar Edición
                        </Button>
                    </div>
                </aside>
            )}

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/30">
                {!selectedLevel && (
                    <header className="px-10 py-6 border-b flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-orange-50 flex items-center justify-center border border-orange-100/50 shadow-inner">
                                <Construction className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
                                    {selectedSection?.nombre || 'Gestión de Contenidos'}
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                                    Genios Learning Architecture
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {isReadOnly && (
                                <Badge variant="outline" className="border-blue-500 text-blue-600 font-black px-4 py-2 rounded-xl bg-blue-50">
                                    MODO LECTURA (TUTOR)
                                </Badge>
                            )}
                            {!isReadOnly && (
                                <>
                                    <Button onClick={handleCreateDemoMission} disabled={saving} variant="outline" className="h-10 border-2 border-orange-200 text-orange-700 hover:bg-orange-50 rounded-xl gap-2 font-black uppercase text-[9px] tracking-widest transition-all px-4 shadow-sm shadow-orange-500/5">
                                        <Gamepad2 className="w-4 h-4" /> Instalar Misión 2do EGB
                                    </Button>
                                    <Button onClick={handleCreateDemoMission6EGB} disabled={saving} variant="outline" className="h-10 border-2 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl gap-2 font-black uppercase text-[9px] tracking-widest transition-all px-4 shadow-sm shadow-rose-500/5">
                                        <Target className="w-4 h-4" /> Instalar Misión 6to EGB
                                    </Button>
                                    <Button className="h-11 px-8 rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-xl transition-all border-b-4 border-black">
                                        <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                                    </Button>
                                </>
                            )}
                        </div>
                    </header>
                )}

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                    {selectedLevel ? (
                        <div className="max-w-[1700px] mx-auto h-full">
                            {selectedLevel.tipo === 'mission' ? (
                                <MissionEditor 
                                    data={selectedLevel.contenido} 
                                    isReadOnly={isReadOnly}
                                    onSave={(content) => handleLevelSave(selectedLevel.id, content)}
                                    onClose={() => setSelectedLevel(null)}
                                />
                            ) : (
                                <InstitutionalClassBuilder
                                    module={selectedLevel}
                                    inline={true}
                                    isReadOnly={isReadOnly}
                                    onSave={(content) => handleLevelSave(selectedLevel.id, content)}
                                    onClose={() => setSelectedLevel(null)}
                                />
                            )}
                        </div>
                    ) : !selectedSection ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-40 h-40 rounded-[3.5rem] bg-white border shadow-2xl flex items-center justify-center mb-8 relative">
                                <div className="absolute inset-0 construction-grid opacity-10 rounded-[3.5rem]" />
                                <Activity className="w-12 h-12 text-slate-200" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-200 uppercase tracking-tighter italic">Selecciona una Unidad</h2>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
                            <div className="relative group mb-16">
                                <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full scale-150 opacity-40 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-48 h-48 rounded-[3rem] bg-white border shadow-2xl flex items-center justify-center overflow-hidden rotate-6 group-hover:rotate-0 transition-all duration-1000 ease-out">
                                    <div className="absolute inset-0 construction-grid opacity-20" />
                                    <Layers className="w-20 h-20 text-blue-600" />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <Badge variant="outline" className="text-[11px] font-black uppercase tracking-[0.5em] bg-blue-50 text-blue-600 border-blue-100 px-6 py-2 rounded-full">Blueprint Studio</Badge>
                                <h1 className="text-8xl font-black italic uppercase tracking-tighter text-slate-800 leading-[0.75]">
                                    Mesa de <br />
                                    <span className="text-blue-600">Ingeniería</span>
                                </h1>
                                <p className="text-slate-400 text-xl max-w-xl mx-auto font-semibold">
                                    {isReadOnly ? "Explora la secuencia didáctica del curso. Como tutor, puedes visualizar toda la estructura y misiones instaladas." : "Crea niveles con el sistema de Escritura Rápida o usa el botón Instalar Misión 2do EGB para cargar la Clase de Secuencias y Orden automáticamente."}
                                </p>

                                {!isReadOnly && (
                                    <div className="flex items-center gap-6 justify-center mt-12">
                                        <Button onClick={handleCreateDemoMission} disabled={saving} className="h-16 px-10 rounded-[2rem] bg-orange-600 hover:bg-orange-700 text-white font-black uppercase gap-4 shadow-2xl shadow-orange-500/20 active:scale-95 transition-all text-sm">
                                            <Sparkles className="w-6 h-6" /> INSTALAR SESIÓN 1: SECUENCIAS
                                        </Button>
                                        <Button onClick={() => setIsImportOpen(true)} variant="outline" className="h-16 px-10 rounded-[2rem] border-2 border-slate-200 font-black uppercase gap-4 text-slate-500 hover:bg-slate-50 transition-all text-sm">
                                            <Upload className="w-5 h-5" /> PEGAR CURRÍCULO AI
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* AI Curator/Importer Dialog */}
            {!isReadOnly && isImportOpen && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                   <div className="bg-white w-full max-w-5xl rounded-[3.5rem] p-16 space-y-10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-400" />
                      <button onClick={() => setIsImportOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-colors">
                        <X className="w-8 h-8" />
                      </button>
        
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                          {/* Phase 1: Export Prompt */}
                          <div className="space-y-8 border-r border-slate-100 pr-16">
                              <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                                    <Download className="w-7 h-7 text-blue-600" />
                                </div>
                                <h3 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter">1. Descargar Formato IA</h3>
                                <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tight">Utiliza este prompt para que tu IA favorita genere el contenido siguiendo la arquitectura pedagógica GenIA.</p>
                              </div>
                              
                              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                                      Este prompt incluye los 8 momentos pedagógicos y la estructura técnica requerida para niveles superiores.
                                  </p>
                                  <Button 
                                    onClick={handleDownloadAIPrompt} 
                                    className="w-full h-14 bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-sm"
                                  >
                                    Descargar Prompt Maestro
                                  </Button>
                              </div>
                          </div>
        
                          {/* Phase 2: Import JSON */}
                          <div className="space-y-8">
                              <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6">
                                    <Upload className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter">2. Pegar JSON GenIA</h3>
                                <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tight">Pega el código JSON generado por la IA para poblar automáticamente los niveles.</p>
                              </div>
        
                              <div className="space-y-4">
                                <Textarea 
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    placeholder='Pega aquí el JSON: { "mission": { ... }, "moments": [ ... ] }'
                                    className="bg-slate-50 border-none rounded-3xl min-h-[250px] font-mono text-[11px] p-8 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <Button 
                                    onClick={handleAIImport} 
                                    disabled={!importText.trim() || saving}
                                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Desplegando Currículo...
                                        </>
                                    ) : (
                                        "Desplegar Misiones IA"
                                    )}
                                </Button>
                              </div>
                          </div>
                      </div>
                   </div>
                </div>
            )}

            <ActivityToolbox isOpen={isToolboxOpen} onClose={() => setIsToolboxOpen(false)} onSelect={handleAddModule} />
            <Sheet open={!!editingActivity} onOpenChange={(open) => !open && setEditingActivity(null)}>
                <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-l bg-slate-50">
                    <SheetHeader className="p-10 bg-white border-b sticky top-0 z-10">
                        <SheetTitle className="text-3xl font-black tracking-tighter italic uppercase text-slate-800">Editor de <span className="text-blue-600">Configuración</span></SheetTitle>
                    </SheetHeader>
                    <div className="p-10 custom-scrollbar">
                        {editingActivity?.tipo === 'desafio_algoritmo' && <AlgoritmoEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={handleSaveActivityConfig} />}
                        {editingActivity?.tipo === 'pregunta_abierta' && <PreguntaEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={handleSaveActivityConfig} />}
                        {editingActivity?.tipo === 'quiz' && <QuizEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={handleSaveActivityConfig} />}
                        {editingActivity?.tipo === 'tarea' && <TareaEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={handleSaveActivityConfig} />}
                        {editingActivity?.tipo === 'nota' && <NotaEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={handleSaveActivityConfig} />}
                        {editingActivity?.tipo === 'video' && <VideoEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={handleSaveActivityConfig} />}
                        {editingActivity?.tipo === 'pdf' && <PdfEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={handleSaveActivityConfig} />}
                        {editingActivity?.tipo === 'link' && <LinkEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={handleSaveActivityConfig} />}
                        {editingActivity?.tipo === 'python_lab' && <PythonLabEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={handleSaveActivityConfig} />}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Mission Preview Modal */}
            {isPreviewOpen && previewModule && (
                <MissionCinematicViewer 
                    module={previewModule} 
                    onClose={() => {
                        setIsPreviewOpen(false);
                        setPreviewModule(null);
                    }} 
                    isReadOnly={true}
                />
            )}
        </div>
    );
};

export default InstitutionalModuleEditor;

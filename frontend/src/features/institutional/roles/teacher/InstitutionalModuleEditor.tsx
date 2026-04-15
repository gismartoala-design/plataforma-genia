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
    ArrowRight,
    Users,
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
    Eye,
    EyeOff,
    LayoutDashboard,
    BookOpen,
    ClipboardCheck
} from 'lucide-react';
import { MissionCinematicViewer } from '../student/MissionCinematicViewer';
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
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { institutionalCurriculumApi, SectionInst, ModuloInst } from '@/features/institutional/services/curriculum.api';
import { institutionApi } from '@/services/institution.api';
import { professorApi } from '@/features/professor/services/professor.api';
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
import { AutoEvaluationEditor } from '@/features/institutional/components/editors/AutoEvaluationEditor';
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
            { id: "momento_1", title: "1. Activación", time_minutes: 5, config: { interaction_type: "open_response" }, teacher: { intention: "", pedagogy: [], script: "", observation: "", common_errors: [], intervention: "" }, student: { content: "" } },
            { id: "momento_2", title: "2. Conflicto Cognitivo", time_minutes: 5, config: { interaction_type: "multiple_choice" }, teacher: { intention: "", pedagogy: [], script: "", observation: "", common_errors: [], intervention: "" }, student: { content: "" } },
            { id: "momento_3", title: "3. Construcción", time_minutes: 10, config: { interaction_type: "interactive_lab" }, teacher: { intention: "", pedagogy: [], script: "", observation: "", common_errors: [], intervention: "" }, student: { content: "" } },
            { id: "momento_4", title: "4. Conceptualización", time_minutes: 5, config: { interaction_type: "content_plus_question" }, teacher: { intention: "", pedagogy: [], script: "", observation: "", common_errors: [], intervention: "" }, student: { content: "" } },
            { id: "momento_5", title: "5. Aplicación Tecnológica", time_minutes: 10, config: { interaction_type: "sequence_order" }, teacher: { intention: "", pedagogy: [], script: "", observation: "", common_errors: [], intervention: "" }, student: { content: "" } },
            { id: "momento_6", title: "6. Reflexión", time_minutes: 5, config: { interaction_type: "open_response" }, teacher: { intention: "", pedagogy: [], script: "", observation: "", common_errors: [], intervention: "" }, student: { content: "" } },
            { id: "momento_7", title: "7. Cierre e Impacto", time_minutes: 3, config: { interaction_type: "auto_display" }, teacher: { intention: "", pedagogy: [], script: "", observation: "", common_errors: [], intervention: "" }, student: { content: "" } },
            { id: "momento_8", title: "8. Evidencia", time_minutes: 2, config: { interaction_type: "file_upload" }, teacher: { intention: "", pedagogy: [], script: "", observation: "", common_errors: [], intervention: "" }, student: { content: "" } }
        ],
        engine: { kpi_dynamic: true, track_attempts: true, auto_hint_system: true, progression_system: true, role_based_views: true }
    },
    auto_evaluation: {
        context: 'Has sido asignado como analista de sistemas de la ciudad. Tu trabajo es revisar distintos sistemas tecnológicos que presentan fallas y tomar decisiones correctas para optimizarlos. Cada situación representa un problema real. Lee con atención antes de responder.',
        durationMinutes: 25,
        horizontalFormat: true,
        questions: [
            {
                id: 'q1',
                text: 'El sistema de iluminación de una calle fue programado para encenderse automáticamente en la noche. Sin embargo, los técnicos detectaron que la luz se enciende y apaga constantemente en pocos segundos, generando inestabilidad y consumo innecesario de energía. ¿Qué orden lógico falta?',
                options: ["Encender → Mantener encendido → Apagar", "Apagar → Encender → Apagar", "Encender → Reiniciar → Encender"],
                correctIndex: 0
            },
            {
                id: 'q2',
                text: 'Un estudiante está diseñando un sistema automatizado para una rutina diaria. Define los siguientes pasos: Ponerse los zapatos, ponerse las medias, salir de casa. ¿Cuál es el error?',
                options: ["Orden incorrecto en la secuencia", "Falta de automatización", "Exceso de repetición"],
                correctIndex: 0
            },
            {
                id: 'q3',
                text: 'El sistema de riego automático de un parque se activa cada mañana a la misma hora. Durante varios días ha estado lloviendo, lo que ha provocado exceso de agua. ¿Cuál es la decisión lógica correcta?',
                options: ["Activar siempre a la misma hora", "Activar solo si el suelo está seco", "Activar cada 30 minutos"],
                correctIndex: 1
            },
            {
                id: 'q4',
                text: 'En un cruce importante, los semáforos cambian a verde automáticamente cada cierto tiempo, sin verificar si hay vehículos esperando. Esto ha generado situaciones peligrosas.',
                options: ["Falta de lógica de decisión", "Exceso de pasos en la secuencia", "Error de repetition"],
                correctIndex: 0
            },
            {
                id: 'q5',
                text: 'Un sistema de monitoreo revisa constantemente si hay vehículos en un cruce. Cada pocos segundos analiza la información y vuelve a ejecutar el mismo proceso. ¿Cómo se llama este proceso?',
                options: ["Secuencia", "Repetición continua", "Error del sistema"],
                correctIndex: 1
            },
            {
                id: 'q6',
                text: 'Un sistema de control de luces requiere que una persona active manualmente el encendido y apagado cada vez que cambia la iluminación. ¿Qué conclusión es correcta?',
                options: ["Es un sistema automatizado", "No está automatizado", "Es un sistema inteligente"],
                correctIndex: 1
            },
            {
                id: 'q7',
                text: 'Un sistema incluye los siguientes pasos: Encender luz, encender luz nuevamente, mantener encendido. El sistema funciona, pero utiliza más acciones de las necesarias.',
                options: ["Sistema optimizado", "Sistema redundante", "Sistema automatizado"],
                correctIndex: 1
            },
            {
                id: 'q8',
                text: 'Un sistema de tráfico funciona de la siguiente manera: SI hay autos → cambiar a verde, SI no hay autos → cambiar a verde. ¿Qué falta aquí?',
                options: ["La lógica es correcta", "Falta una decisión real", "Es un sistema automático completo"],
                correctIndex: 1
            },
            {
                id: 'q9',
                text: 'Un sistema detecta condiciones y ejecuta acciones, pero nunca verifica si el resultado fue correcto o si necesita ajustes posteriores. ¿Cuál es el problema?',
                options: ["Falta de control y validación", "Secuencia correcta", "Sistema optimizado"],
                correctIndex: 0
            },
            {
                id: 'q10',
                text: 'Un sistema de movilidad ejecuta pasos en orden, no toma decisiones según el entorno y funciona siempre igual sin adaptarse. ¿Cómo clasificas este sistema?',
                options: ["Sistema completamente funcional", "Sistema parcialmente funcional", "Sistema inteligente optimizado"],
                correctIndex: 1
            }
        ]
    }
};

const MAKER_LAB_TEMPLATE = {
    ...INITIAL_ACTIVITY_DATA.mission,
    mission: {
        ...INITIAL_ACTIVITY_DATA.mission.mission,
        title: "Laboratorio Maker: Disección de Sistema",
        domain: "Ingeniería de Sistemas",
        type: ["construccion", "maker"]
    },
    moments: [
        { 
            id: "maker_1", title: "Fase 1: Selección", time_minutes: 5, 
            config: { interaction_type: "multiple_choice" },
            teacher: { intention: "", pedagogy: ["Observación"], script: "", observation: "", common_errors: [], intervention: "" },
            student: { context: "", question: "", options: [{text: ""}, {text: ""}, {text: ""}] } 
        },
        { 
            id: "maker_2", title: "Fase 2: Identificación", time_minutes: 10, 
            config: { interaction_type: "sequence_order" },
            teacher: { intention: "", pedagogy: ["Descomposición"], script: "", observation: "", common_errors: [""], intervention: "" },
            student: { context: "", question: "", items: [{text: ""}, {text: ""}, {text: ""}] } 
        },
        { 
            id: "maker_3", title: "Fase 3: Detección de Errores", time_minutes: 8, 
            config: { interaction_type: "multiple_choice" },
            teacher: { intention: "", pedagogy: ["Pensamiento Crítico"], script: "", observation: "", common_errors: [], intervention: "" },
            student: { context: "", question: "", options: [{text: ""}, {text: ""}] } 
        },
        { 
            id: "maker_4", title: "Fase 4: Conexión Lógica", time_minutes: 7, 
            config: { interaction_type: "sequence_order" },
            teacher: { intention: "", pedagogy: ["Abstracción"], script: "", observation: "", common_errors: [], intervention: "" },
            student: { context: "", question: "", items: [{text: ""}, {text: ""}, {text: ""}] } 
        },
        { 
            id: "maker_5", title: "Fase 5: Decisiones", time_minutes: 10, 
            config: { interaction_type: "open_response" },
            teacher: { intention: "", pedagogy: ["Lógica"], script: "", observation: "", common_errors: [], intervention: "" },
            student: { context: "", question: "" } 
        },
        { 
            id: "maker_6", title: "Fase 6: Repetición", time_minutes: 5, 
            config: { interaction_type: "multiple_choice" },
            teacher: { intention: "", pedagogy: ["Patrones"], script: "", observation: "", common_errors: [], intervention: "" },
            student: { context: "", question: "", options: [{text: ""}, {text: ""}] } 
        },
        { 
            id: "maker_7", title: "Fase 7: Diseño Final", time_minutes: 10, 
            config: { interaction_type: "open_response" },
            teacher: { intention: "", pedagogy: ["Algoritmos"], script: "", observation: "", common_errors: [], intervention: "" },
            student: { context: "", question: "" } 
        },
        { 
            id: "maker_8", title: "Fase 8: Simulación", time_minutes: 5, 
            config: { interaction_type: "multiple_choice" },
            teacher: { intention: "", pedagogy: ["Pruebas"], script: "", observation: "", common_errors: [], intervention: "" },
            student: { context: "", question: "", options: [{text: ""}, {text: ""}] } 
        },
        { 
            id: "maker_9", title: "Fase 9: Resultado", time_minutes: 5, 
            config: { interaction_type: "auto_display" },
            teacher: { intention: "", pedagogy: ["Metacognición"], script: "", observation: "", common_errors: [], intervention: "" },
            student: { context: "", concept: "" } 
        }
    ]
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
    maker_lab: { label: 'Laboratorio Maker', icon: Hammer, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    auto_evaluation: { label: 'Evaluación Automática', icon: ClipboardCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

export const InstitutionalModuleEditor = () => {
    const params = useParams() as { moduleId?: string };
    const courseId = parseInt(params.moduleId || "0");
    const [, setLocation] = useLocation();
    const [user] = useState<{ id: string; role: UserRole; roleId?: number; institucionId?: number } | null>(() => {
        const saved = localStorage.getItem("edu_user");
        return saved ? JSON.parse(saved) : null;
    });

    const isReadOnly = user?.role === "profesor_vista" || user?.roleId === 13;

    const [sections, setSections] = useState<SectionInst[]>([]);
    const [allModules, setAllModules] = useState<ModuloInst[]>([]);
    const [selectedSection, setSelectedSection] = useState<SectionInst | null>(null);
    const [modules, setModules] = useState<ModuloInst[]>([]);
    const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
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
    const [creationType, setCreationType] = useState<'modular_class' | 'mission' | 'quiz' | 'tarea' | 'maker_lab' | 'auto_evaluation' | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<string>("6to EGB");

    // Rename state
    const [renamingModuleId, setRenamingModuleId] = useState<number | null>(null);
    const [renameValue, setRenameValue] = useState('');

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
            const allMods = await institutionalCurriculumApi.getModulesByCourse(courseId);
            setAllModules(allMods);

            // Auto-select based on URL params to provide a cleaner UX from Dashboard
            const urlParams = new URLSearchParams(window.location.search);
            const querySecId = urlParams.get('sec');
            const queryLvlId = urlParams.get('lvl');

            if (querySecId) {
                const autoSecId = parseInt(querySecId);
                const targetSec = data.find(s => s.id === autoSecId);
                if (targetSec) {
                    setSelectedSection(targetSec);
                    setExpandedSections(prev => ({ ...prev, [autoSecId]: true }));
                    
                    if (queryLvlId) {
                        const targetLvl = allMods.find(m => m.id === parseInt(queryLvlId));
                        if (targetLvl) {
                            setSelectedLevel(targetLvl);
                        }
                    }
                }
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
            // Also sync the global allModules state to keep unit map accurate
            setAllModules(prev => {
                const filtered = prev.filter(m => m.seccionId !== sectionId);
                return [...filtered, ...data];
            });
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
            setAllModules(prev => [...prev, newModule]);
            return newModule;
        } catch (error) {
            console.error('Error adding module:', error);
            throw error;
        }
    };

    const handleLevelSave = async (modId: number, content: any) => {
        if (isReadOnly) return;
        setSaving(true);
        try {
            await institutionalCurriculumApi.updateModule(modId, { contenido: content });
            
            // Fix: Sync allModules list immediately to prevent "loss" of data in UI
            setAllModules(prev => prev.map(m => m.id === modId ? { ...m, contenido: content } : m));
            
            toast.success("Progreso guardado");
            await fetchModules(selectedSection!.id);
        } catch (error) {
            console.error('Save error:', error);
            toast.error("Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteModule = async (moduleId: number) => {
        if (isReadOnly || !window.confirm('¿Eliminar esta lección?')) return;
        try {
            await institutionalCurriculumApi.deleteModule(moduleId);
            setModules(modules.filter(m => m.id !== moduleId));
            setAllModules(allModules.filter(m => m.id !== moduleId));
            toast.success("Lección retirada");
        } catch (error) {
            console.error('Error deleting module:', error);
        }
    };

    const handleRenameModule = async (moduleId: number) => {
        if (!renameValue.trim() || isReadOnly) { setRenamingModuleId(null); return; }
        try {
            await institutionalCurriculumApi.updateModule(moduleId, { titulo: renameValue.trim() });
            setAllModules(prev => prev.map(m => m.id === moduleId ? { ...m, titulo: renameValue.trim() } : m));
            setModules(prev => prev.map(m => m.id === moduleId ? { ...m, titulo: renameValue.trim() } : m));
            toast.success("Nombre actualizado");
        } catch {
            toast.error("Error al renombrar");
        } finally {
            setRenamingModuleId(null);
            setRenameValue('');
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
            const finalType = creationType || 'modular_class';
            let initialContent = INITIAL_ACTIVITY_DATA[finalType] || {};

            if (finalType === 'mission') {
                initialContent = {
                    ...INITIAL_ACTIVITY_DATA.mission,
                    mission: { ...INITIAL_ACTIVITY_DATA.mission.mission, title: inlineLevelName.trim(), level: selectedGrade }
                };
            } else if (finalType === 'maker_lab') {
                initialContent = {
                    ...MAKER_LAB_TEMPLATE,
                    mission: { ...MAKER_LAB_TEMPLATE.mission, title: inlineLevelName.trim(), level: selectedGrade }
                };
            }

            const newMod = await handleAddModule(finalType, inlineLevelName.trim(), initialContent);
            if (newMod) {
                if (finalType === 'mission' || finalType === 'modular_class' || finalType === 'maker_lab' || finalType === 'auto_evaluation') {
                    setSelectedLevel(newMod);
                } else {
                    setEditingActivity({ id: newMod.id, tipo: newMod.tipo, data: newMod.contenido });
                }
                const label = TYPE_CONFIG[finalType as keyof typeof TYPE_CONFIG]?.label || 'Nivel';
                toast.success(`${label} "${inlineLevelName}" creado`);
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

    const handleEditActivity = (mod: ModuloInst) => {
        // Ensure the parent section is selected so the sidebar focuses on it
        const parentSec = sections.find(s => s.id === mod.seccionId);
        if (parentSec) setSelectedSection(parentSec);

        if (mod.tipo === 'modular_class' || mod.tipo === 'mission' || mod.tipo === 'maker_lab' || mod.tipo === 'auto_evaluation') {
            setSelectedLevel(mod);
        } else {
            setEditingActivity({ id: mod.id, tipo: mod.tipo, data: mod.contenido || {} });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="flex h-screen font-sans overflow-hidden relative" style={{ background: '#F8FAFC' }}>
            <div className="absolute inset-0 construction-grid pointer-events-none opacity-40" />

            {/* Sidebar Explorer - only visible when no level is selected */}
            {!selectedLevel && (
            <aside className="w-80 border-r bg-[#0F172A] flex flex-col z-30 relative shrink-0 shadow-2xl text-white">
                <div className="p-8 border-b border-white/10 shrink-0">
                    <button 
                        onClick={() => selectedSection ? setSelectedSection(null) : setLocation(user?.roleId === 13 ? '/institucional-tutor?view=sectores' : '/institucional-teach')}
                        className="flex items-center gap-3 text-white/50 hover:text-white transition-colors mb-6 group text-[10px] font-black uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {selectedSection ? 'Volver a Unidades' : 'Volver a Sectores'}
                    </button>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CpuIcon className="w-4 h-4 text-cyan-400" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400/70">Arquitectura Docente</span>
                            </div>
                            <h2 className="text-xl font-black italic tracking-tighter leading-none">{(sections[0] as any)?.courseName || "Genia Curriculum"}</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Niveles</p>
                                <p className="text-lg font-black leading-none">{allModules.length}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Unidades</p>
                                <p className="text-lg font-black leading-none">{sections.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-2">
                        <button
                            onClick={() => { setSelectedSection(null); setSelectedLevel(null); }}
                            className={cn(
                                "w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-transparent",
                                (!selectedSection && !selectedLevel) ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 border-white/10" : "text-white/40 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <LayoutDashboard className="w-4 h-4" /> Mapa de Unidades
                        </button>
                    </div>

                    <div className="px-5 mb-4 mt-8 flex items-center justify-between">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Estructura de Obra</span>
                        {!isReadOnly && (
                            <button onClick={handleAddSection} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all">
                                <Plus className="w-3 h-3 text-white" />
                            </button>
                        )}
                    </div>

                    <nav className="px-3 space-y-1 pb-20">
                        {sections.map((sec, sIdx) => {
                            const isSelected = selectedSection?.id === sec.id;
                            const sectionModules = allModules.filter(m => m.seccionId === sec.id);
                            
                            return (
                                <div key={sec.id} className="space-y-1">
                                    <div
                                        role="button"
                                        onClick={() => {
                                            setSelectedSection(isSelected ? null : sec);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-2xl transition-all group border border-transparent cursor-pointer",
                                            isSelected ? "bg-white/10 border-white/10 shadow-lg" : "hover:bg-white/5"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 transition-colors",
                                            isSelected ? "bg-blue-600 text-white" : "bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white/60"
                                        )}>
                                            {sIdx + 1 < 10 ? `0${sIdx + 1}` : sIdx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className={cn("text-[11px] font-black uppercase tracking-tight truncate", isSelected ? "text-white" : "text-white/40 group-hover:text-white/70")}>
                                                {sec.nombre}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none">{sectionModules.length} Actividades</p>
                                                <div className={cn("w-1 h-1 rounded-full", sec.activo ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-slate-600")} />
                                            </div>
                                        </div>
                                        
                                        {(!isReadOnly || user?.roleId === 13) && (
                                            <div
                                                role="button"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        await institutionalCurriculumApi.updateSection(sec.id, { activo: !sec.activo });
                                                        toast.success("Estado de visibilidad modificado");
                                                        fetchSections();
                                                    } catch (err) {
                                                        toast.error("No se pudo actualizar la unidad");
                                                    }
                                                }}
                                                className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100", 
                                                    sec.activo ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-500 hover:bg-slate-700"
                                                )}
                                            >
                                                {sec.activo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                            </div>
                                        )}
                                        <ChevronRight className={cn("w-3.5 h-3.5 text-white/10 transition-transform", isSelected && "rotate-90 text-blue-400")} />
                                    </div>

                                    {/* Lessons list - only if selected/expanded */}
                                    <div className={cn("overflow-hidden transition-all pl-4 pr-1 space-y-1", isSelected ? "max-h-[1000px] opacity-100 mt-2 mb-4" : "max-h-0 opacity-0")}>
                                        {sectionModules.map((mod) => {
                                            const config = TYPE_CONFIG[mod.tipo as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.nota;
                                            const Icon = config.icon;
                                            const isLvlActive = selectedLevel?.id === mod.id;

                                            return (
                                                <div
                                                    role="button"
                                                    key={mod.id}
                                                    onClick={() => handleEditActivity(mod)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group relative cursor-pointer",
                                                        isLvlActive ? "bg-blue-600/20 text-blue-400" : "text-white/30 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-transparent", isLvlActive ? "bg-blue-600/20 border-blue-500/30" : config.bg)}>
                                                        <Icon className={cn("w-3 h-3", isLvlActive ? "text-blue-400" : config.color)} />
                                                    </div>
                                                    <span className="text-[10px] font-black truncate tracking-tight uppercase flex-1 text-left">{mod.titulo}</span>
                                                    {!isReadOnly && !isLvlActive && (
                                                        <div 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                                                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                    </div>
                                            );
                                        })}
                                        {!isReadOnly && (
                                            <button 
                                                onClick={() => { 
                                                    setSelectedSection(sec);
                                                    setIsToolboxOpen(true); 
                                                }}
                                                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-white/20 hover:text-blue-400 hover:bg-blue-600/10 transition-all border border-dashed border-white/5 hover:border-blue-500/30 mt-2"
                                            >
                                                <Plus className="w-3.5 h-3.5 ml-1" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Inyectar Nivel</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </aside>
            )}

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAFC]">
                {/* When editing a level: show a minimal breadcrumb bar instead of the full header */}
                {selectedLevel ? (
                <header className="px-6 py-4 border-b flex items-center gap-4 bg-white/95 backdrop-blur-xl sticky top-0 z-20 shrink-0 shadow-sm">
                    <button
                        onClick={() => setSelectedLevel(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
                    </button>

                    <div className="h-5 w-px bg-slate-200" />

                    {selectedSection && (
                        <>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[140px]">{selectedSection.nombre}</span>
                            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                        </>
                    )}

                    <div className="flex items-center gap-2">
                        {(() => {
                            const config = TYPE_CONFIG[selectedLevel.tipo as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.nota;
                            const Icon = config.icon;
                            return (
                                <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", config.bg)}>
                                    <Icon className={cn("w-3.5 h-3.5", config.color)} />
                                </div>
                            );
                        })()}
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight truncate max-w-[240px]">{selectedLevel.titulo}</span>
                    </div>

                    {isReadOnly && (
                        <Badge variant="outline" className="ml-auto border-blue-500 text-blue-600 font-black px-3 py-1 rounded-xl bg-blue-50 shrink-0">
                            <Eye className="w-3 h-3 mr-1.5" /> VISTA PREVIA
                        </Badge>
                    )}
                </header>
                ) : (
                <header className="px-10 py-6 border-b flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white shadow-lg">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                                MAPA DE <span className="text-blue-600">INGENIERÍA</span> CURRICULAR
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
                                {selectedSection ? 'Planificación de Unidad' : 'Planificación Maestra de Obra'} · Genios Framework
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isReadOnly && (
                            <Badge variant="outline" className="border-blue-500 text-blue-600 font-black px-4 py-2 rounded-xl bg-blue-50">
                                <Eye className="w-3.5 h-3.5 mr-2" /> VISTA PREVIA DOCENTE
                            </Badge>
                        )}
                    </div>
                </header>
                )}

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
                    {selectedLevel ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1700px] mx-auto min-h-full h-auto">
                            {selectedLevel.tipo === 'mission' || selectedLevel.tipo === 'maker_lab' ? (
                                <MissionEditor 
                                    data={selectedLevel.contenido} 
                                    isReadOnly={isReadOnly}
                                    onSave={(content) => handleLevelSave(selectedLevel.id, content)}
                                    onClose={() => setSelectedLevel(null)}
                                />
                            ) : selectedLevel.tipo === 'auto_evaluation' ? (
                                <AutoEvaluationEditor 
                                    data={selectedLevel.contenido} 
                                    isReadOnly={isReadOnly} 
                                    onSave={(content) => handleLevelSave(selectedLevel.id, content)} 
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
                        </motion.div>
                    ) : selectedSection ? (
                        <div className="max-w-6xl mx-auto pb-20">
                            {/* Section header */}
                            <div className="mb-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                                    <Layers className="w-3 h-3" /> Unidad Activa
                                </div>
                                <h2 className="text-5xl font-black text-slate-800 tracking-tighter leading-none">
                                    {selectedSection.nombre}
                                </h2>
                                <p className="text-slate-400 font-medium mt-3">Niveles y lecciones disponibles en esta unidad.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {allModules.filter(m => m.seccionId === selectedSection.id).map((mod, mIdx) => {
                                    const config = TYPE_CONFIG[mod.tipo as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.nota;
                                    const Icon = config.icon;
                                    return (
                                        <motion.div
                                            key={mod.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: mIdx * 0.06 }}
                                            className="group relative bg-[#0F172A] rounded-[2rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-black/30 transition-all duration-500 hover:-translate-y-1"
                                            onClick={() => handleEditActivity(mod)}
                                        >
                                            {/* Watermark icon */}
                                            <div className="absolute bottom-0 right-0 p-6 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-700 pointer-events-none">
                                                <Icon className="w-28 h-28 text-white" />
                                            </div>

                                            {/* Gradient accent top bar */}
                                            <div className={cn("h-1 w-full", 
                                                mod.tipo === 'mission' ? 'bg-gradient-to-r from-rose-500 to-pink-400' :
                                                mod.tipo === 'maker_lab' ? 'bg-gradient-to-r from-indigo-500 to-cyan-400' :
                                                mod.tipo === 'modular_class' ? 'bg-gradient-to-r from-indigo-500 to-violet-400' :
                                                mod.tipo === 'quiz' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                                                'bg-gradient-to-r from-slate-600 to-slate-500'
                                            )} />

                                            <div className="p-7 relative z-10">
                                                {/* Top row: type badge + actions */}
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest", config.bg)}>
                                                        <Icon className={cn("w-3 h-3", config.color)} />
                                                        <span className={config.color}>{config.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", mod.activo ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-600")} />
                                                            <span className={cn("text-[8px] font-black uppercase tracking-widest mr-2", mod.activo ? "text-emerald-400" : "text-slate-500")}>
                                                                {mod.activo ? 'Operativo' : 'Inactivo'}
                                                            </span>
                                                        </div>
                                                        
                                                        {(!isReadOnly || user?.roleId === 13) && (
                                                            <div
                                                                role="button"
                                                                onClick={async (e) => { 
                                                                    e.stopPropagation(); 
                                                                    try {
                                                                        await institutionalCurriculumApi.updateModule(mod.id, { activo: !mod.activo });
                                                                        toast.success("Visibilidad del componente modificada");
                                                                        fetchModules(selectedSection.id);
                                                                    } catch (err) {
                                                                        toast.error("No se pudo actualizar");
                                                                    }
                                                                }}
                                                                className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", mod.activo ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-slate-800 text-slate-500 hover:text-slate-300")}
                                                            >
                                                                {mod.activo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                            </div>
                                                        )}

                                                        <AssignmentDialog
                                                            module={mod}
                                                            institutionId={user?.institucionId}
                                                            onUpdate={() => selectedSection && fetchModules(selectedSection.id)}
                                                        />
                                                        {!isReadOnly && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                                                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Number + title / inline rename */}
                                                <div className="flex items-start gap-4 mb-6">
                                                    <span className="text-[11px] font-black text-white/20 mt-2 shrink-0 tabular-nums">
                                                        {mIdx + 1 < 10 ? `0${mIdx + 1}` : mIdx + 1}
                                                    </span>
                                                    {renamingModuleId === mod.id ? (
                                                        <input
                                                            autoFocus
                                                            value={renameValue}
                                                            onChange={e => setRenameValue(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') handleRenameModule(mod.id);
                                                                if (e.key === 'Escape') { setRenamingModuleId(null); setRenameValue(''); }
                                                            }}
                                                            onBlur={() => handleRenameModule(mod.id)}
                                                            onClick={e => e.stopPropagation()}
                                                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm font-black text-white uppercase tracking-tight outline-none focus:border-blue-400"
                                                        />
                                                    ) : (
                                                        <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight line-clamp-3 group-hover:text-blue-300 transition-colors duration-300 flex-1 text-left">
                                                            {mod.titulo}
                                                        </h3>
                                                    )}
                                                </div>

                                                {/* Action buttons row */}
                                                {!isReadOnly && (
                                                    <div className="flex items-center gap-2 mb-6" onClick={e => e.stopPropagation()}>
                                                        <button 
                                                            onClick={() => { setRenamingModuleId(mod.id); setRenameValue(mod.titulo); }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/70 transition-all text-[9px] font-black uppercase tracking-widest"
                                                        >
                                                            <Edit2 className="w-3 h-3" /> Renombrar
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteModule(mod.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/30 hover:bg-rose-500/20 hover:text-rose-400 transition-all text-[9px] font-black uppercase tracking-widest"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Eliminar
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Enter indicator */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-white/20 group-hover:text-blue-400 transition-colors duration-300">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Entrar al Editor</span>
                                                        <ArrowRight className="w-3.5 h-3.5 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {!isReadOnly && (
                                    <button
                                        onClick={() => setIsToolboxOpen(true)}
                                        className="rounded-[2.5rem] border-4 border-dashed border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 flex flex-col items-center justify-center p-10 transition-all group min-h-[220px] shadow-sm hover:shadow-xl"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-4">
                                            <Plus className="w-7 h-7" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-blue-500 text-center transition-colors">
                                            Añadir Misión
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : sections.length > 0 ? (
                        <div className="max-w-6xl mx-auto space-y-12 pb-20">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
                                        Mapa Maestro de <span className="text-blue-600">Unidades</span>
                                    </h2>
                                    <p className="text-slate-500 font-medium">Gestión estructural y secuenciación de contenidos de aprendizaje para este curso.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {sections.map((sec, sIdx) => {
                                    const sectionModules = allModules.filter(m => m.seccionId === sec.id);
                                    return (
                                        <motion.div
                                            key={sec.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: sIdx * 0.1 }}
                                            className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100/50 hover:shadow-2xl hover:border-blue-100 transition-all relative group overflow-hidden flex flex-col justify-between min-h-[420px]"
                                        >
                                            {/* Decorative Number */}
                                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                                                <span className="text-[12rem] font-black leading-none tracking-tighter italic">{sIdx + 1}</span>
                                            </div>

                                            <div>
                                                <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 border shadow-inner flex items-center justify-center font-black text-slate-300 mb-10 text-2xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-500">
                                                    {sIdx + 1}
                                                </div>
                                                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-[0.9] mb-6 line-clamp-3 group-hover:text-blue-600 transition-colors">
                                                    {sec.nombre}
                                                </h3>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="space-y-3 mb-12">
                                                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                        <span>Inventario de Contenidos</span>
                                                        <span className="text-blue-600">{sectionModules.length} Niveles</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-lg transition-all duration-1000" 
                                                            style={{ width: sectionModules.length > 0 ? `${Math.min(100, (sectionModules.length / 5) * 100)}%` : '5%' }}
                                                        />
                                                    </div>
                                                </div>

                                                <Button 
                                                    onClick={() => {
                                                        setSelectedSection(sec);
                                                        setExpandedSections(prev => ({ ...prev, [sec.id]: true }));
                                                    }}
                                                    className="w-full h-16 rounded-[2rem] bg-slate-900 hover:bg-blue-600 text-white font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-500/30 flex items-center justify-center gap-3 group/btn"
                                                >
                                                    Abrir Arquitectura
                                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {!isReadOnly && (
                                    <button 
                                        onClick={handleAddSection}
                                        className="rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 hover:border-blue-200 hover:bg-blue-50/30 transition-all group min-h-[350px]"
                                    >
                                        <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center text-slate-200 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-6">
                                            <Plus className="w-10 h-10" />
                                        </div>
                                        <span className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] group-hover:text-blue-400 text-center">Incorporar Unidad <br/> al Mapa Maestro</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Activity className="w-12 h-12 text-slate-200 mb-8" />
                            <h2 className="text-4xl font-black text-slate-200 uppercase tracking-tighter italic">Selecciona una Unidad</h2>
                        </div>
                    )}
                </div>
            </main>

            <Dialog open={isToolboxOpen} onOpenChange={setIsToolboxOpen}>
                <DialogContent className="max-w-xl p-0 bg-white rounded-[3.5rem] overflow-hidden border-none shadow-2xl">
                    <div className="p-12 space-y-8 text-center text-slate-800">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-blue-50 flex items-center justify-center mx-auto mb-6">
                            <Plus className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Ingeniería de Niveles</h2>
                            <p className="text-slate-500 font-medium">Selecciona el tipo de nivel para esta unidad.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <Button 
                                onClick={() => { setCreationType('mission'); setIsInlineCreating(true); setIsToolboxOpen(false); }}
                                className="h-24 rounded-3xl bg-slate-50 hover:bg-white border-2 border-transparent hover:border-rose-500 shadow-sm hover:shadow-xl transition-all flex flex-col items-start justify-center px-6 group text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Target className="w-16 h-16 text-rose-500" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <Target className="w-5 h-5 text-rose-500" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight text-slate-800">Misión Especial</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Gamificación IA</p>
                            </Button>

                            <Button 
                                onClick={() => { setCreationType('modular_class'); setIsInlineCreating(true); setIsToolboxOpen(false); }}
                                className="h-24 rounded-3xl bg-slate-50 hover:bg-white border-2 border-transparent hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all flex flex-col items-start justify-center px-6 group text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Workflow className="w-16 h-16 text-indigo-500" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <Workflow className="w-5 h-5 text-indigo-500" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight text-slate-800">Sesión Estándar</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Clase Teórica Modular</p>
                            </Button>

                            <Button 
                                onClick={() => { setCreationType('quiz'); setIsInlineCreating(true); setIsToolboxOpen(false); }}
                                className="h-24 rounded-3xl bg-slate-50 hover:bg-white border-2 border-transparent hover:border-amber-500 shadow-sm hover:shadow-xl transition-all flex flex-col items-start justify-center px-6 group text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <CheckSquare className="w-16 h-16 text-amber-500" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <CheckSquare className="w-5 h-5 text-amber-500" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight text-slate-800">Evaluación / Quiz</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Prueba de Conocimientos</p>
                            </Button>

                            <Button 
                                onClick={() => { setCreationType('tarea'); setIsInlineCreating(true); setIsToolboxOpen(false); }}
                                className="h-24 rounded-3xl bg-slate-50 hover:bg-white border-2 border-transparent hover:border-orange-500 shadow-sm hover:shadow-xl transition-all flex flex-col items-start justify-center px-6 group text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ClipboardList className="w-16 h-16 text-orange-500" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <ClipboardList className="w-5 h-5 text-orange-500" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight text-slate-800">Proyecto Real</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Actividad de Entrega</p>
                            </Button>

                            <Button 
                                onClick={() => { setCreationType('maker_lab'); setIsInlineCreating(true); setIsToolboxOpen(false); }}
                                className="h-24 rounded-3xl bg-indigo-50 hover:bg-white border-2 border-indigo-100 hover:border-indigo-600 shadow-sm hover:shadow-xl transition-all flex flex-col items-start justify-center px-6 group text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Hammer className="w-16 h-16 text-indigo-600" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <Hammer className="w-5 h-5 text-indigo-600" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight text-slate-800">Laboratorio Maker</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Ingeniería de Sistemas</p>
                            </Button>

                            <Button 
                                onClick={() => { setCreationType('auto_evaluation'); setIsInlineCreating(true); setIsToolboxOpen(false); }}
                                className="h-24 rounded-3xl bg-amber-50 hover:bg-white border-2 border-amber-100 hover:border-amber-600 shadow-sm hover:shadow-xl transition-all flex flex-col items-start justify-center px-6 group text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ClipboardCheck className="w-16 h-16 text-amber-600" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <ClipboardCheck className="w-5 h-5 text-amber-600" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight text-slate-800">Evaluación Automática</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Base 10 / Flexible</p>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {isInlineCreating && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-3xl space-y-8 text-slate-800">
                        <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Configurar Componente</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración Estructural Básica</p>
                            </div>
                            <div className={cn("px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest", TYPE_CONFIG[creationType as keyof typeof TYPE_CONFIG]?.bg, TYPE_CONFIG[creationType as keyof typeof TYPE_CONFIG]?.color)}>
                                {TYPE_CONFIG[creationType as keyof typeof TYPE_CONFIG]?.label || 'Nuevo'}
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Título del Nivel</label>
                                <Input
                                    autoFocus
                                    placeholder="Ej: Exploración de Datos..."
                                    className="h-12 bg-slate-50 border-none rounded-xl font-bold text-xs"
                                    value={inlineLevelName}
                                    onChange={(e) => setInlineLevelName(e.target.value)}
                                />
                            </div>

                            {creationType === 'mission' && (
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Año EGB/BGU</label>
                                    <select 
                                        value={selectedGrade}
                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                        className="w-full h-12 px-4 bg-slate-50 rounded-xl border-none font-bold text-xs"
                                    >
                                        {MISSION_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button onClick={handleInlineCreateConfirm} disabled={saving || !inlineLevelName.trim()} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Instalar'}
                            </Button>
                            <Button onClick={() => { setIsInlineCreating(false); setCreationType(null); }} variant="ghost" className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400">Cancelar</Button>
                        </div>
                    </motion.div>
                </div>
            )}

            <Sheet open={!!editingActivity} onOpenChange={(open) => !open && setEditingActivity(null)}>
                <SheetContent side="right" className="w-full sm:max-max-w-xl p-0 border-l bg-slate-50">
                    <SheetHeader className="p-10 bg-white border-b sticky top-0 z-10 text-slate-800">
                        <SheetTitle className="text-3xl font-black tracking-tighter italic uppercase">
                            Editor de <span className="text-blue-600">{editingActivity?.tipo ? (TYPE_CONFIG[editingActivity.tipo as keyof typeof TYPE_CONFIG]?.label || 'Protocolo') : 'Nivel'}</span>
                        </SheetTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{editingActivity?.tipo} Configuration</p>
                    </SheetHeader>
                    <div className="p-10 custom-scrollbar overflow-y-auto">
                        {editingActivity?.tipo === 'desafio_algoritmo' && <AlgoritmoEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data: any) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'pregunta_abierta' && <PreguntaEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data: any) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'quiz' && <QuizEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data: any) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'tarea' && <TareaEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data: any) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'nota' && <NotaEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data: any) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'video' && <VideoEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data: any) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'pdf' && <PdfEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data: any) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'link' && <LinkEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data: any) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'python_lab' && <PythonLabEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data: any) => handleLevelSave(editingActivity.id, data)} />}
                    </div>
                </SheetContent>
            </Sheet>

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

/**
 * Diálogo para gestionar asignaciones de estudiantes y vínculos con cursos
 */
const AssignmentDialog = ({ module, institutionId, onUpdate }: { module: any; institutionId: any; onUpdate: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchAssignmentData = async () => {
        if (!institutionId) return;
        setLoading(true);
        try {
            const usersRaw = await institutionApi.getInstitutionalUsers(Number(institutionId));
            const coursesRaw = await institutionApi.getCourses(Number(institutionId));

            const users = (usersRaw as any[]) || [];
            const allCourses = (coursesRaw as any[]) || [];

            const institutionalStudents = users.filter((u: any) => u.role === 'student' || u.roleId === 6 || u.roleId === 3);
            setStudents(institutionalStudents);
            setCourses(allCourses);
        } catch (error) {
            console.error('Error fetching assignment data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchAssignmentData();
    }, [isOpen]);

    const handleToggleStudent = async (studentId: number, isAssigned: boolean) => {
        setProcessingId(studentId);
        try {
            if (isAssigned) {
                await professorApi.unassignStudentFromModule(module.id, studentId);
                toast.success("Acceso Revocado");
            } else {
                await professorApi.assignStudentToModule(module.id, studentId);
                toast.success("Acceso Concedido");
            }
            onUpdate();
            fetchAssignmentData();
        } catch (error) {
            toast.error("No se pudo cambiar la asignación");
        } finally {
            setProcessingId(null);
        }
    };

    const handleLinkToCourse = async (courseId: number) => {
        setProcessingId(courseId);
        try {
            await institutionApi.assignModuleToCourse(module.id, courseId);
            toast.success("Vínculo Actualizado");
            onUpdate();
            setIsOpen(false);
        } catch (error) {
            toast.error("No se pudo vincular el curso");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-8 w-8 rounded-full border border-slate-100 bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-500 p-0 shadow-sm transition-all shadow-blue-500/10">
                    <Users className="w-3.5 h-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border rounded-[3rem] max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0 shadow-2xl z-[150]" style={{ borderColor: 'rgba(26,86,219,0.1)' }}>
                <DialogHeader className="p-10 pb-6 bg-blue-50/30 border-b border-blue-50 text-left">
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-4xl font-black tracking-tighter flex items-center gap-3 text-slate-800 leading-none">
                                Alcance <span className="text-blue-600">Académico</span>
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 text-left">
                                UNIDAD: {module.titulo || module.nombreModulo}
                            </DialogDescription>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shadow-sm">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="students" className="flex-1 flex flex-col min-h-0">
                    <div className="px-8 border-b" style={{ borderColor: 'rgba(26,86,219,0.08)' }}>
                        <TabsList className="bg-transparent h-12 gap-8 border-none p-0">
                            <TabsTrigger value="students" className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full uppercase font-black text-[10px] tracking-widest px-0">
                                Estudiantes
                            </TabsTrigger>
                            <TabsTrigger value="courses" className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none h-full uppercase font-black text-[10px] tracking-widest px-0">
                                Sectores
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <TabsContent value="students" className="mt-0 outline-none space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                                    <p className="text-[10px] font-black uppercase text-slate-500">Cargando Personal...</p>
                                </div>
                            ) : students.length === 0 ? (
                                <p className="text-center text-slate-500 py-12 uppercase font-black text-[10px]">No se encontraron estudiantes asociados.</p>
                            ) : (
                                <div className="grid gap-3">
                                    {(module?.cursoId ? students.filter((s: any) => s.cursoId === module.cursoId) : students).map((student: any) => {
                                        const isAssigned = module?.assignedStudentIds?.includes(student.id);
                                        const isAssignedByCourse = module?.cursoId !== undefined && student.cursoId === module.cursoId;

                                        return (
                                            <div key={student.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border transition-all hover:border-slate-300">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-blue-600 border border-slate-100 uppercase shadow-sm">
                                                        {(student.nombre || "??").substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{student.nombre}</p>
                                                            {isAssignedByCourse && (
                                                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase px-2 h-5">Vínculo Curricular</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 lowercase">{student.email}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    disabled={processingId === student.id || isAssignedByCourse}
                                                    onClick={() => handleToggleStudent(student.id, isAssigned)}
                                                    className={cn(
                                                        "h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm",
                                                        isAssigned || isAssignedByCourse
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                                    )}
                                                >
                                                    {processingId === student.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (isAssigned || isAssignedByCourse) ? "Matriculado" : "Matricular"}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="courses" className="mt-0 outline-none space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    <p className="text-[10px] font-black uppercase text-slate-500">Cargando sectores...</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    <div className="p-4 rounded-2xl mb-2 bg-blue-50/50">
                                        <p className="text-[9px] font-semibold flex items-center gap-2 text-blue-600">
                                            <Activity className="w-4 h-4 flex-shrink-0" /> Al vincular un nivel a un sector, todos sus estudiantes tendrán acceso automático.
                                        </p>
                                    </div>
                                    {courses.map((course: any) => {
                                        const isLinked = String(module.cursoId) === String(course.id);
                                        return (
                                            <div key={course.id} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all bg-white", isLinked ? "shadow-md border-blue-500" : "hover:shadow-sm border-slate-100")}>
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isLinked ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400")}>
                                                        <BookOpen className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold uppercase tracking-tight text-slate-800">{course.nombre}</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Nivel: {course.nivel || 'Técnico'}</p>
                                                    </div>
                                                </div>
                                                {isLinked ? (
                                                    <Badge className="bg-blue-600 text-white border-none">Vinculado</Badge>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        disabled={processingId === course.id}
                                                        onClick={() => handleLinkToCourse(course.id)}
                                                        className="h-9 font-black uppercase text-[9px] rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                    >
                                                        {processingId === course.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Vincular'}
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default InstitutionalModuleEditor;

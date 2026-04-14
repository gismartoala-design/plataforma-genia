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
    LayoutDashboard,
    BookOpen
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
    const [creationType, setCreationType] = useState<'modular_class' | 'mission' | 'quiz' | 'tarea' | null>(null);
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
            toast.success("Progreso guardado");
            fetchModules(selectedSection!.id);
            setSelectedLevel(null);
        } catch (error) {
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

    const handleInlineCreateConfirm = async () => {
        if (!inlineLevelName.trim() || isReadOnly) {
            setIsInlineCreating(false);
            setCreationType(null);
            return;
        }

        setSaving(true);
        try {
            const finalType = creationType || 'modular_class';
            const initialContent = finalType === 'mission' ? {
                ...INITIAL_ACTIVITY_DATA.mission,
                mission: { ...INITIAL_ACTIVITY_DATA.mission.mission, title: inlineLevelName.trim(), level: selectedGrade }
            } : undefined;

            const newMod = await handleAddModule(finalType, inlineLevelName.trim(), initialContent);
            if (newMod) {
                if (finalType === 'mission' || finalType === 'modular_class') {
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
        if (mod.tipo === 'modular_class' || mod.tipo === 'mission') {
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

            {/* Sidebar Explorer */}
            {!selectedLevel && (
            <aside className="w-80 border-r bg-[#0F172A] flex flex-col z-30 relative shrink-0 shadow-2xl text-white">
                <div className="p-8 border-b border-white/10 shrink-0">
                    <button 
                        onClick={() => setLocation(user?.roleId === 13 ? '/institucional-tutor' : '/institucional-teach')}
                        className="flex items-center gap-3 text-white/50 hover:text-white transition-colors mb-6 group text-[10px] font-black uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al Hub
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CpuIcon className="w-4 h-4 text-cyan-400" />
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400/70">Diseño Curricular</span>
                        </div>
                        <h2 className="text-xl font-black italic tracking-tighter leading-none">{(sections[0] as any)?.courseName || "Arquitectura del Curso"}</h2>
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
                            const isExpanded = expandedSections[sec.id];
                            const sectionModules = allModules.filter(m => m.seccionId === sec.id);
                            
                            return (
                                <div key={sec.id} className="space-y-1">
                                    <button
                                        onClick={() => setExpandedSections(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-4 rounded-2xl transition-all group border border-transparent",
                                            selectedSection?.id === sec.id && !selectedLevel ? "bg-white/10 border-white/5" : "hover:bg-white/5"
                                        )}
                                    >
                                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black text-white/40">{sIdx + 1}</span>
                                        </div>
                                        <span className={cn("text-xs font-bold truncate flex-1 text-left uppercase tracking-tight", selectedSection?.id === sec.id ? "text-white" : "text-white/60 group-hover:text-white")}>
                                            {sec.nombre}
                                        </span>
                                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                            <ChevronDown className="w-3.5 h-3.5 text-white/20" />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pl-10 pr-2 space-y-1"
                                            >
                                                {sectionModules.map((mod) => {
                                                    const config = TYPE_CONFIG[mod.tipo as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.nota;
                                                    const Icon = config.icon;
                                                    const isActive = selectedLevel?.id === mod.id;
                                                    
                                                    return (
                                                        <button
                                                            key={mod.id}
                                                            onClick={() => handleEditActivity(mod)}
                                                            className={cn(
                                                                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative",
                                                                isActive ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5"
                                                            )}
                                                        >
                                                            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", isActive ? "bg-white/20" : config.bg)}>
                                                                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : config.color)} />
                                                            </div>
                                                            <span className="text-[11px] font-bold truncate tracking-tight uppercase">{mod.titulo}</span>
                                                            {!isReadOnly && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                                                                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                                {!isReadOnly && (
                                                    <button 
                                                        onClick={() => { setSelectedSection(sec); setIsToolboxOpen(true); }}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl text-cyan-400 group"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Añadir Lección</span>
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}
                    </nav>
                </div>
            </aside>
            )}

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAFC]">
                {!selectedLevel && (
                <header className="px-10 py-6 border-b flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className={cn(
                            "w-12 h-12 rounded-[1.25rem] flex items-center justify-center border shadow-inner transition-opacity",
                            selectedLevel ? "bg-blue-50 border-blue-100" : selectedSection ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"
                        )}>
                            {selectedLevel ? <BookOpen className="w-6 h-6 text-blue-600" /> : selectedSection ? <Construction className="w-6 h-6 text-orange-600" /> : <LayoutDashboard className="w-6 h-6 text-slate-400" />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">
                                {selectedLevel ? selectedLevel.titulo : selectedSection ? selectedSection.nombre : 'Mapa de Ingeniería Curricular'}
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                {selectedLevel ? 'Nivel Activo' : selectedSection ? 'Unidad Seleccionada' : 'Estructura General'} · Genios Architecture
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
                        </motion.div>
                    ) : selectedSection ? (
                        <div className="max-w-6xl mx-auto space-y-12 pb-20">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
                                        Niveles de la <span className="text-blue-600">{selectedSection.nombre}</span>
                                    </h2>
                                    <p className="text-slate-500 font-medium">Gestión estructural y secuenciación de actividades.</p>
                                </div>
                                <Button variant="outline" onClick={() => setSelectedSection(null)} className="rounded-2xl font-black uppercase tracking-widest text-[10px]">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Unidades
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {allModules.filter(m => m.seccionId === selectedSection.id).map((mod, mIdx) => {
                                    const config = TYPE_CONFIG[mod.tipo as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.nota;
                                    const Icon = config.icon;
                                    return (
                                        <motion.div
                                            key={mod.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: mIdx * 0.1 }}
                                            className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-pointer"
                                            onClick={() => handleEditActivity(mod)}
                                        >
                                            <div className="p-8 pb-0 relative">
                                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500 transform translate-x-4 group-hover:translate-x-0">
                                                    <Icon className={cn("w-32 h-32", config.color)} />
                                                </div>

                                                <div className="flex items-center justify-between mb-8 relative z-10">
                                                    <div className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-sm", config.bg, config.color)}>
                                                        {config.label}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 z-20">
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <AssignmentDialog
                                                                module={mod}
                                                                institutionId={user?.institucionId}
                                                                onUpdate={() => selectedSection && fetchModules(selectedSection.id)}
                                                            />
                                                        </div>
                                                        {!isReadOnly && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                                                                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-4 relative z-10">
                                                    <div className="flex gap-4">
                                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 transition-transform group-hover:scale-110 duration-500", config.bg)}>
                                                            <Icon className={cn("w-5 h-5", config.color)} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{mod.titulo}</h3>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Nivel de Aprendizaje</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 pt-10">
                                                <div className="h-14 w-full rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-500/30">
                                                    <span>Entrar al Editor</span>
                                                    <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {!isReadOnly && (
                                    <button 
                                        onClick={() => setIsToolboxOpen(true)}
                                        className="rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 hover:border-blue-200 hover:bg-blue-50/30 transition-all group min-h-[350px]"
                                    >
                                        <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center text-slate-200 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-6">
                                            <Plus className="w-10 h-10" />
                                        </div>
                                        <span className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] group-hover:text-blue-400 text-center">Incorporar Nivel <br/> a la Unidad</span>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {sections.map((sec, sIdx) => {
                                    const sectionModules = allModules.filter(m => m.seccionId === sec.id);
                                    return (
                                        <motion.div
                                            key={sec.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: sIdx * 0.1 }}
                                            className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl transition-all relative group overflow-hidden"
                                        >
                                            <div className="w-16 h-16 rounded-[2.5rem] bg-slate-50 border shadow-inner flex items-center justify-center font-black text-slate-300 mb-8 text-xl">
                                                {sIdx + 1}
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-tight mb-4">{sec.nombre}</h3>
                                            <div className="space-y-2 mb-10">
                                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span>Inventario</span>
                                                    <span>{sectionModules.length} Niveles</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 w-[60%] opacity-20" />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Button 
                                                    onClick={() => {
                                                        setSelectedSection(sec);
                                                        setExpandedSections(prev => ({ ...prev, [sec.id]: true }));
                                                    }}
                                                    className="w-full h-14 rounded-2xl bg-white border-2 border-slate-100 hover:border-blue-500 text-slate-500 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm"
                                                >
                                                    Abrir Unidad
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
                            <p className="text-slate-500 font-medium">Selecciona el protocolo de creación para esta unidad.</p>
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
                        <SheetTitle className="text-3xl font-black tracking-tighter italic uppercase">Editor de <span className="text-blue-600">Protocolos</span></SheetTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{editingActivity?.tipo} Configuration</p>
                    </SheetHeader>
                    <div className="p-10 custom-scrollbar overflow-y-auto">
                        {editingActivity?.tipo === 'desafio_algoritmo' && <AlgoritmoEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'pregunta_abierta' && <PreguntaEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'quiz' && <QuizEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'tarea' && <TareaEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'nota' && <NotaEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'video' && <VideoEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'pdf' && <PdfEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'link' && <LinkEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data) => handleLevelSave(editingActivity.id, data)} />}
                        {editingActivity?.tipo === 'python_lab' && <PythonLabEditor data={editingActivity.data} isReadOnly={isReadOnly} onSave={(data) => handleLevelSave(editingActivity.id, data)} />}
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
                                    {(module?.cursoId ? students.filter((s: any) => s.cursoId === module.id) : students).map((student: any) => {
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

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
    Lightbulb
} from 'lucide-react';
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
    link: { titulo: '', url: '', descripcion: '' }
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
};

export const InstitutionalModuleEditor = () => {
    const params = useParams() as { moduleId?: string };
    const courseId = parseInt(params.moduleId || "0");
    const [, setLocation] = useLocation();
    const [user] = useState<{ id: string; role: UserRole; roleId?: number } | null>(() => {
        const saved = localStorage.getItem("edu_user");
        return saved ? JSON.parse(saved) : null;
    });

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

    // Inline Creation State
    const [isInlineCreating, setIsInlineCreating] = useState(false);
    const [inlineLevelName, setInlineLevelName] = useState('');

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
            return;
        }

        setSaving(true);
        try {
            const newMod = await handleAddModule('modular_class', inlineLevelName.trim());
            if (newMod) {
                setSelectedLevel(newMod);
                toast.success(`Nivel "${inlineLevelName}" creado`);
            }
            setInlineLevelName('');
            setIsInlineCreating(false);
        } catch (error) {
            toast.error("Error al crear nivel");
        } finally {
            setSaving(false);
        }
    };

    const handleImportCurriculum = async () => {
        if (!importText.trim() || !selectedSection || isReadOnly) return;

        setSaving(true);
        const chunks = importText.split(/(?=CLASE\s+\d+:)/i);
        let createdCount = 0;

        try {
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
            const title = "CLASE 1: ¿QUÉ ES UN OBJETO TECNOLÓGICO?";
            const blocks = [
                {
                    id: 'b1',
                    type: 'NARRATIVE',
                    data: { titulo: '¡Bienvenidos, Mini-Científicos!', texto: 'Hoy vamos a descubrir qué cosas fueron creadas por nosotros y cuáles nos regaló la naturaleza.' }
                },
                {
                    id: 'b2',
                    type: 'EVALUATION',
                    data: {
                        pregunta: 'Observa estos objetos: [Lápiz, Celular, Computadora]. ¿Quién los creó?',
                        opciones: ['Persona 👤', 'Árbol 🌿'],
                        respuestaIndex: 0
                    }
                },
                {
                    id: 'b3',
                    type: 'REWARD',
                    data: { insignia: 'Detective de Objetos', xp: 100 }
                }
            ];

            await handleAddModule('modular_class', title, {
                metadata: { title, description: 'Misión interactiva para 1ro EGB' },
                blocks
            });

            await handleAddModule('desafio_algoritmo', "🎮 RETO LOGIC: Alcanza el Celular", {
                grid: Array(25).fill(0),
                startIdx: 0,
                targetIdx: 24,
                obstacles: [6, 7, 8, 11, 13, 16, 17, 18]
            });

            toast.success("Misión Interactiva instalada en Introducción");
            fetchModules(selectedSection.id);
        } catch (error) {
            toast.error("Error al instalar demo");
        } finally {
            setSaving(false);
        }
    };

    const handleEditActivity = (mod: ModuloInst) => {
        if (mod.tipo === 'modular_class' || (mod.contenido && Array.isArray(mod.contenido?.blocks))) {
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
                                            {!isReadOnly && (
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </motion.div>
                                    );
                                })}

                                {isInlineCreating && !isReadOnly ? (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-white border-2 border-blue-500 shadow-xl shadow-blue-500/10 space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <PenTool className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Nombre de Nivel</span>
                                        </div>
                                        <Input
                                            autoFocus
                                            placeholder="Ej: Clase 1: Los Objetos..."
                                            className="h-10 border-none bg-slate-50 rounded-xl text-xs font-bold placeholder:text-slate-300 focus-visible:ring-0"
                                            value={inlineLevelName}
                                            onChange={(e) => setInlineLevelName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleInlineCreateConfirm();
                                                if (e.key === 'Escape') setIsInlineCreating(false);
                                            }}
                                        />
                                        <div className="flex items-center gap-2 pt-1">
                                            <Button onClick={handleInlineCreateConfirm} disabled={saving} className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white">
                                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmar'}
                                            </Button>
                                            <Button onClick={() => setIsInlineCreating(false)} variant="ghost" className="w-9 h-9 rounded-xl border p-0 hover:bg-slate-50">
                                                <X className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </div>
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
                                        <Gamepad2 className="w-4 h-4" /> Instalar Misión 1ro EGB
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
                        <div className="max-w-[1600px] mx-auto h-full">
                            <InstitutionalClassBuilder
                                module={selectedLevel}
                                inline={true}
                                isReadOnly={isReadOnly}
                                onSave={(content) => handleLevelSave(selectedLevel.id, content)}
                                onClose={() => setSelectedLevel(null)}
                            />
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
                                    {isReadOnly ? "Explora la secuencia didáctica del curso. Como tutor, puedes visualizar toda la estructura y misiones instaladas." : "Crea niveles con el sistema de Escritura Rápida o usa el botón Instalar Misión 1ro EGB para cargar la Clase de Objetos Tecnológicos automáticamente."}
                                </p>

                                {!isReadOnly && (
                                    <div className="flex items-center gap-6 justify-center mt-12">
                                        <Button onClick={handleCreateDemoMission} disabled={saving} className="h-16 px-10 rounded-[2rem] bg-orange-600 hover:bg-orange-700 text-white font-black uppercase gap-4 shadow-2xl shadow-orange-500/20 active:scale-95 transition-all text-sm">
                                            <Sparkles className="w-6 h-6" /> INSTALAR CLASE 1 INTERACTIVA
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
            {!isReadOnly && (
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                    <DialogContent className="max-w-4xl bg-white/98 backdrop-blur-3xl rounded-[3rem] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)]">
                        <DialogHeader className="mb-10 text-left">
                            <DialogTitle className="text-4xl font-black tracking-tighter text-slate-800 italic uppercase">GENIOS <span className="text-blue-600">AI BUILDER</span></DialogTitle>
                            <DialogDescription className="text-base font-bold text-slate-400 uppercase tracking-widest mt-2">Transforma tu currículo en experiencias interactivas al instante.</DialogDescription>
                        </DialogHeader>
                        <Textarea
                            placeholder="🧠 CLASE 1: ...
    🎮 Actividad: ...
    ⭐ Gamificación: ..."
                            className="min-h-[350px] rounded-[2rem] bg-slate-50 border-none font-bold text-base p-10 focus-visible:ring-4 focus-visible:ring-blue-500/10 shadow-inner"
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                        />
                        <DialogFooter className="mt-12">
                            <Button variant="ghost" onClick={() => setIsImportOpen(false)} className="rounded-2xl h-14 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancelar</Button>
                            <Button
                                onClick={handleImportCurriculum}
                                disabled={saving || !importText.trim()}
                                className="h-16 px-12 rounded-[1.5rem] bg-slate-900 border-b-8 border-black hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs gap-4 shadow-2xl active:translate-y-2 active:border-b-0 transition-all"
                            >
                                <Sparkles className="w-6 h-6 animate-pulse" /> Desplegar Currículo
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
        </div>
    );
};

export default InstitutionalModuleEditor;

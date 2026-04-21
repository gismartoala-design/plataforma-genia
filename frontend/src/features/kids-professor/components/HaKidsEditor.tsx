import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Plus, Trash2, Save, ArrowLeft, Trophy, Sparkles, CheckCircle2,
    Image as ImageIcon, Link2, ChevronDown, ChevronUp, Rocket, Target, BookOpen, Layers, RotateCcw, HelpCircle, FileText, Video
} from "lucide-react";
import kidsProfessorApi from "../services/kidsProfessor.api";
import { institutionalCurriculumApi } from "@/features/institutional/services/curriculum.api";
import { toast } from "sonner";
import { ImageUploadInput } from "./ImageUploadInput";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Shared Activity Block Types (same as RAG) ---
type ActivityBlock =
    | { type: 'video'; data: { url: string; title: string } }
    | { type: 'step'; data: { text: string } }
    | { type: 'multiple_choice'; data: { question: string; options: string[]; correctIndex: number } }
    | { type: 'image_upload'; data: { instruction: string; exampleUrl: string } }
    | { type: 'label_image'; data: { instruction: string; imageUrl: string; labels: string[] } }
    | { type: 'match_lines'; data: { instruction: string; leftItems: string[]; rightItems: string[] } };

interface HaKidsProps {
    levelId: number;
    onClose: () => void;
    user?: any;
    instModuleId?: number; // Added for institutional sync
}

const BLOCK_TYPES = [
    { type: 'video', label: 'Video de Ayuda', icon: Video, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
    { type: 'step', label: 'Instrucción Técnica', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { type: 'multiple_choice', label: 'Test de Conceptos', icon: HelpCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { type: 'image_upload', label: 'Evidencia Visual', icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
    { type: 'label_image', label: 'Diagrama Técnico', icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { type: 'match_lines', label: 'Relación de Ideas', icon: Link2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

function createDefaultBlock(type: string): ActivityBlock {
    if (type === 'video') return { type: 'video', data: { url: '', title: 'Video Tutorial' } };
    if (type === 'step') return { type: 'step', data: { text: '' } };
    if (type === 'multiple_choice') return { type: 'multiple_choice', data: { question: '', options: ['', '', ''], correctIndex: 0 } };
    if (type === 'image_upload') return { type: 'image_upload', data: { instruction: '¡Sube una foto de tu trabajo!', exampleUrl: '' } };
    if (type === 'label_image') return { type: 'label_image', data: { instruction: 'Identifica las partes de la imagen', imageUrl: '', labels: ['', ''] } };
    return { type: 'match_lines', data: { instruction: 'Une con líneas', leftItems: ['', ''], rightItems: ['', ''] } };
}

function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default function HaKidsEditor({ levelId, onClose, user, instModuleId }: HaKidsProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState<string[]>(['']);
    const [blocks, setBlocks] = useState<ActivityBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);

    useEffect(() => {
        if (instModuleId) {
            institutionalCurriculumApi.getModule(instModuleId).then(mod => {
                if (mod && mod.contenido) {
                    setTitle(mod.titulo);
                    setDescription(mod.contenido.description || "");
                    setRequirements(mod.contenido.requirements || ['']);
                    setBlocks(mod.contenido.blocks || []);
                }
            });
        } else {
            kidsProfessorApi.getTemplateByType(levelId, 'ha_kids').then(data => {
                if (data) {
                    setTitle(data.titulo);
                    setDescription(data.actividades?.description || "");
                    setRequirements(data.actividades?.requirements || ['']);
                    setBlocks(data.actividades?.blocks || []);
                }
            });
        }
    }, [levelId, instModuleId]);

    const addBlock = (type: string) => {
        setBlocks([...blocks, createDefaultBlock(type) as ActivityBlock]);
        setShowAddMenu(false);
    };

    const removeBlock = (idx: number) => setBlocks(blocks.filter((_, i) => i !== idx));

    const updateBlock = (idx: number, newData: any) => {
        const newBlocks = [...blocks];
        (newBlocks[idx] as any).data = { ...(newBlocks[idx] as any).data, ...newData };
        setBlocks(newBlocks);
    };

    const moveBlock = (idx: number, dir: 'up' | 'down') => {
        const newBlocks = [...blocks];
        const target = dir === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= newBlocks.length) return;
        [newBlocks[idx], newBlocks[target]] = [newBlocks[target], newBlocks[idx]];
        setBlocks(newBlocks);
    };

    const handleSave = async () => {
        if (!title) { toast.error("Ponle un título al reto."); return; }
        setLoading(true);
        try {
            const activitiesData = { description, requirements: requirements.filter(r => r.trim()), blocks };
            
            // 1. Legacy save
            await kidsProfessorApi.saveTypedTemplate(levelId, 'ha_kids', {
                titulo: title,
                tipo: 'ha_kids',
                actividades: activitiesData,
                configuracion: { primaryColor: "#059669" } // Emerald-600
            });

            // 2. Institutional save
            if (instModuleId) {
                await institutionalCurriculumApi.updateModule(instModuleId, {
                    titulo: title,
                    contenido: activitiesData
                });
            }

            toast.success("¡Reto HA Kids sincronizado! 🏆");
            onClose();
        } catch {
            toast.error("Error al guardar el reto");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Header - Engineering Blueprint HA Style */}
            <header className="bg-white border-b-[6px] border-emerald-600 px-8 py-5 flex items-center justify-between shadow-xl z-20 shrink-0 text-slate-900">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={onClose} 
                        className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                            CENTRO DE <span className="text-emerald-600">RETO HA</span> KIDS
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                             <Trophy className="w-3 h-3 text-emerald-500" /> {blocks.length} ACTIVIDADES DE CRITERIO · HABILIDADES GENIA
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={onClose} className="rounded-2xl border-2 border-slate-200 font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="rounded-2xl bg-[#0F172A] hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest h-12 px-10 shadow-lg shadow-emerald-500/20 group">
                        {loading ? <RotateCcw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
                        {loading ? 'CALIBRANDO...' : 'Sincronizar Reto'}
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-grid-slate-100/50">
                <div className="max-w-4xl mx-auto p-12 space-y-8 pb-32">
                    {/* Basic Info - BLUEPRINT CARD */}
                    <Card className="rounded-[2.5rem] border-0 shadow-2xl shadow-emerald-900/5 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500" />
                        <CardContent className="p-10 bg-white">
                            <div className="flex items-center gap-4 mb-4">
                                <Badge className="bg-emerald-600 text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                                    Configuración de Reto
                                </Badge>
                            </div>
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Título del Reto HA</Label>
                                    <Input value={title} onChange={e => setTitle(e.target.value)}
                                        placeholder="Ej: ¡DISEÑA TU PRIMER MUNDO EN ROBLOX!"
                                        className="rounded-2xl h-16 text-2xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-emerald-100 font-black transition-all placeholder:text-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Objetivo de Aprendizaje</Label>
                                    <Textarea value={description} onChange={e => setDescription(e.target.value)}
                                        placeholder="Explica qué habilidades desarrollará el estudiante con este reto..."
                                        className="rounded-2xl border-2 border-slate-100 focus:border-emerald-500 min-h-[100px] text-sm font-medium leading-relaxed" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requirements - BLUEPRINT CARD */}
                    <Card className="rounded-[2.5rem] border-0 shadow-2xl shadow-emerald-900/5 overflow-hidden">
                        <CardHeader className="bg-slate-900 p-8 border-b border-white/10">
                            <CardTitle className="text-white font-black italic uppercase tracking-tighter text-xl flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" /> Requisitos de Entrega
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-4 bg-white">
                            {requirements.map((req, i) => (
                                <div key={i} className="flex gap-4 items-center group">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <Input value={req} onChange={e => {
                                        const reqs = [...requirements];
                                        reqs[i] = e.target.value;
                                        setRequirements(reqs);
                                    }}
                                        placeholder="Ej: Subir captura de pantalla de la casa terminada"
                                        className="rounded-xl h-12 border-slate-100 focus:border-emerald-500 flex-1 text-sm font-bold" />
                                    {requirements.length > 1 && (
                                        <Button variant="ghost" size="icon" onClick={() => setRequirements(requirements.filter((_, ri) => ri !== i))}
                                            className="w-12 h-12 rounded-xl text-rose-400 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></Button>
                                    )}
                                </div>
                            ))}
                            <Button variant="outline" onClick={() => setRequirements([...requirements, ''])}
                                className="rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 font-bold text-[10px] uppercase tracking-widest w-full h-12 mt-4">
                                <Plus className="w-4 h-4 mr-2" /> Inyectar Requisito
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Activity Blocks - Blueprint Flow */}
                    <div className="relative pl-10 space-y-10">
                         <div className="absolute left-[19px] top-6 bottom-6 w-1 bg-gradient-to-b from-emerald-200 via-teal-100 to-transparent rounded-full" />

                        {blocks.map((block, idx) => {
                            const bt = BLOCK_TYPES.find(b => b.type === block.type);
                            const Icon = bt?.icon || Layers;
                            return (
                                <div key={idx} className="relative group">
                                    {/* Connector Dot */}
                                    <div className="absolute -left-[51px] top-8 w-6 h-6 rounded-full bg-white border-4 border-emerald-600 z-10 shadow-lg group-hover:scale-125 transition-transform" />

                                    <Card className="rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden bg-white">
                                        <div className="bg-slate-50 px-8 py-5 flex items-center justify-between border-b border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", bt?.bg.replace('-50', '-500'))}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">ACTIVIDAD {idx + 1}</p>
                                                    <p className={cn("font-black text-xs uppercase italic tracking-tighter", bt?.color)}>{bt?.label}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex rounded-xl bg-white p-1 border border-slate-200">
                                                    <Button variant="ghost" size="icon" onClick={() => moveBlock(idx, 'up')} className="h-8 w-8 text-slate-400"><ChevronUp className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => moveBlock(idx, 'down')} className="h-8 w-8 text-slate-400"><ChevronDown className="w-4 h-4" /></Button>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeBlock(idx)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <CardContent className="p-10 space-y-6">
                                            {block.type === 'video' && (
                                                <div className="space-y-4">
                                                    <div className="grid gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Título del Video</Label>
                                                            <Input value={block.data.title} onChange={e => updateBlock(idx, { title: e.target.value })} placeholder="Ej: Introducción al Terreno" className="rounded-xl h-12 border-slate-100 font-bold" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Link de YouTube</Label>
                                                            <Input value={block.data.url} onChange={e => updateBlock(idx, { url: e.target.value })} placeholder="https://..." className="rounded-xl h-12 border-slate-100 font-bold" />
                                                        </div>
                                                    </div>
                                                    {block.data.url && getYouTubeId(block.data.url) && (
                                                        <div className="aspect-video rounded-3xl overflow-hidden border-4 border-slate-100 shadow-inner">
                                                            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeId(block.data.url)}?modestbranding=1&rel=0`} frameBorder="0" allowFullScreen />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {block.type === 'step' && (
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contenido de la Instrucción</Label>
                                                    <Textarea value={block.data.text} onChange={e => updateBlock(idx, { text: e.target.value })} placeholder="Escribe los pasos técnicos..." className="rounded-2xl border-slate-100 min-h-[120px] text-sm font-medium" />
                                                </div>
                                            )}

                                            {block.type === 'multiple_choice' && (
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enunciado de la Pregunta</Label>
                                                        <Input value={block.data.question} onChange={e => updateBlock(idx, { question: e.target.value })} placeholder="¿Qué hace la herramienta?" className="rounded-xl h-12 border-slate-100 font-bold" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                                            Opciones de Respuesta <Badge variant="outline" className="text-[8px] bg-slate-50">CLAVE EN VERDE</Badge>
                                                        </Label>
                                                        {block.data.options.map((opt: string, oi: number) => (
                                                            <div key={oi} className="flex gap-4 items-center group/opt">
                                                                <button onClick={() => updateBlock(idx, { correctIndex: oi })}
                                                                    className={cn(
                                                                        "w-10 h-10 rounded-xl flex shrink-0 items-center justify-center font-black text-xs border-2 transition-all shadow-sm",
                                                                        block.data.correctIndex === oi 
                                                                            ? "bg-emerald-600 text-white border-emerald-600" 
                                                                            : "bg-white text-slate-300 border-slate-100 hover:border-emerald-200"
                                                                    )}>
                                                                    {block.data.correctIndex === oi ? '✓' : (oi + 1)}
                                                                </button>
                                                                <Input value={opt}
                                                                    onChange={e => {
                                                                        const opts = [...block.data.options];
                                                                        opts[oi] = e.target.value;
                                                                        updateBlock(idx, { options: opts });
                                                                    }}
                                                                    placeholder={`Respuesta ${oi + 1}`} className="rounded-xl h-12 border-slate-100 flex-1 font-bold shadow-none focus:shadow-md" />
                                                                <Button variant="ghost" size="icon" onClick={() => {
                                                                    const opts = block.data.options.filter((_: string, i: number) => i !== oi);
                                                                    updateBlock(idx, { options: opts, correctIndex: Math.min(block.data.correctIndex, opts.length - 1) });
                                                                }} className="text-rose-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></Button>
                                                            </div>
                                                        ))}
                                                        <Button variant="outline" onClick={() => updateBlock(idx, { options: [...block.data.options, ''] })} className="rounded-xl border-dashed border-2 border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 font-bold text-[10px] uppercase tracking-widest h-12 w-full mt-2 transition-all">
                                                            <Plus className="w-4 h-4 mr-2" /> Añadir Alternativa
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {block.type === 'image_upload' && (
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Instrucción de Evidencia</Label>
                                                        <Input value={block.data.instruction} onChange={e => updateBlock(idx, { instruction: e.target.value })}
                                                            placeholder="Ej: Sube captura de tu bloque con color diferente" className="rounded-xl h-12 border-slate-100 font-bold" />
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <ImageUploadInput 
                                                                label="Ejemplo de Éxito (Imagen)" 
                                                                value={block.data.exampleUrl} 
                                                                onChange={val => updateBlock(idx, { exampleUrl: val })} 
                                                            />
                                                            {block.data.exampleUrl && (
                                                                <div className="p-2 bg-slate-50 rounded-2xl border-2 border-slate-100">
                                                                    <img src={block.data.exampleUrl} alt="Ejemplo" className="max-h-48 w-full object-contain rounded-xl" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="bg-pink-50 border-2 border-dashed border-pink-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                                                            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                                                                <ImageIcon className="w-8 h-8 text-pink-500" />
                                                            </div>
                                                            <p className="text-pink-600 font-black text-xs uppercase tracking-widest leading-relaxed">Zona de Visualización<br/><span className="text-[9px] opacity-70">Aquí el alumno cargará su archivo</span></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {block.type === 'label_image' && (
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Premisa del Diagrama</Label>
                                                        <Input value={block.data.instruction} onChange={e => updateBlock(idx, { instruction: e.target.value })}
                                                            placeholder="Ej: Identifica las herramientas de construcción" className="rounded-xl h-12 border-slate-100 font-bold" />
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        <div className="space-y-4">
                                                            <ImageUploadInput 
                                                                label="Imagen Base de Mapa" 
                                                                value={block.data.imageUrl} 
                                                                onChange={val => updateBlock(idx, { imageUrl: val })} 
                                                            />
                                                            {block.data.imageUrl && (
                                                                <div className="p-2 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner">
                                                                    <img src={block.data.imageUrl} alt="Base" className="max-h-56 w-full object-contain rounded-xl" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Etiquetas Requeridas</Label>
                                                            {block.data.labels.map((lbl: string, li: number) => (
                                                                <div key={li} className="flex gap-3 group/lbl">
                                                                    <Input value={lbl}
                                                                        onChange={e => {
                                                                            const lbls = [...block.data.labels];
                                                                            lbls[li] = e.target.value;
                                                                            updateBlock(idx, { labels: lbls });
                                                                        }}
                                                                        placeholder={`Etiqueta ${li + 1}`} className="rounded-xl h-10 border-slate-100 font-black text-xs placeholder:text-slate-300" />
                                                                    <Button variant="ghost" size="icon" onClick={() => updateBlock(idx, { labels: block.data.labels.filter((_: string, i: number) => i !== li) })} className="w-10 h-10 text-rose-300 opacity-0 group-hover/lbl:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>
                                                                </div>
                                                            ))}
                                                            <Button variant="ghost" size="sm" onClick={() => updateBlock(idx, { labels: [...block.data.labels, ''] })} className="text-emerald-600 font-black text-[9px] uppercase tracking-widest py-3 border border-emerald-100 bg-emerald-50/30 rounded-xl hover:bg-emerald-50 w-full mt-2">
                                                                <Plus className="w-3 h-3 mr-2" /> Inyectar Etiqueta
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {block.type === 'match_lines' && (
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Premisa de Relación</Label>
                                                        <Input value={block.data.instruction} onChange={e => updateBlock(idx, { instruction: e.target.value })}
                                                            placeholder="Ej: Une la herramienta con su icono" className="rounded-xl h-12 border-slate-100 font-bold" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-[2rem] border-2 border-slate-100">
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase text-slate-400 text-center block mb-2 tracking-widest italic">Nodos A</Label>
                                                            {block.data.leftItems.map((item: string, li: number) => (
                                                                <div key={li} className="flex gap-2">
                                                                    <Input value={item}
                                                                        onChange={e => {
                                                                            const items = [...block.data.leftItems];
                                                                            items[li] = e.target.value;
                                                                            updateBlock(idx, { leftItems: items });
                                                                        }}
                                                                        placeholder="Elemento" className="rounded-xl h-10 border-slate-200 text-xs font-bold" />
                                                                    <Button variant="ghost" size="icon" onClick={() => updateBlock(idx, { leftItems: block.data.leftItems.filter((_: string, i: number) => i !== li) })} className="w-8 h-10 text-rose-300"><Trash2 className="w-3 h-3" /></Button>
                                                                </div>
                                                            ))}
                                                            <Button variant="ghost" size="sm" onClick={() => updateBlock(idx, { leftItems: [...block.data.leftItems, ''] })} className="w-full text-slate-400 hover:text-slate-600 font-black text-[8px] uppercase">
                                                                + Añadir Nodo
                                                            </Button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase text-slate-400 text-center block mb-2 tracking-widest italic flex items-center justify-center gap-1"><Link2 className="w-3 h-3 text-emerald-400" /> Nodos B</Label>
                                                            {block.data.rightItems.map((item: string, ri: number) => (
                                                                <div key={ri} className="flex gap-2">
                                                                    <Input value={item}
                                                                        onChange={e => {
                                                                            const items = [...block.data.rightItems];
                                                                            items[ri] = e.target.value;
                                                                            updateBlock(idx, { rightItems: items });
                                                                        }}
                                                                        placeholder="Respuesta" className="rounded-xl h-10 border-slate-200 text-xs font-bold" />
                                                                    <Button variant="ghost" size="icon" onClick={() => updateBlock(idx, { rightItems: block.data.rightItems.filter((_: string, i: number) => i !== ri) })} className="w-8 h-10 text-rose-300"><Trash2 className="w-3 h-3" /></Button>
                                                                </div>
                                                            ))}
                                                            <Button variant="ghost" size="sm" onClick={() => updateBlock(idx, { rightItems: [...block.data.rightItems, ''] })} className="w-full text-slate-400 hover:text-slate-600 font-black text-[8px] uppercase">
                                                                + Añadir Nodo
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}

                        {/* Add Activity Menu - Blueprints Dark UI */}
                        <div className="relative group">
                            <div className="absolute -left-[51px] top-8 w-6 h-6 rounded-full bg-slate-200 border-4 border-white z-10" />
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setShowAddMenu(!showAddMenu)}
                                    className={cn(
                                        "w-full h-24 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all border-4 border-dashed flex items-center justify-center gap-4",
                                        showAddMenu 
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xl shadow-emerald-500/40" 
                                            : "bg-white text-emerald-600 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 shadow-sm"
                                    )}
                                >
                                    <Plus className={cn("w-8 h-8 transition-transform duration-500", showAddMenu && "rotate-45")} />
                                    {showAddMenu ? 'CANCELAR PROTOCOLO' : 'INYECTAR ETAPA DE CRITERIO'}
                                </button>

                                <AnimatePresence>
                                {showAddMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="mt-6 bg-slate-900 rounded-[3rem] border-0 shadow-2xl p-8 grid grid-cols-2 md:grid-cols-3 gap-3 z-10 overflow-hidden relative"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-800 opacity-50" />
                                        {BLOCK_TYPES.map(bt => {
                                            const Icon = bt.icon;
                                            return (
                                                <button 
                                                    key={bt.type} 
                                                    onClick={() => addBlock(bt.type)}
                                                    className="group/btn bg-white/5 hover:bg-emerald-600 border border-white/5 rounded-[1.5rem] p-5 flex flex-col items-center gap-2 transition-all hover:-translate-y-1"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-1 group-hover/btn:bg-white/20 transition-colors">
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-black text-[9px] uppercase tracking-widest text-white">{bt.label}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Engineering Footer Decoration */}
            <div className="h-8 bg-[#0F172A] w-full flex items-center justify-center px-10 gap-10 overflow-hidden opacity-60 shrink-0 select-none">
                 {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> GENIA SKILLS VALIDATION UNIT · HA-SERIES 2026
                    </div>
                ))}
            </div>
        </div>
    );
}

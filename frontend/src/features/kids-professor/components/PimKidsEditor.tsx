import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
    Plus, Trash2, Save, ArrowLeft, Rocket, Video, Sparkles, Lightbulb, 
    ChevronDown, ChevronUp, RotateCcw, Target, BookOpen, Layers, Zap
} from "lucide-react";
import kidsProfessorApi from "../services/kidsProfessor.api";
import { institutionalCurriculumApi } from "@/features/institutional/services/curriculum.api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PimKidsProps {
    levelId: number;
    onClose: () => void;
    user?: any;
    instModuleId?: number; // Added for institutional sync
}

export default function PimKidsEditor({ levelId, onClose, user, instModuleId }: PimKidsProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [milestones, setMilestones] = useState<string[]>([""]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (instModuleId) {
            institutionalCurriculumApi.getModule(instModuleId).then(mod => {
                if (mod && mod.contenido) {
                    setTitle(mod.titulo);
                    setDescription(mod.contenido.description || "");
                    setVideoUrl(mod.contenido.videoUrl || "");
                    setMilestones(mod.contenido.milestones || [""]);
                }
            });
        } else {
            kidsProfessorApi.getTemplateByType(levelId, 'pim_kids').then(data => {
                if (data) {
                    setTitle(data.titulo);
                    setDescription(data.actividades?.description || "");
                    setVideoUrl(data.videoUrl || "");
                    setMilestones(data.actividades?.milestones || [""]);
                }
            });
        }
    }, [levelId, instModuleId]);

    const handleSave = async () => {
        if (!title) { toast.error("Ponle un nombre a tu proyecto."); return; }
        setLoading(true);
        try {
            const activitiesData = {
                description: description,
                milestones: milestones.filter(m => m.trim()),
                videoUrl: videoUrl
            };

            // 1. Legacy save
            await kidsProfessorApi.saveTypedTemplate(levelId, 'pim_kids', {
                titulo: title,
                tipo: 'pim_kids',
                actividades: activitiesData,
                configuracion: { primaryColor: "#4f46e5" }
            });

            // 2. Institutional save
            if (instModuleId) {
                await institutionalCurriculumApi.updateModule(instModuleId, {
                    titulo: title,
                    contenido: activitiesData
                });
            }

            toast.success("¡Proyecto PIM Sincronizado! 🚀");
            onClose();
        } catch (error) {
            toast.error("Error al guardar el proyecto");
        } finally {
            setLoading(false);
        }
    };

    const addMilestone = () => setMilestones([...milestones, ""]);
    const removeMilestone = (index: number) => setMilestones(milestones.filter((_, i) => i !== index));
    const updateMilestone = (index: number, val: string) => {
        const newMilestones = [...milestones];
        newMilestones[index] = val;
        setMilestones(newMilestones);
    };

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(videoUrl);

    return (
        <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Header - Engineering Blueprint PIM Style */}
            <header className="bg-white border-b-[6px] border-indigo-600 px-8 py-5 flex items-center justify-between shadow-xl z-20 shrink-0 text-slate-900">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={onClose} 
                        className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                            CENTRO DE <span className="text-indigo-600">PROYECTO PIM</span> KIDS
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                             <Rocket className="w-3 h-3 text-indigo-500" /> MISIÓN DE INNOVACIÓN · {milestones.length} ETAPAS CLAVE
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={onClose} className="rounded-2xl border-2 border-slate-200 font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="rounded-2xl bg-[#0F172A] hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest h-12 px-10 shadow-lg shadow-indigo-500/20 group">
                        {loading ? <RotateCcw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
                        {loading ? 'DESPEGANDO...' : 'Sincronizar Proyecto'}
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-grid-slate-100/50">
                <div className="max-w-4xl mx-auto p-12 space-y-10 pb-32">
                    {/* Basic Info - BLUEPRINT CARD */}
                    <Card className="rounded-[2.5rem] border-0 shadow-2xl shadow-indigo-900/5 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500" />
                        <CardContent className="p-10 bg-white">
                            <div className="flex items-center gap-4 mb-6">
                                <Badge className="bg-indigo-600 text-white border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                                    Definición de Misión
                                </Badge>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>
                            <div className="grid gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Nombre del Proyecto de Innovación</Label>
                                    <Input value={title} onChange={e => setTitle(e.target.value)}
                                        placeholder="Ej: MI PRIMERA IA GENERATIVA"
                                        className="rounded-2xl h-16 text-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-indigo-100 font-black transition-all placeholder:text-slate-200" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Descripción de la Gran Idea</Label>
                                    <Textarea value={description} onChange={e => setDescription(e.target.value)}
                                        placeholder="Explica el impacto que tendrá este proyecto..."
                                        className="rounded-2xl border-2 border-slate-100 focus:border-indigo-500 min-h-[120px] text-base font-medium leading-relaxed" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Video - BLUEPRINT CARD */}
                    <Card className="rounded-[2.5rem] border-0 shadow-2xl shadow-indigo-900/5 overflow-hidden">
                        <CardHeader className="bg-[#0F172A] p-8">
                            <CardTitle className="text-white font-black italic uppercase tracking-tighter text-xl flex items-center gap-3">
                                <Video className="w-6 h-6 text-rose-500" /> Contenido Inspirador
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-6 bg-white">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">URL de Referencia (YouTube)</Label>
                                <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="rounded-xl h-14 border-2 border-slate-100 focus:border-rose-500 font-bold" />
                            </div>
                            {videoId && (
                                <div className="aspect-video rounded-[2rem] overflow-hidden border-8 border-slate-50 shadow-inner group relative">
                                    <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                                    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} frameBorder="0" allowFullScreen />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Milestones - Blueprint Flow */}
                    <Card className="rounded-[2.5rem] border-0 shadow-2xl shadow-indigo-900/5 overflow-hidden">
                        <CardHeader className="bg-indigo-50 p-8 border-b border-indigo-100">
                             <div className="flex items-center justify-between">
                                <CardTitle className="text-indigo-900 font-black italic uppercase tracking-tighter text-xl flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-indigo-500" /> Etapas del Desarrollo
                                </CardTitle>
                                <Badge variant="outline" className="text-[8px] font-bold text-indigo-400 border-indigo-200">SECUENCIA CRÍTICA</Badge>
                             </div>
                        </CardHeader>
                        <CardContent className="p-10 bg-white space-y-6">
                            <div className="relative pl-12 space-y-6">
                                <div className="absolute left-[19px] top-6 bottom-6 w-1 bg-gradient-to-b from-indigo-500 via-indigo-100 to-transparent rounded-full shadow-sm" />
                                
                                {milestones.map((m, idx) => (
                                    <div key={idx} className="relative group flex gap-4 items-center">
                                        <div className="absolute -left-[51px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-4 border-indigo-600 z-10 shadow-md group-hover:scale-110 transition-transform flex items-center justify-center">
                                            <span className="text-[10px] font-black text-indigo-600">{idx + 1}</span>
                                        </div>
                                        
                                        <Input 
                                            value={m}
                                            onChange={e => updateMilestone(idx, e.target.value)}
                                            placeholder={`Definir Etapa ${idx + 1}...`}
                                            className="rounded-2xl h-14 border-slate-100 focus:border-indigo-500 flex-1 font-bold text-sm shadow-sm"
                                        />
                                        
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => removeMilestone(idx)} 
                                            className="w-12 h-14 rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                variant="outline" 
                                onClick={addMilestone}
                                className="w-full rounded-[2rem] border-4 border-dashed border-slate-100 text-slate-400 h-20 font-black italic text-xs uppercase tracking-[0.3em] hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all mt-4 group"
                            >
                                <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" /> Inyectar nueva etapa de proyecto
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Engineering Footer Decoration */}
            <div className="h-10 bg-[#0F172A] w-full flex items-center justify-between px-10 shrink-0 text-[10px] font-black text-slate-500 uppercase tracking-widest border-t border-white/5 shadow-2xl">
                <div className="flex items-center gap-4">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    GENIA PIM-V CORE · PROTOCOL ACTIVATED
                </div>
                <div className="bg-indigo-500/10 px-4 py-1 rounded-full text-indigo-400 border border-indigo-500/20">
                    STATUS: READY_FOR_SYNC
                </div>
            </div>
        </div>
    );
}

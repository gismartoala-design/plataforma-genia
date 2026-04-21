import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowLeft, Gamepad2, Rocket, Star, Trophy, Video, Music, Image as ImageIcon, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import kidsProfessorApi from "../services/kidsProfessor.api";
import { KidsCourseEditor } from "./KidsCourseEditor";
import RagKidsEditor from "./RagKidsEditor";
import HaKidsEditor from "./HaKidsEditor";
import PimKidsEditor from "./PimKidsEditor";
import { motion, AnimatePresence } from "framer-motion";

interface Level {
    id: number;
    tituloNivel: string;
    orden: number;
    bloqueado?: boolean;
    contents: any[];
    kidsTemplates: any[];
}

export default function KidsModuleEditor({ user: propUser }: { user?: any }) {
    const [user] = useState<any>(propUser || (() => {
        const savedUser = localStorage.getItem("edu_user");
        return savedUser ? JSON.parse(savedUser) : null;
    }));
    const [match, params] = useRoute("/kids-teach/module/:id");
    const [, setLocation] = useLocation();
    const [moduleName, setModuleName] = useState("");
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [newLevelTitle, setNewLevelTitle] = useState("");
    const [showLevelDialog, setShowLevelDialog] = useState(false);
    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);

    const [showEditLevelDialog, setShowEditLevelDialog] = useState(false);
    const [editingLevel, setEditingLevel] = useState<Level | null>(null);
    const [editLevelTitle, setEditLevelTitle] = useState("");
    const [editLevelBlocked, setEditLevelBlocked] = useState(false);

    // Activity Editing States
    const [editingAdventureLevelId, setEditingAdventureLevelId] = useState<number | null>(null);
    const [editingRagLevelId, setEditingRagLevelId] = useState<number | null>(null);
    const [editingHaLevelId, setEditingHaLevelId] = useState<number | null>(null);
    const [editingPimLevelId, setEditingPimLevelId] = useState<number | null>(null);

    // Dialog for adding Video URL
    const [showVideoDialog, setShowVideoDialog] = useState(false);
    const [videoTargetLevelId, setVideoTargetLevelId] = useState<number | null>(null);
    const [tempVideoUrl, setTempVideoUrl] = useState("");

    const moduleId = match && params ? (params as any).id : null;

    useEffect(() => {
        if (moduleId) {
            fetchModuleData();
        }
    }, [moduleId]);

    const fetchModuleData = async () => {
        if (!moduleId) return;
        try {
            setLoading(true);
            // Fetch module info directly by ID using configured API
            const modData = await kidsProfessorApi.getModuleById(moduleId).catch(() => null);
            if (modData) setModuleName(modData.nombreModulo || `Módulo ${moduleId}`);

            const levelsData = await kidsProfessorApi.getModuleLevels(moduleId);
            setLevels(levelsData);
        } catch (error) {
            console.error("Error fetching module data:", error);
        } finally {
            setLoading(false);
        }
    };

    const addLevel = async () => {
        if (!newLevelTitle.trim()) return;
        try {
            await kidsProfessorApi.createLevel(moduleId, {
                tituloNivel: newLevelTitle,
                orden: levels.length + 1
            });
            toast({ title: "¡Nivel Mágico Creado!", description: "Ahora añade algunas actividades divertidas." });
            setNewLevelTitle("");
            setShowLevelDialog(false);
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo crear el nivel", variant: "destructive" });
        }
    };

    const deleteLevel = async (levelId: number) => {
        if (!confirm("¿Seguro que quieres borrar este nivel y todos sus juegos?")) return;
        try {
            await kidsProfessorApi.deleteLevel(moduleId, levelId);
            toast({ title: "Nivel eliminado" });
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo borrar" });
        }
    };
 
    const handleReorderLevel = async (levelId: number, direction: 'up' | 'down') => {
        const idx = levels.findIndex(l => l.id === levelId);
        if (idx === -1) return;
        
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= levels.length) return;
        
        try {
            const currentLevel = levels[idx];
            const otherLevel = levels[newIdx];
            
            // Swap orders
            await Promise.all([
                kidsProfessorApi.updateLevel(currentLevel.id, { orden: otherLevel.orden }),
                kidsProfessorApi.updateLevel(otherLevel.id, { orden: currentLevel.orden })
            ]);
            
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error al reordenar", variant: "destructive" });
        }
    };

    const openEditLevel = (level: Level) => {
        setEditingLevel(level);
        setEditLevelTitle(level.tituloNivel);
        setEditLevelBlocked(level.bloqueado === true);
        setShowEditLevelDialog(true);
    };

    const saveEditLevel = async () => {
        if (!editingLevel || !editLevelTitle.trim()) return;
        try {
            await kidsProfessorApi.updateLevel(editingLevel.id, {
                tituloNivel: editLevelTitle,
                bloqueado: editLevelBlocked
            });
            toast({ title: "Nivel actualizado" });
            setShowEditLevelDialog(false);
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar el nivel" });
        }
    };

    const handleToggleLock = async (levelId: number, tipo: string, currentBlocked: boolean) => {
        try {
            const level = levels.find(l => l.id === levelId);
            const template = level?.kidsTemplates?.find(t => t.tipo === tipo);

            if (template) {
                await kidsProfessorApi.updateTemplate(template.id, { bloqueado: !currentBlocked });
            } else {
                let initialActivities = {};
                if (tipo === 'rag_kids') initialActivities = { steps: [] };
                if (tipo === 'ha_kids') initialActivities = { blocks: [] };
                if (tipo === 'pim_kids') initialActivities = { milestones: [] };

                await kidsProfessorApi.saveTypedTemplate(levelId, tipo, { 
                    bloqueado: !currentBlocked,
                    titulo: tipo.toUpperCase().replace('_', ' '),
                    actividades: initialActivities,
                    configuracion: {}
                });
            }
            
            toast({ 
                title: !currentBlocked ? "Actividad bloqueada" : "Actividad desbloqueada",
                description: !currentBlocked ? "Los estudiantes no podrán verla." : "Ahora es visible para los estudiantes."
            });
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo cambiar el estado", variant: "destructive" });
        }
    };

    const handleAddVideo = async () => {
        if (!videoTargetLevelId || !tempVideoUrl.trim()) return;
        try {
            await kidsProfessorApi.createContent(videoTargetLevelId, {
                tipo: 'video',
                urlRecurso: tempVideoUrl,
                orden: 1
            });
            toast({ title: "¡Video añadido!", description: "El video ya está disponible en el nivel." });
            setTempVideoUrl("");
            setShowVideoDialog(false);
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error al añadir video", variant: "destructive" });
        }
    };

    const handleUploadContent = async (levelId: number, file: File, tipo: 'image' | 'audio') => {
        try {
            const { url } = await kidsProfessorApi.uploadFile(file, user?.id?.toString());
            await kidsProfessorApi.createContent(levelId, {
                tipo,
                urlRecurso: url,
                orden: 1
            });
            toast({ title: "¡Archivo subido!", description: "El recurso se ha añadido al nivel." });
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error al subir archivo", variant: "destructive" });
        }
    };

    const handleDeleteContent = async (contentId: number) => {
        if (!confirm("¿Deseas eliminar este recurso?")) return;
        try {
            await kidsProfessorApi.deleteContent(contentId);
            toast({ title: "Recurso eliminado" });
            fetchModuleData();
        } catch (error) {
            toast({ title: "Error al borrar", variant: "destructive" });
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse text-indigo-500 font-bold">Cargando mundo mágico...</div>;

    if (editingAdventureLevelId) {
        return <KidsCourseEditor user={user} id={editingAdventureLevelId} onClose={() => setEditingAdventureLevelId(null)} />;
    }

    if (editingRagLevelId) {
        return <RagKidsEditor levelId={editingRagLevelId} user={user} onClose={() => setEditingRagLevelId(null)} />;
    }

    if (editingHaLevelId) {
        return <HaKidsEditor levelId={editingHaLevelId} user={user} onClose={() => setEditingHaLevelId(null)} />;
    }

    if (editingPimLevelId) {
        return <PimKidsEditor levelId={editingPimLevelId} user={user} onClose={() => setEditingPimLevelId(null)} />;
    }

    return (
        <div className="min-h-screen relative overflow-x-hidden font-sans pb-20" style={{ background: 'linear-gradient(145deg, #f0f9ff 0%, #faf5ff 50%, #fffbeb 100%)' }}>
            {/* Animated floating blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full opacity-10"
                        style={{
                            width: `${200 + i * 50}px`, height: `${200 + i * 50}px`,
                            background: [`#818cf8`, `#34d399`, `#fb923c`, `#a78bfa`, `#38bdf8`][i],
                            top: `${[5, 65, 25, 75, 45][i]}%`,
                            left: `${[3, 80, 35, 15, 90][i]}%`,
                        }}
                        animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i }}
                    />
                ))}
            </div>

            <div className="max-w-6xl mx-auto relative z-10 p-8 space-y-10">
                <motion.header 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-wrap items-center justify-between bg-white/80 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl border-4 border-white gap-6"
                >
                    <div className="flex items-center gap-6">
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setLocation("/kids-teach")} 
                            className="w-16 h-16 rounded-[1.5rem] bg-slate-100 hover:bg-slate-200 border-x-4 border-t-4 border-b-8 border-slate-300 flex items-center justify-center transition-all active:border-b-4 active:translate-y-1"
                        >
                            <ArrowLeft className="w-8 h-8 text-slate-600" />
                        </motion.button>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{moduleName}</h1>
                            <p className="text-indigo-500 font-black text-lg flex items-center gap-3 italic uppercase">
                               <Gamepad2 className="w-6 h-6" /> Laboratorio de Aventuras
                            </p>
                        </div>
                    </div>

                    <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
                        <DialogTrigger asChild>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-br from-indigo-500 to-indigo-700 h-16 px-10 rounded-[2rem] text-white font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-300/40 border-x-4 border-t-4 border-b-8 border-indigo-900 active:border-b-4 active:translate-y-1 transition-all"
                            >
                                <Plus className="w-6 h-6" /> NUEVO NIVEL
                            </motion.button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[3rem] border-[8px] border-indigo-50 p-10">
                            <DialogHeader>
                                <DialogTitle className="text-4xl font-black text-slate-800 text-center mb-4">¡Nuevo Nivel Mágico! 🏰</DialogTitle>
                            </DialogHeader>
                            <div className="py-6">
                                <Label className="text-lg font-black text-indigo-600 ml-2">Nombre del Nivel</Label>
                                <Input 
                                    value={newLevelTitle} 
                                    onChange={e => setNewLevelTitle(e.target.value)} 
                                    placeholder="Ej: Mundos de Bits"
                                    className="rounded-[2rem] h-16 border-4 border-indigo-50 focus:border-indigo-200 text-xl font-bold bg-slate-50/50 px-8 mt-2"
                                />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <Button variant="ghost" onClick={() => setShowLevelDialog(false)} className="h-14 rounded-2xl font-black text-slate-400">Cancelar</Button>
                                <Button onClick={addLevel} className="flex-1 h-16 rounded-[2rem] bg-indigo-600 text-white font-black text-lg shadow-xl">¡CREAR NIVEL!</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showEditLevelDialog} onOpenChange={setShowEditLevelDialog}>
                        <DialogContent className="rounded-[3rem] border-[8px] border-indigo-50 p-10">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black text-slate-800 text-center mb-4">Ajustar Nivel 🛠️</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-lg font-black text-slate-700 ml-2">Nombre del Nivel</Label>
                                    <Input 
                                        value={editLevelTitle} 
                                        onChange={e => setEditLevelTitle(e.target.value)} 
                                        className="rounded-[2rem] h-16 border-4 border-slate-50 focus:border-indigo-200 text-xl font-bold bg-white px-8"
                                    />
                                </div>
                                <button 
                                    onClick={(e) => { e.preventDefault(); setEditLevelBlocked(!editLevelBlocked); }}
                                    className={`w-full h-16 rounded-[2rem] flex items-center justify-between px-8 border-4 transition-all ${editLevelBlocked ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {editLevelBlocked ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                                        <span className="font-black text-lg uppercase tracking-tight">{editLevelBlocked ? 'NIVEL OCULTO' : 'NIVEL VISIBLE'}</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all ${editLevelBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editLevelBlocked ? 'left-1' : 'right-1'}`} />
                                    </div>
                                </button>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <Button variant="ghost" onClick={() => setShowEditLevelDialog(false)} className="h-14 rounded-2xl font-black text-slate-400">Cancelar</Button>
                                <Button onClick={saveEditLevel} className="flex-1 h-16 rounded-[2rem] bg-indigo-600 text-white font-black text-lg shadow-xl">GUARDAR AJUSTES</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog for Video URL */}
                    <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
                        <DialogContent className="rounded-[3rem] border-[8px] border-red-50 p-10 max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black flex items-center justify-center gap-3 text-red-500 mb-4">
                                    <Video className="w-10 h-10" /> AÑADIR VIDEO
                                </DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-lg font-black text-slate-700 ml-2">Enlace del Video</Label>
                                    <Input 
                                        value={tempVideoUrl} 
                                        onChange={e => setTempVideoUrl(e.target.value)} 
                                        placeholder="Copia el enlace de YouTube aquí..."
                                        className="rounded-[2rem] h-16 border-4 border-slate-50 focus:border-red-200 font-bold bg-white px-8"
                                    />
                                    <p className="text-xs text-slate-400 font-bold text-center uppercase tracking-widest">Asegúrate de que sea un video divertido</p>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <Button variant="ghost" onClick={() => setShowVideoDialog(false)} className="h-14 rounded-2xl font-black text-slate-400">Cancelar</Button>
                                <Button onClick={handleAddVideo} className="flex-1 h-16 rounded-[2rem] bg-red-500 hover:bg-red-600 text-white font-black text-lg shadow-xl shadow-red-200">¡AÑADIR VIDEO!</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </motion.header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {levels.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-24 text-center bg-white/60 backdrop-blur-xl rounded-[4rem] border-8 border-dashed border-white shadow-inner flex flex-col items-center gap-6"
                        >
                            <div className="text-9xl grayscale opacity-30">🏰</div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-400">¡Tu Reino está vacío!</h3>
                                <p className="text-slate-400 font-black uppercase tracking-widest italic">Haz clic en "Nuevo Nivel" para comenzar la magia.</p>
                            </div>
                        </motion.div>
                    ) : (
                        levels.map((level, idx) => (
                            <motion.div
                                key={level.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <Card className="rounded-[4rem] border-4 border-white shadow-2xl hover:shadow-indigo-200/40 transition-all overflow-hidden flex flex-col h-[640px] bg-white/90 backdrop-blur-xl">
                                    <div className={`p-8 flex flex-row items-center justify-between ${level.bloqueado ? 'bg-slate-100/50' : 'bg-gradient-to-br from-indigo-50 to-purple-50/30'}`}>
                                        <div className="flex items-center gap-4 cursor-pointer group/title" onClick={() => openEditLevel(level)}>
                                           <div className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-2xl shadow-xl transform group-hover/title:scale-110 group-hover/title:rotate-6 transition-all ${level.bloqueado ? 'bg-slate-400' : 'bg-gradient-to-br from-indigo-500 to-indigo-700 border-x-2 border-t-2 border-b-4 border-indigo-900'}`}>
                                               {idx + 1}
                                           </div>
                                           <div className="flex flex-col">
                                               <CardTitle className={`text-2xl font-black line-clamp-1 italic italic uppercase tracking-tighter transition-colors ${level.bloqueado ? 'text-slate-400' : 'text-slate-800'}`}>
                                                   {level.tituloNivel}
                                                   {level.bloqueado && <EyeOff className="ml-2 w-5 h-5 text-red-500 inline-block" />}
                                               </CardTitle>
                                               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-60">Ajustar Nivel</span>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col gap-1">
                                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleReorderLevel(level.id, 'up'); }} disabled={idx === 0} className="w-8 h-8 rounded-lg bg-white/50 border hover:bg-white disabled:opacity-20">
                                                    <ChevronUp className="w-5 h-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleReorderLevel(level.id, 'down'); }} disabled={idx === levels.length - 1} className="w-8 h-8 rounded-lg bg-white/50 border hover:bg-white disabled:opacity-20">
                                                    <ChevronDown className="w-5 h-5" />
                                                </Button>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteLevel(level.id); }} 
                                                className="w-12 h-12 bg-white rounded-2xl border-4 border-slate-50 hover:bg-red-50 hover:border-red-100 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <CardContent className="flex-1 p-8 space-y-6">
                                       <div className="grid grid-cols-2 gap-4">
                                           {[
                                               { tipo: 'rag_kids', label: 'RAG Kids', icon: Star, color: 'amber', edit: setEditingRagLevelId,
                                                 styles: "border-amber-400 bg-amber-50 text-amber-700 shadow-amber-100/50" },
                                               { tipo: 'ha_kids', label: 'HA Kids', icon: Trophy, color: 'emerald', edit: setEditingHaLevelId,
                                                 styles: "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-emerald-100/50" },
                                               { tipo: 'pim_kids', label: 'PIM Kids', icon: Rocket, color: 'blue', edit: setEditingPimLevelId,
                                                 styles: "border-blue-400 bg-blue-50 text-blue-700 shadow-blue-100/50" },
                                               { tipo: 'adventure', label: 'Aventura', icon: Gamepad2, color: 'purple', edit: (id: number) => { setSelectedLevelId(id); setEditingAdventureLevelId(id); },
                                                 styles: "border-purple-400 bg-purple-50 text-purple-700 shadow-purple-100/50" }
                                           ].map((act) => {
                                               const template = level.kidsTemplates?.find(t => t.tipo === act.tipo);
                                               const isBlocked = template?.bloqueado === true;
                                               
                                               const acts = template?.actividades;
                                               const hasContent = acts && (
                                                   (Array.isArray(acts.steps) && acts.steps.length > 0) ||
                                                   (Array.isArray(acts.blocks) && acts.blocks.length > 0) ||
                                                   (Array.isArray(acts.milestones) && acts.milestones.length > 0) ||
                                                   (acts.screens && acts.screens.length > 0)
                                               );

                                               const Icon = act.icon;
                                               
                                               return (
                                                   <div key={act.tipo} className="relative group/btn">
                                                       <motion.button 
                                                          whileHover={{ scale: 1.05 }}
                                                          whileTap={{ scale: 0.95 }}
                                                          className={`w-full h-24 flex flex-col items-center justify-center gap-1 border-x-2 border-t-2 border-b-6 border-black/10 font-black rounded-[2rem] text-[10px] uppercase tracking-widest transition-all ${act.styles} ${isBlocked ? 'opacity-40 saturate-0' : 'shadow-lg shadow-black/5 active:border-b-2 active:translate-y-1'}`}
                                                          onClick={() => act.edit(level.id)}
                                                       >
                                                           <div className="relative">
                                                               <Icon className="w-8 h-8" />
                                                               {hasContent && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-pulse border-2 border-white shadow-xl" />}
                                                           </div>
                                                           {act.label}
                                                           {isBlocked && <span className="text-[10px] text-red-500 font-black flex items-center gap-1 italic"><EyeOff className="w-3 h-3" /> Bloqueado</span>}
                                                       </motion.button>
                                                       <Button 
                                                          variant="ghost" 
                                                          size="icon" 
                                                          className="absolute -top-2 -right-2 h-9 w-9 rounded-full bg-white border-4 border-slate-50 shadow-xl opacity-0 group-hover/btn:opacity-100 transition-all hover:bg-slate-50 z-10"
                                                          onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleToggleLock(level.id, act.tipo, isBlocked);
                                                          }}
                                                       >
                                                           {isBlocked ? <Eye className="w-5 h-5 text-emerald-500" /> : <EyeOff className="w-5 h-5 text-slate-400" />}
                                                       </Button>
                                                   </div>
                                               );
                                           })}
                                       </div>

                                       <div className="pt-6 border-t-4 border-slate-50 space-y-4">
                                           <div className="flex items-center justify-between">
                                               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic">Baúl de Contenidos</p>
                                               <span className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-full font-black shadow-lg shadow-indigo-200">{level.contents?.length || 0}</span>
                                           </div>
                                           
                                           <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                               {level.contents?.map((c) => (
                                                   <motion.div 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        key={c.id} 
                                                        className="flex items-center justify-between p-4 rounded-[1.5rem] bg-indigo-50/40 border-2 border-white group/item hover:bg-white hover:border-indigo-100 transition-all shadow-sm"
                                                    >
                                                       <div className="flex items-center gap-3 min-w-0">
                                                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                               {c.tipo === 'video' && <Video className="w-5 h-5 text-red-500" />}
                                                               {c.tipo === 'image' && <ImageIcon className="w-5 h-5 text-cyan-500" />}
                                                               {c.tipo === 'audio' && <Music className="w-5 h-5 text-amber-500" />}
                                                           </div>
                                                           <span className="text-xs font-black text-slate-600 truncate max-w-[120px] uppercase tracking-tighter underline underline-offset-4 decoration-indigo-200">
                                                               {c.tipo === 'video' ? 'Video Tutor' : (c.urlRecurso?.split('/').pop() || 'Archivo')}
                                                           </span>
                                                       </div>
                                                       <Button 
                                                          variant="ghost" 
                                                          size="icon" 
                                                          onClick={() => handleDeleteContent(c.id)}
                                                          className="h-8 w-8 rounded-xl bg-white/50 text-slate-300 hover:text-red-500 hover:bg-red-50 border border-slate-100 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                       >
                                                           <Trash2 className="w-4 h-4" />
                                                       </Button>
                                                   </motion.div>
                                               ))}
                                           </div>

                                           <div className="grid grid-cols-3 gap-2">
                                               {[
                                                   { icon: Video, color: 'bg-rose-500 shadow-rose-200', label: 'VIDEO', onClick: () => { setVideoTargetLevelId(level.id); setShowVideoDialog(true); } },
                                                   { icon: ImageIcon, color: 'bg-cyan-500 shadow-cyan-200', label: 'IMAGEN', input: 'image/*' },
                                                   { icon: Music, color: 'bg-amber-500 shadow-amber-200', label: 'SONIDO', input: 'audio/*' }
                                               ].map((btn, i) => (
                                                   <motion.label 
                                                      key={i}
                                                      whileHover={{ scale: 1.05 }}
                                                      whileTap={{ scale: 0.95 }}
                                                      onClick={btn.onClick}
                                                      className={`h-16 rounded-[1.8rem] ${btn.color} text-white shadow-xl flex flex-col items-center justify-center cursor-pointer border-x-2 border-t-2 border-b-6 border-black/10 active:border-b-2 active:translate-y-1`}
                                                   >
                                                      <btn.icon className="w-6 h-6" />
                                                      <span className="text-[7px] font-black tracking-widest mt-1 uppercase">{btn.label}</span>
                                                      {btn.input && (
                                                          <input 
                                                            type="file" 
                                                            accept={btn.input} 
                                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                                            onChange={(e) => e.target.files?.[0] && handleUploadContent(level.id, e.target.files[0], btn.input?.split('/')[0] as any)}
                                                          />
                                                      )}
                                                   </motion.label>
                                               ))}
                                           </div>
                                       </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

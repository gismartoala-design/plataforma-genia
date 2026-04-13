import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, ArrowLeft, Rocket, Video, Sparkles, Lightbulb } from "lucide-react";
import kidsProfessorApi from "../services/kidsProfessor.api";
import { toast } from "@/hooks/use-toast";

interface PimKidsProps {
    levelId: number;
    onClose: () => void;
    user?: any;
}

export default function PimKidsEditor({ levelId, onClose, user }: PimKidsProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [milestones, setMilestones] = useState<string[]>([""]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        kidsProfessorApi.getTemplateByType(levelId, 'pim_kids').then(data => {
            if (data) {
                setTitle(data.titulo);
                setDescription(data.actividades?.description || "");
                setVideoUrl(data.videoUrl || "");
                setMilestones(data.actividades?.milestones || [""]);
            }
        });
    }, [levelId]);

    const handleSave = async () => {
        if (!title) {
            toast({ title: "¡Ups!", description: "Tu proyecto necesita un nombre increíble.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                titulo: title,
                videoUrl: videoUrl,
                tipo: 'pim_kids',
                actividades: {
                    description: description,
                    milestones: milestones
                },
                configuracion: {
                    primaryColor: "#4f46e5", // Indigo 600
                    icon: "rocket"
                }
            };

            await kidsProfessorApi.saveTypedTemplate(levelId, 'pim_kids', payload);
            toast({ title: "¡Proyecto Guardado!", description: "Tu Proyecto PIM Kids está listo para despegar." });
            onClose();
        } catch (error) {
            toast({ title: "Error", description: "No pudimos guardar el proyecto.", variant: "destructive" });
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
        <div className="fixed inset-0 bg-indigo-50 z-50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="bg-white border-b-4 border-indigo-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-indigo-100">
                        <ArrowLeft className="w-6 h-6 text-indigo-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-indigo-800 flex items-center gap-2">
                            <Rocket className="w-7 h-7 text-indigo-500" />
                            Editor PIM Kids
                        </h1>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Creando grandes proyectos</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="rounded-2xl border-2 border-indigo-200 font-bold">Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading} className="rounded-2xl bg-indigo-500 hover:bg-indigo-600 font-black px-8 shadow-lg shadow-indigo-200">
                        <Save className="w-5 h-5 mr-2" /> {loading ? "Guardando..." : "¡PROYECTO LISTO!"}
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Card className="rounded-3xl border-4 border-indigo-100 shadow-xl overflow-hidden">
                        <CardHeader className="bg-indigo-100/50 py-4">
                            <CardTitle className="text-indigo-800 flex items-center gap-2 font-black">
                                <Lightbulb className="w-5 h-5" /> PASO 1: LA GRAN IDEA
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="font-black text-indigo-700">Título del Proyecto</Label>
                                <Input 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ej: Mi Robotique-Bot"
                                    className="rounded-2xl h-14 text-lg border-2 border-indigo-50 focus-visible:ring-indigo-400 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black text-indigo-700">Explica el proyecto</Label>
                                <Textarea 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="¿Cuál es el gran objetivo de este proyecto tecnológico?"
                                    className="rounded-2xl min-h-[100px] border-2 border-indigo-50 focus-visible:ring-indigo-400 font-medium"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-4 border-red-100 shadow-xl overflow-hidden">
                        <CardHeader className="bg-red-50 py-4">
                            <CardTitle className="text-red-800 flex items-center gap-2 font-black">
                                <Video className="w-5 h-5" /> PASO 2: VIDEO INSPIRADOR
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <Label className="font-black text-red-700">Link de YouTube para motivar a los alumnos</Label>
                                <Input 
                                    value={videoUrl} 
                                    onChange={e => setVideoUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="rounded-2xl h-12 border-2 border-red-50 focus-visible:ring-red-400 font-medium"
                                />
                                {videoId && (
                                    <div className="aspect-video rounded-3xl overflow-hidden border-4 border-red-50">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${videoId}`}
                                            frameBorder="0"
                                            allowFullScreen
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-4 border-emerald-100 shadow-xl overflow-hidden">
                        <CardHeader className="bg-emerald-50 py-4">
                            <CardTitle className="text-emerald-800 flex items-center gap-2 font-black">
                                <Sparkles className="w-5 h-5" /> PASO 3: ETAPAS DEL PROYECTO
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <Label className="font-black text-emerald-700">¿Qué pasos deben seguir para completarlo?</Label>
                            <div className="space-y-4">
                                {milestones.map((m, idx) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <Input 
                                            value={m}
                                            onChange={e => updateMilestone(idx, e.target.value)}
                                            placeholder={`Etapa ${idx + 1}...`}
                                            className="rounded-2xl h-12 border-2 border-emerald-50 focus-visible:ring-emerald-400 font-bold flex-1"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeMilestone(idx)} className="text-red-400">
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))}
                                <Button 
                                    variant="outline" 
                                    onClick={addMilestone}
                                    className="w-full rounded-2xl border-2 border-dashed border-emerald-300 text-emerald-600 h-12 font-black hover:bg-emerald-50"
                                >
                                    <Plus className="w-5 h-5 mr-2" /> AÑADIR OTRA ETAPA
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

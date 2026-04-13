
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    Layers,
    Trophy,
    Target,
    Search,
    PenTool,
    CheckCircle2,
    Info,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Rocket,
    CheckCircle,
    FileText,
    Layout,
    FileCheck,
    Settings,
    Upload,
    X,
    Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { studentApi } from "@/features/student/services/student.api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AvatarGuide from "./AvatarGuide";
import { AvatarState } from "@/types/gamification";

export const PimViewer = forwardRef(({ levelId }: { levelId: number }, ref) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [activeModuleIdx, setActiveModuleIdx] = useState(0);
    const [avatarState, setAvatarState] = useState<AvatarState>({
        isVisible: true,
        emotion: 'happy',
        message: "¡Bienvenido al Proyecto Integrador Modular! Aquí integrarás todos tus conocimientos técnicos."
    });
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [comentario, setComentario] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const steps = [
        { id: 0, name: "Inicio", icon: Rocket },
        { id: 1, name: "Propósito", icon: Target },
        { id: 2, name: "Problema", icon: FileText },
        { id: 3, name: "Investigación", icon: Search },
        { id: 4, name: "Módulos", icon: Layers },
        { id: 5, name: "Práctica", icon: PenTool },
        { id: 6, name: "Entregables", icon: FileCheck },
        { id: 7, name: "Finalizar", icon: Trophy },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await studentApi.getPimTemplate(levelId);
                if (result) {
                    let modulos = typeof result.modulos === 'string' ? JSON.parse(result.modulos) : (result.modulos || []);
                    modulos = modulos.map((m: any) => ({
                        ...m,
                        titulo: m.titulo || m.nombreModulo || "Módulo Sin Título"
                    }));
                    setData({ ...result, modulos });
                }
            } catch (error) {
                console.error("Error fetching PIM template:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [levelId]);

    const updateAvatar = (step: number) => {
        const messages = [
            "Este es el gran desafío final de tu nivel. ¡Vamos a revisarlo!",
            "Es importante entender qué impacto generará tu solución técnica.",
            "Analiza bien el contexto. Un buen ingeniero entiende el problema antes de programar.",
            "La investigación es la base de la innovación. Mira estos puntos clave.",
            "Aquí están los bloques técnicos que componen tu proyecto modular.",
            "¡Manos a la obra! Estos retos te prepararán para el éxito.",
            "Asegúrate de tener todo listo para tu entrega oficial.",
            "¡Excelente revisión! Estás listo para conquistar este PIM."
        ];

        setAvatarState({
            isVisible: true,
            emotion: step > 5 ? 'celebrating' : step > 2 ? 'happy' : 'thinking',
            message: messages[step] || "Sigamos adelante con el proyecto."
        });
    };

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep(prev => prev + 1);
            updateAvatar(activeStep + 1);
            return true;
        }
        return false;
    };

    const handlePrev = () => {
        if (activeStep > 0) {
            setActiveStep(prev => prev - 1);
            updateAvatar(activeStep - 1);
            return true;
        }
        return false;
    };

    const handleSubmit = async () => {
        if (!file) return;

        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        if (!userData.id) {
            toast.error("Sesión no válida");
            return;
        }

        setUploading(true);
        try {
            const uploadRes = await studentApi.uploadEvidence(file);
            setUploading(false);
            setSubmitting(true);

            await studentApi.submitPimEvidence({
                studentId: userData.id,
                plantillaPimId: data.id,
                archivoUrl: uploadRes.url,
                comentarioEstudiante: comentario
            });

            setSubmitting(false);
            setIsSubmitted(true);
            setIsUploadOpen(false);
            toast.success("¡Entrega enviada con éxito! +500 XP");

            setAvatarState({
                isVisible: true,
                emotion: 'celebrating',
                message: "¡Brillante! Tu PIM ha sido entregado correctamente. ¡Eres una leyenda!"
            });
        } catch (error: any) {
            console.error("Error submitting PIM:", error);
            toast.error("Error al enviar la entrega: " + error.message);
        } finally {
            setUploading(false);
            setSubmitting(false);
        }
    };

    useImperativeHandle(ref, () => ({
        goNext: () => {
            const success = handleNext();
            return { handled: success };
        },
        goPrev: () => {
            const success = handlePrev();
            return { handled: success };
        }
    }));

    if (loading) return (
        <div className="w-full h-full flex items-center justify-center bg-white/50 backdrop-blur-md">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em] animate-pulse">Iniciando PIM OS...</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No se encontró la configuración del PIM para este nivel.</p>
        </div>
    );

    return (
        <div className="w-full h-full max-w-6xl mx-auto flex flex-col relative px-6 overflow-hidden pt-6">
            <div className="flex items-center justify-between mb-10 px-4 relative shrink-0">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-200 -translate-y-1/2 z-0" />
                {steps.map((step, idx) => (
                    <div
                        key={step.id}
                        onClick={() => setActiveStep(idx)}
                        className={cn(
                            "relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer group",
                            activeStep === idx
                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110"
                                : activeStep > idx
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                                    : "bg-white border border-slate-200 text-slate-400 hover:border-indigo-300"
                        )}
                    >
                        {activeStep > idx ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5 transition-transform group-hover:scale-110" />}
                        <div className={cn(
                            "absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest opacity-0 transition-all pointer-events-none whitespace-nowrap",
                            "group-hover:opacity-100 group-hover:-top-10"
                        )}>
                            {step.name}
                        </div>
                    </div>
                ))}
            </div>

            <ScrollArea className="flex-1 w-full h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="pb-32 pt-4"
                    >
                        {activeStep === 0 && (
                            <div className="space-y-8 text-center max-w-3xl mx-auto">
                                <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 mb-4">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Desafío Técnico Integral</span>
                                </div>
                                <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic leading-[0.9]">
                                    {data.tituloProyecto}
                                </h1>
                                <p className="text-xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-indigo-500 pl-8 text-left py-2 mx-auto">
                                    "{data.descripcionGeneral}"
                                </p>
                                <div className="pt-8">
                                    <Button onClick={handleNext} className="h-16 px-12 rounded-[2rem] bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 group">
                                        INICIAR ROADMAP <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-all" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeStep === 1 && (
                            <div className="max-w-4xl mx-auto">
                                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-md">
                                    <CardHeader className="p-12 text-center bg-linear-to-b from-indigo-50/50 to-transparent">
                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                                            <Target className="w-10 h-10 text-indigo-600" />
                                        </div>
                                        <CardTitle className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Propósito y Visión</CardTitle>
                                        <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Impacto y objetivos pedagógicos del proyecto</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-12 pt-0 space-y-10">
                                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <p className="text-lg text-slate-700 font-medium leading-relaxed">
                                                {data.objetivoProyecto}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="text-center">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">El Desafío Real</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Problemática y contexto de aplicación</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Card className="border-none shadow-xl shadow-red-100/30 rounded-[2.5rem] bg-red-50/50 border-t-4 border-red-500">
                                        <CardHeader className="p-8">
                                            <CardTitle className="text-red-600 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> PROBLEMA CENTRAL
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-8 pb-10">
                                            <p className="text-slate-700 font-medium leading-relaxed">{data.problematicaGeneral}</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-none shadow-xl shadow-amber-100/30 rounded-[2.5rem] bg-amber-50/50 border-t-4 border-amber-500">
                                        <CardHeader className="p-8">
                                            <CardTitle className="text-amber-600 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500" /> CONTEXTO DE USO
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-8 pb-10">
                                            <p className="text-slate-700 font-medium leading-relaxed">{data.contextoProblema}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeStep >= 3 && activeStep <= 6 && (
                            <div className="space-y-10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{steps[activeStep].name}</h2>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Guía técnica detallada por módulos</p>
                                    </div>
                                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                        {data.modulos.map((_: any, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveModuleIdx(idx)}
                                                className={cn(
                                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    activeModuleIdx === idx ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                M{idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.div
                                    key={activeModuleIdx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="grid grid-cols-1 gap-8"
                                >
                                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white">
                                        <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/30">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                                    <span className="text-white font-black italic">M{activeModuleIdx + 1}</span>
                                                </div>
                                                <div>
                                                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
                                                        {data.modulos[activeModuleIdx].titulo}
                                                    </CardTitle>
                                                    <CardDescription className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mt-1">
                                                        Enfoque: {data.modulos[activeModuleIdx].enfoqueTecnico}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-12 space-y-12">
                                            {activeStep === 3 && (
                                                <div className="space-y-6">
                                                    <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center"><Search className="w-4 h-4" /></div>
                                                        Líneas de exploración
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {data.modulos[activeModuleIdx].actividadesInvestigacion?.map((item: string, i: number) => (
                                                            <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group">
                                                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                                                    {i + 1}
                                                                </div>
                                                                <p className="text-slate-700 font-bold text-sm tracking-tight">{item}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {activeStep === 4 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    <div className="space-y-4">
                                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-500" /> ENFOQUE TÉCNICO
                                                        </h4>
                                                        <p className="text-lg text-slate-800 font-medium leading-relaxed bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 italic">
                                                            {data.modulos[activeModuleIdx].enfoqueTecnico}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-amber-500" /> RETO TÉCNICO ESPECÍFICO
                                                        </h4>
                                                        <p className="text-lg text-slate-800 font-medium leading-relaxed bg-amber-50 p-8 rounded-[2rem] border border-amber-100 italic">
                                                            {data.modulos[activeModuleIdx].problemaTecnico}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {activeStep === 5 && (
                                                <div className="space-y-12">
                                                    <div className="space-y-6">
                                                        <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center"><PenTool className="w-4 h-4" /></div>
                                                            Ruta de Desarrollo Guiada
                                                        </h4>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {data.modulos[activeModuleIdx].actividadesPractica?.map((item: string, i: number) => (
                                                                <div key={i} className="flex gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-emerald-50/30 transition-all group">
                                                                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                                    </div>
                                                                    <p className="text-slate-700 font-bold text-base leading-snug">{item}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-linear-to-br from-indigo-600/20 to-transparent opacity-50" />
                                                        <h4 className="relative z-10 text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                            <Sparkles className="w-4 h-4" /> Laboratorio Aplicado
                                                        </h4>
                                                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {data.modulos[activeModuleIdx].ejerciciosPracticos?.map((item: string, i: number) => (
                                                                <div key={i} className="flex items-start gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                                                                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0 animate-pulse" />
                                                                    <p className="text-slate-300 font-medium text-sm leading-relaxed">{item}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeStep === 6 && (
                                                <div className="space-y-8">
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><FileCheck className="w-4 h-4" /></div>
                                                        Requisitos de Entrega
                                                    </h4>
                                                    <div className="flex flex-wrap gap-4">
                                                        {data.modulos[activeModuleIdx].formatoSugerido?.map((item: string, i: number) => (
                                                            <Badge key={i} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 border-none">
                                                                <FileText className="w-4 h-4 mr-2" /> {item}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        )}

                        {activeStep === 7 && (
                            <div className="max-w-4xl mx-auto space-y-8">
                                <Card className="border-none shadow-2xl shadow-indigo-100 rounded-[3rem] bg-indigo-600 text-white overflow-hidden text-center p-16 relative group">
                                    <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl"
                                    >
                                        <Trophy className="w-12 h-12 text-white" />
                                    </motion.div>
                                    <h2 className="text-5xl font-black italic tracking-tighter leading-none mb-4">¡ROADMAP COMPLETADO!</h2>
                                    <p className="text-white/80 font-medium text-lg max-w-xl mx-auto mb-10">
                                        Has revisado toda la arquitectura técnica de tu PIM. Ahora es el momento de construir algo legendario.
                                    </p>
                                    <div className="flex flex-col gap-4 max-w-sm mx-auto">
                                        {!isSubmitted ? (
                                            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                                                <DialogTrigger asChild>
                                                    <Button className="h-16 bg-white text-indigo-600 hover:bg-slate-100 font-black uppercase tracking-widest text-xs rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95">
                                                        REALIZAR ENTREGA <Rocket className="ml-3 w-5 h-5" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md bg-white rounded-[2rem] border-none shadow-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tight text-slate-900">
                                                            Subir Evidencia
                                                        </DialogTitle>
                                                        <DialogDescription className="text-slate-500 font-medium">
                                                            Sube tu proyecto final en formato PDF o imagen (Máx 10MB).
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-6 py-4">
                                                        <div
                                                            className={cn(
                                                                "border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer group",
                                                                file ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 hover:border-indigo-400 bg-slate-50"
                                                            )}
                                                            onClick={() => document.getElementById('pim-file-upload')?.click()}
                                                        >
                                                            <input
                                                                id="pim-file-upload"
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                            />
                                                            {file ? (
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <FileCheck className="w-12 h-12 text-emerald-500" />
                                                                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{file.name}</p>
                                                                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 mt-2">
                                                                        <X className="w-3 h-3" /> Quitar archivo
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-4">
                                                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                        <Upload className="w-8 h-8 text-indigo-500" />
                                                                    </div>
                                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Haz clic para buscar</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Comentario (opcional)</label>
                                                            <Textarea
                                                                placeholder="Cuéntanos un poco sobre tu entrega..."
                                                                value={comentario}
                                                                onChange={(e) => setComentario(e.target.value)}
                                                                className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-sm font-medium resize-none"
                                                                rows={3}
                                                            />
                                                        </div>

                                                        <Button
                                                            onClick={handleSubmit}
                                                            disabled={!file || submitting || uploading}
                                                            className="w-full h-14 bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-full shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all"
                                                        >
                                                            {(submitting || uploading) ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {uploading ? "SUBIENDO..." : "REGISTRANDO..."}
                                                                </>
                                                            ) : (
                                                                <>ENVIAR PROYECTO <Sparkles className="ml-2 w-4 h-4" /></>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <div className="bg-emerald-500/20 backdrop-blur-md rounded-full px-8 py-4 flex items-center gap-3 border border-emerald-500/30 mx-auto">
                                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                                                <span className="font-black uppercase tracking-widest text-xs text-emerald-50">ENTREGA REALIZADA CON ÉXITO</span>
                                            </div>
                                        )}
                                        <Button variant="ghost" onClick={() => setActiveStep(0)} className="text-white/60 hover:text-white font-black uppercase tracking-widest text-[9px]">
                                            VOLVER AL INICIO
                                        </Button>
                                    </div>
                                </Card>

                                <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                        <Layout className="w-4 h-4" /> Aporte Técnico Esperado
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {data.modulos.map((m: any, idx: number) => (
                                            <div key={idx} className="space-y-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                <p className="text-[10px] font-black text-indigo-500 uppercase">{m.titulo}</p>
                                                {m.aporteTecnico?.map((ap: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                        <p className="text-slate-600 text-sm font-bold tracking-tight">{ap}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </ScrollArea>

            <div className="fixed bottom-6 right-6 z-50 pointer-events-none transition-all duration-700">
                <div className="pointer-events-auto transform hover:scale-105 transition-transform">
                    <AvatarGuide emotion={avatarState.emotion} message={avatarState.message} />
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/60 backdrop-blur-xl border border-white/50 px-8 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={activeStep === 0}
                    onClick={handlePrev}
                    className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex gap-2">
                    {steps.map((_, i) => (
                        <div key={i} className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all duration-500",
                            activeStep === i ? "bg-indigo-600 w-6" : "bg-slate-200"
                        )} />
                    ))}
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={activeStep === steps.length - 1}
                    onClick={handleNext}
                    className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
});

export default PimViewer;

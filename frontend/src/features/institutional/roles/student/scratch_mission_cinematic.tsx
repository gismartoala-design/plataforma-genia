import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, ChevronRight, ChevronLeft, Target, 
    Volume2, VolumeX, Play, Pause, 
    Trophy, Clock, Activity, Rocket,
    ArrowRight, Sparkles, CheckCircle2,
    MessageSquare, Cpu, Box, XCircle,
    UploadCloud, FileText, ListVideo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MissionCinematicViewerProps {
    module: any;
    onClose: () => void;
    isReadOnly?: boolean;
}

export const MissionCinematicViewer = ({ module, onClose, isReadOnly = false }: MissionCinematicViewerProps) => {
    const [currentMomentIdx, setCurrentMomentIdx] = useState(0);
    const [isNarrating, setIsNarrating] = useState(!isReadOnly);
    const [showMomentIntro, setShowMomentIntro] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState<any>(null);
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    
    const synth = window.speechSynthesis;
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const parsed = React.useMemo(() => {
        try {
            const raw = typeof module.contenido === 'string' ? JSON.parse(module.contenido) : module.contenido;
            return {
                ...raw,
                moments: (raw.moments || []).filter((m: any) => m.isVisible !== false)
            };
        } catch { return { moments: [], mission: {} }; }
    }, [module]);

    const moments = parsed.moments || [];
    const missionInfo = parsed.mission || {};
    const currentMoment = moments[currentMomentIdx];
    const progress = ((currentMomentIdx + 1) / moments.length) * 100;

    // Responsive sizing helpers
    const getCardRadius = () => "rounded-[2rem] sm:rounded-[3rem]";
    const getPadding = () => "p-6 sm:p-10 lg:p-12";

    useEffect(() => {
        setSelectedOpt(null);
    }, [currentMomentIdx]);

    const speak = (text: string) => {
        if (!isNarrating || !synth || isReadOnly) return;
        try {
            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 1.0;
            utterance.pitch = 1.1;
            utteranceRef.current = utterance;
            synth.speak(utterance);
        } catch (error) { console.error("Speech Error:", error); }
    };

    useEffect(() => {
        if (!currentMoment) return;
        
        let textToSpeak = currentMoment.title + ". ";
        
        if (currentMoment.blocks && currentMoment.blocks.length > 0) {
            const studentBlocks = currentMoment.blocks.filter((b: any) => b.visibleToStudent && (b.type.startsWith('student_') || b.type.startsWith('interaction_')));
            textToSpeak += studentBlocks.map((b: any) => b.content?.text || b.content?.question || b.content?.instruction || "").join(". ");
        } else {
            const studentData = currentMoment.student || {};
            textToSpeak += studentData.content || studentData.question || studentData.instruction || "";
        }

        if (textToSpeak.trim() && showMomentIntro) {
            speak(textToSpeak);
        }
        return () => synth?.cancel();
    }, [currentMoment, showMomentIntro, isNarrating]);

    const handleNext = () => {
        if (currentMomentIdx < moments.length - 1) {
            setCurrentMomentIdx(prev => prev + 1);
            setShowMomentIntro(true);
        } else if (!isReadOnly) {
            setIsCompleted(true);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        setCurrentMomentIdx(prev => Math.max(0, prev - 1));
        setShowMomentIntro(true);
    };

    const jumpToMoment = (idx: number) => {
        setCurrentMomentIdx(idx);
        setShowMomentIntro(true);
    };

    if (moments.length === 0) return null;

    if (isCompleted) {
        return (
            <div className="fixed inset-0 z-[600] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden font-sans text-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]" />
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 text-center space-y-8 max-w-2xl"
                >
                    <div className="w-32 h-32 sm:w-48 sm:h-48 bg-blue-600 rounded-[3rem] rotate-12 flex items-center justify-center mx-auto shadow-[0_20px_60px_rgba(37,99,235,0.3)] border-4 border-white">
                        <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-white -rotate-12" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none text-slate-900">Misión <br/><span className="text-blue-600">Completada</span></h2>
                        <p className="text-slate-500 text-base sm:text-xl font-bold tracking-tight px-4">{missionInfo?.title}</p>
                    </div>
                    <Button onClick={onClose} className="w-full h-16 sm:h-20 bg-blue-600 text-white hover:bg-blue-700 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs shadow-2xl transition-transform active:scale-95">
                        REGRESAR A LA PLATAFORMA
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[600] bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans selection:bg-blue-200 selection:text-blue-900">
            {/* Spotify-style Tracklist Sidebar */}
            <motion.nav
                onHoverStart={() => setIsSidebarHovered(true)}
                onHoverEnd={() => setIsSidebarHovered(false)}
                initial={{ width: 90 }}
                animate={{ width: isSidebarHovered ? 340 : 90 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative z-50 h-full bg-white border-r border-slate-200 shadow-[20px_0_40px_rgba(0,0,0,0.03)] flex flex-col shrink-0 overflow-hidden"
            >
                <div className="h-[104px] flex items-center px-6 border-b border-slate-100 shrink-0 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <ListVideo className="w-5 h-5" />
                    </div>
                    <AnimatePresence>
                        {isSidebarHovered && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                className="ml-4 whitespace-nowrap min-w-0 flex-1 pr-4"
                            >
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 truncate">Fases de la Misión</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tracklist Activo</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-3 custom-scrollbar">
                    {moments.map((m: any, idx: number) => {
                        const isActive = idx === currentMomentIdx;
                        const isPast = idx < currentMomentIdx;
                        return (
                            <button
                                key={m.id || idx}
                                onClick={() => jumpToMoment(idx)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-3 rounded-2xl transition-all border",
                                    isActive ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : 
                                    "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-500",
                                    isPast && !isActive && "opacity-70"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-[10px] transition-colors",
                                    isActive ? "bg-white/20 text-white" : "bg-slate-100 border border-slate-200 text-slate-600 shadow-sm group-hover:bg-blue-50"
                                )}>
                                    {isPast && !isActive ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : (idx + 1)}
                                </div>
                                <AnimatePresence>
                                    {isSidebarHovered && (
                                        <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="text-left min-w-0"
                                        >
                                            <p className={cn("text-[11px] font-bold truncate tracking-tight uppercase", isActive ? "text-white" : "text-slate-700")}>{m.title}</p>
                                            <p className={cn("text-[9px] uppercase tracking-[0.2em] mt-1", isActive ? "text-blue-200" : "text-slate-400")}>Fase {idx + 1}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        );
                    })}
                </div>
            </motion.nav>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative bg-slate-50/50">
                {/* --- HEADER --- */}
                <header className="relative z-40 px-6 sm:px-12 pt-8 sm:pt-10 pb-6 flex flex-col gap-6 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-5">
                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-2xl sm:rounded-[1.5rem] border border-slate-200 flex items-center justify-center shadow-sm">
                                <Target className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600 animate-pulse" />
                            </div>
                            <div className="max-w-[200px] sm:max-w-md">
                                <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-blue-600 italic truncate">{missionInfo?.title || "Misión Activa"}</h2>
                                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 italic mt-1">Sincronización {currentMomentIdx + 1} / {moments.length}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {isReadOnly && (
                                <Badge className="hidden sm:flex bg-amber-100 text-amber-600 hover:bg-amber-100 border-amber-200 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest">
                                    VISTA PREVIA DOCENTE
                                </Badge>
                            )}
                            {!isReadOnly && (
                                <Button 
                                    variant="ghost" size="icon" 
                                    onClick={() => setIsNarrating(!isNarrating)}
                                    className={cn("w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-[1.5rem] border transition-all", isNarrating ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-400")}
                                >
                                    {isNarrating ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                </Button>
                            )}
                            <Button 
                                variant="ghost" size="icon" onClick={onClose}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-[1.5rem] bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 text-slate-400 group shadow-sm transition-all"
                            >
                                <X className="w-5 h-5 sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* --- MAIN CINEMATIC CORE --- */}
                <main className="flex-1 relative z-20 flex flex-col p-6 sm:p-12 lg:p-16 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.03)_0%,transparent_50%)]" />
                        <div className="absolute inset-0 construction-grid opacity-[0.03]" />
                    </div>

                    <AnimatePresence mode="wait">
                        {showMomentIntro ? (
                            <motion.div 
                                key={`intro-${currentMoment.id}`}
                                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                                className="w-full max-w-5xl text-center space-y-12 mx-auto my-auto py-20"
                            >
                                <div className="space-y-6">
                                    <motion.div 
                                        animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                        className="w-24 h-24 sm:w-40 sm:h-40 rounded-[2.5rem] sm:rounded-[4rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(99,102,241,0.15)] mb-8 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                                        <Sparkles className="w-10 h-10 sm:w-16 sm:h-16 text-indigo-500 relative z-10" />
                                    </motion.div>
                                    <motion.h1 
                                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                        className="text-3xl sm:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none text-slate-800 px-4"
                                    >
                                        {currentMoment?.title}
                                    </motion.h1>
                                    <p className="text-xs sm:text-sm text-blue-600 font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] animate-pulse">Iniciando Protocolo de Aprendizaje</p>
                                </div>

                                <Button 
                                    onClick={() => setShowMomentIntro(false)}
                                    className="h-16 sm:h-20 px-12 sm:px-20 bg-slate-900 border-2 border-slate-900 hover:bg-white hover:text-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                                >
                                    <span className="flex items-center gap-4">ACCEDER A LA FASE <ArrowRight className="w-6 h-6 sm:translate-x-0 group-hover:translate-x-2 transition-transform" /></span>
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key={`content-${currentMoment.id}`}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 h-full min-h-0 items-start xl:items-stretch"
                            >
                                {/* NARRATION WING (Left Side) - Flexible Height */}
                                <div className="flex flex-col gap-6 sm:gap-8 pt-4 xl:pt-8 w-full">
                                    <div className="space-y-4">
                                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none px-5 sm:px-6 py-2 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] w-fit shadow-sm">
                                            DOCUMENTACIÓN FASE {currentMomentIdx + 1}
                                        </Badge>
                                        <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black italic tracking-tighter leading-[1] uppercase text-slate-800">
                                            {currentMoment?.title}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex-1 w-full space-y-4 sm:space-y-6">
                                        {currentMoment.blocks && currentMoment.blocks.length > 0 ? (
                                            currentMoment.blocks
                                                .filter((b: any) => b.visibleToStudent && (b.type.startsWith('student_') || b.type === 'teacher_script'))
                                                .map((block: any) => (
                                                    <div key={block.id} className={cn("relative p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md")}>
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                                                        <p className="text-base sm:text-xl font-medium text-slate-700 leading-relaxed italic tracking-tight whitespace-pre-wrap">
                                                            {block.content?.text || block.content?.content || "Cargando protocolo..."}
                                                        </p>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className={cn("relative p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm overflow-hidden")}>
                                                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                                                <p className="text-base sm:text-xl md:text-2xl font-medium text-slate-700 leading-relaxed italic tracking-tight whitespace-pre-wrap">
                                                    "{currentMoment?.student?.content || currentMoment?.student?.question || currentMoment?.student?.instruction || "Recibiendo datos..."}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {!isReadOnly && (
                                        <Button 
                                            onClick={() => {
                                                const text = currentMoment.blocks?.length 
                                                    ? currentMoment.blocks.filter((b:any) => b.visibleToStudent).map((b:any) => b.content?.text || "").join(". ")
                                                    : (currentMoment?.student?.content || "");
                                                speak(text);
                                            }}
                                            variant="ghost" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 gap-3 font-black uppercase tracking-[0.4em] text-[10px] w-fit mx-auto xl:mx-0 transition-all rounded-xl mt-4"
                                        >
                                            <Volume2 className="w-4 h-4" /> REINICIAR NARRACIÓN
                                        </Button>
                                    )}
                                </div>

                                {/* INTERACTIVE WING (Right Side) */}
                                <div className={cn("p-6 sm:p-10 bg-white border border-slate-200 shadow-xl flex flex-col xl:my-auto relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] mt-4 xl:mt-0")}>
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.02)_0%,transparent_100%)] pointer-events-none" />
                                    
                                    {(() => {
                                        let interactionBlock = currentMoment.blocks?.find((b: any) => b.type.startsWith('interaction_'));
                                        let interactionType = interactionBlock?.type || currentMoment?.config?.interaction_type;
                                        let content = interactionBlock?.content || currentMoment?.student;

                                        if (interactionType === 'interaction_choice' || interactionType === 'multiple_choice') {
                                            const options = content.options || [];
                                            return (
                                                <div className="w-full space-y-6 sm:space-y-8 relative z-10 my-auto">
                                                    <div className="text-center mb-6 sm:mb-8">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-2 italic">Análisis de Datos</p>
                                                        <h4 className="text-xl sm:text-2xl font-black italic uppercase text-slate-800">{content.question || "Selecciona tu Respuesta"}</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-3 sm:gap-4 text-left">
                                                        {options.map((opt: any, i: number) => (
                                                            <button 
                                                                key={i} disabled={isReadOnly}
                                                                onClick={() => !isReadOnly && setSelectedOpt(i)}
                                                                className={cn(
                                                                    "w-full p-4 sm:p-5 lg:p-6 text-sm flex items-center gap-4 sm:gap-5 group",
                                                                    "rounded-[1.5rem] border-2 text-left transition-all font-bold",
                                                                    selectedOpt === i ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20" : "bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-300 text-slate-700",
                                                                    isReadOnly && "cursor-default"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-xs sm:text-sm transition-all shadow-sm",
                                                                    selectedOpt === i ? "bg-white text-blue-600" : "bg-white text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 border border-slate-100"
                                                                )}>
                                                                    {String.fromCharCode(65 + i)}
                                                                </div>
                                                                <span className="leading-snug">{opt?.text || opt}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (interactionType === 'interaction_truefalse' || interactionType === 'true_false') {
                                            return (
                                                <div className="w-full space-y-10 sm:space-y-12 relative z-10 my-auto">
                                                    <div className="text-center px-4 sm:px-6">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-500 mb-4 italic">Verificación de Integridad</p>
                                                        <h4 className="text-xl sm:text-3xl font-black italic uppercase mb-8 text-slate-800 leading-tight">{content.statement || "¿Es verdadera esta afirmación?"}</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl mx-auto">
                                                        <button 
                                                            onClick={() => !isReadOnly && setSelectedOpt(true)} disabled={isReadOnly}
                                                            className={cn(
                                                                "p-8 sm:p-14 rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 sm:gap-6 group",
                                                                selectedOpt === true ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/30" : "bg-slate-50 border-slate-100 hover:bg-white hover:border-emerald-300 text-slate-500"
                                                            )}
                                                        >
                                                            <CheckCircle2 className={cn("w-12 h-12 sm:w-14 sm:h-14", selectedOpt === true ? "text-white" : "text-emerald-500 group-hover:scale-110 transition-transform")} />
                                                            <span className="font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs">CERTEZA</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => !isReadOnly && setSelectedOpt(false)} disabled={isReadOnly}
                                                            className={cn(
                                                                "p-8 sm:p-14 rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 sm:gap-6 group",
                                                                selectedOpt === false ? "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/30" : "bg-slate-50 border-slate-100 hover:bg-white hover:border-rose-300 text-slate-500"
                                                            )}
                                                        >
                                                            <XCircle className={cn("w-12 h-12 sm:w-14 sm:h-14", selectedOpt === false ? "text-white" : "text-rose-500 group-hover:scale-110 transition-transform")} />
                                                            <span className="font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs">DISCREPANCIA</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (interactionType === 'interaction_open') {
                                            return (
                                                <div className="w-full space-y-6 relative z-10 flex flex-col min-h-[300px] h-full my-auto">
                                                    <div className="text-center mb-2 shrink-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-2 italic">Ingreso de Datos</p>
                                                        <h4 className="text-xl sm:text-2xl font-black italic uppercase text-slate-800">{content.question || "Responde a la pregunta"}</h4>
                                                    </div>
                                                    <div className="flex-1 w-full flex">
                                                        <textarea 
                                                            disabled={isReadOnly}
                                                            placeholder={content.placeholder_hint || "Escribe tu respuesta aquí..."}
                                                            className="w-full h-full min-h-[150px] p-5 sm:p-6 text-sm sm:text-base font-medium rounded-[1.5rem] border-2 border-slate-200 bg-slate-50 focus:bg-white resize-none text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all shadow-inner custom-scrollbar"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (interactionType === 'interaction_upload') {
                                            return (
                                                <div className="w-full space-y-6 sm:space-y-8 relative z-10 flex flex-col items-center justify-center py-6 sm:py-10 my-auto">
                                                    <div className="text-center px-4">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-pink-500 mb-2 italic">Carga de Evidencia</p>
                                                        <h4 className="text-xl sm:text-2xl font-black italic uppercase text-slate-800 mt-2">{content.instruction || "Sube tu archivo"}</h4>
                                                        {content.format_hint && <p className="text-xs sm:text-sm font-bold text-slate-400 mt-2">{content.format_hint}</p>}
                                                    </div>
                                                    <div className="w-full max-w-sm border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-white rounded-[2rem] p-8 sm:p-12 flex flex-col items-center justify-center gap-4 sm:gap-6 cursor-pointer hover:border-pink-400 hover:shadow-lg transition-all text-slate-500 hover:text-pink-600 mx-auto">
                                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
                                                            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
                                                        </div>
                                                        <span className="font-bold text-xs sm:text-sm text-center">Haz clic para buscar el archivo</span>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Default Fallback / Activity Block
                                        const activityBlock = currentMoment.blocks?.find((b: any) => b.type === 'student_activity');
                                        const instruction = activityBlock?.content?.text || currentMoment?.student?.activity || currentMoment?.student?.instruction || "Continúa con la siguiente fase de tu aprendizaje.";

                                        return (
                                            <div className="text-center space-y-8 sm:space-y-10 relative z-10 my-auto py-8">
                                                <div className="relative w-fit mx-auto">
                                                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} className="w-24 h-24 sm:w-40 sm:h-40 rounded-[2rem] sm:rounded-[3rem] bg-indigo-50 border border-indigo-100 shadow-md flex items-center justify-center">
                                                        <Box className="w-12 h-12 sm:w-20 sm:h-20 text-indigo-400" />
                                                    </motion.div>
                                                    <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white border border-slate-200 shadow-md rounded-xl sm:rounded-2xl flex items-center justify-center animate-bounce">
                                                        <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3 sm:space-y-4 px-4 sm:px-10">
                                                    <h4 className="text-xl sm:text-2xl font-black italic uppercase text-slate-800">Fase de Aplicación</h4>
                                                    <p className="text-sm sm:text-lg font-bold text-slate-500 leading-relaxed italic whitespace-pre-wrap">"{instruction}"</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* --- PREMIUM HUD FOOTER --- */}
                <footer className="relative z-50 px-6 sm:px-12 py-5 sm:py-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                    <div className="hidden sm:flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-left min-w-[200px]">
                                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1.5 flex justify-between">
                                    <span>Progreso General</span>
                                    <span className="text-blue-600">{Math.round(progress)}%</span>
                                </p>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div animate={{ width: `${progress}%` }} className="h-full bg-blue-600 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="outline" onClick={handlePrev} disabled={currentMomentIdx === 0} className="flex-1 sm:flex-none h-12 sm:h-14 px-6 rounded-2xl border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-white font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" /> Atrás
                        </Button>
                        <Button 
                            onClick={handleNext}
                            className="flex-[2] sm:flex-none h-12 sm:h-14 px-8 sm:px-12 bg-slate-900 border-2 border-slate-900 hover:bg-white hover:text-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs gap-3 shadow-xl active:scale-95 transition-all group"
                        >
                            {currentMomentIdx === moments.length - 1 ? (isReadOnly ? "SALIR VISTA PREVIA" : "FINALIZAR MISIÓN") : "SIGUIENTE FASE"} 
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </footer>
            </div>

            <style>{`
                .construction-grid {
                    background-image: 
                        linear-gradient(rgba(37, 99, 235, 1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(37, 99, 235, 1) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }
            `}</style>
        </div>
    );
};

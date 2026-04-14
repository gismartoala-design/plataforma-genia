import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, ChevronRight, ChevronLeft, Target, 
    Volume2, VolumeX, Play, Pause, 
    Trophy, Clock, Activity, Rocket,
    ArrowRight, Sparkles, CheckCircle2,
    MessageSquare, Cpu, Box, XCircle,
    UploadCloud, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    const getCardRadius = () => "rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem]";
    const getPadding = () => "p-6 sm:p-10 lg:p-16";

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
        if (currentMoment && showMomentIntro) {
            const studentData = currentMoment.student || {};
            const textToSpeak = `${currentMoment.title}. ${studentData.content || studentData.question || studentData.instruction || ""}`;
            if (textToSpeak.trim()) speak(textToSpeak);
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

    if (moments.length === 0) return null;

    if (isCompleted) {
        return (
            <div className="fixed inset-0 z-[600] bg-slate-900 flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden font-sans text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_70%)]" />
                <div className="absolute inset-0 overflow-hidden opacity-30">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -1000],
                                x: [Math.random() * 1000, Math.random() * 1000],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear" }}
                            className="absolute w-1 h-1 bg-blue-400 rounded-full"
                            style={{ left: `${Math.random() * 100}%`, top: '100%' }}
                        />
                    ))}
                </div>

                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 text-center space-y-8 max-w-2xl"
                >
                    <div className="w-32 h-32 sm:w-48 sm:h-48 bg-blue-600 rounded-[3rem] rotate-12 flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(37,99,235,0.4)] border-4 border-white/20">
                        <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-white -rotate-12" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none">Misión <br/><span className="text-blue-500">Completada</span></h2>
                        <p className="text-slate-400 text-base sm:text-xl font-medium tracking-tight px-4">{missionInfo?.title}</p>
                    </div>
                    <Button onClick={onClose} className="w-full h-16 sm:h-20 bg-blue-600 text-white hover:bg-blue-700 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs shadow-2xl transition-transform active:scale-95">
                        DESACTIVAR ENLACE NEURONAL
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[600] bg-slate-950 text-white flex flex-col overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
            {/* --- IMMERSIVE BACKGROUND --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2)_0%,transparent_100%)]" />
                <div className="absolute inset-0 construction-grid opacity-10" />
                
                {/* Neural Particles */}
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.3, 0.1],
                            x: [0, Math.random() * 50 - 25, 0],
                            y: [0, Math.random() * 50 - 25, 0]
                        }}
                        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity }}
                        className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
                        style={{ 
                            left: `${Math.random() * 100}%`, 
                            top: `${Math.random() * 100}%`,
                            background: i % 2 === 0 ? 'rgba(37,99,235,0.08)' : 'rgba(147,51,234,0.05)'
                        }}
                    />
                ))}
            </div>
            
            {/* --- PREMIUM HUD HEADER --- */}
            <header className="relative z-50 px-6 sm:px-12 pt-8 sm:pt-12 pb-6 flex flex-col gap-6 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-5">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-[1.5rem] border border-white/10 flex items-center justify-center shadow-2xl">
                            <Target className="w-5 h-5 sm:w-7 sm:h-7 text-blue-400 animate-pulse" />
                        </div>
                        <div className="max-w-[150px] sm:max-w-md">
                            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-blue-400 italic truncate">{missionInfo?.title || "PROTOCOLO GENIA"}</h2>
                            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 italic mt-1">Sincronización {currentMomentIdx + 1} / {moments.length}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {isReadOnly && (
                            <Badge className="hidden sm:flex bg-amber-500/10 text-amber-500 border-amber-500/30 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest animate-pulse mr-4">
                                VISTA PREVIA DOCENTE
                            </Badge>
                        )}
                        {!isReadOnly && (
                            <Button 
                                variant="ghost" size="icon" 
                                onClick={() => setIsNarrating(!isNarrating)}
                                className={cn("w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-[1.5rem] border border-white/10 transition-all", isNarrating ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-slate-500")}
                            >
                                {isNarrating ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </Button>
                        )}
                        <Button 
                            variant="ghost" size="icon" onClick={onClose}
                            className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 group"
                        >
                            <X className="w-5 h-5 sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform" />
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2 w-full h-1.5 sm:h-2 px-2">
                    {moments.map((_: any, idx: number) => (
                        <div key={idx} className="flex-1 h-full rounded-full overflow-hidden bg-white/5 border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: idx <= currentMomentIdx ? '100%' : '0%' }}
                                className={cn("h-full", idx === currentMomentIdx ? "bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(37,99,235,0.6)]" : "bg-blue-900/40")}
                            />
                        </div>
                    ))}
                </div>
            </header>

            {/* --- MAIN CINEMATIC CORE --- */}
            <main className="flex-1 relative z-20 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {showMomentIntro ? (
                        <motion.div 
                            key={`intro-${currentMoment.id}`}
                            initial={{ opacity: 0, scale: 0.95, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                            className="w-full max-w-5xl text-center space-y-12"
                        >
                            <div className="space-y-6">
                                <motion.div 
                                    animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 sm:w-40 sm:h-40 rounded-[2.5rem] sm:rounded-[4rem] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto shadow-[0_0_100px_rgba(37,99,235,0.1)] mb-8"
                                >
                                    <Sparkles className="w-10 h-10 sm:w-16 sm:h-16 text-blue-500" />
                                </motion.div>
                                <motion.h1 
                                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                    className="text-4xl sm:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none"
                                >
                                    {currentMoment?.title}
                                </motion.h1>
                                <p className="text-xs sm:text-base text-blue-400/80 font-black uppercase tracking-[0.5em] animate-pulse">Iniciando Protocolo de Aprendizaje</p>
                            </div>

                            <Button 
                                onClick={() => setShowMomentIntro(false)}
                                className="h-20 sm:h-24 px-12 sm:px-20 bg-blue-600 text-white hover:bg-blue-700 rounded-[2rem] sm:rounded-[3rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                            >
                                <span className="flex items-center gap-4">ACCEDER <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></span>
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={`content-${currentMoment.id}`}
                            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                            className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-2 gap-10 sm:gap-20 items-center"
                        >
                            {/* NARRATION WING */}
                            <div className="space-y-8 text-center xl:text-left">
                                <div className="space-y-4">
                                    <Badge className="bg-blue-600 text-white border-none px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.3em]">ENLACE ACTIVO</Badge>
                                    <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black italic tracking-tighter leading-[0.9] uppercase text-white/90">
                                        {currentMoment?.student?.concept || "Transmisión de Conocimiento"}
                                    </h3>
                                </div>
                                <div className={cn("relative group transition-transform hover:scale-[1.02]", getPadding(), getCardRadius(), "bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden")}>
                                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
                                    <p className="text-xl sm:text-3xl font-medium text-slate-200 leading-relaxed italic tracking-tight">
                                        "{currentMoment?.student?.content || currentMoment?.student?.question || currentMoment?.student?.instruction || "Recibiendo datos..."}"
                                    </p>
                                </div>
                                {!isReadOnly && (
                                    <Button 
                                        onClick={() => speak(currentMoment?.student?.content || currentMoment?.student?.question || currentMoment?.student?.instruction || "")}
                                        variant="ghost" className="text-slate-500 hover:text-blue-400 gap-3 font-black uppercase tracking-[0.4em] text-[10px]"
                                    >
                                        <Volume2 className="w-4 h-4" /> REINICIAR NARRACIÓN
                                    </Button>
                                )}
                            </div>

                            {/* INTERACTIVE WING */}
                            <div className={cn(getPadding(), getCardRadius(), "bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center min-h-[400px] sm:min-h-[550px] relative overflow-hidden")}>
                                <div className="absolute inset-0 construction-grid opacity-5 pointer-events-none" />
                                
                                {currentMoment?.config?.interaction_type === 'multiple_choice' ? (
                                    <div className="w-full space-y-6">
                                        <div className="text-center mb-8">
                                            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-2 italic">Análisis de Datos</p>
                                            <h4 className="text-xl sm:text-2xl font-black italic uppercase text-white">Selecciona tu Respuesta</h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentMoment?.student?.options?.map((opt: any, i: number) => (
                                                <button 
                                                    key={i} disabled={isReadOnly}
                                                    onClick={() => !isReadOnly && setSelectedOpt(i)}
                                                    className={cn(
                                                        "w-full p-5 sm:p-7 rounded-[1.5rem] border-2 text-left transition-all flex items-center gap-5 group",
                                                        selectedOpt === i ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/20" : "bg-white/5 border-white/5 hover:border-blue-500/50 text-slate-300",
                                                        isReadOnly && "cursor-default"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black transition-all",
                                                        selectedOpt === i ? "bg-white text-blue-600" : "bg-white/10 text-white/40 group-hover:bg-blue-500 group-hover:text-white"
                                                    )}>
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                    <span className="text-sm sm:text-lg font-bold">{opt?.text || opt}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : currentMoment?.config?.interaction_type === 'true_false' ? (
                                    <div className="w-full space-y-12">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-cyan-400 mb-2 italic">Verificación de Integridad</p>
                                            <h4 className="text-2xl sm:text-4xl font-black italic uppercase">¿Verdad o <span className="text-rose-500">Error</span>?</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <button 
                                                onClick={() => !isReadOnly && setSelectedOpt(true)} disabled={isReadOnly}
                                                className={cn(
                                                    "p-10 sm:p-14 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-6 group",
                                                    selectedOpt === true ? "bg-blue-600 border-blue-400 text-white shadow-2xl shadow-blue-600/40" : "bg-white/5 border-white/10 hover:border-blue-500 text-slate-400"
                                                )}
                                            >
                                                <CheckCircle2 className={cn("w-14 h-14", selectedOpt === true ? "text-blue-200" : "text-blue-500 group-hover:scale-110 transition-transform")} />
                                                <span className="font-black uppercase tracking-[0.3em] text-xs">CERTEZA</span>
                                            </button>
                                            <button 
                                                onClick={() => !isReadOnly && setSelectedOpt(false)} disabled={isReadOnly}
                                                className={cn(
                                                    "p-10 sm:p-14 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-6 group",
                                                    selectedOpt === false ? "bg-rose-600 border-rose-400 text-white shadow-2xl shadow-rose-600/40" : "bg-white/5 border-white/10 hover:border-rose-500 text-slate-400"
                                                )}
                                            >
                                                <XCircle className={cn("w-14 h-14", selectedOpt === false ? "text-white" : "text-rose-500 group-hover:scale-110 transition-transform")} />
                                                <span className="font-black uppercase tracking-[0.3em] text-xs">DISCREPANCIA</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-10">
                                        <div className="relative">
                                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="w-32 h-32 sm:w-48 sm:h-48 rounded-[3rem] sm:rounded-[4rem] bg-blue-600/10 flex items-center justify-center mx-auto border-2 border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.1)]">
                                                {currentMoment?.config?.interaction_type === 'interactive_lab' ? <Cpu className="w-16 h-16 sm:w-24 sm:h-24 text-blue-500" /> : <Box className="w-16 h-16 sm:w-24 sm:h-24 text-blue-500" />}
                                            </motion.div>
                                            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center animate-bounce">
                                                <Activity className="w-6 h-6 text-cyan-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-4 px-10">
                                            <h4 className="text-2xl font-black italic uppercase text-white/90">Fase de Aplicación</h4>
                                            <p className="text-sm sm:text-lg font-bold text-slate-400 leading-relaxed italic">"{currentMoment?.student?.activity || "Utiliza tus herramientas digitales para completar esta sección según las instrucciones."}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* --- PREMIUM HUD FOOTER --- */}
            <footer className="relative z-50 px-6 sm:px-12 py-8 bg-slate-900/60 border-t border-white/5 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="hidden sm:flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Activity className="w-6 h-6 text-blue-500 animate-pulse" />
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 mb-0.5">Integridad de Misión</p>
                            <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Button variant="ghost" onClick={handlePrev} disabled={currentMomentIdx === 0} className="flex-1 sm:flex-none h-14 px-8 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white font-black uppercase tracking-[0.3em] text-[10px]">
                        <ChevronLeft className="w-5 h-5 mr-3" /> REGRESAR
                    </Button>
                    <Button 
                        onClick={handleNext}
                        className="flex-[2] sm:flex-none h-16 px-12 sm:px-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs gap-4 shadow-2xl shadow-blue-600/40 relative active:scale-95 transition-all group"
                    >
                        {currentMomentIdx === moments.length - 1 ? (isReadOnly ? "SALIR VISTA PREVIA" : "FINALIZAR MISIÓN") : "SIGUIENTE FASE"} 
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </div>
            </footer>

            <style>{`
                .construction-grid {
                    background-image: 
                        linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

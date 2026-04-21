import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
    X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Target, 
    Volume2, VolumeX, Play, Pause, 
    Trophy, Clock, Activity, Rocket,
    ArrowRight, Sparkles, CheckCircle2,
    MessageSquare, Cpu, Box, XCircle,
    UploadCloud, FileText, ListVideo,
    BookOpen, Lightbulb, HelpCircle, List,
    ToggleLeft, ArrowUpDown, FileUp, Zap,
    GripVertical, AlertTriangle, Car, Users, TrafficCone
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
    const [showInstructions, setShowInstructions] = useState(true);
    const [showMomentIntro, setShowMomentIntro] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
    const [validatedAnswers, setValidatedAnswers] = useState<Record<string, boolean>>({});
    const [focusedBlockIdx, setFocusedBlockIdx] = useState(0);
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
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

    const interactionBlocks = (currentMoment?.blocks || []).filter((b: any) => 
        b.type.startsWith('interaction_') || 
        b.type === 'student_activity' || 
        b.type === 'kpi_feedback'
    );
    const currentBlock = interactionBlocks[focusedBlockIdx];
    const totalSteps = interactionBlocks.length;

    // Responsive sizing helpers
    const getCardRadius = () => "rounded-[2rem] sm:rounded-[3rem]";
    const getPadding = () => "p-6 sm:p-10 lg:p-12";

    useEffect(() => {
        // Initialize state for the new phase
        const initialAnswers: Record<string, any> = {};
        
        if (currentMoment?.blocks) {
            interactionBlocks.forEach((block: any, idx: number) => {
                if (block.type === 'interaction_sequence') {
                    const blockId = block.id || `block-${idx}`;
                    const originalItems = block.content?.items || [];
                    if (originalItems.length > 0) {
                        // We store the shuffled items for the student to work with
                        initialAnswers[blockId] = [...originalItems].sort(() => Math.random() - 0.5);
                    }
                }
            });
        }

        setSelectedAnswers(initialAnswers);
        setValidatedAnswers({}); // Reset validation on moment change
        setFocusedBlockIdx(0);
    }, [currentMomentIdx]);

    const isCurrentBlockValidated = () => {
        const block = currentBlock;
        if (!block) return true;
        
        // Blocks that are purely informative or instructional don't need validation
        if (
            block.type === 'student_activity' || 
            block.type === 'kpi_feedback' || 
            block.type === 'student_concept' || 
            block.type === 'student_context' ||
            block.type === 'narrative'
        ) {
            return true;
        }

        const blockId = block.id || `block-${focusedBlockIdx}`;
        
        if (block.type === 'interaction_sequence') return validatedAnswers[blockId] === true;
        return selectedAnswers[blockId] !== undefined;
    };

    const isCurrentBlockCorrect = () => {
        const block = currentBlock;
        if (!block) return true;
        const blockId = block.id || `block-${focusedBlockIdx}`;
        const content = block.content || {};

        if (block.type === 'interaction_choice' || block.type === 'multiple_choice') {
            return selectedAnswers[blockId] === (content.correctIndex ?? content.respuestaCorrecta);
        }
        if (block.type === 'interaction_truefalse' || block.type === 'true_false') {
            return selectedAnswers[blockId] === content.correctAnswer;
        }
        if (block.type === 'interaction_sequence') {
            const originalItems = content.items || [];
            const currentOrder = selectedAnswers[blockId] || originalItems;
            return currentOrder.every((item: any, idx: number) => {
                const originalItem = originalItems[idx];
                return (item.id && originalItem.id) ? item.id === originalItem.id : (item.text || item) === (originalItem.text || originalItem);
            });
        }
        return true;
    };

    const speak = (text: string) => {
        if (!isNarrating || !synth || isReadOnly || !text.trim()) return;
        try {
            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 1.0;
            utterance.pitch = 1.05; // Slightly adjusted for better clarity
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            utteranceRef.current = utterance;
            synth.speak(utterance);
        } catch (error) { 
            console.error("Speech Error:", error); 
            setIsSpeaking(false);
        }
    };

    const getBlockText = (block: any) => {
        if (!block?.content) return "";
        return (
            block.content.text || 
            block.content.content || 
            block.content.question || 
            block.content.instruction || 
            block.content.statement ||
            block.content.title ||
            block.content.feedback_correct ||
            block.content.feedback_incorrect ||
            block.content.text_content ||
            ""
        );
    };

    const getBlockIcon = (type: string) => {
        switch (type) {
            case 'student_context': return BookOpen;
            case 'student_concept': return Lightbulb;
            case 'student_activity': return Zap;
            case 'interaction_choice': return List;
            case 'interaction_truefalse': return ToggleLeft;
            case 'interaction_sequence': return ArrowUpDown;
            case 'interaction_upload': return FileUp;
            case 'interaction_open': return MessageSquare;
            case 'kpi_feedback': return Trophy;
            default: return FileText;
        }
    };

    const getBlockColor = (type: string) => {
        switch (type) {
            case 'student_context': return 'blue';
            case 'student_concept': return 'indigo';
            case 'student_activity': return 'amber';
            case 'kpi_feedback': return 'emerald';
            default: return 'slate';
        }
    };

    useEffect(() => {
        if (showInstructions) {
            const introText = `Bienvenido a la misión: ${missionInfo.title || module.nombre}. ${missionInfo.description || "Tu misión técnica está a punto de comenzar."} Por favor, revisa la guía de operación antes de iniciar el protocolo.`;
            speak(introText);
        }
    }, [showInstructions]);

    useEffect(() => {
        if (!currentMoment) return;
        
        let textToSpeak = currentMoment.title + ". ";
        
        const narBlocks = (currentMoment.blocks || [])
            .filter((b: any) => 
                b.visibleToStudent !== false && 
                !b.type.startsWith('interaction_') &&
                b.type !== 'student_activity' &&
                b.type !== 'kpi_feedback'
            );
        const interactionBlocks = (currentMoment.blocks || [])
            .filter((b: any) => 
                b.type.startsWith('interaction_') || 
                b.type === 'student_activity' || 
                b.type === 'kpi_feedback'
            );
        
        if (narBlocks.length > 0) {
            textToSpeak += narBlocks.map(getBlockText).filter(Boolean).join(". ");
        } else {
            const studentData = currentMoment.student || {};
            const teacherData = currentMoment.teacher || {};
            textToSpeak += studentData.content || studentData.question || studentData.instruction || teacherData.content || teacherData.instruction || currentMoment.description || "";
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
        <div className="fixed inset-0 z-[600] bg-white mesh-gradient text-slate-800 flex overflow-hidden font-sans selection:bg-blue-200 selection:text-blue-900">
            {/* --- INITIAL INSTRUCTIONS SCREEN --- */}
            <AnimatePresence>
                {showInstructions && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[700] bg-white mesh-gradient flex items-center justify-center p-6"
                    >
                        <div className="max-w-4xl w-full space-y-12">
                            <div className="text-center space-y-6">
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
                                    className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 animate-float"
                                >
                                    <Rocket className="w-12 h-12 text-white" />
                                </motion.div>
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-4">Protocolo de Aprendizaje</Badge>
                                    <h1 className="text-4xl sm:text-6xl font-black italic uppercase text-slate-900 tracking-tighter leading-none">
                                        {missionInfo.title || module.nombre}
                                    </h1>
                                    <p className="text-lg sm:text-xl font-bold text-slate-500 mt-4 italic">"{missionInfo.description || "Tu misión técnica está a punto de comenzar."}"</p>
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                                {[
                                    { icon: Clock, title: "DURACIÓN", value: "15-20 MIN", color: "bg-amber-50 text-amber-600" },
                                    { icon: Target, title: "OBJETIVO", value: "SINCRONIZACIÓN", color: "bg-emerald-50 text-emerald-600" },
                                    { icon: Activity, title: "DIFICULTAD", value: "INTERMEDIO", color: "bg-indigo-50 text-indigo-600" }
                                ].map((item, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 + (i * 0.1) }}
                                        className="p-8 glass-panel rounded-[2.5rem] flex flex-col items-center gap-4"
                                    >
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", item.color)}>
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.title}</p>
                                            <p className="font-black text-slate-800 italic uppercase">{item.value}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div 
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
                                className="p-10 glass-panel rounded-[3rem] border border-blue-100 space-y-6"
                            >
                                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                    <HelpCircle className="w-6 h-6 text-blue-500" />
                                    <h2 className="text-xl font-black italic uppercase text-slate-800">Guía de Operación</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm font-bold text-slate-600">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xs">01</div>
                                        <p>Analiza el material narrativo entregado en cada fase para obtener el contexto.</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xs">02</div>
                                        <p>Resuelve los desafíos interactivos: selección simple, lógica o secuencia.</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xs">03</div>
                                        <p>Verifica tus respuestas. La validación es obligatoria para poder avanzar.</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xs">04</div>
                                        <p>Completa todas las fases del tracklist lateral para finalizar con éxito.</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}
                                className="flex justify-center pt-4"
                            >
                                <Button 
                                    onClick={() => {
                                        setShowInstructions(false);
                                        // Trigger narrating if enabled
                                        if (isNarrating) {
                                            const timer = setTimeout(() => {
                                                setShowMomentIntro(false);
                                                setShowMomentIntro(true); // Trigger effect
                                            }, 100);
                                            return () => clearTimeout(timer);
                                        }
                                    }}
                                    className="h-20 px-16 bg-slate-900 hover:bg-blue-600 text-white rounded-[2.2rem] font-black uppercase tracking-[0.3em] text-xs sm:text-sm gap-4 shadow-2xl transition-all group hover:scale-[1.05] active:scale-95 border-b-4 border-slate-950"
                                >
                                    INICIAR MISIÓN <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Spotify-style Tracklist Sidebar */}
            <motion.nav
                onHoverStart={() => setIsSidebarHovered(true)}
                onHoverEnd={() => setIsSidebarHovered(false)}
                initial={{ width: 90 }}
                animate={{ width: isSidebarHovered ? 340 : 90 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative z-50 h-full bg-white border-r border-slate-200 shadow-[20px_0_40px_rgba(0,0,0,0.03)] flex flex-col shrink-0 overflow-hidden"
            >
                {/* Back Button Area */}
                <div className="flex justify-center py-4 border-b border-slate-50">
                    <Button 
                        variant="ghost" 
                        size={isSidebarHovered ? "default" : "icon"}
                        onClick={onClose}
                        className={cn(
                            "rounded-xl transition-all hover:bg-slate-100 text-slate-400 hover:text-slate-900 group h-10 overflow-hidden",
                            isSidebarHovered ? "px-6 w-[80%]" : "w-10"
                        )}
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <AnimatePresence>
                            {isSidebarHovered && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                    className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                                >
                                    Regresar
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Button>
                </div>
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
                            <Button 
                                variant="ghost" 
                                onClick={() => setIsNarrating(!isNarrating)}
                                className={cn(
                                    "px-4 sm:px-6 h-10 sm:h-14 rounded-2xl sm:rounded-[1.5rem] border transition-all flex items-center gap-3 w-auto shadow-sm",
                                    isNarrating ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-400"
                                )}
                            >
                                <Cpu className={cn("w-5 h-5 sm:w-6 sm:h-6", isNarrating && "animate-pulse")} />
                                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest pointer-events-none">
                                    {isNarrating ? "Tutor Activo" : "Tutor Inactivo"}
                                </span>
                            </Button>
                            <Button 
                                variant="ghost" size="icon" onClick={onClose}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-[1.5rem] bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 transition-all group shrink-0"
                            >
                                <X className="w-5 h-5 sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* --- MAIN CINEMATIC CORE --- */}
                <main className="flex-1 relative z-20 flex flex-col p-6 sm:p-12 lg:p-16 overflow-y-auto custom-scrollbar bg-transparent">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.03)_0%,transparent_50%)]" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-white/0" />
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
                                className="w-full h-full min-h-0"
                            >
                                {(() => {
                                    const narBlocks = (currentMoment.blocks || [])
                                        .filter((b: any) => 
                                            b.visibleToStudent !== false && 
                                            !b.type.startsWith('interaction_') &&
                                            b.type !== 'student_activity' &&
                                            b.type !== 'kpi_feedback'
                                        );

                                    const interactionBlocks = (currentMoment.blocks || []).filter((b: any) => 
                                        b.type.startsWith('interaction_') || 
                                        b.type === 'student_activity' || 
                                        b.type === 'kpi_feedback'
                                    );
                                    
                                    const hasInteractions = interactionBlocks.length > 0;
                                    const totalSteps = interactionBlocks.length;
                                    const currentBlock = interactionBlocks[focusedBlockIdx] || interactionBlocks[totalSteps - 1];

                                    return (
                                        <div className={cn(
                                            "w-full mx-auto grid h-full min-h-0 items-start xl:items-stretch gap-10 lg:gap-16 xl:gap-20 transition-all duration-700",
                                            hasInteractions ? "max-w-7xl grid-cols-1 xl:grid-cols-2" : "max-w-4xl grid-cols-1"
                                        )}>
                                            {/* NARRATION WING (Left Side) - Flexible Height */}
                                            <div className="flex flex-col gap-8 sm:gap-10 pt-4 xl:pt-8 w-full group/narrative">
                                                <div className="space-y-6 relative">
                                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover/narrative:bg-blue-600/20 transition-all duration-700" />
                                                    <Badge className="bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 border-blue-200/50 px-6 sm:px-8 py-2.5 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-[0.4em] w-fit shadow-lg shadow-blue-500/5 backdrop-blur-sm">
                                                        DOCUMENTACIÓN FASE {currentMomentIdx + 1}
                                                    </Badge>
                                                    <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase text-slate-900 drop-shadow-sm">
                                                        {currentMoment?.title}
                                                    </h3>
                                                </div>
                                                
                                                <div className="flex-1 w-full space-y-4 sm:space-y-6">
                                                    {narBlocks.length > 0 ? (
                                                        narBlocks.map((block: any) => {
                                                        const Icon = getBlockIcon(block.type);
                                                        const color = getBlockColor(block.type);
                                                        const text = getBlockText(block);
                                                        if (!text) return null;
                                                        return (
                                                            <motion.div 
                                                                key={block.id} 
                                                                initial={{ opacity: 0, x: -20 }} 
                                                                animate={{ opacity: 1, x: 0 }}
                                                                className={cn(
                                                                    "relative p-8 sm:p-10 rounded-[3rem] overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] group",
                                                                    color === 'blue' ? 'bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100/50' : 
                                                                    color === 'indigo' ? 'bg-gradient-to-br from-indigo-50/80 to-purple-50/50 border border-indigo-100/50' : 
                                                                    color === 'amber' ? 'bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-100/50' : 
                                                                    'bg-white border border-slate-200'
                                                                )}
                                                            >
                                                                <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-gradient-to-t from-blue-50/20 to-transparent" />
                                                                <div className={cn(
                                                                    "absolute top-0 left-0 w-2 h-full transition-colors",
                                                                    color === 'blue' ? 'bg-blue-500' : color === 'indigo' ? 'bg-indigo-500' : color === 'amber' ? 'bg-amber-500' : 'bg-slate-400'
                                                                )} />
                                                                
                                                                <div className="flex flex-col gap-6 relative z-10">
                                                                    <div className="flex items-start gap-6">
                                                                        <div className={cn(
                                                                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all shadow-md backdrop-blur-sm",
                                                                            color === 'blue' ? 'bg-white/80 border-blue-200 text-blue-600' : 
                                                                            color === 'indigo' ? 'bg-white/80 border-indigo-200 text-indigo-600' : 
                                                                            color === 'amber' ? 'bg-white/80 border-amber-200 text-amber-600' : 
                                                                            'bg-slate-50 border-slate-100 text-slate-400'
                                                                        )}>
                                                                            <Icon className="w-7 h-7" />
                                                                        </div>
                                                                        <div className="flex-1 space-y-2">
                                                                            <p className={cn(
                                                                                "text-[10px] font-black uppercase tracking-[0.3em]",
                                                                                color === 'blue' ? 'text-blue-500/80' : 
                                                                                color === 'indigo' ? 'text-indigo-500/80' : 
                                                                                color === 'amber' ? 'text-amber-600/80' : 'text-slate-400'
                                                                            )}>
                                                                                {block.type === 'student_context' ? 'Contexto Narrativo' : 
                                                                                 block.type === 'student_concept' ? 'Marco Teórico' : 
                                                                                 block.type === 'student_activity' ? 'Consigna de Fase' : 'Información Técnica'}
                                                                            </p>
                                                                            <p className="text-lg sm:text-xl font-bold text-slate-800 leading-[1.4] italic tracking-tight whitespace-pre-wrap">
                                                                                {text.split(/•\s*|\-\s*|(?=\d+\.\s*)/).filter(s => s.trim().length > 1).length <= 1 && text}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Enhanced Interactive Scenario Grid */}
                                                                    {text.split(/•\s*|\-\s*|(?=\d+\.\s*)/).filter(s => s.trim().length > 1).length > 1 && (
                                                                        <div className="grid grid-cols-1 gap-4 mt-2">
                                                                            {text.split(/•\s*|\-\s*|(?=\d+\.\s*)/)
                                                                                .filter(s => s.trim().length > 1)
                                                                                .map((item, i) => {
                                                                                    const cleanItem = item.replace(/^\d+\.\s*/, '').trim();
                                                                                    const lower = cleanItem.toLowerCase();
                                                                                    
                                                                                    // Keyword-based iconography
                                                                                    let ScenarioIcon = AlertTriangle;
                                                                                    let scenarioColor = "text-amber-500 bg-amber-50";
                                                                                    
                                                                                    if (lower.includes('auto') || lower.includes('vehículo') || lower.includes('carro')) {
                                                                                        ScenarioIcon = Car;
                                                                                        scenarioColor = "text-blue-500 bg-blue-50";
                                                                                    } else if (lower.includes('peatón') || lower.includes('gente') || lower.includes('persona') || lower.includes('niño')) {
                                                                                        ScenarioIcon = Users;
                                                                                        scenarioColor = "text-emerald-500 bg-emerald-50";
                                                                                    } else if (lower.includes('caos') || lower.includes('problema') || lower.includes('falla') || lower.includes('error')) {
                                                                                        ScenarioIcon = Zap;
                                                                                        scenarioColor = "text-rose-500 bg-rose-50";
                                                                                    } else if (lower.includes('tráfico') || lower.includes('semáforo') || lower.includes('calle')) {
                                                                                        ScenarioIcon = TrafficCone;
                                                                                        scenarioColor = "text-orange-500 bg-orange-50";
                                                                                    }

                                                                                    return (
                                                                                        <motion.div
                                                                                            key={i}
                                                                                            initial={{ opacity: 0, y: 20 }}
                                                                                            animate={{ opacity: 1, y: 0 }}
                                                                                            transition={{ delay: 0.2 + (i * 0.15) }}
                                                                                            className="group/item relative p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-default"
                                                                                        >
                                                                                            <div className="flex items-center gap-5">
                                                                                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform", scenarioColor)}>
                                                                                                    <ScenarioIcon className="w-6 h-6" />
                                                                                                </div>
                                                                                                <p className="text-sm sm:text-base font-bold text-slate-700 leading-snug">
                                                                                                    {cleanItem}
                                                                                                </p>
                                                                                                <div className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </motion.div>
                                                                                    );
                                                                                })
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })
                                                ) : (
                                                        (() => {
                                                            const st = currentMoment?.student || {};
                                                            const tc = currentMoment?.teacher || {};
                                                            const legacyText = st.content || st.question || st.instruction || tc.content || tc.instruction || currentMoment?.description;
                                                            if (!legacyText) return null;
                                                            
                                                            return (
                                                                <div className={cn("relative p-6 sm:p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm overflow-hidden group")}>
                                                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-gradient-to-br from-indigo-50/20 to-transparent" />
                                                                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                                                                    <div className="flex flex-col gap-6 relative z-10">
                                                                        <div className="flex items-start gap-5">
                                                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                                                                                <BookOpen className="w-6 h-6" />
                                                                            </div>
                                                                            <div className="flex-1 space-y-1">
                                                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Instrucciones de Sincronización</p>
                                                                                <p className="text-base sm:text-xl md:text-2xl font-medium text-slate-700 leading-relaxed italic tracking-tight whitespace-pre-wrap">
                                                                                    {legacyText.split(/•\s*|\-\s*|(?=\d+\.\s*)/).filter(s => s.trim().length > 1).length <= 1 && `"${legacyText}"`}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Legacy Interactive Scenario Grid */}
                                                                        {legacyText.split(/•\s*|\-\s*|(?=\d+\.\s*)/).filter(s => s.trim().length > 1).length > 1 && (
                                                                            <div className="grid grid-cols-1 gap-4 mt-2">
                                                                                {legacyText.split(/•\s*|\-\s*|(?=\d+\.\s*)/)
                                                                                    .filter(s => s.trim().length > 1)
                                                                                    .map((item, i) => {
                                                                                        const cleanItem = item.replace(/^\d+\.\s*/, '').trim();
                                                                                        const lower = cleanItem.toLowerCase();
                                                                                        
                                                                                        let ScenarioIcon = AlertTriangle;
                                                                                        let scenarioColor = "text-amber-500 bg-amber-50";
                                                                                        
                                                                                        if (lower.includes('auto') || lower.includes('vehículo') || lower.includes('carro')) {
                                                                                            ScenarioIcon = Car;
                                                                                            scenarioColor = "text-blue-500 bg-blue-50";
                                                                                        } else if (lower.includes('peatón') || lower.includes('gente') || lower.includes('persona')) {
                                                                                            ScenarioIcon = Users;
                                                                                            scenarioColor = "text-emerald-500 bg-emerald-50";
                                                                                        } else if (lower.includes('caos') || lower.includes('falla') || lower.includes('error')) {
                                                                                            ScenarioIcon = Zap;
                                                                                            scenarioColor = "text-rose-500 bg-rose-50";
                                                                                        }

                                                                                        return (
                                                                                            <motion.div
                                                                                                key={i}
                                                                                                initial={{ opacity: 0, y: 15 }}
                                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                                transition={{ delay: 0.1 + (i * 0.12) }}
                                                                                                className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group/item hover:bg-white hover:border-blue-200 transition-all font-bold text-slate-600 hover:text-slate-900"
                                                                                            >
                                                                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs group-hover/item:scale-110 transition-transform", scenarioColor)}>
                                                                                                    <ScenarioIcon className="w-5 h-5" />
                                                                                                </div>
                                                                                                {cleanItem}
                                                                                            </motion.div>
                                                                                        );
                                                                                    })
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()
                                                    )}
                                                </div>

                                                {!isReadOnly && (
                                                    <Button 
                                                        onClick={() => {
                                                            const text = narBlocks.length 
                                                                ? narBlocks.map(getBlockText).filter(Boolean).join(". ")
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
                                            {hasInteractions && (
                                                <div className={cn("p-6 sm:p-10 bg-white border border-slate-200 shadow-xl flex flex-col xl:my-auto relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] mt-4 xl:mt-0 max-h-[85vh] xl:max-h-[90vh]")}>
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.02)_0%,transparent_100%)] pointer-events-none" />
                                                    
                                                    <div className="relative z-10 flex-1 flex flex-col h-full min-h-0">
                                                        <div className="flex flex-col h-full">
                                                            {/* INNER STEP INDICATOR - Friendly & Visual */}
                                                            {totalSteps > 1 && (
                                                                <div className="flex items-center justify-between gap-4 mb-8 shrink-0">
                                                                    <div className="flex items-center gap-2">
                                                                        {interactionBlocks.map((_: any, i: number) => (
                                                                            <div 
                                                                                key={i} 
                                                                                className={cn(
                                                                                    "h-1.5 rounded-full transition-all duration-500",
                                                                                    i === focusedBlockIdx ? "w-8 bg-blue-600" : i < focusedBlockIdx ? "w-4 bg-emerald-400" : "w-2 bg-slate-100"
                                                                                )}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                                                                        PASO {focusedBlockIdx + 1} DE {totalSteps}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* ACTIVE INTERACTION CARD */}
                                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col justify-center min-h-0">
                                                                <AnimatePresence mode="wait">
                                                                    <motion.div 
                                                                        key={`${currentMoment.id}-${focusedBlockIdx}`}
                                                                        initial={{ opacity: 0, x: 20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        exit={{ opacity: 0, x: -20 }}
                                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                                        className="w-full space-y-8"
                                                                    >
                                                                        {(() => {
                                                                            const block = currentBlock;
                                                                            const interactionType = block.type;
                                                                            const content = block.content || {};
                                                                            const blockId = block.id || `block-${focusedBlockIdx}`;

                                                                            if (interactionType === 'interaction_choice' || interactionType === 'multiple_choice') {
                                                                                const options = content.options || [];
                                                                                return (
                                                                                    <div className="w-full space-y-6 sm:space-y-8">
                                                                                        <div className="text-center">
                                                                                            <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-[0.2em] font-black text-[9px] px-4">Análisis de Opciones</Badge>
                                                                                            <h4 className="text-2xl sm:text-3xl font-black italic uppercase text-slate-800 leading-tight tracking-tight">{content.question || "Selecciona tu Respuesta"}</h4>
                                                                                        </div>
                                                                                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                                                                            {options.map((opt: any, i: number) => {
                                                                                                const isSelected = selectedAnswers[blockId] === i;
                                                                                                const isCorrect = i === (content.correctIndex ?? content.respuestaCorrecta);
                                                                                                const hasValidated = selectedAnswers[blockId] !== undefined;

                                                                                                return (
                                                                                                    <button 
                                                                                                        key={i} disabled={isReadOnly || hasValidated}
                                                                                                        onClick={() => !isReadOnly && setSelectedAnswers(prev => ({ ...prev, [blockId]: i }))}
                                                                                                        className={cn(
                                                                                                            "w-full p-5 sm:p-6 lg:p-7 text-sm flex items-center gap-5 group transition-all",
                                                                                                            "rounded-[2rem] border-2 font-bold relative overflow-hidden",
                                                                                                            hasValidated 
                                                                                                                ? isCorrect 
                                                                                                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20"
                                                                                                                    : isSelected
                                                                                                                        ? "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20 animate-shake"
                                                                                                                        : "bg-slate-50 border-slate-100 opacity-50"
                                                                                                                : isSelected 
                                                                                                                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]" 
                                                                                                                    : "bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-300 text-slate-700 hover:scale-[1.01]"
                                                                                                        )}
                                                                                                    >
                                                                                                        <div className={cn(
                                                                                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-xs sm:text-sm transition-all",
                                                                                                            isSelected || (hasValidated && isCorrect) ? "bg-white text-blue-600" : "bg-white text-slate-300 border border-slate-100 group-hover:text-blue-500",
                                                                                                            hasValidated && isCorrect && "text-emerald-600",
                                                                                                            hasValidated && isSelected && !isCorrect && "text-rose-600"
                                                                                                        )}>
                                                                                                            {hasValidated && isCorrect ? <CheckCircle2 className="w-6 h-6" /> : hasValidated && isSelected && !isCorrect ? <XCircle className="w-6 h-6" /> : String.fromCharCode(65 + i)}
                                                                                                        </div>
                                                                                                        <span className="leading-snug flex-1 text-base text-left">{opt?.text || opt}</span>
                                                                                                        
                                                                                                        {hasValidated && isCorrect && (
                                                                                                            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                                                                                <Badge className="bg-white/20 text-white border-transparent uppercase text-[8px] font-black">Correcto</Badge>
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </button>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                        {selectedAnswers[blockId] !== undefined && content.explanation && (
                                                                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[2rem] bg-slate-900 text-white text-sm italic font-medium border border-white/10">
                                                                                                <div className="flex items-center gap-2 mb-2 text-blue-400">
                                                                                                    <Lightbulb className="w-4 h-4" />
                                                                                                    <span className="text-[10px] font-black uppercase tracking-widest">¿Por qué es esto así?</span>
                                                                                                </div>
                                                                                                {content.explanation}
                                                                                            </motion.div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            if (interactionType === 'interaction_truefalse' || interactionType === 'true_false') {
                                                                                return (
                                                                                    <div className="w-full space-y-8">
                                                                                        <div className="text-center">
                                                                                            <Badge variant="outline" className="mb-4 bg-indigo-50 text-indigo-600 border-indigo-100 uppercase tracking-[0.2em] font-black text-[9px] px-4">Verificación de Hechos</Badge>
                                                                                            <h4 className="text-2xl sm:text-4xl font-black italic uppercase text-slate-800 leading-tight tracking-tight px-4">{content.statement || "¿Es verdadera esta afirmación?"}</h4>
                                                                                        </div>
                                                                                        <div className="grid grid-cols-2 gap-5 max-w-xl mx-auto w-full">
                                                                                            {(() => {
                                                                                                const userAns = selectedAnswers[blockId];
                                                                                                const hasValidated = userAns !== undefined;
                                                                                                const correctAns = content.correctAnswer; // Assuming boolean

                                                                                                return (
                                                                                                    <>
                                                                                                        <button 
                                                                                                            disabled={isReadOnly || hasValidated}
                                                                                                            onClick={() => !isReadOnly && setSelectedAnswers(prev => ({ ...prev, [blockId]: true }))}
                                                                                                            className={cn(
                                                                                                                "p-8 sm:p-12 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 group relative overflow-hidden",
                                                                                                                hasValidated
                                                                                                                    ? correctAns === true
                                                                                                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-xl"
                                                                                                                        : userAns === true
                                                                                                                            ? "bg-rose-500 border-rose-500 text-white shadow-xl animate-shake"
                                                                                                                            : "bg-slate-50 border-slate-100 opacity-50"
                                                                                                                    : userAns === true 
                                                                                                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-xl scale-[1.05]" 
                                                                                                                        : "bg-slate-50 border-slate-100 hover:bg-white hover:border-emerald-300 text-slate-500"
                                                                                                            )}
                                                                                                        >
                                                                                                            <CheckCircle2 className="w-12 h-12" />
                                                                                                            <span className="font-black text-[10px] tracking-[0.3em] uppercase">VERDADERO</span>
                                                                                                        </button>
                                                                                                        <button 
                                                                                                            disabled={isReadOnly || hasValidated}
                                                                                                            onClick={() => !isReadOnly && setSelectedAnswers(prev => ({ ...prev, [blockId]: false }))}
                                                                                                            className={cn(
                                                                                                                "p-8 sm:p-12 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 group relative overflow-hidden",
                                                                                                                hasValidated
                                                                                                                    ? correctAns === false
                                                                                                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-xl"
                                                                                                                        : userAns === false
                                                                                                                            ? "bg-rose-500 border-rose-500 text-white shadow-xl animate-shake"
                                                                                                                            : "bg-slate-50 border-slate-100 opacity-50"
                                                                                                                    : userAns === false 
                                                                                                                        ? "bg-rose-500 border-rose-500 text-white shadow-xl scale-[1.05]" 
                                                                                                                        : "bg-slate-50 border-slate-100 hover:bg-white hover:border-rose-300 text-slate-500"
                                                                                                            )}
                                                                                                        >
                                                                                                            <XCircle className="w-12 h-12" />
                                                                                                            <span className="font-black text-[10px] tracking-[0.3em] uppercase">FALSO</span>
                                                                                                        </button>
                                                                                                    </>
                                                                                                );
                                                                                            })()}
                                                                                        </div>
                                                                                        {selectedAnswers[blockId] !== undefined && content.explanation && (
                                                                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-[2.5rem] bg-indigo-900/10 border border-indigo-200 text-indigo-900 text-sm font-medium italic text-center">
                                                                                                <Lightbulb className="w-5 h-5 mx-auto mb-2 text-indigo-500" />
                                                                                                {content.explanation}
                                                                                            </motion.div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            if (interactionType === 'interaction_open') {
                                                                                return (
                                                                                    <div className="w-full space-y-6">
                                                                                        <div className="text-center">
                                                                                            <Badge variant="outline" className="mb-4 bg-sky-50 text-sky-600 border-sky-100 uppercase tracking-[0.2em] font-black text-[9px] px-4">Análisis Abierto</Badge>
                                                                                            <h4 className="text-2xl sm:text-3xl font-black italic uppercase text-slate-800 leading-tight tracking-tight">{content.question || "Responde a la pregunta"}</h4>
                                                                                        </div>
                                                                                        <textarea 
                                                                                            disabled={isReadOnly}
                                                                                            onChange={(e) => setSelectedAnswers(prev => ({ ...prev, [blockId]: e.target.value }))}
                                                                                            value={selectedAnswers[blockId] || ''}
                                                                                            placeholder={content.placeholder_hint || "Escribe tu respuesta aquí detalladamente..."}
                                                                                            className="w-full min-h-[180px] p-8 text-lg font-medium rounded-[2.5rem] border-2 border-slate-200 bg-slate-50 focus:bg-white resize-none text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all shadow-inner custom-scrollbar"
                                                                                        />
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            if (interactionType === 'interaction_upload') {
                                                                                return (
                                                                                    <div className="w-full space-y-8">
                                                                                        <div className="text-center">
                                                                                            <Badge variant="outline" className="mb-4 bg-pink-50 text-pink-600 border-pink-100 uppercase tracking-[0.2em] font-black text-[9px] px-4">Archivo de Evidencia</Badge>
                                                                                            <h4 className="text-2xl sm:text-3xl font-black italic uppercase text-slate-800 leading-tight tracking-tight">{content.instruction || "Sube tu archivo de evidencia"}</h4>
                                                                                        </div>
                                                                                        <div className="w-full border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white rounded-[3rem] p-12 sm:p-20 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-pink-400 hover:shadow-2xl transition-all group text-slate-400 hover:text-pink-600 relative overflow-hidden">
                                                                                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />
                                                                                            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                                                                                                <UploadCloud className="w-10 h-10" />
                                                                                            </div>
                                                                                            <div className="text-center space-y-2">
                                                                                                <span className="font-black text-sm uppercase tracking-widest block">Haz clic para subir documento</span>
                                                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{content.format_hint || "Soportado: Imágenes, PDFs"}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            if (interactionType === 'kpi_feedback') {
                                                                                return (
                                                                                    <div className="w-full space-y-10 py-10 text-center">
                                                                                        <div className="relative inline-block">
                                                                                            <motion.div 
                                                                                                animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                                                                className="absolute inset-[-40px] border-2 border-dashed border-emerald-300 rounded-full opacity-30" 
                                                                                            />
                                                                                            <div className="w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-2xl relative z-10 scale-110">
                                                                                                <Trophy className="w-16 h-16 text-white" />
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="space-y-6">
                                                                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-6 py-2 rounded-full font-black text-[11px] uppercase tracking-[0.4em]">Hito de Desarrollo</Badge>
                                                                                            <h3 className="text-3xl sm:text-5xl font-black italic text-slate-900 tracking-tighter uppercase leading-none">¡Fase Lograda!</h3>
                                                                                            <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] max-w-lg mx-auto overflow-hidden relative group">
                                                                                                <div className="absolute inset-0 bg-blue-50/10 pointer-events-none" />
                                                                                                <p className="text-xl sm:text-2xl font-bold text-emerald-800 leading-relaxed italic relative z-10">
                                                                                                    "{getBlockText(block) || "Sincronización técnica completada con éxito."}"
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            if (interactionType === 'student_activity') {
                                                                                return (
                                                                                    <div className="w-full space-y-10 py-8 text-center">
                                                                                        <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-amber-100 shadow-lg">
                                                                                            <Zap className="w-12 h-12 text-amber-500" />
                                                                                        </div>
                                                                                        <div className="space-y-6">
                                                                                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-5 py-2 rounded-full font-black text-[11px] uppercase tracking-[0.4em]">Actividad Práctica</Badge>
                                                                                            <h3 className="text-2xl sm:text-4xl font-black italic text-slate-800 tracking-tighter uppercase leading-tight">Consigna Técnica</h3>
                                                                                            <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] max-w-md mx-auto">
                                                                                                <p className="text-xl sm:text-2xl font-bold text-slate-600 leading-relaxed italic">
                                                                                                    "{getBlockText(block)}"
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            if (interactionType === 'interaction_sequence') {
                                                                                const originalItems = content.items || [];
                                                                                const currentOrder = selectedAnswers[blockId] || originalItems;
                                                                                const hasValidated = validatedAnswers[blockId] === true;
                                                                                
                                                                                const isSequenceCorrect = currentOrder.every((item: any, idx: number) => {
                                                                                    const originalItem = originalItems[idx];
                                                                                    return (item.id && originalItem.id) ? item.id === originalItem.id : (item.text || item) === (originalItem.text || originalItem);
                                                                                });

                                                                                return (
                                                                                    <div className="w-full space-y-8">
                                                                                        <div className="text-center">
                                                                                            <Badge variant="outline" className="mb-4 bg-amber-50 text-amber-600 border-amber-100 uppercase tracking-[0.2em] font-black text-[9px] px-4">Lógica Secuencial</Badge>
                                                                                            <h4 className="text-2xl sm:text-3xl font-black italic uppercase text-slate-800 leading-tight tracking-tight">Ordena el Algoritmo</h4>
                                                                                        </div>
                                                                                        
                                                                                        <Reorder.Group 
                                                                                            axis="y" 
                                                                                            values={currentOrder} 
                                                                                            onReorder={(newOrder) => !hasValidated && setSelectedAnswers(prev => ({ ...prev, [blockId]: newOrder }))}
                                                                                            className="space-y-3"
                                                                                        >
                                                                                            {currentOrder.map((item: any, idx: number) => {
                                                                                                const isActuallyCorrectPlace = !hasValidated ? false : (
                                                                                                    (item.id && originalItems[idx]?.id) ? item.id === originalItems[idx].id : (item.text || item) === (originalItems[idx]?.text || originalItems[idx])
                                                                                                );

                                                                                                return (
                                                                                                    <Reorder.Item 
                                                                                                        key={item.id || `item-${item.text || item}`} 
                                                                                                        value={item}
                                                                                                        drag={!hasValidated}
                                                                                                        className={cn(
                                                                                                            "p-5 sm:p-6 bg-white border-2 rounded-[1.8rem] flex items-center gap-6 text-base sm:text-lg font-bold shadow-sm transition-all relative overflow-hidden",
                                                                                                            hasValidated 
                                                                                                                ? isActuallyCorrectPlace 
                                                                                                                    ? "border-emerald-500 bg-emerald-50 text-emerald-900" 
                                                                                                                    : "border-rose-300 bg-rose-50 text-rose-900 animate-shake"
                                                                                                                : "border-slate-100 text-slate-700 cursor-grab active:cursor-grabbing hover:border-amber-200 group"
                                                                                                        )}
                                                                                                    >
                                                                                                        <div className={cn("shrink-0 transition-colors", hasValidated ? isActuallyCorrectPlace ? "text-emerald-500" : "text-rose-400" : "text-slate-300 group-hover:text-amber-400")}>
                                                                                                            {hasValidated ? isActuallyCorrectPlace ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" /> : <GripVertical className="w-6 h-6" />}
                                                                                                        </div>
                                                                                                        <span className="flex-1 italic">{item.text || item}</span>
                                                                                                        {hasValidated && (
                                                                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase opacity-30">
                                                                                                                Paso {idx + 1}
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </Reorder.Item>
                                                                                                );
                                                                                            })}
                                                                                        </Reorder.Group>

                                                                                        {!hasValidated ? (
                                                                                            <div className="flex flex-col gap-4">
                                                                                                <div className="p-4 bg-amber-50/30 rounded-[1.5rem] border border-dashed border-amber-200 text-center">
                                                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 italic">Arrastra los elementos para organizar la secuencia técnica correcta</p>
                                                                                                </div>
                                                                                                <Button 
                                                                                                    onClick={() => setValidatedAnswers(prev => ({ ...prev, [blockId]: true }))}
                                                                                                    className="h-14 w-full bg-slate-900 text-white rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                                                                                >
                                                                                                    <Target className="w-4 h-4 text-blue-400" /> Verificar Algoritmo
                                                                                                </Button>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="space-y-4">
                                                                                                <div className={cn(
                                                                                                    "p-6 rounded-[2rem] flex flex-col items-center gap-3 text-center",
                                                                                                    isSequenceCorrect ? "bg-emerald-500/10 border border-emerald-200 text-emerald-800" : "bg-rose-500/10 border border-rose-200 text-rose-800"
                                                                                                )}>
                                                                                                    {isSequenceCorrect ? (
                                                                                                        <>
                                                                                                            <Trophy className="w-10 h-10 text-emerald-500" />
                                                                                                            <h5 className="font-black italic uppercase tracking-tighter text-xl">¡Secuencia Perfecta!</h5>
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <XCircle className="w-10 h-10 text-rose-500" />
                                                                                                            <h5 className="font-black italic uppercase tracking-tighter text-xl">Error en la Lógica</h5>
                                                                                                            <p className="text-xs font-bold opacity-70">El orden actual no es el esperado. Revisa los pasos indicados.</p>
                                                                                                            <Button 
                                                                                                                variant="outline" 
                                                                                                                size="sm" 
                                                                                                                onClick={() => setValidatedAnswers(prev => ({ ...prev, [blockId]: false }))}
                                                                                                                className="mt-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-rose-200 text-rose-600 hover:bg-rose-50"
                                                                                                            >
                                                                                                                Intentar de Nuevo
                                                                                                            </Button>
                                                                                                        </>
                                                                                                    )}
                                                                                                </div>
                                                                                                {content.explanation && (
                                                                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[2rem] bg-indigo-900 text-white text-sm italic font-medium border border-white/10">
                                                                                                        <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                                                                                            <Lightbulb className="w-4 h-4" />
                                                                                                            <span className="text-[10px] font-black uppercase tracking-widest">Lógica de Programación</span>
                                                                                                        </div>
                                                                                                        {content.explanation}
                                                                                                    </motion.div>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            return null;
                                                                        })()}
                                                                    </motion.div>
                                                                </AnimatePresence>
                                                            </div>

                                                            {/* NAVIGATION BUTTON WITHIN PHASE */}
                                                            <div className="pt-8 border-t border-slate-100 shrink-0 flex justify-center">
                                                                {focusedBlockIdx < totalSteps - 1 ? (
                                                                    <Button 
                                                                        disabled={!isCurrentBlockValidated()}
                                                                        onClick={() => setFocusedBlockIdx(prev => prev + 1)}
                                                                        className={cn(
                                                                            "h-16 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs gap-3 shadow-2xl transition-all group scale-110",
                                                                            isCurrentBlockValidated() ? "bg-slate-900 hover:bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                                                                        )}
                                                                    >
                                                                        SIGUIENTE PASO <ChevronRight className="w-5 h-5 group-hover:translate-x-1" />
                                                                    </Button>
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        {isCurrentBlockValidated() && (
                                                                            <motion.p 
                                                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                                                                className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 italic mb-2"
                                                                            >
                                                                                ¡HAS COMPLETADO LOS REQUERIMIENTOS DE ESTA FASE!
                                                                            </motion.p>
                                                                        )}
                                                                        <Button 
                                                                            disabled={!isCurrentBlockValidated()}
                                                                            onClick={handleNext}
                                                                            className={cn(
                                                                                "h-16 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs gap-3 shadow-2xl transition-all group scale-110",
                                                                                isCurrentBlockValidated() ? "bg-blue-600 hover:bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                                                                            )}
                                                                        >
                                                                            {currentMomentIdx === moments.length - 1 ? (isReadOnly ? "SALIR VISTA PREVIA" : "FINALIZAR MISIÓN") : "CONTINUAR A LA SIGUIENTE FASE"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
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

            {/* --- DRAGGABLE OWL MASCOT --- */}
            <AnimatePresence>
                {isNarrating && (
                    <motion.div
                        drag
                        dragConstraints={{ left: -1200, right: 1200, top: -1200, bottom: 1200 }}
                        dragElastic={0.05}
                        dragMomentum={false}
                        initial={{ opacity: 0, scale: 0.8, x: 20, y: 0 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.1, zIndex: 100 }}
                        className="fixed bottom-12 right-12 z-[100] cursor-grab active:cursor-grabbing touch-none"
                    >
                        <div className="relative">
                            {/* Speaking Indicator Waves */}
                            {isSpeaking && (
                                <div className="absolute inset-0 -z-10">
                                    <span className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
                                    <span className="absolute inset-[-10px] rounded-full bg-blue-400/10 animate-pulse" />
                                </div>
                            )}

                            {/* Speech Bubble */}
                            <AnimatePresence>
                                {isSpeaking && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        className="absolute -top-16 right-0 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl shadow-2xl whitespace-nowrap overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                            Analizando...
                                        </div>
                                        <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-slate-900 rotate-45" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Mascot Frame (Transparent) */}
                            <div className={cn(
                                "w-16 h-16 sm:w-24 sm:h-24 transition-all duration-500 pointer-events-auto",
                                isSpeaking ? "scale-110 drop-shadow-[0_15px_30px_rgba(59,130,246,0.6)]" : "drop-shadow-xl opacity-95"
                            )}>
                                <div className="w-full h-full relative">
                                    <img 
                                        src="/assets/owl_tutor.png" 
                                        alt="Bio el Búho" 
                                        draggable="false"
                                        className={cn(
                                            "w-full h-full object-contain transition-transform duration-700 rounded-full select-none",
                                            isSpeaking ? "scale-110" : "scale-100"
                                        )}
                                    />
                                    {!isNarrating && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <VolumeX className="w-8 h-8 text-white/50 drop-shadow-md" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Drag Indicator Handle */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .mesh-gradient {
                    background-color: #ffffff;
                    background-image: 
                        radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(147, 51, 234, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.05) 0px, transparent 50%),
                        radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.05) 0px, transparent 50%);
                    background-attachment: fixed;
                }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.4);
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

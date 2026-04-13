import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, MessageSquare, Wrench, X } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

interface EngineerOwlProps {
    message: string;
    isVisible?: boolean;
}

export function EngineerOwl({ message, isVisible: initialVisible = true }: EngineerOwlProps) {
    const { speak, stop, isSpeaking, isMuted, toggleMute } = useSpeech({ defaultRate: 1.1, defaultPitch: 1.0 });
    const [displayedMessage, setDisplayedMessage] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [isDismissed, setIsDismissed] = useState(() => {
        return localStorage.getItem('arg_hide_owl') === 'true';
    });

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDismissed(true);
        localStorage.setItem('arg_hide_owl', 'true');
        stop();
    };

    const isVisible = initialVisible && !isDismissed;

    // Typing effect for the text bubble
    useEffect(() => {
        if (!message) return;
        
        let i = 0;
        setDisplayedMessage("");
        const interval = setInterval(() => {
            setDisplayedMessage(message.substring(0, i));
            i++;
            if (i > message.length) {
                clearInterval(interval);
            }
        }, 30); // Typing speed

        return () => clearInterval(interval);
    }, [message]);

    // Speak when message changes
    useEffect(() => {
        if (message && isVisible && !isMuted) {
            speak(message, false);
        }
        return () => stop();
    }, [message, isVisible, isMuted, speak, stop]);

    return (
        <motion.div 
            className="fixed bottom-8 right-8 z-[200] flex flex-col items-end w-fit max-w-sm pointer-events-auto"
            drag
            dragConstraints={{ left: -1500, right: 0, top: -800, bottom: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
            whileDrag={{ scale: 1.02, cursor: "grabbing" }}
            style={{ touchAction: "none" }}
        >
            <AnimatePresence>
                {isVisible && message && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="mb-4 bg-slate-900/90 backdrop-blur-md border border-white/10 px-5 py-4 rounded-3xl rounded-br-none max-w-sm shadow-[0_10px_40px_rgba(249,115,22,0.15)] relative group cursor-grab active:cursor-grabbing"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {/* Tail */}
                        <div className="absolute -bottom-2 right-6 md:right-8 w-4 h-4 bg-slate-900/95 border-b border-l border-white/10 transform rotate-[-45deg]" />
                        
                        <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                            <MessageSquare className="w-3 h-3 text-cyan-500 shrink-0" />
                            <h4 className="font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-cyan-400">Búho Capataz</h4>
                        </div>
                        <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed italic">
                            {displayedMessage}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="flex flex-row-reverse md:flex-row items-end gap-4 cursor-grab active:cursor-grabbing"
                    >
                        {/* Owl Avatar & Controls */}
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Evitar colisión con drag
                                    toggleMute();
                                    if (isMuted) {
                                      speak(message, true); 
                                    } else {
                                      stop();
                                    }
                                }}
                                className={cn(
                                    "p-2 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] border transition-all hover:scale-110 active:scale-95 cursor-pointer",
                                    isMuted 
                                        ? "bg-slate-800/80 border-slate-600 text-slate-400 hover:bg-slate-700" 
                                        : "bg-cyan-900/80 border-cyan-500/50 text-cyan-400 hover:bg-cyan-800"
                                )}
                                title={isMuted ? "Activar comunicación de radio" : "Silenciar radio"}
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>

                            <motion.div
                                animate={{ 
                                    y: [0, -8, 0],
                                    rotate: isSpeaking ? [-3, 3, -3, 3, 0] : 0 
                                }}
                                transition={{ 
                                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                                    rotate: { duration: 0.4, repeat: isSpeaking ? Infinity : 0 }
                                }}
                                className={cn(
                                    "w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-[0_10px_30px_rgba(249,115,22,0.3)] border-2 transition-all duration-300 relative",
                                    isSpeaking 
                                        ? "bg-gradient-to-b from-slate-800 to-slate-900 border-orange-500" 
                                        : "bg-gradient-to-b from-slate-900 to-black border-white/10"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    speak(message, true);
                                }}
                            >
                                {isSpeaking && (
                                    <div className="absolute inset-0 bg-orange-500 blur-xl opacity-30 rounded-[2rem] animate-pulse pointer-events-none" />
                                )}
                                <span className="relative z-10 drop-shadow-2xl pb-2">🦉</span>
                                
                                <div className="absolute -top-3 left-[50%] -translate-x-[50%] w-9 h-4 bg-yellow-400 rounded-t-full border-b-[3px] border-yellow-500 shadow-md z-20 flex items-center justify-center overflow-hidden pointer-events-none">
                                    <div className="w-full h-1 bg-white/30 absolute top-1 pointer-events-none" />
                                </div>
                                
                                <button 
                                  onClick={handleDismiss}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 border-2 border-black rounded-full text-white flex items-center justify-center hover:bg-red-500 transition-colors z-50 shadow-lg"
                                  title="Ocultar asistente"
                                >
                                  <X className="w-3 h-3" />
                                </button>

                                <div className="absolute -bottom-1 -right-2 bg-slate-800 p-1 rounded-full border border-white/10 shadow-lg z-30 transform -rotate-12 pointer-events-none">
                                    <Wrench className="w-3 h-3 text-cyan-400" />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

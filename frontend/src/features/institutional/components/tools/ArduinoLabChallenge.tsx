
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  Target,
  Search,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ArduinoLabChallengeProps {
    data: {
        parts: string[];
    };
    onComplete: () => void;
}

const ARDUINO_PARTS_INFO: Record<string, { name: string, description: string, pos: string }> = {
    'usb': { 
        name: 'Puerto USB', 
        description: 'Enlaza la placa con la terminal de control (PC) y suministra energía vital.',
        pos: "top-[15%] left-0 w-24 h-28"
    },
    'power_jack': { 
        name: 'Jack de Fuerza', 
        description: 'Entrada de energía auxiliar para operaciones de campo con baterías externas.',
        pos: "bottom-[12%] left-0 w-28 h-32"
    },
    'micro': { 
        name: 'Microcontrolador', 
        description: 'Cerebro central ATmega328P. Procesa cada línea de código en milisegundos.',
        pos: "bottom-[20%] right-[15%] w-32 h-40 transform -rotate-15"
    },
    'digital_pins': { 
        name: 'Pines Digitales', 
        description: 'Sensores lógicos binarios (D0-D13) para comunicación de alta velocidad.',
        pos: "top-2 right-4 w-[60%] h-12"
    },
    'analog_pins': { 
        name: 'Pines Analógicos', 
        description: 'Miden variaciones infinitesimales de voltaje en el entorno (A0-A5).',
        pos: "bottom-2 right-8 w-[40%] h-12"
    },
    'reset': { 
        name: 'Núcleo Reset', 
        description: 'Protocolo de reinicio de emergencia para purgar la memoria del procesador.',
        pos: "top-10 right-12 w-12 h-12 rounded-full"
    }
};

export const ArduinoLabChallenge = ({ data, onComplete }: ArduinoLabChallengeProps) => {
    const [foundParts, setFoundParts] = useState<string[]>([]);
    const [highlightedPart, setHighlightedPart] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [shake, setShake] = useState(false);

    const partsToFind = data.parts?.length > 0 ? data.parts : Object.keys(ARDUINO_PARTS_INFO);
    const currentPartId = partsToFind.find(p => !foundParts.includes(p));

    const handlePartClick = (id: string) => {
        if (isComplete) return;
        
        if (id === currentPartId) {
            const nextFound = [...foundParts, id];
            setFoundParts(nextFound);
            if (nextFound.length === partsToFind.length) {
                setIsComplete(true);
                setTimeout(onComplete, 2500);
            }
        } else {
            setHighlightedPart(id);
            setShake(true);
            setTimeout(() => {
                setHighlightedPart(null);
                setShake(false);
            }, 800);
        }
    };

    return (
        <div className="flex flex-col items-center gap-10 py-4 max-w-6xl mx-auto">
            {/* Header Estilo Táctico */}
            <div className="text-center space-y-2 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px]"
                >
                    <div className="h-px w-8 bg-cyan-500/30" />
                    <Target className="w-4 h-4" /> RECONOCIMIENTO DE HARDWARE
                    <div className="h-px w-8 bg-cyan-500/30" />
                </motion.div>
                
                <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">
                    UNIDAD <span className="text-cyan-500 arduino-glow">ARDUINO <span className="text-white/20">UNO</span></span>
                </h3>
                
                <div className="mt-4 flex flex-col items-center">
                   <div className="bg-slate-900/80 border-2 border-white/5 px-8 py-3 rounded-full backdrop-blur-xl flex items-center gap-4 relative overflow-hidden group">
                       <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       <Search className="w-5 h-5 text-cyan-400 animate-pulse" />
                       <p className="text-slate-300 font-bold uppercase tracking-[0.1em] text-sm">
                           OBJETIVO: <span className="text-white text-lg italic">{ARDUINO_PARTS_INFO[currentPartId!]?.name}</span>
                       </p>
                       <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_cyan]" />
                   </div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 opacity-50 italic">
                       Haz click en el componente real sobre la placa
                   </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-12 w-full justify-center">
                {/* Visualizador de Placa (Vista Superior) */}
                <div className="relative group p-10 bg-black/20 rounded-[4rem] border border-white/5 backdrop-blur-sm">
                    <div className="absolute inset-0 arduino-grid opacity-20 pointer-events-none rounded-[4rem]" />
                    
                    <motion.div 
                        animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
                        className="relative w-[340px] h-[480px] bg-[#005082] rounded-[3.5rem] border-[10px] border-[#003d63] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col p-4"
                    >
                        {/* Silk Screen Details */}
                        <div className="absolute top-8 left-14 opacity-20 pointer-events-none select-none">
                            <h4 className="text-[40px] font-black italic text-white tracking-widest -rotate-90 origin-top-left transform translate-y-20">ARDUINO</h4>
                        </div>
                        
                        <div className="absolute bottom-10 right-8 text-[12px] font-black italic text-white/40 uppercase tracking-[0.6em]">UNO R3</div>
                        
                        {/* Interactive Zones */}
                        {Object.keys(ARDUINO_PARTS_INFO).map((id) => (
                            <motion.button
                                key={id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePartClick(id)}
                                className={cn(
                                    "absolute transition-all rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden group",
                                    foundParts.includes(id) 
                                        ? "bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)] z-10" 
                                        : highlightedPart === id 
                                            ? "bg-red-500/30 border-2 border-red-500 z-20" 
                                            : "bg-black/5 hover:bg-white/5 border-2 border-transparent hover:border-cyan-500/40 z-0",
                                    ARDUINO_PARTS_INFO[id].pos
                                )}
                            >
                                <AnimatePresence>
                                    {foundParts.includes(id) && (
                                        <motion.div 
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex flex-col items-center gap-1"
                                        >
                                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">DETECTADO</span>
                                        </motion.div>
                                    )}
                                    {id === currentPartId && !foundParts.includes(id) && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-full animate-pulse-fast border-4 border-cyan-500/20 rounded-xl" />
                                            <Fingerprint className="w-8 h-8 text-cyan-400 opacity-20" />
                                        </div>
                                    )}
                                </AnimatePresence>
                                
                                {/* Micro Decorator */}
                                {id === 'micro' && !foundParts.includes(id) && (
                                   <div className="bg-slate-900 w-full h-full flex flex-col items-center justify-center border-x-4 border-slate-700">
                                       <div className="w-10 h-10 bg-slate-800 rounded-sm flex items-center justify-center mb-1">
                                           <Cpu className="w-6 h-6 text-slate-400" />
                                       </div>
                                       <div className="text-[6px] font-bold text-slate-500 tracking-widest">ATMEGA328P</div>
                                   </div>
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                </div>

                {/* Bitácora de Diagnóstico Industrial */}
                <div className="w-full lg:w-96 flex flex-col gap-6">
                    <div className="bg-[#0b1121] border-2 border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group h-[580px] flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.3em]">Status de Operación</h4>
                                <div className="text-2xl font-black italic tracking-tighter text-white">RECONOCIMIENTO</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocolo</span>
                                <span className="text-xs font-black text-white italic">HARDWARE-09</span>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {partsToFind.map((id) => (
                                <motion.div 
                                    key={id} 
                                    initial={false}
                                    animate={foundParts.includes(id) ? { x: 10 } : {}}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all duration-300 relative group/item",
                                        foundParts.includes(id) 
                                            ? "bg-emerald-500/5 border-emerald-500/20" 
                                            : id === currentPartId 
                                                ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                                                : "bg-white/5 border-transparent opacity-40"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-colors",
                                            foundParts.includes(id) ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/5 text-slate-600"
                                        )}>
                                            {foundParts.includes(id) ? <CheckCircle2 className="w-6 h-6" /> : <Search className="w-4 h-4 opacity-30" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-white uppercase tracking-widest leading-none">{ARDUINO_PARTS_INFO[id].name}</p>
                                            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tight leading-3">
                                                {ARDUINO_PARTS_INFO[id].description}
                                            </p>
                                        </div>
                                    </div>
                                    {id === currentPartId && !foundParts.includes(id) && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <motion.div 
                                                animate={{ scale: [1, 1.2, 1] }} 
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                className="w-2 h-2 rounded-full bg-cyan-500" 
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                             <div className="bg-slate-900/40 p-3 rounded-xl flex items-center justify-between border border-white/5">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progreso Global</span>
                                 <span className="text-xs font-black text-cyan-500 italic">
                                     {Math.round((foundParts.length / partsToFind.length) * 100)}%
                                 </span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de éxito ultra-futurista */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[500] flex items-center justify-center bg-[#020617]/95 backdrop-blur-3xl overflow-hidden"
                    >
                        <div className="absolute inset-0 arduino-grid opacity-10" />
                        
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: "spring", damping: 15 }}
                            className="text-center space-y-12 relative z-10"
                        >
                            <div className="relative inline-block">
                                <motion.div 
                                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                    transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
                                    className="w-64 h-64 border-[1px] border-cyan-500/20 rounded-full flex items-center justify-center relative"
                                >
                                    <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full" />
                                    <Cpu className="w-32 h-32 text-cyan-500" />
                                </motion.div>
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                    className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500 rounded-full border-8 border-[#020617] flex items-center justify-center text-white"
                                >
                                    <CheckCircle2 className="w-10 h-10" />
                                </motion.div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
                                    HARDWARE <br />
                                    <span className="text-cyan-500 arduino-glow">SINCRONIZADO</span>
                                </h2>
                                <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-sm">Transferencia de Datos Completada</p>
                            </div>

                            <motion.div 
                                animate={{ width: ["0%", "100%"] }}
                                transition={{ duration: 2 }}
                                className="h-1 bg-cyan-500 shadow-[0_0_15px_cyan] mx-auto"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .arduino-glow {
                    text-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
                }
                .arduino-grid {
                    background-image: linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .animate-pulse-fast {
                    animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .arduino-board-texture {
                    background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 100%);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(6, 182, 212, 0.2);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

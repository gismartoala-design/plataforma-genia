
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Flag, 
  ShieldAlert,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlgoritmoChallengeProps {
    data: {
        grid: number[];
        startIdx: number;
        targetIdx: number;
        obstacles: number[];
    };
    onComplete: () => void;
}

export const AlgoritmoChallenge = ({ data, onComplete }: AlgoritmoChallengeProps) => {
    const [currentIdx, setCurrentIdx] = useState(data.startIdx);
    const [path, setPath] = useState<number[]>([data.startIdx]);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
        if (isComplete) return;
        
        const row = Math.floor(currentIdx / 5);
        const col = currentIdx % 5;
        let nextIdx = currentIdx;

        if (direction === 'up' && row > 0) nextIdx -= 5;
        else if (direction === 'down' && row < 4) nextIdx += 5;
        else if (direction === 'left' && col > 0) nextIdx -= 1;
        else if (direction === 'right' && col < 4) nextIdx += 1;
        else return;

        if (data.obstacles.includes(nextIdx)) {
            setError("¡Obstáculo detectado! El robot no puede pasar por aquí.");
            setTimeout(() => setError(null), 2000);
            return;
        }

        setCurrentIdx(nextIdx);
        setPath([...path, nextIdx]);

        if (nextIdx === data.targetIdx) {
            setIsComplete(true);
            setTimeout(onComplete, 1500);
        }
    };

    const reset = () => {
        setCurrentIdx(data.startIdx);
        setPath([data.startIdx]);
        setIsComplete(false);
        setError(null);
    };

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-cyan-400">Ruta de Navegación</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Guía al Neo-Bot hasta el punto de suministro</p>
            </div>

            <div className="relative">
                <div className="grid grid-cols-5 gap-2 p-4 bg-slate-900/80 rounded-[2.5rem] border-4 border-white/5 shadow-2xl backdrop-blur-md">
                    {Array(25).fill(0).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border-2 transition-all relative overflow-hidden",
                                i === currentIdx ? "bg-cyan-500/30 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] z-10" :
                                i === data.targetIdx ? "bg-orange-500/20 border-orange-500/50" :
                                data.obstacles.includes(i) ? "bg-red-950/40 border-red-900/30" :
                                path.includes(i) ? "bg-cyan-500/10 border-cyan-500/20" :
                                "bg-white/5 border-white/5"
                            )}
                        >
                            {i === currentIdx && (
                                <motion.div layoutId="bot" className="relative z-10">
                                    <Bot className="w-8 h-8 text-cyan-300" />
                                </motion.div>
                            )}
                            {i === data.targetIdx && <Flag className="w-8 h-8 text-orange-400 animate-bounce" />}
                            {data.obstacles.includes(i) && <ShieldAlert className="w-6 h-6 text-red-500/20" />}
                            
                            {/* Path trail */}
                            {path.includes(i) && i !== currentIdx && (
                                <div className="absolute inset-0 bg-cyan-400/5 animate-pulse" />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -bottom-12 left-0 right-0 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-center"
                        >
                            <span className="text-red-400 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                <AlertCircle className="w-3 h-3" /> {error}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
                <div />
                <Button variant="outline" className="h-16 rounded-2xl bg-white/5 border-white/10 hover:bg-cyan-500/20" onClick={() => handleMove('up')}>
                    <ChevronRight className="w-6 h-6 -rotate-90" />
                </Button>
                <div />
                <Button variant="outline" className="h-16 rounded-2xl bg-white/5 border-white/10 hover:bg-cyan-500/20" onClick={() => handleMove('left')}>
                    <ChevronRight className="w-6 h-6 rotate-180" />
                </Button>
                <Button variant="outline" className="h-16 rounded-2xl bg-white/5 border-white/10 hover:bg-cyan-500/20" onClick={() => handleMove('down')}>
                    <ChevronRight className="w-6 h-6 rotate-90" />
                </Button>
                <Button variant="outline" className="h-16 rounded-2xl bg-white/5 border-white/10 hover:bg-cyan-500/20" onClick={() => handleMove('right')}>
                    <ChevronRight className="w-6 h-6" />
                </Button>
            </div>

            <Button 
                variant="ghost" 
                onClick={reset}
                className="text-slate-500 hover:text-white uppercase tracking-[0.2em] font-black text-[9px] gap-2"
            >
                <RotateCcw className="w-3 h-3" /> Reiniciar Misión
            </Button>

            {isComplete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-xl">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900 border-2 border-cyan-500 p-12 rounded-[3rem] text-center space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.3)]"
                    >
                        <CheckCircle2 className="w-20 h-20 text-cyan-400 mx-auto" />
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Suministro <span className="text-cyan-400">Entregado</span></h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando siguiente protocolo...</p>
                    </motion.div>
                </div>
            )}
        </div>
    );
};


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  CheckCircle2,
  AlertCircle,
  Tag,
  CircleDot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClasificacionChallengeProps {
    data: {
        categories: string[];
        items: { text: string; categoryIdx: number }[];
    };
    onComplete: () => void;
}

export const ClasificacionChallenge = ({ data, onComplete }: ClasificacionChallengeProps) => {
    const [currentItemIdx, setCurrentItemIdx] = useState(0);
    const [selections, setSelections] = useState<number[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const currentItem = data.items[currentItemIdx];

    const handleSelect = (categoryIdx: number) => {
        if (isComplete || feedback) return;

        if (categoryIdx === currentItem.categoryIdx) {
            setFeedback({ type: 'success', text: '¡Correcto!' });
            const nextIdx = currentItemIdx + 1;
            
            setTimeout(() => {
                setFeedback(null);
                if (nextIdx < data.items.length) {
                    setCurrentItemIdx(nextIdx);
                } else {
                    setIsComplete(true);
                    setTimeout(onComplete, 2000);
                }
            }, 1000);
        } else {
            setFeedback({ type: 'error', text: 'Incorrecto. Intenta de nuevo.' });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    return (
        <div className="max-w-xl mx-auto w-full space-y-12 py-10">
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-amber-500 font-black uppercase tracking-[0.3em] text-[10px]">
                    <Layers className="w-5 h-5" /> Protocolo de Clasificación
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">
                    Elementos de <span className="text-amber-500">Clasificación</span>
                </h3>
            </div>

            <div className="relative min-h-[160px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {!isComplete && (
                        <motion.div
                            key={currentItemIdx}
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 1.2, opacity: 0, y: -20 }}
                            className="bg-slate-900 border-2 border-white/10 rounded-[2.5rem] p-10 w-full text-center shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/20">
                                <motion.div 
                                    className="h-full bg-amber-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentItemIdx + 1) / data.items.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Elemento {currentItemIdx + 1} de {data.items.length}</span>
                            <h4 className="text-3xl font-bold italic text-white tracking-tight">{currentItem.text}</h4>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {feedback && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className={cn(
                                "absolute inset-0 z-20 flex items-center justify-center rounded-[2.5rem] backdrop-blur-md",
                                feedback.type === 'success' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                            )}
                        >
                            <div className="flex flex-col items-center gap-2">
                                {feedback.type === 'success' ? <CheckCircle2 className="w-16 h-16" /> : <AlertCircle className="w-16 h-16" />}
                                <span className="text-xl font-black uppercase italic tracking-widest">{feedback.text}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {data.categories.map((cat, i) => (
                    <Button
                        key={i}
                        onClick={() => handleSelect(i)}
                        disabled={!!feedback || isComplete}
                        className={cn(
                            "h-24 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 group",
                            i === 0 
                                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white" 
                                : "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white"
                        )}
                    >
                        <Tag className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                        <span className="font-black uppercase tracking-widest text-xs italic">{cat}</span>
                    </Button>
                ))}
            </div>

            {isComplete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-xl pointer-events-none">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-4"
                    >
                        <CheckCircle2 className="w-24 h-24 text-emerald-400 mx-auto" />
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Clasificación <span className="text-emerald-400 text-glitch">Completa</span></h2>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

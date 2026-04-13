
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HardHat } from 'lucide-react';

interface RPGPlayerProps {
    name: string;
    isWalking: boolean;
    direction: 'left' | 'right' | 'up' | 'down';
    isSaluting: boolean;
}

export const RPGPlayer = ({ name, isWalking, direction, isSaluting }: RPGPlayerProps) => {
    const isFlipped = direction === 'left';

    return (
        <div className="relative flex flex-col items-center">
            {/* Salute Bubble (Engineer Style) */}
            <AnimatePresence>
                {isSaluting && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -60, scale: 1 }}
                        exit={{ opacity: 0, y: 0, scale: 0.5 }}
                        className="absolute z-[60] bg-[var(--inst-peach)] text-[var(--inst-slate)] px-4 py-2 rounded-3xl rounded-bl-none text-[12px] font-black uppercase shadow-xl border-[6px] border-[var(--inst-slate)] flex items-center gap-2 whitespace-nowrap"
                    >
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        ¡HOLA INGENIERO!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shadow */}
            <motion.div 
                animate={{ scale: isWalking ? [0.8, 1.1, 0.8] : 1 }}
                transition={{ repeat: Infinity, duration: 0.35 }}
                className="w-14 h-5 bg-black/50 blur-lg rounded-full absolute -bottom-3"
            />

            {/* Engineer Body (Pill Shape with Safety Vibe) */}
            <motion.div
                animate={{ 
                    y: isWalking ? [0, -10, 0] : 0,
                    rotateY: isFlipped ? 180 : 0,
                    rotateZ: isWalking ? [-4, 4, -4] : 0
                }}
                transition={{ 
                    y: { repeat: Infinity, duration: 0.35, ease: "easeInOut" },
                    rotateZ: { repeat: Infinity, duration: 0.35, ease: "easeInOut" },
                    rotateY: { type: "spring", stiffness: 300, damping: 25 }
                }}
                className="relative"
            >
                {/* Backpack (Toolbox) */}
                <div className="absolute -left-4 top-5 w-8 h-12 bg-[var(--inst-mauve)] rounded-xl border-[6px] border-[var(--inst-slate)] shadow-inner" />
                
                {/* Main Body (Salmon / Rose) */}
                <div className="w-16 h-22 bg-[var(--inst-salmon)] rounded-[3rem] border-[6px] border-[var(--inst-slate)] relative overflow-hidden shadow-2xl">
                    {/* Safety Vest Detail */}
                    <div className="absolute top-[40%] left-0 right-0 h-4 bg-[var(--inst-peach)] border-y-2 border-[var(--inst-slate)]/20 opacity-80" />
                    
                    {/* Bottom Dark Layer */}
                    <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-[var(--inst-rose)]/40" />
                    
                    {/* Tech Visor */}
                    <div className="absolute top-5 left-5 right-0 h-10 bg-[var(--inst-slate)] rounded-l-[2rem] flex items-center pl-1">
                        <div className="w-full h-[85%] bg-[var(--inst-mauve)]/30 rounded-l-[1.5rem] relative overflow-hidden">
                            <div className="absolute top-1.5 left-3 w-[60%] h-2.5 bg-white/40 rounded-full blur-[1px]" />
                        </div>
                    </div>
                </div>

                {/* Legs */}
                <div className="absolute -bottom-3 left-0 flex gap-3 w-full px-1">
                    <motion.div animate={{ y: isWalking ? [0, 6, 0] : 0 }} className="w-7 h-8 bg-[var(--inst-rose)]/60 rounded-b-2xl border-x-[6px] border-b-[6px] border-[var(--inst-slate)]" />
                    <motion.div animate={{ y: isWalking ? [0, 6, 0] : 0 }} transition={{ delay: 0.17 }} className="w-7 h-8 bg-[var(--inst-rose)]/60 rounded-b-2xl border-x-[6px] border-b-[6px] border-[var(--inst-slate)]" />
                </div>

                {/* Saluting Action */}
                <AnimatePresence>
                    {isSaluting && (
                        <motion.div
                            initial={{ scale: 0, x: 20 }}
                            animate={{ scale: 1.4, x: 10, rotate: [0, -20, 20, 0] }}
                            className="absolute -right-6 top-4 w-10 h-10 flex items-center justify-center bg-white rounded-full border-[6px] border-black text-2xl shadow-2xl z-50"
                        >
                           🛠️
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Label - Engineer Name */}
            <div className="mt-10 px-5 py-2 bg-[var(--inst-peach)] border-[5px] border-[var(--inst-slate)] rounded-[1.2rem] text-[10px] font-black uppercase text-[var(--inst-slate)] shadow-[0_6px_0_var(--inst-slate)] tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--inst-rose)] animate-pulse" />
                ING. {name}
            </div>
        </div>
    );
};

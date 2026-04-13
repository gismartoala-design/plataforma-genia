
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon, WifiOff, AlertCircle, Wrench, Construction } from 'lucide-react';


interface Building2DProps {
    icon: LucideIcon;
    name: string;
    isRepaired: boolean;
    isLocked: boolean;
    isNext: boolean;
    isNear: boolean;
}

export const Building2D = ({ icon: Icon, name, isRepaired, isLocked, isNext, isNear }: Building2DProps) => {
    // States based on mission status
    const hasFault = isNext && !isRepaired;
    const isLit = isRepaired || (isNext && isNear);
    const hasConnectivityError = isNext && !isRepaired; // For "No Internet" visual

    return (
        <div className="relative group flex flex-col items-center">
            {/* Building Structure (Urban Style) */}
            <div className={cn(
                "relative w-36 h-44 transition-all duration-700",
                isLocked ? "opacity-30 grayscale blur-[1px]" : "opacity-100"
            )}>
                {/* Roof Detail */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[90%] h-6 bg-[var(--inst-slate)] border-[5px] border-[var(--inst-slate)]/50 rounded-t-xl z-20" />
                
                {/* Main Building Block */}
                <div className={cn(
                    "w-full h-full bg-[var(--inst-mauve)] border-[6px] border-[var(--inst-slate)] rounded-xl relative transition-all duration-700 shadow-[0_20px_0_rgba(98,98,112,0.5)] overflow-hidden",
                    isLit ? "bg-[var(--inst-cyan)]/10 border-[var(--inst-blue)] shadow-[0_20px_0_var(--inst-blue)]" : 
                    hasFault ? "bg-[#1e293b] border-[var(--inst-mauve)] shadow-[0_20px_0_rgba(0,0,0,0.3)]" : "bg-[var(--inst-mauve)]"
                )}>
                    {/* Bricks/Panels Texture */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-4 grid-rows-6 gap-1 p-2">
                        {Array(24).fill(0).map((_, i) => <div key={i} className="border border-white/20" />)}
                    </div>

                    {/* Windows Grid */}
                    <div className="absolute inset-x-0 top-14 px-4 grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <motion.div 
                                key={i}
                                animate={{ 
                                    backgroundColor: isLit ? ["var(--inst-cyan)", "var(--inst-blue-lt)"] : "rgba(3,4,94,0.4)",
                                    boxShadow: isLit ? "0 0 20px rgba(0,180,216,0.5)" : "inset 0 0 5px rgba(0,0,0,0.2)"
                                }}
                                className="h-6 rounded-md transition-all duration-1000 border-2 border-[var(--inst-slate)]/40"
                            />
                        ))}
                    </div>

                    {/* Under Construction Indicator (replaces red fault) */}
                    {hasFault && (
                        <div className="absolute top-2 right-2">
                            <motion.div 
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="bg-amber-500 p-1 rounded-full border-2 border-amber-700"
                            >
                                <Wrench className="w-3 h-3 text-white" />
                            </motion.div>
                        </div>
                    )}

                    {/* Entrance / Main Icon Display */}
                    <div className={cn(
                        "absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-10 border-4 border-[var(--inst-slate)] rounded-lg flex items-center justify-center transition-all",
                        isLit ? "bg-[var(--inst-blue)]/20" : "bg-[var(--inst-slate)]/30"
                    )}>
                        <Icon className={cn(
                            "w-6 h-6 transition-all duration-700",
                            isLit ? "text-[var(--inst-blue)] drop-shadow-[0_0_10px_var(--inst-blue)]" : 
                            hasFault ? "text-[var(--inst-gold)] animate-pulse" : "text-[var(--inst-slate)]/40"
                        )} />
                    </div>
                </div>

                {/* Antenna / Cable Detail */}
                <div className="absolute -right-2 top-8 w-1 h-32 bg-slate-900 border-x-2 border-black" />
                {hasConnectivityError && (
                    <motion.div 
                       animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                       transition={{ repeat: Infinity, duration: 2 }}
                       className="absolute -right-4 top-2 w-5 h-5 bg-amber-400 rounded-full border-2 border-amber-700 blur-[1px]" 
                    />
                )}
            </div>

            {/* Label - Technical District */}
            <div className={cn(
                "mt-8 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-4 border-[var(--inst-slate)] shadow-[6px_6px_0_var(--inst-slate)] transition-all duration-700",
                isLit ? "bg-[var(--inst-blue)] text-white" : 
                hasFault ? "bg-amber-500 text-white" : "bg-[var(--inst-peach)] text-[var(--inst-slate)]/40"
            )}>
                {name}
            </div>

            {/* Status Text Overlay */}
            <AnimatePresence>
                {hasFault && !isNear && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute -top-14 bg-amber-50 border-2 border-amber-400 text-amber-700 px-4 py-2 rounded-xl text-[9px] font-bold uppercase shadow-xl flex items-center gap-2"
                        >
                            <Construction className="w-4 h-4 text-amber-500" />
                            EN REPARACIÓN
                        </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

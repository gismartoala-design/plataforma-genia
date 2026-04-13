import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Minus,
    Bot,
    Flag,
    ShieldAlert,
    Save,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlgoritmoEditorProps {
    data: any;
    onSave: (data: any) => void;
    isReadOnly?: boolean;
}

export const AlgoritmoEditor = ({ data, onSave, isReadOnly = false }: AlgoritmoEditorProps) => {
    const [grid, setGrid] = useState<number[]>(data.grid || Array(25).fill(0));
    const [startIdx, setStartIdx] = useState(data.startIdx ?? 0);
    const [targetIdx, setTargetIdx] = useState(data.targetIdx ?? 24);
    const [obstacles, setObstacles] = useState<number[]>(data.obstacles || []);
    const [brush, setBrush] = useState<'start' | 'target' | 'obstacle' | 'clear'>('obstacle');

    const handleTileClick = (idx: number) => {
        if (isReadOnly) return;
        if (brush === 'start') {
            setStartIdx(idx);
            setObstacles(prev => prev.filter(o => o !== idx));
            if (targetIdx === idx) setTargetIdx(-1);
        } else if (brush === 'target') {
            setTargetIdx(idx);
            setObstacles(prev => prev.filter(o => o !== idx));
            if (startIdx === idx) setStartIdx(-1);
        } else if (brush === 'obstacle') {
            if (idx === startIdx || idx === targetIdx) return;
            if (!obstacles.includes(idx)) {
                setObstacles([...obstacles, idx]);
            }
        } else if (brush === 'clear') {
            setObstacles(prev => prev.filter(o => o !== idx));
            if (idx === startIdx) setStartIdx(-1);
            if (idx === targetIdx) setTargetIdx(-1);
        }
    };

    return (
        <div className="space-y-6">
            {!isReadOnly && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-2 overflow-x-auto">
                    {[
                        { id: 'start', icon: Bot, label: 'Inicio', color: 'text-cyan-400' },
                        { id: 'target', icon: Flag, label: 'Meta', color: 'text-orange-400' },
                        { id: 'obstacle', icon: ShieldAlert, label: 'Obstáculo', color: 'text-red-400' },
                        { id: 'clear', icon: Trash2, label: 'Limpiar', color: 'text-slate-400' }
                    ].map(b => (
                        <Button
                            key={b.id}
                            variant={brush === b.id ? 'default' : 'outline'}
                            className={cn(
                                "rounded-xl gap-2 h-12 px-4 shrink-0 font-bold uppercase tracking-widest text-[10px]",
                                brush === b.id && "bg-orange-500 hover:bg-orange-600"
                            )}
                            onClick={() => setBrush(b.id as any)}
                        >
                            <b.icon className={cn("w-4 h-4", brush !== b.id && b.color)} />
                            {b.label}
                        </Button>
                    ))}
                </div>
            )}

            <div className="flex justify-center">
                <div className="grid grid-cols-5 gap-2 p-4 bg-slate-900 rounded-[2rem] border-4 border-white/5 shadow-2xl relative">
                    {grid.map((_, i) => (
                        <motion.div
                            key={i}
                            whileHover={!isReadOnly ? { scale: 1.05 } : {}}
                            whileTap={!isReadOnly ? { scale: 0.95 } : {}}
                            onClick={() => handleTileClick(i)}
                            className={cn(
                                "w-16 h-16 rounded-xl transition-all flex items-center justify-center border-2",
                                isReadOnly ? "cursor-default" : "cursor-pointer",
                                i === startIdx ? "bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]" :
                                    i === targetIdx ? "bg-orange-500/20 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]" :
                                        obstacles.includes(i) ? "bg-red-500/20 border-red-500/50" :
                                            "bg-white/5 border-white/5 hover:border-white/20"
                            )}
                        >
                            {i === startIdx && <Bot className="w-8 h-8 text-cyan-400" />}
                            {i === targetIdx && <Flag className="w-8 h-8 text-orange-400" />}
                            {obstacles.includes(i) && <ShieldAlert className="w-8 h-8 text-red-400/50" />}
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2 italic">Configuración de Lógica</p>
                <div className="flex items-center gap-4 text-slate-400 text-xs font-medium">
                    <span>Posición Inicial: [ {startIdx !== -1 ? `${Math.floor(startIdx / 5)}, ${startIdx % 5}` : '---'} ]</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>Meta: [ {targetIdx !== -1 ? `${Math.floor(targetIdx / 5)}, ${targetIdx % 5}` : '---'} ]</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>Obstáculos: {obstacles.length}</span>
                </div>
            </div>

            {!isReadOnly && (
                <Button
                    onClick={() => onSave({ grid, startIdx, targetIdx, obstacles })}
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest italic"
                >
                    Confirmar Configuración de Algoritmo
                </Button>
            )}
        </div>
    );
};

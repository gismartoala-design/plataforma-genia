import React, { useState } from 'react';
import { Save, Layout, Trash2, Plus, Terminal, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PythonLabEditorProps {
    data: any;
    onSave: (data: any) => void;
    isReadOnly?: boolean;
}

export const PythonLabEditor = ({ data, onSave, isReadOnly = false }: PythonLabEditorProps) => {
    const [config, setConfig] = useState({
        titulo: data.titulo || 'Nuevo Reto Python',
        instrucciones: data.instrucciones || '',
        mapa: data.mapa || [0, 0, 0, 1, 0, 0, 1, 0, 0, 2],
        codigoBase: data.codigoBase || '# Define tus variables\ntecla_salto = " "\ntecla_derecha = "ArrowRight"\n\n# Programa las acciones\nbind_key(tecla_derecha, "walk")\nbind_key(tecla_salto, "jump")\n\nprint("¡Sistemas operativos!")'
    });

    const handleToggleBlock = (index: number) => {
        if (isReadOnly) return;
        const newMapa = [...config.mapa];
        // 0 -> 1 -> 2 -> 0
        newMapa[index] = (newMapa[index] + 1) % 3;
        setConfig({ ...config, mapa: newMapa });
    };

    const handleSave = () => {
        if (isReadOnly) return;
        onSave(config);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Título del Reto</Label>
                    <Input
                        readOnly={isReadOnly}
                        value={config.titulo}
                        onChange={(e) => setConfig({ ...config, titulo: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-xl h-12 text-white font-bold"
                    />
                </div>

                <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Misión / Instrucciones</Label>
                    <Textarea
                        readOnly={isReadOnly}
                        value={config.instrucciones}
                        onChange={(e) => setConfig({ ...config, instrucciones: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-xl min-h-[100px] text-white/70"
                        placeholder="Ej: Logra que el personaje cruce los dos pozos de lava..."
                    />
                </div>
            </div>

            {/* Editor de Mapa */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Diseño del Nivel (10 Bloques)</Label>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-orange-800" />
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Suelo</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-600" />
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Pozo</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Meta</span>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex gap-1">
                    {config.mapa.map((type: number, i: number) => (
                        <TooltipProvider key={i}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleToggleBlock(i)}
                                        className={cn(
                                            "flex-1 h-12 rounded-lg border-2 transition-all",
                                            !isReadOnly && "hover:scale-105 active:scale-95",
                                            type === 0 ? "bg-orange-950/30 border-orange-800/50" :
                                                type === 1 ? "bg-red-900/40 border-red-600 animate-pulse" :
                                                    "bg-emerald-900/40 border-emerald-500",
                                            isReadOnly ? "cursor-default" : "cursor-pointer"
                                        )}
                                    />
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="bg-slate-900 border-white/10 text-[10px] font-bold uppercase tracking-widest">
                                    Bloque {i + 1}: {type === 0 ? 'Suelo' : type === 1 ? 'Peligro' : 'Final'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
                {!isReadOnly && (
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center italic">
                        Haz click en los bloques para cambiar el tipo de terreno
                    </p>
                )}
            </div>

            {/* Código Base / Plantilla */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-4 h-4 text-yellow-400" />
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Código Inicial (Python)</Label>
                </div>
                <div className="relative group">
                    <Textarea
                        readOnly={isReadOnly}
                        value={config.codigoBase}
                        onChange={(e) => setConfig({ ...config, codigoBase: e.target.value })}
                        className="bg-slate-950 border-white/10 rounded-2xl min-h-[150px] font-mono text-cyan-400 text-xs shadow-inner"
                    />
                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 transition-opacity">
                        <Info className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            {!isReadOnly && (
                <Button
                    onClick={handleSave}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-xl h-12 font-black uppercase tracking-widest text-xs gap-2"
                >
                    <Save className="w-4 h-4" /> Guardar Configuración de Laboratorio
                </Button>
            )}
        </div>
    );
};

import React, { useState } from 'react';
import {
    ClipboardList,
    Target,
    Star,
    FileUp,
    Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TareaEditorProps {
    data: any;
    onSave: (data: any) => void;
    isReadOnly?: boolean;
}

export const TareaEditor = ({ data, onSave, isReadOnly = false }: TareaEditorProps) => {
    const [titulo, setTitulo] = useState(data.titulo || '');
    const [consigna, setConsigna] = useState(data.consigna || '');
    const [criterio, setCriterio] = useState(data.criterio || '');
    const [puntos, setPuntos] = useState(data.puntos || 100);

    return (
        <div className="space-y-8 p-1">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-orange-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-orange-400">Título de la Entrega</Label>
                </div>
                <Input
                    readOnly={isReadOnly}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Informe de Instalación de Circuito..."
                    className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-orange-500/50 transition-all text-white font-bold"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center" title="Consigna">
                        <ClipboardList className="w-5 h-5 text-cyan-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400">Instrucciones Detalladas</Label>
                </div>
                <Textarea
                    readOnly={isReadOnly}
                    value={consigna}
                    onChange={(e) => setConsigna(e.target.value)}
                    placeholder="Describa qué debe entregar el estudiante y cómo hacerlo..."
                    className="min-h-[120px] bg-slate-900 border-white/10 rounded-2xl p-6 focus:border-cyan-500/50 transition-all text-white font-medium italic"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Star className="w-5 h-5 text-emerald-400" />
                        </div>
                        <Label className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Puntos Disponibles</Label>
                    </div>
                    <Input
                        readOnly={isReadOnly}
                        type="number"
                        value={puntos}
                        onChange={(e) => setPuntos(parseInt(e.target.value))}
                        className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-emerald-500/50 transition-all text-white font-black text-center text-xl"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-white/10 flex items-center justify-center">
                            <FileUp className="w-5 h-5 text-white/50" />
                        </div>
                        <Label className="text-sm font-black uppercase tracking-[0.2em] text-white/50">Formato Requerido</Label>
                    </div>
                    <div className="h-14 bg-slate-900 border-white/10 rounded-xl flex items-center justify-center text-xs font-black text-white/30 uppercase tracking-widest px-4 text-center">
                        Cualquier archivo (PDF, Imagen, Proyectos)
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center" title="Feedback">
                        <Star className="w-5 h-5 text-indigo-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400">Criterio de Evaluación</Label>
                </div>
                <Input
                    readOnly={isReadOnly}
                    value={criterio}
                    onChange={(e) => setCriterio(e.target.value)}
                    placeholder="Ej: Se evaluará la precisión del diagrama..."
                    className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-indigo-500/50 transition-all text-white font-medium"
                />
            </div>

            {!isReadOnly && (
                <Button
                    onClick={() => onSave({ titulo, consigna, puntos, criterio })}
                    disabled={!titulo || !consigna}
                    className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest italic"
                >
                    Confirmar Configuración Tarea
                </Button>
            )}
        </div>
    );
};

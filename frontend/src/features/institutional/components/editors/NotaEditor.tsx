import React, { useState } from 'react';
import {
    FileText,
    BookOpen,
    Info,
    Maximize2,
    Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NotaEditorProps {
    data: any;
    onSave: (data: any) => void;
    isReadOnly?: boolean;
}

export const NotaEditor = ({ data, onSave, isReadOnly = false }: NotaEditorProps) => {
    const [titulo, setTitulo] = useState(data.titulo || '');
    const [contenido, setContenido] = useState(data.contenido || '');
    const [categoria, setCategoria] = useState(data.categoria || 'tecnica'); // tecnica, aviso, curiosidad

    return (
        <div className="space-y-8 p-1">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-cyan-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400">Encabezado de la Nota</Label>
                </div>
                <Input
                    readOnly={isReadOnly}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Fundamentos de Propulsión Eléctrica..."
                    className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-cyan-500/50 transition-all text-white font-bold"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-sky-400" />
                        </div>
                        <Label className="text-sm font-black uppercase tracking-[0.2em] text-sky-400">Cuerpo de la Nota</Label>
                    </div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                        Soporta Markdown (Simplificado)
                    </div>
                </div>
                <Textarea
                    readOnly={isReadOnly}
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder="Escriba aquí la teoría, pasos o información que desea transmitir..."
                    className="min-h-[250px] bg-slate-900 border-white/10 rounded-2xl p-6 focus:border-sky-500/50 transition-all text-white font-medium leading-relaxed"
                />
            </div>

            <div className="flex gap-3">
                {['tecnica', 'aviso', 'curiosidad'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => !isReadOnly && setCategoria(cat)}
                        className={`
                            flex-1 h-12 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                            ${categoria === cat
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                : 'bg-slate-900 border-white/10 text-white/30 hover:border-white/20'}
                            ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {!isReadOnly && (
                <Button
                    onClick={() => onSave({ titulo, contenido, categoria })}
                    disabled={!titulo || !contenido}
                    className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest italic"
                >
                    Confirmar Nota Técnica
                </Button>
            )}
        </div>
    );
};

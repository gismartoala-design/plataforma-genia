import React, { useState } from 'react';
import { Link2, Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LinkEditorProps {
    data: any;
    onSave: (data: any) => void;
    isReadOnly?: boolean;
}

export const LinkEditor = ({ data, onSave, isReadOnly = false }: LinkEditorProps) => {
    const [url, setUrl] = useState(data.url || '');
    const [titulo, setTitulo] = useState(data.titulo || '');

    return (
        <div className="space-y-6 p-1">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-sky-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-sky-400">Nombre del Enlace</Label>
                </div>
                <Input
                    readOnly={isReadOnly}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Datasheet del Microcontrolador..."
                    className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-sky-500/50 transition-all text-white font-bold"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-white/10 flex items-center justify-center">
                        <Link2 className="w-5 h-5 text-white/50" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-white/50">URL de Destino</Label>
                </div>
                <Input
                    readOnly={isReadOnly}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://recursos-externos.com/tema"
                    className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-sky-500/50 transition-all text-white font-medium"
                />
            </div>

            {!isReadOnly && (
                <Button
                    onClick={() => onSave({ url, titulo })}
                    disabled={!url || !titulo}
                    className="w-full h-14 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest italic"
                >
                    Confirmar Enlace
                </Button>
            )}
        </div>
    );
};

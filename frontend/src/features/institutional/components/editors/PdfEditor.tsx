import React, { useState } from 'react';
import { FileText, Link2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PdfEditorProps {
    data: any;
    onSave: (data: any) => void;
    isReadOnly?: boolean;
}

export const PdfEditor = ({ data, onSave, isReadOnly = false }: PdfEditorProps) => {
    const [url, setUrl] = useState(data.url || '');
    const [titulo, setTitulo] = useState(data.titulo || '');

    return (
        <div className="space-y-6 p-1">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Título del PDF</Label>
                </div>
                <Input
                    readOnly={isReadOnly}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Planos de Sistema de Gas..."
                    className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-emerald-500/50 transition-all text-white font-bold"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-white/10 flex items-center justify-center">
                        <Link2 className="w-5 h-5 text-white/50" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-white/50">URL del PDF (Hospedaje)</Label>
                </div>
                <Input
                    readOnly={isReadOnly}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://recursos.edu/planos.pdf"
                    className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-emerald-500/50 transition-all text-white font-medium"
                />
            </div>

            {!isReadOnly && (
                <Button
                    onClick={() => onSave({ url, titulo })}
                    disabled={!url || !titulo}
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest italic"
                >
                    Confirmar PDF
                </Button>
            )}
        </div>
    );
};

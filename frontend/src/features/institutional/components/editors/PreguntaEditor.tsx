import React, { useState } from 'react';
import {
    HelpCircle,
    MessageSquare,
    ShieldCheck,
    Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PreguntaEditorProps {
    data: any;
    onSave: (data: any) => void;
    isReadOnly?: boolean;
}

export const PreguntaEditor = ({ data, onSave, isReadOnly = false }: PreguntaEditorProps) => {
    const [pregunta, setPregunta] = useState(data.pregunta || '');
    const [feedback, setFeedback] = useState(data.feedback || '');

    return (
        <div className="space-y-8 p-1">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-cyan-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400">Pregunta de Reflexión</Label>
                </div>
                <Textarea
                    readOnly={isReadOnly}
                    value={pregunta}
                    onChange={(e) => setPregunta(e.target.value)}
                    onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                    }}
                    placeholder="Escriba aquí la consigna o pregunta para el estudiante..."
                    className="min-h-[120px] bg-slate-900 border-white/10 rounded-2xl p-6 focus:border-cyan-500/50 transition-all text-white font-medium italic resize-none overflow-hidden"
                    style={{ height: 'auto' }}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Feedback de Validación</Label>
                </div>
                <Textarea
                    readOnly={isReadOnly}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                    }}
                    placeholder="Mensaje que aparecerá al completar la actividad (ej: ¡Excelente análisis!)"
                    className="min-h-[100px] bg-slate-900 border-white/10 rounded-2xl p-6 focus:border-emerald-500/50 transition-all text-white font-medium resize-none overflow-hidden"
                    style={{ height: 'auto' }}
                />
            </div>

            {!isReadOnly && (
                <Button
                    onClick={() => onSave({ pregunta, feedback })}
                    disabled={!pregunta}
                    className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest italic"
                >
                    Confirmar Pregunta Técnica
                </Button>
            )}
        </div>
    );
};

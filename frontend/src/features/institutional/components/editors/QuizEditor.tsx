import React, { useState } from 'react';
import {
    HelpCircle,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface QuizEditorProps {
    data: any;
    onSave: (data: any) => void;
    isReadOnly?: boolean;
}

export const QuizEditor = ({ data, onSave, isReadOnly = false }: QuizEditorProps) => {
    const [pregunta, setPregunta] = useState(data.pregunta || '');
    const [opciones, setOpciones] = useState<string[]>(data.opciones || ['', '']);
    const [respuestaCorrecta, setRespuestaCorrecta] = useState<number>(data.respuestaCorrecta ?? 0);
    const [feedback, setFeedback] = useState(data.feedback || '');

    const addOpcion = () => {
        if (isReadOnly) return;
        if (opciones.length < 5) {
            setOpciones([...opciones, '']);
        }
    };

    const removeOpcion = (index: number) => {
        if (isReadOnly) return;
        if (opciones.length > 2) {
            const newOpciones = opciones.filter((_, i) => i !== index);
            setOpciones(newOpciones);
            if (respuestaCorrecta === index) setRespuestaCorrecta(0);
            else if (respuestaCorrecta > index) setRespuestaCorrecta(respuestaCorrecta - 1);
        }
    };

    const updateOpcion = (index: number, value: string) => {
        if (isReadOnly) return;
        const newOpciones = [...opciones];
        newOpciones[index] = value;
        setOpciones(newOpciones);
    };

    const isValid = pregunta.trim() !== '' && opciones.every(opt => opt.trim() !== '');

    return (
        <div className="space-y-8 p-1">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-violet-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-violet-400">Pregunta del Quiz</Label>
                </div>
                <Input
                    readOnly={isReadOnly}
                    value={pregunta}
                    onChange={(e) => setPregunta(e.target.value)}
                    placeholder="Escriba la pregunta aquí..."
                    className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-violet-500/50 transition-all text-white font-bold"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-amber-400" />
                        </div>
                        <Label className="text-sm font-black uppercase tracking-[0.2em] text-amber-400">Opciones de Respuesta</Label>
                    </div>
                    {!isReadOnly && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={addOpcion}
                            disabled={opciones.length >= 5}
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 font-bold"
                        >
                            + Añadir Opción
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    {opciones.map((opcion, index) => (
                        <div key={index} className="flex gap-3 group">
                            <button
                                onClick={() => !isReadOnly && setRespuestaCorrecta(index)}
                                className={cn(
                                    "w-14 h-14 rounded-xl border flex items-center justify-center transition-all shrink-0",
                                    respuestaCorrecta === index
                                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                        : "bg-slate-900 border-white/10 text-slate-500 hover:border-white/20",
                                    !isReadOnly && "cursor-pointer"
                                )}
                            >
                                <CheckCircle2 className={cn("w-6 h-6", respuestaCorrecta === index ? "opacity-100" : "opacity-20")} />
                            </button>
                            <Input
                                readOnly={isReadOnly}
                                value={opcion}
                                onChange={(e) => updateOpcion(index, e.target.value)}
                                placeholder={`Opción ${index + 1}...`}
                                className={cn(
                                    "h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-violet-500/50 transition-all text-white font-medium",
                                    respuestaCorrecta === index && "border-emerald-500/30"
                                )}
                            />
                            {!isReadOnly && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOpcion(index)}
                                    className="h-14 w-14 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Feedback de Acierto</Label>
                </div>
                <Textarea
                    readOnly={isReadOnly}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Mensaje al responder correctamente..."
                    className="min-h-[100px] bg-slate-900 border-white/10 rounded-2xl p-6 focus:border-emerald-500/50 transition-all text-white font-medium"
                />
            </div>

            {!isReadOnly && (
                <Button
                    onClick={() => onSave({ pregunta, opciones, respuestaCorrecta, feedback })}
                    disabled={!isValid}
                    className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black uppercase tracking-widest italic"
                >
                    Confirmar Configuración Quiz
                </Button>
            )}
        </div>
    );
};

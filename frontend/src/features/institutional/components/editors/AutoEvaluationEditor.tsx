import React, { useState } from 'react';
import { 
    ClipboardCheck, 
    Trash2, 
    Image as ImageIcon, 
    Clock, 
    Layout, 
    HelpCircle, 
    Save, 
    Settings,
    ChevronDown,
    ChevronUp,
    TextQuote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
    id: string;
    text: string;
    image?: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

interface EvaluationData {
    context: string;
    durationMinutes: number;
    questions: Question[];
    horizontalFormat: boolean;
    passingGrade: number;
}

interface AutoEvaluationEditorProps {
    data: any;
    onSave: (data: any) => void;
    isReadOnly?: boolean;
}

export const AutoEvaluationEditor = ({ data, onSave, isReadOnly = false }: AutoEvaluationEditorProps) => {
    const defaultQuestion: Question = { id: 'q1', text: '', options: ['', ''], correctIndex: 0 };
    
    // Initialize with 10 exact questions if no data exists, otherwise use existing
    const initialQuestions = data.questions || Array(10).fill(null).map((_, i) => ({
        ...defaultQuestion,
        id: `q_${Date.now()}_${i}`
    }));

    const [evaluation, setEvaluation] = useState<EvaluationData>({
        context: data.context || '',
        durationMinutes: data.durationMinutes || 25,
        questions: initialQuestions,
        horizontalFormat: data.horizontalFormat || false,
        passingGrade: data.passingGrade || 7
    });

    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(evaluation.questions[0]?.id || null);

    const handleSave = () => {
        onSave(evaluation);
    };

    const addQuestion = () => {
        if (isReadOnly) return;
        const newQuestion: Question = {
            id: `q_${Date.now()}`,
            text: '',
            options: ['', ''],
            correctIndex: 0
        };
        setEvaluation(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
        setExpandedQuestion(newQuestion.id);
    };

    const removeQuestion = (id: string) => {
        if (isReadOnly) return;
        setEvaluation(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id)
        }));
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        if (isReadOnly) return;
        setEvaluation(prev => ({
            ...prev,
            questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q)
        }));
    };

    const addOption = (questionId: string) => {
        if (isReadOnly) return;
        const q = evaluation.questions.find(q => q.id === questionId);
        if (q && q.options.length < 5) {
            updateQuestion(questionId, { options: [...q.options, ''] });
        }
    };

    const removeOption = (questionId: string, optionIndex: number) => {
        if (isReadOnly) return;
        const q = evaluation.questions.find(q => q.id === questionId);
        if (q && q.options.length > 2) {
            const newOptions = q.options.filter((_, i) => i !== optionIndex);
            let newCorrectIndex = q.correctIndex;
            if (newCorrectIndex === optionIndex) newCorrectIndex = 0;
            else if (newCorrectIndex > optionIndex) newCorrectIndex--;
            
            updateQuestion(questionId, { options: newOptions, correctIndex: newCorrectIndex });
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Global Settings Section */}
            <div className="bg-white border rounded-[2rem] p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Parámetros de Evaluación</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuración Maestra</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Duración (Minutos)</Label>
                        </div>
                        <Input 
                            type="number"
                            readOnly={isReadOnly}
                            value={evaluation.durationMinutes}
                            onChange={(e) => setEvaluation(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
                            className="h-12 bg-slate-50 border-none rounded-xl font-bold font-mono text-lg"
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layout className="w-4 h-4 text-slate-400" />
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Formato Horizontal</Label>
                            </div>
                            <Switch 
                                disabled={isReadOnly}
                                checked={evaluation.horizontalFormat}
                                onCheckedChange={(val) => setEvaluation(prev => ({ ...prev, horizontalFormat: val }))}
                            />
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-400 italic font-medium pr-10">
                            Activa esta opción para que las opciones de respuesta se muestren en formato de botones horizontales.
                        </p>
                    </div>
                </div>
            </div>

            {/* General Context Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <TextQuote className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Contexto General</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Introducción para todas las preguntas</p>
                    </div>
                </div>
                <Textarea 
                    readOnly={isReadOnly}
                    value={evaluation.context}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, context: e.target.value }))}
                    placeholder="Escribe aquí el escenario, caso de estudio o contexto general que el estudiante debe leer..."
                    className="min-h-[150px] bg-white border rounded-[2rem] p-8 focus:ring-2 ring-blue-500/20 transition-all text-slate-700 font-medium leading-relaxed shadow-sm"
                />
            </div>

            {/* Questions Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Reactivos de Evaluación</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{evaluation.questions.length} / 10 Preguntas (Base 10)</p>
                        </div>
                    </div>
                    {!isReadOnly && (
                        <Button 
                            onClick={addQuestion}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest text-[10px] px-6 h-11 rounded-xl shadow-lg shadow-violet-200"
                        >
                            + Añadir Pregunta
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {evaluation.questions.map((q, idx) => (
                            <motion.div 
                                key={q.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "bg-white border transition-all overflow-hidden",
                                    expandedQuestion === q.id ? "rounded-[2.5rem] shadow-xl ring-1 ring-slate-200" : "rounded-2xl shadow-sm hover:border-slate-300"
                                )}
                            >
                                <div 
                                    className="p-6 flex items-center justify-between cursor-pointer"
                                    onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black italic text-xs shrink-0">
                                            {idx + 1}
                                        </div>
                                        <span className={cn("font-bold text-sm truncate max-w-[400px]", !q.text && "text-slate-300 italic")}>
                                            {q.text || "Pregunta sin título..."}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!isReadOnly && evaluation.questions.length > 1 && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                                                className="text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {expandedQuestion === q.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </div>

                                {expandedQuestion === q.id && (
                                    <div className="p-8 pt-0 space-y-8 border-t border-slate-50">
                                        <div className="mt-8 space-y-4">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Planteamiento</Label>
                                                    <Input 
                                                        readOnly={isReadOnly}
                                                        value={q.text}
                                                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                                        placeholder="Ej: ¿Cuál es el componente principal..."
                                                        className="h-12 bg-slate-50 border-none rounded-xl font-bold text-slate-700"
                                                    />
                                                </div>
                                                <div className="w-full md:w-1/3 space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Imagen (URL Opcional)</Label>
                                                    <div className="relative">
                                                        <Input 
                                                            readOnly={isReadOnly}
                                                            value={q.image || ''}
                                                            onChange={(e) => updateQuestion(q.id, { image: e.target.value })}
                                                            placeholder="https://..."
                                                            className="h-12 bg-slate-50 border-none rounded-xl pl-10 text-[11px] font-medium"
                                                        />
                                                        <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-300" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opciones y Respuestas</Label>
                                                    {!isReadOnly && q.options.length < 5 && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => addOption(q.id)}
                                                            className="text-blue-600 font-bold text-[10px] uppercase tracking-widest"
                                                        >
                                                            + Nueva Opción
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, optIdx) => (
                                                        <div key={optIdx} className="flex items-center gap-2 group">
                                                            <div 
                                                                onClick={() => !isReadOnly && updateQuestion(q.id, { correctIndex: optIdx })}
                                                                className={cn(
                                                                    "w-10 h-10 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all shrink-0",
                                                                    q.correctIndex === optIdx ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-white border-slate-100 text-slate-200 hover:border-slate-300"
                                                                )}
                                                            >
                                                                <ClipboardCheck className="w-5 h-5" />
                                                            </div>
                                                            <Input 
                                                                readOnly={isReadOnly}
                                                                value={opt}
                                                                onChange={(e) => {
                                                                    const newOpts = [...q.options];
                                                                    newOpts[optIdx] = e.target.value;
                                                                    updateQuestion(q.id, { options: newOpts });
                                                                }}
                                                                placeholder={`Opción ${optIdx + 1}`}
                                                                className={cn(
                                                                    "h-10 bg-slate-50 border-none rounded-lg text-xs font-bold",
                                                                    q.correctIndex === optIdx && "bg-emerald-50 text-emerald-900"
                                                                )}
                                                            />
                                                            {!isReadOnly && q.options.length > 2 && (
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    onClick={() => removeOption(q.id, optIdx)}
                                                                    className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Save Button Floating */}
            {!isReadOnly && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200]">
                    <Button 
                        onClick={handleSave}
                        className="h-16 px-12 bg-slate-900 hover:bg-black text-white rounded-full shadow-2xl flex items-center gap-4 transition-all group scale-110"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Save className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-black italic uppercase tracking-widest text-sm">Guardar Evaluación</span>
                    </Button>
                </div>
            )}
        </div>
    );
};

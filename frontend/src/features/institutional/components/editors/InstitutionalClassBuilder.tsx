import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Save, Plus, Trash2, ChevronDown, ChevronUp,
    FileText, CheckSquare, Target, Settings, Crown,
    Database, HelpCircle, ListOrdered, CheckCircle2,
    UploadCloud, Video, Link as LinkIcon, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ModuloInst } from '@/features/institutional/services/curriculum.api';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export type BlockType = 'NARRATIVE' | 'VIDEO' | 'OPEN_QUESTION' | 'EVALUATION' | 'TECHNICAL_TABLE' | 'STEP_BY_STEP' | 'CHECKLIST' | 'DELIVERABLE' | 'REWARD';

export interface DynamicBlock {
    id: string;
    type: BlockType;
    data: any;
}

const BLOCK_TYPES_CONFIG: Record<BlockType, { label: string, icon: any, color: string, category: 'suministro' | 'equipo' | 'control', defaultData: any }> = {
    NARRATIVE: { label: 'Manual de Usuario', icon: FileText, color: 'bg-indigo-500', category: 'suministro', defaultData: { titulo: '', texto: '', multimedia: '' } },
    VIDEO: { label: 'Video de Planta', icon: Video, color: 'bg-rose-500', category: 'suministro', defaultData: { titulo: '', url: '', descripcion: '' } },
    STEP_BY_STEP: { label: 'Guía de Ensamble', icon: ListOrdered, color: 'bg-fuchsia-500', category: 'suministro', defaultData: { titulo: '', pasos: ['Paso Inicial'] } },

    TECHNICAL_TABLE: { label: 'Ficha Técnica', icon: Database, color: 'bg-slate-700', category: 'equipo', defaultData: { columnas: ['Concepto', 'Definición'], filas: [['', '']] } },
    REWARD: { label: 'Hito Producido', icon: Crown, color: 'bg-amber-500', category: 'equipo', defaultData: { insignia: '', xp: 100 } },

    EVALUATION: { label: 'Test de Calidad', icon: CheckSquare, color: 'bg-emerald-500', category: 'control', defaultData: { pregunta: '', opciones: ['Opción A', 'Opción B'], respuestaIndex: 0 } },
    OPEN_QUESTION: { label: 'Reporte de Falla', icon: HelpCircle, color: 'bg-blue-500', category: 'control', defaultData: { pregunta: '' } },
    CHECKLIST: { label: 'Lista de Control', icon: CheckCircle2, color: 'bg-teal-500', category: 'control', defaultData: { titulo: '', items: ['Criterio 1'] } },
    DELIVERABLE: { label: 'Entrega de Obra', icon: UploadCloud, color: 'bg-pink-500', category: 'control', defaultData: { titulo: '', descripcion: '', tipo: 'ARCHIVO' } },
};

interface InstitutionalClassBuilderProps {
    module: ModuloInst;
    onClose: () => void;
    onSave: (data: any) => void;
    inline?: boolean;
    isReadOnly?: boolean;
}

export const InstitutionalClassBuilder = ({
    module, onClose, onSave, inline = false, isReadOnly = false
}: InstitutionalClassBuilderProps) => {
    const initialContent = Array.isArray(module.contenido?.blocks) ? module.contenido.blocks : [];
    const initialMetadata = module.contenido?.metadata || { title: module.titulo, description: module.descripcion || '' };

    const [metadata, setMetadata] = useState(initialMetadata);
    const [blocks, setBlocks] = useState<DynamicBlock[]>(initialContent);
    const [showBlockPicker, setShowBlockPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const addBlock = (type: BlockType) => {
        if (isReadOnly) return;
        const newBlock: DynamicBlock = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
            type,
            data: JSON.parse(JSON.stringify(BLOCK_TYPES_CONFIG[type].defaultData))
        };
        setBlocks([...blocks, newBlock]);
        setShowBlockPicker(false);
    };

    const removeBlock = (id: string) => {
        if (isReadOnly) return;
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlock = (id: string, newData: any) => {
        if (isReadOnly) return;
        setBlocks(blocks.map(b => b.id === id ? { ...b, data: newData } : b));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (isReadOnly || (direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
        const newBlocks = [...blocks];
        const targetIdx = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIdx]] = [newBlocks[targetIdx], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const handleSave = async () => {
        if (isReadOnly) return;
        setSaving(true);
        try {
            const finalPayload = { metadata, blocks };
            await onSave(finalPayload);
        } catch (error) {
            toast.error('No se pudo guardar la construcción de la clase');
        } finally {
            setSaving(false);
        }
    };

    const renderBlockEditor = (block: DynamicBlock) => {
        const { data } = block;

        switch (block.type) {
            case 'NARRATIVE':
                return (
                    <div className="space-y-3">
                        <Input readOnly={isReadOnly} value={data.titulo} onChange={e => updateBlock(block.id, { ...data, titulo: e.target.value })} placeholder="Título de la sección..." className="font-bold border-indigo-200 focus-visible:ring-indigo-500" />
                        <Textarea readOnly={isReadOnly} value={data.texto} onChange={e => updateBlock(block.id, { ...data, texto: e.target.value })} placeholder="Instrucciones o teoría..." className="min-h-[100px] border-indigo-200 focus-visible:ring-indigo-500" />
                    </div>
                );
            case 'VIDEO':
                return (
                    <div className="space-y-3">
                        <Input readOnly={isReadOnly} value={data.titulo} onChange={e => updateBlock(block.id, { ...data, titulo: e.target.value })} placeholder="Título del Video..." className="font-bold border-rose-200 focus-visible:ring-rose-500" />
                        <Input readOnly={isReadOnly} value={data.url} onChange={e => updateBlock(block.id, { ...data, url: e.target.value })} placeholder="URL de YouTube / Vimeo / Drive..." className="border-rose-200 focus-visible:ring-rose-500" />
                        <Textarea readOnly={isReadOnly} value={data.descripcion} onChange={e => updateBlock(block.id, { ...data, descripcion: e.target.value })} placeholder="¿Qué deben aprender en este video?" className="h-20 border-rose-200 focus-visible:ring-rose-500" />
                    </div>
                );
            case 'EVALUATION':
                return (
                    <div className="space-y-4">
                        <Input readOnly={isReadOnly} value={data.pregunta} onChange={e => updateBlock(block.id, { ...data, pregunta: e.target.value })} placeholder="Pregunta de evaluación..." className="font-bold border-emerald-200 focus-visible:ring-emerald-500" />
                        <div className="space-y-3 px-4 py-4 bg-emerald-50/30 rounded-2xl border border-emerald-100 border-dashed">
                            {data.opciones.map((opt: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div
                                        onClick={() => !isReadOnly && updateBlock(block.id, { ...data, respuestaIndex: idx })}
                                        className={cn(
                                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                            data.respuestaIndex === idx ? "bg-emerald-500 border-emerald-500 text-white" : "border-emerald-200 bg-white",
                                            !isReadOnly && "cursor-pointer"
                                        )}
                                    >
                                        {data.respuestaIndex === idx && <CheckCircle2 className="w-4 h-4" />}
                                    </div>
                                    <Input readOnly={isReadOnly} value={opt} onChange={e => {
                                        const updated = [...data.opciones]; updated[idx] = e.target.value; updateBlock(block.id, { ...data, opciones: updated });
                                    }} className="h-10 border-emerald-100 text-sm focus-visible:ring-emerald-500 bg-white" placeholder={`Opción ${idx + 1}`} />
                                    {!isReadOnly && <button onClick={() => updateBlock(block.id, { ...data, opciones: data.opciones.filter((_: any, i: number) => i !== idx) })} className="text-red-400 hover:text-red-600 transition-colors"><X className="w-4 h-4" /></button>}
                                </div>
                            ))}
                            {!isReadOnly && (
                                <Button variant="ghost" onClick={() => updateBlock(block.id, { ...data, opciones: [...data.opciones, ''] })} className="h-10 w-full rounded-xl border border-dashed border-emerald-200 text-xs font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50">
                                    <Plus className="w-4 h-4 mr-2" /> Añadir Opción
                                </Button>
                            )}
                        </div>
                    </div>
                );
            case 'OPEN_QUESTION':
                return (
                    <div className="space-y-3">
                        <Input readOnly={isReadOnly} value={data.pregunta} onChange={e => updateBlock(block.id, { ...data, pregunta: e.target.value })} placeholder="Plantea la pregunta de reflexión..." className="font-bold border-blue-200 focus-visible:ring-blue-500" />
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed">
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Vista Estudiante: Área de respuesta abierta activa.</p>
                        </div>
                    </div>
                );
            case 'TECHNICAL_TABLE':
                return (
                    <div className="space-y-4">
                        <div className="flex gap-2 mb-2">
                            {data.columnas.map((col: string, cIdx: number) => (
                                <Input readOnly={isReadOnly} key={cIdx} value={col} onChange={e => {
                                    const nc = [...data.columnas]; nc[cIdx] = e.target.value; updateBlock(block.id, { ...data, columnas: nc });
                                }} className="font-bold border-slate-300 bg-slate-50 text-slate-800" placeholder={`Col ${cIdx + 1}`} />
                            ))}
                        </div>
                        {data.filas.map((row: string[], rIdx: number) => (
                            <div key={rIdx} className="flex gap-2">
                                {row.map((val: string, cIdx: number) => (
                                    <Input readOnly={isReadOnly} key={cIdx} value={val} onChange={e => {
                                        const nf = [...data.filas]; nf[rIdx][cIdx] = e.target.value; updateBlock(block.id, { ...data, filas: nf });
                                    }} className="border-slate-100 text-sm" placeholder="..." />
                                ))}
                            </div>
                        ))}
                        {!isReadOnly && (
                            <Button variant="ghost" onClick={() => {
                                const newDataRow = Array(data.columnas.length).fill('');
                                updateBlock(block.id, { ...data, filas: [...data.filas, newDataRow] });
                            }} className="h-10 w-full border border-dashed border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">
                                <Plus className="w-4 h-4 mr-2" /> Añadir Fila de Datos
                            </Button>
                        )}
                    </div>
                );
            case 'STEP_BY_STEP':
                return (
                    <div className="space-y-4">
                        <Input readOnly={isReadOnly} value={data.titulo} onChange={e => updateBlock(block.id, { ...data, titulo: e.target.value })} placeholder="Título de guía..." className="font-bold border-fuchsia-200 focus-visible:ring-fuchsia-500" />
                        <div className="space-y-2">
                            {data.pasos.map((paso: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center text-xs font-black shrink-0">{idx + 1}</div>
                                    <Input readOnly={isReadOnly} value={paso} onChange={e => {
                                        const updated = [...data.pasos]; updated[idx] = e.target.value; updateBlock(block.id, { ...data, pasos: updated });
                                    }} className="h-10 border-fuchsia-100 text-sm focus-visible:ring-fuchsia-500" placeholder={`Instrucción...`} />
                                    {!isReadOnly && <button onClick={() => updateBlock(block.id, { ...data, pasos: data.pasos.filter((_: any, i: number) => i !== idx) })} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>}
                                </div>
                            ))}
                            {!isReadOnly && (
                                <Button variant="ghost" onClick={() => updateBlock(block.id, { ...data, pasos: [...data.pasos, ''] })} className="h-10 w-full border border-dashed border-fuchsia-200 text-xs font-black uppercase tracking-widest text-fuchsia-600 hover:bg-fuchsia-50">
                                    <Plus className="w-4 h-4 mr-2" /> Añadir Paso Técnico
                                </Button>
                            )}
                        </div>
                    </div>
                );
            case 'DELIVERABLE':
                return (
                    <div className="space-y-3">
                        <Input readOnly={isReadOnly} value={data.titulo} onChange={e => updateBlock(block.id, { ...data, titulo: e.target.value })} placeholder="Nombre de la entrega técnica..." className="font-bold border-pink-200" />
                        <Textarea readOnly={isReadOnly} value={data.descripcion} onChange={e => updateBlock(block.id, { ...data, descripcion: e.target.value })} placeholder="Instrucciones específicas..." className="border-pink-200" />
                        <select
                            disabled={isReadOnly}
                            className="w-full h-10 rounded-lg bg-pink-50 border-pink-200 text-xs font-black uppercase px-3"
                            value={data.tipo} onChange={e => updateBlock(block.id, { ...data, tipo: e.target.value })}
                        >
                            <option value="ARCHIVO">Adjuntar Archivo (.zip, .pdf, .png)</option>
                            <option value="URL">URL / Link de Proyecto</option>
                            <option value="TEXTO">Respuesta Escrita</option>
                        </select>
                    </div>
                );
            case 'REWARD':
                return (
                    <div className="flex items-center gap-4 p-6 bg-amber-50/30 rounded-3xl border border-amber-200 border-dashed">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex flex-col items-center justify-center border border-amber-500/30 shadow-inner">
                            <Crown className="w-8 h-8 text-amber-500" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Input readOnly={isReadOnly} value={data.insignia} onChange={e => updateBlock(block.id, { ...data, insignia: e.target.value })} placeholder="Título del Hito (Insignia)" className="font-black text-amber-900 border-amber-200 bg-white" />
                            <div className="flex items-center gap-3">
                                <Badge className="bg-amber-500 text-white border-0 font-black">XP</Badge>
                                <Input readOnly={isReadOnly} type="number" value={data.xp} onChange={e => updateBlock(block.id, { ...data, xp: parseInt(e.target.value) })} placeholder="Puntos XP" className="border-amber-200 h-9 bg-white" />
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div className="p-4 border border-dashed rounded-xl text-slate-400 text-xs italic">Editor para este bloque aún no disponible.</div>;
        }
    };

    return (
        <div className={cn(
            "animate-in fade-in duration-300",
            inline ? "relative w-full min-h-[600px] flex rounded-[3rem] overflow-hidden border shadow-xl bg-white" : "fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex"
        )}>

            {/* Sidebar - Metadata */}
            <div className={cn(
                "bg-white border-r flex flex-col p-8 shrink-0 relative z-20 transition-all",
                inline ? "w-72" : "w-80 h-full shadow-2xl"
            )}>
                <div className="flex items-center gap-4 mb-10">
                    <Button
                        variant="ghost" size="icon"
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 shrink-0"
                        style={{ color: 'var(--inst-blue)' }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="min-w-0">
                        <h3 className="text-lg font-black text-slate-800 tracking-tighter leading-none truncate">{isReadOnly ? 'Ficha Técnica' : 'Plano Maestro'}</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Configuración de Clase</span>
                    </div>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nombre de la Sesión</label>
                        <Input readOnly={isReadOnly} value={metadata.title} onChange={e => setMetadata({ ...metadata, title: e.target.value })} className="bg-slate-50 border-2 border-slate-100 hover:border-blue-100 focus:border-blue-500 font-black text-slate-700 h-14 rounded-2xl transition-all" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Objetivo General</label>
                        <Textarea readOnly={isReadOnly} value={metadata.description} onChange={e => setMetadata({ ...metadata, description: e.target.value })} className="bg-slate-50 border-2 border-slate-100 hover:border-blue-100 focus:border-blue-500 font-medium text-slate-600 h-40 rounded-2xl resize-none transition-all p-5" placeholder="¿Qué lograrán los estudiantes al completar esta obra?" />
                    </div>
                </div>

                {!isReadOnly && (
                    <div className="pt-6 border-t border-slate-100 mt-6">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] gap-3 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
                        >
                            {saving ? 'GUARDANDO...' : <><Save className="w-5 h-5" /> DESPLEGAR OBRA</>}
                        </Button>
                        <p className="text-[9px] text-center text-slate-400 font-bold mt-4 uppercase tracking-widest">Los cambios se publicarán instantáneamente</p>
                    </div>
                )}
            </div>

            {/* Main Canvas */}
            <div className={cn("flex-1 relative bg-[#F8FAFC]", inline ? "min-h-[600px] overflow-y-visible" : "h-full overflow-y-auto")}>
                <div className="absolute inset-0 construction-grid opacity-30 pointer-events-none" />

                {!inline && (
                    <button onClick={onClose} className="absolute top-10 right-10 w-14 h-14 bg-white/80 backdrop-blur hover:bg-white rounded-2xl shadow-xl text-slate-400 hover:text-red-500 transition-all z-20 flex items-center justify-center border border-slate-200 hover:scale-105 active:scale-95">
                        <X className="w-7 h-7" />
                    </button>
                )}

                <div className={cn("max-w-3xl mx-auto relative z-10 space-y-10", inline ? "py-10 px-4" : "py-32 px-10")}>
                    <div className="text-center mb-20 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-sm">
                            <Target className="w-3.5 h-3.5" /> {isReadOnly ? 'Consulta de Arquitectura' : 'Mesa de Ingeniería Curricular'}
                        </div>
                        <h2 className="text-6xl font-black text-slate-800 italic tracking-tighter leading-none">{isReadOnly ? 'Visualización' : 'Construcción'} <span className="text-blue-600">Modular</span></h2>
                        <p className="text-slate-500 font-medium text-xl max-w-xl mx-auto">{isReadOnly ? 'Explora el itinerario diseñado para esta sesión.' : 'Define el itinerario de aprendizaje apilando suministros didácticos en secuencia.'}</p>
                    </div>

                    <AnimatePresence>
                        {blocks.map((block, index) => {
                            const config = BLOCK_TYPES_CONFIG[block.type] || BLOCK_TYPES_CONFIG.NARRATIVE;
                            const Icon = config.icon;
                            return (
                                <motion.div
                                    key={block.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white rounded-[3rem] shadow-xl w-full flex overflow-hidden border border-slate-100 group hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all relative"
                                >
                                    <div className={cn("w-24 flex flex-col items-center py-10 border-r border-slate-50 shrink-0", config.color.replace('bg-', 'bg-opacity-5 ' + config.color))}>
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-auto shadow-lg shadow-current/20", config.color)}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 tracking-widest mt-4">BLOQUE</span>
                                        <span className="text-3xl font-black text-slate-200">{index + 1}</span>
                                    </div>

                                    <div className="flex-1 p-12 relative">
                                        {/* Floating Controls */}
                                        {!isReadOnly && (
                                            <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                <Button variant="outline" size="icon" onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur shadow-sm"><ChevronUp className="w-5 h-5" /></Button>
                                                <Button variant="outline" size="icon" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur shadow-sm"><ChevronDown className="w-5 h-5" /></Button>
                                                <Button variant="outline" size="icon" onClick={() => removeBlock(block.id)} className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur shadow-sm text-red-500 hover:bg-red-50 hover:border-red-200 border-transparent transition-all"><Trash2 className="w-5 h-5" /></Button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 mb-8">
                                            <div className={cn("w-2 h-2 rounded-full animate-pulse", config.color)} />
                                            <p className={cn("text-[11px] font-black uppercase tracking-[0.3em]", config.color.replace('bg-', 'text-'))}>{config.label}</p>
                                        </div>

                                        <div className="edu-block-content animate-in slide-in-from-bottom-2 duration-500">
                                            {renderBlockEditor(block)}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Add Block Interface */}
                    {!isReadOnly && (
                        <div className="flex flex-col items-center gap-8 pt-10 pb-40">
                            <div className="w-px h-16 bg-gradient-to-b from-slate-200 to-transparent" />

                            {!showBlockPicker ? (
                                <button
                                    onClick={() => setShowBlockPicker(true)}
                                    className="group relative w-24 h-24 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center border-2 border-dashed border-slate-200 text-blue-600 hover:scale-110 hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95"
                                >
                                    <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" />
                                    <div className="absolute -bottom-10 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 group-hover:text-blue-400 transition-colors">Nuevo Suministro</div>
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="bg-white/90 backdrop-blur-xl p-10 rounded-[4rem] shadow-2xl border border-white/40 max-w-3xl w-full z-10 grid grid-cols-2 md:grid-cols-3 gap-6 relative"
                                >
                                    <button onClick={() => setShowBlockPicker(false)} className="absolute -top-4 -right-4 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:rotate-90 transition-transform z-20 border-2 border-white"><X className="w-4 h-4" /></button>

                                    <div className="col-span-full mb-4 border-b pb-4">
                                        <h3 className="text-2xl font-black italic tracking-tighter" style={{ color: 'var(--inst-deep)' }}>Laboratorio de Nivel</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Selecciona los componentes para este nivel</p>
                                    </div>

                                    {(['suministro', 'equipo', 'control'] as const).map(cat => (
                                        <div key={cat} className="space-y-4">
                                            <div className="flex items-center gap-2 px-2">
                                                <div className={cn("w-1.5 h-6 rounded-full", cat === 'suministro' ? 'bg-indigo-500' : cat === 'equipo' ? 'bg-amber-500' : 'bg-emerald-500')} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                                    {cat === 'suministro' ? 'Descargas' : cat === 'equipo' ? 'Herramientas' : 'Reportes'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {(Object.keys(BLOCK_TYPES_CONFIG) as BlockType[])
                                                    .filter(type => BLOCK_TYPES_CONFIG[type].category === cat)
                                                    .map(type => {
                                                        const c = BLOCK_TYPES_CONFIG[type];
                                                        const Icon = c.icon;
                                                        return (
                                                            <button
                                                                key={type}
                                                                onClick={() => addBlock(type)}
                                                                className={cn("flex items-center gap-4 p-4 rounded-3xl hover:translate-x-2 transition-all group relative overflow-hidden bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5")}
                                                            >
                                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform", c.color)}>
                                                                    <Icon className="w-5 h-5" />
                                                                </div>
                                                                <div className="text-left">
                                                                    <span className="text-[10px] font-black uppercase tracking-tight block leading-tight text-slate-800">{c.label}</span>
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="ghost" onClick={() => setShowBlockPicker(false)} className="col-span-full h-14 rounded-3xl text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-slate-50 transition-colors">
                                        CANCELAR SELECCIÓN
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .construction-grid {
          background-image: 
            linear-gradient(rgba(26, 86, 219, 0.08) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(26, 86, 219, 0.08) 1.5px, transparent 1.5px);
          background-size: 60px 60px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
        </div>
    );
};

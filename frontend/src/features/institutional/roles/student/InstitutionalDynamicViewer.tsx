import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronLeft, ChevronRight, Rocket, Target, FileText, CheckSquare,
    HelpCircle, Database, Crown, ListOrdered, CheckCircle2,
    UploadCloud, Star, Award, Send, CheckCheck, Video, ExternalLink, HardHat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ForemanAssistant } from '../../components/ForemanAssistant';
import { MissionCinematicViewer } from './MissionCinematicViewer';

type BlockType = 'NARRATIVE' | 'VIDEO' | 'OPEN_QUESTION' | 'EVALUATION' |
    'TECHNICAL_TABLE' | 'STEP_BY_STEP' | 'CHECKLIST' | 'DELIVERABLE' | 'REWARD';

interface Block { id: string; type: BlockType; data: any; }

const BLOCK_META: Record<BlockType, { label: string; icon: any; accent: string; bg: string }> = {
    NARRATIVE: { label: 'Marco Teórico', icon: FileText, accent: 'text-slate-400', bg: 'bg-slate-500/5 border-white/10' },
    VIDEO: { label: 'Video Clase', icon: Video, accent: 'text-rose-400', bg: 'bg-rose-500/5 border-rose-500/20' },
    EVALUATION: { label: 'Control Calidad', icon: CheckSquare, accent: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
    OPEN_QUESTION: { label: 'Bitácora', icon: HelpCircle, accent: 'text-sky-400', bg: 'bg-sky-500/5 border-sky-500/20' },
    TECHNICAL_TABLE: { label: 'Ficha Técnica', icon: Database, accent: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
    STEP_BY_STEP: { label: 'Guía de Obra', icon: ListOrdered, accent: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
    CHECKLIST: { label: 'Inspección', icon: CheckCircle2, accent: 'text-sky-400', bg: 'bg-sky-500/5 border-sky-500/20' },
    DELIVERABLE: { label: 'Suministro', icon: UploadCloud, accent: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/20' },
    REWARD: { label: 'Hito Técnico', icon: Crown, accent: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
};

const BlockView = ({ block, onAnswer }: { block: Block; onAnswer: (id: string, val: any) => void }) => {
    const { data } = block;
    const meta = BLOCK_META[block.type] || BLOCK_META.NARRATIVE;
    const Icon = meta.icon;
    const [selected, setSelected] = useState<number | null>(null);
    const [text, setText] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const submit = (val: any) => {
        setSubmitted(true);
        onAnswer(block.id, val);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={cn('w-full rounded-[3rem] border-2 p-10 md:p-14 space-y-8 bg-white shadow-2xl overflow-hidden relative', meta.bg.split(' ')[1])}>
            <div className={cn("absolute top-0 left-0 w-2 h-full", meta.accent.replace('text-', 'bg-'))} />

            <div className="flex items-center gap-4">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg', meta.accent.replace('text-', 'bg-'))}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <span className={cn('text-[10px] font-black uppercase tracking-[0.3em]', meta.accent)}>{meta.label}</span>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-1">{data.titulo || data.pregunta || meta.label}</h3>
                </div>
            </div>

            <div className="edu-content min-h-[100px]">
                {block.type === 'NARRATIVE' && (
                    <div className="space-y-6">
                        <p className="text-slate-600 font-medium leading-relaxed text-lg whitespace-pre-wrap">{data.texto}</p>
                        {data.multimedia && (
                            <div className="rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-inner">
                                <img src={data.multimedia} alt="visual" className="w-full object-cover" />
                            </div>
                        )}
                    </div>
                )}

                {block.type === 'VIDEO' && (
                    <div className="space-y-6">
                        <div className="aspect-video bg-slate-900 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-2xl relative group">
                            {data.url ? (
                                <iframe
                                    src={data.url.includes('youtube.com') ? data.url.replace('watch?v=', 'embed/') : data.url}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <Video className="w-16 h-16 opacity-20" />
                                </div>
                            )}
                        </div>
                        {data.descripcion && (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-slate-600 font-medium italic">"{data.descripcion}"</p>
                            </div>
                        )}
                        <Button variant="outline" onClick={() => window.open(data.url, '_blank')} className="gap-2 rounded-xl text-slate-400">
                            <ExternalLink className="w-4 h-4" /> Ver en ventana externa
                        </Button>
                    </div>
                )}

                {block.type === 'EVALUATION' && (
                    <div className="space-y-5">
                        <p className="text-xl font-bold text-slate-800 mb-6">{data.pregunta}</p>
                        <div className="grid gap-3">
                            {data.opciones?.map((opt: string, i: number) => {
                                const isCorrect = i === data.respuestaIndex;
                                const chosen = selected === i;
                                return (
                                    <button key={i} disabled={submitted}
                                        onClick={() => { setSelected(i); if (!submitted) submit({ selected: i, correct: isCorrect }); }}
                                        className={cn(
                                            'p-6 rounded-2xl border-2 text-left font-black transition-all flex items-center gap-5',
                                            submitted && isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-100' :
                                                submitted && chosen && !isCorrect ? 'bg-red-50 border-red-500 text-red-700' :
                                                    !submitted ? 'bg-white border-slate-100 text-slate-600 hover:border-blue-400 hover:bg-blue-50/30' :
                                                        'bg-slate-50 border-transparent text-slate-300'
                                        )}>
                                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-transform',
                                            chosen ? 'scale-110' : '',
                                            submitted && isCorrect ? 'bg-emerald-500 text-white' :
                                                submitted && chosen && !isCorrect ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400')}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <span className="text-lg">{opt}</span>
                                        {submitted && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500 ml-auto" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {block.type === 'DELIVERABLE' && (
                    <div className="space-y-6">
                        <div className="p-6 bg-pink-50 rounded-2xl border border-pink-100">
                            <p className="text-slate-600 font-medium leading-relaxed">{data.descripcion}</p>
                        </div>
                        {!submitted ? (
                            <div className="space-y-4">
                                {data.tipo === 'TEXTO' ? (
                                    <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
                                        className="w-full p-6 rounded-3xl bg-white border-2 border-slate-100 focus:border-pink-400 outline-none text-slate-700 font-medium resize-none shadow-inner"
                                        placeholder="Escribe aquí tu informe técnico..." />
                                ) : (
                                    <div className="flex gap-2">
                                        <input type="text" value={text} onChange={e => setText(e.target.value)}
                                            className="flex-1 h-14 px-6 rounded-2xl bg-white border-2 border-slate-100 focus:border-pink-400 outline-none"
                                            placeholder={data.tipo === 'URL' ? 'https://link-del-proyecto.com' : 'Sube tu archivo a la nube y pega el link'} />
                                    </div>
                                )}
                                <Button onClick={() => submit(text)} disabled={!text.trim()}
                                    className="w-full h-14 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-pink-600/20">
                                    <UploadCloud className="w-5 h-5 mr-3" /> Realizar Suministro
                                </Button>
                            </div>
                        ) : (
                            <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-[2rem] flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><CheckCheck className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-emerald-700 font-black uppercase tracking-widest text-[10px]">Carga Exitosa</p>
                                    <p className="text-emerald-900 font-bold">El suministro ha sido registrado en la bitácora.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {block.type === 'REWARD' && (
                    <div className="text-center space-y-8 py-10">
                        <div className="relative inline-block">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-[-40px] border-2 border-dashed border-amber-300 rounded-full opacity-30" />
                            <div className="w-40 h-40 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl relative z-10 scale-110">
                                <Crown className="w-16 h-16 text-white" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.3em]">Hito Desbloqueado</Badge>
                            <h3 className="text-4xl font-black italic text-slate-800 tracking-tighter uppercase">{data.insignia || '¡Gran Logro!'}</h3>
                            <div className="inline-flex items-center gap-3 bg-slate-900 px-6 py-3 rounded-2xl text-white shadow-xl">
                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                <span className="font-black text-xl">+{data.xp || 100} XP</span>
                            </div>
                        </div>
                    </div>
                )}

                {block.type === 'STEP_BY_STEP' && (
                    <div className="space-y-6">
                        <div className="grid gap-4">
                            {data.pasos?.map((paso: string, i: number) => (
                                <div key={i} className="flex gap-6 items-start p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 hover:border-fuchsia-200 transition-colors">
                                    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-fuchsia-100 flex items-center justify-center text-fuchsia-600 font-black text-sm shrink-0 shadow-sm">
                                        {i + 1}
                                    </div>
                                    <p className="text-slate-600 font-bold leading-relaxed flex-1 text-lg">{paso}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export const InstitutionalDynamicViewer = ({ module, onClose }: { module: any; onClose: () => void }) => {
    const [currentBlock, setCurrentBlock] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [assistantOpen, setAssistantOpen] = useState(false);

    const parsed = React.useMemo(() => {
        try {
            return typeof module.contenido === 'string' ? JSON.parse(module.contenido) : module.contenido;
        } catch { return { blocks: [] }; }
    }, [module]);

    const blocks: Block[] = parsed?.blocks || [];
    const meta = parsed?.metadata || {};
    const progress = blocks.length > 0 ? ((currentBlock + 1) / blocks.length) * 100 : 0;

    if (module.tipo === 'mission') {
        return <MissionCinematicViewer module={module} onClose={onClose} />;
    }

    if (blocks.length === 0) {
        return (
            <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center p-10">
                <div className="max-w-md text-center space-y-8">
                    <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5 shadow-2xl">
                        <Target className="w-12 h-12 text-slate-700" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter">OBRA SIN PLANOS</h2>
                        <p className="text-slate-500 font-medium">Esta unidad aún no ha sido construida por el profesor. Vuelve más tarde cuando la obra esté lista.</p>
                    </div>
                    <Button onClick={onClose} className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-600/30">
                        Regresar a la Ciudad
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-slate-50 flex flex-col font-sans overflow-hidden">
            <div className="absolute inset-0 construction-grid opacity-40 pointer-events-none" />

            {/* Top Header */}
            <div className="relative z-20 px-10 py-6 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-xl shrink-0 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <Rocket className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-black tracking-widest px-3">MAPA ACTIVO</Badge>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Unidad Académica</span>
                        </div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800 leading-tight">
                            {module.titulo || meta.title || "Sesión General"}
                        </h1>
                    </div>
                </div>

                <div className="hidden lg:flex flex-col items-end gap-2">
                    <div className="flex gap-4 items-center">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Avance de Obra</span>
                        <span className="text-2xl font-black text-slate-800 tabular-nums tracking-tighter">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <motion.div animate={{ width: `${progress}%` }} className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                    </div>
                </div>

                <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all border border-slate-200 hover:border-red-100">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* AI Assistant Button (Floating) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAssistantOpen(true)}
                className="fixed bottom-32 right-10 z-[400] bg-orange-500 text-white p-5 rounded-[2rem] shadow-2xl flex items-center gap-3 border-4 border-white group"
            >
                <div className="relative">
                   <div className="absolute inset-0 bg-white blur-md opacity-30 animate-pulse" />
                   <HardHat className="w-8 h-8 relative z-10" />
                </div>
                <div className="text-left pr-2">
                   <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-slate-900/40">Soporte Técnico</p>
                   <p className="text-sm font-black italic uppercase tracking-tighter leading-none">Búho Capataz</p>
                </div>
            </motion.button>

            <ForemanAssistant 
              isOpen={assistantOpen}
              onClose={() => setAssistantOpen(false)}
              moduleTitle={module.titulo}
              moduleContent={parsed}
            />

            {/* Main Block Scroller */}
            <div className="flex-1 overflow-y-auto relative z-10 px-6 py-12 md:py-20">
                <div className="max-w-4xl mx-auto pb-40">
                    <AnimatePresence mode="wait">
                        {completed ? (
                            <motion.div key="win" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-12 py-10">
                                <div className="relative inline-block">
                                    <div className="absolute inset-[-60px] bg-emerald-500/10 blur-[100px] rounded-full animate-pulse" />
                                    <div className="w-56 h-56 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[4rem] flex items-center justify-center mx-auto relative z-10 shadow-3xl">
                                        <Award className="w-24 h-24 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-6xl font-black italic text-slate-800 uppercase tracking-tighter">¡OBRA FINALIZADA!</h3>
                                    <p className="text-slate-500 font-medium text-xl max-w-lg mx-auto leading-relaxed">
                                        Has completado exitosamente todos los módulos técnicos de esta unidad de aprendizaje.
                                    </p>
                                </div>
                                <Button onClick={onClose} className="h-16 px-14 bg-slate-900 hover:bg-black text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all hover:scale-105 active:scale-95">
                                    REGRESAR A LA CIUDAD <ChevronRight className="w-5 h-5 ml-3" />
                                </Button>
                            </motion.div>
                        ) : (
                            <div key={currentBlock}>
                                <BlockView block={blocks[currentBlock]} onAnswer={() => { }} />
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Controls */}
            {!completed && (
                <div className="relative z-20 px-10 py-8 border-t border-slate-200 bg-white/90 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-lg">
                    <Button variant="ghost" onClick={() => setCurrentBlock(n => Math.max(0, n - 1))} disabled={currentBlock === 0}
                        className={cn("h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 transition-all", currentBlock === 0 ? "opacity-0" : "hover:bg-slate-100 text-slate-500")}>
                        <ChevronLeft className="w-5 h-5" /> Anterior
                    </Button>

                    <div className="flex gap-3">
                        {blocks.map((_, i) => (
                            <div key={i} className={cn('h-2 rounded-full transition-all duration-500',
                                i === currentBlock ? 'bg-blue-600 w-12 shadow-lg shadow-blue-500/30' :
                                    i < currentBlock ? 'bg-slate-300 w-2' : 'bg-slate-100 w-2')} />
                        ))}
                    </div>

                    <Button
                        onClick={() => {
                            if (currentBlock < blocks.length - 1) setCurrentBlock(n => n + 1);
                            else setCompleted(true);
                        }}
                        className="h-14 px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs gap-3 shadow-2xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
                    >
                        {currentBlock < blocks.length - 1 ? (<>SIGUIENTE <ChevronRight className="w-5 h-5" /></>) : (<>FINALIZAR OBRA <Star className="w-5 h-5" /></>)}
                    </Button>
                </div>
            )}

            <style>{`
        .construction-grid {
          background-image: 
            linear-gradient(rgba(26, 86, 219, 0.04) 2px, transparent 2px),
            linear-gradient(90deg, rgba(26, 86, 219, 0.04) 2px, transparent 2px);
          background-size: 80px 80px;
        }
      `}</style>
        </div>
    );
};

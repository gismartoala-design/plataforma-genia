import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Rocket, Target, FileText, CheckSquare,
  HelpCircle, Database, Image as ImageIcon, Crown, ListOrdered,
  CheckCircle2, UploadCloud, Wrench, Star, Award, Send, CheckCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import '../../styles/ConstructionTheme.css';

// ─── Block Types (mirrors ActivityCreatorModal) ───────────────────────────────
type BlockType = 'NARRATIVE' | 'OPEN_QUESTION' | 'EVALUATION' | 'PROBLEM' |
  'TECHNICAL_TABLE' | 'IMAGE_SELECT' | 'STEP_BY_STEP' | 'CHECKLIST' | 'DELIVERABLE' | 'REWARD';

interface Block { id: string; type: BlockType; data: any; }

const BLOCK_META: Record<BlockType, { label: string; icon: any; accent: string; bg: string }> = {
  NARRATIVE:      { label: 'Historia',         icon: FileText,      accent: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20'  },
  EVALUATION:     { label: 'Quiz',             icon: CheckSquare,   accent: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  OPEN_QUESTION:  { label: 'Reflexión',        icon: HelpCircle,    accent: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'      },
  PROBLEM:        { label: 'Desafío',          icon: Target,        accent: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20'      },
  TECHNICAL_TABLE:{ label: 'Tabla Técnica',    icon: Database,      accent: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20'  },
  IMAGE_SELECT:   { label: 'Análisis Visual',  icon: ImageIcon,     accent: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20'      },
  STEP_BY_STEP:   { label: 'Instrucciones',    icon: ListOrdered,   accent: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20'},
  CHECKLIST:      { label: 'Checklist',        icon: CheckCircle2,  accent: 'text-teal-400',    bg: 'bg-teal-500/10 border-teal-500/20'     },
  DELIVERABLE:    { label: 'Entregable',       icon: UploadCloud,   accent: 'text-pink-400',    bg: 'bg-pink-500/10 border-pink-500/20'      },
  REWARD:         { label: 'Recompensa',       icon: Crown,         accent: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'    },
};

// ─── Dynamic Block Renderer for Student ──────────────────────────────────────
const BlockView = ({ block, onAnswer }: { block: Block; onAnswer: (id: string, val: any) => void }) => {
  const { data } = block;
  const meta = BLOCK_META[block.type];
  const Icon = meta.icon;
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [checked, setChecked] = useState<boolean[]>([]);
  const [imgSelected, setImgSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = (val: any) => {
    setSubmitted(true);
    onAnswer(block.id, val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('w-full rounded-[2rem] border p-8 space-y-6', meta.bg)}
    >
      {/* Block Header */}
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center', meta.bg)}>
          <Icon className={cn('w-5 h-5', meta.accent)} />
        </div>
        <span className={cn('text-[10px] font-black uppercase tracking-[0.3em]', meta.accent)}>{meta.label}</span>
      </div>

      {/* —— NARRATIVE —— */}
      {block.type === 'NARRATIVE' && (
        <div className="space-y-4">
          {data.titulo && <h3 className="text-2xl font-black text-white italic tracking-tighter">{data.titulo}</h3>}
          {data.texto && <p className="text-slate-300 font-medium leading-relaxed text-base">{data.texto}</p>}
          {data.multimedia && (
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <img src={data.multimedia} alt="recurso visual" className="w-full object-cover max-h-64"
                onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
      )}

      {/* —— OPEN QUESTION —— */}
      {block.type === 'OPEN_QUESTION' && (
        <div className="space-y-4">
          <p className="text-xl font-bold text-white">{data.pregunta}</p>
          {!submitted ? (
            <>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full h-32 p-5 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none text-white placeholder:text-slate-600 font-medium resize-none" />
              <Button onClick={() => submit(text)} disabled={!text.trim()}
                className="bg-blue-600 hover:bg-blue-500 rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[11px] gap-2">
                <Send className="w-4 h-4" /> Enviar Reflexión
              </Button>
            </>
          ) : (
            <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
              <CheckCheck className="w-5 h-5 text-blue-400" />
              <p className="text-blue-300 font-bold text-sm">¡Reflexión enviada! Tu respuesta quedó registrada.</p>
            </div>
          )}
        </div>
      )}

      {/* —— EVALUATION (multiple choice) —— */}
      {block.type === 'EVALUATION' && (
        <div className="space-y-4">
          <p className="text-xl font-bold text-white">{data.pregunta}</p>
          <div className="space-y-3">
            {data.opciones?.map((opt: string, i: number) => {
              const isCorrect = i === data.respuestaIndex;
              const chosen = selected === i;
              return (
                <button key={i} disabled={submitted}
                  onClick={() => { setSelected(i); if (!submitted) submit({ selected: i, correct: isCorrect }); }}
                  className={cn(
                    'w-full p-5 rounded-2xl border text-left font-bold flex items-center gap-4 transition-all',
                    submitted && isCorrect ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' :
                    submitted && chosen && !isCorrect ? 'bg-rose-500/20 border-rose-400 text-rose-300' :
                    !submitted ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20' :
                    'bg-white/5 border-white/5 text-slate-500'
                  )}>
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0',
                    submitted && isCorrect ? 'bg-emerald-500 text-white' :
                    submitted && chosen && !isCorrect ? 'bg-rose-500 text-white' :
                    'bg-white/10 text-slate-400')}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="italic tracking-tight text-base">{opt}</span>
                  {submitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* —— PROBLEM —— */}
      {block.type === 'PROBLEM' && (
        <div className="space-y-4">
          {data.mision && <h3 className="text-2xl font-black text-rose-300 italic tracking-tighter">🎯 {data.mision}</h3>}
          {data.restricciones && (
            <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2">⚠ Restricciones del Reto</p>
              <p className="text-slate-300 leading-relaxed">{data.restricciones}</p>
            </div>
          )}
          {!submitted && (
            <Button onClick={() => submit('acknowledged')}
              className="bg-rose-600 hover:bg-rose-500 rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[11px] gap-2">
              <Target className="w-4 h-4" /> Aceptar Misión
            </Button>
          )}
          {submitted && (
            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 font-black">¡Misión Aceptada!</Badge>
          )}
        </div>
      )}

      {/* —— TECHNICAL TABLE —— */}
      {block.type === 'TECHNICAL_TABLE' && (
        <div className="space-y-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {data.columnas?.map((col: string, i: number) => (
                  <th key={i} className="p-3 text-left bg-violet-500/20 text-violet-300 font-black text-[10px] uppercase tracking-widest border border-violet-500/20">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.filas?.map((row: string[], rIdx: number) => (
                <tr key={rIdx} className="border-b border-white/5">
                  {row.map((cell: string, cIdx: number) => (
                    <td key={cIdx} className="p-3 text-slate-300 font-medium border border-white/5">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* —— IMAGE SELECT —— */}
      {block.type === 'IMAGE_SELECT' && (
        <div className="space-y-5">
          {data.instruccion && <p className="text-lg font-bold text-white">{data.instruccion}</p>}
          <div className="grid grid-cols-2 gap-4">
            {data.imagenes?.map((img: any, i: number) => (
              <button key={i} disabled={submitted}
                onClick={() => { setImgSelected(i); submit({ selected: i, correct: img.correcta }); }}
                className={cn('relative rounded-2xl overflow-hidden border-2 transition-all',
                  submitted && img.correcta ? 'border-emerald-400 ring-4 ring-emerald-400/30' :
                  submitted && imgSelected === i && !img.correcta ? 'border-rose-400 ring-4 ring-rose-400/30' :
                  imgSelected === i ? 'border-blue-400' : 'border-white/10 hover:border-white/30'
                )}>
                <img src={img.url} alt={`opción ${i+1}`} className="w-full h-36 object-cover" />
                {submitted && img.correcta && (
                  <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-300" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* —— STEP BY STEP —— */}
      {block.type === 'STEP_BY_STEP' && (
        <div className="space-y-4">
          {data.titulo && <h3 className="text-xl font-black text-fuchsia-300">{data.titulo}</h3>}
          <div className="space-y-3">
            {data.pasos?.map((paso: string, i: number) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 font-black text-sm flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-slate-300 font-medium leading-relaxed flex-1">{paso}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* —— CHECKLIST —— */}
      {block.type === 'CHECKLIST' && (
        <div className="space-y-4">
          {data.titulo && <h3 className="text-xl font-black text-teal-300">{data.titulo}</h3>}
          <div className="space-y-3">
            {data.items?.map((item: string, i: number) => {
              const isChecked = checked[i] ?? false;
              return (
                <label key={i} className="flex items-center gap-4 cursor-pointer group">
                  <div
                    onClick={() => {
                      const next = [...checked]; next[i] = !next[i]; setChecked(next);
                      if (next.every(Boolean)) submit(next);
                    }}
                    className={cn(
                      'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      isChecked ? 'bg-teal-500 border-teal-500' : 'border-white/20 group-hover:border-teal-400'
                    )}>
                    {isChecked && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={cn('text-base font-medium transition-colors', isChecked ? 'text-slate-500 line-through' : 'text-slate-300')}>
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
          {checked.every(Boolean) && checked.length > 0 && (
            <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              <p className="text-teal-300 font-bold text-sm">¡Checklist completado!</p>
            </div>
          )}
        </div>
      )}

      {/* —— DELIVERABLE —— */}
      {block.type === 'DELIVERABLE' && (
        <div className="space-y-4">
          {data.titulo && <h3 className="text-xl font-black text-pink-300">{data.titulo}</h3>}
          {data.descripcion && <p className="text-slate-300 leading-relaxed">{data.descripcion}</p>}
          <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl text-[10px] font-black text-pink-400 uppercase tracking-widest">
            Tipo de entrega: {data.tipo === 'ARCHIVO' ? '📎 Archivo' : data.tipo === 'URL' ? '🔗 URL / Repositorio' : '📝 Texto Libre'}
          </div>
          {!submitted ? (
            <>
              {data.tipo === 'TEXTO' ? (
                <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
                  className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none text-white placeholder:text-slate-600 font-medium resize-none"
                  placeholder="Escribe tu entregable aquí..." />
              ) : (
                <input type="text" value={text} onChange={e => setText(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 outline-none text-white placeholder:text-slate-600 font-medium"
                  placeholder={data.tipo === 'URL' ? 'https://github.com/...' : 'URL del archivo subido'} />
              )}
              <Button onClick={() => submit(text)} disabled={!text.trim()}
                className="bg-pink-600 hover:bg-pink-500 rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[11px] gap-2">
                <UploadCloud className="w-4 h-4" /> Entregar
              </Button>
            </>
          ) : (
            <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center gap-3">
              <CheckCheck className="w-5 h-5 text-pink-400" />
              <p className="text-pink-300 font-bold text-sm">¡Entregable registrado correctamente!</p>
            </div>
          )}
        </div>
      )}

      {/* —— REWARD —— */}
      {block.type === 'REWARD' && (
        <div className="text-center space-y-6 py-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-amber-500/30 blur-[60px] rounded-full animate-pulse" />
            <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(245,158,11,0.3)] relative">
              <Crown className="w-14 h-14 text-white" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">Insignia Desbloqueada</p>
            <h3 className="text-3xl font-black italic text-white tracking-tighter">{data.insignia || '¡Logro Completado!'}</h3>
            {data.xp > 0 && (
              <Badge className="mt-3 bg-amber-500/20 text-amber-300 border-amber-500/30 font-black text-sm">
                +{data.xp} XP
              </Badge>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Viewer ──────────────────────────────────────────────────────────────
interface LatamDynamicViewerProps {
  level: any;      // The level object from the backend (with descripcion JSON)
  onClose: () => void;
}

export const LatamDynamicViewer = ({ level, onClose }: LatamDynamicViewerProps) => {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [completed, setCompleted] = useState(false);

  // Parse the stored JSON
  const parsed: { metadata?: any; blocks?: Block[] } = React.useMemo(() => {
    if (!level?.descripcion) return { blocks: [] };
    try { return JSON.parse(level.descripcion); } catch { return { blocks: [] }; }
  }, [level]);

  const blocks: Block[] = parsed.blocks || [];
  const meta = parsed.metadata || {};
  const block = blocks[currentBlock];
  const progress = blocks.length > 0 ? ((currentBlock + 1) / blocks.length) * 100 : 0;

  const handleAnswer = (id: string, val: any) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const goNext = () => {
    if (currentBlock < blocks.length - 1) setCurrentBlock(n => n + 1);
    else setCompleted(true);
  };

  const goPrev = () => setCurrentBlock(n => Math.max(0, n - 1));

  // Fallback for non-dynamic content
  if (blocks.length === 0) {
    return (
      <div className="fixed inset-0 z-[110] bg-[#020617] flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-6 max-w-md p-8">
          <Wrench className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-2xl font-black text-white italic">Sesión sin bloques</h2>
          <p className="text-slate-400">Esta sesión aún no tiene contenido interactivo configurado por tu docente.</p>
          <Button onClick={onClose} className="bg-blue-600 rounded-2xl h-12 px-8 font-black">Salir</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] bg-[#020617] flex flex-col font-sans overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 construction-grid opacity-20" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[200px] rounded-full pointer-events-none" />
      </div>

      {/* Header */}
      <div className="relative z-20 px-8 py-5 border-b border-white/5 flex items-center justify-between bg-[#020617]/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <Rocket className="text-blue-400 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black italic uppercase tracking-tighter text-white leading-none">
              {meta.title || level?.tituloNivel || 'Sesión Latam'}
            </h1>
            <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest mt-0.5">
              {meta.codigo || 'MOD'} · {meta.software || 'Libre'} · Edad: {meta.edad || '--'}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="hidden md:flex flex-col items-end gap-1">
          <div className="flex gap-2 items-center">
            <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Bloque</span>
            <span className="text-sm font-black text-white tabular-nums">{currentBlock + 1} / {blocks.length}</span>
          </div>
          <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
        </div>

        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto relative z-10 px-4 md:px-12 py-8">
        <div className="max-w-2xl mx-auto">

          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-10 py-20">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full animate-pulse" />
                  <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] flex items-center justify-center mx-auto relative shadow-[0_20px_50px_rgba(59,130,246,0.3)]">
                    <Award className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-5xl font-black italic text-white uppercase tracking-tighter">¡COMPLETADO!</h3>
                  <p className="text-slate-400 font-medium text-lg max-w-sm mx-auto">
                    Has recorrido todos los bloques de esta sesión exitosamente.
                  </p>
                </div>
                <Button onClick={onClose}
                  className="bg-white text-slate-900 hover:bg-blue-50 rounded-2xl h-14 px-12 font-black uppercase tracking-widest text-sm">
                  Finalizar Sesión
                </Button>
              </motion.div>
            ) : (
              <motion.div key={currentBlock} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <BlockView block={block} onAnswer={handleAnswer} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Nav */}
      {!completed && (
        <div className="relative z-20 px-8 py-5 border-t border-white/5 bg-[#020617]/80 backdrop-blur-xl flex items-center justify-between shrink-0">
          <Button variant="ghost" onClick={goPrev} disabled={currentBlock === 0}
            className={cn("text-slate-500 font-black tracking-widest text-[10px] hover:text-white uppercase gap-2", currentBlock === 0 && "opacity-0 pointer-events-none")}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>

          {/* Dots */}
          <div className="flex gap-2">
            {blocks.map((_, i) => (
              <div key={i} className={cn('h-1.5 rounded-full transition-all duration-500',
                i === currentBlock ? 'bg-blue-500 w-8 shadow-[0_0_8px_rgba(59,130,246,0.6)]' :
                i < currentBlock ? 'bg-blue-900 w-1.5' : 'bg-white/10 w-1.5')} />
            ))}
          </div>

          <Button onClick={goNext}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[11px] gap-2 shadow-[0_10px_30px_rgba(37,99,235,0.2)]">
            {currentBlock < blocks.length - 1 ? (<>Siguiente <ChevronRight className="w-4 h-4" /></>) : (<>Finalizar <Star className="w-4 h-4" /></>)}
          </Button>
        </div>
      )}
    </div>
  );
};

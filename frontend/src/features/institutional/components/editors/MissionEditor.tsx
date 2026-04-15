import React, { useState } from 'react';
import { 
  Rocket, Target, Clock, Layers, Settings, Eye, EyeOff, Trophy, Save,
  Plus, Trash2, ArrowLeft, Wand2, Download, Upload, CheckCircle2, 
  FileUp, Loader2, ChevronUp, ChevronDown, X, FileText, BookOpen,
  Lightbulb, AlertTriangle, List, ToggleLeft, ArrowUpDown, MessageSquare,
  GripVertical, ChevronRight, Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MISSION_GRADES } from '../../services/curriculum.api';

// ─── Block type definitions ───────────────────────────────────────────────────
interface Block {
  id: string;
  type: string;
  visibleToStudent: boolean;
  content: any;
}

interface MomentData {
  id: string;
  title: string;
  time_minutes: number;
  blocks: Block[];
}

const BLOCK_CATALOG = [
  {
    group: '👨‍🏫 Guía del Docente',
    items: [
      { type: 'teacher_intent',    label: 'Intención Didáctica',  icon: Target,        color: 'blue',   defaultVisible: false, description: 'Por qué este momento importa pedagógicamente' },
      { type: 'teacher_script',    label: 'Guión Docente',        icon: FileText,      color: 'indigo', defaultVisible: false, description: 'Qué decir textualmente al grupo' },
      { type: 'teacher_observe',   label: 'Qué Observar',         icon: Eye,           color: 'violet', defaultVisible: false, description: 'Indicadores de comprensión a monitorear' },
      { type: 'teacher_errors',    label: 'Errores Esperados',    icon: AlertTriangle, color: 'orange', defaultVisible: false, description: 'Confusiones comunes a anticipar' },
      { type: 'teacher_intervene', label: 'Intervención',         icon: MessageSquare, color: 'rose',   defaultVisible: false, description: 'Cómo actuar si hay error' },
      { type: 'teacher_pedagogy',  label: 'Fundamento Pedagógico',icon: BookOpen,      color: 'cyan',   defaultVisible: false, description: 'Corrientes y teorías que sustentan' },
    ],
  },
  {
    group: '🚀 Contenido del Estudiante',
    items: [
      { type: 'student_context',   label: 'Narrativa / Contexto', icon: BookOpen,      color: 'emerald', defaultVisible: true, description: 'Situación, story o lectura introductoria' },
      { type: 'student_concept',   label: 'Concepto Académico',   icon: Lightbulb,     color: 'teal',    defaultVisible: true, description: 'Explicación teórica para el estudiante' },
      { type: 'student_activity',  label: 'Actividad / Reto',     icon: Rocket,        color: 'rose',    defaultVisible: true, description: 'Instrucción de la tarea a realizar' },
    ],
  },
  {
    group: '⚡ Interacciones',
    items: [
      { type: 'interaction_choice',    label: 'Opción Múltiple',     icon: List,         color: 'amber',  defaultVisible: true, description: 'Pregunta con opciones A, B, C, D' },
      { type: 'interaction_truefalse', label: 'Verdadero / Falso',   icon: ToggleLeft,   color: 'lime',   defaultVisible: true, description: 'Afirmación para validar' },
      { type: 'interaction_sequence',  label: 'Orden de Secuencia',  icon: ArrowUpDown,  color: 'purple', defaultVisible: true, description: 'Pasos a ordenar correctamente' },
      { type: 'interaction_upload',    label: 'Evidencia / Archivo', icon: FileUp,       color: 'pink',   defaultVisible: true, description: 'Estudiante sube evidencia' },
      { type: 'interaction_open',      label: 'Respuesta Abierta',   icon: MessageSquare,color: 'slate',  defaultVisible: true, description: 'Campo de texto libre' },
    ],
  },
  {
    group: '📊 Evaluación',
    items: [
      { type: 'kpi_feedback', label: 'Retroalimentación + KPI', icon: Trophy, color: 'yellow', defaultVisible: false, description: 'Mensajes de acierto/error y peso en el KPI' },
    ],
  },
];

const BLOCK_META: Record<string, { label: string; icon: any; colorClass: string; borderClass: string; bgClass: string; textClass: string }> = {
  teacher_intent:      { label: 'Intención Didáctica',   icon: Target,         colorClass: 'text-blue-600',   borderClass: 'border-blue-200',   bgClass: 'bg-blue-50',    textClass: 'text-blue-700' },
  teacher_script:      { label: 'Guión Docente',          icon: FileText,       colorClass: 'text-indigo-600', borderClass: 'border-indigo-200', bgClass: 'bg-indigo-50',  textClass: 'text-indigo-700' },
  teacher_observe:     { label: 'Qué Observar',           icon: Eye,            colorClass: 'text-violet-600', borderClass: 'border-violet-200', bgClass: 'bg-violet-50',  textClass: 'text-violet-700' },
  teacher_errors:      { label: 'Errores Esperados',      icon: AlertTriangle,  colorClass: 'text-orange-600', borderClass: 'border-orange-200', bgClass: 'bg-orange-50',  textClass: 'text-orange-700' },
  teacher_intervene:   { label: 'Intervención',           icon: MessageSquare,  colorClass: 'text-rose-600',   borderClass: 'border-rose-200',   bgClass: 'bg-rose-50',    textClass: 'text-rose-700' },
  teacher_pedagogy:    { label: 'Fundamento Pedagógico',  icon: BookOpen,       colorClass: 'text-cyan-600',   borderClass: 'border-cyan-200',   bgClass: 'bg-cyan-50',    textClass: 'text-cyan-700' },
  student_context:     { label: 'Narrativa / Contexto',   icon: BookOpen,       colorClass: 'text-emerald-600',borderClass: 'border-emerald-200',bgClass: 'bg-emerald-50', textClass: 'text-emerald-700' },
  student_concept:     { label: 'Concepto Académico',     icon: Lightbulb,      colorClass: 'text-teal-600',   borderClass: 'border-teal-200',   bgClass: 'bg-teal-50',    textClass: 'text-teal-700' },
  student_activity:    { label: 'Actividad / Reto',       icon: Rocket,         colorClass: 'text-rose-600',   borderClass: 'border-rose-200',   bgClass: 'bg-rose-50',    textClass: 'text-rose-700' },
  interaction_choice:  { label: 'Opción Múltiple',        icon: List,           colorClass: 'text-amber-600',  borderClass: 'border-amber-200',  bgClass: 'bg-amber-50',   textClass: 'text-amber-700' },
  interaction_truefalse:{ label: 'Verdadero / Falso',     icon: ToggleLeft,     colorClass: 'text-lime-600',   borderClass: 'border-lime-200',   bgClass: 'bg-lime-50',    textClass: 'text-lime-700' },
  interaction_sequence:{ label: 'Orden de Secuencia',     icon: ArrowUpDown,    colorClass: 'text-purple-600', borderClass: 'border-purple-200', bgClass: 'bg-purple-50',  textClass: 'text-purple-700' },
  interaction_upload:  { label: 'Evidencia / Archivo',    icon: FileUp,         colorClass: 'text-pink-600',   borderClass: 'border-pink-200',   bgClass: 'bg-pink-50',    textClass: 'text-pink-700' },
  interaction_open:    { label: 'Respuesta Abierta',       icon: MessageSquare, colorClass: 'text-slate-600',  borderClass: 'border-slate-200',  bgClass: 'bg-slate-50',   textClass: 'text-slate-700' },
  kpi_feedback:        { label: 'Retroalimentación + KPI', icon: Trophy,        colorClass: 'text-yellow-600', borderClass: 'border-yellow-200', bgClass: 'bg-yellow-50',  textClass: 'text-yellow-700' },
};

// ─── Block Content Renderer ───────────────────────────────────────────────────
function BlockContent({ block, onUpdate, isReadOnly }: { block: Block; onUpdate: (content: any) => void; isReadOnly?: boolean }) {
  const c = block.content || {};

  const field = (key: string, label: string, multiline = false, placeholder = '') => (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      {multiline ? (
        isReadOnly ? (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold p-4 text-slate-700 min-h-[80px] whitespace-pre-wrap shadow-inner leading-relaxed">
            {c[key] || <span className="text-slate-400 italic">Sin contenido</span>}
          </div>
        ) : (
          <Textarea
            readOnly={isReadOnly}
            value={c[key] || ''}
            onChange={e => onUpdate({ ...c, [key]: e.target.value })}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }}
            placeholder={placeholder}
            className="bg-white border-slate-100 focus:border-current rounded-2xl text-xs font-bold min-h-[80px] resize-none overflow-hidden transition-all"
            style={{ height: 'auto' }}
          />
        )
      ) : (
        isReadOnly ? (
          <div className="bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold px-4 py-2.5 text-slate-700 min-h-[40px] flex items-center shadow-inner">
            {c[key] || <span className="text-slate-400 italic">Sin contenido</span>}
          </div>
        ) : (
          <Input
            readOnly={isReadOnly}
            value={c[key] || ''}
            onChange={e => onUpdate({ ...c, [key]: e.target.value })}
            placeholder={placeholder}
            className="bg-white border-slate-100 focus:border-current rounded-xl text-xs font-bold h-10"
          />
        )
      )}
    </div>
  );

  switch (block.type) {
    case 'teacher_intent':
      return field('text', 'Intencionalidad Didáctica', true, 'Por qué este momento pedagógicamente...');
    case 'teacher_script':
      return field('text', 'Guión Textual', true, '"Ahora, quiero que imaginen..."');
    case 'teacher_observe':
      return field('text', 'Indicadores a Observar', true, 'Que el estudiante logre...');
    case 'teacher_errors':
      return field('text', 'Errores Comunes Esperados', true, 'Confundir X con Y...');
    case 'teacher_intervene':
      return field('text', 'Intervención Sugerida', true, 'Si hay error, preguntar...');
    case 'teacher_pedagogy':
      return field('text', 'Corrientes / Teorías', false, 'Constructivismo, Aprendizaje Significativo...');
    case 'student_context':
    case 'student_concept':
    case 'student_activity':
      return field('text', block.type === 'student_activity' ? 'Instrucción / Reto' : 'Contenido', true, 'Escribe el texto aquí...');
    
    case 'interaction_choice': {
      const opts: { text: string }[] = c.options || [{ text: '' }, { text: '' }];
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pregunta</label>
            <Input readOnly={isReadOnly} value={c.question || ''} onChange={e => onUpdate({ ...c, question: e.target.value })} className="bg-white border-slate-100 rounded-xl text-xs font-bold h-10" placeholder="¿Cuál es la secuencia correcta?" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Opciones</label>
            {opts.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button disabled={isReadOnly} onClick={() => onUpdate({ ...c, correct_answer: i })}
                  className={cn('w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    c.correct_answer === i ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-300')}>
                  {c.correct_answer === i ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black">{String.fromCharCode(65 + i)}</span>}
                </button>
                <Input readOnly={isReadOnly} value={opt.text} placeholder={`Opción ${i + 1}`}
                  onChange={e => { const o = [...opts]; o[i] = { text: e.target.value }; onUpdate({ ...c, options: o }); }}
                  className="flex-1 h-9 bg-white border-slate-100 rounded-xl text-xs font-bold" />
                {!isReadOnly && opts.length > 2 && (
                  <button onClick={() => onUpdate({ ...c, options: opts.filter((_, j) => j !== i) })} className="text-slate-200 hover:text-rose-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {!isReadOnly && (
              <Button variant="ghost" onClick={() => onUpdate({ ...c, options: [...opts, { text: '' }] })}
                className="h-8 px-3 text-amber-600 hover:bg-amber-50 rounded-xl text-[9px] font-black uppercase tracking-wider gap-1.5">
                <Plus className="w-3 h-3" /> Añadir Opción
              </Button>
            )}
          </div>
        </div>
      );
    }

    case 'interaction_truefalse':
      return (
        <div className="space-y-3">
          {field('statement', 'Afirmación', false, 'El semáforo en verde significa...')}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Respuesta Correcta</label>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <Button key={String(val)} disabled={isReadOnly} variant="ghost"
                  onClick={() => onUpdate({ ...c, correct_answer: val })}
                  className={cn('flex-1 h-11 rounded-2xl font-black uppercase text-sm transition-all',
                    c.correct_answer === val
                      ? (val ? 'bg-emerald-500 text-white shadow-md' : 'bg-rose-500 text-white shadow-md')
                      : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300')}>
                  {val ? 'Verdadero ✓' : 'Falso ✗'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );

    case 'interaction_sequence': {
      const items: { text: string }[] = c.items || [{ text: '' }, { text: '' }];
      return (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
            El orden aquí es el orden <span className="text-purple-600 font-black">CORRECTO</span>. El sistema lo mezclará para el estudiante.
          </p>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-purple-400">{i + 1}</span>
                </div>
                <Input readOnly={isReadOnly} value={item.text} placeholder={`Paso ${i + 1}`}
                  onChange={e => { const it = [...items]; it[i] = { text: e.target.value }; onUpdate({ ...c, items: it }); }}
                  className="flex-1 h-9 bg-white border-slate-100 rounded-xl text-xs font-bold" />
                {!isReadOnly && items.length > 2 && (
                  <button onClick={() => onUpdate({ ...c, items: items.filter((_, j) => j !== i) })} className="text-slate-200 hover:text-rose-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!isReadOnly && (
            <Button variant="ghost" onClick={() => onUpdate({ ...c, items: [...items, { text: '' }] })}
              className="h-8 px-3 text-purple-600 hover:bg-purple-50 rounded-xl text-[9px] font-black uppercase tracking-wider gap-1.5">
              <Plus className="w-3 h-3" /> Añadir Paso
            </Button>
          )}
        </div>
      );
    }

    case 'interaction_upload':
      return (
        <div className="space-y-3">
          {field('instruction', 'Instrucción', true, 'Toma una foto de tu trabajo y súbela aquí...')}
          {field('format_hint', 'Formato aceptado', false, 'JPG, PDF, PNG...')}
        </div>
      );

    case 'interaction_open':
      return (
        <div className="space-y-3">
          {field('question', 'Pregunta / Consigna', true, '¿Qué aprendiste hoy sobre...?')}
          {field('placeholder_hint', 'Pista para el estudiante', false, 'Escribe al menos 3 oraciones...')}
        </div>
      );

    case 'kpi_feedback':
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <label className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Al Acertar</label>
            <Input readOnly={isReadOnly} value={c.feedback_correct || ''} onChange={e => onUpdate({ ...c, feedback_correct: e.target.value })} placeholder="¡Excelente! Continúa..." className="h-9 bg-white border-emerald-100 text-xs font-bold rounded-xl" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase">KPI +</span>
              <Input type="number" readOnly={isReadOnly} value={c.kpi_correct ?? 10} onChange={e => onUpdate({ ...c, kpi_correct: parseInt(e.target.value) })} className="w-16 h-8 text-center font-black text-sm bg-white border-emerald-100 rounded-lg" />
              <span className="text-[9px] font-black text-slate-400">%</span>
            </div>
          </div>
          <div className="space-y-3 p-3 bg-rose-50 rounded-2xl border border-rose-100">
            <label className="text-[9px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-1"><X className="w-3 h-3" /> Al Fallar</label>
            <Input readOnly={isReadOnly} value={c.feedback_incorrect || ''} onChange={e => onUpdate({ ...c, feedback_incorrect: e.target.value })} placeholder="Inténtalo de nuevo..." className="h-9 bg-white border-rose-100 text-xs font-bold rounded-xl" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase">KPI -</span>
              <Input type="number" readOnly={isReadOnly} value={c.kpi_incorrect ?? 0} onChange={e => onUpdate({ ...c, kpi_incorrect: parseInt(e.target.value) })} className="w-16 h-8 text-center font-black text-sm bg-white border-rose-100 rounded-lg" />
              <span className="text-[9px] font-black text-slate-400">%</span>
            </div>
          </div>
        </div>
      );

    default:
      return <p className="text-xs text-slate-400 italic">Tipo de bloque desconocido: {block.type}</p>;
  }
}

// ─── Block Card ───────────────────────────────────────────────────────────────
function BlockCard({ block, onUpdate, onDelete, isReadOnly }: {
  block: Block; onUpdate: (b: Block) => void; onDelete: () => void; isReadOnly?: boolean;
}) {
  const meta = BLOCK_META[block.type];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <div className={cn('rounded-3xl border-2 overflow-hidden transition-all group', meta.borderClass, meta.bgClass + '/40')}>
      {/* Block Header */}
      <div className={cn('flex items-center justify-between px-5 py-3 border-b', meta.borderClass, meta.bgClass)}>
        <div className="flex items-center gap-2.5">
          {!isReadOnly && <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />}
          <Icon className={cn('w-4 h-4', meta.colorClass)} />
          <span className={cn('text-[10px] font-black uppercase tracking-[0.15em]', meta.colorClass)}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Visible to student toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
              {block.visibleToStudent ? 'Estudiante ve' : 'Solo docente'}
            </span>
            {block.visibleToStudent
              ? <Eye className="w-3.5 h-3.5 text-emerald-500" />
              : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            {!isReadOnly && (
              <Switch
                checked={block.visibleToStudent}
                onCheckedChange={val => onUpdate({ ...block, visibleToStudent: val })}
                className="scale-75 origin-right"
              />
            )}
          </div>
          {/* Delete */}
          {!isReadOnly && (
            <button onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {/* Block Content */}
      <div className="px-5 py-4">
        <BlockContent
          block={block}
          onUpdate={content => onUpdate({ ...block, content })}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
}

// ─── Toolbox Modal ────────────────────────────────────────────────────────────
function BlockToolbox({ onAdd, onClose }: { onAdd: (type: string) => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800">Añadir Bloque</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Elige el tipo de contenido</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {BLOCK_CATALOG.map(group => (
            <div key={group.group}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{group.group}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const meta = BLOCK_META[item.type];
                  return (
                    <button key={item.type}
                      onClick={() => { onAdd(item.type); onClose(); }}
                      className={cn(
                        'flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md active:scale-95',
                        meta.borderClass, meta.bgClass + '/30', 'hover:' + meta.bgClass
                      )}>
                      <Icon className={cn('w-5 h-5', meta.colorClass)} />
                      <div>
                        <p className={cn('text-[11px] font-black uppercase tracking-tight', meta.colorClass)}>{item.label}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-snug">{item.description}</p>
                      </div>
                      {!item.defaultVisible && (
                        <span className="text-[8px] font-black uppercase bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Solo docente</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Migrate legacy moment data to blocks ────────────────────────────────────
function migrateMomentToBlocks(moment: any): MomentData {
  if (moment.blocks && Array.isArray(moment.blocks)) {
    return moment as MomentData;
  }
  // Legacy: convert teacher/student/config to blocks
  const blocks: Block[] = [];
  const makeId = (suffix: string) => `migrated_${suffix}_${Date.now()}`;
  if (moment.teacher?.intention) blocks.push({ id: makeId('intent'), type: 'teacher_intent', visibleToStudent: false, content: { text: moment.teacher.intention } });
  if (moment.teacher?.pedagogy?.length) blocks.push({ id: makeId('pedagogy'), type: 'teacher_pedagogy', visibleToStudent: false, content: { text: (moment.teacher.pedagogy || []).join(', ') } });
  if (moment.teacher?.script) blocks.push({ id: makeId('script'), type: 'teacher_script', visibleToStudent: false, content: { text: moment.teacher.script } });
  if (moment.teacher?.observation) blocks.push({ id: makeId('observe'), type: 'teacher_observe', visibleToStudent: false, content: { text: moment.teacher.observation } });
  if (moment.teacher?.common_errors?.length) blocks.push({ id: makeId('errors'), type: 'teacher_errors', visibleToStudent: false, content: { text: (moment.teacher.common_errors || []).join(', ') } });
  if (moment.teacher?.intervention) blocks.push({ id: makeId('intervene'), type: 'teacher_intervene', visibleToStudent: false, content: { text: moment.teacher.intervention } });
  if (moment.student?.context) blocks.push({ id: makeId('ctx'), type: 'student_context', visibleToStudent: true, content: { text: moment.student.context } });
  if (moment.student?.concept) blocks.push({ id: makeId('concept'), type: 'student_concept', visibleToStudent: true, content: { text: moment.student.concept } });
  const actText = moment.student?.content || moment.student?.question || moment.student?.instruction;
  if (actText) blocks.push({ id: makeId('activity'), type: 'student_activity', visibleToStudent: true, content: { text: actText } });
  const interactionType = moment.config?.interaction_type;
  if (interactionType === 'multiple_choice' && moment.student?.options) {
    blocks.push({ id: makeId('choice'), type: 'interaction_choice', visibleToStudent: true, content: { options: moment.student.options, correct_answer: moment.student.correct_answer } });
  }
  if (interactionType === 'true_false') {
    blocks.push({ id: makeId('tf'), type: 'interaction_truefalse', visibleToStudent: true, content: { statement: '',  correct_answer: moment.student?.correct_answer } });
  }
  if (interactionType === 'sequence_order' && moment.student?.items) {
    const items = (moment.student.items || []).map((it: any) => typeof it === 'string' ? { text: it } : it);
    blocks.push({ id: makeId('seq'), type: 'interaction_sequence', visibleToStudent: true, content: { items } });
  }
  return { id: moment.id, title: moment.title, time_minutes: moment.time_minutes ?? 5, blocks };
}

// ─── Main MissionEditor ───────────────────────────────────────────────────────
interface MissionEditorProps {
  data: any;
  onSave: (data: any) => void;
  onClose: () => void;
  isReadOnly?: boolean;
}

export const MissionEditor = ({ data, onSave, onClose, isReadOnly }: MissionEditorProps) => {
  const [missionData, setMissionData] = useState(() => ({
    ...data,
    moments: (data.moments || []).map(migrateMomentToBlocks),
  }));
  const [activeMomentIdx, setActiveMomentIdx] = useState<number | null>(0);
  const [showToolbox, setShowToolbox] = useState(false);
  const [saving, setSaving] = useState(false);

  const moments: MomentData[] = missionData.moments || [];
  const activeMoment = activeMomentIdx !== null ? moments[activeMomentIdx] : null;

  const updateMoments = (newMoments: MomentData[]) =>
    setMissionData((prev: any) => ({ ...prev, moments: newMoments }));

  const updateMoment = (idx: number, updated: MomentData) => {
    const newMoments = [...moments];
    newMoments[idx] = updated;
    updateMoments(newMoments);
  };

  const addMoment = () => {
    const newMoment: MomentData = {
      id: `moment_${Date.now()}`,
      title: 'Nuevo Momento',
      time_minutes: 8,
      blocks: [],
    };
    const newMoments = [...moments, newMoment];
    updateMoments(newMoments);
    setActiveMomentIdx(newMoments.length - 1);
  };

  const removeMoment = (idx: number) => {
    updateMoments(moments.filter((_, i) => i !== idx));
    if (activeMomentIdx === idx) setActiveMomentIdx(null);
    else if (activeMomentIdx !== null && activeMomentIdx > idx) setActiveMomentIdx(activeMomentIdx - 1);
  };

  const addBlock = (type: string) => {
    if (activeMomentIdx === null) return;
    const allCatalogItems = BLOCK_CATALOG.flatMap(g => g.items);
    const catalogItem = allCatalogItems.find(i => i.type === type);
    const newBlock: Block = {
      id: `block_${Date.now()}`,
      type,
      visibleToStudent: catalogItem?.defaultVisible ?? true,
      content: {},
    };
    const moment = moments[activeMomentIdx];
    updateMoment(activeMomentIdx, { ...moment, blocks: [...moment.blocks, newBlock] });
  };

  const updateBlock = (blockIdx: number, updated: Block) => {
    if (activeMomentIdx === null) return;
    const moment = moments[activeMomentIdx];
    const newBlocks = [...moment.blocks];
    newBlocks[blockIdx] = updated;
    updateMoment(activeMomentIdx, { ...moment, blocks: newBlocks });
  };

  const deleteBlock = (blockIdx: number) => {
    if (activeMomentIdx === null) return;
    const moment = moments[activeMomentIdx];
    updateMoment(activeMomentIdx, { ...moment, blocks: moment.blocks.filter((_, i) => i !== blockIdx) });
  };

  const handleSave = () => {
    setSaving(true);
    onSave(missionData);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="relative w-full min-h-[700px] flex rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl bg-white animate-in fade-in duration-500">

      {/* === SIDEBAR === */}
      <div className="bg-white border-r border-slate-100 flex flex-col p-6 shrink-0 relative z-20 w-72 shadow-lg">
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-blue-600 shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h3 className="text-base font-black text-slate-800 tracking-tighter truncate">
              {isReadOnly ? 'Ficha de Misión' : 'Diseño de Misión'}
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Momentos pedagógicos</span>
          </div>
        </div>

        {/* Mission Meta */}
        <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Título de Misión</label>
            <Input readOnly={isReadOnly} value={missionData.mission?.title || ''} onChange={e => setMissionData((p: any) => ({ ...p, mission: { ...p.mission, title: e.target.value } }))}
              className="bg-slate-50 border-slate-100 font-black text-slate-700 h-10 rounded-2xl text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Nivel</label>
              <select disabled={isReadOnly} value={missionData.mission?.level || ''} onChange={e => setMissionData((p: any) => ({ ...p, mission: { ...p.mission, level: e.target.value } }))}
                className="w-full h-9 px-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-xs text-slate-700">
                {MISSION_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Minutos</label>
              <Input type="number" readOnly={isReadOnly} value={missionData.mission?.duration_minutes || 55} onChange={e => setMissionData((p: any) => ({ ...p, mission: { ...p.mission, duration_minutes: parseInt(e.target.value) } }))}
                className="bg-slate-50 border-slate-100 font-black text-slate-700 h-9 rounded-xl text-sm" />
            </div>
          </div>
        </div>

        {/* Moments List */}
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          {moments.map((m, idx) => (
            <div key={m.id}
              onClick={() => setActiveMomentIdx(activeMomentIdx === idx ? null : idx)}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all border-2',
                activeMomentIdx === idx
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-50 border-transparent hover:border-blue-100 hover:bg-blue-50/50 text-slate-700'
              )}>
              <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0',
                activeMomentIdx === idx ? 'bg-white/20 text-white' : 'bg-white text-slate-400 border border-slate-200')}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[11px] uppercase tracking-tight truncate">{m.title}</p>
                <p className={cn('text-[9px] font-bold', activeMomentIdx === idx ? 'text-blue-200' : 'text-slate-400')}>
                  {m.time_minutes} min · {m.blocks.length} bloques
                </p>
              </div>
              {!isReadOnly && (
                <button onClick={e => { e.stopPropagation(); removeMoment(idx); }}
                  className={cn('w-6 h-6 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100',
                    activeMomentIdx === idx ? 'text-white/60 hover:text-white hover:bg-white/20' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50')}>
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {!isReadOnly && (
            <button onClick={addMoment}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-400 hover:text-blue-600 transition-all">
              <Plus className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Añadir Momento</span>
            </button>
          )}
        </div>

        {/* Save button */}
        {!isReadOnly && (
          <div className="pt-4 border-t border-slate-100 mt-4">
            <Button onClick={handleSave} disabled={saving}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 transition-all active:scale-95">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar Misión</>}
            </Button>
          </div>
        )}
      </div>

      {/* === MAIN CANVAS === */}
      <div className="flex-1 relative bg-[#F8FAFC] overflow-y-auto custom-scrollbar">
        <div className="absolute inset-0 construction-grid opacity-20 pointer-events-none" />

        {activeMoment && activeMomentIdx !== null ? (
          <div className="relative z-10 max-w-4xl mx-auto py-12 px-8 space-y-4 pb-32">

            {/* Moment Header */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-600/20">
                  {activeMomentIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  {isReadOnly
                    ? <h2 className="text-lg font-black text-slate-800">{activeMoment.title}</h2>
                    : <Input value={activeMoment.title} onChange={e => updateMoment(activeMomentIdx, { ...activeMoment, title: e.target.value })}
                        className="font-black text-lg border-transparent bg-transparent h-auto p-0 focus:border-b-2 focus:border-blue-500 rounded-none focus-visible:ring-0 text-slate-800" />
                  }
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {isReadOnly
                    ? <span className="font-black text-sm text-slate-600">{activeMoment.time_minutes} min</span>
                    : <Input type="number" value={activeMoment.time_minutes} onChange={e => updateMoment(activeMomentIdx, { ...activeMoment, time_minutes: parseInt(e.target.value) })}
                        className="w-16 h-8 text-center font-black text-sm bg-slate-50 border-slate-100 rounded-xl" />
                  }
                </div>
              </div>
              {!isReadOnly && (
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <Layers className="w-3 h-3" />
                  {activeMoment.blocks.length} bloques · haz clic en un bloque para editarlo
                </div>
              )}
            </div>

            {/* Blocks - stacked */}
            {activeMoment.blocks.length === 0 && !isReadOnly && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
                  <Layers className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-tight">Momento vacío</p>
                <p className="text-xs text-slate-300 font-bold">Usa el botón de abajo para añadir bloques</p>
              </div>
            )}

            {activeMoment.blocks.map((block, blockIdx) => (
              <BlockCard
                key={block.id}
                block={block}
                onUpdate={updated => updateBlock(blockIdx, updated)}
                onDelete={() => deleteBlock(blockIdx)}
                isReadOnly={isReadOnly}
              />
            ))}

            {/* Add Block Button */}
            {!isReadOnly && (
              <button onClick={() => setShowToolbox(true)}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-3xl border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-all group">
                <div className="w-8 h-8 rounded-xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Añadir Bloque</span>
              </button>
            )}
          </div>
        ) : (
          // No moment selected
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-8 space-y-4 relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center shadow-xl text-blue-600">
              <Cpu className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800">
              Estación de <span className="text-blue-600">Ingeniería</span>
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Selecciona un momento del panel izquierdo para editarlo
            </p>
            {!isReadOnly && (
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border-rose-100 px-4 py-1.5 rounded-full">
                Engineering Mode
              </Badge>
            )}
          </div>
        )}

        {/* Toolbox */}
        {showToolbox && (
          <BlockToolbox onAdd={addBlock} onClose={() => setShowToolbox(false)} />
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  LayoutList,
  MonitorPlay,
  ArrowRight,
  Target,
  Rocket,
  Wrench,
  Layers,
  Search,
  Lightbulb,
  Settings2,
  Lock,
  Save,
  Loader2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  UserCheck,
  Maximize2,
  Minimize2,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModuloInst } from '../../../services/curriculum.api';

interface Section {
  id: number;
  nombre: string;
  activo: boolean;
  modules: ModuloInst[];
}

interface Props {
  sections: Section[];
  courseName: string;
  onClose: () => void;
  onToggleVisibility?: (moduleId: number, currentStatus: boolean) => void;
  onToggleSectionVisibility?: (sectionId: number, currentStatus: boolean) => void;
  onUpdateContent?: (moduleId: number, newContent: any) => Promise<void>;
  onReorderModules?: (sectionId: number, orderedIds: number[]) => Promise<void>;
  onReorderSections?: (orderedIds: number[]) => Promise<void>;
  updating?: string | null;
  initialModuleId?: number | null;
}

interface NormalizedBlock {
  id: string | number;
  audience: 'student' | 'teacher';
  type?: string;
  options?: any[];
  raw?: any;
  content: string;
}

interface ParsedLevel {
  id?: string | number;
  title?: string;
  data?: any;
  type?: string;
  interaction_type?: string;
  blocks?: any[];
  parsedBlocks: NormalizedBlock[];
  displayOrder: number;
  _isVisible: boolean;
  [key: string]: any;
}

const getBlockText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const getOptionText = (option: any): string => {
  if (typeof option === 'string') return option;
  if (typeof option?.text === 'string') return option.text;
  if (typeof option?.label === 'string') return option.label;
  if (typeof option?.value === 'string') return option.value;
  return 'Opción sin texto';
};

const CarouselView = ({
  levels,
  isEditing,
  showTeacherNotes,
  isFocusMode,
  moduleTitle,
  onMove,
  onToggleVisibility,
}: {
  levels: ParsedLevel[];
  isEditing: boolean;
  showTeacherNotes: boolean;
  isFocusMode: boolean;
  moduleTitle: string;
  onMove: (from: number, to: number) => void;
  onToggleVisibility: (idx: number) => void;
}) => {
  const allSlides = React.useMemo(() => {
    const slides: Array<
      NormalizedBlock & {
        momentIdx: number;
        momentTitle: string;
        momentIsVisible: boolean;
        blockIdx: number;
        totalBlocksInMoment: number;
        momentId: string | number;
      }
    > = [];

    levels.forEach((lvl, sIdx) => {
      const momentBlocks = lvl.parsedBlocks || [];
      momentBlocks.forEach((block, bIdx: number) => {
        slides.push({
          ...block,
          momentIdx: sIdx,
          momentTitle: lvl.title || lvl.data?.titulo || `Fase ${sIdx + 1}`,
          momentIsVisible: lvl._isVisible,
          blockIdx: bIdx,
          totalBlocksInMoment: momentBlocks.length,
          momentId: lvl.id || sIdx,
        });
      });
    });

    if (slides.length === 0) {
      slides.push({
        id: 'empty',
        content: 'Sin contenido disponible',
        audience: 'student',
        momentIdx: 0,
        momentTitle: 'Vacío',
        momentIsVisible: true,
        blockIdx: 0,
        totalBlocksInMoment: 1,
        momentId: 'empty',
      });
    }

    return slides;
  }, [levels]);

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= allSlides.length) {
      setIdx(Math.max(0, allSlides.length - 1));
    }
  }, [allSlides.length, idx]);

  const currentSlide = allSlides[idx];

  const next = () => setIdx((prev) => (prev + 1) % allSlides.length);
  const prev = () => setIdx((prev) => (prev - 1 + allSlides.length) % allSlides.length);

  if (levels.length === 0 || !currentSlide) {
    return (
      <div className="p-16 text-center text-slate-300 font-black uppercase tracking-widest">
        Cargando estación...
      </div>
    );
  }

  const currentMomentIndex = currentSlide.momentIdx;
  const currentMoment = levels[currentMomentIndex];
  const momentSummary = levels.map((level, index) => ({
    id: level.id ?? index,
    title: level.title || level.data?.titulo || `Fase ${index + 1}`,
    slideIndex: allSlides.findIndex((slide) => slide.momentIdx === index),
    isVisible: level._isVisible,
    blockCount: level.parsedBlocks.length,
  }));
  const rawBlock = currentSlide.raw?.content || currentSlide.raw || {};
  const contextText =
    getBlockText(rawBlock.context) ||
    getBlockText(rawBlock.content?.context) ||
    getBlockText(currentMoment?.student?.context);
  const instructionText =
    getBlockText(rawBlock.instruction) ||
    getBlockText(rawBlock.content?.instruction) ||
    getBlockText(currentMoment?.student?.instruction);
  const questionText =
    getBlockText(rawBlock.question) ||
    getBlockText(rawBlock.content?.question) ||
    getBlockText(currentMoment?.student?.question);
  const conceptText =
    getBlockText(rawBlock.concept) ||
    getBlockText(rawBlock.content?.concept) ||
    getBlockText(currentMoment?.student?.concept);
  const teacherObservation =
    getBlockText(currentMoment?.teacher?.observation) ||
    getBlockText(currentMoment?.teacher?.intention);
  const teacherPedagogy = Array.isArray(currentMoment?.teacher?.pedagogy)
    ? currentMoment.teacher.pedagogy.filter(Boolean)
    : [];
  const currentMomentLabel = currentMoment?.title || currentSlide.momentTitle;
  const currentBlockNumber = currentSlide.blockIdx + 1;
  const isTeacher = currentSlide.audience === 'teacher';
  const isInteractive =
    currentSlide.type?.startsWith('interaction') ||
    currentSlide.type === 'multiple_choice' ||
    currentSlide.type === 'sequence_order' ||
    currentSlide.type === 'auto_evaluation' ||
    currentSlide.type === 'quiz' ||
    (currentSlide.options?.length ?? 0) > 0 ||
    (currentSlide.raw?.content?.options?.length ?? 0) > 0;
  const options = currentSlide.options || currentSlide.raw?.content?.options || [];

  if (isTeacher && !showTeacherNotes) {
    return (
      <div className="h-full min-h-[420px] px-4 md:px-6 xl:px-8 py-4 md:py-5">
        <div className="mx-auto max-w-5xl h-full rounded-[1.5rem] border-4 border-dashed border-amber-100 bg-amber-50/50 flex flex-col items-center justify-center text-center p-8">
          <Lock className="w-14 h-14 text-amber-300 mb-5" />
          <h4 className="text-amber-800 font-black uppercase tracking-[0.24em] text-base mb-3">
            Cápsula Docente
          </h4>
          <p className="text-amber-600 text-sm md:text-base italic max-w-md">
            Esta diapositiva está reservada para el tutor. Activa las notas para verla.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-0 flex flex-col',
        isFocusMode ? 'bg-slate-950' : 'bg-slate-50/60'
      )}
    >
      <div className="px-3 pt-3 sm:px-4 md:px-6 xl:px-8">
        <div className="mx-auto max-w-6xl space-y-2.5">
          <div className="rounded-[1.25rem] border border-slate-200 bg-white px-3 py-2.5 sm:px-4 flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-600">
                {moduleTitle}
              </p>
              <h3 className="max-w-full break-words text-sm sm:text-base font-black text-slate-900 leading-tight">
                {currentMomentLabel}
              </h3>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge className="bg-blue-600 text-white border-none px-2.5 py-1 rounded-lg font-black text-[8px] tracking-[0.16em]">
                {isTeacher ? 'DOCENTE' : 'ESTUDIANTE'}
              </Badge>
              {isInteractive && (
                <Badge className="bg-amber-500 text-white border-none px-2.5 py-1 rounded-lg font-black text-[8px] tracking-[0.16em]">
                  INTERACTIVA
                </Badge>
              )}
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                Fase {currentMomentIndex + 1}/{levels.length}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                Bloque {currentBlockNumber}/{currentSlide.totalBlocksInMoment}
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {momentSummary.map((moment, index) => {
              const isActive = index === currentMomentIndex;
              return (
                <button
                  key={moment.id}
                  onClick={() => setIdx(moment.slideIndex)}
                  className={cn(
                    'min-w-[122px] md:min-w-[150px] rounded-[1rem] border px-2.5 py-2 text-left transition-all duration-300 shrink-0',
                    isActive
                      ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[8px] font-black uppercase tracking-[0.16em]">
                      Fase {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={cn('text-[8px] font-black uppercase', isActive ? 'text-white/80' : moment.isVisible ? 'text-emerald-600' : 'text-amber-600')}>
                      {moment.isVisible ? 'Visible' : 'Oculta'}
                    </span>
                  </div>
                  <p className={cn('mt-1 text-[11px] md:text-xs font-black leading-tight line-clamp-2', isActive ? 'text-white' : 'text-slate-900')}>
                    {moment.title}
                  </p>
                  <p className={cn('mt-1 text-[8px] font-bold uppercase tracking-[0.14em]', isActive ? 'text-white/70' : 'text-slate-400')}>
                    {moment.blockCount} bloques
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-3 py-3 sm:px-4 md:px-6 xl:px-8">
        <div className="mx-auto max-w-6xl h-full flex flex-col gap-3 md:gap-4">
          {isEditing && (
            <div className="self-end flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
              <Button
                onClick={() => onMove(currentSlide.momentIdx, currentSlide.momentIdx - 1)}
                disabled={currentSlide.momentIdx === 0}
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-xl text-white hover:bg-blue-600 disabled:opacity-30"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onMove(currentSlide.momentIdx, currentSlide.momentIdx + 1)}
                disabled={currentSlide.momentIdx === levels.length - 1}
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-xl text-white hover:bg-blue-600 disabled:opacity-30"
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onToggleVisibility(currentSlide.momentIdx)}
                variant="ghost"
                size="icon"
                className={cn(
                  'w-9 h-9 rounded-xl transition-all',
                  currentSlide.momentIsVisible ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-amber-400 hover:bg-amber-500/20'
                )}
              >
                {currentSlide.momentIsVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="flex-1 min-h-0 grid gap-3 md:gap-4 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start"
            >
              <div className="w-full min-h-0 rounded-[1.5rem] border border-blue-100 bg-white p-3 md:p-4 lg:p-5 shadow-[0_24px_60px_-28px_rgba(37,99,235,0.16)] flex flex-col gap-3 overflow-hidden">
                {(contextText || instructionText || questionText || conceptText) && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {contextText && (
                      <div className="rounded-[1rem] border border-blue-100 bg-blue-50/85 p-2.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Contexto</p>
                        <p className="mt-1 text-[11px] md:text-xs font-semibold text-slate-700 whitespace-pre-wrap break-words">
                          {contextText}
                        </p>
                      </div>
                    )}
                    {instructionText && (
                      <div className="rounded-[1rem] border border-sky-100 bg-sky-50/85 p-2.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500">Instrucción</p>
                        <p className="mt-1 text-[11px] md:text-xs font-semibold text-slate-700 whitespace-pre-wrap break-words">
                          {instructionText}
                        </p>
                      </div>
                    )}
                    {questionText && (
                      <div className="rounded-[1rem] border border-amber-100 bg-amber-50/85 p-2.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-500">Pregunta</p>
                        <p className="mt-1 text-[11px] md:text-xs font-semibold text-slate-700 whitespace-pre-wrap break-words">
                          {questionText}
                        </p>
                      </div>
                    )}
                    {conceptText && (
                      <div className="rounded-[1rem] border border-emerald-100 bg-emerald-50/85 p-2.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-500">Concepto Clave</p>
                        <p className="mt-1 text-[11px] md:text-xs font-semibold text-slate-700 whitespace-pre-wrap break-words">
                          {conceptText}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-[1rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/45 to-slate-50 px-4 py-3">
                  <h3
                    className={cn(
                      'text-base md:text-lg xl:text-xl font-black leading-tight tracking-tight whitespace-pre-wrap break-words',
                      isTeacher ? 'text-amber-900' : 'text-slate-900'
                    )}
                  >
                    {currentSlide.content}
                  </h3>
                </div>

                {isInteractive ? (
                  options.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2.5 overflow-y-auto pr-1 custom-scrollbar lg:grid-cols-2">
                      {options.map((opt: any, i: number) => {
                        const isCorrect =
                          opt?.isCorrect ||
                          currentSlide.raw?.content?.answer === opt?.text ||
                          opt?.correctIndex !== undefined;

                        return (
                          <div
                            key={`${currentSlide.id}-${i}`}
                            className="rounded-[1rem] border border-blue-100 bg-blue-50/45 p-3 md:p-3.5 flex items-start gap-2.5 min-w-0"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white border border-blue-100 flex items-center justify-center font-black text-blue-600 shrink-0">
                              {String.fromCharCode(65 + i)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <p className="text-[13px] md:text-sm font-bold text-slate-800 break-words leading-relaxed">
                                {getOptionText(opt)}
                              </p>
                              {typeof opt?.feedback === 'string' && opt.feedback.trim().length > 0 && (
                                <p className="text-[10px] md:text-[11px] text-slate-500 break-words">
                                  {opt.feedback}
                                </p>
                              )}
                            </div>
                            {isCorrect && showTeacherNotes && (
                              <Badge className="bg-emerald-500 text-white border-none px-2 py-1 rounded-lg text-[8px] font-black shrink-0">
                                CLAVE
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 min-h-[180px] rounded-[1rem] border-2 border-dashed border-blue-100 bg-blue-50/35 flex flex-col items-center justify-center text-center p-6">
                      <Code2 className="w-10 h-10 text-blue-200 mb-3" />
                      <p className="text-slate-500 font-black uppercase tracking-[0.18em] text-[11px]">
                        Simulador de Interacción
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex-1 min-h-[180px] rounded-[1rem] border border-blue-100 bg-blue-50/35 p-4 md:p-5 flex items-center">
                    <p
                      className={cn(
                        'text-base md:text-lg xl:text-xl font-black leading-[1.2] tracking-tight whitespace-pre-wrap break-words',
                        isTeacher ? 'text-amber-900' : 'text-slate-900'
                      )}
                    >
                      {currentSlide.content}
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full grid gap-3 xl:grid-cols-1">
                <div className="rounded-[1.25rem] border border-blue-100 bg-white p-3 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-600">Panel Tutor</p>
                  <h4 className="mt-1.5 text-[13px] md:text-sm font-black text-slate-900 break-words">
                    {currentMomentLabel}
                  </h4>
                  <div className="mt-2.5 space-y-2">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Módulo</p>
                      <p className="mt-1 text-[11px] font-black text-slate-700 break-words">{moduleTitle}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Bloque</p>
                        <p className="mt-1 text-[11px] font-black text-slate-700">
                          {currentBlockNumber}/{currentSlide.totalBlocksInMoment}
                        </p>
                      </div>
                      <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Fase</p>
                        <p className="mt-1 text-[11px] font-black text-slate-700">
                          {currentMomentIndex + 1}/{levels.length}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Visibilidad</p>
                      <Badge
                        className={cn(
                          'mt-1 border-none px-2 py-1 rounded-lg text-[8px] font-black',
                          currentSlide.momentIsVisible ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        )}
                      >
                        {currentSlide.momentIsVisible ? 'Visible' : 'Oculta'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {showTeacherNotes && (teacherObservation || teacherPedagogy.length > 0) && (
                  <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50/80 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600">Guía Docente</p>
                    {teacherObservation && (
                      <p className="mt-1.5 text-[11px] md:text-xs font-medium text-amber-900 whitespace-pre-wrap break-words leading-relaxed">
                        {teacherObservation}
                      </p>
                    )}
                    {teacherPedagogy.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {teacherPedagogy.map((item: string) => (
                          <Badge
                            key={item}
                            className="bg-white text-amber-700 border border-amber-200 px-2 py-1 rounded-lg text-[8px] font-black uppercase"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="px-3 pb-3 sm:px-4 md:px-6 md:pb-6 xl:px-8">
        <div className="mx-auto max-w-6xl rounded-[1.25rem] border border-blue-100 bg-white px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={prev}
              variant="ghost"
              className="h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex-1 md:flex-none"
            >
              Anterior
            </Button>
            <Button
              onClick={next}
              variant="ghost"
              className="h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex-1 md:flex-none"
            >
              Siguiente
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {allSlides.map((slide, slideIndex) => (
              <button
                key={`${slide.id}-${slideIndex}`}
                onClick={() => setIdx(slideIndex)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  slideIndex === idx ? 'w-7 h-2 bg-blue-600' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                )}
                aria-label={`Ir al bloque ${slideIndex + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const InstitutionalCurriculumExplorer = ({
  sections,
  courseName,
  onClose,
  onToggleVisibility,
  onToggleSectionVisibility,
  onUpdateContent,
  onReorderModules,
  onReorderSections,
  updating,
  initialModuleId,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mission' | 'lab' | 'narrative'>('all');
  const [selectedModule, setSelectedModule] = useState<ModuloInst | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [drillViewMode, setDrillViewMode] = useState<'linear' | 'slides'>('slides');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [isEditingGrid, setIsEditingGrid] = useState(false);
  const [localSections, setLocalSections] = useState<Section[]>([]);
  const [localLevels, setLocalLevels] = useState<ParsedLevel[]>([]);
  const [localGridModules, setLocalGridModules] = useState<ModuloInst[]>([]);
  const [showTeacherNotes, setShowTeacherNotes] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    if (selectedModule) {
      window.dispatchEvent(new CustomEvent('nav:force-hide', { detail: true }));
      return () => {
        window.dispatchEvent(new CustomEvent('nav:force-hide', { detail: false }));
      };
    }
  }, [selectedModule]);

  useEffect(() => {
    if (!initialModuleId) return;

    for (const section of sections) {
      const found = section.modules.find((module) => module.id === initialModuleId);
      if (found) {
        setSelectedSectionId(section.id);
        setSelectedModule(found);
        break;
      }
    }
  }, [initialModuleId, sections]);

  const parseNormalizedBlocks = (lvl: any, parentType?: string): NormalizedBlock[] => {
    if (!lvl) return [];

    const getContent = (block: any) => {
      const fields = [
        'content',
        'instruction',
        'question',
        'statement',
        'context',
        'concept',
        'text',
        'texto',
        'titulo',
        'description',
        'pregunta',
        'consigna',
      ];

      for (const field of fields) {
        if (block?.[field]) return block[field];
      }

      return null;
    };

    const allBlocks: NormalizedBlock[] = [];
    const studentBlockData = lvl.student || lvl;
    const studentContent = getContent(studentBlockData) || getContent(studentBlockData?.data);
    const studentOptions =
      studentBlockData?.options || studentBlockData?.items || studentBlockData?.questions || [];
    const interactionType =
      studentBlockData?.config?.interaction_type ||
      studentBlockData?.interaction_type ||
      studentBlockData?.type ||
      parentType;
    const isInteractive =
      studentOptions.length > 0 ||
      (interactionType &&
        !['auto_display', 'open_response', 'content_plus_question'].includes(interactionType));

    if (studentContent || isInteractive) {
      allBlocks.push({
        id: `block-s-${lvl.id || 'gen'}-1`,
        audience: 'student',
        type: interactionType || 'text',
        options: studentOptions,
        raw: lvl,
        content: studentContent || 'Realiza la actividad interactiva:',
      });
    }

    if (lvl.teacher) {
      const teacherContent = getContent(lvl.teacher);
      if (teacherContent) {
        allBlocks.push({
          id: `block-t-${lvl.id || 'gen'}-1`,
          audience: 'teacher',
          content: teacherContent,
          raw: lvl.teacher,
        });
      }
    }

    if (Array.isArray(lvl.blocks)) {
      lvl.blocks.forEach((block: any, index: number) => {
        const content = getContent(block.content || block);
        if (content) {
          allBlocks.push({
            id: block.id || `block-inner-${index}`,
            audience: block.audience || 'student',
            type: block.type || 'text',
            raw: block,
            content,
          });
        }
      });
    }

    if (allBlocks.length === 0) {
      return [
        {
          id: 'fallback',
          audience: 'student',
          content: 'Sin contenido textual programado en esta estación.',
        },
      ];
    }

    return allBlocks;
  };

  const moduleLevels = React.useMemo(() => {
    if (!selectedModule?.contenido) return [];

    try {
      const raw =
        typeof selectedModule.contenido === 'string'
          ? JSON.parse(selectedModule.contenido)
          : selectedModule.contenido;
      const data = raw?.data || raw?.content || raw;

      let coll = data?.moments || data?.blocks || data?.fases || data?.mission?.moments || data?.levels;

      if (!Array.isArray(coll) || coll.length === 0) {
        const isStandalone =
          data?.pregunta ||
          data?.consigna ||
          data?.questions ||
          data?.items ||
          data?.opciones ||
          data?.mapa ||
          data?.type === 'auto_evaluation' ||
          data?.type === 'tarea';

        coll = isStandalone ? [data] : [];
      }

      return coll.map((item: any, index: number): ParsedLevel => ({
        ...item,
        parsedBlocks: parseNormalizedBlocks(item, selectedModule.tipo),
        displayOrder: index + 1,
        _isVisible: item.isVisible !== false,
      }));
    } catch (error) {
      console.error('Error parsing module content:', error);
      return [];
    }
  }, [selectedModule]);

  useEffect(() => {
    if (selectedModule) {
      setLocalLevels(moduleLevels);
      setIsEditingContent(false);
    } else {
      setLocalLevels([]);
    }
  }, [selectedModule, moduleLevels]);

  const handleLevelMove = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= localLevels.length) return;
    const newLevels = [...localLevels];
    const [moved] = newLevels.splice(fromIdx, 1);
    newLevels.splice(toIdx, 0, moved);
    setLocalLevels(newLevels);
  };

  const handleLevelToggleVisibility = (idx: number) => {
    const newLevels = [...localLevels];
    newLevels[idx] = { ...newLevels[idx], _isVisible: !newLevels[idx]._isVisible };
    setLocalLevels(newLevels);
  };

  const handleSaveStructure = async () => {
    if (!selectedModule || !onUpdateContent) return;

    try {
      const raw =
        typeof selectedModule.contenido === 'string'
          ? JSON.parse(selectedModule.contenido)
          : selectedModule.contenido;

      const finalColl = localLevels.map((localLevel) => {
        const { parsedBlocks, displayOrder, _isVisible, ...originalData } = localLevel;
        return {
          ...originalData,
          isVisible: _isVisible,
        };
      });

      const newContent = JSON.parse(JSON.stringify(raw));
      const dataContainer = newContent.data || newContent.content || newContent;
      const keyToUpdate = ['moments', 'blocks', 'fases', 'levels'].find((key) =>
        Array.isArray(dataContainer?.[key])
      );
      const missionMoments = dataContainer?.mission?.moments;

      if (Array.isArray(missionMoments)) {
        dataContainer.mission.moments = finalColl;
      } else if (keyToUpdate) {
        dataContainer[keyToUpdate] = finalColl;
      }

      await onUpdateContent(selectedModule.id, newContent);
      setIsEditingContent(false);
    } catch (error) {
      console.error('Error building save payload:', error);
    }
  };

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  useEffect(() => {
    if (selectedSectionId) {
      const section = sections.find((item) => item.id === selectedSectionId);
      if (section) {
        setLocalGridModules(section.modules);
        setIsEditingGrid(false);
      }
    } else {
      setLocalGridModules([]);
    }
  }, [selectedSectionId, sections]);

  const handleGridModuleMove = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= localGridModules.length) return;
    const newModules = [...localGridModules];
    const [moved] = newModules.splice(fromIdx, 1);
    newModules.splice(toIdx, 0, moved);
    setLocalGridModules(newModules);
  };

  const handleSectionMove = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= localSections.length) return;
    const newSections = [...localSections];
    const [moved] = newSections.splice(fromIdx, 1);
    newSections.splice(toIdx, 0, moved);
    setLocalSections(newSections);
  };

  const handleSaveGridOrder = async () => {
    if (selectedSectionId) {
      if (!onReorderModules) return;
      const orderedIds = localGridModules.map((module) => module.id);
      await onReorderModules(selectedSectionId, orderedIds);
    } else {
      if (!onReorderSections) return;
      const orderedIds = localSections.map((section) => section.id);
      await onReorderSections(orderedIds);
    }

    setIsEditingGrid(false);
  };

  const getFilteredModules = (modules: ModuloInst[]) => {
    return modules.filter((module) => {
      const matchesSearch = module.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === 'all' ||
        (filterType === 'mission' && module.tipo === 'mission') ||
        (filterType === 'lab' && (module.tipo === 'lab' || module.tipo === 'maker_lab')) ||
        (filterType === 'narrative' && (module.tipo === 'narrative' || module.tipo === 'clase'));

      return matchesSearch && matchesType;
    });
  };

  const filteredSections = sections
    .map((section) => ({
      ...section,
      modules: getFilteredModules(section.modules),
    }))
    .filter(
      (section) =>
        section.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.modules.length > 0
    );

  const selectedSection = selectedSectionId
    ? sections.find((section) => section.id === selectedSectionId) ?? null
    : null;
  const headerTitle = selectedModule
    ? selectedModule.titulo
    : selectedSection?.nombre || 'Gestión de Currículo';
  const showGridActions = Boolean((selectedSectionId && !selectedModule) || !selectedSectionId);
  const visibleModules = isEditingGrid ? localGridModules : getFilteredModules(localGridModules);
  const showSectionEmptyState = !selectedSectionId && filteredSections.length === 0;
  const showModuleEmptyState = Boolean(selectedSectionId && visibleModules.length === 0);

  return (
    <div className="tutor-density-90 min-h-[100dvh] w-full flex flex-col overflow-x-hidden overflow-y-auto animate-in fade-in duration-700 bg-slate-50 relative">
      <div className="absolute inset-0 construction-grid opacity-5 pointer-events-none" />

      <div
        className={cn(
          'flex flex-col gap-3 p-3 md:p-4 lg:p-5 bg-white/95 backdrop-blur-3xl border-b border-slate-200 relative z-[200] transition-all duration-700 shrink-0',
          isFocusMode && selectedModule ? 'h-0 p-0 overflow-hidden border-none opacity-0' : 'opacity-100 w-full'
        )}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-1 w-32 bg-blue-600/10 rounded-full" />

        <div className="flex flex-col xl:flex-row items-start xl:items-start justify-between gap-3 relative z-10 w-full">
          <div className="flex items-start gap-3 md:gap-4 w-full min-w-0 xl:max-w-[54%]">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (selectedModule) {
                  setSelectedModule(null);
                } else if (selectedSectionId) {
                  setSelectedSectionId(null);
                } else {
                  onClose();
                }
              }}
              className="w-11 h-11 md:w-12 md:h-12 rounded-2xl border-slate-200 bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-800 transition-all font-black text-xs shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 min-w-0 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedSectionId(null);
                    setSelectedModule(null);
                  }}
                  className={cn(
                    'text-[9px] md:text-[10px] font-black uppercase tracking-[0.26em] transition-colors truncate max-w-full',
                    selectedModule || selectedSectionId
                      ? 'text-blue-500 hover:text-blue-700'
                      : 'text-slate-400'
                  )}
                >
                  {courseName}
                </button>

                {selectedSectionId && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                    <button
                      onClick={() => setSelectedModule(null)}
                      className={cn(
                        'text-[9px] md:text-[10px] font-black uppercase tracking-[0.26em] transition-colors truncate max-w-full',
                        selectedModule ? 'text-blue-500 hover:text-blue-700' : 'text-slate-400'
                      )}
                    >
                      {selectedSection?.nombre || 'Módulo'}
                    </button>
                  </>
                )}

                {selectedModule && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.24em] text-blue-500/40 shrink-0 italic">
                      Punto de Control
                    </span>
                  </>
                )}
              </div>

              <h2 className="flex items-center gap-2 md:gap-2.5 min-w-0 text-lg md:text-2xl lg:text-[2rem] font-black italic uppercase tracking-tight text-slate-950 leading-[0.95]">
                <div className="w-1.5 h-6 md:h-7 bg-blue-600 rounded-full animate-pulse shrink-0" />
                <span className="min-w-0 max-w-full truncate">{headerTitle}</span>
                <span className="text-blue-600/20 text-[9px] font-black tracking-[0.24em] ml-1 hidden 2xl:inline-block shrink-0">
                  TECHNICAL_BLUEPRINT_V4.0
                </span>
              </h2>
            </div>
          </div>

          <div className={cn(
            'w-full xl:max-w-[46%]',
            selectedModule
              ? 'flex flex-col items-stretch gap-2 xl:items-end'
              : 'flex items-center gap-3 flex-wrap xl:flex-nowrap justify-start xl:justify-end'
          )}>
            <div className="relative group/search w-full md:w-auto xl:flex-none">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar componente..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-11 h-10 md:h-11 w-full md:w-52 xl:w-56 bg-slate-50 border border-slate-200 rounded-2xl text-[9px] md:text-[10px] font-black uppercase text-slate-600 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
              />
            </div>

            {selectedModule && (
              <div className="flex w-full items-center gap-2 flex-wrap justify-start xl:justify-end">
                <Button
                  onClick={() => setIsEditingContent(!isEditingContent)}
                  variant="outline"
                  className={cn(
                    'h-10 md:h-11 rounded-2xl font-black text-[8px] md:text-[9px] uppercase tracking-[0.16em] gap-2 transition-all px-3 md:px-4',
                    isEditingContent
                      ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-lg'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  )}
                >
                  {isEditingContent ? <Lock className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                  {isEditingContent ? 'Finalizar Edición' : 'Gestionar Fases'}
                </Button>

                {isEditingContent && (
                  <Button
                    onClick={handleSaveStructure}
                    disabled={updating?.startsWith('content-')}
                    className="h-10 md:h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[8px] md:text-[9px] uppercase tracking-[0.16em] px-3 md:px-5 shadow-xl shadow-blue-500/20 gap-2"
                  >
                    {updating?.startsWith('content-') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sincronizar Estructura
                  </Button>
                )}

                <div className="w-px h-7 bg-slate-100 mx-1 hidden xl:block" />

                <div className="flex w-full xl:w-auto p-1 bg-slate-100 rounded-[1.25rem] border border-slate-200 shadow-inner shrink-0 flex-wrap">
                  <button
                    onClick={() => setShowTeacherNotes(!showTeacherNotes)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 md:px-3.5 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.14em] transition-all',
                      showTeacherNotes ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    <UserCheck className="w-4 h-4" /> Notas Docente
                  </button>
                  <button
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 md:px-3.5 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.14em] transition-all',
                      isFocusMode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    {isFocusMode ? 'Salir Foco' : 'Enfocar'}
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1 self-center hidden lg:block" />
                  <button
                    onClick={() => setDrillViewMode('linear')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 md:px-3.5 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.14em] transition-all',
                      drillViewMode === 'linear' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    <LayoutList className="w-4 h-4" /> Estructura
                  </button>
                  <button
                    onClick={() => setDrillViewMode('slides')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 md:px-3.5 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.14em] transition-all',
                      drillViewMode === 'slides' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    <MonitorPlay className="w-4 h-4" /> Cinematic
                  </button>
                </div>
              </div>
            )}

            {showGridActions && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsEditingGrid(!isEditingGrid)}
                  variant="ghost"
                  className={cn(
                    'h-11 md:h-12 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.18em] gap-2 transition-all px-4 md:px-6 border-2',
                    isEditingGrid
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-white hover:border-blue-500 hover:text-blue-500'
                  )}
                >
                  {isEditingGrid ? <Zap className="w-5 h-5 animate-pulse" /> : <Settings2 className="w-5 h-5" />}
                  {isEditingGrid ? 'Guardar y Finalizar' : 'Gestionar Secuencia'}
                </Button>

                {isEditingGrid && (
                  <Button
                    onClick={handleSaveGridOrder}
                    disabled={updating?.startsWith('reorder-')}
                    className="h-11 md:h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.18em] px-4 md:px-6 shadow-xl shadow-emerald-500/20 gap-2 border-2 border-emerald-500"
                  >
                    {updating?.startsWith('reorder-') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Confirmar Cambios
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {!selectedModule && (
          <div className="flex flex-wrap items-center gap-2 relative z-10 border-t border-slate-50 pt-3 md:pt-4">
            {[
              { id: 'all', label: 'Todos los Componentes', icon: Layers },
              { id: 'mission', label: 'Misiones Activas', icon: Rocket },
              { id: 'lab', label: 'Maker Labs', icon: Wrench },
              { id: 'narrative', label: 'Clases Narrativas', icon: Lightbulb },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setFilterType(category.id as 'all' | 'mission' | 'lab' | 'narrative')}
                className={cn(
                  'flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.18em] border transition-all',
                  filterType === category.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10'
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                )}
              >
                <category.icon className={cn('w-3.5 h-3.5', filterType === category.id ? 'text-blue-400' : 'text-slate-300')} />
                {category.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {selectedModule ? (
            <motion.div
              key="module-inspection"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              className="h-full w-full"
            >
              {drillViewMode === 'slides' ? (
                <div
                  className={cn(
                    'h-full w-full relative transition-all duration-700',
                    isFocusMode && 'fixed inset-0 z-[500] bg-slate-950'
                  )}
                >
                  <div className="h-full w-full overflow-y-auto">
                    {isFocusMode && (
                      <div className="fixed top-4 md:top-8 right-4 md:right-8 z-[100] flex gap-2 flex-wrap justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setShowTeacherNotes(!showTeacherNotes)}
                          className={cn(
                            'rounded-2xl border-2 font-black text-[10px] uppercase transition-all',
                            showTeacherNotes ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                          )}
                        >
                          <UserCheck className="w-4 h-4 mr-2" /> {showTeacherNotes ? 'Ocultar Guía' : 'Ver Guía Docente'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsFocusMode(false)}
                          className="bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-[10px] uppercase shadow-xl"
                        >
                          <Minimize2 className="w-4 h-4 mr-2" /> Salir Enfoque
                        </Button>
                      </div>
                    )}

                    <CarouselView
                      levels={localLevels}
                      isEditing={isEditingContent}
                      showTeacherNotes={showTeacherNotes}
                      isFocusMode={isFocusMode}
                      moduleTitle={selectedModule.titulo}
                      onMove={handleLevelMove}
                      onToggleVisibility={handleLevelToggleVisibility}
                    />
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 py-6 md:py-10 px-4 md:px-6">
                  {localLevels.length > 0 ? (
                    localLevels.map((level, idx) => (
                      <motion.div
                        key={level.id ?? idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                        'bg-white border p-4 md:p-5 lg:p-6 rounded-[1.75rem] md:rounded-[2rem] shadow-sm flex flex-col lg:flex-row items-start gap-4 md:gap-5 hover:shadow-2xl transition-all group relative overflow-hidden',
                          level._isVisible ? 'border-slate-100' : 'border-amber-100 bg-amber-50/20'
                        )}
                      >
                        <div
                          className={cn(
                            'w-11 h-11 md:w-12 md:h-12 rounded-[1rem] md:rounded-[1.25rem] border flex items-center justify-center font-black text-base md:text-lg italic shrink-0 shadow-sm transition-all',
                            level._isVisible ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div className="space-y-6 relative z-10 flex-1">
                          <div className="space-y-2">
                            <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-slate-800 leading-none">
                              {level.title || level.data?.titulo || `Nivel de Entrenamiento ${idx + 1}`}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[9px] font-black uppercase tracking-widest border-none px-4 py-1',
                                level._isVisible ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                              )}
                            >
                              {level.type || level.interaction_type || (level.blocks ? 'Complex Component' : 'Base Unit')}
                            </Badge>
                          </div>
                          <div
                            className={cn(
                              'p-3.5 md:p-4 rounded-[1.25rem] font-medium italic border-l-8 leading-relaxed whitespace-pre-wrap text-sm',
                              level._isVisible ? 'bg-slate-50/50 text-slate-600 border-blue-500' : 'bg-amber-50/50 text-slate-400 border-amber-500 line-through'
                            )}
                          >
                            "
                            {level.parsedBlocks.find((block) => block.audience === 'student')?.content || 'Bloque Interactivo / Multimedia'}
                            "
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-24 md:py-32 bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                      <Wrench className="w-16 h-16 text-slate-200 mx-auto mb-6 animate-pulse" />
                      <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">
                        Unidad sin estructura de niveles
                      </p>
                      <p className="text-slate-300 text-[10px] font-bold mt-2 uppercase tracking-widest">
                        Verifica la integridad del archivo JSON maestro
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={selectedSectionId ? 'module-grid' : 'section-grid'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 md:space-y-10 pb-8 md:pb-14 px-3 md:px-5 lg:px-6 pt-4 md:pt-6"
            >
              {selectedSectionId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
                  {visibleModules.map((mod, index) => (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => !isEditingGrid && setSelectedModule(mod)}
                      className={cn(
                        'bg-white border p-4 md:p-4.5 rounded-[1.4rem] md:rounded-[1.6rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between min-h-[210px] md:min-h-[230px]',
                        isEditingGrid
                          ? 'border-blue-500 border-dashed border-4 bg-blue-50/5 scale-[0.98] cursor-default'
                          : mod.activo
                            ? 'border-slate-100 cursor-pointer'
                            : 'border-slate-100 opacity-60 cursor-pointer grayscale-[0.5]'
                      )}
                    >
                      {!mod.activo && !isEditingGrid && (
                        <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] z-20 flex items-center justify-center">
                          <Badge className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                            Oculto para Alumnos
                          </Badge>
                        </div>
                      )}

                      <div className="absolute top-0 right-0 p-6 md:p-7 opacity-[0.025] group-hover:opacity-[0.06] transition-opacity pointer-events-none italic font-black text-7xl md:text-[5.5rem] text-slate-900">
                        {index + 1}
                      </div>

                      {isEditingGrid && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[50] flex items-center justify-between px-3 opacity-100 animate-in fade-in slide-in-from-top-4 duration-300">
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleGridModuleMove(index, index - 1);
                            }}
                            disabled={index === 0}
                            variant="outline"
                            size="icon"
                            className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-slate-900 text-white border-[3px] border-blue-500 hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 shadow-xl"
                          >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                          </Button>
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleGridModuleMove(index, index + 1);
                            }}
                            disabled={index === localGridModules.length - 1}
                            variant="outline"
                            size="icon"
                            className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-slate-900 text-white border-[3px] border-blue-500 hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 shadow-xl"
                          >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                          </Button>
                        </div>
                      )}

                      {isEditingGrid && (
                        <div className="absolute top-4 right-4 z-50">
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleVisibility?.(mod.id, mod.activo);
                            }}
                            variant="outline"
                            className={cn(
                              'w-10 h-10 rounded-xl bg-white shadow-lg border-2 transition-all hover:scale-110',
                              mod.activo ? 'text-emerald-500 border-emerald-100' : 'text-amber-500 border-amber-100'
                            )}
                          >
                            {updating === `module-${mod.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : mod.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}

                      <div className="space-y-4 relative z-10">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all duration-500 shadow-sm',
                            mod.activo ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'
                          )}
                        >
                          {mod.tipo === 'mission' ? <Rocket className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                        </div>
                        <div className="space-y-2">
                          <Badge
                            variant="outline"
                            className="text-[7px] md:text-[8px] font-black tracking-[0.16em] border-slate-200 text-slate-400 bg-slate-50 px-2 py-0.5 uppercase"
                          >
                            {mod.tipo ? mod.tipo.replace('_', ' ') : 'Misión'}
                          </Badge>
                          <h4 className="text-base md:text-[1.1rem] font-black uppercase italic tracking-tight text-slate-800 leading-[0.98] group-hover:text-blue-600 transition-colors">
                            {mod.titulo}
                          </h4>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <Button
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleVisibility?.(mod.id, mod.activo);
                          }}
                          className={cn(
                            'h-auto py-1.5 px-2.5 rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-[0.16em] flex items-center gap-1.5 border transition-all hover:scale-105 active:scale-95',
                            mod.activo
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                          )}
                        >
                          <div className={cn('w-1.5 h-1.5 rounded-full', mod.activo ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400')} />
                          {mod.activo ? 'Operativo' : 'En Pausa'}
                        </Button>
                        <Button
                          variant="ghost"
                          className="bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl font-black uppercase text-[8px] tracking-[0.16em] flex items-center justify-center gap-1.5 px-3 md:px-4 transition-all"
                        >
                          Ver Fases <ArrowRight className="w-3 h-3 group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {(isEditingGrid ? localSections : filteredSections).map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => !isEditingGrid && setSelectedSectionId(section.id)}
                      className={cn(
                        'group bg-white border p-4 md:p-5 rounded-[1.5rem] md:rounded-[1.8rem] shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px] md:min-h-[245px]',
                        isEditingGrid
                          ? 'border-blue-500 border-dashed border-4 bg-blue-50/5 scale-[0.98] cursor-default'
                          : section.activo
                            ? 'border-slate-100 cursor-pointer'
                            : 'border-slate-100 opacity-60 cursor-pointer grayscale-[0.5]'
                      )}
                    >
                      {!section.activo && !isEditingGrid && (
                        <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] z-20 flex items-center justify-center">
                          <Badge className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                            Bloque Oculto
                          </Badge>
                        </div>
                      )}

                      <div className="absolute top-0 right-0 p-7 md:p-8 opacity-[0.025] group-hover:opacity-[0.08] transition-opacity pointer-events-none italic font-black text-[6rem] md:text-[9rem] text-slate-900 leading-none">
                        {index + 1}
                      </div>

                      {isEditingGrid && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[50] flex items-center justify-between px-4 opacity-100 animate-in fade-in slide-in-from-top-4 duration-300">
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSectionMove(index, index - 1);
                            }}
                            disabled={index === 0}
                            variant="outline"
                            size="icon"
                            className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-slate-900 text-white border-[3px] border-blue-500 hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 shadow-xl"
                          >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                          </Button>
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSectionMove(index, index + 1);
                            }}
                            disabled={index === localSections.length - 1}
                            variant="outline"
                            size="icon"
                            className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-slate-900 text-white border-[3px] border-blue-500 hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 shadow-xl"
                          >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                          </Button>
                        </div>
                      )}

                      {isEditingGrid && (
                        <div className="absolute top-5 right-5 z-50">
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleSectionVisibility?.(section.id, section.activo);
                            }}
                            variant="outline"
                            className={cn(
                              'w-11 h-11 rounded-xl bg-white shadow-lg border-2 transition-all hover:scale-110',
                              section.activo ? 'text-emerald-500 border-emerald-100' : 'text-amber-500 border-amber-100'
                            )}
                          >
                            {updating === `section-${section.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : section.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}

                      <div className="space-y-5 relative z-10">
                        <div
                          className={cn(
                            'w-12 h-12 md:w-13 md:h-13 rounded-[1rem] md:rounded-[1.2rem] flex items-center justify-center shadow-xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500',
                            section.activo ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'
                          )}
                        >
                          <div className="absolute inset-0 construction-grid opacity-20" />
                          <Layers className="w-8 h-8 relative z-10" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-black uppercase tracking-[0.28em] text-blue-500">
                              Módulo Operativo {index + 1}
                            </span>
                            {!section.activo && (
                              <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[8px] uppercase tracking-widest">
                                Oculto
                              </Badge>
                            )}
                          </div>
                          <h4
                            className={cn(
                              'text-lg md:text-[1.45rem] font-black uppercase italic tracking-tight leading-[0.98] group-hover:text-blue-600 transition-colors',
                              section.activo ? 'text-slate-800' : 'text-slate-400'
                            )}
                          >
                            {section.nombre}
                          </h4>
                          <p className="mt-1 text-slate-400 text-[11px] font-bold uppercase tracking-[0.16em]">
                            {section.modules.length} {section.modules.length === 1 ? 'Misión Técnica' : 'Misiones Técnicas'}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-5 gap-3">
                        <Button
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleSectionVisibility?.(section.id, section.activo);
                          }}
                          className={cn(
                            'h-auto py-1.5 px-3 rounded-xl text-[8px] font-black uppercase tracking-[0.16em] flex items-center gap-1.5 border transition-all hover:scale-105 active:scale-95',
                            section.activo
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                          )}
                        >
                          <div className={cn('w-1.5 h-1.5 rounded-full', section.activo ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400')} />
                          {section.activo ? 'Operativo' : 'En Pausa'}
                        </Button>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {showSectionEmptyState && (
                <div className="py-32 md:py-48 text-center rounded-[5rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center gap-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                    <Target className="w-12 h-12 text-slate-200 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-black uppercase tracking-[0.4em]">Filtro sin coincidencias</p>
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">
                      Ajusta los parámetros de búsqueda del sector
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                    }}
                    variant="link"
                    className="text-blue-500 font-black text-[10px] uppercase tracking-widest"
                  >
                    Restablecer Protocolos
                  </Button>
                </div>
              )}

              {showModuleEmptyState && (
                <div className="py-28 md:py-40 text-center rounded-[5rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center gap-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-slate-200 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-black uppercase tracking-[0.4em]">Sin módulos visibles</p>
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">
                      Prueba otro filtro o revisa la sección seleccionada
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                    }}
                    variant="link"
                    className="text-blue-500 font-black text-[10px] uppercase tracking-widest"
                  >
                    Restablecer Protocolos
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          .tutor-density-90 {
            --tutor-zoom: 1;
          }
          @media (min-width: 1280px) {
            .tutor-density-90 {
              zoom: 0.9;
            }
          }
          .construction-grid {
            background-image:
              linear-gradient(rgba(37, 99, 235, 0.15) 1.5px, transparent 1.5px),
              linear-gradient(90deg, rgba(37, 99, 235, 0.15) 1.5px, transparent 1.5px),
              linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px);
            background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
          }
          .construction-grid-interactive {
            background-image: radial-gradient(circle at 2px 2px, rgba(37, 99, 235, 0.12) 1.2px, transparent 0);
            background-size: 32px 32px;
          }
          .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default InstitutionalCurriculumExplorer;

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

  const [idx, setIdx] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (idx >= allSlides.length) setIdx(Math.max(0, allSlides.length - 1));
    setActiveHotspot(null); // Reset hotspot on slide change
    setIsRevealed(false); // Reset interaction
  }, [allSlides.length, idx]);

  const currentSlide = allSlides[idx];
  const next = () => setIdx((prev) => (prev + 1) % allSlides.length);
  const prev = () => setIdx((prev) => (prev - 1 + allSlides.length) % allSlides.length);

  if (levels.length === 0 || !currentSlide) {
    return (
      <div className="flex h-full w-full items-center justify-center p-16">
        <div className="flex flex-col items-center gap-4 text-slate-300">
          <Loader2 className="h-10 w-10 animate-spin opacity-50" />
          <span className="font-black uppercase tracking-widest text-[10px]">Construyendo Escenario...</span>
        </div>
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
  
  const textBlocks = {
    contexto: getBlockText(rawBlock.context) || getBlockText(rawBlock.content?.context) || getBlockText(currentMoment?.student?.context),
    instrucción: getBlockText(rawBlock.instruction) || getBlockText(rawBlock.content?.instruction) || getBlockText(currentMoment?.student?.instruction),
    pregunta: getBlockText(rawBlock.question) || getBlockText(rawBlock.content?.question) || getBlockText(currentMoment?.student?.question),
    concepto: getBlockText(rawBlock.concept) || getBlockText(rawBlock.content?.concept) || getBlockText(currentMoment?.student?.concept)
  };

  const teacherObservation = getBlockText(currentMoment?.teacher?.observation) || getBlockText(currentMoment?.teacher?.intention);
  const teacherPedagogy = Array.isArray(currentMoment?.teacher?.pedagogy) ? currentMoment.teacher.pedagogy.filter(Boolean) : [];
  
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



  const hotspotIcons = {
    contexto: <Layers className="w-4 h-4" />,
    instrucción: <Target className="w-4 h-4" />,
    pregunta: <ArrowRight className="w-4 h-4" />,
    concepto: <Lightbulb className="w-4 h-4" />
  };

  const hotspotColors = {
    contexto: 'bg-blue-500 shadow-blue-500/50',
    instrucción: 'bg-indigo-500 shadow-indigo-500/50',
    pregunta: 'bg-amber-500 shadow-amber-500/50',
    concepto: 'bg-emerald-500 shadow-emerald-500/50'
  };

  return (
    <div className={cn("relative flex h-full flex-1 w-full flex-col overflow-hidden m-0 rounded-none border-none transition-colors duration-1000",
      isTeacher ? 'bg-amber-950/40' : (isFocusMode ? 'bg-slate-950' : 'bg-[#e2e8f0]/40') // Dynamic aesthetic base
    )}>
      {/* Immersive Backgrounds */}
      <div className={cn("absolute inset-0 z-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_10%,transparent_100%)] pointer-events-none transition-colors duration-1000",
        isTeacher ? "bg-[linear-gradient(rgba(245,158,11,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.08)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]")} />
      <div className={cn("absolute top-[-20%] left-[-10%] h-[60%] w-[50%] rounded-full mix-blend-screen blur-[120px] pointer-events-none animate-pulse duration-[8s] transition-colors",
        isTeacher ? "bg-amber-500/20" : "bg-blue-400/20")} />
      <div className={cn("absolute bottom-[-10%] right-[-10%] h-[50%] w-[40%] rounded-full mix-blend-screen blur-[120px] pointer-events-none animate-pulse duration-[10s] transition-colors",
        isTeacher ? "bg-rose-500/10" : "bg-purple-400/20")} />

      {/* Editor Controls HUD (Floating Top Right) */}
      {isEditing && (
        <div className="absolute right-6 top-6 z-[100] flex gap-2 rounded-[1.2rem] border border-white/20 bg-white/10 p-1.5 backdrop-blur-xl shadow-2xl">
          <Button onClick={() => onMove(currentSlide.momentIdx, currentSlide.momentIdx - 1)} disabled={currentSlide.momentIdx === 0} variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-700 hover:bg-white/80 hover:text-blue-600 dark:text-slate-200 disabled:opacity-20"><ArrowUp className="w-4 h-4" /></Button>
          <Button onClick={() => onMove(currentSlide.momentIdx, currentSlide.momentIdx + 1)} disabled={currentSlide.momentIdx === levels.length - 1} variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-700 hover:bg-white/80 hover:text-blue-600 dark:text-slate-200 disabled:opacity-20"><ArrowDown className="w-4 h-4" /></Button>
          <Button onClick={() => onToggleVisibility(currentSlide.momentIdx)} variant="ghost" size="icon" className={cn("h-9 w-9 rounded-xl transition-all", currentSlide.momentIsVisible ? 'text-emerald-500 hover:bg-emerald-50 dark:text-emerald-400' : 'text-amber-500 hover:bg-amber-50 dark:text-amber-400')}>{currentSlide.momentIsVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</Button>
        </div>
      )}

      {/* Edge Hover Navigation (Left Menu) */}
      <div className="absolute left-0 top-16 bottom-16 w-6 md:w-8 hover:w-64 md:hover:w-80 z-[150] transition-all duration-500 group flex items-center">
        {/* Invisible trigger area */}
        <div className="absolute inset-0 bg-transparent cursor-e-resize" />
        
        <div className="absolute left-0 h-full w-full max-w-0 group-hover:max-w-[16rem] md:group-hover:max-w-[20rem] overflow-hidden transition-all duration-500 bg-white/95 backdrop-blur-3xl rounded-r-[2.5rem] border-y border-r border-slate-200/60 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.15)] flex flex-col">
          <div className="p-5 bg-blue-50 border-b border-blue-100 flex items-center gap-3 w-64 md:w-80 shrink-0">
            <Layers className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <h3 className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em] text-blue-700">Explorador</h3>
              <p className="text-[9px] font-bold text-slate-500">Separado por Fases</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4 w-64 md:w-80 pb-10">
            {levels.map((level, levelIndex) => {
              const slidesInLevel = allSlides.filter(s => s.momentIdx === levelIndex);
              if (slidesInLevel.length === 0) return null;
              const hasCurrentSlide = slidesInLevel.some((_, i) => allSlides.indexOf(slidesInLevel[i]) === idx);
              
              return (
                 <div key={level.id || levelIndex} className={cn("p-3 rounded-[1.5rem] bg-slate-50 border transition-all duration-500", hasCurrentSlide ? "border-blue-300 shadow-md bg-white" : "border-slate-200")}>
                   <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-3 px-1 flex items-center gap-2">
                     <span className={cn("w-5 h-5 flex items-center justify-center rounded-full text-white font-black text-[8px]", hasCurrentSlide ? "bg-blue-600" : "bg-slate-300")}>{levelIndex + 1}</span>
                     <span className="truncate text-slate-800">{level.title || level.data?.titulo || `Fase ${levelIndex + 1}`}</span>
                   </h4>
                   <div className="space-y-1.5 pl-2.5 border-l-2 border-slate-200 ml-2.5">
                     {slidesInLevel.map((slide, i) => {
                       const slideIndex = allSlides.indexOf(slide);
                       const isCurrent = slideIndex === idx;
                       const isTargetTeacher = slide.audience === 'teacher';
                       return (
                        <button
                          key={`${slide.id}-${slideIndex}`}
                          onClick={() => setIdx(slideIndex)}
                          className={cn(
                            "w-full text-left flex flex-col gap-1 p-2 rounded-xl transition-all duration-300 relative",
                            isCurrent ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-200/50 text-slate-600"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={cn("text-[8px] font-black uppercase tracking-widest", isCurrent ? 'text-white/80' : 'text-slate-400')}>
                              Bloque {i + 1}
                            </span>
                            <span className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg tracking-tight",
                              isCurrent && isTargetTeacher ? "bg-amber-500 text-white" : "",
                              isCurrent && !isTargetTeacher ? "bg-emerald-500 text-white" : "",
                              !isCurrent && isTargetTeacher ? "bg-amber-100 text-amber-600" : "",
                              !isCurrent && !isTargetTeacher ? "bg-emerald-100 text-emerald-600" : ""
                            )}>
                              {isTargetTeacher ? 'DOC.' : 'EST.'}
                            </span>
                          </div>
                          <p className={cn("text-[10px] md:text-[11px] font-bold truncate pr-1 leading-tight mt-0.5", isCurrent ? "text-white" : "text-slate-700")}>
                            {slide.momentTitle}
                          </p>
                        </button>
                       );
                     })}
                   </div>
                 </div>
              );
            })}
          </div>
        </div>
        
        {/* Edge glowing indicator */}
        <div className="h-48 w-2 md:w-3 bg-gradient-to-b from-blue-400/0 via-blue-500/80 to-blue-400/0 group-hover:via-blue-500 rounded-r-xl transition-colors absolute left-0 flex items-center justify-center opacity-80 group-hover:opacity-100 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <ChevronRight className="w-6 h-6 text-white drop-shadow-md opacity-50 group-hover:opacity-100 transition-all duration-500 absolute -right-4 pointer-events-none group-hover:translate-x-2" />
        </div>
      </div>

      {/* Scrollable Wrap for Main Canvas and Navigator */}
      <div className="relative z-10 w-full flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col items-center">
        {/* Main Canvas Area */}
        <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-12 w-full pt-12 md:pt-16 min-h-max pl-4 md:pl-12">
          <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95, y: 30, rotateX: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -30, rotateX: 5 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="relative flex w-full max-w-[120rem] flex-col items-center text-center perspective-[1000px] gap-8 px-4 md:px-8 lg:px-16"
          >
            {/* Context Badge */}
            <h2 className="mb-2 w-max max-w-full truncate rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1.5 md:px-6 md:py-2 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 shadow-sm backdrop-blur-md">
              <span className="hidden md:inline">Fase {currentMomentIndex + 1}</span>
              <span className="hidden md:inline mx-3 opacity-30">|</span>
              <span className="truncate max-w-[200px] md:max-w-xs">{currentMomentLabel}</span>
              <span className="mx-3 opacity-30">|</span>
              <span className={cn("px-3 py-1 rounded-[0.8rem] text-[8px] md:text-[9px] font-black tracking-widest ml-1 text-white shadow-lg transition-all", isTeacher ? "bg-amber-500 shadow-amber-500/40" : "bg-emerald-500 shadow-emerald-500/40")}>
                {isTeacher ? "Vista Docente" : "Vista Estudiante"}
              </span>
            </h2>

            {/* Central Content Canvas */}
            <div className="relative w-full">
              {/* Glass Modal for Content */}
              <div className={cn("relative z-20 w-full rounded-[2.5rem] border border-white/40 bg-white/60 p-6 md:p-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-all flex flex-col h-auto", isFocusMode && 'bg-white/10 border-white/10 text-white')}>
                <div className="md:pr-6 flex-1 w-full text-left md:text-center pb-8 min-h-[35vh] flex flex-col justify-center">
                  
                  {isInteractive && !isRevealed ? (
                    <motion.div 
                      className="flex flex-col items-center justify-center cursor-pointer group py-10"
                      onClick={() => setIsRevealed(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={cn(
                        "w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-colors duration-500 mb-6 relative group-hover:rotate-6",
                        isTeacher ? "bg-amber-500 shadow-amber-500/40" : "bg-emerald-500 shadow-emerald-500/40"
                      )}>
                        <div className="absolute inset-0 rounded-[2.5rem] animate-ping opacity-30 bg-inherit" />
                        {isTeacher ? <Code2 className="w-14 h-14 md:w-16 md:h-16 text-white" /> : <Lightbulb className="w-14 h-14 md:w-16 md:h-16 text-white" />}
                      </div>
                      <h3 className={cn("text-sm md:text-base font-black uppercase tracking-[0.3em] transition-colors", isTeacher ? "text-amber-600" : "text-emerald-600")}>
                        {isTeacher ? "Instrucción Práctica" : "Misión Interactiva"}
                      </h3>
                      <p className="mt-2 text-[10px] font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest transition-colors animate-pulse">
                        ( Haz clic para descubrir el objetivo )
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center">
                      <p className={cn("text-2xl md:text-4xl lg:text-[2.75rem] font-black leading-[1.2] tracking-tight whitespace-pre-wrap break-words h-max pb-4 px-2", isTeacher ? 'text-amber-900 dark:text-amber-100' : (isFocusMode ? 'text-white' : 'text-slate-900'))}>
                        {currentSlide.content}
                      </p>
                    </motion.div>
                  )}

                  {isInteractive && (
                    <div className="mt-8 md:mt-12 w-full pt-4 border-t border-slate-200/50 shrink-0">
                      {options.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                          {options.map((opt: any, i: number) => {
                            const isCorrect = opt?.isCorrect || currentSlide.raw?.content?.answer === opt?.text || opt?.correctIndex !== undefined;
                            return (
                              <motion.div whileHover={{ scale: 1.02 }} key={`opt-${i}`} className={cn("relative overflow-hidden flex items-start gap-4 rounded-[1.5rem] border border-white/60 p-5 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:shadow-xl", isFocusMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white')}>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-sm font-black text-blue-600 shadow-inner">
                                  {String.fromCharCode(65 + i)}
                                </div>
                                <div className="space-y-1 pt-1 flex-1">
                                  <p className={cn("text-sm font-bold leading-snug", isFocusMode ? 'text-slate-200' : 'text-slate-800')}>{getOptionText(opt)}</p>
                                  {opt.feedback && <p className="text-[11px] font-medium text-slate-500/80 italic line-clamp-2">{opt.feedback}</p>}
                                </div>
                                {isCorrect && showTeacherNotes && (
                                  <div className="absolute right-4 top-4 rounded-full bg-emerald-500/20 px-3 py-1 text-[8px] font-black tracking-widest text-emerald-600 ring-1 ring-emerald-500/30 font-mono">OK</div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex h-[450px] w-full flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-blue-500/30 bg-white/40 backdrop-blur-md overflow-hidden relative shadow-inner">
                           {currentSlide?.raw?.content?.url || currentSlide?.raw?.url ? (
                             <iframe src={currentSlide?.raw?.content?.url || currentSlide?.raw?.url} className="w-full h-full border-0 absolute inset-0 z-10 bg-white" title="Interactividad" />
                           ) : (
                             <>
                              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none" />
                              <Code2 className="mb-4 h-14 w-14 text-blue-500 opacity-80 animate-bounce relative z-10" />
                              <span className="text-sm font-black uppercase tracking-[0.3em] text-blue-600/80 relative z-10">
                                Renderizador Interactivo
                              </span>
                              <p className="text-[11px] mt-3 text-slate-500 font-bold tracking-widest max-w-sm text-center px-4 relative z-10">
                                Componente del alumno tipo: <span className="text-blue-500">[{currentSlide.type}]</span>. El simulador, iFrame o lógica visual se inyectará en esta caja en la aplicación de consumo real.
                              </p>
                             </>
                           )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Hotspots for extra context (Genially style) */}
              <div className="pointer-events-none absolute inset-x-0 -bottom-8 -top-8 z-30 flex items-center justify-around xl:-left-12 xl:-right-12">
                {Object.entries(textBlocks).map(([key, text], idx) => {
                  if (!text) return null;
                  const isActive = activeHotspot === key;
                  return (
                    <div key={key} className="pointer-events-auto relative group">
                      <motion.button
                        onHoverStart={() => setActiveHotspot(key)}
                        onClick={() => setActiveHotspot(isActive ? null : key)}
                        whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                        className={cn(
                          "relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 z-40 outline-none ring-4 ring-white/30 backdrop-blur-md",
                          hotspotColors[key as keyof typeof hotspotColors],
                          isActive && "ring-8 ring-white/50"
                        )}
                      >
                        <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {hotspotIcons[key as keyof typeof hotspotIcons]}
                        <span className="absolute -bottom-6 w-max opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black uppercase tracking-widest text-slate-500 drop-shadow-md">
                          {key}
                        </span>
                      </motion.button>

                      {/* Glass Popover for Hotspot Content */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute bottom-[calc(100%+1.5rem)] left-1/2 -translate-x-1/2 w-64 md:w-80 z-50 rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-2xl text-left"
                          >
                            <div className="absolute -bottom-2 left-1/2 -ml-2 border-x-8 border-t-8 border-x-transparent border-t-white/80" />
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{key}</p>
                            <p className="text-sm font-medium leading-relaxed text-slate-800 whitespace-pre-wrap">{text}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        </div> {/* End Main Canvas Center */}

        {/* Floating Bottom Navigator (Pushed below if content is tall) */}
        <div className="relative z-50 mb-12 mt-4 flex w-full justify-center px-4 shrink-0 pointer-events-auto">
        <div className="flex h-16 w-full max-w-lg items-center justify-between rounded-[2rem] border border-white/30 bg-white/40 p-2 shadow-2xl backdrop-blur-xl">
          <Button onClick={prev} variant="ghost" className="h-full rounded-[1.5rem] px-4 font-black uppercase text-[9px] tracking-widest text-slate-600 hover:bg-white hover:text-blue-600 transition-all">
            <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
          </Button>
          
          <div className="flex items-center gap-1.5 px-4 overflow-hidden mask-edges">
            {allSlides.map((slide, slideIndex) => (
              <button
                key={`${slide.id}-${slideIndex}`}
                onClick={() => setIdx(slideIndex)}
                className={cn(
                  'h-2 rounded-full transition-all duration-500 flex-shrink-0',
                  slideIndex === idx ? 'w-8 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'w-2 bg-slate-400/30 hover:bg-slate-500/50 hover:w-4'
                )}
              />
            ))}
          </div>

          <Button onClick={next} variant="ghost" className="h-full rounded-[1.5rem] px-4 font-black uppercase text-[9px] tracking-widest text-slate-600 hover:bg-white hover:text-blue-600 transition-all">
            Siguiente <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      </div> {/* CLOSING SCROLLABLE WRAPPER */}

      {/* Side Slide-out Drawer for Teacher Notes */}
      {showTeacherNotes && (teacherObservation || teacherPedagogy.length > 0) && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute bottom-6 right-6 top-6 z-[200] flex w-80 flex-col overflow-hidden rounded-[2.5rem] border border-amber-200/50 bg-amber-50/90 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex bg-amber-100/50 p-6 pb-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[1rem] bg-amber-500 text-white shadow-xl shadow-amber-500/20">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="ml-4 flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Privado</span>
              <h3 className="text-sm font-black italic tracking-tight text-amber-900">Guía Docente</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
            {teacherObservation && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-400/80 mb-2">Observaciones</p>
                <div className="rounded-[1.5rem] border border-amber-200/40 bg-white/50 p-4 font-medium leading-relaxed text-amber-900 shadow-sm text-sm">
                  {teacherObservation}
                </div>
              </div>
            )}
            {teacherPedagogy.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-400/80 mb-2">Metodología</p>
                <div className="flex flex-wrap gap-2">
                  {teacherPedagogy.map((item: string) => (
                    <span key={item} className="rounded-full border border-amber-300/40 bg-amber-100/50 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase text-amber-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
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

    const blockAudience = studentBlockData?.audience || lvl.audience || (interactionType?.includes('teacher') ? 'teacher' : 'student');

    if (studentContent || isInteractive) {
      allBlocks.push({
        id: `block-${blockAudience === 'teacher' ? 't' : 's'}-${lvl.id || 'gen'}-1`,
        audience: blockAudience,
        type: interactionType || 'text',
        options: studentOptions,
        raw: lvl,
        content: studentContent || 'Realiza la actividad interactiva:',
      });
    }

    if (lvl.teacher) {
      const teacherContent = getContent(lvl.teacher) || lvl.teacher?.intention || lvl.teacher?.observation;
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
            {!selectedModule && (
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
            )}

            {selectedModule && (
              <div className="flex w-full items-center gap-2 flex-wrap justify-start xl:justify-end">
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
                  <div className="h-full w-full">
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
                <div className="flex flex-wrap justify-center gap-6 md:gap-10 pt-8 pb-12 w-full relative before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] before:pointer-events-none">
                  {visibleModules.map((mod, index) => (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, scale: 0.8, y: index % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: index * 0.05 }}
                      onClick={() => !isEditingGrid && setSelectedModule(mod)}
                      className={cn(
                        'w-full sm:w-[280px] md:w-[320px] bg-white/80 backdrop-blur-xl border border-white/50 p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.15)] transition-all group relative overflow-visible flex flex-col justify-between min-h-[250px]',
                        index % 2 === 0 ? 'lg:translate-y-6' : 'lg:-translate-y-6',
                        isEditingGrid
                          ? 'border-blue-500 border-dashed border-4 scale-[0.98] cursor-default'
                          : mod.activo
                            ? 'cursor-pointer hover:-translate-y-2'
                            : 'opacity-60 cursor-pointer grayscale-[0.5]'
                      )}
                    >
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex xl:hidden items-center justify-center font-black text-sm shadow-xl z-30 border border-blue-100 group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
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
                <div className="flex flex-wrap justify-center gap-8 md:gap-14 pt-8 pb-12 w-full mt-4 relative before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] before:pointer-events-none">
                  {(isEditingGrid ? localSections : filteredSections).map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, scale: 0.8, rotate: index % 2 === 0 ? -2 : 2 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 180, damping: 20, delay: index * 0.1 }}
                      onClick={() => !isEditingGrid && setSelectedSectionId(section.id)}
                      className={cn(
                        'w-full sm:w-[320px] md:w-[360px] bg-white/70 backdrop-blur-2xl border border-white/60 p-6 md:p-10 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_-20px_rgba(59,130,246,0.2)] transition-all duration-500 group relative flex flex-col justify-between min-h-[280px]',
                        index % 2 === 0 ? 'lg:translate-y-10 lg:hover:rotate-1' : 'lg:-translate-y-6 lg:hover:-rotate-1',
                        isEditingGrid
                          ? 'border-blue-500 border-dashed border-4 scale-[0.98] cursor-default'
                          : section.activo
                            ? 'cursor-pointer hover:-translate-y-3'
                            : 'opacity-60 cursor-pointer grayscale-[0.5]'
                      )}
                    >
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex lg:hidden items-center justify-center font-black text-sm shadow-xl z-30 group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
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

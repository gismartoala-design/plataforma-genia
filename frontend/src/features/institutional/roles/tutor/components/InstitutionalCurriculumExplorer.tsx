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
  Trophy,
  Timer as ClockIcon,
  Video,
  FileText,
  HelpCircle,
  ImageIcon,
  Link2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Car,
  Users,
  TrafficCone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModuloInst } from '../../../services/curriculum.api';
import { KidsActivityViewer } from '@/features/kids/components/KidsActivityViewer';
// CarouselView is defined locally in this file

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

// ─────────────────────────────────────────────────────────────────────────────
// MASCOT SYSTEM — Duolingo-style animated character
// 12 variants mapped to emotional states for each slide context
// ─────────────────────────────────────────────────────────────────────────────
type MascotState = 'idle' | 'excited' | 'thinking' | 'celebrating' | 'surprised' | 'teaching' | 'waving' | 'curious' | 'happy' | 'cool' | 'shy' | 'strong';

const MASCOT_VARIANTS: Record<MascotState, { src: string; label: string }> = {
  idle:        { src: '/assets/personaje_tutor/prsonaje-07.png',  label: 'idle' },
  excited:     { src: '/assets/personaje_tutor/prsonaje-02.png',  label: 'excited' },
  thinking:    { src: '/assets/personaje_tutor/prsonaje-13.png',  label: 'thinking' },
  celebrating: { src: '/assets/personaje_tutor/prsonaje-05.png',  label: 'celebrating' },
  surprised:   { src: '/assets/personaje_tutor/prsonaje-03.png',  label: 'surprised' },
  teaching:    { src: '/assets/personaje_tutor/prsonaje-07.png',  label: 'teaching' },
  waving:      { src: '/assets/personaje_tutor/prsonaje-05.png',  label: 'waving' },
  curious:     { src: '/assets/personaje_tutor/prsonaje-10.png',  label: 'curious' },
  happy:       { src: '/assets/personaje_tutor/prsonaje-09.png',  label: 'happy' },
  cool:        { src: '/assets/personaje_tutor/prsonaje-11.png',  label: 'cool' },
  shy:         { src: '/assets/personaje_tutor/prsonaje-12.png',  label: 'shy' },
  strong:      { src: '/assets/personaje_tutor/prsonaje-04.png',  label: 'strong' },
};

// Map slide index to a mascot state for variety across the lesson
const SLIDE_STATE_MAP: MascotState[] = [
  'waving', 'excited', 'teaching', 'curious', 'happy', 'thinking',
  'strong', 'celebrating', 'cool', 'surprised', 'shy', 'idle',
];

const floatVariants: Variants = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
  },
};

const bounceInVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.4, y: 60, rotate: -8 },
  visible: {
    opacity: 1, scale: 1, y: 0, rotate: 0,
    transition: { type: 'spring', stiffness: 420, damping: 18, mass: 0.8 },
  },
  exit:    { opacity: 0, scale: 0.5, y: 40, transition: { duration: 0.18 } },
};

const celebrateVariants: Variants = {
  animate: {
    rotate: [0, -12, 12, -8, 8, 0],
    scale:  [1, 1.15, 1.1, 1.12, 1.08, 1],
    transition: { duration: 0.7, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.5 },
  },
};

interface MascotCharacterProps {
  state?: MascotState;
  slideIndex?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isCelebrating?: boolean;
}

const MascotCharacter: React.FC<MascotCharacterProps> = ({
  state,
  slideIndex = 0,
  size = 'lg',
  className,
  isCelebrating = false,
}) => {
  const resolvedState = state ?? SLIDE_STATE_MAP[slideIndex % SLIDE_STATE_MAP.length];
  const variant = MASCOT_VARIANTS[resolvedState];
  const [prevIdx, setPrevIdx] = React.useState(slideIndex);
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    if (slideIndex !== prevIdx) {
      setPrevIdx(slideIndex);
      setKey(k => k + 1);
    }
  }, [slideIndex]);

  const sizeMap = { sm: 80, md: 120, lg: 160, xl: 200 };
  const px = sizeMap[size];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        variants={bounceInVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn('relative flex items-end justify-center', className)}
        style={{ width: px, height: px }}
      >
        {/* Idle float + celebrate override */}
        <motion.div
          variants={isCelebrating ? celebrateVariants : floatVariants}
          animate="animate"
          className="w-full h-full"
        >
          <img
            src={variant.src}
            alt={`Mascota ${variant.label}`}
            className="w-full h-full object-contain drop-shadow-[0_10px_24px_rgba(59,103,218,0.28)]"
            draggable={false}
          />
        </motion.div>

        {/* Ground shadow */}
        <motion.div
          animate={{ scaleX: [1, 0.85, 1], opacity: [0.18, 0.1, 0.18] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-full bg-blue-900/20 blur-md pointer-events-none"
        />
      </motion.div>
    </AnimatePresence>
  );
};



const TypewriterText = ({ text, onComplete, delay = 0.03, className }: { text: string; onComplete?: () => void; delay?: number; className?: string }) => {
  const words = text.split(' ');
  
  return (
    <motion.div className={cn("flex flex-wrap justify-center gap-x-[0.2em] gap-y-1", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.25,
            delay: i * delay,
            ease: [0.23, 1, 0.32, 1]
          }}
          onAnimationComplete={() => {
            if (i === words.length - 1 && onComplete) onComplete();
          }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

const CarouselView = ({
  levels,
  isEditing,
  showTeacherNotes,
  isFocusMode,
  moduleTitle,
  onMove,
  onToggleVisibility,
  points,
  setPoints,
  allSlides,
  initialSlideIndex,
  onBack,
}: {
  levels: ParsedLevel[];
  isEditing: boolean;
  showTeacherNotes: boolean;
  isFocusMode: boolean;
  moduleTitle: string;
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  onMove: (from: number, to: number) => void;
  onToggleVisibility: (idx: number) => void;
  allSlides: any[];
  initialSlideIndex: number;
  onBack: () => void;
}) => {
  const [idx, setIdx] = useState(initialSlideIndex);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  // Sync state when entering from blueprint with a specific slide
  useEffect(() => {
    setIdx(initialSlideIndex);
  }, [initialSlideIndex]);

  const handleAddPoints = (amount: number) => {
    setPoints(p => p + amount);
    setIsScoring(true);
    setTimeout(() => setIsScoring(false), 2000);
  };
  useEffect(() => {
    setActiveHotspot(null);
    setIsRevealed(false);
    
    // Auto-reveal content if it's the first block of a phase
    const slide = allSlides[idx];
    if (slide && slide.blockIdx === 0) {
      setTimeout(() => setIsRevealed(true), 500); 
    }
  }, [allSlides.length, idx]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#000000', '#FFFFFF'] // Construction colors
    });
  };

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

  const mainText = textBlocks.contexto || 
                   textBlocks.concepto || 
                   ((currentSlide.content !== textBlocks.instrucción && currentSlide.content !== textBlocks.pregunta) ? currentSlide.content : null) || 
                   'Estableciendo conexión con el centro de mando...';

  const items = mainText.split(/•\s*|\-\s*|(?=\d+\.\s*)/).filter(s => s.trim().length > 1);
  const [intro, ...listItems] = mainText.split(/•\s*|\-\s*|(?=\d+\.\s*)/);
  const hasMultipleItems = items.length > 1;

  const getScenarioIcon = (txt: string) => {
    const lower = txt.toLowerCase();
    if (lower.includes('auto') || lower.includes('vehículo') || lower.includes('carro')) return Car;
    if (lower.includes('peatón') || lower.includes('gente') || lower.includes('persona') || lower.includes('niño')) return Users;
    if (lower.includes('caos') || lower.includes('problema') || lower.includes('falla') || lower.includes('error')) return Zap;
    if (lower.includes('tráfico') || lower.includes('semáforo') || lower.includes('calle')) return TrafficCone;
    return AlertTriangle;
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
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white">
      {/* ─────────────────────────────────────────────────────────────────────────────
          GENIA BLUE HEADER 
          ───────────────────────────────────────────────────────────────────────────── */}
      {/* Removed redundant internal header */}

      {/* Main Content Area Wrap */}
      <div className="relative z-10 w-full flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col items-center justify-start md:justify-center px-4 md:px-12 pt-4 md:pt-8 pb-10">
        
        {/* THE MISSION CARD */}
        <div className="relative w-full max-w-6xl min-h-[400px] md:min-h-[600px] bg-[#f1f3f7] rounded-[2rem] md:rounded-[3.5rem] shadow-sm flex flex-col items-center justify-center p-6 md:p-16 overflow-visible">
          
          {/* Decorative Corner Curves */}
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-20">
             <svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 fill-current">
                <path d="M100,0 C100,55.228 55.228,100 0,100 L100,100 Z" transform="rotate(90 50 50)" />
             </svg>
          </div>
          <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none opacity-20">
             <svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 fill-current">
                <path d="M100,0 C100,55.228 55.228,100 0,100 L100,100 Z" transform="rotate(-90 50 50)" />
             </svg>
          </div>

          {/* Animated Content Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative flex w-full h-full flex-col items-center justify-between"
            >
              {/* Narrative Zone (Hero Text) */}
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-4xl px-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200"
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {currentMomentLabel || `Fase ${currentMomentIndex + 1}`}
                  </span>
                </motion.div>

                <div className="space-y-6 w-full">
                  <h2 className="text-xl md:text-3xl lg:text-4xl font-black italic tracking-wide text-blue-800 leading-tight">
                    <TypewriterText 
                      text={hasMultipleItems ? (intro || 'Situación Detectada:') : mainText} 
                      key={`txt-${idx}`} 
                    />
                  </h2>

                  {hasMultipleItems && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full">
                      {items.map((item, i) => {
                        const Icon = getScenarioIcon(item);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (i * 0.15) }}
                            className="flex items-center gap-4 p-5 rounded-[1.8rem] bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all text-left"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                              <Icon className="w-6 h-6" />
                            </div>
                            <p className="text-sm md:text-base font-bold text-slate-700 leading-snug">
                              {item.trim()}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action/Instruction Area (Accent Box) */}
              {(textBlocks.instrucción || textBlocks.pregunta) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
                  className="w-full max-w-4xl rounded-[2.5rem] bg-blue-700 p-8 md:p-10 shadow-2xl shadow-blue-900/20 relative overflow-hidden group"
                >
                  {/* Decorative Sparkle */}
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="w-16 h-16 text-white rotate-12" />
                  </div>

                  <div className="flex items-center gap-4 mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">
                      Instrucción Operativa
                    </span>
                  </div>

                  <p className="text-lg md:text-2xl font-bold italic text-white leading-relaxed relative z-10">
                    {textBlocks.instrucción || textBlocks.pregunta}
                  </p>
                </motion.div>
              )}

              {/* Interactive Options Area (if applicable) */}
              {isInteractive && options.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full max-w-4xl mt-10"
                >
                  {options.map((opt: any, i: number) => {
                    const isCorrect = opt?.isCorrect || currentSlide.raw?.content?.answer === opt?.text;
                    return (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={`opt-${i}`}
                        className="relative overflow-hidden flex items-start gap-4 rounded-[1.5rem] border-2 border-blue-100 bg-white p-5 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer group/opt"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-600 group-hover/opt:bg-blue-600 group-hover/opt:text-white transition-colors">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div className="space-y-1 pt-1 flex-1">
                          <p className="text-sm font-bold leading-snug text-slate-800">{getOptionText(opt)}</p>
                          {opt.feedback && <p className="text-[11px] font-medium text-slate-500/80 italic line-clamp-2">{opt.feedback}</p>}
                        </div>
                        {isCorrect && showTeacherNotes && (
                          <div className="absolute right-4 top-4 rounded-full bg-emerald-500/20 px-3 py-1 text-[8px] font-black tracking-widest text-emerald-600 ring-1 ring-emerald-500/30">RESPUESTA</div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Floating Mascot (discrete assistant) */}
          <div className="absolute bottom-6 right-8 z-40 pointer-events-none scale-[0.65] md:scale-75 origin-bottom-right">
            <MascotCharacter slideIndex={idx} isCelebrating={isScoring} size="lg" />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────
            GENIA BLUE FOOTER (PILL NAVIGATOR)
            ───────────────────────────────────────────────────────────────────────────── */}
        <div className="mt-8 mb-4 flex w-full justify-center pointer-events-auto">
          <div className="flex h-14 w-full max-w-lg items-center justify-between rounded-full border-2 border-blue-200 bg-white/80 p-1 shadow-lg backdrop-blur-md">
            <button 
              onClick={prev} 
              className="h-full rounded-full px-6 font-black lowercase text-[11px] tracking-widest text-blue-400 hover:bg-blue-50 transition-all flex items-center gap-1 outline-none"
            >
              <ChevronLeft className="h-4 w-4" /> anterior
            </button>
            
            <div className="flex items-center gap-2.5 px-4 overflow-x-auto max-w-[240px]">
              {allSlides.map((_slide, slideIndex) => (
                <button
                  key={slideIndex}
                  onClick={() => setIdx(slideIndex)}
                  className="group relative h-4 w-4 flex items-center justify-center p-1 outline-none shrink-0"
                >
                  <motion.div
                    animate={{
                      backgroundColor: slideIndex === idx ? '#1d4ed8' : 'transparent',
                      borderColor: '#1d4ed8',
                      width: slideIndex === idx ? '24px' : '10px',
                      height: '10px',
                    }}
                    className="rounded-full border-2 transition-all duration-300"
                  />
                </button>
              ))}
            </div>

            <button 
              onClick={next} 
              className="h-full rounded-full px-6 font-black lowercase text-[11px] tracking-widest text-blue-400 hover:bg-blue-50 transition-all flex items-center gap-1 outline-none"
            >
              siguiente <ChevronRight className="h-4 w-4" />
            </button>
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
  const user = null; // Defined local as placeholder for KidsActivityViewer
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
  const [sessionStarted, setSessionStarted] = useState(false);
  const [points, setPoints] = useState(0);
  const [initialSlideIndex, setInitialSlideIndex] = useState(0);

  const allSlides = React.useMemo(() => {
    const slides: any[] = [];
    localLevels.forEach((lvl, sIdx) => {
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
  }, [localLevels]);

  useEffect(() => {
    if (selectedModule) {
      window.dispatchEvent(new CustomEvent('nav:force-hide', { detail: true }));
    } else {
      setSessionStarted(false);
      setPoints(0);
    }
    return () => {
      window.dispatchEvent(new CustomEvent('nav:force-hide', { detail: false }));
    };
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
      // VISIBILITY LOGIC: Si el módulo está inactivo o bloqueado, se oculta completamente
      // (a menos que estemos en modo edición, aunque el Explorer suele ser de consumo)
      if (!module.activo || module.bloqueado) return false;

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
    .filter(section => section.activo !== false) // Strict visibility filter
    .map((section) => ({
      ...section,
      modules: getFilteredModules(section.modules),
    }))
    .filter(
      (section) =>
        (section.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.modules.length > 0)
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
    <div className="tutor-density-90 h-full flex-1 w-full flex flex-col overflow-x-hidden overflow-y-auto animate-in fade-in duration-700 bg-slate-50 relative">
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
                if (sessionStarted) {
                  setSessionStarted(false);
                } else if (selectedModule) {
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
              <div className="h-full w-full relative">
                {!sessionStarted ? (
                  <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 lg:p-12 space-y-12">
                    <div className="text-center space-y-6 max-w-4xl relative">
                      {/* Mascot as Director of Work */}
                      <div className="absolute -top-32 left-1/2 -translate-x-1/2 md:-left-40 md:top-0 md:translate-x-0 z-10">
                         <MascotCharacter 
                           state="teaching" 
                           size="xl" 
                           className="drop-shadow-2xl"
                         />
                      </div>

                      <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-50 text-blue-600 border-2 border-blue-100 shadow-xl relative overflow-hidden group"
                       >
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,transparent_8px,rgba(37,99,235,0.03)_8px,rgba(37,99,235,0.03)_16px)]" />
                         <div className="p-1.5 bg-blue-600/10 rounded-lg">
                           <LayoutList className="w-6 h-6 relative z-10" />
                         </div>
                         <span className="text-xs font-black uppercase tracking-[0.4em] relative z-10">Planificación de Misión Institucional</span>
                       </motion.div>

                      <div className="space-y-4 pt-4">
                        <h2 className="text-4xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-blue-900 leading-[0.85]">
                          <TypewriterText text="REQUISITOS DE MISIÓN" className="justify-center" delay={0.05} />
                          <motion.span 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="text-blue-600 block mt-2 drop-shadow-sm"
                          >
                            {selectedModule.titulo}
                          </motion.span>
                        </h2>
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                          className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-slate-400 italic"
                        >
                          --- Proyectando componentes pedagógicos en tiempo real ---
                        </motion.p>
                      </div>
                    </div>

                     {/* BRICK WALL VIEW - PHASES ARRAY OR KIDS MILESTONES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
                      {selectedModule?.tipo?.includes('kids') || selectedModule?.tipo === 'adventure' ? (
                        <>
                          {/* REQUIREMENTS FOR KIDS MODULES */}
                          {(selectedModule.contenido?.requirements || selectedModule.contenido?.milestones || []).map((req: string, rIdx: number) => (
                            <motion.div
                              key={rIdx}
                              initial={{ opacity: 0, scale: 0.8, y: 30 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ delay: 1.4 + (rIdx * 0.1), type: "spring" }}
                              className="group relative text-left outline-none"
                            >
                              <div className="aspect-[4/3] rounded-[2.5rem] border-b-[10px] border-r-[10px] border-indigo-900/10 bg-white p-6 md:p-8 flex flex-col justify-between shadow-xl transition-all group-hover:-translate-y-2 cursor-default overflow-hidden ring-4 ring-transparent border border-slate-100">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                  <CheckCircle2 className="w-24 h-24 text-indigo-600 -rotate-12" />
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black transition-all text-sm">
                                  {rIdx + 1}
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-sm font-bold uppercase italic tracking-tight text-slate-800 leading-none">REQUISITO</h4>
                                  <p className="text-xs font-medium text-slate-500 leading-relaxed pr-4 line-clamp-3">
                                    {req}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </>
                      ) : (
                        localLevels.map((level, lIdx) => (
                          <motion.button
                            key={level.id || lIdx}
                            onClick={() => {
                              const slideIdx = allSlides.findIndex(s => s.momentIdx === lIdx);
                              setInitialSlideIndex(slideIdx);
                              setSessionStarted(true);
                            }}
                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 1.4 + (lIdx * 0.1), type: "spring" }}
                            className="group relative text-left outline-none"
                          >
                            <div className="aspect-[4/3] rounded-[2.5rem] border-b-[10px] border-r-[10px] border-blue-900/20 bg-white p-6 md:p-8 flex flex-col justify-between shadow-xl transition-all group-hover:-translate-y-4 group-hover:-translate-x-2 group-hover:shadow-[24px_24px_0_rgba(29,78,216,0.1)] cursor-pointer overflow-hidden ring-4 ring-transparent group-hover:ring-blue-500/10">
                              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity group-hover:scale-125 duration-500 translate-x-4 -translate-y-4">
                                <Layers className="w-24 h-24 text-blue-600 -rotate-12" />
                              </div>
                              
                              <div className="flex items-start justify-between relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all text-xl shadow-sm rotate-[-4deg] group-hover:rotate-[4deg]">
                                  {lIdx + 1}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <ClockIcon className="w-6 h-6 text-slate-200 group-hover:text-blue-500 transition-colors" />
                                  <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 transition-colors tracking-tighter">
                                    {level.time_minutes || 10}m
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2 relative z-10">
                                <div className="h-1.5 w-12 bg-slate-100 group-hover:bg-blue-200 rounded-full transition-colors" />
                                <h4 className="text-lg font-black uppercase italic tracking-tight text-slate-950 leading-[1.1] pr-4 group-hover:text-blue-900">
                                  {level.title || `Fase ${lIdx + 1}`}
                                </h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-400 animate-pulse" />
                                  {level.parsedBlocks?.length || 0} Componentes
                                </p>
                              </div>

                              <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                 <span className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-1">
                                   Clic para entrar <ChevronRight className="w-3 h-3" />
                                 </span>
                              </div>
                            </div>
                          </motion.button>
                        ))
                      )}
                      
                      {/* Meta Completion Brick */}
                      <div className="aspect-[4/3.2] rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-3 opacity-40 bg-slate-50/50">
                        <Trophy className="w-10 h-10 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic max-w-[120px]">
                          {selectedModule?.tipo?.includes('kids') ? 'Aventura Completada' : 'Proyecto Finalizado de la Unidad'}
                        </span>
                      </div>
                    </div>

                    {/* Start Action Control - GENIA BLUE STYLE */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.2 }}
                      className="flex flex-col items-center gap-10 w-full max-w-xl pb-16"
                    >
                      <div className="flex items-center gap-6 py-5 px-10 rounded-[2rem] bg-white border-2 border-blue-50 shadow-xl relative group">
                        <div className="absolute -left-3 -top-3 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg rotate-[-12deg] group-hover:rotate-[0deg] transition-transform">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Población:</p>
                          <p className="text-sm font-black uppercase text-blue-800 leading-none mt-1">{courseName}</p>
                        </div>
                        <div className="w-[1px] h-12 bg-slate-100" />
                        <div className="flex flex-col items-start text-left">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estado:</p>
                          <span className="flex items-center gap-2 text-sm font-black uppercase text-emerald-600 italic leading-none mt-1">
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" /> 
                            Misión Lista
                          </span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSessionStarted(true)}
                        className="h-28 w-full md:w-[520px] rounded-[3rem] bg-blue-700 text-white hover:bg-blue-800 hover:scale-[1.04] active:scale-[0.96] transition-all shadow-[0_40px_80px_-20px_rgba(29,78,216,0.3)] border-b-[12px] border-blue-900 flex items-center justify-between px-10 group relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.1),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                         
                         <div className="flex flex-col items-start text-left relative z-10">
                          <span className="text-xs font-black uppercase tracking-[0.45em] text-blue-200">Protocolo de Tutoría</span>
                          <span className="text-4xl font-black uppercase italic tracking-tighter leading-none">INICIAR MISIÓN</span>
                        </div>
                        
                        <div className="p-5 bg-blue-600/50 rounded-[1.5rem] group-hover:scale-110 group-hover:bg-blue-400 transition-all shadow-inner border border-white/10 relative z-10">
                          <Rocket className="w-12 h-12 group-hover:rotate-12 transition-transform text-white" />
                        </div>
                      </Button>
                      
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/60">
                        SISTEMA DE ASISTENCIA PEDAGÓGICA GENIA v4.0.0
                      </p>
                    </motion.div>
                  </div>
                ) : (
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

                       {selectedModule?.tipo?.includes('kids') || selectedModule?.tipo === 'adventure' ? (
                        <div className="h-[calc(100vh-100px)] w-full">
                           <KidsActivityViewer 
                              user={user} 
                              id={selectedModule.id} 
                              tipo={selectedModule.tipo} 
                              standalone={false}
                              initialTemplate={{
                                id: selectedModule.id,
                                moduloInstId: selectedModule.id,
                                titulo: selectedModule.titulo,
                                tipo: selectedModule.tipo,
                                actividades: selectedModule.contenido
                              }}
                              onBack={() => setSessionStarted(false)}
                           />
                        </div>
                      ) : (
                        <CarouselView
                          levels={localLevels}
                          isEditing={isEditingContent}
                          showTeacherNotes={showTeacherNotes}
                          isFocusMode={isFocusMode}
                          moduleTitle={selectedModule.titulo}
                          points={points}
                          setPoints={setPoints}
                          onMove={handleLevelMove}
                          onToggleVisibility={handleLevelToggleVisibility}
                          allSlides={allSlides}
                          initialSlideIndex={initialSlideIndex}
                          onBack={() => setSessionStarted(false)}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 pt-10 pb-20 w-full relative">
                  {visibleModules.map((mod, index) => (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      onClick={() => !isEditingGrid && setSelectedModule(mod)}
                      className={cn(
                        'group relative bg-white/90 backdrop-blur-xl border border-white p-7 rounded-[2.5rem] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col justify-between min-h-[260px] overflow-hidden',
                        isEditingGrid
                          ? 'border-blue-500 border-dashed border-4 scale-[0.98] cursor-default'
                          : mod.activo
                            ? 'cursor-pointer hover:-translate-y-4 hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.2)] hover:border-blue-200'
                            : 'opacity-60 cursor-pointer grayscale-[0.5]'
                      )}
                    >
                      {/* Interactive Light Effect (CSS based) */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      
                      {/* Phase Number Indicator */}
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-all duration-500 group-hover:scale-125 z-0 italic font-black text-9xl text-slate-900 pointer-events-none">
                        {index + 1}
                      </div>

                      {/* Editing Controls */}
                      {isEditingGrid && (
                        <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center gap-4 bg-slate-900/10 backdrop-blur-sm transition-all">
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleGridModuleMove(index, index - 1);
                              }}
                              disabled={index === 0}
                              variant="outline"
                              size="icon"
                              className="w-12 h-12 rounded-full bg-slate-900 text-white border-[3px] border-blue-500 hover:bg-blue-600 hover:scale-110 transition-all disabled:opacity-30"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleGridModuleMove(index, index + 1);
                              }}
                              disabled={index === localGridModules.length - 1}
                              variant="outline"
                              size="icon"
                              className="w-12 h-12 rounded-full bg-slate-900 text-white border-[3px] border-blue-500 hover:bg-blue-600 hover:scale-110 transition-all disabled:opacity-30"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </Button>
                          </div>
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleVisibility?.(mod.id, mod.activo);
                            }}
                            className={cn(
                              'px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
                              mod.activo ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                            )}
                          >
                            {mod.activo ? 'Ocultar' : 'Mostrar'}
                          </Button>
                        </div>
                      )}

                      <div className="space-y-5 relative z-10">
                         <div
                          className={cn(
                            'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border border-white group-hover:rotate-6 group-hover:scale-110',
                            mod.activo ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300',
                            mod.tipo === 'rag_kids' && mod.activo && 'bg-blue-500 shadow-blue-500/30',
                            mod.tipo === 'ha_kids' && mod.activo && 'bg-emerald-500 shadow-emerald-500/30',
                            mod.tipo === 'pim_kids' && mod.activo && 'bg-indigo-500 shadow-indigo-500/30',
                             mod.tipo === 'adventure' && mod.activo && 'bg-amber-500 shadow-amber-500/30'
                          )}
                        >
                          {mod.tipo === 'rag_kids' ? <Sparkles className="w-7 h-7" /> :
                           mod.tipo === 'ha_kids' ? <Target className="w-7 h-7" /> :
                           mod.tipo === 'pim_kids' ? <Rocket className="w-7 h-7" /> :
                           mod.tipo === 'adventure' ? <Zap className="w-7 h-7" /> :
                           mod.tipo === 'mission' ? <Rocket className="w-7 h-7" /> : <Wrench className="w-7 h-7" />}
                        </div>
                        <div className="space-y-2">
                          <Badge
                            variant="outline"
                            className="text-[8px] font-black tracking-[0.2em] border-blue-100 text-blue-500 bg-blue-50/50 px-3 py-1 uppercase rounded-lg"
                          >
                            {mod.tipo ? mod.tipo.replace('_', ' ') : 'Misión'}
                          </Badge>
                          <h4 className="text-xl font-black uppercase italic tracking-tight text-slate-800 leading-[0.95] group-hover:text-blue-600 transition-colors">
                            {mod.titulo}
                          </h4>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between gap-3 pt-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-slate-400 mb-1">Estado</span>
                          <div className={cn(
                            'flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border',
                            mod.activo ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          )}>
                            <div className={cn('w-1.5 h-1.5 rounded-full', mod.activo ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400')} />
                            {mod.activo ? 'Operativo' : 'Pausado'}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModule(mod);
                          }}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 px-5 h-12 transition-all shadow-sm border border-blue-100 group-hover:scale-105 active:scale-95"
                        >
                          Iniciar <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14 pt-10 pb-20 w-full relative">
                  {(isEditingGrid ? localSections : filteredSections).map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      onClick={() => !isEditingGrid && setSelectedSectionId(section.id)}
                      className={cn(
                        'group relative bg-white/80 backdrop-blur-2xl border border-white p-8 md:p-10 rounded-[3.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] transition-all duration-700 flex flex-col justify-between min-h-[320px] overflow-hidden',
                        isEditingGrid
                          ? 'border-blue-500 border-dashed border-4 scale-[0.98] cursor-default'
                          : section.activo
                            ? 'cursor-pointer hover:-translate-y-6 hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.25)] hover:border-blue-300'
                            : 'opacity-60 cursor-pointer grayscale-[0.5]'
                      )}
                    >
                      {/* Spotlight Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-blue-600/0 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      
                      {/* Background Index */}
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-110 z-0 italic font-black text-[10rem] text-slate-950 pointer-events-none leading-none">
                        {index + 1}
                      </div>

                      {/* Editing Controls */}
                      {isEditingGrid && (
                        <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center gap-5 bg-slate-900/15 backdrop-blur-md transition-all">
                          <div className="flex items-center gap-4">
                            <Button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSectionMove(index, index - 1);
                              }}
                              disabled={index === 0}
                              variant="outline"
                              size="icon"
                              className="w-14 h-14 rounded-full bg-slate-900 text-white border-[3px] border-blue-500 hover:bg-blue-600 hover:scale-110 transition-all disabled:opacity-30"
                            >
                              <ChevronLeft className="w-7 h-7" />
                            </Button>
                            <Button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSectionMove(index, index + 1);
                              }}
                              disabled={index === localSections.length - 1}
                              variant="outline"
                              size="icon"
                              className="w-14 h-14 rounded-full bg-slate-900 text-white border-[3px] border-blue-500 hover:bg-blue-600 hover:scale-110 transition-all disabled:opacity-30"
                            >
                              <ChevronRight className="w-7 h-7" />
                            </Button>
                          </div>
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleSectionVisibility?.(section.id, section.activo);
                            }}
                            className={cn(
                              'px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl',
                              section.activo ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                            )}
                          >
                            {section.activo ? 'Desactivar Sector' : 'Activar Sector'}
                          </Button>
                        </div>
                      )}

                      <div className="space-y-6 relative z-10">
                        <div
                          className={cn(
                            'w-16 h-16 rounded-[1.8rem] flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-700 border-2 border-white group-hover:scale-110 group-hover:rotate-3',
                            section.activo ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'
                          )}
                        >
                          <div className="absolute inset-0 mission-grid opacity-20" />
                          <Layers className="w-8 h-8 relative z-10" />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
                              Módulo Operativo {index + 1}
                            </span>
                            {!section.activo && (
                              <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[9px] uppercase tracking-widest px-3">
                                Bloqueado
                              </Badge>
                            )}
                          </div>
                          <h4
                            className={cn(
                              'text-2xl md:text-[1.8rem] font-black uppercase italic tracking-tight leading-[0.9] group-hover:text-blue-600 transition-colors duration-500',
                              section.activo ? 'text-slate-900' : 'text-slate-400'
                            )}
                          >
                            {section.nombre}
                          </h4>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="h-1 w-8 bg-blue-100 rounded-full group-hover:w-16 transition-all duration-700" />
                            <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest">
                              {section.modules.length} {section.modules.length === 1 ? 'Misión Disponible' : 'Misiones Disponibles'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-8 gap-4 border-t border-slate-100 mt-6">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black uppercase text-slate-400 mb-1.5">Estatus Sector</span>
                          <div className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-colors',
                            section.activo 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          )}>
                            <div className={cn('w-2 h-2 rounded-full', section.activo ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400')} />
                            {section.activo ? 'Habilitado' : 'Fuera de Línea'}
                          </div>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm border border-blue-100 group-hover:rotate-12 group-hover:scale-110">
                          <ArrowRight className="w-8 h-8 transition-transform group-hover:translate-x-1" />
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
                <div className="py-28 md:py-40 text-center rounded-[5rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center gap-6" >
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
          .mission-grid {
            background-image:
              linear-gradient(rgba(37, 99, 235, 0.08) 1.5px, transparent 1.5px),
              linear-gradient(90deg, rgba(37, 99, 235, 0.08) 1.5px, transparent 1.5px);
            background-size: 80px 80px;
          }
          .mission-grid-subtile {
            background-image: radial-gradient(circle at 2px 2px, rgba(37, 99, 235, 0.05) 1px, transparent 0);
            background-size: 24px 24px;
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
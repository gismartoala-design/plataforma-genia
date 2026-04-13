import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, Rocket } from 'lucide-react';
import {
  WelcomeScreen, VideoScreen, BlockPickerScreen,
  DragDropScreen, TransformScreen, ChallengePicker,
  CelebrationScreen
} from './KidsInteractions';
import { HaKidsViewer } from './HaKidsViewer';
import { PimKidsViewer } from './PimKidsViewer';
import studentApi from '@/features/student/services/student.api';
import { toast } from '@/hooks/use-toast';

// Priority order: try rag_kids first, then any available template
const TIPO_PRIORITY = ['rag_kids', 'ha_kids', 'pim_kids'];

function normalizeActividades(raw: any): any {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      let parsed = JSON.parse(raw);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return parsed;
    } catch {
      return null;
    }
  }
  return raw;
}

function extractSteps(actividades: any): any[] {
  if (!actividades) return [];
  if (Array.isArray(actividades)) return actividades;
  if (typeof actividades === 'object') {
    return actividades.steps || actividades.screens || [];
  }
  return [];
}

export function KidsActivityViewer({
  user, id: nivelId, tipo, standalone = true
}: {
  user: any; id: number; tipo?: string; standalone?: boolean;
}) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetchBestTemplate();
    setCurrentStep(0);
    setResults([]);
  }, [nivelId]);

  /**
   * Tries to load rag_kids first, then falls back to other types.
   * If a tipo is explicitly passed, use that directly.
   */
  const fetchBestTemplate = async () => {
    setLoading(true);
    try {
      // If explicit tipo provided, use it
      if (tipo) {
        const data = await studentApi.getKidsTemplate(nivelId, tipo).catch(() => null);
        if (data) { setTemplate(data); return; }
      }

      // Otherwise try priority list
      for (const t of TIPO_PRIORITY) {
        try {
          const data = await studentApi.getKidsTemplate(nivelId, t);
          if (data && (data.actividades || data.tipo)) {
            setTemplate(data);
            return;
          }
        } catch {
          // not found for this type, continue
        }
      }

      // Last resort: no tipo filter
      try {
        const data = await studentApi.getKidsTemplate(nivelId, undefined);
        if (data) { setTemplate(data); return; }
      } catch { /* ignore */ }

      setTemplate(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Normalize data ─────────────────────────────────────────────────────────
  const actividades = normalizeActividades(template?.actividades);

  const isBlocksFormat = actividades &&
    !Array.isArray(actividades) &&
    typeof actividades === 'object' &&
    'blocks' in actividades;

  const isPimFormat = template?.tipo === 'pim_kids' || (
    actividades &&
    !Array.isArray(actividades) &&
    typeof actividades === 'object' &&
    'milestones' in actividades
  );

  // For rag_kids format: steps are stored in actividades.steps
  const steps = extractSteps(actividades);

  // ── No content state ───────────────────────────────────────────────────────
  if (!loading && (!template || steps.length === 0)) {
    return (
      <div
        className={`${standalone ? 'fixed inset-0' : 'w-full h-full min-h-[500px]'} flex items-center justify-center p-8`}
        style={{ background: 'linear-gradient(145deg, #e0f7ff 0%, #ede9fe 60%, #fef9c3 100%)' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl max-w-md text-center border-4 border-white"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6"
          >🚀</motion.div>
          <h2 className="text-4xl font-black text-slate-800 mb-3">¡Próximamente!</h2>
          <p className="text-slate-500 font-bold text-lg mb-8">
            Tu profe aún está preparando esta aventura. ¡Vuelve pronto!
          </p>
          <Button
            onClick={() => setLocation('/kids-dashboard')}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 h-14 px-8 rounded-2xl font-black text-lg border-4 border-white shadow-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Volver al Inicio
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNext = async (result?: any) => {
    const newResults = [...results];
    if (result !== undefined) newResults.push({ step: currentStep, data: result });
    setResults(newResults);

    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      try {
        await studentApi.submitKidsResult({
          estudianteId: user.id,
          plantillaKidsId: template.id,
          resultados: newResults,
          calificacionNumerica: 100,
        });
      } catch { /* ignore */ }
      toast({ title: '🎉 ¡Misión completada!', description: '¡Has terminado esta aventura exitosamente!' });
      setLocation('/kids-dashboard');
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className={`${standalone ? 'fixed inset-0' : 'w-full h-full min-h-[500px]'} flex items-center justify-center`}
        style={{ background: 'linear-gradient(145deg, #e0f7ff 0%, #ede9fe 60%, #fef9c3 100%)' }}
      >
        <div className="text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-8 border-indigo-500 border-t-transparent rounded-full mx-auto"
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-3xl font-black text-indigo-600"
          >
            Cargando Aventura... 🚀
          </motion.p>
        </div>
      </div>
    );
  }

  // ── Delegate to specialized viewers ───────────────────────────────────────
  if (template && isBlocksFormat) {
    return <HaKidsViewer user={user} template={{ ...template, actividades }} standalone={standalone} onFinish={() => setLocation('/kids-dashboard')} />;
  }
  if (template && isPimFormat) {
    return <PimKidsViewer user={user} template={{ ...template, actividades }} standalone={standalone} onFinish={() => setLocation('/kids-dashboard')} />;
  }

  // ── Render step ─────────────────────────────────────────────────────────────
  const step = steps[currentStep];

  const renderStep = () => {
    if (!step) return null;

    // Normalize type names for cross-editor compatibility
    const raw = step.type || 'welcome';
    const stepType =
      raw === 'image_choice' ? 'choice' :
      raw === 'drag_drop' ? 'drag-drop' :
      raw === 'animation_interaction' ? (step.data?.animationType === 'rotate' ? 'rotate' : 'scale') :
      raw === 'creative_choice' ? 'final-choice' :
      raw;

    const props = { data: step.data || {}, onNext: handleNext };

    switch (stepType) {
      case 'welcome':      return <WelcomeScreen {...props} />;
      case 'video':        return <VideoScreen {...props} />;
      case 'choice':       return <BlockPickerScreen {...props} />;
      case 'drag-drop':    return <DragDropScreen {...props} />;
      case 'scale':
      case 'rotate':       return <TransformScreen {...props} />;
      case 'final-choice': return <ChallengePicker {...props} />;
      case 'celebration':  return <CelebrationScreen {...props} />;
      default:             return <WelcomeScreen data={{ title: step.data?.title || 'Siguiente paso', subtitle: step.data?.subtitle || '' }} onNext={handleNext} />;
    }
  };

  const progress = steps.length > 0 ? Math.round(((currentStep) / steps.length) * 100) : 0;

  return (
    <div
      className={`${standalone ? 'fixed inset-0' : 'w-full flex-1 h-full rounded-3xl'} flex flex-col selection:bg-yellow-300 overflow-hidden relative`}
      style={{ background: 'linear-gradient(145deg, #e0f7ff 0%, #ede9fe 50%, #fef9c3 100%)' }}
    >
      {/* Top nav bar */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 flex justify-between items-center max-w-5xl mx-auto w-full gap-4">
        {standalone ? (
          <button
            onClick={() => setLocation('/kids-dashboard')}
            className="flex items-center justify-center bg-rose-500 text-white hover:bg-rose-400 rounded-2xl h-14 px-6 font-black text-lg border-x-4 border-t-4 border-b-8 border-rose-700 shadow-xl transition-all active:border-b-4 active:translate-y-1"
          >
            <ArrowLeft className="w-5 h-5 mr-3" /> SALIR
          </button>
        ) : (
          <div className="text-xl font-black text-indigo-700 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border-4 border-white shadow-xl">
            {template.titulo || 'Aventura KDS'}
          </div>
        )}

        {/* Step pills */}
        <div className="flex items-center gap-3 flex-wrap justify-center bg-white/40 p-3 rounded-[2rem] border-4 border-white/50 shadow-inner">
          {steps.map((_, idx: number) => (
            <motion.div
              key={idx}
              animate={{ scale: idx === currentStep ? 1.2 : 1 }}
              className={`rounded-full transition-all duration-300 border-2 ${
                idx < currentStep ? 'bg-emerald-400 border-emerald-600 w-5 h-5 shadow-inner' :
                idx === currentStep ? 'bg-indigo-500 border-indigo-700 w-7 h-7 shadow-[0_0_15px_rgba(99,102,241,0.6)]' :
                'bg-white/60 border-white/80 w-5 h-5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-shrink-0 px-6 mb-4 max-w-5xl mx-auto w-full">
        <div className="h-6 bg-white/60 rounded-full overflow-hidden border-4 border-white backdrop-blur-sm shadow-inner relative">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-indigo-400 via-violet-500 to-fuchsia-500 rounded-full"
          >
            {/* Glossy overlay on progress bar */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-white/20 rounded-full" />
          </motion.div>
        </div>
        <div className="flex justify-between text-sm font-black text-slate-500 mt-2 px-2 uppercase tracking-wide">
          <span>Paso {currentStep + 1} de {steps.length}</span>
          <span className="text-indigo-600 drop-shadow-sm">{progress}% completado</span>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center">
        <div className="w-full max-w-5xl flex-1 flex items-start justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 60, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="bg-white/95 backdrop-blur-2xl w-full p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-indigo-200/50 border-[12px] border-white/80 flex flex-col items-center gap-6 min-h-[400px] justify-center relative overflow-hidden"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

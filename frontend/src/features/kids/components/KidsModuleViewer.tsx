import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, Lock, CheckCircle2, Star, Rocket, ChevronRight, Play } from 'lucide-react';
import { KidsActivityViewer } from './KidsActivityViewer';
import kidsProfessorApi from '@/features/kids-professor/services/kidsProfessor.api';

const LEVEL_COLORS = [
  { from: 'from-emerald-400', to: 'to-teal-500', shadow: 'shadow-emerald-300/50', emoji: '🌴' },
  { from: 'from-orange-400', to: 'to-rose-500',  shadow: 'shadow-orange-300/50', emoji: '🎯' },
  { from: 'from-violet-500', to: 'to-fuchsia-500', shadow: 'shadow-violet-300/50', emoji: '🚀' },
  { from: 'from-amber-400', to: 'to-yellow-500', shadow: 'shadow-amber-300/50', emoji: '⭐' },
  { from: 'from-sky-400', to: 'to-indigo-500',  shadow: 'shadow-sky-300/50', emoji: '🌊' },
];

interface KidsModuleViewerProps {
  user: any;
  moduleId: number;
}

export function KidsModuleViewer({ user, moduleId }: KidsModuleViewerProps) {
  const [, setLocation] = useLocation();
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);

  useEffect(() => {
    fetchLevels();
  }, [moduleId]);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const data = await kidsProfessorApi.getModuleLevels(String(moduleId));
      const sorted = (data || []).sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0));
      setLevels(sorted);
    } catch (err) {
      console.error('[KidsModuleViewer] Error fetching levels:', err);
    } finally {
      setLoading(false);
    }
  };

  // If a level is selected, show the full activity viewer
  if (activeLevelId !== null && !loading) {
    return (
      <KidsActivityViewer
        user={user}
        id={activeLevelId}
        standalone={true}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden font-sans"
      style={{ background: 'linear-gradient(145deg, #e0f7ff 0%, #ede9fe 50%, #fef9c3 100%)' }}
    >
      {/* Animated blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[0,1,2].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-15"
            style={{
              width: `${200 + i*80}px`, height: `${200 + i*80}px`,
              background: ['#818cf8','#34d399','#f472b6'][i],
              top: `${[10, 60, 35][i]}%`,
              left: `${[5, 75, 45][i]}%`,
            }}
            animate={{ y: [0,-30,0], x: [0,20,0] }}
            transition={{ duration: 5+i*1.5, repeat: Infinity, ease: 'easeInOut', delay: i*0.8 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 px-6 pt-6 pb-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation('/kids-dashboard')}
            className="text-slate-600 hover:text-slate-900 hover:bg-white/70 rounded-2xl h-14 px-6 font-black text-lg border-4 border-white/50 backdrop-blur-sm shadow"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Inicio
          </Button>
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-2xl px-5 py-2 border-4 border-white/60 shadow">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="font-black text-slate-700 text-lg">Selecciona tu Aventura</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 border-8 border-indigo-500 border-t-transparent rounded-full"
              />
              <p className="text-2xl font-black text-indigo-600 animate-pulse">Cargando niveles... 🚀</p>
            </div>
          ) : levels.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center"
            >
              <motion.div animate={{ y: [0,-12,0] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl">🚀</motion.div>
              <h2 className="text-4xl font-black text-indigo-500">¡Próximamente!</h2>
              <p className="text-slate-500 font-bold text-xl">Tu profe aún está preparando las aventuras.</p>
            </motion.div>
          ) : (
            <div className="space-y-5 pb-12">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-5xl font-black text-slate-700 mb-8 text-center"
              >
                🗺️ Elige tu nivel
              </motion.h1>

              {levels.map((level, idx) => {
                const isBlocked = !!level.bloqueado;
                const cfg = LEVEL_COLORS[idx % LEVEL_COLORS.length];
                
                return (
                  <motion.button
                    key={level.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    whileHover={!isBlocked ? { scale: 1.02, y: -5, transition: { duration: 0.2 } } : {}}
                    whileTap={!isBlocked ? { scale: 0.98 } : {}}
                    onClick={() => !isBlocked && setActiveLevelId(level.id)}
                    className={`w-full relative overflow-hidden bg-gradient-to-br ${cfg.from} ${cfg.to} rounded-[3rem] p-6 md:p-10 text-white shadow-2xl ${cfg.shadow} border-[6px] border-white/40 flex items-center gap-6 md:gap-10 group text-left transition-all ${isBlocked ? 'opacity-50 grayscale-[0.7] cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {/* Animated shine effect */}
                    {!isBlocked && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                    )}

                    {/* Number bubble */}
                    <div className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-white/20 backdrop-blur-md border-4 border-white/40 rounded-[2rem] flex flex-col items-center justify-center shadow-inner relative transition-transform ${!isBlocked && 'group-hover:rotate-12 group-hover:scale-110'}`}>
                      <span className="text-3xl md:text-4xl leading-none mb-1 drop-shadow-md">{cfg.emoji}</span>
                      <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">{idx + 1}</span>
                      
                      {/* Status indicator badge */}
                      {!isBlocked && (
                         <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                            <Star className="w-3 h-3 fill-white text-white" />
                         </div>
                      )}
                    </div>
 
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <h3 className="text-3xl md:text-4xl font-black leading-none truncate drop-shadow-sm flex items-center gap-3">
                        {level.tituloNivel || level.titulo || `Misión ${idx+1}`}
                        {isBlocked && <Lock className="w-6 h-6 text-white/60 mb-1" />}
                      </h3>
                      <p className="text-white/80 font-bold text-lg md:text-xl line-clamp-1 italic opacity-90">
                        {isBlocked ? '¡Nivel por descubrir!' : (level.descripcion || '¡Prepárate para la aventura!')}
                      </p>
                    </div>
 
                    {/* Access Icon */}
                    <div className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-white/20 border-4 border-white/40 rounded-full flex items-center justify-center transition-all shadow-inner ${!isBlocked ? 'group-hover:bg-white group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]' : ''}`}>
                      {isBlocked ? (
                        <Lock className="w-8 h-8 text-white/60" />
                      ) : (
                        <Play className={`w-9 h-9 fill-white text-white transition-colors ${!isBlocked && 'group-hover:fill-indigo-600 group-hover:text-indigo-600'}`} />
                      )}
                    </div>

                    {/* Locked overlay text (Optional) */}
                    {isBlocked && (
                      <div className="absolute right-10 bottom-4 font-black text-white/30 text-xs uppercase tracking-[0.2em] pointer-events-none">
                        BLOQUEADO
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

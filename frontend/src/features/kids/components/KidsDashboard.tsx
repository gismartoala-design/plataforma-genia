import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Star, Map, Rocket, Volume2, VolumeX, Trophy, BookOpen, Sparkles, Zap, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { studentApi, StudentModule } from '../../student/services/student.api';
import { useSpeech } from '@/hooks/useSpeech';

const MODULE_CONFIGS = [
  { gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-400/40', emoji: '🌴', category: 'Exploración', accent: '#10b981' },
  { gradient: 'from-orange-400 to-rose-500',  shadow: 'shadow-orange-400/40', emoji: '🎯', category: 'Reto', accent: '#f97316' },
  { gradient: 'from-violet-500 to-fuchsia-500', shadow: 'shadow-violet-500/40', emoji: '🚀', category: 'Ciencia', accent: '#8b5cf6' },
  { gradient: 'from-amber-400 to-yellow-500',  shadow: 'shadow-amber-400/40', emoji: '⭐', category: 'Aventura', accent: '#f59e0b' },
  { gradient: 'from-sky-400 to-indigo-500',   shadow: 'shadow-sky-400/40', emoji: '🌊', category: 'Misión', accent: '#38bdf8' },
];

const GREETING_TEXTS = [
  'hora de explorar nuevos mundos',
  'hay aventuras esperándote',
  'tienes misiones increíbles',
];

export function KidsDashboard({ user }: { user: any }) {
  const [, setLocation] = useLocation();
  const [modules, setModules] = useState<StudentModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting] = useState(() => GREETING_TEXTS[Math.floor(Math.random() * GREETING_TEXTS.length)]);
  const { speak, isMuted, toggleMute, isSpeaking } = useSpeech({ defaultRate: 0.92, defaultPitch: 1.2 });

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getModules(user.id.toString());
      setModules(data.modules || []);
    } catch (error) {
      console.error("Error fetching kids modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGreeting = useCallback(() => {
    speak(`¡Hola, ${user?.name || 'Aventurero'}! Hoy ${greeting}. ¡Elige una misión y empieza a aprender!`, true);
  }, [speak, user?.name, greeting]);

  const handleLogout = () => {
    localStorage.removeItem("edu_token");
    localStorage.removeItem("edu_user");
    window.location.href = "/login-kids";
  };

  const cfg = (idx: number) => MODULE_CONFIGS[idx % MODULE_CONFIGS.length];

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans" style={{ background: 'linear-gradient(145deg, #e0f7ff 0%, #ede9fe 50%, #fef9c3 100%)' }}>
      {/* Animated floating blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${120 + i * 60}px`, height: `${120 + i * 60}px`,
              background: [`#818cf8`,`#34d399`,`#fb923c`,`#a78bfa`,`#38bdf8`,`#f472b6`][i],
              top: `${[5, 60, 20, 70, 40, 10][i]}%`,
              left: `${[10, 80, 50, 15, 90, 70][i]}%`,
            }}
            animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10 px-6 py-8 md:px-12 md:py-12">
        {/* Header */}
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex flex-wrap justify-between items-center mb-12 bg-white/70 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-xl border-4 border-white/60 gap-4"
        >
          <div className="flex items-center gap-5">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-white cursor-pointer"
              onClick={handleGreeting}
              title="¡Haz clic para escuchar!"
            >
              👦
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-indigo-600 tracking-tight leading-none">
                ¡Hola, <span className="text-fuchsia-600">{user?.name || 'Aventurero'}</span>!
              </h1>
              <p className="text-slate-500 font-bold text-base mt-1">Hoy {greeting} 🌟</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* XP Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-amber-400 to-orange-500 px-5 py-3 rounded-2xl flex items-center gap-2 border-x-4 border-t-4 border-b-8 border-amber-600 shadow-xl shadow-amber-300/40"
            >
              <Star className="text-white w-6 h-6 fill-white drop-shadow-md" />
              <span className="text-2xl font-black text-white drop-shadow-md">12 XP</span>
            </motion.div>

            {/* Narration toggle */}
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-2xl border-x-4 border-t-4 border-b-8 shadow-xl flex items-center justify-center transition-all active:border-b-4 active:translate-y-1 ${isMuted ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-indigo-500 text-white border-indigo-700'} ${isSpeaking ? 'animate-pulse' : ''}`}
              title={isMuted ? 'Activar voz' : 'Silenciar voz'}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-14 h-14 rounded-2xl border-x-4 border-t-4 border-b-8 border-rose-700 shadow-xl flex items-center justify-center bg-rose-500 text-white hover:bg-rose-400 transition-all active:border-b-4 active:translate-y-1"
              title="Cerrar sesión"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </motion.header>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Trophy, label: 'Logros', val: '3', color: 'from-amber-400 to-yellow-500', textColor: 'text-amber-700' },
            { icon: BookOpen, label: 'Misiones', val: modules.length.toString(), color: 'from-indigo-400 to-violet-500', textColor: 'text-indigo-700' },
            { icon: Sparkles, label: 'Racha', val: '5 días', color: 'from-pink-400 to-rose-500', textColor: 'text-pink-700' },
          ].map(({ icon: Icon, label, val, color, textColor }) => (
            <motion.div
              key={label}
              whileHover={{ y: -4 }}
              className="bg-white/70 backdrop-blur-md rounded-[2rem] p-4 border-4 border-white/60 shadow-md flex flex-col items-center gap-1"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-black ${textColor}`}>{val}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Section title */}
        <motion.h2
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-black text-slate-700 mb-8 flex items-center gap-4"
        >
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl text-white shadow-xl shadow-indigo-300/40 rotate-3">
            <Map className="w-10 h-10" />
          </div>
          Tu Mapa Mágico
        </motion.h2>

        {/* Module grid */}
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-72 bg-white/50 rounded-[3rem] animate-pulse border-4 border-white" />
              ))
            ) : modules.length === 0 ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="col-span-full py-24 text-center bg-white/50 rounded-[3rem] border-4 border-dashed border-white/80 backdrop-blur-md flex flex-col items-center gap-6"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl"
                >🚀</motion.div>
                <div>
                  <p className="text-3xl font-black text-indigo-500">¡Aún no tienes misiones!</p>
                  <p className="text-slate-500 font-bold mt-2">Dile a tu profe que te asigne una aventura.</p>
                </div>
              </motion.div>
            ) : (
              modules.map((mod, idx) => {
                const c = cfg(idx);
                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setLocation(`/kids/play/${mod.id}`)}
                    className={`bg-gradient-to-br ${c.gradient} rounded-[3rem] p-7 text-white shadow-2xl ${c.shadow} relative overflow-hidden cursor-pointer border-x-4 border-t-4 border-b-[16px] border-black/20 group active:border-b-4 active:translate-y-3 transition-all`}
                  >
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Floating emoji & badge */}
                    <div className="flex justify-between items-start mb-4">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
                        className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
                      >
                        {c.emoji}
                      </motion.div>
                      <div className="bg-white/25 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 border-white/50 shadow-sm">
                        <Zap className="w-4 h-4 inline mr-1 text-yellow-300 fill-yellow-300 drop-shadow-md" />
                        {mod.categoria || c.category}
                      </div>
                    </div>

                    <h3 className="text-3xl font-black mb-2 leading-tight drop-shadow-md line-clamp-2">{mod.nombreModulo}</h3>

                    <div className="w-full bg-white text-indigo-700 hover:text-indigo-500 rounded-2xl py-4 text-xl font-black shadow-lg border-b-6 border-slate-200 group-active:border-b-0 flex items-center justify-center transition-all">
                      <Play className="w-6 h-6 mr-2 fill-current drop-shadow-sm" /> ¡JUGAR!
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </AnimatePresence>
      </div>

      {/* Decorative floating emojis */}
      {['☁️', '⭐', '🌈', '🎈'].map((emoji, i) => (
        <motion.div
          key={i}
          className="fixed text-6xl pointer-events-none select-none opacity-25"
          style={{ top: `${[10, 80, 50, 30][i]}%`, left: `${[5, 90, 3, 95][i]}%` }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}


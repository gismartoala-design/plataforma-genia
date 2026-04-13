
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  ChevronRight, 
  Mail, 
  Lock, 
  ArrowLeft,
  Cpu,
  Gamepad2,
  Layout,
  Zap,
  Globe,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import '../../styles/LatamTheme.css';
import { authApi } from '@/features/auth/services/auth.api';

// Animated particles background
const FloatingParticle = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-blue-400/40"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -100],
      x: [0, (Math.random() - 0.5) * 60],
    }}
    transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeOut' }}
    style={{ left: `${Math.random() * 100}%`, bottom: 0 }}
  />
);

// Cyber entrance animation overlay
const CyberEntrance = ({ name, onComplete }: { name: string; onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(to right, #1e40af 1px, transparent 1px), linear-gradient(to bottom, #1e40af 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15)_0%,_transparent_70%)]" />

      {/* Scan line animation */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-blue-500/60 blur-sm"
        initial={{ top: '-2px' }}
        animate={{ top: '102%' }}
        transition={{ duration: 1.8, ease: 'linear' }}
      />
      <motion.div
        className="absolute left-0 right-0 h-px bg-blue-400/30"
        initial={{ top: '-2px' }}
        animate={{ top: '102%' }}
        transition={{ duration: 1.8, ease: 'linear' }}
      />

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 px-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(59,130,246,0.6)]"
        >
          <Rocket className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">Acceso Autorizado</p>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Bienvenido, <span className="text-blue-400">{name}</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500" />
          <span className="text-blue-400/70 text-xs font-bold tracking-widest uppercase">LATAM Academy</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500" />
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="w-48 h-1 bg-blue-900 rounded-full mx-auto overflow-hidden"
        >
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 1, duration: 1.5, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 1.2, repeat: 2, duration: 0.6 }}
          className="text-slate-500 text-xs font-mono"
        >
          Cargando ecosistema...
        </motion.p>
      </div>
    </motion.div>
  );
};

export const LatamLogin = ({ onLogin, onSwitchToNormal }: { 
  onLogin: (role: any, name: string, id: string, planId?: number, token?: string, institucionId?: number, roleId?: number, cursoId?: number) => void,
  onSwitchToNormal: () => void 
}) => {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEntrance, setShowEntrance] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; role: number; id: string; planId: number; token: string; institucionId?: number; cursoId?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const data = await authApi.login({ email, password });
      const user = data.user as any;
      const token = data.access_token;
      const roleId = user.roleId ?? user.role_id;

      // Allow Latam roles (11, 12) and also admin (1) for testing
      if (![1, 11, 12].includes(roleId)) {
        throw new Error('Tu cuenta no tiene acceso al portal LATAM.');
      }

      setLoggedInUser({ 
        name: user.nombre || 'LATAM Usuario', 
        role: roleId, 
        id: String(user.id), 
        planId: user.planId ?? 3, 
        token,
        institucionId: user.institucionId,
        cursoId: user.cursoId
      });
      setShowEntrance(true);

    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
      setIsLoading(false);
    }
  };

  const handleEntranceComplete = () => {
    if (!loggedInUser) return;
    const { name, role, id, planId, token, institucionId, cursoId } = loggedInUser;
    const roleStr = role === 11 ? 'profesor_latam' : 'estudiante_latam';
    onLogin(roleStr, name, id, planId, token, institucionId, role, cursoId);
    if (role === 11) {
      setLocation('/latam-teach');
    } else {
      setLocation('/latam-dashboard');
    }
  };

  return (
    <>
      <AnimatePresence>
        {showEntrance && loggedInUser && (
          <CyberEntrance name={loggedInUser.name} onComplete={handleEntranceComplete} />
        )}
      </AnimatePresence>

      <div className="min-h-screen latam-gradient-bg flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.3} />
          ))}
        </div>

        <div className="absolute inset-0 latam-grid-overlay z-0" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-6xl grid md:grid-cols-2 latam-card overflow-hidden relative z-10"
        >
          {/* Left Side: Ecosystem Info */}
          <div className="p-10 md:p-16 flex flex-col justify-between bg-white border-r border-slate-100 relative overflow-hidden">
            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="space-y-6 relative z-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center latam-glow-blue shadow-lg">
                  <Rocket className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800">
                    GeniosBot <span className="text-blue-600">LATAM</span> Academy
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Ecosistema de Innovación
                  </p>
                </div>
              </motion.div>
 
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                  Forjando el <span className="latam-text-gradient">talento tecnológico</span> de Latinoamérica.
                </h1>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Únete al ecosistema donde los retos reales impulsan tu carrera profesional hacia el futuro.
                </p>
              </motion.div>

              {/* Level Indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid gap-3 pt-4"
              >
                {[
                  { level: "Nivel 1", title: "Exploradores", desc: "Pensamiento computacional y lógica base.", icon: Gamepad2, badge: "latam-badge-level-1", color: "text-blue-600" },
                  { level: "Nivel 2", title: "Constructores", desc: "Desarrollo de software y arquitectura de datos.", icon: Layout, badge: "latam-badge-level-2", color: "text-violet-600" },
                  { level: "Nivel 3", title: "Innovadores", desc: "Machine Learning y soluciones escalables.", icon: Cpu, badge: "latam-badge-level-3", color: "text-emerald-600" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-default"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.badge)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.level}</p>
                      <p className={cn("text-sm font-bold", item.color)}>{item.title}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200 ml-auto group-hover:text-slate-400 transition-colors" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-3 gap-3 pt-2"
              >
                {[
                  { label: 'Talentos', value: '12K+', icon: Globe },
                  { label: 'Países', value: '18', icon: Globe },
                  { label: 'Retos', value: '300+', icon: Zap },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <p className="text-xl font-black text-slate-800">{s.value}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="pt-8 text-xs text-slate-400 font-medium italic relative z-10">
              Aprendizaje basado en proyectos y retos reales.
            </div>
          </div>

          {/* Right Side: Login Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-10 md:p-20 flex flex-col justify-center bg-slate-50/30 relative"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600" />
            
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="w-12 h-1 bg-blue-600 rounded-full mb-4" />
                <h3 className="text-2xl font-bold text-slate-900">Acceso a la Academia</h3>
                <p className="text-slate-400 font-medium italic">Ingresa a tu centro de innovación profesional</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="email" 
                      placeholder="Correo Electrónico" 
                      className="w-full h-14 bg-white border-slate-200 rounded-xl pl-12 font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="password" 
                      placeholder="Contraseña" 
                      className="w-full h-14 bg-white border-slate-200 rounded-xl pl-12 font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] latam-glow-blue"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Verificando acceso...
                    </span>
                  ) : (
                    <>
                      Acceder al Ecosistema
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                {/* Demo credentials hint */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-slate-500 space-y-1">
                  <p className="font-bold text-blue-600">Credenciales de demo:</p>
                  <p>Profesor: <code className="bg-white px-1 rounded text-slate-700">profe.latam@genios.com</code></p>
                  <p>Contraseña: <code className="bg-white px-1 rounded text-slate-700">admin</code></p>
                </div>
              </form>

              <div className="space-y-6">
                <button 
                  onClick={onSwitchToNormal}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a GeniosBot Principal
                </button>
                <div className="h-px bg-slate-200 w-full" />
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  <p>© 2026 GENIOS LATAM ACADEMY</p>
                  <p>TÉRMINOS Y PRIVACIDAD</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

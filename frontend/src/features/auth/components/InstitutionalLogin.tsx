
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Mail, Lock, AlertTriangle, ArrowLeft, HardHat, Building2, Cpu, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import '../../institutional/styles/ConstructionTheme.css';
import { authApi } from '../services/auth.api';
import { toast } from '@/hooks/use-toast';

/* ══════════════════════════════════════════════
   VIDEO GAME INTRO OVERLAY
══════════════════════════════════════════════ */
const GameIntro = ({ userName, onComplete }: { userName: string; onComplete: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timings = [600, 1800, 3200, 4800, 6000];
    const timers = timings.map((t, i) => setTimeout(() => setPhase(i + 1), t));
    const finishTimer = setTimeout(onComplete, 7200);
    return () => { timers.forEach(clearTimeout); clearTimeout(finishTimer); };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="fixed inset-0 z-[100] bg-[var(--inst-navy)] flex items-center justify-center overflow-hidden font-sans"
    >
      {/* HUD Borders */}
      <div className="absolute inset-8 border border-white/5 rounded-3xl pointer-events-none" />
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4">
        <div className="h-0.5 w-12 bg-[var(--inst-blue)]/30 rounded-full" />
        <div className="h-0.5 w-32 bg-[var(--inst-cyan)]/20 rounded-full" />
        <div className="h-0.5 w-12 bg-[var(--inst-blue)]/30 rounded-full" />
      </div>

      {/* Scan line sweeping down */}
      <motion.div
        className="absolute left-0 right-0 h-4 bg-gradient-to-r from-transparent via-[var(--inst-blue)]/10 to-transparent pointer-events-none"
        initial={{ top: '-4px' }}
        animate={{ top: '100%' }}
        transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
      />

      {/* Blueprint grid */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'linear-gradient(var(--inst-blue-lt) 1px, transparent 1px), linear-gradient(90deg, var(--inst-blue-lt) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--inst-blue)]/20 blur-[200px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--inst-purple)]/20 blur-[200px] rounded-full" />

      {/* Particles rising */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 1 + (i % 3), height: 1 + (i % 3), left: `${(i * 2.5) % 100}%`, bottom: 0, background: i % 2 === 0 ? 'var(--inst-cyan)' : 'var(--inst-blue-lt)' }}
          animate={{ y: -1000, opacity: [0, 0.8, 0] }}
          transition={{ duration: 5 + (i % 3), delay: i * 0.1, repeat: Infinity, ease: 'easeOut' }} />
      ))}

      <div className="relative z-10 text-center space-y-8 px-8 max-w-xl">
        {/* Phase 0→1: Digital Construction Logo */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div initial={{ scale: 0.5, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative mx-auto w-24 h-24 mb-10">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--inst-blue)] to-[var(--inst-purple)] rounded-3xl rotate-6 blur-lg opacity-40 animate-pulse" />
              <div className="relative w-full h-full bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl">
                <Building2 className="w-12 h-12 text-[var(--inst-cyan)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 1→2: Personalized Access */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
              className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.8em] text-[var(--inst-blue-lt)]/50">Sesión Institucional Encriptada</p>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                Ingeniero <span className="text-[var(--inst-cyan)]">{userName}</span>
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2→3: HUD Divider */}
        <AnimatePresence>
          {phase >= 3 && (
            <div className="flex items-center gap-4 justify-center">
              <motion.div initial={{ width: 0 }} animate={{ width: 80 }} className="h-[1px] bg-gradient-to-r from-transparent to-[var(--inst-blue)]" />
              <div className="w-2 h-2 rounded-full border border-[var(--inst-cyan)]" />
              <motion.div initial={{ width: 0 }} animate={{ width: 80 }} className="h-[1px] bg-gradient-to-l from-transparent to-[var(--inst-blue)]" />
            </div>
          )}
        </AnimatePresence>

        {/* Phase 3→4: Core Vision */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-white">
                RECONSTRUIR<br/>
                <span className="text-[var(--inst-cyan)]">LA CIUDAD</span>
              </h1>
              <p className="text-lg font-bold text-slate-400 italic max-w-md mx-auto">
                El futuro se diseña nivel a nivel. Tu intervención está lista.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 4→5: System Ready */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-4 pt-6">
              <div className="w-full max-w-sm mx-auto h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div className="h-full bg-gradient-to-r from-[var(--inst-blue)] via-[var(--inst-cyan)] to-[var(--inst-purple)] rounded-full"
                  initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2, ease: 'easeInOut' }} />
              </div>
              <div className="flex justify-between items-center px-2 max-w-sm mx-auto">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--inst-blue-lt)]/50 animate-pulse">Iniciando Servidores...</span>
                <span className="text-[10px] font-black text-white italic">PORTAL 4.0 READY</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════
   ANIMATED CRANE + HANGING ICON
══════════════════════════════════════════════ */
const CraneScene = ({ focusedField }: { focusedField: 'email' | 'password' | null }) => (
  <div className="w-full flex justify-center relative" style={{ height: 160 }}>
    <svg viewBox="0 0 320 155" className="absolute top-0 w-full max-w-sm drop-shadow-2xl" style={{ height: 155 }}>
      {/* Mast */}
      <rect x="155" y="25" width="8" height="120" fill="var(--inst-navy)" opacity="0.4" />
      <rect x="158" y="25" width="2" height="120" fill="var(--inst-blue-lt)" opacity="0.6" />
      
      {/* Main jib */}
      <motion.rect 
        x="45" y="25" width="220" height="5" fill="var(--inst-navy)" 
        animate={{ rotate: focusedField === 'password' ? 2 : focusedField === 'email' ? -2 : 0 }}
      />
      
      {/* Trolley - moves horizontally based on focus */}
      <motion.g
        animate={{ x: focusedField === 'password' ? 50 : focusedField === 'email' ? -50 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        <rect x="150" y="23" width="20" height="8" rx="2" fill="var(--inst-blue)" />
        {/* Cable */}
        <motion.line 
          x1="160" y1="30" x2="160" y2={focusedField ? 90 : 80} 
          stroke="var(--inst-blue)" strokeWidth="1" strokeDasharray="4 2" 
          animate={{ y2: focusedField ? 95 : 85 }}
          className="transition-all duration-300"
        />
        {/* Hook / Icon Holder */}
        <motion.g transform="translate(145, 90)">
          <motion.div 
            style={{ width: 30, height: 30 }}
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
             <circle cx="15" cy="5" r="3" fill="none" stroke="var(--inst-blue)" strokeWidth="1.5" />
          </motion.div>
        </motion.g>
      </motion.g>

      {/* Cab */}
      <rect x="147" y="14" width="24" height="18" rx="3" fill="var(--inst-blue)" />
      <rect x="152" y="17" width="9" height="8" rx="1" fill="var(--inst-blue-lt)" opacity="0.8" />
    </svg>

    {/* Hanging Icons — Swapping based on focus */}
    <div className="absolute inset-0 pointer-events-none flex justify-center">
      <motion.div 
        className="relative"
        style={{ top: 95 }}
        animate={{ 
          x: focusedField === 'password' ? 50 : focusedField === 'email' ? -50 : 0,
          rotate: [-3, 3, -3]
        }}
        transition={{ 
          x: { type: 'spring', stiffness: 100, damping: 15 },
          rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={focusedField || 'none'}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border-2 backdrop-blur-md shadow-2xl transition-colors duration-500",
              focusedField === 'email' ? "bg-white/90 border-[var(--inst-blue)] shadow-[var(--inst-blue)]/30" :
              focusedField === 'password' ? "bg-white/90 border-emerald-500 shadow-emerald-500/30" :
              "bg-white/40 border-slate-200 shadow-none"
            )}
          >
            {focusedField === 'password' ? (
              <Lock className="w-6 h-6 text-emerald-600" />
            ) : (
              <Mail className={cn("w-6 h-6", focusedField === 'email' ? "text-[var(--inst-blue)]" : "text-slate-400")} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   PREMIUM INPUT FIELD
══════════════════════════════════════════════ */
const PremiumInput = ({
  icon: Icon, type, placeholder, value, onChange, onFocus, onBlur,
  focused, accentColor, required
}: {
  icon: any; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; onFocus: () => void; onBlur: () => void;
  focused: boolean; accentColor: 'orange' | 'cyan'; required?: boolean;
}) => {
  const accent = accentColor === 'orange'
    ? { border: 'var(--inst-blue)', bg: 'rgba(0,119,182,0.04)', glow: '0 0 25px rgba(0,119,182,0.15)', icon: 'text-[var(--inst-blue)]', label: 'text-[var(--inst-blue)]' }
    : { border: 'var(--inst-emerald)', bg: 'rgba(2,195,154,0.04)', glow: '0 0 25px rgba(2,195,154,0.15)', icon: 'text-emerald-500', label: 'text-emerald-500' };

  return (
    <motion.div
      animate={focused
        ? { borderColor: accent.border, backgroundColor: accent.bg, boxShadow: accent.glow }
        : { borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)', boxShadow: 'none' }}
      transition={{ duration: 0.25 }}
      className="relative flex items-center gap-3 h-14 px-4 rounded-2xl border cursor-text group"
      onClick={() => document.querySelector<HTMLInputElement>(`input[data-field="${placeholder}"]`)?.focus()}
    >
      {/* Animated corner accent when focused */}
      <AnimatePresence>
        {focused && (
          <>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
              className="absolute top-0 left-4 right-4 h-px origin-left"
              style={{ background: `linear-gradient(90deg, ${accent.border}, transparent)` }} />
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
              className="absolute bottom-0 right-4 left-4 h-px origin-right"
              style={{ background: `linear-gradient(270deg, ${accent.border}, transparent)` }} />
          </>
        )}
      </AnimatePresence>

      <Icon className={cn('w-4 h-4 shrink-0 transition-colors duration-300', focused ? accent.icon : 'text-slate-700')} />
      <input
        data-field={placeholder}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        className="flex-1 bg-transparent border-0 outline-none font-bold text-[var(--inst-navy)] placeholder:text-slate-300 text-sm tracking-wide"
      />

      {/* Pulse indicator when typing */}
      {value.length > 0 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className={cn('w-1.5 h-1.5 rounded-full', accentColor === 'orange' ? 'bg-[var(--inst-rose)]' : 'bg-[var(--inst-mauve)]')} />
      )}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════
   SPARKS & SCAN LINE
══════════════════════════════════════════════ */
const Sparks = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div key={i} className="absolute rounded-full"
        style={{ width: 2 + (i % 3), height: 2 + (i % 3), left: `${(i * 5) % 100}%`, bottom: 0, background: i % 3 === 0 ? 'var(--inst-rose)' : i % 3 === 1 ? 'var(--inst-mauve)' : 'var(--inst-salmon)' }}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: -(250 + (i * 20) % 350), opacity: [0, 0.9, 0] }}
        transition={{ duration: 3 + (i % 4), delay: i * 0.3, repeat: Infinity, ease: 'easeOut' }} />
    ))}
  </div>
);

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export const InstitutionalLogin = ({ onLogin, onSwitchToNormal }: {
  onLogin: (role: any, name: string, id: string, planId?: number, token?: string, institucionId?: number, roleId?: number, cursoId?: number) => void,
  onSwitchToNormal: () => void
}) => {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await authApi.login({ email, password }) as any;
      const user = data.user;
      const roleMap: Record<number, string> = { 
        7: 'kids_professor',
        8: 'institutional_admin', 
        9: 'institutional_professor', 
        10: 'student', 
        13: 'profesor_vista' 
      };
      const role = roleMap[user.roleId];
      if (!role) { setError('Acceso reservado para instituciones educativas.'); setIsLoading(false); return; }
      const u = user as any;
      setPendingData({ role, u, token: data.access_token });
      setShowIntro(true);
      toast({ title: '¡Acceso concedido!', description: `Bienvenido, ${u.nombre}.` });
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Credenciales inválidas.');
      setIsLoading(false);
    }
  };

  const handleIntroComplete = () => {
    if (!pendingData) return;
    const { role, u, token } = pendingData;
    onLogin(role, u.nombre || '', String(u.id), u.planId || 0, token, u.institucionId, u.roleId, u.cursoId);
    
    // Redirect based on role and institution
    if (role === 'kids_professor') {
      setLocation('/kids-teach');
    } else if (role === 'institutional_admin') {
      setLocation('/institucional-dashboard');
    } else if (role === 'institutional_professor' || role === 'profesor_vista') {
      setLocation('/institucional-teach');
    } else if (role === 'student' || u.institucionId) {
      setLocation('/city-dashboard');
    } else {
      setLocation('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--inst-peach)] flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Video game intro overlay */}
      <AnimatePresence>
        {showIntro && pendingData && (
          <GameIntro userName={pendingData.u?.nombre || 'Ingeniero'} onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Blueprint grid bg */}
      <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(var(--inst-mauve) 1px, transparent 1px), linear-gradient(90deg, var(--inst-mauve) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* Sparks */}
      <Sparks />

      {/* Scan line */}
      <motion.div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--inst-blue)]/20 to-transparent pointer-events-none"
        initial={{ top: '0%' }} animate={{ top: '100%' }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />

      {/* Ambience */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[var(--inst-rose)]/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[var(--inst-salmon)]/20 blur-[180px] rounded-full pointer-events-none" />

      {/* ── Central card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ rotateY: 2, rotateX: -1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md perspective-1000"
      >
        {/* Corner frame */}
        {['-top-1 -left-1 border-t-2 border-l-2 border-[var(--inst-blue)]/30 rounded-tl-3xl',
          '-top-1 -right-1 border-t-2 border-r-2 border-[var(--inst-blue)]/30 rounded-tr-3xl',
          '-bottom-1 -left-1 border-b-2 border-l-2 border-[var(--inst-blue)]/20 rounded-bl-3xl',
          '-bottom-1 -right-1 border-b-2 border-r-2 border-[var(--inst-blue)]/20 rounded-br-3xl'
        ].map((cls, i) => (
          <div key={i} className={`absolute w-8 h-8 ${cls} pointer-events-none`} />
        ))}

        <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(3,4,94,0.12)] ring-1 ring-black/5">
          {/* Top accent bar — animated */}
          <motion.div className="h-[4px] w-full"
            style={{ background: 'linear-gradient(90deg, var(--inst-blue), var(--inst-cyan), var(--inst-purple), var(--inst-blue))', backgroundSize: '300% 100%' }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />

          <div className="px-9 pt-4 pb-10 space-y-7">

            {/* Crane scene */}
            <CraneScene focusedField={focused} />

            {/* Title */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--inst-blue)]/5 border border-[var(--inst-blue)]/10 rounded-full">
                <Building2 className="w-3.5 h-3.5 text-[var(--inst-blue)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--inst-blue)]">Nivel Institucional Portafolio</span>
              </div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--inst-navy)] leading-tight">
                Construye el <span className="text-[var(--inst-blue)]">Mañana</span> <span className="text-[var(--inst-purple)]">Digital</span>
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <PremiumInput
                icon={Mail} type="email" placeholder="correo@institucion.edu"
                value={email} onChange={setEmail}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                focused={focused === 'email'} accentColor="orange" required
              />
              <PremiumInput
                icon={Lock} type="password" placeholder="Contraseña"
                value={password} onChange={setPassword}
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                focused={focused === 'password'} accentColor="cyan" required
              />

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-xs font-bold text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit — animated gradient border shimmer */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="relative w-full h-16 rounded-2xl font-black italic uppercase tracking-[0.2em] text-white overflow-hidden disabled:opacity-70 shadow-2xl transition-all"
                style={{ background: 'linear-gradient(135deg, var(--inst-blue) 0%, var(--inst-purple) 100%)' }}
              >
                {/* Continuous shimmer wave */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
                />
                <span className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Construyendo acceso...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-5 h-5" />
                      Entrar a la Ciudad
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                        <ChevronRight className="w-5 h-5" />
                      </motion.span>
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Footer */}
            <div className="flex flex-col items-center gap-3">
              <button onClick={onSwitchToNormal}
                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--inst-slate)]/60 hover:text-[var(--inst-rose)] transition-colors">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                Volver al acceso estudiantil
              </button>
              <div className="flex items-center gap-6 mt-1">
                <button 
                  onClick={() => setLocation('/ayuda')}
                  className="text-[9px] font-black uppercase tracking-widest text-[var(--inst-blue)]/50 hover:text-[var(--inst-blue)] transition-all"
                >
                  Soporte Técnico
                </button>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic">
                  Registro por Invitación
                </p>
              </div>
              <div className="w-full h-px bg-[var(--inst-mauve)]/10" />
              <div className="flex items-center gap-2">
                <Wifi className="w-2.5 h-2.5 text-[var(--inst-rose)] animate-pulse" />
                <p className="text-[9px] text-[var(--inst-slate)]/40 font-black uppercase tracking-widest leading-none">Plataforma Genia · Protocolo 4.0 · 2026</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

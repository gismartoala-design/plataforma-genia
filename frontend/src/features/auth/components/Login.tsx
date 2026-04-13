import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Rocket, Lock, AtSign, Eye, EyeOff, Sparkles, Zap, GraduationCap, Terminal, Fingerprint, ShieldCheck, Cpu, Database, Network, Globe, Activity, AlertTriangle, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from '../services/auth.api';
import { Seo } from "@/components/common/Seo";
import { cn } from "@/lib/utils";

interface LoginProps {
  onLogin: (role: "student" | "admin" | "professor" | "superadmin" | "kids" | "kids_professor" | "institutional_admin" | "institutional_professor" | "profesor_vista" | "profesor_latam" | "estudiante_latam", name: string, id: string, planId?: number, accessToken?: string, institucionId?: number, roleId?: number, cursoId?: number) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Campos incompletos", description: "Por favor ingresa usuario y contraseña.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login({ email: username, password });
      const user = data.user;
      const roleMap: Record<number, string> = {
        1: "admin",
        2: "professor",
        3: "student",
        6: "kids",
        7: "kids_professor",
        8: "institutional_admin",
        9: "institutional_professor",
        10: "student"
      };
      const role = roleMap[user.roleId] || "student";

      const u = user as any;
      onLogin(role as any, u.nombre || "", String(u.id), u.planId || 0, data.access_token, u.institucionId || undefined, u.roleId, u.cursoId);

      let targetPath = "/dashboard";
      if (role === "admin") targetPath = "/admin";
      else if (role === "professor") targetPath = "/teach";
      else if (role === "kids_professor") targetPath = "/kids-teach";
      else if (role === "institutional_admin") targetPath = "/institucional-dashboard";
      else if (role === "institutional_professor") targetPath = "/institucional-teach";
      else if (u.institucionId) targetPath = "/city-dashboard";

      setLocation(targetPath);
      toast({ title: "¡Bienvenido!", description: `Iniciando sesión...` });
    } catch (error: any) {
      const errorData = error?.response?.data || error?.data || {};
      if (errorData?.code === 'ACCOUNT_SUSPENDED' || error?.message?.includes('ACCOUNT_SUSPENDED') || errorData?.message?.includes('suspendida')) {
        setSuspended(true);
      } else {
        toast({ title: "Error de acceso", description: "Credenciales inválidas o error de conexión.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#020617] selection:bg-cyan-500/30">

      {/* --- SUSPENSION OVERLAY --- */}
      <AnimatePresence>
        {suspended && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full max-w-lg"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-red-500/10 blur-[100px] rounded-full" />

              <div className="relative bg-slate-900/90 border border-red-500/30 rounded-[2.5rem] p-10 text-center space-y-8 shadow-[0_0_80px_rgba(239,68,68,0.15)]">
                {/* Icon */}
                <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/40 rounded-3xl flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-3xl blur-xl animate-pulse" />
                  <AlertTriangle className="w-10 h-10 text-red-400 relative z-10" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/70">Estado del Sistema</p>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">
                    Plataforma <br />
                    <span className="text-red-400">Suspendida</span>
                  </h2>
                </div>

                {/* Message */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-left space-y-1">
                  <p className="text-slate-300 text-sm font-medium leading-relaxed">
                    Su acceso ha sido <strong className="text-red-400">suspendido por falta de pago</strong>. Para regularizar su situación y recuperar el acceso, por favor comuníquese con el área de <strong className="text-white">Contabilidad</strong>.
                  </p>
                </div>

                {/* Contact CTA */}
                <div className="flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <PhoneCall className="w-5 h-5 text-cyan-400 shrink-0" />
                  <p className="text-sm font-bold text-slate-300">
                    Área de <span className="text-cyan-400">Contabilidad</span>
                  </p>
                </div>

                {/* Footer */}
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                  Muchas gracias por su atención
                </p>

                <button
                  onClick={() => setSuspended(false)}
                  className="text-slate-600 text-xs hover:text-slate-400 transition-colors underline"
                >
                  Volver al inicio
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Seo
        title="Plataforma Genios Bot"
        description="Accede a la Plataforma Genios Bot, el ecosistema educativo líder para el aprendizaje de tecnología, programación y robótica gamificada. Entra ahora en academy.argsoft.tech."
        keywords="Plataforma Genios Bot, Plataforma de Genios Bot, academy.argsoft.tech, Genios Bot Academy, Genios Bot Login"
      />

      {/* --- TECH BACKGROUND LAYER --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic Circuit Grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34, 211, 238, 0.4) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Animated Flux Lines (Technical Circuits) */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <pattern id="tech-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M0 100 H40 L60 80 H100 M120 40 V80 L140 100 H200 M60 200 V160 L80 140 H140" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="0.5" />
            <circle cx="40" cy="100" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
            <circle cx="140" cy="100" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
            <circle cx="120" cy="40" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#tech-pattern)" />
        </svg>

        {/* Floating Digital Data Streams */}
        <div className="absolute inset-y-0 left-10 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute inset-y-0 right-10 w-px bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />

        {/* Large Tech Accents */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] border border-cyan-500/10 rounded-full opacity-20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[800px] h-[800px] border border-purple-500/10 rounded-full opacity-20"
        >
          <div className="absolute top-1/2 left-0 w-full h-px bg-purple-500/20 blur-sm" />
        </motion.div>

        {/* Interactive Matrix Blur Orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, -60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full"
        />
      </div>

      {/* --- LOGIN INTERFACE --- */}
      <div className="relative z-10 w-full max-w-[1100px] px-6 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden">

          {/* Left Side: Branding (Info & Stats) */}
          <div className="hidden lg:flex flex-col justify-between p-12 md:p-16 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/5 relative overflow-hidden text-left border-r border-white/5">
            {/* Background Glows for Left Pane */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />

            <div className="relative z-10 space-y-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <Cpu className="w-6 h-6 text-cyan-400" />
                  </div>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 px-3 py-0.5 uppercase tracking-[0.2em] font-black text-[9px] bg-cyan-400/5">
                    Sistemas en Línea
                  </Badge>
                </div>

                <h1 className="text-5xl lg:text-6xl font-black tracking-tighter italic leading-none mb-8 text-white uppercase">
                  PLATAFORMA <br />
                  GENIOS <span className="text-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">BOT</span>
                </h1>

                <p className="text-slate-400 text-base font-medium max-w-sm leading-relaxed border-l border-cyan-500/30 pl-6">
                  Acceso al ecosistema líder para el desarrollo de talento tecnológico y robótica gamificada.
                </p>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { label: 'Estado', value: 'Encriptado', icon: ShieldCheck, color: 'text-emerald-500' },
                  { label: 'Red', value: 'ARG_NET', icon: Network, color: 'text-cyan-500' },
                  { label: 'Uptime', value: '99.98%', icon: Activity, color: 'text-purple-500' },
                  { label: 'Nodos', value: '1,420+', icon: Globe, color: 'text-blue-500' }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                    <stat.icon className={cn("w-4 h-4 mb-2 opacity-40 group-hover:opacity-100 transition-opacity", stat.color)} />
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
                    <p className="text-sm font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Micro Footer for Left Pane */}
            <div className="relative z-10 pt-10 flex items-center gap-3">
              <Database className="w-3 h-3 text-slate-700" />
              <span className="text-[7px] font-bold text-slate-700 uppercase tracking-[0.3em]">Protocolo Asegurado</span>
            </div>
          </div>

          {/* Right Side: Identity Verification Panel */}
          <div className="p-8 md:p-14 lg:p-16 flex flex-col justify-center bg-slate-900/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md mx-auto"
            >
              {/* Header / Identity Icon */}
              <div className="text-center mb-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative group/icon"
                >
                  <Fingerprint className="w-8 h-8 text-white group-hover/icon:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-700" />
                </motion.div>
                <h2 className="text-2xl font-black uppercase tracking-widest italic text-white flex items-center justify-center gap-3">
                  <Terminal className="w-5 h-5 text-cyan-500" /> Sincronización
                </h2>
                <div className="mt-2 text-slate-500 font-bold uppercase text-[9px] tracking-[0.3rem]">Autenticación Requerida</div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Credential: Email */}
                <div className="space-y-3 group/field">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within/field:text-cyan-500 transition-colors">Correo Electrónico</label>
                    <AtSign className="w-3 h-3 text-slate-800 group-focus-within/field:text-cyan-500" />
                  </div>
                  <div className="relative">
                    <Input
                      placeholder="usuario@geniosbot.com"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-14 bg-slate-950/40 border-white/10 text-white placeholder:text-slate-800 focus:bg-slate-950/80 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-500 rounded-xl px-5 font-mono text-sm tracking-wider"
                      required
                    />
                  </div>
                </div>

                {/* Credential: Keyphrase */}
                <div className="space-y-3 group/field">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within/field:text-purple-500 transition-colors">Contraseña</label>
                    <Lock className="w-3 h-3 text-slate-800 group-focus-within/field:text-purple-500" />
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 bg-slate-950/40 border-white/10 text-white placeholder:text-slate-800 focus:bg-slate-950/80 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all duration-500 rounded-xl px-5 font-mono text-sm tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white border-0 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-2xl shadow-cyan-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/btn"
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          SINCRONIZANDO...
                        </motion.div>
                      ) : (
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                          INICIAR SESIÓN <Rocket className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>

                {/* Ecosystem Selector */}
                <div className="pt-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Acceso a Ecosistemas</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setLocation("/login-kids")}
                      className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-cyan-500/30 transition-all group"
                    >
                      <Zap className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">KIDS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation("/instituciones-login")}
                      className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-purple-500/30 transition-all group"
                    >
                      <GraduationCap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">COLEGIOS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation("/latam-login")}
                      className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                    >
                      <Rocket className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">LATAM</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- FOOTER CREDITS --- */}
      <footer className="absolute bottom-6 left-0 w-full px-12 flex flex-col md:flex-row justify-between items-center z-20 pointer-events-none gap-2">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Plataforma desarrollada por INTUIT</p>
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">© 2026 ArgSoft - Derechos Reservados</p>
      </footer>
    </div>
  );
}

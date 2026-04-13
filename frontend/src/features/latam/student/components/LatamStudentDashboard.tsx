
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Target, 
  Zap, 
  ChevronRight, 
  Star, 
  Trophy,
  Layout,
  Cpu,
  Gamepad2,
  Code2,
  Database,
  BrainCircuit,
  Terminal,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Home,
  Briefcase,
  Award,
  FlaskConical,
  Coins,
  ShoppingBag,
  Package,
  LogOut
} from 'lucide-react';
import { SkinShopModal } from './SkinShopModal';
import { LevelDetailsModal } from './LevelDetailsModal';
import { LatamDynamicViewer } from './LatamDynamicViewer';
import { PixelWorld } from './PixelWorld';
import apiClient from '@/services/api.client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import '../../styles/LatamTheme.css';


// Building2 is defined as a function for hoisting.
function Building2({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
  );
}

// Mock Data for the Experience
const LEVELS = [
  {
    id: 1,
    title: "Exploradores Tecnológicos",
    ageRange: "7 - 10 años",
    description: "Iniciación en lógica de programación y creación de entornos digitales.",
    badgeClass: "latam-badge-level-1",
    companies: [
      { id: 'c1', name: "Game Creators Company", mission: "Diseña tu primer videojuego multijugador.", icon: Gamepad2, progress: 100, status: 'completed' },
      { id: 'c2', name: "AI Explorers Lab", mission: "Entrena modelos básicos de visión artificial.", icon: BrainCircuit, progress: 45, status: 'active' },
      { id: 'c3', name: "App Builders Studio", mission: "Construye interfaces para dispositivos móviles.", icon: Layout, progress: 0, status: 'locked' },
    ]
  },
  {
    id: 2,
    title: "Constructores de Software",
    ageRange: "11 - 14 años",
    description: "Desarrollo de lógica avanzada y arquitectura de sistemas básicos.",
    badgeClass: "latam-badge-level-2",
    companies: [
      { id: 'c4', name: "Python Developers Hub", mission: "Automatiza tareas reales con scripts profesionales.", icon: Terminal, progress: 0, status: 'locked' },
      { id: 'c5', name: "Data Builders Logic", mission: "Gestiona y visualiza grandes volúmenes de datos.", icon: Database, progress: 0, status: 'locked' },
    ]
  },
  {
    id: 3,
    title: "Innovadores Tecnológicos",
    ageRange: "15 - 22 años",
    description: "Soluciones empresariales escalables con Inteligencia Artificial.",
    badgeClass: "latam-badge-level-3",
    companies: [
      { id: 'c6', name: "AI Innovation Center", mission: "Sistemas expertos y redes neuronales profundas.", icon: Cpu, progress: 0, status: 'locked' },
      { id: 'c7', name: "Software Development Corp", mission: "Arquitecturas en la nube y despliegue continuo.", icon: Code2, progress: 0, status: 'locked' },
    ]
  }
];

const DEFAULT_LATAM_LEVELS = [
  { id: 1, tituloNivel: "S1: Tu primer día en la Compañía", status: "unlocked", porcentajeCompletado: 100 },
  { id: 1001, tituloNivel: "S2: Las instrucciones del juego", status: "unlocked", porcentajeCompletado: 0 },
  { id: 1002, tituloNivel: "S3: Próximamente...", status: "locked", porcentajeCompletado: 0 },
];

export const LatamStudentDashboard = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [activeDynamicLevel, setActiveDynamicLevel] = useState<any | null>(null); // For dynamic viewer
  const [showShop, setShowShop] = useState(false);
  const [showRPGWorld, setShowRPGWorld] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'classic' | 'rpg'>('rpg');


  const fetchData = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setLevels(DEFAULT_LATAM_LEVELS);
        return;
      }

      const [statsRes, levelsRes] = await Promise.all([
        apiClient.get<any>(`/api/student/${user.id}/gamification`).catch(() => null),
        apiClient.get<any[]>(`/api/student/${user.id}/modules`).catch(() => []) 
      ]);
      
      if (statsRes) setStats(statsRes);

      const backendLevels = (levelsRes && levelsRes.length > 0) ? (levelsRes[0].levels || []) : [];
      
      if (backendLevels.length > 0) {
        setLevels(backendLevels);
      } else {
        setLevels(DEFAULT_LATAM_LEVELS);
      }
    } catch (error) {
      console.error("Dashboard Fallback:", error);
      setLevels(DEFAULT_LATAM_LEVELS);
    } finally {
      setLoading(false);
      // Final guarantee: ensure levels are never empty
      setLevels(prev => prev && prev.length > 0 ? prev : DEFAULT_LATAM_LEVELS);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [user.id]);

  const selectedLevelData = levels.find(l => l.id === selectedLevelId);

  return (
    <div className="min-h-screen latam-gradient-bg flex flex-col font-sans mb-20 md:mb-0">
      <div className="absolute inset-0 latam-grid-overlay pointer-events-none" />

      {/* Professional Header / Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Rocket className="text-white w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Genios LATAM</h1>
            </div>
            
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar compañías o retos..." 
                className="bg-transparent border-none outline-none text-xs font-medium w-48"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6">
              {/* Geniomonedas Display */}
              <button 
                onClick={() => setShowShop(true)}
                className="flex items-center gap-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 rounded-2xl px-4 py-2 transition-all group"
              >
                <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <Coins className="text-amber-500 w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest leading-none mb-0.5">Geniomonedas</p>
                  <p className="text-sm font-black text-slate-800 leading-none">{stats?.geniomonedas || 0}</p>
                </div>
                <ShoppingBag className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-all ml-2" />
              </button>

              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nivel de Trayectoria</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-600 uppercase">Explorador Senior</span>
                  <div className="flex gap-0.5">
                    <Star className="w-3 h-3 text-blue-600 fill-current" />
                    <Star className="w-3 h-3 text-blue-600 fill-current" />
                    <Star className="w-3 h-3 text-slate-200" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onLogout}
                className="w-10 h-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-10 relative z-10">
        
        {/* RPG World View - Now shows a preview card, not embedded */}
        {viewMode === 'rpg' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
               <div>
                 <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none mb-1">
                   Sede <span className="text-blue-600">Corporativa Latam</span>
                 </h2>
                 <p className="text-sm text-slate-500 font-medium">Tu mundo interactivo de trabajo y aprendizaje.</p>
               </div>
            </div>
            {/* Fullscreen launcher card */}
            <div
              onClick={() => setShowRPGWorld(true)}
              className="relative w-full h-[320px] rounded-[2rem] overflow-hidden cursor-pointer group border-2 border-slate-200 hover:border-blue-400 transition-colors"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
            >
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
              {/* Level previews */}
              {levels.slice(0, 3).map((level, i) => (
                <div key={i} className="absolute" style={{
                  left: `${20 + i * 30}%`,
                  top: `${20 + (i % 2) * 15}%`,
                  transform: 'translate(-50%, -50%)'
                }}>
                  <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2"
                    style={{
                      background: ['#1d4ed8','#065f46','#7c3aed'][i % 3],
                      borderColor: ['#60a5fa','#34d399','#a78bfa'][i % 3],
                      boxShadow: `0 0 20px ${['rgba(29,78,216,0.4)','rgba(6,95,70,0.4)','rgba(124,58,237,0.4)'][i % 3]}`
                    }}>
                    <Building2 className="w-7 h-7 mb-1" style={{ color: ['#60a5fa','#34d399','#a78bfa'][i % 3] }} />
                    <p className="text-[7px] font-black uppercase text-center px-1 leading-tight text-white/80">{level.tituloNivel}</p>
                  </div>
                </div>
              ))}
              {/* Overlay and CTA */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-sm text-slate-900 group-hover:scale-105 transition-transform"
                  style={{ background: '#60a5fa', boxShadow: '0 0 30px rgba(96,165,250,0.4)' }}>
                  <Gamepad2 className="w-5 h-5" />
                  ENTRAR AL MUNDO CORPORATIVO
                  <ChevronRight className="w-4 h-4" />
                </div>
                <p className="text-slate-400 text-xs font-medium">{levels.length} sedes disponibles · WASD para moverte</p>
              </div>
            </div>
          </section>
        )}

        {/* Fullscreen RPG World */}
        {showRPGWorld && (
          <PixelWorld
            user={user}
            levels={levels}
            onSelectLevel={(id) => { setSelectedLevelId(id); setShowRPGWorld(false); }}
            onClose={() => setShowRPGWorld(false)}
          />
        )}

        {/* Career Path / Levels Selection - Only in classic mode */}
        {viewMode === 'classic' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mi Trayectoria Profesional</h2>
                 <p className="text-slate-500 font-medium">Progresa a través de los niveles para desbloquear nuevas compañías tecnológicas.</p>
               </div>
                <div className="bg-white p-1.5 rounded-2xl border border-slate-100 flex gap-1 shadow-sm">
                  {levels.map((lvl, index) => (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedLevelId(lvl.id)}
                      className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                        selectedLevelId === lvl.id 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                          : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                      )}
                    >
                      Nivel {index + 1}
                    </button>
                  ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLevelId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid md:grid-cols-3 gap-6"
              >
                <div className="md:col-span-2 space-y-4">
                  <div className={cn("inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-blue-100 text-blue-700")}>
                    {selectedLevelData?.tituloNivel || "Exploración de Campo"}
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight">
                    Especialízate en <br/> <span className="latam-text-gradient">Innovación LATAM</span>
                  </h3>
                  <p className="text-slate-600 font-medium max-w-xl">Supera las misiones técnicas para ascender en la jerarquía de Academy.</p>
                </div>
                <div className="flex items-end justify-end pb-4">
                  <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                       <Trophy className="text-emerald-500 w-6 h-6" />
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Proyectos</p>
                       <p className="text-xl font-bold text-slate-800">12 / 24</p>
                     </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </section>
        )}

        {/* Company Simulation Cards */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">
              {viewMode === 'rpg' ? 'Detalles de Sede' : 'Compañías Disponibles'}
            </h4>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {levels.map((level, i) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedLevelId(level.id)}
                className={cn(
                  "latam-card flex flex-col p-8 gap-6 group cursor-pointer h-full relative overflow-hidden",
                  level.status === 'locked' && "opacity-60 grayscale cursor-not-allowed border-slate-100"
                )}
              >
                {level.completado && (
                   <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-full">
                     <ShieldCheck className="w-4 h-4" />
                   </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-50 group-hover:scale-110 transition-transform duration-500">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    ID: {level.id}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-1">
                    {level.id === 1 || level.tituloNivel?.includes('S1') ? 'Sesión 01' : 
                     level.id === 1001 || level.tituloNivel?.includes('S2') ? 'Sesión 02' : 'Nivel Especial'}
                  </div>
                  <h5 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {level.tituloNivel}
                  </h5>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Misión de Academy: Supera las fases de {level.tituloNivel}
                  </p>
                </div>

                <div className="mt-auto space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Progreso de Nivel</span>
                    <span className="text-blue-600">{level.porcentajeCompletado || 0}%</span>
                  </div>
                  <Progress value={level.porcentajeCompletado || 0} className="h-1.5 bg-slate-100" />
                  
                  <Button 
                    className="w-full h-10 rounded-xl font-bold flex items-center justify-center gap-2 latam-btn-primary"
                    onClick={() => setActiveDynamicLevel(level)}
                  >
                    Abrir Sesión
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>

                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Labs Hub Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-violet-600" />
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">Hub de Laboratorios</h4>
            </div>
            <span className="text-xs text-slate-400 font-medium">6 herramientas disponibles</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Scratch', icon: Layout, color: 'bg-amber-500', url: 'https://scratch.mit.edu/' },
              { name: 'Python', icon: Code2, color: 'bg-blue-600', url: 'https://trinket.io/python/run' },
              { name: 'Arduino', icon: Cpu, color: 'bg-teal-600', url: 'https://www.tinkercad.com/' },
              { name: 'AI Studio', icon: BrainCircuit, color: 'bg-purple-600', url: 'https://teachablemachine.withgoogle.com/' },
              { name: 'Data Lab', icon: Database, color: 'bg-emerald-600', url: 'https://colab.research.google.com/' },
              { name: 'Robótica', icon: Gamepad2, color: 'bg-red-500', url: 'https://www.webots.cloud/' },
            ].map((lab, i) => (
              <motion.a
                key={i}
                href={lab.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="latam-card bg-white p-4 flex flex-col items-center gap-3 text-center group hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-md", lab.color)}>
                  <lab.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700 group-hover:text-blue-600 transition-colors">{lab.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Abrir Lab</p>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Global Stats / Quick Actions */}
        <section className="bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden text-white">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
           <div className="relative z-10 grid md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <Target className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-xl font-bold">Resumen de Carrera</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Has completado 3 retos empresariales esta semana. ¡Vas por buen camino para el ascenso!
                </p>
              </div>

              <div className="flex flex-col justify-center gap-2">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>Nivel de Innovación</span>
                    <span>72%</span>
                 </div>
                 <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "72%" }}
                      className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    />
                 </div>
                 <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-2">Próximo Hito: Certificación Senior</p>
              </div>

              <div className="flex items-center justify-center">
                 <Button className="bg-white text-slate-900 hover:bg-slate-100 px-8 h-12 rounded-2xl font-black uppercase tracking-widest text-xs group active:scale-95 transition-all">
                    Ver Mi Portafolio
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>
           </div>
        </section>

      </main>

      {/* Floating Bottom Info (Optional/Mobile) */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 flex justify-around">
        <button className="flex flex-col items-center gap-1 text-blue-600">
          <Home className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase">Inicio</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Briefcase className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase">Proyectos</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Award className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase">Títulos</span>
        </button>
      </footer>
      {showShop && (
        <SkinShopModal 
            studentId={user.id} 
            onClose={() => setShowShop(false)} 
            onSkinEquipped={fetchData} 
        />
      )}
      {selectedLevelId && (
        <LevelDetailsModal 
          level={levels.find(l => l.id === selectedLevelId)} 
          onClose={() => setSelectedLevelId(null)} 
        />
      )}
      {activeDynamicLevel && (
        <LatamDynamicViewer
          level={activeDynamicLevel}
          onClose={() => setActiveDynamicLevel(null)}
        />
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  FileSearch,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  Mail,
  Filter,
  Download,
  Plus,
  X,
  Code,
  Bot,
  Cpu,
  FlaskConical,
  Layers,
  Zap,
  Save,
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
  Trash2,
  PenTool,
  LogOut,
  ArrowRight,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { professorApi, LatamCompania, ProfessorCourse } from '@/features/professor/services/professor.api';
import { toast } from '@/hooks/use-toast';
import '../../styles/LatamTheme.css';

// ─── Lab Tools Registry ────────────────────────────────────────────────────
import { ActivityCreatorModal } from './ActivityCreatorModal';
import { CandidatesList } from './CandidatesList';
import { LatamStudentsPanel } from './LatamStudentsPanel';
// ─── Laboratory Viewer ──────────────────────────────────────────────────────
import { LaboratoryViewer } from './LaboratoryViewer';


export const LAB_TOOLS_DASHBOARD = [
  { id: 'scratch', name: 'Scratch Studio', icon: Layers, color: 'bg-amber-500', desc: 'Programación visual por bloques', url: 'https://scratch.mit.edu/projects/editor/?tutorial=getstarted', embed: true },
  { id: 'gdevelop', name: 'GDevelop IDE', icon: Code, color: 'bg-blue-600', desc: 'Desarrollo de videojuegos 2D/3D', url: 'https://editor.gdevelop.io/', embed: true },
  { id: 'arduino', name: 'Arduino Lab', icon: Cpu, color: 'bg-teal-600', desc: 'Simulador de circuitos y código', url: 'https://wokwi.com/projects/new/arduino-uno', embed: true },
  { id: 'ai', name: 'AI Studio', icon: Bot, color: 'bg-purple-600', desc: 'Laboratorio de Inteligencia Artificial', url: 'https://teachablemachine.withgoogle.com/train/image', embed: true },
  { id: 'data', name: 'Data Lab', icon: BarChart3, color: 'bg-emerald-600', desc: 'Análisis y visualización de datos', url: 'https://colab.research.google.com/', embed: false },
  { id: 'robotics', name: 'Robótica 3D', icon: FlaskConical, color: 'bg-red-500', desc: 'Simulación de robots y mecatrónica', url: 'https://www.webots.cloud/', embed: false },
];

// ─── Main Teacher Dashboard ────────────────────────────────────────────────
export const LatamTeacherDashboard = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [tab, setTab] = useState('candidates');
  const [showCreator, setShowCreator] = useState(false);
  const [creatorInitialCourse, setCreatorInitialCourse] = useState<number | null>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [activeCourse, setActiveCourse] = useState<ProfessorCourse | null>(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseData, setNewCourseData] = useState({ nombre: '', companiaId: '' });
  const [activeLab, setActiveLab] = useState<any>(null);
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);

  const [courses, setCourses] = useState<ProfessorCourse[]>([]);
  const [companies, setCompanies] = useState<LatamCompania[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleStatus, setGoogleStatus] = useState({ linked: !!user?.googleEmail, email: user?.googleEmail });

  const refreshModules = async () => {
    try {
      const modulesData = await professorApi.getModules(user?.id || '1');
      setModules(modulesData);
    } catch (error) {
      console.error('Error refreshing modules:', error);
    }
  };

  const handleDeleteSession = async (moduleId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.')) return;
    try {
      await professorApi.deleteModule(moduleId);
      toast({ title: 'Sesión Eliminada', description: 'La sesión se eliminó correctamente.' });
      await refreshModules();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar la sesión.', variant: 'destructive' });
    }
  };

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, companiesData, studentsData] = await Promise.all([
          professorApi.getProfessorCourses(user?.id || '1'),
          professorApi.getLatamCompanies(),
          professorApi.getLatamStudents(user?.id || '1')
        ]);
        setCourses(coursesData);
        setCompanies(companiesData);
        setCandidates(studentsData);
        await refreshModules();
      } catch (error) {
        console.error('Error loading Latam data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  const handleLinkGoogle = async () => {
    const email = prompt('Ingresa tu correo de Google para vincular:');
    if (!email) return;
    try {
      await professorApi.linkGoogleAccount(user?.id || '1', email);
      setGoogleStatus({ linked: true, email });
      toast({ title: 'Google vinculado', description: `Se ha vinculado la cuenta ${email}` });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo vincular la cuenta de Google', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen latam-gradient-bg flex flex-col font-sans">
      <div className="absolute inset-0 latam-grid-overlay pointer-events-none" />
      {showCreator && (
        <ActivityCreatorModal 
          user={user} 
          onClose={() => { 
            setShowCreator(false); 
            setCreatorInitialCourse(null); 
            setEditingModule(null);
          }} 
          onSuccess={refreshModules}
          courses={courses} 
          googleStatus={googleStatus} 
          initialCourseId={creatorInitialCourse}
          editingModule={editingModule}
        />
      )}
      <AnimatePresence>
        {showCreateCourse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[var(--inst-navy)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative">
              <button onClick={() => setShowCreateCourse(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400"/></button>
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Nuevo Sector</span>
                <h2 className="text-2xl font-black italic mt-1 text-slate-800">Crear Curso LATAM</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre del Curso</label>
                  <Input 
                    value={newCourseData.nombre} 
                    onChange={e => setNewCourseData({...newCourseData, nombre: e.target.value})} 
                    className="h-12 bg-slate-50 font-bold" 
                    placeholder="Ej: Programación Básica" 
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vincular a Compañía Malla LATAM</label>
                  <select 
                    value={newCourseData.companiaId}
                    onChange={e => setNewCourseData({...newCourseData, companiaId: e.target.value})}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Seleccionar Compañía Central --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} ({c.especializacion})</option>
                    ))}
                  </select>
                </div>
                <Button 
                  onClick={async () => {
                    if (!newCourseData.nombre || !newCourseData.companiaId) {
                      toast({ title: 'Error', description: 'Complete todos los campos', variant: 'destructive' });
                      return;
                    }
                    try {
                      const newCourse = await professorApi.createCourse({ 
                        professorId: user?.id || 1, 
                        nombre: newCourseData.nombre,
                        companiaId: Number(newCourseData.companiaId)
                      });
                      setCourses([...courses, newCourse]);
                      toast({ title: 'Curso creado', description: `Curso listo para asignar retos.` });
                      setShowCreateCourse(false);
                      setNewCourseData({ nombre: '', companiaId: '' });
                    } catch (e) {
                      toast({ title: 'Error', description: 'No se pudo crear el curso', variant: 'destructive' });
                    }
                  }}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 mt-4 font-black uppercase tracking-widest text-xs"
                >
                  Confirmar Creación
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeLab && <LaboratoryViewer lab={activeLab} onClose={() => setActiveLab(null)} />}
      </AnimatePresence>

      {/* Header */}
      <header className="relative bg-gradient-to-br from-indigo-950 via-[#0A0B1A] to-blue-950 text-white px-8 py-8 z-10 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[150%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-cyan-400 mb-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] drop-shadow-md">LATAM Academy · Management</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter italic">
              Centro de <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">Innovación</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Talento Activo', value: '128', color: 'text-white' },
                { label: 'Retos Activos', value: '14', color: 'text-emerald-400' },
                { label: 'Pendiente Revisión', value: '12', color: 'text-orange-400' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                  <p className={cn("text-xl font-black", kpi.color)}>{kpi.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleLinkGoogle}
                variant="outline"
                className={cn(
                  "h-12 gap-2 rounded-2xl font-bold border-white/20 transition-all",
                  googleStatus.linked ? "text-emerald-400 border-emerald-400/50 bg-emerald-400/5" : "text-slate-300 hover:text-white"
                )}
              >
                <Mail className="w-4 h-4" />
                {googleStatus.linked ? `Conectado: ${googleStatus.email}` : 'Vincular Google'}
              </Button>
              <Button
                onClick={() => setShowCreator(true)}
                className="h-12 gap-2 bg-blue-600 hover:bg-blue-700 latam-glow-blue rounded-2xl font-bold"
              >
                <Plus className="w-4 h-4" />
                Crear Reto
              </Button>
              <Button
                onClick={onLogout}
                variant="ghost"
                className="h-12 gap-2 rounded-2xl font-bold text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-8 relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-8">
          {[
            { key: 'candidates', label: 'Candidatos', icon: Users },
            { key: 'students',   label: 'Estudiantes', icon: Target },
            { key: 'courses',    label: 'Mis Cursos',  icon: BookOpen },
          ].map((t) => (

            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "pb-4 text-sm font-bold tracking-tight transition-all relative flex items-center gap-2",
                tab === t.key ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {tab === t.key && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Candidates Tab */} 
          {tab === 'candidates' && (
            <motion.div key="candidates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <CandidatesList candidates={candidates} expandedCandidate={expandedCandidate} setExpandedCandidate={setExpandedCandidate} />
            </motion.div>
          )}

          {/* Students Tab */}
          {tab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <LatamStudentsPanel courses={courses} professorId={user?.id?.toString() || '1'} />
            </motion.div>
          )}


          {/* Courses Tab */}
          {tab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {!activeCourse ? (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Gestión de <span className="text-blue-600">Cursos Academy</span></h2>
                      <p className="text-slate-500 text-sm mt-1">Ingresa a tus cursos para gestionar o crear sesiones.</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setNewCourseData({ nombre: '', companiaId: companies[0]?.id ? String(companies[0].id) : '' });
                        setShowCreateCourse(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2 font-bold latam-glow-blue"
                    >
                      <Plus className="w-4 h-4" /> Nuevo Curso
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.length === 0 ? (
                      <div className="col-span-full latam-card bg-white/50 p-12 text-center border-dashed">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="font-bold text-slate-400">No tienes cursos asignados.</p>
                        <p className="text-xs text-slate-300">Comienza creando uno para organizar a tus talentos.</p>
                      </div>
                    ) : (
                      courses.map((course, i) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="latam-card bg-white p-6 space-y-4 hover:border-blue-300 group transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-blue-600 transition-colors">
                              <BookOpen className="w-5 h-5 text-blue-600 group-hover:text-white" />
                            </div>
                            <button className="text-slate-300 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{course.nombre}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                                {course.compania?.nombre || 'Sin Compañía'}
                              </span>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Users className="w-3 h-3" />
                              <span className="text-[10px] font-bold">Portal del Curso</span>
                            </div>
                            <Button 
                              onClick={() => setActiveCourse(course)}
                              className="h-9 px-4 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                              Entrar <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" onClick={() => setActiveCourse(null)} className="rounded-xl h-12 w-12 p-0 border-slate-200 hover:bg-slate-50 text-slate-500">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                      </Button>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Portal Activo</p>
                        <h2 className="text-2xl font-black text-slate-900 italic tracking-tighter">{activeCourse.nombre}</h2>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setCreatorInitialCourse(activeCourse.id);
                        setShowCreator(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl h-12 px-6 shadow-lg shadow-blue-500/20 font-black uppercase tracking-wider text-[10px]"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Nueva Sesión
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.filter(m => m.cursoId === activeCourse.id).length === 0 ? (
                      <div className="col-span-full latam-card bg-slate-50 p-12 text-center border-dashed">
                        <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="font-bold text-slate-500">Este curso no tiene sesiones configuradas.</p>
                        <p className="text-sm text-slate-400 mt-1">Presiona "Nueva Sesión" para inyectar un reto LATAM.</p>
                      </div>
                    ) : (
                      modules.filter(m => m.cursoId === activeCourse.id).map((mod, i) => {
                        const firstLevel = mod.levels?.[0];
                        let latamProps = null;
                        if (firstLevel && firstLevel.descripcion) {
                          try { latamProps = JSON.parse(firstLevel.descripcion); } catch(e){}
                        }
                        
                        return (
                          <motion.div
                            key={mod.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-3xl p-6 border shadow-sm border-slate-100 hover:border-blue-300 transition-all flex flex-col group overflow-hidden relative"
                          >
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                               <Target className="w-24 h-24 text-blue-600 -mr-6 -mt-6" />
                             </div>

                             <div className="flex items-center justify-between relative z-10 mb-4">
                               <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                 {latamProps?.metadata?.tipoFlujo || 'Módulo Abierto'}
                               </span>
                               <div className="flex gap-1">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setEditingModule(mod); setShowCreator(true); }}
                                   className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-colors border-none bg-transparent"
                                 >
                                   <PenTool className="w-3.5 h-3.5" />
                                 </button>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleDeleteSession(mod.id); }}
                                   className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border-none bg-transparent"
                                 >
                                   <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                               </div>
                               <span className="text-[10px] font-bold text-slate-400">{mod.duracionDias}d max</span>
                             </div>

                             <div className="relative z-10 flex-1">
                               <h4 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                                 {mod.nombreModulo}
                               </h4>
                               <p className="text-xs text-slate-500 font-medium">
                                 {latamProps?.metadata?.codigo || `MOD-${mod.id}`} / Software: {latamProps?.metadata?.software || 'Libre'}
                               </p>
                             </div>

                             <div className="relative z-10 mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex gap-2">
                                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center" title="Exploradores">
                                     <Users className="w-4 h-4 text-slate-400" />
                                   </div>
                                   {latamProps?.logro?.insignia && (
                                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100" title="Insignia Habilitada">
                                        <Crown className="w-4 h-4 text-amber-500" />
                                      </div>
                                   )}
                                </div>
                                <Button variant="ghost" className="h-8 px-2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50">
                                  Activar <Zap className="w-3 h-3 ml-1" />
                                </Button>
                             </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}




        </AnimatePresence>
      </main>
    </div>
  );
};

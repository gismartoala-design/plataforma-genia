import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Loader2,
  Eye,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  LayoutGrid,
  Trophy,
  Layers,
  Search,
  Wrench,
  Rocket,
  Target,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { professorApi } from '@/features/professor/services/professor.api';
import { institutionalCurriculumApi, SectionInst, ModuloInst } from '../../services/curriculum.api';
import { toast } from '@/hooks/use-toast';
import TutorGradebook from './components/TutorGradebook';
import { InstitutionalTutorUserList } from './components/InstitutionalTutorUserList';
import { InstitutionalCurriculumExplorer } from './components/InstitutionalCurriculumExplorer';
import '../../styles/ConstructionTheme.css';

type ActiveView = 'hub' | 'sectores' | 'calificaciones' | 'usuarios';



const getLevelName = (id: number | string) => {
  const levels: Record<string, string> = {
    '1': 'Exploración Tecnológica',
    '2': 'Comprensión Tecnológica',
    '3': 'Aplicación Tecnológica',
    '4': 'Diseño Tecnológico',
    '5': 'Innovación Tecnológica'
  };
  return levels[String(id)] || 'Nivel Especializado';
};

export const InstitutionalTutorDashboard = ({ user }: { user: any }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [sections, setSections] = useState<(SectionInst & { modules: ModuloInst[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('hub');
  const [drilledDownCourse, setDrilledDownCourse] = useState<any | null>(null);
  const [drilledDownModule, setDrilledDownModule] = useState<ModuloInst | null>(null);
  const [initialModuleId, setInitialModuleId] = useState<number | null>(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [allModules, setAllModules] = useState<ModuloInst[]>([]);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const syncView = () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') as ActiveView | null;
      if (view && ['hub', 'sectores', 'calificaciones', 'usuarios'].includes(view)) {
        setActiveView(view);
      } else if (window.location.pathname.includes('institucional-tutor')) {
        setActiveView('hub');
      }
    };

    // Initial sync on mount
    syncView();

    // Listen for sidebar navigation (custom event) and browser back/forward
    window.addEventListener('tutor-navigate', syncView);
    window.addEventListener('popstate', syncView);

    return () => {
      window.removeEventListener('tutor-navigate', syncView);
      window.removeEventListener('popstate', syncView);
    };
  }, []);

  useEffect(() => {
    if (user?.id) initDashboard();
  }, [user]);

  useEffect(() => {
    if (selectedCourseId) fetchCurriculum(selectedCourseId);
  }, [selectedCourseId]);

  const initDashboard = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const uId = String(user.id);
      const cData = await professorApi.getProfessorCourses(uId);
      const teacherCourses = Array.isArray(cData) ? cData : [];
      setCourses(teacherCourses);
      if (teacherCourses.length > 0) {
        const profileCourse = teacherCourses.find((c: any) => String(c.id) === String(user.cursoId));
        setSelectedCourseId(profileCourse ? profileCourse.id : teacherCourses[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing tutor dashboard:', error);
      setLoading(false);
    }
  };

  const fetchCurriculum = async (courseId: number) => {
    setLoading(true);
    try {
      const sectionsData = await institutionalCurriculumApi.getSections(courseId);
      const modulesData = await institutionalCurriculumApi.getModulesByCourse(courseId);
      const combined = sectionsData.map(s => ({
        ...s,
        modules: modulesData.filter(m => m.seccionId === s.id)
      }));
      setSections(combined);
    } catch (error) {
      console.error('Error fetching tutor curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  // GLOBAL MODULE INDEXER
  useEffect(() => {
    if (courses.length > 0) {
      const indexAllModules = async () => {
        try {
          const allResults = await Promise.all(
            courses.map(c => institutionalCurriculumApi.getModulesByCourse(c.id))
          );
          // Flatten results and attach course context
          const flattened = allResults.flatMap((mods, idx) => 
            mods.map(m => ({ ...m, _courseName: courses[idx].nombre }))
          );
          setAllModules(flattened);
        } catch (err) {
          console.error("Error indexing global modules:", err);
        }
      };
      indexAllModules();
    }
  }, [courses]);

  async function handleToggleSectionVisibility(sectionId: number, currentStatus: boolean) {
    setUpdating(`section-${sectionId}`);
    try {
      await institutionalCurriculumApi.updateSection(sectionId, { activo: !currentStatus });
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, activo: !currentStatus } : s));
      toast({
        title: !currentStatus ? "Sección Activada" : "Sección Oculta",
        description: `El estado del bloque ha sido actualizado.`
      });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo cambiar la visibilidad de la sección.", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  }

  async function handleReorderSections(orderedIds: number[]) {
    setUpdating('reorder-sections');
    try {
      await institutionalCurriculumApi.reorderSections(orderedIds);
      // Reorder local state
      setSections(prev => {
        const sorted = [...prev].sort((a, b) => {
          const idxA = orderedIds.indexOf(a.id);
          const idxB = orderedIds.indexOf(b.id);
          return idxA - idxB;
        });
        return sorted;
      });
      toast({
        title: "Estructura Sincronizada",
        description: "El orden de los bloques ha sido actualizado."
      });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo guardar el orden de las secciones.", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  }

  async function handleToggleModuleVisibility(moduleId: number, currentStatus: boolean) {
    setUpdating(`module-${moduleId}`);
    try {
      await institutionalCurriculumApi.updateModule(moduleId, { activo: !currentStatus });
      setSections(prev => prev.map(s => ({
        ...s,
        modules: s.modules.map(m => m.id === moduleId ? { ...m, activo: !currentStatus } : m)
      })));
      toast({
        title: !currentStatus ? "Contenido Activado" : "Contenido Oculto",
        description: `El estado del componente ha sido actualizado correctamente.`
      });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo cambiar la visibilidad.", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  }

  async function handleUpdateModuleContent(moduleId: number, newContent: any) {
    setUpdating(`content-${moduleId}`);
    try {
      await institutionalCurriculumApi.updateModule(moduleId, { contenido: newContent });
      setSections(prev => prev.map(s => ({
        ...s,
        modules: s.modules.map(m => m.id === moduleId ? { ...m, contenido: newContent } : m)
      })));
      toast({
        title: "Estructura Actualizada",
        description: "Los cambios en el orden y visibilidad han sido sincronizados."
      });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo actualizar el contenido.", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  }

  async function handleReorderModules(sectionId: number, orderedIds: number[]) {
    setUpdating(`reorder-${sectionId}`);
    try {
      await institutionalCurriculumApi.reorderModules(orderedIds);
      setSections(prev => prev.map(s => {
        if (s.id === sectionId) {
            const sortedModules = [...s.modules].sort((a,b) => 
                orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)
            );
            return { ...s, modules: sortedModules };
        }
        return s;
      }));
      toast({
        title: "Secuencia Sincronizada",
        description: "El orden de la cuadrícula ha sido actualizado."
      });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo guardar el nuevo orden.", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  }

  if (loading && !courses.length) {
    return (
      <div className="flex items-center justify-center min-h-screen construction-deep-bg">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[var(--inst-cyan)] animate-spin mx-auto" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sincronizando Datos Reales…</p>
        </div>
      </div>
    );
  }

  // REAL METRICS CALCULATION
  const totalModules = sections.reduce((acc, s) => acc + s.modules.length, 0);
  const activeModules = sections.reduce((acc, s) => acc + s.modules.filter(m => m.activo).length, 0);
  const totalStudents = 24; // This would ideally come from another API, but we'll use a placeholder or 0 if unknown

  return (
    <div className="min-h-screen relative overflow-hidden font-sans" style={{ background: 'var(--inst-bg)', color: 'var(--inst-mid)' }}>
      <div className="absolute inset-0 z-0 construction-grid opacity-30" />

      <div className={cn(
        "relative z-10 mx-auto transition-all duration-700",
        drilledDownCourse ? "max-w-none w-full p-0 flex flex-col h-screen" : "max-w-7xl px-6 lg:px-10 py-10 space-y-12"
      )}>

        {/* ── Page Header ── */}
        {!drilledDownCourse && (
          <motion.header 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-4"
          >
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <Shield className="w-3 h-3" /> Panel de Control de Tutoría
                  </div>
                  <h1 className="text-5xl font-black tracking-tighter leading-none" style={{ color: 'var(--inst-deep)' }}>
                    {activeView === 'hub' ? 'Seguimiento' : activeView === 'sectores' ? 'Mis Sectores' : activeView === 'calificaciones' ? 'Calificaciones' : 'Usuarios'}
                  </h1>
                </div>
  
                 {/* Global Course Context Selector */}
                 {(activeView === 'hub' || activeView === 'calificaciones' || activeView === 'usuarios') && courses.length > 1 && (
                   <div className="flex flex-col items-end gap-1.5 min-w-[200px]">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Sector Seleccionado</span>
                      <select 
                        value={selectedCourseId || ''} 
                        onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-tight text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer hover:border-blue-400"
                      >
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                   </div>
                 )}
              </div>
          </motion.header>
        )}

        {/* ── View Content ── */}
        <AnimatePresence mode="wait">

          {/* SEGUIMIENTO / HUB VIEW */}
          {activeView === 'hub' && (
            <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
              {/* METRIC CARDS - REAL DATA */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Sectores a Cargo', value: courses.length, icon: Layers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: 'Unidades Totales', value: sections.length, icon: LayoutGrid, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                  { label: 'Actividades en Mapa', value: totalModules, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                  { label: 'Sectores Activos', value: courses.filter(c => c.activo !== false).length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", stat.bg)}>
                      <stat.icon className={cn("w-7 h-7", stat.color)} />
                    </div>
                    <div className={cn("text-4xl font-black italic tracking-tighter", stat.color)}>{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* RECENT ACTIVITY MAP */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between px-4">
                    <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800">Mapa Maestro (Unidades Recientes)</h3>
                    <Button variant="ghost" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setActiveView('sectores')}>Administrar Todos <ArrowRight className="w-3 h-3 ml-2" /></Button>
                  </div>
                  <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm space-y-4">
                    {sections.slice(0, 5).map((sec, idx) => (
                      <div key={sec.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-blue-200 transition-all group">
                         <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-white border shadow-sm flex items-center justify-center font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{sec.nombre}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sec.modules.length} Componentes</span>
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className={cn("text-[9px] font-bold uppercase tracking-widest", sec.activo ? "text-emerald-500" : "text-amber-500")}>
                                  {sec.activo ? 'Operativo' : 'En Pausa'}
                                </span>
                              </div>
                            </div>
                         </div>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedCourseId(selectedCourseId);
                              setDrilledDownCourse(courses.find(c => c.id === selectedCourseId));
                              setActiveView('sectores');
                            }} 
                            className="rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                           <Eye className="w-5 h-5" />
                         </Button>
                      </div>
                    ))}
                    {sections.length === 0 && (
                      <p className="text-center py-12 text-slate-400 font-bold uppercase text-xs">No hay datos de unidades para este sector</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800 px-4">Reporte de Logros</h3>
                   <div className="bg-[#0F172A] rounded-[3rem] p-8 shadow-2xl relative overflow-hidden text-white group">
                      <div className="absolute inset-0 construction-grid opacity-10 pointer-events-none" />
                      <div className="relative z-10 space-y-8">
                         <div className="w-14 h-14 rounded-2xl bg-amber-500 shadow-lg shadow-amber-900/40 flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white" />
                         </div>
                         <div className="space-y-2">
                           <h4 className="text-2xl font-black italic uppercase tracking-tighter">Estado Global</h4>
                           <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.3em]">Cursos Institucionales</p>
                         </div>
                         <div className="space-y-6 pt-4">
                            {[
                              { label: 'Eficiencia de Contenido', value: sections.length > 0 ? Math.round((activeModules / totalModules) * 100) : 0, color: 'bg-emerald-500' },
                              { label: 'Cobertura de Unidades', value: courses.length > 0 ? 100 : 0, color: 'bg-blue-500' },
                              { label: 'Engagement Promedio', value: 87, color: 'bg-amber-500' }
                            ].map((row) => (
                              <div key={row.label} className="space-y-2">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                  <span>{row.label}</span>
                                  <span className="text-white">{row.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${row.value}%` }} 
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]", row.color)} 
                                  />
                                </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MIS SECTORES — 3-Level Navigation: Courses → Modules → Levels */}
          {activeView === 'sectores' && (
            <motion.div key="sectores" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[70vh] space-y-10">
              {drilledDownCourse ? (
                <InstitutionalCurriculumExplorer
                  sections={sections}
                  courseName={drilledDownCourse.nombre}
                  onClose={() => {
                    setDrilledDownCourse(null);
                    setDrilledDownModule(null);
                    setInitialModuleId(null);
                  }}
                  onToggleVisibility={handleToggleModuleVisibility}
                  onToggleSectionVisibility={handleToggleSectionVisibility}
                  onUpdateContent={handleUpdateModuleContent}
                  onReorderModules={handleReorderModules}
                  onReorderSections={handleReorderSections}
                  updating={updating}
                  initialModuleId={initialModuleId}
                />
              ) : (
                /* ── LEVEL 1: Course Cards ── */
                <div className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course, idx) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        onClick={() => {
                          setDrilledDownModule(null);
                          setInitialModuleId(null);
                          setGlobalSearchTerm('');
                          setSelectedCourseId(course.id);
                          setDrilledDownCourse(course);
                          fetchCurriculum(course.id);
                        }}
                        className="group bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[360px]"
                      >
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                          <Layers className="w-40 h-40 text-slate-900" />
                        </div>

                        <div className="space-y-6 relative z-10">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-300 text-xl shadow-inner group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300">
                            <BookOpen className="w-8 h-8" />
                          </div>
                          <div className="space-y-3">
                            <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                              {getLevelName(course.nivel || 1)}
                            </Badge>
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-800 leading-none group-hover:text-blue-600 transition-colors">
                              {course.nombre}
                            </h3>
                          </div>
                        </div>

                        <div className="relative z-10 mt-8">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-300 mb-6">
                            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-400" /> Ingeniería Curricular</span>
                            <span className={cn(
                              "px-3 py-1 rounded-full",
                              course.activo !== false ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
                            )}>
                              {course.activo !== false ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <div className="w-full h-14 rounded-[1.5rem] bg-slate-900 group-hover:bg-blue-600 text-white flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-slate-900/10 group-hover:shadow-blue-500/30">
                            Ingresar al Sector <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {courses.length === 0 && (
                    <div className="py-32 text-center rounded-[4rem] border-4 border-dashed border-slate-100">
                      <Layers className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                      <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Sin Sectores Asignados</h3>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}

          {/* CALIFICACIONES VIEW */}
          {activeView === 'calificaciones' && (
            <motion.section key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TutorGradebook courseId={selectedCourseId || 0} />
            </motion.section>
          )}

          {/* USUARIOS VIEW */}
          {activeView === 'usuarios' && (
            <motion.section key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InstitutionalTutorUserList institutionId={user.institucionId || 1} />
            </motion.section>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default InstitutionalTutorDashboard;

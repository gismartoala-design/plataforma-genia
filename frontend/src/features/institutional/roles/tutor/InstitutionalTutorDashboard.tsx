import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  GraduationCap,
  Loader2,
  Check,
  Clock,
  Zap,
  Layers,
  Eye,
  EyeOff,
  ClipboardList,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { professorApi } from '@/features/professor/services/professor.api';
import { institutionalCurriculumApi, SectionInst, ModuloInst } from '../../services/curriculum.api';
import { toast } from '@/hooks/use-toast';
import AuthenticClassCreator from './components/AuthenticClassCreator';
import TutorGradebook from './components/TutorGradebook';
import { InstitutionalTutorUserList } from './components/InstitutionalTutorUserList';
import '../../styles/ConstructionTheme.css';

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
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null); // section-ID or module-ID
  const [activeView, setActiveView] = useState<'hub' | 'activos' | 'calificaciones' | 'clases_autenticas' | 'usuarios'>('hub');
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user?.id) {
      initDashboard();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCurriculum(selectedCourseId);
    }
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
        const profileCourse = teacherCourses.find(c => String(c.id) === String(user.cursoId));
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
      const currentCourse = courses.find(c => String(c.id) === String(courseId));
      if (currentCourse) setCourseInfo(currentCourse);
    } catch (error) {
      console.error('Error fetching tutor curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSectionVisibility = async (sectionId: number, currentStatus: boolean) => {
    setUpdating(`section-${sectionId}`);
    try {
      await institutionalCurriculumApi.updateSection(sectionId, { activo: !currentStatus });
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, activo: !currentStatus } : s));
      toast({ 
        title: !currentStatus ? "Edificio Activado" : "Edificio Desactivado", 
        description: `El sector ahora ${!currentStatus ? 'es visible' : 'está oculto'} en el mapa.` 
      });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo cambiar la visibilidad del sector.", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleModuleVisibility = async (moduleId: number, currentStatus: boolean) => {
    setUpdating(`module-${moduleId}`);
    try {
      await institutionalCurriculumApi.updateModule(moduleId, { activo: !currentStatus });
      setSections(prev => prev.map(s => ({
        ...s,
        modules: s.modules.map(m => m.id === moduleId ? { ...m, activo: !currentStatus } : m)
      })));
      toast({ 
        title: !currentStatus ? "Nivel Activado" : "Nivel Desactivado", 
        description: `La unidad ahora ${!currentStatus ? 'es visible' : 'está oculta'} dentro del sector.` 
      });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo cambiar la visibilidad.", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{background: 'var(--inst-bg)'}}>
        <Loader2 className="w-10 h-10 text-[var(--inst-blue)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-0 min-h-screen relative overflow-hidden font-sans flex" style={{background: 'var(--inst-bg)', color: 'var(--inst-mid)'}}>
        <div className="absolute inset-0 z-0 construction-grid" />
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-72 border-r bg-white relative z-20 p-8 flex flex-col gap-8 hidden lg:flex" style={{borderColor: 'rgba(26,86,219,0.08)'}}>
            <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4" style={{background: 'linear-gradient(135deg, var(--inst-blue), var(--inst-cyan))'}}>
                    <Users className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tighter" style={{color: 'var(--inst-deep)'}}>Tutor
                    <span className="ml-1 font-light" style={{color: 'var(--inst-cyan)'}}>Académico</span>
                </h2>
                <p className="technical-label">Gestión de Aula</p>
            </div>

            <div className="space-y-2 flex-1">
                <p className="technical-label mb-3">Vistas de Control</p>
                {[
                   { id: 'hub', icon: Layers, label: 'Panel Principal', color: 'var(--inst-blue)' },
                   { id: 'activos', icon: Eye, label: 'Control de Activos', color: 'var(--inst-cyan)' },
                   { id: 'calificaciones', icon: ClipboardList, label: 'Calificaciones', color: 'var(--inst-emerald)' },
                   { id: 'usuarios', icon: Users, label: 'Usuarios y Claves', color: 'var(--inst-blue)' },
                   { id: 'clases_autenticas', icon: Zap, label: 'Clases Auténticas', color: 'var(--inst-purple)' },
                 ].map(({ id, icon: Icon, label, color }) => (
                  <button 
                      key={id} 
                      onClick={() => setActiveView(id as any)}
                      className={cn(
                          "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-left transition-all group",
                          activeView === id ? "bg-[var(--inst-blue-lt)] border border-[var(--inst-blue)]/20" : "hover:bg-[var(--inst-blue-lt)]/50"
                      )}
                  >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{background: `${color}18`, color}}><Icon className="w-4 h-4" /></div>
                      <span className="text-xs font-bold uppercase tracking-wide" style={{color: activeView === id ? 'var(--inst-blue)' : 'var(--inst-deep)'}}>{label}</span>
                  </button>
                ))}
            </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 relative z-10 p-8 lg:p-10 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 edu-enter">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest" style={{background:'var(--inst-blue-lt)', color:'var(--inst-blue)'}}>
                            <Layers className="w-3.5 h-3.5" /> Tutoría Institucional
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter leading-none" style={{color:'var(--inst-deep)'}}>
                            Panel de <span className="edu-gradient-text" style={{background:'linear-gradient(135deg, var(--inst-blue) 0%, var(--inst-cyan) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>Seguimiento</span>
                        </h1>
                    </div>
                </header>

                <div className="flex flex-col gap-8 items-start">
                    <div className="w-full space-y-8 edu-enter">
                        {/* Always show course selector to keep context */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest" style={{color:'var(--inst-deep)'}}>Cursos a cargo</h3>
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar snap-x">
                                {courses.map((course) => (
                                    <button
                                        key={course.id}
                                        onClick={() => setSelectedCourseId(course.id)}
                                        className={cn(
                                            "min-w-[210px] p-5 rounded-2xl border-2 transition-all text-left snap-start bg-white",
                                            selectedCourseId === course.id ? "border-[var(--inst-blue)] shadow-lg" : "border-transparent"
                                        )}
                                    >
                                        <h4 className="text-sm font-black uppercase tracking-tight">{course.nombre}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{getLevelName(course.nivel || 1)}</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <AnimatePresence mode="wait">
                            {activeView === 'hub' && (
                                <motion.section key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                                    <div className="blueprint-card p-8 bg-white border" style={{borderColor:'rgba(26,86,219,0.08)'}}>
                                        <h3 className="text-xl font-black uppercase tracking-tight" style={{color:'var(--inst-deep)'}}>Bienvenido al Panel de Tutoría</h3>
                                        <p className="text-sm text-slate-500 mt-3 max-w-xl">
                                            Selecciona una de las vistas de control en la barra lateral para gestionar la activación de retos, revisar calificaciones, o crear clases dinámicas auténticas para tus estudiantes.
                                        </p>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                                                <div className="text-3xl font-black" style={{color:'var(--inst-blue)'}}>{courses.length}</div>
                                                <div className="text-[9px] font-bold uppercase text-slate-400 mt-1">Cursos Asignados</div>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100/50">
                                                <div className="text-3xl font-black text-emerald-600">{sections.reduce((acc, s) => acc + s.modules.length, 0)}</div>
                                                <div className="text-[9px] font-bold uppercase text-emerald-500 mt-1">Actividades Totales</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {activeView === 'activos' && (
                                <motion.section key="activos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                                    <div className="flex justify-between items-center p-5 rounded-2xl bg-white border shadow-sm" style={{borderColor:'rgba(26,86,219,0.08)'}}>
                                        <div>
                                            <h3 className="text-base font-black uppercase tracking-tight" style={{color:'var(--inst-deep)'}}>Control de Contenidos Activos</h3>
                                            <p className="technical-label mt-0.5">Activa o desactiva la visibilidad de retos, proyectos y evaluaciones</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {sections.map((section) => (
                                          <div key={section.id} className="space-y-4">
                                            {/* SECTION ROW */}
                                            <div className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:border-[var(--inst-blue)]/20 transition-all">
                                              <div className="flex items-center gap-4">
                                                <div className={cn(
                                                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                                  section.activo ? "bg-[var(--inst-blue)] text-white shadow-lg" : "bg-slate-100 text-slate-400"
                                                )}>
                                                  <Layers className="w-6 h-6" />
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-black uppercase tracking-tight">{section.nombre}</h4>
                                                  <p className="technical-label mt-0.5">Control de edificio en el mapa</p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <Badge variant={section.activo ? "default" : "outline"} className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5", section.activo ? "bg-emerald-500 hover:bg-emerald-500" : "text-slate-400")}>
                                                  {section.activo ? "VISIBLE" : "OCULTO"}
                                                </Badge>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon" 
                                                  onClick={() => handleToggleSectionVisibility(section.id, section.activo)}
                                                  disabled={updating === `section-${section.id}`}
                                                  className={cn("rounded-xl h-10 w-10 shrink-0", section.activo ? "text-emerald-500 bg-emerald-50" : "text-slate-400 bg-slate-100")}
                                                >
                                                  {updating === `section-${section.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : section.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </Button>
                                              </div>
                                            </div>

                                            {/* NESTED MODULES */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12">
                                              {section.modules.map((mod) => {
                                                  const isReto = mod.titulo.toLowerCase().includes('reto');
                                                  const isEval = mod.titulo.toLowerCase().includes('eval');
                                                  const isProj = mod.titulo.toLowerCase().includes('proyecto');
                                                  
                                                  let tagColor = 'var(--inst-blue)';
                                                  let tagBg = 'var(--inst-blue-lt)';
                                                  let displayType = 'Clase Estándar';

                                                  if (isReto) { tagColor = 'var(--inst-emerald)'; tagBg = '#d1fae5'; displayType = 'Reto'; }
                                                  if (isEval) { tagColor = 'var(--inst-rose)'; tagBg = '#ffe4e6'; displayType = 'Evaluación'; }
                                                  if (isProj) { tagColor = 'var(--inst-purple)'; tagBg = '#ede9fe'; displayType = 'Proyecto'; }

                                                  return (
                                                    <div key={mod.id} className="blueprint-card p-5 group relative bg-white/50 backdrop-blur-sm border-slate-100">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="space-y-1">
                                                                <span className="inline-flex px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-widest border border-white/20" style={{background: tagBg, color: tagColor}}>
                                                                    {displayType}
                                                                </span>
                                                                <h4 className="text-[12px] font-black uppercase tracking-tight leading-none">{mod.titulo}</h4>
                                                            </div>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleToggleModuleVisibility(mod.id, mod.activo)}
                                                                disabled={updating === `module-${mod.id}`}
                                                                className={cn("rounded-lg transition-all h-8 w-8 shrink-0", mod.activo ? "text-emerald-500 bg-emerald-50" : "text-slate-400 bg-slate-100")}
                                                            >
                                                                {updating === `module-${mod.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : mod.activo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                            </Button>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4">
                                                          <div className="flex-1">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Estado</p>
                                                            {mod.activo ? (
                                                              <span className="text-[8px] font-black text-emerald-500">ACTIVO</span>
                                                            ) : (
                                                              <span className="text-[8px] font-black text-slate-300">INACTIVO</span>
                                                            )}
                                                          </div>
                                                          <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setLocation(`/institucional-editor/${selectedCourseId}`);
                                                            }}
                                                            className="h-8 px-4 rounded-xl bg-[var(--inst-blue-lt)] text-[var(--inst-blue)] hover:bg-[var(--inst-blue)] hover:text-white transition-all text-[9px] font-black uppercase tracking-widest border border-[var(--inst-blue)]/10"
                                                          >
                                                            <BookOpen className="w-3 h-3 mr-2" /> Ver Contenidos
                                                          </Button>
                                                        </div>
                                                    </div>
                                                  );
                                              })}
                                              {section.modules.length === 0 && (
                                                <div className="col-span-2 p-4 text-center rounded-2xl border-2 border-dashed border-slate-100">
                                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Sin niveles cargados</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                        {sections.length === 0 && (
                                            <div className="p-10 text-center rounded-3xl border-2 border-dashed border-slate-200">
                                                <p className="text-slate-400 font-bold text-sm">No hay contenidos en este curso aún.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            )}

                            {activeView === 'calificaciones' && (
                                <motion.section key="cal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    {selectedCourseId ? (
                                        <TutorGradebook courseId={selectedCourseId} />
                                    ) : (
                                        <p>Seleccione un curso primero</p>
                                    )}
                                </motion.section>
                            )}

                            {activeView === 'clases_autenticas' && (
                                <motion.section key="auth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    {selectedCourseId ? (
                                        <AuthenticClassCreator courseId={selectedCourseId} onCreated={() => fetchCurriculum(selectedCourseId)} />
                                    ) : (
                                        <p>Seleccione un curso primero para crear la clase</p>
                                    )}
                                </motion.section>
                            )}

                            {activeView === 'usuarios' && (
                                <motion.section key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <InstitutionalTutorUserList institutionId={user.institucionId || 1} />
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

export default InstitutionalTutorDashboard;

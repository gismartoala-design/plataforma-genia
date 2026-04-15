import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Loader2,
  Trophy,
  Activity,
  Award,
  Settings,
  Plus,
  Trash2,
  Check,
  TrendingUp,
  Clock,
  Zap,
  Layers,
  ArrowLeft,
  X,
  Edit2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { institutionApi } from '@/services/institution.api';
import { institutionalCurriculumApi, ModuloInst } from '@/features/institutional/services/curriculum.api';
import { professorApi } from '@/features/professor/services/professor.api';
import { useLocation } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
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

const getLevelClass = (id: number | string) => {
  const classes: Record<string, string> = {
    '1': 'construction-level-1',
    '2': 'construction-level-2',
    '3': 'construction-level-3',
    '4': 'construction-level-4',
    '5': 'construction-level-5'
  };
  return classes[String(id)] || 'bg-slate-500/10 text-slate-400';
};


export const InstitutionalTeacherDashboard = ({ user }: { user: any }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'section' | 'module'>('section');
  const [newModule, setNewModule] = useState({ nombre: '', duracion: 30 });
  const [creating, setCreating] = useState(false);
    const [renamingSectionId, setRenamingSectionId] = useState<number | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [sections, setSections] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [courseInfo, setCourseInfo] = useState<any>(null);
    const [sectionInfo, setSectionInfo] = useState<any>(null);
    const [allModules, setAllModules] = useState<ModuloInst[]>([]);
    const [, setLocation] = useLocation();

  useEffect(() => {
    if (user?.id) {
      initDashboard();
    }
  }, [user?.id]);

  const initDashboard = async () => {
    setLoading(true);
    try {
        const data = await professorApi.getProfessorCourses(user.id);
        setCourses(data || []);
        const mods = await institutionalCurriculumApi.getModulesByCourse(0); // Dummy or fetch all relevant
        setAllModules(mods);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSections = async (cId: number | string) => {
        try {
            const data = await institutionalCurriculumApi.getSections(Number(cId));
            setSections(data);
            const course = courses.find(c => c.id === Number(cId));
            if (course) setCourseInfo(course);
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };


  const handleCreateModule = async () => {
    if (!newModule.nombre) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      if (dialogType === 'section') {
        if (!selectedCourseId) return;
        await institutionApi.createSection({
          nombre: newModule.nombre,
          cursoId: Number(selectedCourseId),
          orden: sections.length + 1
        });
        toast({ title: "Éxito", description: "Módulo creado correctamente" });
        fetchSections(selectedCourseId);
      } else {
        // Nivel creation handled in Editor now
        return;
      }

      setIsDialogOpen(false);
      setNewModule({ nombre: '', duracion: 30 });
    } catch (error) {
      console.error('Error in creation:', error);
      toast({ title: "Error", description: "No se pudo realizar la creación", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSection = async (sectionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar este módulo/unidad y todas sus lecciones?')) return;
    try {
      await institutionalCurriculumApi.deleteSection(sectionId);
      setSections(sections.filter(s => s.id !== sectionId));
      toast({ title: "Éxito", description: "Módulo eliminado" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el módulo", variant: "destructive" });
    }
  };

  const handleRenameSection = async (sectionId: number, e?: React.FocusEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    if (!renameValue.trim()) { setRenamingSectionId(null); return; }
    try {
      await institutionalCurriculumApi.updateSection(sectionId, { nombre: renameValue.trim() });
      setSections(sections.map(s => s.id === sectionId ? { ...s, nombre: renameValue.trim() } : s));
      toast({ title: "Éxito", description: "Nombre actualizado" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo renombrar el módulo", variant: "destructive" });
    } finally {
      setRenamingSectionId(null);
      setRenameValue('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--inst-bg)' }}>
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[var(--inst-blue)]/20 border-t-[var(--inst-blue)] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-[var(--inst-blue)] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 min-h-screen relative overflow-hidden font-sans flex" style={{ background: 'var(--inst-bg)', color: 'var(--inst-mid)' }}>
      {/* Dot Grid Background */}
      <div className="absolute inset-0 z-0 construction-grid" />
      {/* Blue gradient blobs for depth */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, var(--inst-blue) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, var(--inst-purple) 0%, transparent 70%)' }} />


      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative z-10 p-8 lg:p-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* ── Header ── */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 edu-enter">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: 'var(--inst-blue-lt)', color: 'var(--inst-blue)' }}>
                <Activity className="w-3.5 h-3.5" /> Institución #{user?.institucionId || '001'}
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none" style={{ color: 'var(--inst-deep)' }}>
                Laboratorio <span className="edu-gradient-text">Curricular</span>
              </h1>
              <p className="text-sm font-medium" style={{ color: 'var(--inst-muted)' }}>
                Bienvenido, <strong style={{ color: 'var(--inst-deep)' }}>{user?.nombre?.split(' ')[0]}</strong> · {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 edu-enter-2">
              <Button
                variant="outline"
                onClick={() => toast({ title: "Malla Curricular", description: "Módulo de carga activado." })}
                className="h-12 px-6 rounded-2xl border-blue-100 text-[var(--inst-blue)] font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm"
              >
                <Layers className="w-4 h-4 mr-2" /> Malla
              </Button>
              <Button
                variant="outline"
                className="h-12 px-6 rounded-2xl border-emerald-100 text-[var(--inst-emerald)] font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm"
              >
                <TrendingUp className="w-4 h-4 mr-2" /> Reportes
              </Button>
              <div className="h-10 w-px bg-slate-100 mx-1" />
              <div className="flex items-center gap-3 p-2 rounded-2xl border bg-white" style={{ borderColor: 'rgba(26,86,219,0.1)' }}>
                <div className="px-4 py-2">
                  <p className="technical-label leading-none mb-1">Carga Actual</p>
                  <p className="text-sm font-black uppercase tracking-tight" style={{ color: 'var(--inst-deep)' }}>{sectionInfo?.nombre || courseInfo?.nombre || 'Sin selección'}</p>
                </div>
                {(selectedCourseId || selectedSectionId) && (
                  <button
                    onClick={() => {
                      setSelectedCourseId(null);
                    }}
                    className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-10 items-start">
            {/* ── Main Content Area ── */}
            <div className="w-full space-y-10 edu-enter">
              <AnimatePresence mode="wait">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogContent className="bg-white rounded-[3rem] p-0 overflow-hidden shadow-2xl border-none">
                    <DialogHeader className="p-12 border-b" style={{ background: 'var(--inst-blue-lt)', borderColor: 'rgba(26,86,219,0.1)' }}>
                      <DialogTitle className="text-4xl font-black tracking-tighter" style={{ color: 'var(--inst-deep)' }}>
                        {dialogType === 'section' ? 'Nuevo Módulo' : 'Nuevo Nivel'}
                      </DialogTitle>
                      <p className="technical-label mt-2">
                        {dialogType === 'section' ? `Agregando unidad a: ${courseInfo?.nombre}` : `Agregando lección a: ${sectionInfo?.nombre}`}
                      </p>
                    </DialogHeader>
                    <div className="p-12 space-y-8">
                      <div className="space-y-3">
                        <Label className="technical-label ml-1 text-xs">
                          {dialogType === 'section' ? 'Nombre del Módulo' : 'Nombre del Nivel'}
                        </Label>
                        <Input
                          value={newModule.nombre}
                          onChange={(e) => setNewModule({ ...newModule, nombre: e.target.value })}
                          placeholder={dialogType === 'section' ? "Ej: Introducción a la Robótica" : "Ej: Leyes de Newton"}
                          className="h-16 rounded-2xl font-bold px-7 border-2 focus:border-[var(--inst-blue)] transition-all bg-slate-50/50"
                        />
                      </div>
                    </div>
                    <DialogFooter className="p-12 pt-0">
                      <Button onClick={handleCreateModule} disabled={creating} className="w-full h-16 rounded-[2rem] text-white font-black uppercase tracking-[0.2em] shadow-xl text-sm" style={{ background: 'linear-gradient(135deg, var(--inst-blue), var(--inst-purple))' }}>
                        {creating ? 'Procesando...' : (dialogType === 'section' ? 'Crear Módulo' : 'Crear Nivel')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <motion.section
                  key="course-list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--inst-deep)' }}>Mis Obras Asignadas</h3>
                      <p className="technical-label">{courses.length} cursos bajo tu gestión curricular</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.length > 0 ? (
                      courses.map((course, idx) => (
                        <motion.button
                          key={course.id}
                          whileHover={{ y: -5, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setLocation(`/institucional-editor/${course.id}`)}
                          className="group p-8 rounded-[2.5rem] border-2 bg-white transition-all text-left relative overflow-hidden flex flex-col justify-between h-[220px] shadow-sm hover:shadow-xl hover:border-[var(--inst-blue)]"
                          style={{ borderColor: 'rgba(26,86,219,0.06)' }}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--inst-blue)] opacity-[0.03] rounded-bl-[5rem] -mr-10 -mt-10 transition-all group-hover:bg-[var(--inst-blue)] group-hover:opacity-[0.07]" />

                          <div className="space-y-4 relative z-10">
                            <div className="flex justify-end items-start w-full">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[var(--inst-blue-lt)] group-hover:text-[var(--inst-blue)] transition-all shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                              </div>
                            </div>
                            <h4 className="text-xl font-black uppercase tracking-tighter leading-none text-[var(--inst-deep)] group-hover:text-[var(--inst-blue)] transition-colors">{course.nombre}</h4>
                          </div>

                          <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                            <div className="flex items-center gap-2" style={{ color: 'var(--inst-muted)' }}>
                              <Users className="w-4 h-4" />
                              <span className="text-xs font-bold">{course.studentCount || 0} alumnos</span>
                            </div>
                            <div className="flex items-center gap-2 text-[var(--inst-blue)] opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                              <span className="text-[10px] font-black uppercase tracking-widest">Abrir Obra</span>
                              <ArrowLeft className="w-4 h-4 rotate-180" />
                            </div>
                          </div>
                        </motion.button>
                      ))
                    ) : (
                      <div className="col-span-full py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-blue-100 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 rounded-[2rem] bg-blue-50 flex items-center justify-center text-blue-400">
                          <Layers className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-800">No se detectan obras asignadas</h3>
                          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">Tu perfil de profesor aún no tiene cursos vinculados en el sistema central.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.section>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * Diálogo para gestionar asignaciones de estudiantes y vínculos con cursos
 */
const AssignmentDialog = ({ module, institutionId, onUpdate }: { module: any; institutionId: any; onUpdate: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchAssignmentData = async () => {
    setLoading(true);
    try {
      const usersRaw = await institutionApi.getInstitutionalUsers(Number(institutionId));
      const coursesRaw = await institutionApi.getCourses(Number(institutionId));

      const users = (usersRaw as any[]) || [];
      const allCourses = (coursesRaw as any[]) || [];

      const institutionalStudents = users.filter((u: any) => u.role === 'student' || u.roleId === 6 || u.roleId === 3);
      setStudents(institutionalStudents);
      setCourses(allCourses);
    } catch (error) {
      console.error('Error fetching assignment data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchAssignmentData();
  }, [isOpen]);

  const handleToggleStudent = async (studentId: number, isAssigned: boolean) => {
    setProcessingId(studentId);
    try {
      if (isAssigned) {
        await professorApi.unassignStudentFromModule(module.id, studentId);
        toast({ title: "Acceso Revocado", description: "El estudiante ya no tiene acceso a este módulo." });
      } else {
        await professorApi.assignStudentToModule(module.id, studentId);
        toast({ title: "Acceso Concedido", description: "El estudiante ahora puede ver este módulo en su ciudad." });
      }
      onUpdate();
      fetchAssignmentData();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo cambiar la asignación", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLinkToCourse = async (courseId: number) => {
    setProcessingId(courseId);
    try {
      await institutionApi.assignModuleToCourse(module.id, courseId);
      toast({ title: "Vínculo Actualizado", description: "El módulo se ha enlazado al curso seleccionado." });
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo vincular el curso", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-14 w-14 rounded-2xl border-blue-100 bg-white hover:bg-blue-50 text-[var(--inst-blue)] p-0 shadow-sm transition-all active:scale-95">
          <Users className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border rounded-[3rem] max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0 shadow-2xl" style={{ borderColor: 'rgba(26,86,219,0.1)' }}>
        <DialogHeader className="p-10 pb-6 bg-blue-50/30 border-b border-blue-50">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-4xl font-black tracking-tighter flex items-center gap-3 text-[var(--inst-deep)] leading-none">
                Alcance <span className="text-[var(--inst-blue)]">Académico</span>
              </DialogTitle>
              <DialogDescription className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                UNIDAD: {module.nombreModulo} • {module.isInstitutional ? 'SISTEMA INSTITUCIONAL' : 'CURRÍCULO ESTÁNDAR'}
              </DialogDescription>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shadow-sm">
              <Users className="w-8 h-8 text-[var(--inst-blue)]" />
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="students" className="flex-1 flex flex-col min-h-0">
          <div className="px-8 border-b" style={{ borderColor: 'rgba(26,86,219,0.08)' }}>
            <TabsList className="bg-transparent h-12 gap-8 border-none p-0">
              <TabsTrigger value="students" className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--inst-blue)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--inst-blue)] rounded-none h-full uppercase font-black text-[10px] tracking-widest px-0">
                Estudiantes
              </TabsTrigger>
              <TabsTrigger value="courses" className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--inst-emerald)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--inst-emerald)] rounded-none h-full uppercase font-black text-[10px] tracking-widest px-0">
                Sectores
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <TabsContent value="students" className="mt-0 outline-none space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  <p className="text-[10px] font-black uppercase text-slate-500">Cargando Personal...</p>
                </div>
              ) : students.length === 0 ? (
                <p className="text-center text-slate-500 py-12 uppercase font-black text-[10px]">No se encontraron estudiantes en la institución.</p>
              ) : (
                <div className="grid gap-3">
                  {(module?.cursoId ? students.filter((s: any) => s.cursoId === module.id) : students).map((student: any) => {
                    const isAssigned = module?.assignedStudentIds?.includes(student.id);
                    const isAssignedByCourse = module?.cursoId !== undefined && student.cursoId === module.cursoId;

                    return (
                      <div key={student.id} className="flex items-center justify-between p-5 bg-[var(--inst-peach)]/50 rounded-[2rem] border border-[var(--inst-mauve)]/5 hover:border-[var(--inst-rose)]/20 transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50/50 flex items-center justify-center font-black text-[var(--inst-blue)] border border-blue-50 uppercase shadow-sm group-hover:scale-110 transition-all">
                            {(student.nombre || "??").substring(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-[var(--inst-deep)] uppercase tracking-tight">{student.nombre}</p>
                              {isAssignedByCourse && (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase px-2 h-5">Vínculo Curricular</Badge>
                              )}
                            </div>
                            <p className="technical-label opacity-40 lowercase">{student.email}</p>
                          </div>
                        </div>
                        <Button
                          disabled={processingId === student.id || isAssignedByCourse}
                          onClick={() => handleToggleStudent(student.id, isAssigned)}
                          className={cn(
                            "h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm",
                            isAssigned || isAssignedByCourse
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-[var(--inst-blue)] text-white shadow-lg shadow-blue-500/10"
                          )}
                        >
                          {processingId === student.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (isAssigned || isAssignedByCourse) ? "Matriculado" : "Matricular"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="courses" className="mt-0 outline-none space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--inst-blue)' }} />
                  <p className="text-[10px] font-black uppercase" style={{ color: 'var(--inst-muted)' }}>Cargando cursos...</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="p-4 rounded-2xl mb-2" style={{ background: 'var(--inst-blue-lt)' }}>
                    <p className="text-[9px] font-semibold flex items-center gap-2" style={{ color: 'var(--inst-blue)' }}>
                      <Activity className="w-4 h-4 flex-shrink-0" /> Al vincular un módulo a un curso, todos los estudiantes de ese curso tendrán acceso automático.
                    </p>
                  </div>
                  {courses.map((course: any) => {
                    const isLinked = String(module.cursoId) === String(course.id);
                    return (
                      <div key={course.id} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all bg-white", isLinked ? "shadow-md" : "hover:shadow-sm")} style={isLinked ? { borderColor: 'var(--inst-blue)' } : { borderColor: 'rgba(26,86,219,0.07)' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isLinked ? 'var(--inst-blue-lt)' : 'rgba(26,86,219,0.04)', color: isLinked ? 'var(--inst-blue)' : 'var(--inst-muted)' }}>
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--inst-deep)' }}>{course.nombre}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--inst-muted)' }}>Nivel: {course.nivel || 'Técnico'}</p>
                          </div>
                        </div>
                        {isLinked ? (
                          <span className="edu-badge-primary">Vinculado</span>
                        ) : (
                          <Button
                            variant="outline"
                            disabled={processingId === course.id}
                            onClick={() => handleLinkToCourse(course.id)}
                            className="h-9 font-black uppercase text-[9px] rounded-xl border"
                            style={{ borderColor: 'rgba(26,86,219,0.2)', color: 'var(--inst-blue)' }}
                          >
                            {processingId === course.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Vincular'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InstitutionalTeacherDashboard;


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Plus, 
  Search, 
  Settings,
  MoreVertical,
  ChevronDown,
  Globe,
  GraduationCap,
  Trash2,
  Layers,
  Clock,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Info,
  ArrowLeft,
  Copy,
  Sparkles,
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Ticket,
  ClipboardCheck,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { institutionApi } from '@/services/institution.api';
import { toast } from '@/hooks/use-toast';
import { Toaster } from "@/components/ui/toaster";
import '../../styles/ConstructionTheme.css';

const LEVEL_NAMES: Record<string, string> = {
  '1': 'Nivel 1: Exploración Tecnológica',
  '2': 'Nivel 2: Comprensión Tecnológica',
  '3': 'Nivel 3: Aplicación Tecnológica',
  '4': 'Nivel 4: Diseño Tecnológico',
  '5': 'Nivel 5: Innovación Tecnológica'
};
const LEVEL_CLASSES: Record<string, string> = {
  '1': 'construction-level-1',
  '2': 'construction-level-2',
  '3': 'construction-level-3',
  '4': 'construction-level-4',
  '5': 'construction-level-5'
};

// ----- Sub-component: Activity Row (Formerly LessonRow) -----
function ActivityRow({ mod, professors, onRefresh, onDelete }: { mod: any; professors: any[]; onRefresh: () => void; onDelete: () => void }) {
  const [updating, setUpdating] = React.useState(false);

  const handleAssignProfessor = async (profId: string) => {
    setUpdating(true);
    try {
      await institutionApi.updateModule(mod.id, { profesorId: profId ? parseInt(profId) : null });
      toast({ title: 'Profesor asignado' });
      onRefresh();
    } catch {
      toast({ title: 'Error', description: 'No se pudo asignar el profesor.', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDuplicate = async () => {
    setUpdating(true);
    try {
      await institutionApi.cloneModule(mod.id);
      toast({ title: '✓ Actividad duplicada' });
      onRefresh();
    } catch {
      toast({ title: 'Error', description: 'No se pudo duplicar.', variant: 'destructive' });
    } finally { setUpdating(false); }
  };

  const assignedProf = professors.find(p => Number(p.id) === Number(mod.profesorId));

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-xl group/lesson" style={{borderColor:'rgba(26,86,219,0.06)'}}>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'var(--inst-blue-lt)', color:'var(--inst-blue)'}}>
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold truncate" style={{color:'var(--inst-deep)'}}>{mod.titulo || mod.nombreModulo}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="edu-badge-primary" style={{fontSize:'7px', padding:'1px 6px'}}>
              {mod.tipo || 'CONTENIDO'}
            </span>
            {assignedProf && (
              <span className="text-[8px] font-bold uppercase" style={{color:'var(--inst-emerald)'}}>
                <GraduationCap className="inline w-2.5 h-2.5 mr-1" /> {assignedProf.nombre.split(' ')[0]}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (window.location.href = `/institucional-editor/${mod.id}`)}
          className="h-7 px-2 rounded-lg text-[8px] font-black uppercase tracking-widest gap-1 border border-transparent hover:border-[var(--inst-blue)]/20 shadow-sm"
          style={{color:'var(--inst-blue)'}}
        >
          <Settings className="w-3 h-3" /> Editar
        </Button>
        
        <button
          onClick={handleDuplicate}
          disabled={updating}
          title="Duplicar actividad"
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover/lesson:opacity-100"
          style={{color:'var(--inst-muted)'}}
        >
          {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-300 hover:text-red-500 transition-all opacity-0 group-hover/lesson:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* INVITE BATCH MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800">Generar Lote de Invitaciones</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Crear links únicos para padres</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setShowInviteModal(false)} className="rounded-full">Cerrar</Button>
                </div>

                {generatedInvites.length === 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cantidad</label>
                        <Input 
                          type="number" 
                          value={inviteQuantity} 
                          onChange={(e) => setInviteQuantity(Number(e.target.value))}
                          className="h-14 rounded-2xl border-slate-100 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Grado / Curso</label>
                        <select 
                          value={inviteCourseId}
                          onChange={(e) => setInviteCourseId(e.target.value)}
                          className="w-full h-14 rounded-2xl border border-slate-100 bg-white px-4 font-bold text-sm outline-none"
                        >
                          <option value="">Seleccionar...</option>
                          {courses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                      </div>
                    </div>
                    <Button 
                      onClick={async () => {
                        if (!inviteCourseId) { toast({ title: 'Error', description: 'Seleccione un curso' }); return; }
                        setIsProcessingMassive(true);
                        try {
                          const res = await institutionApi.generateInvitations({
                            quantity: inviteQuantity,
                            institucionId: user.institucionId!,
                            cursoId: Number(inviteCourseId)
                          }) as any[];
                          setGeneratedInvites(res);
                        } finally {
                          setIsProcessingMassive(false);
                        }
                      }}
                      disabled={isProcessingMassive}
                      className="w-full h-16 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest"
                    >
                      {isProcessingMassive ? 'Generando...' : `Generar ${inviteQuantity} Invitaciones`}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 max-h-[300px] overflow-y-auto space-y-3 custom-scrollbar">
                      {generatedInvites.map((inv, idx) => {
                        const url = `${window.location.origin}/institucional/registro/${user.institucionId}?token=${inv.token}`;
                        return (
                          <div key={inv.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                            <span className="text-[10px] font-mono text-slate-500">{idx + 1}. {inv.token}</span>
                            <Button 
                              size="sm" variant="ghost" 
                              onClick={() => {
                                navigator.clipboard.writeText(url);
                                toast({ title: 'Link Copiado' });
                              }}
                              className="h-8 text-[9px] font-black uppercase text-purple-600"
                            >
                              Copiar Link
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <Button 
                      onClick={() => {
                        const allLinks = generatedInvites.map((inv, idx) => `${idx + 1}. ${window.location.origin}/institucional/registro/${user.institucionId}?token=${inv.token}`).join('\n');
                        navigator.clipboard.writeText(allLinks);
                        toast({ title: 'Todos los links copiados' });
                      }}
                      className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest"
                    >
                      Copiar Todos los Links
                    </Button>
                    <Button variant="ghost" onClick={() => setGeneratedInvites([])} className="w-full text-slate-400">Limpiar y Volver</Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----- Sub-component: Section Item (The "Units" from Academy Perspective) -----
function SectionItem({ section, professors, onRefresh }: { section: any; professors: any[]; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const data = await institutionApi.getSectionModules(section.id) as any; 
      setLessons(data || []);
    } catch { setLessons([]); } finally { setLoading(false); }
  };

  useEffect(() => { if (expanded) fetchLessons(); }, [expanded]);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    setSaving(true);
    try {
      await institutionApi.createModule({
        nombreModulo: newLessonTitle,
        // @ts-ignore - adding seccionId for the new hierarchy
        seccionId: section.id,
        cursoId: section.cursoId,
        duracionDias: 7
      });
      setNewLessonTitle('');
      setShowAddLesson(false);
      fetchLessons();
      toast({ title: '✓ Actividad creada' });
    } catch { toast({ title: 'Error' }); } finally { setSaving(false); }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm('¿Eliminar actividad?')) return;
    try {
      await (institutionApi as any).deleteModule(id);
      fetchLessons();
    } catch { toast({ title: 'Error' }); }
  };

  return (
    <div className="border bg-white rounded-2xl overflow-hidden transition-all hover:shadow-sm" style={{borderColor:'rgba(26,86,219,0.08)'}}>
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-blue-50/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'var(--inst-blue-lt)', color:'var(--inst-blue)'}}>
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h5 className="text-sm font-bold tracking-tight" style={{color:'var(--inst-deep)'}}>{section.nombre}</h5>
            <p className="technical-label">{lessons.length} Actividades de Aprendizaje</p>
          </div>
        </div>
        <ChevronDown className={cn("w-5 h-5 transition-transform", expanded && "rotate-180")} style={{color:'var(--inst-muted)'}} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t" style={{borderColor:'rgba(26,86,219,0.05)'}}
          >
            <div className="p-4 space-y-3 bg-blue-50/10">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{color:'var(--inst-muted)'}}>Contenido de la Unidad</span>
                <button 
                  onClick={() => setShowAddLesson(!showAddLesson)}
                  className="text-[9px] font-black uppercase flex items-center gap-1 transition-colors"
                  style={{color:'var(--inst-blue)'}}
                >
                  <Plus className="w-3 h-3" /> Añadir Actividad
                </button>
              </div>

              {showAddLesson && (
                <form onSubmit={handleAddLesson} className="flex gap-2 p-2 rounded-xl border" style={{background:'var(--inst-blue-lt)', borderColor:'rgba(26,86,219,0.1)'}}>
                  <Input 
                    value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)}
                    placeholder="Título de la actividad..."
                    className="h-9 text-xs bg-white border-transparent focus:border-[var(--inst-blue)]/30 rounded-lg shadow-sm" autoFocus
                  />
                  <Button size="sm" className="h-9 text-[10px] font-black uppercase text-white rounded-lg shadow-sm" disabled={saving} style={{background:'var(--inst-blue)'}}>
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'OK'}
                  </Button>
                </form>
              )}

              {loading ? <div className="py-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin" style={{color:'var(--inst-muted)'}} /></div> : (
                <div className="space-y-2">
                  {lessons.map(l => (
                    <ActivityRow key={l.id} mod={l} professors={professors} onRefresh={fetchLessons} onDelete={() => handleDeleteLesson(l.id)} />
                  ))}
                  {lessons.length === 0 && !showAddLesson && <p className="text-[10px] italic text-center py-2" style={{color:'var(--inst-muted)'}}>Sin contenido académico aún</p>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----- Sub-component: Course Card -----
function CourseCard({ course, professors, allUsers, onDelete, onRefresh, handleExportGradeReport, exportingReport }: { course: any; professors: any[]; allUsers: any[]; onDelete: () => void; onRefresh: () => void; handleExportGradeReport: (id: number, name: string) => void; exportingReport: number | null }) {
  const [expanded, setExpanded] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  const courseUsers = allUsers.filter(u => Number(u.cursoId) === Number(course.id));
  const courseStudentsCount = courseUsers.filter(u => u.roleId === 10).length;
  const courseProfessorsCount = courseUsers.filter(u => u.roleId === 9).length;

  useEffect(() => {
    if (expanded) fetchSections();
  }, [expanded]);

  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const res = await institutionApi.getCourseSections(course.id) as any;
      setSections(res || []);
    } catch { 
      setSections([]); 
    } finally { setLoadingSections(false); }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) return;
    setSavingSection(true);
    try {
      await institutionApi.createSection({
        nombre: sectionName,
        cursoId: course.id,
        orden: sections.length
      });
      setSectionName('');
      setShowAddSection(false);
      await fetchSections();
      toast({ title: '✓ Unidad creada' });
    } catch {
      toast({ title: 'Error' });
    } finally { setSavingSection(false); }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('¿Eliminar curso completo?')) return;
    onDelete();
  };

  const levelClass = LEVEL_CLASSES[String(course.id)] || 'bg-slate-500/10 text-slate-400';
  const levelName = LEVEL_NAMES[String(course.id)] || 'Nivel Académico';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="blueprint-card overflow-hidden"
    >
      {/* Course Header */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
               <span className="edu-badge-primary">
                Sectore/Curso #{course.id}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'var(--inst-muted)'}}>
                {levelName}
              </span>
            </div>
            <h4 className="text-xl font-black tracking-tight" style={{color:'var(--inst-deep)'}}>
              {course.nombre}
            </h4>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleExportGradeReport(course.id, course.nombre)}
              disabled={exportingReport === course.id}
              className="w-10 h-10 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-center transition-all border group"
              style={{borderColor:'rgba(5,150,105,0.06)', color:'var(--inst-emerald)'}}
              title="Generar Reporte de Notas"
            >
              {exportingReport === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 rotate-45" />}
            </button>
            <button
              onClick={handleDeleteCourse}
              className="w-10 h-10 rounded-xl hover:bg-red-50 flex items-center justify-center text-red-200 hover:text-red-500 transition-all font-bold group"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-10 h-10 rounded-xl bg-blue-50/50 hover:bg-blue-50 flex items-center justify-center transition-all border"
              style={{borderColor:'rgba(26,86,219,0.06)', color:'var(--inst-blue)'}}
            >
              <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'var(--inst-blue-lt)', color:'var(--inst-blue)'}}>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'var(--inst-muted)'}}>{sections.length} Unidades</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'var(--inst-emerald)/10', color:'var(--inst-emerald)'}}>
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'var(--inst-muted)'}}>{courseStudentsCount} Estudiantes</span>
          </div>
        </div>
      </div>

      {/* Expandable Sections (The "Units" layer) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t p-6 space-y-4 bg-slate-50/30" style={{borderColor:'rgba(26,86,219,0.05)'}}>
              <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border" style={{borderColor:'rgba(26,86,219,0.06)'}}>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{color:'var(--inst-muted)'}}>Estructura Curricular</p>
                <button
                  onClick={() => setShowAddSection(!showAddSection)}
                  className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-colors font-bold"
                  style={{color:'var(--inst-blue)'}}
                >
                  <Plus className="w-3 h-3" /> Añadir Unidad
                </button>
              </div>

              {/* Add Section Form */}
              <AnimatePresence>
                {showAddSection && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleAddSection}
                    className="p-5 rounded-2xl space-y-3 border shadow-sm"
                    style={{background:'var(--inst-blue-lt)', borderStyle:'dashed', borderColor:'var(--inst-blue)'}}
                  >
                    <div className="flex gap-3">
                      <Input
                        value={sectionName} onChange={(e) => setSectionName(e.target.value)}
                        placeholder="Nombre de la Unidad (ej: Unidad 1)..."
                        className="flex-1 h-11 bg-white border-transparent text-sm font-bold shadow-inner"
                        required autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={savingSection} className="flex-1 h-10 text-white rounded-xl text-[10px] font-black uppercase shadow-md" style={{background:'var(--inst-blue)'}}>
                        {savingSection ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmar Unidad'}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setShowAddSection(false)} className="h-10 px-3 text-slate-500 rounded-xl hover:bg-white/50">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Section List */}
              {loadingSections ? (
                <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" style={{color:'var(--inst-blue)'}} /></div>
              ) : sections.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed rounded-3xl" style={{borderColor:'rgba(26,86,219,0.08)'}}>
                  <Layers className="w-10 h-10 mx-auto mb-3 opacity-10" style={{color:'var(--inst-blue)'}} />
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:'var(--inst-muted)'}}>Define la estructura académica de este curso</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((sec) => (
                    <SectionItem 
                      key={sec.id} 
                      section={sec} 
                      professors={professors}
                      onRefresh={fetchSections}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ----- Main Dashboard -----
export const InstitutionalAdminDashboard = ({ user }: { user: any }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [institutionalUsers, setInstitutionalUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);
  
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showMassiveModal, setShowMassiveModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteQuantity, setInviteQuantity] = useState(40);
  const [inviteCourseId, setInviteCourseId] = useState('');
  const [generatedInvites, setGeneratedInvites] = useState<any[]>([]);
  const [massiveInput, setMassiveInput] = useState('');
  const [massiveCourseId, setMassiveCourseId] = useState('');
  const [massiveRoleId, setMassiveRoleId] = useState('10');
  const [isProcessingMassive, setIsProcessingMassive] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  const [newNodeRole, setNewNodeRole] = useState('10');
  const [userFilter, setUserFilter] = useState('all'); 
  const [newUser, setNewUser] = useState({ nombre: '', email: '', password: 'admin' });
  const [creatingUser, setCreatingUser] = useState(false);

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [selectedModulesForProf, setSelectedModulesForProf] = useState<number[]>([]);
  const [selectedCoursesForUser, setSelectedCoursesForUser] = useState<number[]>([]);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [moduleSearchTerm, setModuleSearchTerm] = useState('');
  const [allAvailableModules, setAllAvailableModules] = useState<any[]>([]);
  const [updatingUser, setUpdatingUser] = useState(false);
  // Map: userId -> assigned courseIds (for table display)
  const [userCoursesMap, setUserCoursesMap] = useState<Record<number, number[]>>({});
  const [exportingReport, setExportingReport] = useState<number | null>(null);

  // Text Builder State
  const [showTextBuilder, setShowTextBuilder] = useState(false);
  const [builderText, setBuilderText] = useState('');
  const [generatingStructure, setGeneratingStructure] = useState(false);
  
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.institucionId) return;

    setUploadingLogo(true);
    try {
      await institutionApi.updateInstitutionLogo(user.institucionId, file);
      toast({ title: '✓ Marca Actualizada', description: 'El logo de la institución ha sido cargado con éxito.' });
      // Notify components like the sidebar to update their branding without a hard page reload
      window.dispatchEvent(new CustomEvent('institution-updated'));
    } catch {
      toast({ title: 'Error', description: 'No se pudo subir el logo.', variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    if (user?.institucionId) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesData, usersData] = await Promise.all([
        institutionApi.getCourses(user!.institucionId!) as Promise<any[]>,
        institutionApi.getInstitutionalUsers(user!.institucionId!) as Promise<any[]>
      ]);
      setCourses(coursesData);
      setInstitutionalUsers(usersData);

      // Fetch all modules for assignment reference
      const modulesPromises = coursesData.map(async (c: any) => {
        const sections: any = await institutionApi.getCourseSections(c.id);
        const mods = await Promise.all(sections.map((s: any) => institutionApi.getSectionModules(s.id)));
        return mods.flat();
      });
      const allMods = await Promise.all(modulesPromises);
      setAllAvailableModules(allMods.flat());

      // Build per-user course map for display in the table
      const map: Record<number, number[]> = {};
      await Promise.all(usersData.map(async (u: any) => {
        try {
          const uc = await institutionApi.getUserCourses(u.id) as any[];
          map[u.id] = uc.map((r: any) => r.cursoId);
        } catch { map[u.id] = []; }
      }));
      setUserCoursesMap(map);
    } catch (error) {
      console.error('Error fetching institutional data:', error);
      toast({ title: 'Error de conexión', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    setCreatingCourse(true);
    try {
      await institutionApi.createCourse({
        nombre: newCourseName,
        institucionId: user?.institucionId
      });
      setNewCourseName('');
      setShowCreateCourse(false);
      await fetchData();
      toast({ title: 'Curso creado', description: `"${newCourseName}" ha sido registrado.` });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo crear el curso.', variant: 'destructive' });
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await institutionApi.createUser({
        ...newUser,
        roleId: parseInt(newNodeRole),
        institucionId: user?.institucionId
      });
      setShowCreateUser(false);
      setNewUser({ nombre: '', email: '', password: 'admin' });
      await fetchData();
      toast({ title: 'Usuario creado', description: `"${newUser.nombre}" ha sido registrado.` });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo crear el usuario.', variant: 'destructive' });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdatingUser(true);
    try {
      // 1. Update Core User Data (Name, Email, Role)
      // Keep the first selected course as the primary cursoId for backward compat
      const primaryCourseId = selectedCoursesForUser[0] ?? null;
      await institutionApi.updateUser(editingUser.id, {
        nombre: editingUser.nombre,
        email: editingUser.email,
        roleId: parseInt(editingUser.roleId),
        cursoId: primaryCourseId,
      });

      // 2. Sync all selected courses via the join table
      await institutionApi.syncUserCourses(editingUser.id, selectedCoursesForUser);

      // 3. If Professor, update module assignments
      if (editingUser.roleId === '9' || editingUser.roleId === '2') {
        const modulesToUnassign = allAvailableModules.filter(m =>
          m.profesorId === editingUser.id && !selectedModulesForProf.includes(m.id)
        );
        const modulesToAssign = allAvailableModules.filter(m =>
          selectedModulesForProf.includes(m.id) && m.profesorId !== editingUser.id
        );
        await Promise.all([
          ...modulesToUnassign.map(m => institutionApi.updateModule(m.id, { profesorId: null })),
          ...modulesToAssign.map(m => institutionApi.updateModule(m.id, { profesorId: editingUser.id }))
        ]);
      }

      setEditingUser(null);
      setSelectedCoursesForUser([]);
      setSelectedModulesForProf([]);
      await fetchData();
      toast({ title: 'Usuario actualizado', description: 'Los cambios se han guardado exitosamente.' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el usuario.', variant: 'destructive' });
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await (institutionApi as any).deleteCourse(courseId);
      await fetchData();
      toast({ title: 'Curso eliminado' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar el curso.', variant: 'destructive' });
    }
  };

  const handleGenerateFromText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderText.trim()) return;
    setGeneratingStructure(true);
    try {
      await institutionApi.generateStructureFromText({
        institucionId: user.institucionId,
        text: builderText
      });
      setBuilderText('');
      setShowTextBuilder(false);
      await fetchData();
      toast({ 
        title: '✅ Estructura Generada', 
        description: 'El currículo ha sido procesado y se han creado los cursos y unidades.',
        variant: 'default'
      });
    } catch (error: any) {
      toast({ 
        title: 'Error al generar', 
        description: error.message || 'No se pudo procesar el texto.', 
        variant: 'destructive' 
      });
    } finally {
      setGeneratingStructure(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await institutionApi.toggleUserStatus(userId, !currentStatus);
      setInstitutionalUsers(prev => prev.map(u => u.id === userId ? { ...u, activo: !currentStatus } : u));
      toast({ title: 'Estado actualizado', description: `Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente.` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo cambiar el estado.', variant: 'destructive' });
    }
  };

  const handleExportGradeReport = async (courseId: number, courseName: string) => {
    setExportingReport(courseId);
    try {
      const report = await institutionApi.getGradeReport(courseId) as any[];
      
      // Basic CSV export logic
      const headers = "ID,Nombre,Email,Entregas,Promedio\n";
      const rows = report.map(r => `${r.id},${r.nombre},${r.email},${r.entregas},${r.promedio}`).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `Reporte_Notas_${courseName.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({ title: 'Reporte generado', description: 'El archivo Excel/CSV se ha descargado.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo generar el reporte.', variant: 'destructive' });
    } finally {
      setExportingReport(null);
    }
  };

  if (!user?.institucionId && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-white p-6">
        <AlertTriangle className="w-12 h-12 text-orange-500 mb-4" />
        <h2 className="text-xl font-bold italic uppercase tracking-tighter">Sin Identidad Institucional</h2>
        <p className="text-slate-500 text-center max-w-md mt-2">
          Tu cuenta no tiene una institución asignada en la base de datos. 
          Contacta al administrador del sistema para vincularte a una sede.
        </p>
        <div className="mt-8 p-4 bg-orange-600/10 border border-orange-500/20 rounded-2xl text-[10px] font-mono opacity-50">
          DEBUG: role={user?.role} id={user?.id}
        </div>
        <Button className="mt-6 bg-slate-800" onClick={() => (window.location.href = '/login')}>Volver</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--inst-peach)]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[var(--inst-rose)]/20 border-t-[var(--inst-rose)] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[var(--inst-rose)] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const professors = institutionalUsers.filter(u => u.roleId === 9 || u.roleId === 2);
  const students = institutionalUsers.filter(u => u.roleId === 10 || u.roleId === 3);
  
  const filteredUsers = institutionalUsers.filter(u => {
    if (userFilter === 'all') return true;
    if (userFilter === '9_13') return u.roleId === 9 || u.roleId === 13;
    return String(u.roleId) === userFilter;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[var(--inst-peach)] min-h-screen relative overflow-hidden font-sans text-[var(--inst-slate)]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 construction-grid opacity-10" />
        <div className="scaffold-lines opacity-10" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-end gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--inst-rose)] font-black uppercase tracking-widest text-[10px] holographic px-3 py-1 bg-[var(--inst-rose)]/10 border border-[var(--inst-rose)]/20 rounded-full w-fit">
              <Building2 className="w-4 h-4" /> Plataforma Genia 4.0
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-[var(--inst-deep)] leading-none mt-2">
              {user?.nombre || "Institución"} <span className="text-[var(--inst-rose)] text-glitch">Genia</span>
            </h1>
            <p className="text-[var(--inst-slate)]/60 font-bold uppercase tracking-widest text-xs mt-2">
              Protocolo: <span className="text-[var(--inst-mauve)]">#INST-{user?.institucionId || '??'}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowTextBuilder(true)}
              variant="outline"
              className="h-12 px-6 rounded-2xl border-[var(--inst-mauve)]/30 bg-white text-[var(--inst-mauve)] font-black uppercase italic tracking-widest hover:bg-[var(--inst-peach)] transition-all"
            >
              <Sparkles className="w-5 h-5 mr-2" /> Constructor de Texto
            </Button>
            <Button
              onClick={() => setShowCreateCourse(true)}
              className="h-12 px-6 rounded-2xl bg-[var(--inst-rose)] hover:bg-[var(--inst-rose)]/90 text-white font-black uppercase italic tracking-widest shadow-lg shadow-[var(--inst-rose)]/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" /> Nuevo Curso
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleLogoUpload} 
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingLogo}
              variant="outline"
              className="h-12 w-12 p-0 rounded-2xl border-[var(--inst-blue)]/30 bg-white text-[var(--inst-blue)] hover:bg-[var(--inst-blue-lt)] transition-all shadow-sm"
              title="Configurar Logo Institucional"
            >
              {uploadingLogo ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </Button>
          </div>
        </header>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Usuarios Activos", value: institutionalUsers.length, icon: Users, color: "text-[var(--inst-blue)]", bg: "var(--inst-blue-lt)" },
            { label: "Sectores / Cursos", value: courses.length, icon: BookOpen, color: "text-[var(--inst-purple)]", bg: "rgba(124,58,237,0.1)" },
            { label: "Unidades Académicas", value: allAvailableModules.length, icon: Layers, color: "text-[var(--inst-emerald)]", bg: "rgba(5,150,105,0.1)" },
            { label: "Estado del Sistema", value: "Online", icon: Globe, color: "text-[var(--inst-gold)]", bg: "var(--inst-gold-lt)" }
          ].map((stat, i) => (
            <Card key={i} className="blueprint-card p-6 accent-hover group">
              <div className="relative z-10 space-y-3">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", stat.color)} style={{background: stat.bg}}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="technical-label">{stat.label}</p>
                  <h3 className="text-3xl font-black tracking-tighter" style={{color:'var(--inst-deep)'}}>{stat.value}</h3>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="bg-white border rounded-2xl p-1.5 h-auto gap-2 shadow-sm" style={{borderColor:'rgba(26,86,219,0.06)'}}>
            {[
              { id: 'courses', label: 'Gestión de Sectores', icon: Building2 },
              { id: 'students', label: 'Usuarios e Interventores', icon: Users }
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all data-[state=active]:bg-[var(--inst-blue)] data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* COURSES TAB */}
          <TabsContent value="courses" className="m-0 space-y-4 outline-none">
            {courses.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed rounded-[3rem] bg-white transition-all" style={{borderColor:'rgba(26,86,219,0.08)'}}>
                <div className="w-20 h-20 rounded-3xl bg-blue-50/50 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10" style={{color:'var(--inst-blue)'}} />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2" style={{color:'var(--inst-deep)'}}>Inicia tu Academia</h3>
                <p className="text-xs max-w-sm mx-auto mb-8" style={{color:'var(--inst-muted)'}}>Todavía no has creado ningún sector educativo. Comienza diseñando el primer curso de tu institución.</p>
                <Button 
                  onClick={() => setShowCreateCourse(true)}
                  className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-lg"
                  style={{background:'var(--inst-blue)'}}
                >
                  <Plus className="w-4 h-4 mr-2" /> Crear mi primer curso
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    professors={institutionalUsers.filter(u => u.roleId === 9)}
                    allUsers={institutionalUsers}
                    onDelete={() => handleDeleteCourse(course.id)}
                    onRefresh={fetchData}
                    handleExportGradeReport={handleExportGradeReport}
                    exportingReport={exportingReport}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="students" className="m-0 space-y-6 outline-none">
            <div className="flex flex-wrap justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="text-lg font-black tracking-tight" style={{color:'var(--inst-deep)'}}>Directorio Académico</h3>
                  <p className="technical-label">Gestión de Roles e Interventores</p>
                </div>
                <div className="h-10 w-[1px] bg-blue-100" />
                <div className="flex bg-white p-1 rounded-xl border border-blue-50 shadow-sm">
                  {[
                    { id: 'all', label: 'TODOS' },
                    { id: '9_13', label: 'DOCENTES / TUTORES' },
                    { id: '10_11', label: 'ESTUDIANTES / KIDS' },
                    { id: '7', label: 'EQUIPO KIDS' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setUserFilter(f.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[9px] font-black tracking-widest transition-all",
                        (userFilter === f.id || (userFilter === '10_11' && (f.id === '10' || f.id === '11'))) ? "bg-[var(--inst-blue-lt)] text-[var(--inst-blue)]" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                <Button 
                  onClick={() => {
                    const url = `${window.location.origin}/institucional/registro/${user.institucionId}`;
                    navigator.clipboard.writeText(url);
                    toast({ title: '✓ Link Copiado', description: 'Envíe este link a los padres de familia para el registro.' });
                  }}
                  variant="outline"
                  className="h-12 px-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                >
                  <Globe className="w-4 h-4 mr-2" /> Link Padres
                </Button>
                <Button 
                  onClick={() => setShowInviteModal(true)}
                  variant="outline"
                  className="h-12 px-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-purple-600 border-purple-100 hover:bg-purple-50"
                >
                  <Ticket className="w-4 h-4 mr-2" /> Generar Lote
                </Button>
                <Button 
                  onClick={() => setShowMassiveModal(true)}
                  variant="outline"
                  className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] text-blue-600 border-blue-100 hover:bg-blue-50"
                >
                  <Upload className="w-4 h-4 mr-2" /> Registro Masivo
                </Button>
                <Button 
                  onClick={() => setShowCreateUser(true)}
                  className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-lg"
                  style={{background:'var(--inst-blue)'}}
                >
                  <Plus className="w-4 h-4 mr-2" /> Añadir Usuario
                </Button>
              </div>
            </div>
            
            <Card className="blueprint-card overflow-hidden">
              {filteredUsers.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Sin usuarios en este filtro</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        {['Usuario / Interventor', 'Asignación Académica', 'Rol', 'Estado', 'Credencial', 'Acciones'].map(h => (
                          <th key={h} className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b" style={{borderColor:'rgba(26,86,219,0.06)'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{borderColor:'rgba(26,86,219,0.04)'}}>
                      {filteredUsers.map((u, i) => (
                        <tr key={i} className="hover:bg-blue-50/20 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{background: u.roleId === 9 ? 'var(--inst-blue-lt)' : 'var(--inst-gold-lt)', color: u.roleId === 9 ? 'var(--inst-blue)' : 'var(--inst-gold)'}}>
                                {u.nombre.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold" style={{color:'var(--inst-deep)'}}>{u.nombre}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                              {(userCoursesMap[u.id] ?? (u.cursoId ? [u.cursoId] : [])).map((cid: number) => {
                                const course = courses.find(c => Number(c.id) === Number(cid));
                                return course ? (
                                  <span key={cid} className="px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider" style={{background:'var(--inst-blue-lt)', color:'var(--inst-blue)', border:'1px solid rgba(26,86,219,0.1)'}}>
                                    {course.nombre}
                                  </span>
                                ) : null;
                              })}
                              {(userCoursesMap[u.id]?.length ?? 0) === 0 && !u.cursoId && (
                                <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest italic">Sin Asignar</span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <Badge className={cn("border-none font-black uppercase text-[8px] tracking-widest px-3 h-6",
                              u.roleId === 9 ? "bg-emerald-50 text-emerald-600" : 
                              u.roleId === 13 ? "bg-purple-50 text-purple-600" :
                              u.roleId === 7 ? "bg-cyan-50 text-cyan-600" :
                              u.roleId === 11 ? "bg-pink-50 text-pink-600 shadow-[0_0_10px_rgba(244,114,182,0.2)]" :
                              "bg-blue-50 text-blue-600"
                            )}>
                              {u.roleId === 9 ? 'DOCENTE' : 
                               u.roleId === 7 ? 'PROFE KIDS' : 
                               u.roleId === 13 ? 'TUTOR' : 
                               u.roleId === 11 ? 'ESTUDIANTE KIDS' : 'ESTUDIANTE'}
                            </Badge>
                          </td>
                          <td className="px-8 py-5">
                            <button 
                              onClick={() => handleToggleStatus(u.id, u.activo)}
                              className="flex items-center gap-2 group/status cursor-pointer"
                            >
                              <div className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                u.activo ? "bg-emerald-500 shadow-sm shadow-emerald-500/20" : "bg-slate-300"
                              )} />
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest transition-colors",
                                u.activo ? "text-emerald-600" : "text-slate-400"
                              )}>
                                {u.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </button>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-500">
                                {showPasswords[u.id] ? u.password : '••••••••'}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowPasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                className="h-6 w-6 p-0 rounded-md"
                              >
                                {showPasswords[u.id] ? <X className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </Button>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={async () => {
                                setEditingUser({
                                  id: u.id,
                                  nombre: u.nombre,
                                  email: u.email,
                                  roleId: String(u.roleId),
                                });
                                const existingCourses = userCoursesMap[u.id] ?? (u.cursoId ? [u.cursoId] : []);
                                setSelectedCoursesForUser(existingCourses);
                                const assigned = allAvailableModules.filter(m => m.profesorId === u.id).map(m => m.id);
                                setSelectedModulesForProf(assigned);
                                setCourseSearchTerm('');
                                setModuleSearchTerm('');
                              }}
                              className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border border-transparent hover:border-blue-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                            >
                              Gestionar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Text Builder Modal */}
      <AnimatePresence>
        {showTextBuilder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--inst-navy)]/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white border p-10 rounded-[3rem] w-full max-w-xl shadow-2xl relative overflow-hidden"
              style={{borderColor:'rgba(26,86,219,0.1)'}}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" style={{background:'var(--inst-blue-lt)'}} />
              
              <button
                onClick={() => setShowTextBuilder(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="space-y-2 mb-8 relative z-10">
                <div className="flex items-center gap-2 font-black uppercase tracking-[0.4em] text-[10px]" style={{color:'var(--inst-blue)'}}>
                  <Sparkles className="w-4 h-4" /> Constructor de Texto
                </div>
                <h2 className="text-3xl font-black tracking-tighter" style={{color:'var(--inst-deep)'}}>
                  Constructor de <span style={{color:'var(--inst-blue)'}}>Currículo</span>
                </h2>
                <p className="text-slate-500 text-xs">Pega el texto de tu currículo o lista de módulos. El sistema creará los cursos y unidades automáticamente.</p>
              </div>

              <form onSubmit={handleGenerateFromText} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="technical-label ml-1">Entrada de Datos Curriculum</label>
                  <Textarea
                    value={builderText}
                    onChange={(e) => setBuilderText(e.target.value)}
                    placeholder="Ej: Unidad 1. Descubro objetos, secuencias y funciones - Unidad 2. Exploro acciones..."
                    className="min-h-[200px] bg-slate-50/50 border-blue-100 rounded-2xl p-5 text-sm font-bold placeholder:text-slate-300 focus:border-[var(--inst-blue)]/50 transition-all resize-none shadow-inner"
                    autoFocus
                    required
                  />
                </div>

                <div className="p-4 rounded-2xl flex gap-3 items-start border shadow-sm" style={{background:'var(--inst-blue-lt)', borderColor:'rgba(26,86,219,0.1)'}}>
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm" style={{color:'var(--inst-blue)'}}>
                    <Info className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold leading-relaxed uppercase" style={{color:'var(--inst-blue)'}}>
                    Este proceso creará una estructura jerárquica de sectores, unidades y actividades basadas en tu texto. 
                    Podrás editar o eliminar cualquier elemento después.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowTextBuilder(false)}
                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={generatingStructure || !builderText.trim()}
                    className="flex-[2] h-14 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg flex gap-2"
                    style={{background:'var(--inst-blue)'}}
                  >
                    {generatingStructure ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analizando Datos...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Generar Estructura Académica
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Course Modal */}
      <AnimatePresence>
        {showCreateCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--inst-navy)]/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white border p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative"
              style={{borderColor:'rgba(26,86,219,0.1)'}}
            >
              <button
                onClick={() => setShowCreateCourse(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="space-y-2 mb-8">
                <p className="text-[9px] font-black uppercase tracking-[0.4em]" style={{color:'var(--inst-blue)'}}>Gestión Académica</p>
                <h2 className="text-3xl font-black tracking-tighter" style={{color:'var(--inst-deep)'}}>
                  Nuevo <span style={{color:'var(--inst-blue)'}}>Sector Académico</span>
                </h2>
                <p className="text-slate-500 text-xs">El curso se integrará en el mapa de aprendizaje de la ciudad.</p>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-6">
                <div className="space-y-2">
                  <label className="technical-label ml-1">Nombre del Sector / Curso</label>
                  <Input
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="Ej: 10mo Año – Robótica"
                    className="h-14 px-5 bg-slate-50/50 border-blue-50 focus:border-blue-200 rounded-2xl text-lg font-bold shadow-inner transition-all"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateCourse(false)}
                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={creatingCourse}
                    className="flex-1 h-14 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20"
                    style={{background:'var(--inst-blue)'}}
                  >
                    {creatingCourse ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar Sector'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--inst-navy)]/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white border p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative"
              style={{borderColor:'rgba(26,86,219,0.1)'}}
            >
              <button
                onClick={() => setShowCreateUser(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="space-y-2 mb-8">
                <p className="text-[9px] font-black uppercase tracking-[0.4em]" style={{color:'var(--inst-blue)'}}>Gestión de Usuarios</p>
                <h2 className="text-3xl font-black tracking-tighter" style={{color:'var(--inst-deep)'}}>
                  Nuevo <span style={{color:'var(--inst-blue)'}}>Interventor</span>
                </h2>
                <p className="text-slate-500 text-xs">Registra un nuevo docente o estudiante para la institución.</p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-3xl border border-blue-50">
                  {[
                    { id: '10', label: 'Estudiante', icon: '📖' },
                    { id: '11', label: 'Kid', icon: '🚀' },
                    { id: '9', label: 'Docente', icon: '🎓' },
                    { id: '7', label: 'Profe Kids', icon: '🧑‍🏫' },
                    { id: '13', label: 'Tutor', icon: '🛡️' },
                    { id: '2', label: 'Admin', icon: '⚙️' }
                  ].map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setNewNodeRole(role.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        newNodeRole === role.id 
                          ? "bg-white text-[var(--inst-blue)] shadow-md border-2 border-blue-100" 
                          : "text-slate-400 hover:bg-white/50"
                      )}
                    >
                      <span className="text-sm">{role.icon}</span>
                      {role.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <Input
                    value={newUser.nombre}
                    onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                    placeholder="Nombre completo"
                    className="h-12 bg-slate-50 border-blue-50 focus:border-blue-200 rounded-xl text-sm font-bold shadow-inner"
                    required
                  />
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Email institucional (@academia.com)"
                    className="h-12 bg-slate-50 border-blue-50 focus:border-blue-200 rounded-xl text-sm font-bold shadow-inner"
                    required
                  />
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Contraseña de acceso"
                    className="h-12 bg-slate-50 border-blue-50 focus:border-blue-200 rounded-xl text-sm font-bold shadow-inner"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full h-14 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20"
                  style={{background:'var(--inst-blue)'}}
                >
                  {creatingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar Interventor'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[var(--inst-navy)]/60 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl relative my-8"
              style={{borderColor:'rgba(26,86,219,0.1)'}}
            >
              <button
                onClick={() => {
                  setEditingUser(null);
                  setModuleSearchTerm('');
                  setCourseSearchTerm('');
                  setSelectedModulesForProf([]);
                  setSelectedCoursesForUser([]);
                }}
                className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="space-y-2 mb-8">
                <p className="text-[9px] font-black uppercase tracking-[0.4em]" style={{color:'var(--inst-blue)'}}>Panel de Gestión</p>
                <h2 className="text-3xl font-black tracking-tighter" style={{color:'var(--inst-deep)'}}>
                   Configurar <span style={{color:'var(--inst-blue)'}}>Interventor</span>
                </h2>
                <p className="text-slate-500 text-xs">Modifica roles y asignaciones de sectores académicos.</p>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="technical-label ml-1">Nombre Completo</label>
                    <Input 
                      value={editingUser.nombre} 
                      onChange={e => setEditingUser({...editingUser, nombre: e.target.value})}
                      className="bg-slate-50 border-blue-50 focus:border-blue-200 rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="technical-label ml-1">Correo Electrónico</label>
                    <Input 
                      value={editingUser.email} 
                      onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                      className="bg-slate-50 border-blue-50 focus:border-blue-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="technical-label ml-1">Rol Académico</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-50 p-2 rounded-3xl border border-blue-50">
                    {[
                      { id: '10', label: 'Estudiante', icon: '📖' },
                      { id: '11', label: 'Kid', icon: '🚀' },
                      { id: '13', label: 'Tutor', icon: '🛡️' },
                      { id: '9', label: 'Docente', icon: '🎓' },
                      { id: '7', label: 'Profe Kids', icon: '🧑‍🏫' },
                      { id: '1', label: 'Admin', icon: '⚙️' }
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setEditingUser({...editingUser, roleId: r.id})}
                        className={cn(
                          "flex items-center gap-2 px-3 h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                          editingUser.roleId === r.id 
                            ? "bg-white text-[var(--inst-blue)] shadow-md border-2 border-blue-100" 
                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                      >
                        <span className="text-xs">{r.icon}</span>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 p-6 rounded-[2.5rem] border shadow-sm" style={{background:'var(--inst-blue-lt)', borderColor:'rgba(26,86,219,0.06)'}}>
                  <div className="flex flex-wrap justify-between items-center gap-2 px-1">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest italic block" style={{color:'var(--inst-blue)'}}>Sectores / Cursos Asignados</label>
                      <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">Control de acceso multizona</p>
                    </div>
                    <Badge className="bg-white border-none text-[8px] font-black h-5 px-3" style={{color:'var(--inst-blue)'}}>
                      {selectedCoursesForUser.length} ASIGNADOS
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input
                        placeholder="Buscar cursos..."
                        className="h-10 pl-10 text-[10px] bg-white border-transparent focus:border-blue-200 rounded-xl font-bold uppercase tracking-widest shadow-sm"
                        value={courseSearchTerm}
                        onChange={(e) => setCourseSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {courses
                      .filter((c: any) =>
                        selectedCoursesForUser.includes(c.id) ||
                        (c.nombre || '').toLowerCase().includes(courseSearchTerm.toLowerCase())
                      )
                      .map((c: any) => (
                        <label
                          key={c.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all",
                            selectedCoursesForUser.includes(c.id)
                              ? "bg-white border-blue-200 shadow-sm"
                              : "bg-white/50 border-transparent hover:bg-white"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCoursesForUser.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedCoursesForUser([...selectedCoursesForUser, c.id]);
                              else setSelectedCoursesForUser(selectedCoursesForUser.filter(id => id !== c.id));
                            }}
                            className="w-5 h-5 rounded-lg border-blue-100 bg-white accent-[var(--inst-blue)] cursor-pointer shadow-sm"
                          />
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-tight",
                            selectedCoursesForUser.includes(c.id) ? "text-[var(--inst-blue)]" : "text-slate-400"
                          )}>
                            {c.nombre}
                          </p>
                        </label>
                      ))
                    }
                  </div>
                </div>

                {(editingUser.roleId === '9' || editingUser.roleId === '2') && (
                  <div className="space-y-4 p-6 rounded-[2.5rem] border shadow-sm" style={{background:'rgba(5,150,105,0.05)', borderColor:'rgba(5,150,105,0.08)'}}>
                    <div className="flex flex-wrap justify-between items-center gap-2 px-1">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest italic block" style={{color:'var(--inst-emerald)'}}>Cátedra de Unidades</label>
                        <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">Control directo sobre actividades</p>
                      </div>
                      <Badge className="bg-white border-none text-[8px] font-black h-5 px-3" style={{color:'var(--inst-emerald)'}}>
                        {selectedModulesForProf.length} UNIDADES
                      </Badge>
                    </div>

                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-3 custom-scrollbar">
                      {allAvailableModules
                        .filter(m => 
                          selectedModulesForProf.includes(m.id) || 
                          (m.titulo || m.nombreModulo || '').toLowerCase().includes(moduleSearchTerm.toLowerCase()) || 
                          (courses.find(c => c.id === m.cursoId)?.nombre || '').toLowerCase().includes(moduleSearchTerm.toLowerCase())
                        )
                        .map(m => (
                        <label 
                          key={m.id} 
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all",
                            selectedModulesForProf.includes(m.id) 
                              ? "bg-white border-emerald-200 shadow-sm" 
                              : "bg-white/50 border-transparent hover:bg-white"
                          )}
                        >
                          <input 
                            type="checkbox"
                            checked={selectedModulesForProf.includes(m.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedModulesForProf([...selectedModulesForProf, m.id]);
                              else setSelectedModulesForProf(selectedModulesForProf.filter(id => id !== m.id));
                            }}
                            className="w-5 h-5 rounded-lg border-emerald-100 bg-white accent-emerald-500 cursor-pointer shadow-sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-[10px] font-black uppercase tracking-tight truncate", selectedModulesForProf.includes(m.id) ? "text-emerald-600" : "text-slate-400")}>
                               {m.titulo || m.nombreModulo}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[6px] font-black uppercase rounded">
                                {courses.find(c => c.id === m.cursoId)?.nombre || 'General'}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={updatingUser}
                  className="w-full h-14 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20"
                  style={{background:'var(--inst-blue)'}}
                >
                  {updatingUser ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                  Confirmar Ajustes Académicos
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MASSIVE CREATION MODAL */}
      <AnimatePresence>
        {showMassiveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMassiveModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl border border-blue-100 overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic" style={{color:'var(--inst-deep)'}}>Carga Masiva de Alumnos</h2>
                    <p className="technical-label">Ingreso de datos en lote vía protocolo de texto</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowMassiveModal(false)} className="rounded-2xl hover:bg-slate-50"><X className="w-5 h-5" /></Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="technical-label">Sector de Asignación</p>
                    <select 
                      value={massiveCourseId}
                      onChange={(e) => setMassiveCourseId(e.target.value)}
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-[11px] font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                    >
                      <option value="">Seleccionar Curso...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="technical-label">Protocolo de Interfaz</p>
                    <select 
                      value={massiveRoleId}
                      onChange={(e) => setMassiveRoleId(e.target.value)}
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-[11px] font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                    >
                      <option value="10">Estudiante Institucional</option>
                      <option value="11">Estudiante Kids</option>
                      <option value="6">Kids (Pure Gamification)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="technical-label">Lista de Usuarios (Un nombre por línea)</p>
                  <Textarea 
                    value={massiveInput}
                    onChange={(e) => setMassiveInput(e.target.value)}
                    placeholder="Ej: Juan Perez&#10;Maria Garcia&#10;Carlos Lopez"
                    className="min-h-[200px] rounded-2xl border-slate-100 bg-slate-50 p-6 text-sm font-medium focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic mt-2">
                    * El sistema generará correos @edu.com y claves automáticamente.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="ghost" onClick={() => setShowMassiveModal(false)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-slate-100">Cancelar</Button>
                  <Button 
                    disabled={!massiveInput || !massiveCourseId || isProcessingMassive}
                    onClick={async () => {
                      setIsProcessingMassive(true);
                      try {
                        const lines = massiveInput.split('\n').filter(l => l.trim().length > 0);
                        const students = lines.map(name => ({ nombre: name.trim(), roleId: Number(massiveRoleId) }));
                        await institutionApi.createMassiveUsers({
                          students,
                          institucionId: user.institucionId,
                          cursoId: Number(massiveCourseId)
                        });
                        toast({ title: '✓ Carga Completada', description: `Se han creado ${lines.length} usuarios con éxito.` });
                        setShowMassiveModal(false);
                        setMassiveInput('');
                        fetchData();
                      } catch (err) {
                        toast({ title: 'Error', description: 'No se pudo procesar la carga masiva.', variant: 'destructive' });
                      } finally {
                        setIsProcessingMassive(false);
                      }
                    }}
                    className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-blue-500/20"
                    style={{background:'var(--inst-blue)'}}
                  >
                    {isProcessingMassive ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Ejecutar Carga</>}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVITE BATCH MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl border border-purple-100 overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800">Lote de Invitaciones</h3>
                      <p className="technical-label">Generar enlaces únicos para registro externo</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowInviteModal(false)} className="rounded-2xl hover:bg-slate-50"><X className="w-5 h-5" /></Button>
                </div>

                {generatedInvites.length === 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="technical-label">Cantidad</p>
                        <Input 
                          type="number" 
                          value={inviteQuantity} 
                          onChange={(e) => setInviteQuantity(Number(e.target.value))}
                          className="h-12 rounded-xl border-slate-100 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="technical-label">Grado / Curso</p>
                        <select 
                          value={inviteCourseId}
                          onChange={(e) => setInviteCourseId(e.target.value)}
                          className="w-full h-12 rounded-xl border border-slate-100 bg-white px-4 font-bold text-xs outline-none"
                        >
                          <option value="GENERAL">Cualquier Curso (El padre elige)</option>
                          {courses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                      </div>
                    </div>
                    <Button 
                      onClick={async () => {
                        setIsProcessingMassive(true);
                        try {
                          const res = await institutionApi.generateInvitations({
                            quantity: inviteQuantity,
                            institucionId: user.institucionId!,
                            cursoId: inviteCourseId === 'GENERAL' || !inviteCourseId ? null : Number(inviteCourseId)
                          }) as any[];
                          setGeneratedInvites(res);
                        } finally {
                          setIsProcessingMassive(false);
                        }
                      }}
                      disabled={isProcessingMassive}
                      className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-[10px]"
                    >
                      {isProcessingMassive ? 'Generando...' : `Generar ${inviteQuantity} Invitaciones`}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 max-h-[300px] overflow-y-auto space-y-3 custom-scrollbar">
                      {generatedInvites.map((inv, idx) => {
                        const url = `${window.location.origin}/institucional/registro/${user.institucionId}?token=${inv.token}`;
                        return (
                          <div key={inv.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                            <span className="text-[10px] font-mono text-slate-500">{idx + 1}. {inv.token}</span>
                            <Button 
                              size="sm" variant="ghost" 
                              onClick={() => {
                                navigator.clipboard.writeText(url);
                                toast({ title: 'Link Copiado' });
                              }}
                              className="h-8 text-[9px] font-black uppercase text-purple-600 hover:bg-purple-50"
                            >
                              Copiar Link
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-4">
                        <Button 
                        onClick={() => {
                            const allLinks = generatedInvites.map((inv, idx) => `${idx + 1}. ${window.location.origin}/institucional/registro/${user.institucionId}?token=${inv.token}`).join('\n');
                            navigator.clipboard.writeText(allLinks);
                            toast({ title: 'Todos los links copiados' });
                        }}
                        className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]"
                        >
                        Copiar Todos
                        </Button>
                        <Button variant="outline" onClick={() => setGeneratedInvites([])} className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px]">Nueva Lista</Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Toaster />
    </div>
  );
}

export default InstitutionalAdminDashboard;

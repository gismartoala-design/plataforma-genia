import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Users, Search, X, Check, Mail, Lock, User,
  BookOpen, ChevronRight, Trash2, AlertCircle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { professorApi, ProfessorCourse } from '@/features/professor/services/professor.api';
import { toast } from '@/hooks/use-toast';

interface LatamStudentsPanelProps {
  courses: ProfessorCourse[];
  professorId: string;
}

export const LatamStudentsPanel = ({ courses, professorId }: LatamStudentsPanelProps) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', courseId: '', rolId: '10' });
  const [saving, setSaving] = useState(false);

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await professorApi.getLatamStudents(professorId);
      setStudents(data);
    } catch { toast({ title: 'Error', description: 'No se pudieron cargar los estudiantes', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  // Auto-load on mount
  React.useEffect(() => { loadStudents(); }, [professorId]);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast({ title: 'Campos incompletos', description: 'Nombre, correo y contraseña son requeridos.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      // Create student then assign to course
      const newStudent = await professorApi.createStudent({
        name: form.name,
        email: form.email,
        password: form.password,
        moduleId: form.courseId,
      });
      
      setStudents(prev => [...prev, newStudent]);
      setShowCreateModal(false);
      setForm({ name: '', email: '', password: '', courseId: '', rolId: '10' });
      toast({ title: '✅ Estudiante creado', description: `${form.name} fue añadido al sistema Latam.` });
      loadStudents(); // Refresh
    } catch (e: any) {
      toast({ title: 'Error al crear', description: e?.message || 'No se pudo crear el estudiante.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">
            Talento <span className="text-blue-600">Academy</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Crea o asigna estudiantes a tus cursos Latam.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar estudiante..."
              className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 w-56"
            />
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2 font-bold h-10"
          >
            <UserPlus className="w-4 h-4" /> Nuevo Estudiante
          </Button>
        </div>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="latam-card bg-white/50 p-16 text-center border-dashed">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="font-bold text-slate-400">No hay estudiantes registrados aún.</p>
          <p className="text-xs text-slate-300 mt-1">Crea el primer talento para este mundo Academy.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, i) => (
            <motion.div
              key={student.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue-200 transition-all shadow-sm group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name || 'S')}`}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm leading-tight">{student.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{student.email}</p>
                  </div>
                </div>
                <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] font-black">
                  Latam
                </Badge>
              </div>

              {/* Course assignment */}
              {student.cursoId ? (
                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-700">
                    {courses.find(c => c.id === student.cursoId)?.nombre || `Curso #${student.cursoId}`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-100">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-600">Sin curso asignado</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative">
              <button onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>

              <div className="mb-7">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Nuevo Talento</span>
                <h2 className="text-2xl font-black italic mt-1 text-slate-800">Crear Estudiante Latam</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="pl-9 h-11 bg-slate-50 border-slate-200 font-bold" placeholder="Ej: María García" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      type="email" className="pl-9 h-11 bg-slate-50 border-slate-200 font-bold" placeholder="correo@academy.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contraseña Inicial</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                      type="password" className="pl-9 h-11 bg-slate-50 border-slate-200 font-bold" placeholder="••••••••" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asignar a Curso (opcional)</label>
                  <select
                    value={form.courseId}
                    onChange={e => setForm({...form, courseId: e.target.value})}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Sin curso por ahora —</option>
                    {courses.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <Button onClick={handleCreate} disabled={saving}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-xs mt-2 gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : <><Check className="w-4 h-4" /> Crear Estudiante</>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

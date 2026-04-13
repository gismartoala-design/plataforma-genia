import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, ChevronDown, ChevronUp, Users, BookOpen,
  Trash2, GraduationCap, ShieldCheck, UserPlus, X, Check, Loader2, Hash, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { institutionApi } from '@/services/institution.api';
import { cn } from '@/lib/utils';

const ROLE_MAP: Record<string, { label: string; roleId: number; color: string }> = {
  admin: { label: 'Admin Institucional', roleId: 8, color: 'bg-violet-100 text-violet-700' },
  docente: { label: 'Docente', roleId: 9, color: 'bg-blue-100 text-blue-700' },
  estudiante: { label: 'Estudiante', roleId: 10, color: 'bg-emerald-100 text-emerald-700' },
};

/* ── Create Institution Dialog ── */
const CreateInstitutionDialog = ({
  open, onClose, onCreated
}: { open: boolean; onClose: () => void; onCreated: () => void }) => {
  const [form, setForm] = useState({ nombre: '', ciudad: '', direccion: '', email: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handle = async () => {
    if (!form.nombre || !form.ciudad) return;
    setSaving(true);
    try {
      await institutionApi.createInstitution(form);
      toast({ title: '✅ Institución creada', description: `${form.nombre} fue registrada correctamente.` });
      setForm({ nombre: '', ciudad: '', direccion: '', email: '' });
      onCreated();
      onClose();
    } catch {
      toast({ title: 'Error', description: 'No se pudo crear la institución.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nueva Institución</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          {[
            { label: 'Nombre del colegio *', key: 'nombre', placeholder: 'Ej: Colegio Técnico Nacional' },
            { label: 'Ciudad *', key: 'ciudad', placeholder: 'Ej: Buenos Aires' },
            { label: 'Dirección', key: 'direccion', placeholder: 'Ej: Av. Siempre Viva 742' },
            { label: 'Email institucional', key: 'email', placeholder: 'secretaria@colegio.edu.ar' },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label>{f.label}</Label>
              <Input placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handle} disabled={saving || !form.nombre || !form.ciudad}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Crear Institución
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ── Create User Dialog ── */
const CreateUserDialog = ({
  open, onClose, institutionId, onCreated
}: { open: boolean; onClose: () => void; institutionId: number; onCreated: () => void }) => {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', role: 'admin' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handle = async () => {
    if (!form.nombre || !form.email || !form.password) return;
    setSaving(true);
    try {
      const roleInfo = ROLE_MAP[form.role];
      await institutionApi.createUser({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        roleId: roleInfo.roleId,
        institucionId: institutionId,
        planId: 3,
      });
      toast({ title: '✅ Usuario creado', description: `${form.nombre} fue agregado correctamente.` });
      setForm({ nombre: '', email: '', password: '', role: 'admin' });
      onCreated();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || 'No se pudo crear el usuario.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Agregar Usuario a la Institución</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Rol *</Label>
            <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_MAP).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {[
            { label: 'Nombre completo *', key: 'nombre', type: 'text', placeholder: 'Ana García' },
            { label: 'Email *', key: 'email', type: 'email', placeholder: 'docente@colegio.edu.ar' },
            { label: 'Contraseña *', key: 'password', type: 'password', placeholder: '········' },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label>{f.label}</Label>
              <Input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handle} disabled={saving || !form.nombre || !form.email || !form.password}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Agregar Usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ── Clone Institution Dialog ── */
const CloneInstitutionDialog = ({
  open, onClose, sourceInstitution, onCreated
}: { open: boolean; onClose: () => void; sourceInstitution: any; onCreated: () => void }) => {
  const [form, setForm] = useState({ 
    nombre: `${sourceInstitution?.nombre || ''} (Copia)`, 
    ciudad: sourceInstitution?.ciudad || '', 
    email: '',
    adminNombre: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handle = async () => {
    if (!form.nombre || !form.adminEmail || !form.adminPassword) return;
    setSaving(true);
    try {
      await institutionApi.cloneInstitution(sourceInstitution.id, form);
      toast({ 
        title: '✅ Institución Clonada', 
        description: `Se ha replicado el currículo en ${form.nombre}.` 
      });
      onCreated();
      onClose();
    } catch (err: any) {
      toast({ 
        title: 'Error al clonar', 
        description: err?.data?.message || 'No se pudo replicar la institución.', 
        variant: 'destructive' 
      });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicar Institución (Plantilla)</DialogTitle>
          <p className="text-xs text-slate-500">
            Se clonarán todos los cursos y contenidos de <span className="font-bold">{sourceInstitution?.nombre}</span>.
          </p>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Datos de la Nueva Sede</h4>
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Nombre de la Sede *</Label>
                <Input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Ciudad</Label>
                <Input value={form.ciudad} onChange={e => setForm(p => ({ ...p, ciudad: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email Institucional</Label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Nuevo Administrador</h4>
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Nombre Completo *</Label>
                <Input placeholder="Ej: Juan Pérez" value={form.adminNombre} onChange={e => setForm(p => ({ ...p, adminNombre: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email de Acceso *</Label>
                <Input type="email" placeholder="admin@nueva-sede.edu" value={form.adminEmail} onChange={e => setForm(p => ({ ...p, adminEmail: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Contraseña Temporal *</Label>
                <Input type="password" placeholder="········" value={form.adminPassword} onChange={e => setForm(p => ({ ...p, adminPassword: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handle} disabled={saving || !form.nombre || !form.adminEmail || !form.adminPassword}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            Empezar Clonación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
const CreateCourseDialog = ({
  open, onClose, institutionId, onCreated
}: { open: boolean; onClose: () => void; institutionId: number; onCreated: () => void }) => {
  const [form, setForm] = useState({ nombre: '', nivel: '1' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handle = async () => {
    if (!form.nombre) return;
    setSaving(true);
    try {
      await institutionApi.createCourse({ nombre: form.nombre, nivel: parseInt(form.nivel), institucionId: institutionId });
      toast({ title: '✅ Curso creado', description: `${form.nombre} fue creado en la institución.` });
      setForm({ nombre: '', nivel: '1' });
      onCreated();
      onClose();
    } catch {
      toast({ title: 'Error', description: 'No se pudo crear el curso.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Nuevo Curso</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nombre del curso *</Label>
            <Input placeholder="Ej: 3ro A — Tecnología" value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Nivel</Label>
            <Select value={form.nivel} onValueChange={v => setForm(p => ({ ...p, nivel: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['1', '2', '3', '4', '5'].map(n => (
                  <SelectItem key={n} value={n}>Nivel {n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handle} disabled={saving || !form.nombre}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Crear Curso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ── Institution Card ── */
const InstitutionCard = ({ institution, onRefresh }: { institution: any; onRefresh: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const { toast } = useToast();

  const loadDetails = async () => {
    if (loadingDetails) return;
    setLoadingDetails(true);
    try {
      const [u, c] = await Promise.all([
        institutionApi.getInstitutionalUsers(institution.id),
        institutionApi.getCourses(institution.id),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setCourses(Array.isArray(c) ? c : []);
    } catch { /* silent */ }
    finally { setLoadingDetails(false); }
  };

  const handleExpand = () => {
    setExpanded(p => !p);
    if (!expanded) loadDetails();
  };

  const handleDeleteCourse = async (courseId: number, nombre: string) => {
    if (!confirm(`¿Eliminar el curso "${nombre}"?`)) return;
    try {
      await institutionApi.deleteCourse(courseId);
      toast({ title: 'Curso eliminado' });
      loadDetails();
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar.', variant: 'destructive' });
    }
  };

  const roleLabel = (roleId: number) => {
    if (roleId === 8) return { label: 'Admin', color: 'bg-violet-100 text-violet-700' };
    if (roleId === 9) return { label: 'Docente', color: 'bg-blue-100 text-blue-700' };
    return { label: 'Estudiante', color: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div 
        onClick={handleExpand} 
        onKeyDown={(e) => e.key === 'Enter' && handleExpand()}
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between p-6 text-left gap-4 hover:bg-slate-50 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">{institution.nombre}</h3>
            <p className="text-sm text-slate-500 font-medium">{institution.ciudad}{institution.email ? ` · ${institution.email}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={(e) => { e.stopPropagation(); setShowClone(true); }}
            title="Clonar institución (Plantilla)"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Badge variant="secondary" className="text-xs">ID #{institution.id}</Badge>
          {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-100 overflow-hidden"
          >
            <div className="p-6 space-y-6 bg-slate-50/50">
              {loadingDetails ? (
                <div className="flex items-center gap-3 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando datos...
                </div>
              ) : (
                <>
                  {/* Courses section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" /> Cursos ({courses.length})
                      </h4>
                      <Button size="sm" variant="outline" onClick={() => setShowAddCourse(true)}
                        className="h-8 rounded-xl text-xs gap-1.5">
                        <Plus className="w-3 h-3" /> Nuevo Curso
                      </Button>
                    </div>
                    {courses.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">Sin cursos. Crea el primero.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {courses.map((c: any) => (
                          <div key={c.id} className="flex items-center justify-between px-4 py-2 bg-white rounded-xl border border-slate-200 group">
                            <div className="flex items-center gap-2">
                              <Hash className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="text-sm font-bold text-slate-700">{c.nombre}</span>
                              {c.nivel && <Badge variant="secondary" className="text-[10px]">Nivel {c.nivel}</Badge>}
                            </div>
                            <button onClick={() => handleDeleteCourse(c.id, c.nombre)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Users section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-violet-500" /> Usuarios ({users.length})
                      </h4>
                      <Button size="sm" variant="outline" onClick={() => setShowAddUser(true)}
                        className="h-8 rounded-xl text-xs gap-1.5">
                        <UserPlus className="w-3 h-3" /> Agregar Usuario
                      </Button>
                    </div>
                    {users.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">Sin usuarios. Agrega un admin institucional.</p>
                    ) : (
                      <div className="space-y-2">
                        {users.map((u: any) => {
                          const r = roleLabel(u.roleId);
                          return (
                            <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-black text-xs">
                                {(u.nombre || '?')[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{u.nombre}</p>
                                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                              </div>
                              <Badge className={cn('text-[10px] shrink-0', r.color)}>{r.label}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAddUser && (
        <CreateUserDialog open institutionId={institution.id}
          onClose={() => setShowAddUser(false)} onCreated={loadDetails} />
      )}
      {showAddCourse && (
        <CreateCourseDialog open institutionId={institution.id}
          onClose={() => setShowAddCourse(false)} onCreated={loadDetails} />
      )}
      {showClone && (
        <CloneInstitutionDialog open sourceInstitution={institution}
          onClose={() => setShowClone(false)} onCreated={onRefresh} />
      )}
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN VIEW
══════════════════════════════════════ */
export const AdminInstitutionsView = () => {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await institutionApi.getAllInstitutions();
      setInstitutions(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = institutions.filter(i =>
    i.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    i.ciudad?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Input
          placeholder="Buscar por nombre o ciudad..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm h-11 rounded-xl"
        />
        <Button onClick={() => setShowCreate(true)}
          className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
          <Plus className="w-4 h-4" /> Nueva Institución
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Instituciones', value: institutions.length, icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Filtradas', value: filtered.length, icon: Check, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Sin usuarios', value: '-', icon: Users, color: 'text-slate-600 bg-slate-50' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-3 justify-center py-20 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando instituciones...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Building2 className="w-12 h-12 text-slate-200 mx-auto" />
          <p className="text-slate-400 font-bold">
            {search ? 'No hay resultados para tu búsqueda.' : 'No hay instituciones aún. ¡Crea la primera!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inst => (
            <InstitutionCard key={inst.id} institution={inst} onRefresh={load} />
          ))}
        </div>
      )}

      <CreateInstitutionDialog open={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};

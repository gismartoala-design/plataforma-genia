import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Gamepad2, Activity, BookOpen, Settings, Pencil, Eye, EyeOff, Star, Rocket, Sparkles, Map, Trophy, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import kidsProfessorApi from '../services/kidsProfessor.api';
import { professorApi } from '@/features/professor/services/professor.api';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function KidsProfessorDashboard({ user }: { user: any }) {
  const [, setLocation] = useLocation();
  const [modules, setModules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newModTitle, setNewModTitle] = useState("");
  const [newModDesc, setNewModDesc] = useState("");
  const [newModDuration, setNewModDuration] = useState("");

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editModTitle, setEditModTitle] = useState("");
  const [editModDesc, setEditModDesc] = useState("");
  const [editModDuration, setEditModDuration] = useState("");
  const [editModBlocked, setEditModBlocked] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchModules();
    }
  }, [user?.id]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const data = await kidsProfessorApi.getModules(user.id);
      setModules(data);
      
      const coursesData = await professorApi.getProfessorCourses(user.id);
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addModule = async () => {
    if (!newModTitle.trim()) {
      toast({ title: "Falta el título", description: "Ponle un nombre a tu nueva aventura." });
      return;
    }
    try {
      const newModule = await kidsProfessorApi.createModule({
        title: newModTitle,
        description: newModDesc || "Contenido para pequeños genios",
        duracionDias: Number(newModDuration) || 0,
        professorId: user.id,
        cursoId: selectedCourse ? selectedCourse.id : undefined
      });
      setModules([...modules, newModule]);
      toast({ title: "¡Módulo Creado!", description: "Ahora puedes añadir niveles y actividades." });
      setShowAddDialog(false);
      setNewModTitle("");
      setNewModDesc("");
      setNewModDuration("");
      setLocation(`/kids-teach/module/${newModule.id}`);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el módulo.", variant: "destructive" });
    }
  };

  const openEditDialog = (e: React.MouseEvent, mod: any) => {
    e.stopPropagation();
    setEditingModule(mod);
    setEditModTitle(mod.nombreModulo || "");
    setEditModDesc(mod.descripcion || "");
    setEditModDuration(mod.duracionDias ? String(mod.duracionDias) : "");
    setEditModBlocked(mod.bloqueado === true);
    setShowEditDialog(true);
  };

  const saveEditModule = async () => {
    if (!editModTitle.trim()) {
      toast({ title: "Falta el título", description: "El módulo debe tener un nombre." });
      return;
    }
    try {
      const updated = await kidsProfessorApi.updateModule(editingModule.id, {
        title: editModTitle,
        description: editModDesc,
        duration: Number(editModDuration) || 0,
        bloqueado: editModBlocked
      });
      setModules(modules.map(m => m.id === editingModule.id ? { ...m, ...updated } : m));
      toast({ title: "¡Módulo Actualizado!", description: "Los cambios se guardaron exitosamente." });
      setShowEditDialog(false);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el módulo.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("edu_token");
    localStorage.removeItem("edu_user");
    window.location.href = "/login-kids";
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans" style={{ background: 'linear-gradient(145deg, #f0f9ff 0%, #faf5ff 50%, #fffbeb 100%)' }}>
      {/* Animated floating blobs (Kids Aesthetic) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${150 + i * 70}px`, height: `${150 + i * 70}px`,
              background: [`#818cf8`,`#34d399`,`#fb923c`,`#a78bfa`,`#38bdf8`,`#f472b6`][i],
              top: `${[10, 70, 30, 80, 50, 20][i]}%`,
              left: `${[5, 85, 40, 20, 95, 60][i]}%`,
            }}
            animate={{ y: [0, -40, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 5 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10 px-6 py-10 md:px-10 space-y-10">
        {/* Header Section */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-wrap justify-between items-center bg-white/80 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl border-4 border-white gap-6"
        >
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0] }}
              className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-5xl shadow-xl border-4 border-white"
            >
              🧑‍🏫
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">
                Laboratorio del <span className="text-indigo-600">Profesor Kids</span>
              </h1>
              <p className="text-slate-500 font-bold text-lg">¡Bienvenido, <span className="text-fuchsia-500">{user?.name?.split(' ')[0]}</span>! Prepárate para crear magia. ✨</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-br from-indigo-500 to-indigo-700 h-16 px-10 rounded-[2rem] text-white font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-300/40 border-x-4 border-t-4 border-b-8 border-indigo-900 active:border-b-4 active:translate-y-1 transition-all"
                    >
                        <Rocket className="w-6 h-6" /> CREAR NUEVA AVENTURA
                    </motion.button>
                </DialogTrigger>
                <DialogContent className="rounded-[3rem] border-[8px] border-indigo-50 p-10">
                    <DialogHeader>
                        <DialogTitle className="text-4xl font-black text-slate-800 text-center mb-4">Nueva Aventura Kids 🚀</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-8">
                        <div className="space-y-3">
                            <Label className="text-lg font-black text-indigo-600 ml-2">Nombre del Mundo Mágico</Label>
                            <Input 
                                value={newModTitle} 
                                onChange={e => setNewModTitle(e.target.value)} 
                                placeholder="Ej: Islas de los Algoritmos"
                                className="rounded-[2rem] h-16 border-4 border-indigo-50 focus:border-indigo-200 text-xl font-bold bg-slate-50/50 px-8"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-lg font-black text-fuchsia-600 ml-2">Descripción de la Misión</Label>
                            <Input 
                                value={newModDesc} 
                                onChange={e => setNewModDesc(e.target.value)} 
                                placeholder="Explica de qué trata este viaje..."
                                className="rounded-[2rem] h-16 border-4 border-fuchsia-50 focus:border-fuchsia-200 text-lg font-bold bg-slate-50/50 px-8"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-6">
                        <Button variant="ghost" onClick={() => setShowAddDialog(false)} className="h-14 rounded-2xl font-black text-slate-400">Cancelar</Button>
                        <Button onClick={addModule} className="flex-1 h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg shadow-xl">¡CREAR MUNDO!</Button>
                    </div>
                </DialogContent>
             </Dialog>

             <button 
                onClick={handleLogout}
                className="w-16 h-16 rounded-[1.5rem] bg-rose-500 text-white border-x-4 border-t-4 border-b-8 border-rose-700 shadow-lg flex items-center justify-center active:border-b-4 active:translate-y-1 transition-all"
             >
                <LogOut className="w-7 h-7" />
             </button>
          </div>
        </motion.header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Users, label: 'Pequeños Exploradores', val: '24', color: 'from-sky-400 to-blue-500', shadow: 'shadow-sky-200' },
            { icon: Map, label: 'Mundos Creados', val: modules.length.toString(), color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200' },
            { icon: Trophy, label: 'Promedio de Logros', val: '92%', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className={`bg-white/90 backdrop-blur-xl p-8 rounded-[3.5rem] border-4 border-white shadow-xl flex items-center gap-6 ${stat.shadow}`}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-[2rem] flex items-center justify-center text-white shadow-lg`}>
                <stat.icon className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black text-slate-800 tracking-tighter">{stat.val}</p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          
          {!selectedCourse ? (
            // VISTA DE CURSOS
            <>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase underline decoration-emerald-200 decoration-8 underline-offset-8">
                  Tus Cursos Asignados
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? (
                    <div className="col-span-full flex justify-center py-24"><p className="animate-pulse font-bold text-slate-500">Cargando...</p></div>
                ) : courses.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-24 text-center bg-white/60 rounded-[3rem] border-4 border-white shadow-sm">
                        <p className="text-2xl font-black text-slate-400">Aún no tienes cursos asignados.</p>
                    </motion.div>
                ) : (
                    courses.map((curso, idx) => (
                        <motion.div
                            key={curso.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.03, y: -10 }}
                            className="group cursor-pointer"
                            onClick={() => setSelectedCourse(curso)}
                        >
                            <div className="relative bg-white p-8 rounded-[3.5rem] shadow-2xl h-[280px] flex flex-col justify-between border-x-4 border-t-4 border-b-[16px] border-emerald-50 hover:border-emerald-100 transition-all">
                                <div className="absolute top-6 right-6 text-6xl opacity-20 drop-shadow-lg">
                                  {['🎒', '🏫', '🖍️', '📚'][idx % 4]}
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-2">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-black leading-tight text-slate-800 drop-shadow-sm">{curso.nombre}</h3>
                                </div>
                                <div className="w-full bg-emerald-500 text-white h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-md">
                                    Ver Mundos <Rocket className="w-5 h-5"/>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
              </div>
            </>
          ) : (
            // VISTA DE MÓDULOS DEL CURSO SELECCIONADO
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl border-2 border-white mb-6 shadow-sm">
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl text-slate-600 font-black tracking-widest hover:bg-slate-50 transition-all border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 text-sm uppercase"
                >
                  ◀ Volver a Cursos
                </button>
                <div className="flex items-center gap-3">
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm py-2 px-4 rounded-xl border-0 shadow-inner">
                    Viendo: {selectedCourse.nombre}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase underline decoration-indigo-200 decoration-8 underline-offset-8">Mundos de Aventura</h2>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 gap-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="text-7xl"
                >🍭</motion.div>
                <p className="text-2xl font-black text-indigo-400 animate-pulse">Echando chispas mágicas...</p>
              </div>
            ) : modules.filter(m => m.cursoId === selectedCourse.id || (!m.cursoId && selectedCourse)).length === 0 ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="col-span-full p-20 text-center bg-white/60 backdrop-blur-xl rounded-[4rem] border-8 border-dashed border-white shadow-inner flex flex-col items-center gap-6"
              >
                <div className="text-9xl">✨</div>
                <div>
                  <h3 className="text-3xl font-black text-indigo-600">Aún no hay mundos en este curso...</h3>
                  <p className="text-slate-500 font-bold text-xl mt-2 max-w-sm mx-auto">¡Es un lienzo en blanco! Usa el botón de arriba para crear tu primera aventura espacial en este curso.</p>
                </div>
              </motion.div>
            ) : (
              modules.filter(m => m.cursoId === selectedCourse.id || (!m.cursoId && selectedCourse)).map((mod, idx) => {
                const colors = [
                  'from-emerald-400 to-teal-500',
                  'from-orange-400 to-rose-500',
                  'from-violet-500 to-fuchsia-500',
                  'from-amber-400 to-yellow-500',
                  'from-sky-400 to-indigo-500'
                ][idx % 5];
                
                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.03, y: -10 }}
                    className="group"
                  >
                    <div className={`relative bg-gradient-to-br ${colors} p-8 rounded-[3.5rem] text-white shadow-2xl h-[360px] flex flex-col justify-between border-x-4 border-t-4 border-b-[16px] border-black/20 overflow-hidden cursor-pointer active:translate-y-2 active:border-b-4 transition-all`}
                         onClick={() => setLocation(`/kids-teach/module/${mod.id}`)}>
                      
                      {/* Floating Decoration */}
                      <motion.div 
                        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-6 right-6 text-6xl opacity-40 drop-shadow-lg"
                      >
                        {['🪐', '⭐', '🎈', '🎨', '🚀'][idx % 5]}
                      </motion.div>

                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/30">
                            {mod.bloqueado ? '🔒 Oculto' : '✨ Visible'}
                          </span>
                        </div>
                        <h3 className="text-4xl font-black leading-tight drop-shadow-xl">{mod.nombreModulo}</h3>
                        <p className="text-white/80 font-bold line-clamp-3 text-lg drop-shadow-md">
                          {mod.descripcion || "¡Una increíble aventura para aprender cosas asombrosas!"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <button 
                          className="flex-1 bg-white text-indigo-600 h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-black/10 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all border-b-6 border-slate-200 active:border-b-0"
                          onClick={(e) => { e.stopPropagation(); setLocation(`/kids-teach/module/${mod.id}`); }}
                        >
                          <Pencil className="w-5 h-5" /> GESTIONAR
                        </button>
                        <button 
                          onClick={(e) => openEditDialog(e, mod)}
                          className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md border-2 border-white/30 transition-all"
                        >
                          <Settings className="w-8 h-8 text-white" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
          </>
          )}
        </div>
      </div>

      <AnimatePresence>
         {showEditDialog && (
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="rounded-[3rem] border-[8px] border-indigo-50 p-10 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-800 text-center mb-4">Ajustar Mundo 🛠️</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-lg font-black text-slate-700 ml-2">Nombre del Mundo</Label>
                            <Input 
                                value={editModTitle} 
                                onChange={e => setEditModTitle(e.target.value)} 
                                className="rounded-[2rem] h-14 border-4 border-slate-50 focus:border-indigo-200 text-xl font-bold bg-white px-8"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-lg font-black text-slate-700 ml-2">Descripción</Label>
                            <Input 
                                value={editModDesc} 
                                onChange={e => setEditModDesc(e.target.value)} 
                                className="rounded-[2rem] h-14 border-4 border-slate-50 focus:border-indigo-200 font-bold bg-white px-8"
                            />
                        </div>
                        
                        <button 
                            onClick={(e) => { e.preventDefault(); setEditModBlocked(!editModBlocked); }}
                            className={`w-full h-16 rounded-[2rem] flex items-center justify-between px-8 border-4 transition-all ${editModBlocked ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                {editModBlocked ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                                <span className="font-black text-lg uppercase tracking-tight">{editModBlocked ? 'OCULTO AL GRUPO' : 'VISIBLE PARA TODOS'}</span>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-all ${editModBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editModBlocked ? 'left-1' : 'right-1'}`} />
                            </div>
                        </button>
                    </div>
                    <div className="flex gap-4 pt-6">
                        <Button variant="ghost" onClick={() => setShowEditDialog(false)} className="h-14 rounded-2xl font-black text-slate-400">Cancelar</Button>
                        <Button onClick={saveEditModule} className="flex-1 h-16 rounded-[2rem] bg-indigo-600 text-white font-black text-lg">GUARDAR MAGIA</Button>
                    </div>
                </DialogContent>
            </Dialog>
         )}
      </AnimatePresence>
    </div>
  );
}

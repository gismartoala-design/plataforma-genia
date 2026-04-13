import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Gamepad2, Activity, BookOpen, Settings, Pencil, Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'wouter';
import kidsProfessorApi from '../services/kidsProfessor.api';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function KidsProfessorDashboard({ user }: { user: any }) {
  const [, setLocation] = useLocation();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast({ title: "Error", description: "No se pudieron cargar los módulos.", variant: "destructive" });
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
        professorId: user.id
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm">
         <div>
             <h1 className="text-3xl font-black text-slate-800 tracking-tight">Panel de Profesor Kids</h1>
             <p className="text-slate-500 font-medium">Gestiona y crea mundos de aprendizaje para los más pequeños.</p>
         </div>
         <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
                <Button className="rounded-2xl h-14 px-8 font-black bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02]">
                    <Plus className="w-6 h-6 mr-2" /> CREAR NUEVO MÓDULO
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-4 border-indigo-50">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800">Nueva Aventura Kids</DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Nombre del Módulo</Label>
                        <Input 
                            value={newModTitle} 
                            onChange={e => setNewModTitle(e.target.value)} 
                            placeholder="Ej: Exploradores del Código"
                            className="rounded-xl h-12 border-2 focus:border-indigo-400 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Descripción Corta</Label>
                        <Input 
                            value={newModDesc} 
                            onChange={e => setNewModDesc(e.target.value)} 
                            placeholder="¿De qué trata este módulo?"
                            className="rounded-xl h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Duración (Días)</Label>
                        <Input 
                            type="number"
                            value={newModDuration} 
                            onChange={e => setNewModDuration(e.target.value)} 
                            placeholder="Ej: 30"
                            className="rounded-xl h-12 w-32"
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)} className="rounded-xl font-bold h-12">Cancelar</Button>
                    <Button onClick={addModule} className="rounded-xl font-black h-12 px-8 bg-indigo-600">¡CREAR AHORA!</Button>
                </DialogFooter>
            </DialogContent>
         </Dialog>

         <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="rounded-[2rem] border-4 border-indigo-50">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800">Editar Aventura Kids</DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Nombre del Módulo</Label>
                        <Input 
                            value={editModTitle} 
                            onChange={e => setEditModTitle(e.target.value)} 
                            className="rounded-xl h-12 border-2 focus:border-indigo-400 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Descripción Corta</Label>
                        <Input 
                            value={editModDesc} 
                            onChange={e => setEditModDesc(e.target.value)} 
                            className="rounded-xl h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Duración (Días)</Label>
                        <Input 
                            type="number"
                            value={editModDuration} 
                            onChange={e => setEditModDuration(e.target.value)} 
                            className="rounded-xl h-12 w-32"
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                        <div>
                            <Label className="font-black text-slate-800 text-lg flex items-center gap-2">
                                {editModBlocked ? <EyeOff className="text-red-500" /> : <Eye className="text-emerald-500" />}
                                VISIBILIDAD
                            </Label>
                            <p className="text-xs text-slate-500 font-bold uppercase">{editModBlocked ? 'Oculto para los estudiantes' : 'Visible para los estudiantes'}</p>
                        </div>
                        <Button 
                            variant={editModBlocked ? "destructive" : "outline"}
                            onClick={() => setEditModBlocked(!editModBlocked)} 
                            className="rounded-xl font-black h-12 px-6 shadow-sm transition-all"
                        >
                            {editModBlocked ? 'DESBLOQUEAR' : 'BLOQUEAR'}
                        </Button>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-xl font-bold h-12">Cancelar</Button>
                    <Button onClick={saveEditModule} className="rounded-xl font-black h-12 px-8 bg-indigo-600">GUARDAR CAMBIOS</Button>
                </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-6 group hover:border-indigo-200 transition-colors">
           <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
               <Users className="w-8 h-8" />
           </div>
           <div>
               <h3 className="font-bold text-slate-500 mb-1">Alumnos Kids</h3>
               <p className="text-4xl font-black text-slate-800">24</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-6 group hover:border-purple-200 transition-colors">
           <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
               <Gamepad2 className="w-8 h-8" />
           </div>
           <div>
               <h3 className="font-bold text-slate-500 mb-1">Módulos Activos</h3>
               <p className="text-4xl font-black text-slate-800">{modules.length}</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-6 group hover:border-emerald-200 transition-colors">
           <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
               <Activity className="w-8 h-8" />
           </div>
           <div>
               <h3 className="font-bold text-slate-500 mb-1">Tasa de Completitud</h3>
               <p className="text-4xl font-black text-slate-800">92%</p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800">Tus Módulos de Enseñanza</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Cargando aventuras...</p>
          ) : modules.length === 0 ? (
            <Card className="col-span-full border-dashed border-2 p-12 text-center bg-slate-50">
              <p className="text-slate-400 font-medium">Aún no has creado ningún módulo. ¡Comienza uno nuevo!</p>
            </Card>
          ) : (
            modules.map((mod) => (
              <Card 
                key={mod.id} 
                className="border-2 border-slate-100 hover:border-indigo-100 transition-all cursor-pointer overflow-hidden group shadow-sm hover:shadow-md"
                onClick={() => setLocation(`/kids-teach/module/${mod.id}`)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl transition-colors ${mod.bloqueado ? 'bg-slate-200 text-slate-400' : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                        {mod.bloqueado ? <EyeOff className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                      </div>
                      <CardTitle className={`text-lg font-bold ${mod.bloqueado ? 'text-slate-400' : ''}`}>
                        {mod.nombreModulo}
                        {mod.bloqueado && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">OCULTO</span>}
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => openEditDialog(e, mod)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">
                    {mod.descripcion || "Módulo interactivo para el aprendizaje de tecnología y algoritmos."}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                       {mod.duracionDias ? `${mod.duracionDias} DÍAS` : "DURACIÓN LIBRE"}
                    </span>
                    <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50">
                       Gestionar <Plus className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

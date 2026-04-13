import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, PlusCircle, Trash, Play, Sparkles, Image as ImageIcon, Volume2, Type, Move, Scaling, RotateCw, Trophy, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import kidsProfessorApi from '../services/kidsProfessor.api';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export function KidsCourseEditor({ user, id: nivelId, onClose }: { user: any, id?: number, onClose?: () => void }) {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (nivelId) {
      fetchTemplate();
    }
  }, [nivelId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const data = await kidsProfessorApi.getTemplateByLevel(nivelId!);
      if (data) {
        setTitle(data.titulo || '');
        setDescription(data.descripcion || '');
        setSteps(data.actividades || []);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRACTemplate = () => {
    const racSteps = [
      { type: 'welcome', data: { title: '¡Bienvenidos a la Misión!', subtitle: 'Hoy aprenderemos a construir en Roblox', buttonText: '¡Comenzar!', backgroundUrl: '', characterUrl: '', audioUrl: '' } },
      { type: 'video', data: { title: 'Mira este Tutorial', videoUrl: '' } },
      { type: 'choice', data: { question: '¿Cuál es el bloque correcto?', correctIndex: 0, options: [{ label: 'Bloque A', imageUrl: '' }, { label: 'Bloque B', imageUrl: '' }, { label: 'Bloque C', imageUrl: '' }] } },
      { type: 'drag-drop', data: { title: '¡A construir la pared!', totalBlocks: 3, blockImageUrl: '' } },
      { type: 'scale', data: { title: '¡Haz el bloque más grande!', initialValue: 1, imageUrl: '' } },
      { type: 'rotate', data: { title: '¡Gira el techo!', initialValue: 0, imageUrl: '' } },
      { type: 'final-choice', data: { title: '¿Qué quieres construir ahora?' } },
      { type: 'celebration', data: { title: '¡MISIÓN CUMPLIDA!', message: 'Eres un gran constructor de Roblox.', badgeUrl: '' } }
    ];
    setSteps(racSteps);
    toast({ title: "Plantilla RAC cargada", description: "Se han generado las 8 pantallas base." });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "El título es requerido.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nivelId,
        titulo: title,
        descripcion: description,
        actividades: steps,
        configuracion: {}
      };

      if (nivelId) {
        await kidsProfessorApi.saveTemplate(nivelId, payload);
        toast({ title: "¡Aventura Guardada!", description: "Los cambios se han guardado correctamente." });
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la aventura.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStepData = (idx: number, newData: any) => {
    const newSteps = [...steps];
    newSteps[idx].data = { ...newSteps[idx].data, ...newData };
    setSteps(newSteps);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border shadow-sm">
        <div>
           <h1 className="text-3xl font-black text-slate-800">Creador Mágico</h1>
           <p className="text-slate-500 font-medium">Diseña actividades paso a paso para tus alumnos Kids.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => onClose ? onClose() : setLocation('/kids-teach')} className="rounded-xl h-12">Volver</Button>
           <Button 
            onClick={handleSave} 
            disabled={loading}
            className="rounded-xl h-12 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md"
           >
             <Save className="w-5 h-5 mr-2" /> {loading ? "Guardando..." : "Guardar Aventura"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 block">Título de la Aventura</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ej: El misterio de los números"
                className="text-2xl h-16 rounded-2xl border-2 border-slate-200 focus-visible:ring-indigo-400 font-bold"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 block">Descripción</label>
              <Input 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Breve descripción para padres y profes..."
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                Pasos de la Aventura 
                <span className="bg-slate-100 text-slate-500 text-sm px-3 py-1 rounded-full">{steps.length} pasos</span>
              </h2>
              <Button 
                variant="outline" 
                onClick={loadRACTemplate}
                className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold gap-2"
              >
                <Sparkles className="w-4 h-4" /> Cargar Plantilla RAC
              </Button>
            </div>
            
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <Card key={idx} className="rounded-3xl border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-6 py-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-indigo-500">{idx + 1}</Badge>
                      <span className="font-bold text-slate-700 uppercase text-xs tracking-wider">{step.type}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    {/* Render fields based on step type */}
                    {step.type === 'welcome' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">Título</label>
                          <Input value={step.data.title} onChange={e => updateStepData(idx, { title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">Subtítulo</label>
                          <Input value={step.data.subtitle} onChange={e => updateStepData(idx, { subtitle: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">URL Personaje (PNG)</label>
                          <Input value={step.data.characterUrl} onChange={e => updateStepData(idx, { characterUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">URL Audio (MP3)</label>
                          <Input value={step.data.audioUrl} onChange={e => updateStepData(idx, { audioUrl: e.target.value })} placeholder="https://..." />
                        </div>
                      </div>
                    )}

                    {step.type === 'video' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">URL del Video (YouTube/Embed)</label>
                        <Input value={step.data.videoUrl} onChange={e => updateStepData(idx, { videoUrl: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
                      </div>
                    )}

                    {step.type === 'choice' && (
                      <div className="space-y-4">
                        <Input value={step.data.question} onChange={e => updateStepData(idx, { question: e.target.value })} placeholder="¿Pregunta?" />
                        <div className="grid grid-cols-3 gap-2">
                          {step.data.options.map((opt: any, oi: number) => (
                            <div key={oi} className="space-y-1">
                              <Input 
                                value={opt.imageUrl} 
                                onChange={e => {
                                  const newOpts = [...step.data.options];
                                  newOpts[oi].imageUrl = e.target.value;
                                  updateStepData(idx, { options: newOpts });
                                }} 
                                placeholder={`Imagen ${oi+1}`}
                                className="text-xs"
                              />
                              <Button 
                                variant={step.data.correctIndex === oi ? "default" : "outline"} 
                                size="sm" 
                                className="w-full text-[10px]"
                                onClick={() => updateStepData(idx, { correctIndex: oi })}
                              >
                                {step.data.correctIndex === oi ? "Correcta" : "Marcar Correcta"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(step.type === 'scale' || step.type === 'rotate') && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Instrucción</label>
                        <Input value={step.data.title} onChange={e => updateStepData(idx, { title: e.target.value })} />
                        <label className="text-xs font-bold text-slate-400 uppercase">URL Imagen Objeto</label>
                        <Input value={step.data.imageUrl} onChange={e => updateStepData(idx, { imageUrl: e.target.value })} placeholder="https://..." />
                      </div>
                    )}

                    {step.type === 'celebration' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">Mensaje Final</label>
                          <Input value={step.data.message} onChange={e => updateStepData(idx, { message: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">URL Insignia/Medalla</label>
                          <Input value={step.data.badgeUrl} onChange={e => updateStepData(idx, { badgeUrl: e.target.value })} placeholder="https://..." />
                        </div>
                      </div>
                    )}

                    {!['welcome', 'video', 'choice', 'scale', 'rotate', 'celebration'].includes(step.type) && (
                      <p className="text-slate-400 italic text-sm text-center py-4">Configuración simplificada para este tipo de paso.</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setSteps([...steps, { type: 'welcome', data: { title: '', subtitle: '' } }])}
                className="flex-1 h-14 border-dashed border-2 text-indigo-500 hover:bg-indigo-50 rounded-2xl font-bold"
              >
                <PlusCircle className="w-5 h-5 mr-2" /> Añadir Pantalla
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm sticky top-8">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" /> Atajos de Pantalla
            </h3>
            <div className="grid grid-cols-2 gap-2">
               {[
                 { label: 'Bienvenida', type: 'welcome', icon: Type },
                 { label: 'Video', type: 'video', icon: Play },
                 { label: 'Pregunta', type: 'choice', icon: ImageIcon },
                 { label: 'Construir', type: 'drag-drop', icon: Move },
                 { label: 'Escalar', type: 'scale', icon: Scaling },
                 { label: 'Girar', type: 'rotate', icon: RotateCw },
                 { label: 'Reto', type: 'final-choice', icon: Star },
                 { label: 'Final', type: 'celebration', icon: Trophy },
               ].map(btn => (
                 <Button 
                   key={btn.type}
                   variant="outline" 
                   size="sm"
                   onClick={() => setSteps([...steps, { type: btn.type, data: { title: btn.label } }])}
                   className="justify-start gap-2 h-10 text-xs font-bold rounded-xl border-slate-100 px-3"
                 >
                   <btn.icon className="w-3 h-3 text-indigo-500" /> {btn.label}
                 </Button>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

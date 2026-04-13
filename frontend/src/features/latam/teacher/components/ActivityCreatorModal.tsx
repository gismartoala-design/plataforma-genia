import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Image as ImageIcon, FileText, CheckSquare, Target, Settings, Crown, Database, HelpCircle, ListOrdered, CheckCircle2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { professorApi, ProfessorCourse } from '@/features/professor/services/professor.api';
import { toast } from '@/hooks/use-toast';

export type BlockType = 'NARRATIVE' | 'OPEN_QUESTION' | 'EVALUATION' | 'PROBLEM' | 'TECHNICAL_TABLE' | 'IMAGE_SELECT' | 'REWARD' | 'STEP_BY_STEP' | 'CHECKLIST' | 'DELIVERABLE';

export interface DynamicBlock {
  id: string;
  type: BlockType;
  data: any;
}

export const LAB_TOOLS = [
  { id: 'gdevelop', name: 'GDevelop', url: 'https://editor.gdevelop.io/' },
  { id: 'scratch', name: 'Scratch', url: 'https://scratch.mit.edu/' },
  { id: 'python', name: 'Python Lab', url: 'https://trinket.io/' }
];

const BLOCK_TYPES_CONFIG: Record<BlockType, { label: string, icon: any, color: string, defaultData: any }> = {
  NARRATIVE: { label: 'Narrativa Viva', icon: FileText, color: 'bg-indigo-500', defaultData: { titulo: '', texto: '', multimedia: '' } },
  EVALUATION: { label: 'Quiz Multiopción', icon: CheckSquare, color: 'bg-emerald-500', defaultData: { pregunta: '', opciones: ['Opción A', 'Opción B'], respuestaIndex: 0 } },
  OPEN_QUESTION: { label: 'Pregunta Abierta', icon: HelpCircle, color: 'bg-blue-500', defaultData: { pregunta: '' } },
  PROBLEM: { label: 'Problema Técnico', icon: Target, color: 'bg-rose-500', defaultData: { mision: '', restricciones: '' } },
  TECHNICAL_TABLE: { label: 'Tabla de Datos', icon: Database, color: 'bg-violet-500', defaultData: { columnas: ['Atributo', 'Valor'], filas: [['', '']] } },
  IMAGE_SELECT: { label: 'Análisis Visual', icon: ImageIcon, color: 'bg-cyan-500', defaultData: { instruccion: '', imagenes: [{ url: '', correcta: true }, { url: '', correcta: false }] } },
  STEP_BY_STEP: { label: 'Paso a Paso', icon: ListOrdered, color: 'bg-fuchsia-500', defaultData: { titulo: '', pasos: ['Primer paso'] } },
  CHECKLIST: { label: 'Checklist', icon: CheckCircle2, color: 'bg-teal-500', defaultData: { titulo: '', items: ['Verificar X'] } },
  DELIVERABLE: { label: 'Entregable', icon: UploadCloud, color: 'bg-pink-500', defaultData: { titulo: '', descripcion: '', tipo: 'ARCHIVO' } },
  REWARD: { label: 'Recompensa', icon: Crown, color: 'bg-amber-500', defaultData: { insignia: '', xp: 100 } }
};

export const ActivityCreatorModal = ({ 
  user, onClose, onSuccess, courses, initialCourseId, editingModule
}: { 
  user: any, onClose: () => void, onSuccess?: () => void, courses: ProfessorCourse[], googleStatus?: any, initialCourseId?: number | null, editingModule?: any
}) => {
  const [metadata, setMetadata] = useState({
    courseId: initialCourseId ? String(initialCourseId) : '',
    title: 'Nueva Experiencia Modular',
    edad: '7-10',
    software: 'Ninguno',
    codigo: 'MOD-01',
    tipoFlujo: 'Modular Personalizado'
  });

  const [blocks, setBlocks] = useState<DynamicBlock[]>([]);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS'>('IDLE');

  // Hydrate state if editing
  React.useEffect(() => {
    if (editingModule) {
      const firstLevel = editingModule.levels?.[0];
      if (firstLevel && firstLevel.descripcion) {
        try {
          const content = JSON.parse(firstLevel.descripcion);
          setMetadata(content.metadata || {
            courseId: String(editingModule.cursoId || ''),
            title: editingModule.nombreModulo || 'Sesión Editada',
            edad: '7-10',
            software: 'Ninguno',
            codigo: `MOD-${editingModule.id}`,
            tipoFlujo: 'Modular Personalizado'
          });
          setBlocks(content.blocks || []);
        } catch (e) {
          console.error('Error hydrating session data:', e);
        }
      }
    }
  }, [editingModule]);

  const addBlock = (type: BlockType) => {
    const newBlock: DynamicBlock = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      type,
      data: JSON.parse(JSON.stringify(BLOCK_TYPES_CONFIG[type].defaultData)) // Deep copy
    };
    setBlocks([...blocks, newBlock]);
    setShowBlockPicker(false);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, newData: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, data: newData } : b));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIdx]] = [newBlocks[targetIdx], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSave = async (silent = false) => {
    if (!metadata.courseId) {
      if (!silent) toast({ title: 'Error', description: 'Selecciona un curso válido.', variant: 'destructive' });
      return;
    }
    
    if (!silent) setIsSaving(true);
    setSaveStatus('SAVING');
    
    try {
      const finalPayload = { metadata, blocks };
      let moduleId = editingModule?.id;
      let levelId = editingModule?.levels?.[0]?.id;

      if (editingModule) {
        // UPDATE MODE
        await professorApi.updateModule(moduleId, {
          title: metadata.title,
          nombreModulo: metadata.title,
          description: metadata.tipoFlujo,
          cursoId: Number(metadata.courseId)
        });

        if (levelId) {
          await professorApi.updateLevel(levelId, {
            tituloNivel: metadata.title,
            descripcion: JSON.stringify(finalPayload),
          });
        }
      } else {
        // CREATE MODE
        const parentModule = await professorApi.createModule({
          title: metadata.title,
          nombreModulo: metadata.title,
          description: metadata.tipoFlujo,
          professorId: user?.id?.toString() || '1',
          profesorId: Number(user?.id) || 1,
          cursoId: Number(metadata.courseId)
        });
        moduleId = parentModule.id;

        const newLevel = await professorApi.createLevel(moduleId, {
          tituloNivel: metadata.title,
          orden: 1,
          descripcion: JSON.stringify(finalPayload),
        });
        levelId = newLevel.id;
      }

      setLastSaved(new Date());
      setSaveStatus('SUCCESS');
      if (!silent) toast({ title: editingModule ? 'Cambios Guardados' : 'Experiencia Publicada', description: 'El contenido se sincronizó con éxito.' });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      setSaveStatus('IDLE');
      if (!silent) toast({ title: 'Error de Guardado', description: 'No se pudo sincronizar el contenido', variant: 'destructive' });
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  // AUTOSAVE LOGIC
  React.useEffect(() => {
    if (!editingModule) return; // Autosave only for existing sessions

    const timer = setTimeout(() => {
      handleSave(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [blocks, metadata]);

  // ────────────────────────────────────────────────────────────
  // RENDERIZADORES ESPECÍFICOS DE BLOQUE
  // ────────────────────────────────────────────────────────────

  const renderBlockEditor = (block: DynamicBlock) => {
    const { data } = block;

    switch (block.type) {
      case 'NARRATIVE':
        return (
          <div className="space-y-3">
            <Input value={data.titulo} onChange={e => updateBlock(block.id, {...data, titulo: e.target.value})} placeholder="Título Narrativo..." className="font-bold border-indigo-200 focus-visible:ring-indigo-500" />
            <Textarea value={data.texto} onChange={e => updateBlock(block.id, {...data, texto: e.target.value})} placeholder="Escribe el cuerpo de la historia..." className="min-h-[100px] border-indigo-200 focus-visible:ring-indigo-500" />
            <Input value={data.multimedia} onChange={e => updateBlock(block.id, {...data, multimedia: e.target.value})} placeholder="URL de Imagen o Video de apoyo (Opcional)..." className="border-indigo-200 text-xs" />
          </div>
        );
      case 'OPEN_QUESTION':
        return (
          <div className="space-y-3">
            <Input value={data.pregunta} onChange={e => updateBlock(block.id, {...data, pregunta: e.target.value})} placeholder="Plantea la pregunta disparadora..." className="font-bold border-blue-200 focus-visible:ring-blue-500" />
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 border-dashed">
              <p className="text-xs text-blue-400 italic">El estudiante verá un área de texto grande para elaborar su respuesta de forma libre.</p>
            </div>
          </div>
        );
      case 'EVALUATION':
        return (
          <div className="space-y-4">
            <Input value={data.pregunta} onChange={e => updateBlock(block.id, {...data, pregunta: e.target.value})} placeholder="Pregunta que se evaluará..." className="font-bold border-emerald-200 focus-visible:ring-emerald-500" />
            <div className="space-y-2 pl-4">
              {data.opciones.map((opt: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="radio" name={`eval-${block.id}`} checked={data.respuestaIndex === idx} onChange={() => updateBlock(block.id, {...data, respuestaIndex: idx})} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                  <Input value={opt} onChange={e => {
                    const updated = [...data.opciones]; updated[idx] = e.target.value; updateBlock(block.id, {...data, opciones: updated});
                  }} className="h-9 border-emerald-100 text-sm focus-visible:ring-emerald-500" placeholder={`Alternativa ${idx + 1}`} />
                  <button onClick={() => {
                    const updated = data.opciones.filter((_: any, i: number) => i !== idx); 
                    updateBlock(block.id, {...data, opciones: updated, respuestaIndex: data.respuestaIndex === idx ? 0 : data.respuestaIndex});
                  }} className="text-rose-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <Button variant="ghost" onClick={() => updateBlock(block.id, {...data, opciones: [...data.opciones, '']})} className="h-8 text-[10px] uppercase font-black tracking-widest text-emerald-600 hover:bg-emerald-50">
                <Plus className="w-3 h-3 mr-1" /> Añadir Alternativa
              </Button>
            </div>
          </div>
        );
      case 'PROBLEM':
        return (
           <div className="space-y-3">
             <Input value={data.mision} onChange={e => updateBlock(block.id, {...data, mision: e.target.value})} placeholder="Nombre de la Misión/Desafío..." className="font-bold border-rose-200 focus-visible:ring-rose-500" />
             <Textarea value={data.restricciones} onChange={e => updateBlock(block.id, {...data, restricciones: e.target.value})} placeholder="Especifica las restricciones (ej. ¡No puedes tocar el código del Motor B!)..." className="border-rose-200 focus-visible:ring-rose-500" />
           </div>
        );
      case 'TECHNICAL_TABLE':
        return (
          <div className="space-y-4">
             <div className="flex gap-2 mb-2">
               {data.columnas.map((col: string, cIdx: number) => (
                 <Input key={cIdx} value={col} onChange={e => {
                    const nc = [...data.columnas]; nc[cIdx] = e.target.value; updateBlock(block.id, {...data, columnas: nc});
                 }} className="font-bold border-violet-300 bg-violet-50 text-violet-900" placeholder={`Col ${cIdx+1}`} />
               ))}
             </div>
             {data.filas.map((row: string[], rIdx: number) => (
               <div key={rIdx} className="flex gap-2">
                 {row.map((val: string, cIdx: number) => (
                    <Input key={cIdx} value={val} onChange={e => {
                      const nf = [...data.filas]; nf[rIdx][cIdx] = e.target.value; updateBlock(block.id, {...data, filas: nf});
                    }} className="border-violet-100 text-sm" placeholder="..." />
                 ))}
               </div>
             ))}
             <Button variant="ghost" onClick={() => {
                const newDataRow = Array(data.columnas.length).fill('');
                updateBlock(block.id, {...data, filas: [...data.filas, newDataRow]});
             }} className="h-8 text-[10px] uppercase font-black tracking-widest text-violet-600 hover:bg-violet-50">
                <Plus className="w-3 h-3 mr-1" /> Añadir Fila de Datos
             </Button>
          </div>
        );
      case 'IMAGE_SELECT':
        return (
          <div className="space-y-4">
             <Input value={data.instruccion} onChange={e => updateBlock(block.id, {...data, instruccion: e.target.value})} placeholder="Ej: Analiza estas texturas y selecciona la óptima." className="font-bold border-cyan-200 focus-visible:ring-cyan-500" />
             <div className="grid grid-cols-2 gap-4 mt-2">
               {data.imagenes.map((img: any, i: number) => (
                 <div key={i} className={cn("p-3 rounded-xl border border-cyan-100 space-y-2 transition-all", img.correcta ? "bg-cyan-50 ring-2 ring-cyan-400" : "bg-white")}>
                   <Input value={img.url} onChange={e => {
                      const ni = [...data.imagenes]; ni[i].url = e.target.value; updateBlock(block.id, {...data, imagenes: ni});
                   }} placeholder="URL de la Imagen..." className="text-xs" />
                   {img.url && <img src={img.url} alt="preview" className="w-full h-16 object-cover rounded-lg" />}
                   <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mt-2 cursor-pointer">
                      <input type="radio" name={`imgsel-${block.id}`} checked={img.correcta} onChange={() => {
                         const ni = data.imagenes.map((im:any, iIdx:number) => ({ ...im, correcta: iIdx === i }));
                         updateBlock(block.id, {...data, imagenes: ni});
                      }} />
                      Imagen Correcta
                   </label>
                 </div>
               ))}
               <Button variant="outline" className="h-full min-h-[100px] border-dashed border-cyan-200 text-cyan-600 hover:bg-cyan-50" onClick={() => updateBlock(block.id, {...data, imagenes: [...data.imagenes, { url: '', correcta: false }]})}>
                 <Plus className="w-6 h-6" />
               </Button>
             </div>
          </div>
        );
      case 'STEP_BY_STEP':
        return (
          <div className="space-y-4">
            <Input value={data.titulo} onChange={e => updateBlock(block.id, {...data, titulo: e.target.value})} placeholder="Título de Instrucciones..." className="font-bold border-fuchsia-200 focus-visible:ring-fuchsia-500" />
            <div className="space-y-2">
              {data.pasos.map((paso: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center text-xs font-bold leading-none">{idx + 1}</span>
                  <Input value={paso} onChange={e => {
                    const updated = [...data.pasos]; updated[idx] = e.target.value; updateBlock(block.id, {...data, pasos: updated});
                  }} className="h-9 border-fuchsia-100 text-sm focus-visible:ring-fuchsia-500" placeholder={`Instrucción del paso ${idx + 1}`} />
                  <button onClick={() => {
                    const updated = data.pasos.filter((_: any, i: number) => i !== idx); 
                    updateBlock(block.id, {...data, pasos: updated});
                  }} className="text-rose-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <Button variant="ghost" onClick={() => updateBlock(block.id, {...data, pasos: [...data.pasos, '']})} className="h-8 text-[10px] uppercase font-black tracking-widest text-fuchsia-600 hover:bg-fuchsia-50">
                <Plus className="w-3 h-3 mr-1" /> Añadir Paso
              </Button>
            </div>
          </div>
        );
      case 'CHECKLIST':
        return (
          <div className="space-y-4">
            <Input value={data.titulo} onChange={e => updateBlock(block.id, {...data, titulo: e.target.value})} placeholder="Título del Checklist..." className="font-bold border-teal-200 focus-visible:ring-teal-500" />
            <div className="space-y-2">
              {data.items.map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-300" />
                  <Input value={item} onChange={e => {
                    const updated = [...data.items]; updated[idx] = e.target.value; updateBlock(block.id, {...data, items: updated});
                  }} className="h-9 border-teal-100 text-sm focus-visible:ring-teal-500" placeholder={`Elemento a verificar`} />
                  <button onClick={() => {
                    const updated = data.items.filter((_: any, i: number) => i !== idx); 
                    updateBlock(block.id, {...data, items: updated});
                  }} className="text-rose-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <Button variant="ghost" onClick={() => updateBlock(block.id, {...data, items: [...data.items, '']})} className="h-8 text-[10px] uppercase font-black tracking-widest text-teal-600 hover:bg-teal-50">
                <Plus className="w-3 h-3 mr-1" /> Añadir Criterio
              </Button>
            </div>
          </div>
        );
      case 'DELIVERABLE':
        return (
          <div className="space-y-3">
             <Input value={data.titulo} onChange={e => updateBlock(block.id, {...data, titulo: e.target.value})} placeholder="Nombre de la Entrega (ej. Repositorio de GitHub)..." className="font-bold border-pink-200 focus-visible:ring-pink-500" />
             <Textarea value={data.descripcion} onChange={e => updateBlock(block.id, {...data, descripcion: e.target.value})} placeholder="Instrucciones para la entrega..." className="border-pink-200 focus-visible:ring-pink-500" />
             <select 
               className="w-full h-10 rounded-lg bg-pink-50 border-pink-200 text-sm font-bold text-pink-900 focus:ring-2 focus:ring-pink-500"
               value={data.tipo} onChange={e => updateBlock(block.id, {...data, tipo: e.target.value})}
             >
               <option value="ARCHIVO">Adjuntar Archivo (.zip, .pdf)</option>
               <option value="URL">URL / URL de Repositorio</option>
               <option value="TEXTO">Texto Libre</option>
             </select>
          </div>
        );
      case 'REWARD':
        return (
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex flex-col items-center justify-center border border-amber-500/50">
               <Crown className="w-6 h-6 text-amber-500 mb-1" />
             </div>
             <div className="flex-1 space-y-2">
                <Input value={data.insignia} onChange={e => updateBlock(block.id, {...data, insignia: e.target.value})} placeholder="Título de la Insignia (ej: Explorador Python)" className="font-bold border-amber-200" />
                <Input type="number" value={data.xp} onChange={e => updateBlock(block.id, {...data, xp: parseInt(e.target.value)})} placeholder="Experiencia (XP) brindada..." className="border-amber-200" />
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0F24]/90 backdrop-blur-md z-[100] flex animate-in fade-in duration-300">
      
      {/* LEFT SIDEBAR: METADATA */}
      <div className="w-80 bg-white shadow-2xl h-full flex flex-col border-r border-slate-200 z-10 p-6">
        <div className="flex items-center gap-2 mb-8">
           <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><Settings className="w-4 h-4 text-white" /></div>
           <div>
             <h3 className="font-black text-slate-800 leading-none">Settings</h3>
             <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Contexto Global</span>
           </div>
        </div>
        
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Curso Referencia</label>
            <select value={metadata.courseId} onChange={e => setMetadata({...metadata, courseId: e.target.value})} className="w-full h-10 rounded-lg bg-slate-50 border-none px-3 text-sm font-bold focus:ring-2 focus:ring-blue-500">
              <option value="">Aislar Experiencia</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Título Maestro</label>
            <Input value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} className="bg-slate-50 border-none font-bold placeholder:font-normal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Código</label>
               <Input value={metadata.codigo} onChange={e => setMetadata({...metadata, codigo: e.target.value})} className="bg-slate-50 border-none font-bold" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Edad</label>
               <Input value={metadata.edad} onChange={e => setMetadata({...metadata, edad: e.target.value})} className="bg-slate-50 border-none font-bold" />
             </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Software Integrable</label>
            <Input value={metadata.software} onChange={e => setMetadata({...metadata, software: e.target.value})} className="bg-slate-50 border-none font-bold" />
          </div>

          {editingModule && (
            <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                {saveStatus === 'SAVING' ? 'Guardando...' : saveStatus === 'SUCCESS' ? 'Sincronizado' : 'Modo Edición'}
              </span>
              {lastSaved && <span className="text-[8px] text-slate-400">{lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
          )}
        </div>

        <Button 
          onClick={() => handleSave(false)} 
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl gap-2 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/30"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 animate-bounce" />
              <span>Guardando...</span>
            </div>
          ) : (
            <>
              <Save className="w-4 h-4" /> 
              <span>Desplegar Experiencia</span>
            </>
          )}
        </Button>
        <Button 
          variant="ghost" 
          onClick={onClose} 
          className="w-full h-10 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest mt-2"
        >
          Cerrar Creador
        </Button>
      </div>

      {/* RIGHT AREA: THE INFINITE CANVAS */}
      <div className="flex-1 h-full overflow-y-auto relative bg-slate-50">
        <button onClick={onClose} className="absolute top-6 right-8 p-3 bg-white/50 backdrop-blur hover:bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-900 transition-all z-20">
          <X className="w-5 h-5" />
        </button>

        <div className="max-w-2xl mx-auto py-20 px-8 relative z-10 space-y-8">
           <div className="text-center mb-12">
             <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Lienzo Modular</span>
             <h2 className="text-4xl font-black text-slate-800 mt-4 italic tracking-tighter">Armador Dinámico</h2>
             <p className="text-slate-500 mt-2 font-medium">Construye la clase incorporando bloques interactivos en secuencia.</p>
           </div>

           <AnimatePresence>
             {blocks.map((block, index) => {
                const config = BLOCK_TYPES_CONFIG[block.type];
                const Icon = config.icon;
                return (
                  <motion.div key={block.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-xl w-full flex overflow-hidden border border-slate-100 group">
                    <div className={cn("w-16 flex flex-col items-center py-4 bg-slate-50/50 border-r border-slate-100", config.color.replace('bg-', 'text-'))}>
                       <Icon className="w-6 h-6 mb-auto" />
                       <span className="text-[9px] font-black">{index + 1}</span>
                    </div>

                    <div className="flex-1 p-6 relative">
                       {/* Control Bar */}
                       <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100/80 backdrop-blur rounded-lg shadow-sm border border-slate-200">
                          <button onClick={() => moveBlock(index, 'up')} disabled={index===0} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                          <button onClick={() => moveBlock(index, 'down')} disabled={index===blocks.length-1} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                          <button onClick={() => removeBlock(block.id)} className="w-8 h-8 flex items-center justify-center text-rose-400 hover:text-rose-600 border-l border-slate-200"><Trash2 className="w-4 h-4" /></button>
                       </div>
                       
                       <p className={cn("text-[10px] font-black uppercase tracking-widest mb-4", config.color.replace('bg-', 'text-'))}>{config.label}</p>
                       {renderBlockEditor(block)}
                    </div>
                  </motion.div>
                );
             })}
           </AnimatePresence>

           {/* ADD BLOCK MENUS */}
           <div className="relative pt-8 flex justify-center">
             <div className="absolute top-4 bottom-4 left-1/2 w-0.5 bg-slate-200 -translate-x-1/2 -z-10" />
             {!showBlockPicker ? (
               <button onClick={() => setShowBlockPicker(true)} className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center border border-slate-100 text-blue-600 hover:scale-110 hover:text-white hover:bg-blue-600 transition-all z-10 ring-4 ring-slate-50/50">
                 <Plus className="w-6 h-6" />
               </button>
             ) : (
               <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-[2rem] shadow-2xl border border-slate-100 max-w-lg w-full z-10 flex flex-wrap justify-center gap-3">
                 {(Object.keys(BLOCK_TYPES_CONFIG) as BlockType[]).map(type => {
                    const c = BLOCK_TYPES_CONFIG[type];
                    const Icon = c.icon;
                    return (
                      <button key={type} onClick={() => addBlock(type)} className={cn("flex flex-col items-center justify-center w-[120px] h-[100px] rounded-2xl hover:scale-105 transition-all text-white shadow-md", c.color)}>
                        <Icon className="w-6 h-6 mb-2" />
                        <span className="text-[10px] font-bold text-center leading-tight px-2">{c.label}</span>
                      </button>
                    )
                 })}
                 <Button variant="ghost" onClick={()=>setShowBlockPicker(false)} className="w-full rounded-xl text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest">
                   Cancelar
                 </Button>
               </motion.div>
             )}
           </div>
           {blocks.length > 0 && <div className="h-40" />} {/* Margin pad */}
        </div>
      </div>
    </div>
  );
};

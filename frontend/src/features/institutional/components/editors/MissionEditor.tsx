import React, { useState } from 'react';
import { 
  Rocket, 
  Target, 
  Clock, 
  Layers, 
  Settings, 
  Eye, 
  Cpu, 
  Trophy, 
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Wand2,
  Download,
  Upload,
  CheckCircle2,
  FileCode,
  FileUp,
  HelpCircle,
  Loader2,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MISSION_GRADES, MissionMoment } from '../../services/curriculum.api';
import { Switch } from '@/components/ui/switch';

interface MissionEditorProps {
  data: any;
  onSave: (data: any) => void;
  onClose: () => void;
  isReadOnly?: boolean;
}

export const MissionEditor = ({ data, onSave, onClose, isReadOnly }: MissionEditorProps) => {
  const [missionData, setMissionData] = useState(data);
  const [activeMomentIdx, setActiveMomentIdx] = useState<number | null>(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [aiJsonInput, setAiJsonInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdateBase = (field: string, value: any) => {
    setMissionData((prev: any) => ({
      ...prev,
      mission: { ...prev.mission, [field]: value }
    }));
  };

  const handleUpdateMoment = (idx: number, field: string, subField: string, value: any) => {
    const newMoments = [...missionData.moments];
    if (subField) {
      newMoments[idx] = {
        ...newMoments[idx],
        [field]: { ...newMoments[idx][field], [subField]: value }
      };
    } else {
      newMoments[idx] = { ...newMoments[idx], [field]: value };
    }
    setMissionData((prev: any) => ({ ...prev, moments: newMoments }));
  };

  const addMoment = () => {
    const newMoment: MissionMoment = {
      id: `moment_${Date.now()}`,
      title: "Nuevo Momento",
      time_minutes: 5,
      isVisible: true,
      config: { interaction_type: "content_only" },
      teacher: { 
          intention: "", 
          pedagogy: [], 
          script: "", 
          observation: "", 
          common_errors: [], 
          intervention: "" 
      },
      student: { content: "Contenido para el estudiante..." }
    };
    setMissionData((prev: any) => ({
      ...prev,
      moments: [...prev.moments, newMoment]
    }));
    setActiveMomentIdx(missionData.moments.length);
  };

  const removeMoment = (idx: number) => {
    const newMoments = missionData.moments.filter((_: any, i: number) => i !== idx);
    setMissionData((prev: any) => ({ ...prev, moments: newMoments }));
    if (activeMomentIdx === idx) setActiveMomentIdx(null);
    else if (activeMomentIdx !== null && activeMomentIdx > idx) setActiveMomentIdx(activeMomentIdx - 1);
  };

  const handleDownloadAIPrompt = () => {
    const prompt = `Actúa como un Diseñador Instruccional Senior y Desarrollador de Contenido Curricular. 
Tu tarea es generar el JSON para una MISIÓN GENIA siguiendo estas reglas:
1. NIVEL: ${missionData.mission.level}
2. TEMA: ${missionData.mission.title}
3. ESTRUCTURA: 8 Momentos Pedagógicos.
4. FORMATO: Debe ser un objeto JSON válido con este esquema:
{
  "mission": { "title": "...", "duration_minutes": 60, "level": "..." },
  "moments": [
    {
      "id": "m1", "title": "...", "time_minutes": 5, "isVisible": true,
      "config": { "interaction_type": "content_only" },
      "teacher": { "intention": "...", "script": "..." },
      "student": { "concept": "...", "content": "..." }
    },
    ... (hasta momento 8)
  ]
}

Tipos de interacción disponibles: "content_only", "multiple_choice", "true_false", "file_upload", "interactive_lab".
Genera una misión emocionante e interactiva.`;
    
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PROMPT_IA_MISION_${missionData.mission.title.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  const handleImportAIJson = async () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(aiJsonInput);
      if (parsed.moments && Array.isArray(parsed.moments)) {
        setMissionData(prev => ({
          ...prev,
          mission: parsed.mission || prev.mission,
          moments: parsed.moments
        }));
        // Small delay for visual feedback of "processing"
        setTimeout(() => {
          setIsImportModalOpen(false);
          setAiJsonInput('');
          setSaving(false);
        }, 800);
      } else {
        setSaving(false);
      }
    } catch (e) {
      alert("JSON no válido. Por favor, revisa el formato.");
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full min-h-[700px] flex rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl bg-white animate-in fade-in duration-500">
      
      {/* Sidebar - Metadata */}
      <div className="bg-white border-r border-slate-100 flex flex-col p-8 shrink-0 relative z-20 w-80 shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
              <Button
                  variant="ghost" size="icon"
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 shrink-0 text-blue-600"
              >
                  <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                  <h3 className="text-lg font-black text-slate-800 tracking-tighter leading-none truncate">{isReadOnly ? 'Ficha de Misión' : 'Diseño de Misión'}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Configuración Base</span>
              </div>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Título de Misión</label>
                  <Input readOnly={isReadOnly} value={missionData.mission.title} onChange={e => handleUpdateBase('title', e.target.value)} className="bg-slate-50 border-2 border-slate-100 hover:border-blue-100 focus:border-blue-500 font-black text-slate-700 h-14 rounded-2xl transition-all" />
              </div>
              <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Grado / Nivel</label>
                  <select disabled={isReadOnly} value={missionData.mission.level} onChange={e => handleUpdateBase('level', e.target.value)} className="w-full h-14 px-4 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-blue-100 focus:border-blue-500 font-bold text-sm text-slate-700">
                      {MISSION_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
              </div>
              <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Duración (Minutos)</label>
                  <Input type="number" readOnly={isReadOnly} value={missionData.mission.duration_minutes} onChange={e => handleUpdateBase('duration_minutes', parseInt(e.target.value))} className="bg-slate-50 border-2 border-slate-100 hover:border-blue-100 focus:border-blue-500 font-black text-slate-700 h-14 rounded-2xl transition-all" />
              </div>

              {!isReadOnly && (
                  <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                      <Button 
                          onClick={() => setIsImportModalOpen(true)} 
                          className="w-full h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm transition-all"
                      >
                          <Wand2 className="w-4 h-4 mr-2" /> Arquitecto IA
                      </Button>
                  </div>
              )}
          </div>

          {!isReadOnly && (
              <div className="pt-6 border-t border-slate-100 mt-6">
                  <Button
                      onClick={() => onSave(missionData)}
                      disabled={saving}
                      className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] gap-3 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
                  >
                      {saving ? 'GUARDANDO...' : <><Save className="w-5 h-5" /> CONSOLIDAR MISIÓN</>}
                  </Button>
                  <p className="text-[9px] text-center text-slate-400 font-bold mt-4 uppercase tracking-widest">Cambios aplicados de inmediato</p>
              </div>
          )}
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative bg-[#F8FAFC] h-full overflow-y-auto w-full custom-scrollbar">
          <div className="absolute inset-0 construction-grid opacity-30 pointer-events-none" />

          {/* Import Modal */}
          {isImportModalOpen && (
              <div className="absolute inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                  <div className="bg-white w-full max-w-5xl rounded-[3.5rem] p-16 space-y-10 shadow-2xl relative overflow-hidden text-left">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-400" />
                      <button onClick={() => setIsImportModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-colors">
                          <X className="w-8 h-8" />
                      </button>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                          {/* Phase 1: Export Prompt */}
                          <div className="space-y-8 border-r border-slate-100 pr-16 text-left">
                              <div className="space-y-4">
                                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                                      <Download className="w-7 h-7 text-blue-600" />
                                  </div>
                                  <h3 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter">1. Descargar Formato</h3>
                                  <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tight">Utiliza este prompt maestro para que tu IA favorita genere el contenido siguiendo la arquitectura pedagógica GenIA.</p>
                              </div>
                              
                              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                                      El sistema generará un archivo .txt con las instrucciones técnicas para el nivel ({missionData.mission.level}).
                                  </p>
                                  <Button 
                                      onClick={handleDownloadAIPrompt} 
                                      className="w-full h-14 bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-sm"
                                  >
                                      Descargar Prompt para IA
                                  </Button>
                              </div>
                          </div>

                          {/* Phase 2: Import JSON */}
                          <div className="space-y-8 text-left">
                              <div className="space-y-4">
                                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6">
                                      <Upload className="w-7 h-7 text-white" />
                                  </div>
                                  <h3 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter">2. Pegar JSON Generado</h3>
                                  <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-tight">Pega el código JSON que te entregó la IA para poblar automáticamente los 8 momentos.</p>
                              </div>

                              <div className="space-y-4">
                                  <Textarea 
                                      value={aiJsonInput}
                                      onChange={(e) => setAiJsonInput(e.target.value)}
                                      placeholder='Pega aquí el JSON...'
                                      className="bg-slate-50 border-none rounded-3xl min-h-[250px] font-mono text-[11px] p-8"
                                  />
                                  <Button 
                                      onClick={handleImportAIJson}
                                      disabled={!aiJsonInput.trim() || saving}
                                      className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all"
                                  >
                                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Importar y Procesar Misión"}
                                  </Button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          <div className="max-w-4xl mx-auto py-16 px-10 relative z-10 space-y-12 pb-32">
              <div className="flex items-center gap-4 mb-6 px-4">
                  <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-xl">
                      <Layers className="w-8 h-8" />
                  </div>
                  <div>
                      <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800">Estación de <span className="text-blue-600">Ingeniería</span></h2>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Secuencia Pedagógica ({missionData.moments?.length || 0})</p>
                  </div>
                  
                  {isReadOnly ? (
                      <Badge variant="outline" className="ml-auto text-[10px] font-black uppercase tracking-[0.2em] bg-blue-50 text-blue-600 border-blue-100 px-4 py-1.5 rounded-full">Lectura</Badge>
                  ) : (
                      <Badge variant="outline" className="ml-auto text-[10px] font-black uppercase tracking-[0.2em] bg-rose-50 text-rose-600 border-rose-100 px-4 py-1.5 rounded-full">Engineering Mode</Badge>
                  )}
              </div>

              {/* Moments List */}
              <div className="space-y-4">
                  {missionData.moments?.map((moment: MissionMoment, idx: number) => (
                      <div key={moment.id} className="group">
                          <div 
                              className={cn(
                                  "p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between",
                                  activeMomentIdx === idx ? "bg-white border-rose-500 shadow-xl shadow-rose-500/10" : "bg-white/50 border-transparent hover:border-slate-200 hover:bg-white"
                              )}
                              onClick={() => setActiveMomentIdx(activeMomentIdx === idx ? null : idx)}
                          >
                              <div className="flex items-center gap-4">
                                  <div className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                                      activeMomentIdx === idx ? "bg-rose-600 text-white shadow-md shadow-rose-500/30" : "bg-slate-100 text-slate-400"
                                  )}>
                                      {idx + 1}
                                  </div>
                                  <div>
                                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-800">{moment.title}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{moment.time_minutes} min • {moment.config.interaction_type}</span>
                                          {!moment.isVisible && <Badge className="bg-slate-100 text-slate-400 border-none px-2 h-4 text-[7px] font-black uppercase tracking-tighter">Oculto</Badge>}
                                      </div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-2">
                                  {!isReadOnly && (
                                      <Button 
                                          onClick={(e) => { e.stopPropagation(); removeMoment(idx); }}
                                          variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </Button>
                                  )}
                                  {activeMomentIdx === idx ? <ChevronUp className="w-5 h-5 text-rose-500" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
                              </div>
                          </div>

                          {activeMomentIdx === idx && (
                              <div className="mt-3 p-8 bg-white rounded-3xl border border-slate-100 shadow-inner grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in slide-in-from-top-2 duration-300">
                                  {/* --- Teacher View --- */}
                                  <div className="space-y-6">
                                      <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                          <Settings className="w-4 h-4 text-blue-500" />
                                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Guía del Docente</span>
                                      </div>
                                      
                                      <div className="space-y-4">
                                          <div className="space-y-2">
                                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Intencionalidad Pedagógica</label>
                                              <Textarea 
                                                  readOnly={isReadOnly}
                                                  value={moment.teacher?.intention} 
                                                  onChange={(e) => handleUpdateMoment(idx, 'teacher', 'intention', e.target.value)}
                                                  className="bg-slate-50 border-transparent focus:border-blue-500 rounded-2xl text-xs font-bold min-h-[80px]"
                                              />
                                          </div>
                                          <div className="space-y-2">
                                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Script de Intervención</label>
                                              <Textarea 
                                                  readOnly={isReadOnly}
                                                  value={moment.teacher?.script} 
                                                  onChange={(e) => handleUpdateMoment(idx, 'teacher', 'script', e.target.value)}
                                                  className="bg-blue-50/50 border-transparent focus:border-blue-500 rounded-2xl text-xs font-bold text-blue-800 italic min-h-[100px]"
                                              />
                                          </div>
                                      </div>
                                  </div>

                                  {/* --- Student View --- */}
                                  <div className="space-y-6">
                                      <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                          <Rocket className="w-4 h-4 text-rose-500" />
                                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Misión del Estudiante</span>
                                      </div>

                                      <div className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Título del Momento</label>
                                                  <Input 
                                                      readOnly={isReadOnly}
                                                      value={moment.title} 
                                                      onChange={(e) => handleUpdateMoment(idx, 'title', '', e.target.value)}
                                                      className="bg-slate-50 border-transparent focus:border-rose-500 rounded-2xl font-bold"
                                                  />
                                              </div>
                                              <div className="grid grid-cols-2 gap-3">
                                                  <div className="space-y-2">
                                                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Minutos</label>
                                                      <Input 
                                                          readOnly={isReadOnly}
                                                          type="number"
                                                          value={moment.time_minutes} 
                                                          onChange={(e) => handleUpdateMoment(idx, 'time_minutes', '', parseInt(e.target.value))}
                                                          className="bg-slate-50 border-transparent focus:border-rose-500 rounded-2xl font-bold"
                                                      />
                                                  </div>
                                                  <div className="space-y-2 flex flex-col justify-center">
                                                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Visible Alumno</label>
                                                      <div className="flex items-center gap-2">
                                                          <Switch 
                                                              disabled={isReadOnly}
                                                              checked={moment.isVisible ?? true}
                                                              onCheckedChange={(val) => handleUpdateMoment(idx, 'isVisible', '', val)}
                                                          />
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>

                                          <div className="space-y-2">
                                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tipo de Interacción</label>
                                              <select 
                                                  disabled={isReadOnly}
                                                  value={moment.config.interaction_type}
                                                  onChange={(e) => handleUpdateMoment(idx, 'config', 'interaction_type', e.target.value)}
                                                  className="w-full h-10 px-4 bg-slate-50 border-transparent focus:border-rose-500 rounded-2xl font-bold text-xs"
                                              >
                                                  <option value="content_only">Solo Narrativa</option>
                                                  <option value="multiple_choice">Opción Múltiple</option>
                                                  <option value="true_false">Verdadero o Falso</option>
                                                  <option value="sequence_order">Orden de Secuencia</option>
                                                  <option value="file_upload">Evidencia (Archivo)</option>
                                                  <option value="interactive_lab">Laboratorio</option>
                                                  <option value="open_response">Respuesta Abierta</option>
                                              </select>
                                          </div>

                                          <div className="space-y-2">
                                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contenido Académico</label>
                                              <Textarea 
                                                  readOnly={isReadOnly}
                                                  value={moment.student?.concept || ""} 
                                                  onChange={(e) => handleUpdateMoment(idx, 'student', 'concept', e.target.value)}
                                                  placeholder="Conceptos teóricos..."
                                                  className="bg-slate-50 border-transparent focus:border-rose-500 rounded-2xl text-xs font-bold min-h-[60px]"
                                              />
                                          </div>

                                          <div className="space-y-2">
                                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Actividad / Consigna</label>
                                              <Textarea 
                                                  readOnly={isReadOnly}
                                                  value={moment.student?.content || moment.student?.question || moment.student?.instruction || ""} 
                                                  onChange={(e) => handleUpdateMoment(idx, 'student', 'content', e.target.value)}
                                                  placeholder="Acción a realizar..."
                                                  className="bg-rose-50/30 border-transparent focus:border-rose-500 rounded-2xl text-sm font-bold placeholder:text-slate-300 min-h-[140px]"
                                              />
                                          </div>
                                      </div>

                                      {/* Modular Fields */}
                                      {moment.config.interaction_type === 'multiple_choice' && (
                                          <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-100 space-y-4">
                                              <div className="flex items-center justify-between">
                                                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Opciones de Respuesta</label>
                                                  { !isReadOnly && (
                                                      <Button 
                                                          onClick={() => {
                                                              const opts = moment.student?.options || [];
                                                              handleUpdateMoment(idx, 'student', 'options', [...opts, { text: "" }]);
                                                          }}
                                                          variant="ghost" 
                                                          className="h-7 px-3 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-lg font-black uppercase text-[8px] animate-in fade-in transition-all gap-1.5 shadow-sm border border-slate-100"
                                                      >
                                                          <Plus className="w-3 h-3" /> Añadir Opción
                                                      </Button>
                                                  )}
                                              </div>
                                              <div className="space-y-3">
                                                  {(moment.student?.options || [{text: ""}, {text: ""}]).map((opt: any, i: number) => (
                                                      <div key={i} className="flex items-center gap-3 group animate-in slide-in-from-left-2 duration-300">
                                                          <button 
                                                              disabled={isReadOnly}
                                                              onClick={() => handleUpdateMoment(idx, 'student', 'correct_answer', i)}
                                                              className={cn(
                                                                  "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                                                  moment.student?.correct_answer === i ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-slate-200"
                                                              )}
                                                          >
                                                              {moment.student?.correct_answer === i ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black text-slate-300">{String.fromCharCode(65 + i)}</span>}
                                                          </button>
                                                          <Input 
                                                              readOnly={isReadOnly}
                                                              placeholder={`Opción ${i+1}`}
                                                              className="bg-white border-transparent focus:border-rose-500 focus:ring-1 focus:ring-rose-200 shadow-sm rounded-xl text-xs flex-1 font-bold h-11"
                                                              value={opt.text || ""}
                                                              onChange={(e) => {
                                                                  const newOpts = [...(moment.student?.options || [])];
                                                                  newOpts[i] = { ...newOpts[i], text: e.target.value };
                                                                  handleUpdateMoment(idx, 'student', 'options', newOpts);
                                                              }}
                                                          />
                                                          { !isReadOnly && (moment.student?.options?.length > 2) && (
                                                              <Button 
                                                                  variant="ghost" size="icon" 
                                                                  onClick={() => {
                                                                      const opts = moment.student?.options || [];
                                                                      handleUpdateMoment(idx, 'student', 'options', opts.filter((_: any, index: number) => index !== i));
                                                                      const correct = moment.student?.correct_answer;
                                                                      if (correct === i) handleUpdateMoment(idx, 'student', 'correct_answer', null);
                                                                      else if ((correct as number) > i) handleUpdateMoment(idx, 'student', 'correct_answer', (correct as number) - 1);
                                                                  }}
                                                                  className="w-8 h-8 rounded-lg text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                              >
                                                                  <Trash2 className="w-4 h-4" />
                                                              </Button>
                                                          )}
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      )}

                                      {moment.config.interaction_type === 'true_false' && (
                                          <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-100 space-y-4">
                                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Respuesta Correcta</label>
                                              <div className="flex gap-4">
                                                  <Button 
                                                      disabled={isReadOnly}
                                                      onClick={() => handleUpdateMoment(idx, 'student', 'correct_answer', true)}
                                                      className={cn("flex-1 rounded-2xl font-black h-12 uppercase", moment.student?.correct_answer === true ? "bg-emerald-500 text-white" : "bg-white text-slate-400 border border-slate-100")}
                                                  >
                                                      Verdadero
                                                  </Button>
                                                  <Button 
                                                      disabled={isReadOnly}
                                                      onClick={() => handleUpdateMoment(idx, 'student', 'correct_answer', false)}
                                                      className={cn("flex-1 rounded-2xl font-black h-12 uppercase", moment.student?.correct_answer === false ? "bg-rose-500 text-white" : "bg-white text-slate-400 border border-slate-100")}
                                                  >
                                                      Falso
                                                  </Button>
                                              </div>
                                          </div>
                                      )}

                                      {moment.config.interaction_type === 'sequence_order' && (
                                          <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-100 space-y-4">
                                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Secuencia (1 paso por línea)</label>
                                              <Textarea 
                                                  readOnly={isReadOnly}
                                                  placeholder="..."
                                                  className="bg-white border-transparent shadow-sm rounded-xl text-xs min-h-[100px]"
                                                  value={moment.student?.items?.join('\n') || ""}
                                                  onChange={(e) => handleUpdateMoment(idx, 'student', 'items', e.target.value.split('\n').filter(l => l.trim()))}
                                              />
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}
                      </div>
                  ))}

                  {!isReadOnly && (
                      <Button 
                          onClick={addMoment} 
                          className="w-full h-14 mt-6 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-3xl font-black uppercase text-[10px] tracking-widest gap-2 border border-slate-200 border-dashed transition-all"
                      >
                          <Plus className="w-4 h-4" /> Añadir Momento Pedagógico
                      </Button>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};


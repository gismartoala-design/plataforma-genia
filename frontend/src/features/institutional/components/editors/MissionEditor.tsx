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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1700px] mx-auto pb-20">
      {/* --- Top Navigation --- */}
      <div className="flex items-center justify-between px-2">
        <Button 
          onClick={onClose} 
          variant="ghost" 
          className="h-12 px-6 rounded-2xl bg-white border shadow-sm gap-3 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Tablero
        </Button>
        <div className="flex items-center gap-3">
           {!isReadOnly && (
             <Button 
              onClick={() => setIsImportModalOpen(true)} 
              className="h-12 px-8 rounded-2xl bg-blue-600 text-white border-none gap-3 font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
             >
                <Wand2 className="w-4 h-4" /> Arquitecto IA
             </Button>
           )}
           <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] bg-rose-50 text-rose-600 border-rose-100 px-4 py-1.5 rounded-full">Engineering Mode</Badge>
        </div>
      </div>

      {isImportModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
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
                            placeholder='Pega aquí el JSON: { "mission": { ... }, "moments": [ ... ] }'
                            className="bg-slate-50 border-none rounded-3xl min-h-[250px] font-mono text-[11px] p-8 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <Button 
                            onClick={handleImportAIJson}
                            disabled={!aiJsonInput.trim() || saving}
                            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Procesando Estructura...
                                </>
                            ) : (
                                "Importar y Procesar Misión"
                            )}
                        </Button>
                      </div>
                   </div>
               </div>
            </div>
         </div>
      )}

      {/* --- Mission Header Config --- */}
      <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-blue-500/5 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
            <Target className="w-64 h-64" />
        </div>
        
        <div className="flex items-center gap-5 mb-8 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">Capa de <span className="text-rose-600">Identidad</span></h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Blueprint & Core Metadata</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Título de Misión</label>
            <Input 
              readOnly={isReadOnly}
              value={missionData.mission.title} 
              onChange={(e) => handleUpdateBase('title', e.target.value)}
              className="bg-slate-50 border-none rounded-2xl font-bold placeholder:text-slate-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Grado / Nivel</label>
            <select 
              disabled={isReadOnly}
              value={missionData.mission.level}
              onChange={(e) => handleUpdateBase('level', e.target.value)}
              className="w-full h-10 px-4 bg-slate-50 rounded-2xl border-none font-bold text-sm"
            >
              {MISSION_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Duración (min)</label>
            <Input 
              readOnly={isReadOnly}
              type="number"
              value={missionData.mission.duration_minutes} 
              onChange={(e) => handleUpdateBase('duration_minutes', parseInt(e.target.value))}
              className="bg-slate-50 border-none rounded-2xl font-bold placeholder:text-slate-300"
            />
          </div>
        </div>
      </section>

      {/* --- Moments Section --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Layers className="text-white w-5 h-5" />
             </div>
             <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 italic">Estación de <span className="text-blue-600">Ingeniería</span></h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Secuencia de Momentos Pedagógicos ({missionData.moments?.length || 0})</p>
             </div>
          </div>
          <Button 
            onClick={addMoment} 
            disabled={isReadOnly}
            className="h-12 px-8 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl border-b-4 border-black active:border-b-0 transition-all"
          >
            <Plus className="w-4 h-4" /> Añadir Nuevo Momento
          </Button>
        </div>

        <div className="space-y-4">
          {missionData.moments?.map((moment: MissionMoment, idx: number) => (
            <div key={moment.id} className="group">
              <div 
                className={cn(
                  "p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between",
                  activeMomentIdx === idx ? "bg-white border-rose-500 shadow-xl shadow-rose-500/10" : "bg-white/50 border-transparent hover:border-slate-200"
                )}
                onClick={() => setActiveMomentIdx(activeMomentIdx === idx ? null : idx)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                    activeMomentIdx === idx ? "bg-rose-600 text-white" : "bg-white text-slate-400 border border-slate-100"
                  )}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-800">{moment.title}</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{moment.time_minutes} min • {moment.config.interaction_type}</span>
                        {!moment.isVisible && <Badge className="bg-slate-100 text-slate-400 border-none px-2 h-4 text-[7px] font-black uppercase tracking-tighter">Oculto Estudiante</Badge>}
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
                <div className="mt-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-inner grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-top-2 duration-300">
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
                          className="bg-slate-50 border-none rounded-2xl text-xs font-bold min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Script de Intervención</label>
                        <Textarea 
                          readOnly={isReadOnly}
                          value={moment.teacher?.script} 
                          onChange={(e) => handleUpdateMoment(idx, 'teacher', 'script', e.target.value)}
                          className="bg-blue-50/50 border-none rounded-2xl text-xs font-bold text-blue-800 italic min-h-[100px]"
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
                                className="bg-slate-50 border-none rounded-2xl font-bold"
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
                                      className="bg-slate-50 border-none rounded-2xl font-bold"
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
                                className="w-full h-10 px-4 bg-slate-50 rounded-2xl border-none font-bold text-xs"
                            >
                                <option value="content_only">Solo Narrativa</option>
                                <option value="multiple_choice">Opción Múltiple</option>
                                <option value="true_false">Verdadero o Falso</option>
                                <option value="sequence_order">Orden de Secuencia</option>
                                <option value="file_upload">Evidencia (Archivo)</option>
                                <option value="interactive_lab">Laboratorio/Interactuación</option>
                                <option value="open_response">Bitácora/Respuesta Abierta</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contenido / Concepto</label>
                            <Textarea 
                              readOnly={isReadOnly}
                              value={moment.student?.concept || ""} 
                              onChange={(e) => handleUpdateMoment(idx, 'student', 'concept', e.target.value)}
                              placeholder="Ej: Principio de Pascal"
                              className="bg-slate-50 border-none rounded-2xl text-xs font-bold min-h-[60px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Instrucción / Misión Principal</label>
                            <Textarea 
                              readOnly={isReadOnly}
                              value={moment.student?.content || moment.student?.question || moment.student?.instruction || ""} 
                              onChange={(e) => handleUpdateMoment(idx, 'student', 'content', e.target.value)}
                              placeholder="Describe lo que el alumno debe hacer o entender..."
                              className="bg-rose-50/30 border-none rounded-2xl text-sm font-bold placeholder:text-slate-300 min-h-[140px]"
                            />
                        </div>
                    </div>

                        {/* Modular Fields based on type */}
                        {moment.config.interaction_type === 'multiple_choice' && (
                           <div className="p-5 rounded-3xl bg-blue-50/30 border border-blue-100 space-y-4 text-left">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-black uppercase tracking-widest text-blue-600">Opciones de Respuesta y Correcta</label>
                                { !isReadOnly && (
                                  <Button 
                                    onClick={() => {
                                      const currentOpts = moment.student?.options || [];
                                      const newOpts = [...currentOpts, { text: "" }];
                                      handleUpdateMoment(idx, 'student', 'options', newOpts);
                                    }}
                                    variant="ghost" 
                                    className="h-7 px-3 bg-blue-100/50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg font-black uppercase text-[8px] animate-in fade-in transition-all gap-1.5"
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
                                            moment.student?.correct_answer === i ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200"
                                        )}
                                      >
                                        {moment.student?.correct_answer === i ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black text-slate-300">{String.fromCharCode(65 + i)}</span>}
                                      </button>
                                      <Input 
                                        readOnly={isReadOnly}
                                        placeholder={`Opción ${i+1}`}
                                        className="bg-white border-none shadow-sm rounded-xl text-xs flex-1 font-bold h-11"
                                        value={opt.text || ""}
                                        onChange={(e) => {
                                          const newOpts = [...(moment.student?.options || [])];
                                          newOpts[i] = { ...newOpts[i], text: e.target.value };
                                          handleUpdateMoment(idx, 'student', 'options', newOpts);
                                        }}
                                      />
                                      { !isReadOnly && (moment.student?.options?.length > 2) && (
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={() => {
                                            const currentOpts = moment.student?.options || [];
                                            const newOpts = currentOpts.filter((_: any, index: number) => index !== i);
                                            const currentCorrect = moment.student?.correct_answer;
                                            
                                            // Handle correct answer re-indexing with proper type narrowing
                                            if (typeof currentCorrect === 'number') {
                                              if (currentCorrect === i) {
                                                handleUpdateMoment(idx, 'student', 'correct_answer', null);
                                              } else if (currentCorrect > i) {
                                                handleUpdateMoment(idx, 'student', 'correct_answer', currentCorrect - 1);
                                              }
                                            }
                                            
                                            handleUpdateMoment(idx, 'student', 'options', newOpts);
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
                            <div className="p-5 rounded-3xl bg-cyan-50/30 border border-cyan-100 space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-widest text-cyan-600">Respuesta Correcta (V/F)</label>
                                <div className="flex gap-4">
                                    <Button 
                                        disabled={isReadOnly}
                                        onClick={() => handleUpdateMoment(idx, 'student', 'correct_answer', true)}
                                        className={cn("flex-1 rounded-2xl font-black h-12 uppercase", moment.student?.correct_answer === true ? "bg-blue-600 text-white" : "bg-white text-slate-400 border border-slate-100")}
                                    >
                                        Verdadero
                                    </Button>
                                    <Button 
                                        disabled={isReadOnly}
                                        onClick={() => handleUpdateMoment(idx, 'student', 'correct_answer', false)}
                                        className={cn("flex-1 rounded-2xl font-black h-12 uppercase", moment.student?.correct_answer === false ? "bg-rose-600 text-white" : "bg-white text-slate-400 border border-slate-100")}
                                    >
                                        Falso
                                    </Button>
                                </div>
                            </div>
                        )}

                        {moment.config.interaction_type === 'file_upload' && (
                            <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-200 space-y-4">
                                <div className="flex items-center gap-3">
                                    <FileUp className="w-5 h-5 text-slate-400" />
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Configuración de Evidencia</label>
                                </div>
                                <Input 
                                    readOnly={isReadOnly}
                                    placeholder="Ej: Sube un PDF de tu código o una foto de tu semáforo"
                                    className="bg-white border-transparent rounded-xl text-xs"
                                    value={moment.student?.evidence_instruction || ""}
                                    onChange={(e) => handleUpdateMoment(idx, 'student', 'evidence_instruction', e.target.value)}
                                />
                            </div>
                        )}

                        {moment.config.interaction_type === 'sequence_order' && (
                           <div className="p-5 rounded-3xl bg-blue-50/30 border border-blue-100 space-y-4">
                              <label className="text-[9px] font-black uppercase tracking-widest text-blue-600">Pasos de la Secuencia</label>
                              <Textarea 
                                readOnly={isReadOnly}
                                placeholder="Escribe un paso por línea..."
                                className="bg-white border-transparent rounded-xl text-xs min-h-[100px]"
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
            </div>
          </section>

      {/* --- Global Action --- */}
      {!isReadOnly && (
        <div className="flex justify-end pt-10 sticky bottom-0 bg-gradient-to-t from-slate-50 to-transparent pb-4">
          <Button 
            onClick={() => onSave(missionData)}
            className="h-16 px-12 rounded-3xl bg-slate-900 border-b-8 border-black hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs gap-4 shadow-2xl active:translate-y-2 active:border-b-0 transition-all"
          >
            <Save className="w-6 h-6" /> Consolidar Misión Informatizada
          </Button>
        </div>
      )}
    </div>
  );
};

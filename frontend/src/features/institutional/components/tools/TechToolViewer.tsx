
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { LogicNodeConnector } from './LogicNodeConnector';
import { AlgoritmoChallenge } from './AlgoritmoChallenge';
import { PreguntaChallenge } from './PreguntaChallenge';
import { ClasificacionChallenge } from './ClasificacionChallenge';
import { ArduinoLabChallenge } from './ArduinoLabChallenge';
import { EvidenceChallenge } from './EvidenceChallenge';
import { ActionPlatformerLab } from '../labs/ActionPlatformerLab';
import { professorApi } from '@/features/professor/services/professor.api';
import { SensorActuatorBridge } from './SensorActuatorBridge';
import { 
  Building2, 
  ArrowLeft,
  Settings,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import '../../styles/ConstructionTheme.css';

export const TechToolViewer = () => {
  const { id } = useParams() as { id: string };
  const [, setLocation] = useLocation();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [levelContent, setLevelContent] = useState<any[]>([]);
  const [currentContentIdx, setCurrentContentIdx] = useState(0);

  useEffect(() => {
    fetchModuleData();
  }, [id]);

  const fetchModuleData = async () => {
    setLoading(true);
    try {
        if (!id || id.startsWith('s')) {
            setLoading(false);
            return;
        }

        const levels = await professorApi.getModuleLevels(id);
        if (levels && levels.length > 0) {
            const contents = levels[0].contents || [];
            setLevelContent(contents);
        }
    } catch (error) {
        console.error('Error fetching module data for viewer:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleComplete = () => {
    if (currentContentIdx < levelContent.length - 1) {
        setCurrentContentIdx(prev => prev + 1);
    } else {
        setCompleted(true);
    }
  };

  // Map sector ID to specific tool
  // For now, any ID maps to LogicNodeConnector for Level 1 demo
  const renderTool = () => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center gap-6">
               <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center safety-border">
                  <Settings className="w-10 h-10 text-orange-500 animate-spin-slow" />
               </div>
               <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Sincronizando</h2>
               <p className="text-slate-500">Buscando protocolos asignados para este sector...</p>
            </div>
        );
    }

    if (levelContent.length > 0) {
        const content = levelContent[currentContentIdx];
        let data = { grid: [], startIdx: 0, targetIdx: 0, obstacles: [], parts: [], pregunta: '', feedback: '' };
        try {
            data = JSON.parse(content.urlRecurso);
        } catch (e) {
            console.warn("Invalid content data");
        }

        switch (content.tipo) {
            case 'desafio_algoritmo':
                return <AlgoritmoChallenge data={data as any} onComplete={handleComplete} />;
            case 'pregunta_abierta':
                return <PreguntaChallenge data={data as any} onComplete={handleComplete} />;
            case 'clasificacion':
                return <ClasificacionChallenge data={data as any} onComplete={handleComplete} />;
            case 'arduino_lab':
                return <ArduinoLabChallenge data={data as any} onComplete={handleComplete} />;
            case 'python_lab':
                return <ActionPlatformerLab config={data as any} onComplete={handleComplete} />;
            case 'evidencia':
                return <EvidenceChallenge data={data as any} onComplete={handleComplete} />;
            case 'video':
                return (
                    <div className="max-w-4xl mx-auto space-y-8 p-10">
                        <iframe 
                            src={content.urlRecurso.replace('watch?v=', 'embed/')} 
                            className="w-full aspect-video rounded-[3rem] border-4 border-white/5 shadow-2xl"
                            allowFullScreen
                        />
                        <Button 
                            onClick={handleComplete}
                            className="w-full h-16 bg-orange-600 hover:bg-orange-500 text-white rounded-[2rem] font-black uppercase tracking-widest italic"
                        >
                            Finalizar Video
                        </Button>
                    </div>
                );
        }
    }

    switch (id) {
       case 's1':
       case 's2':
         return <LogicNodeConnector onComplete={() => setCompleted(true)} />;
       case 's3':
       case 's4':
         return <SensorActuatorBridge onComplete={() => setCompleted(true)} />;
       default:
         return (
           <div className="flex flex-col items-center justify-center h-full p-20 text-center gap-6">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center safety-border">
                 <Settings className="w-10 h-10 text-orange-500 animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Herramienta en Desarrollo</h2>
              <p className="text-slate-500 max-w-sm">Esta sección de la ciudad todavía está bajo estricto protocolo de mantenimiento.</p>
              <Button 
                onClick={() => setLocation('/city-dashboard')}
                className="bg-white/5 border border-white/10 text-slate-400 h-12 rounded-xl"
              >
                Volver al Mapa
              </Button>
           </div>
         );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col font-sans text-white overflow-hidden relative">
      <div className="absolute inset-0 construction-grid opacity-10 pointer-events-none" />
      
      {/* Top Bar for Tool Context */}
      <nav className="relative z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => setLocation('/city-dashboard')}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
               <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="w-1 h-8 bg-orange-500 rounded-full" />
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Misión de Campo</p>
               <h3 className="text-lg font-black italic uppercase tracking-tighter">Protocolo <span className="text-orange-500">{id}</span></h3>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Estado del Sistema</p>
               <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">En Línea • Diagnóstico OK</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center holographic">
               <Building2 className="w-5 h-5 text-orange-500" />
            </div>
         </div>
      </nav>

      <main className="flex-1 relative">
         <AnimatePresence mode="wait">
            {!completed ? (
              <motion.div 
                key="tool"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full"
              >
                {renderTool()}
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center p-10 gap-10 text-center"
              >
                <div className="relative">
                   <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
                   <div className="w-32 h-32 rounded-[2.5rem] bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center holographic relative z-10 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                      <AlertTriangle className="w-16 h-16 text-cyan-400" />
                   </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Misión <span className="text-cyan-400 text-glitch">Completada</span></h2>
                  <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">Has restaurado la integridad estructural del sector. Los sistemas están operativos.</p>
                </div>

                <div className="flex gap-4">
                   <Button 
                     onClick={() => setLocation('/city-dashboard')}
                     className="h-16 px-12 rounded-[2rem] bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase italic tracking-widest shadow-2xl shadow-cyan-600/20 active:scale-95 transition-all"
                   >
                     Continuar con el Curso
                   </Button>
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </main>
    </div>
  );
};

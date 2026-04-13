
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  X, 
  Video, 
  Calendar, 
  Package, 
  Cpu, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  FileText,
  PlayCircle,
  FlaskConical,
  Award,
  Gamepad2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import apiClient from '@/services/api.client';

interface Contenido {
  id: number;
  tipo: string;
  tituloEjercicio?: string;
  urlRecurso?: string;
  descripcionEjercicio?: string;
}

export const LevelDetailsModal = ({ level, onClose }: { level: any, onClose: () => void }) => {
  const [, setLocation] = useLocation();
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContenidos = async () => {
      let finalContents: Contenido[] = [];
      const title = level.tituloNivel?.toLowerCase() || '';
      const isS1 = title.includes('s1') || title.includes('historia') || level.id === 1;
      const isS2 = title.includes('s2') || title.includes('instrucciones') || title.includes('juego') || level.id === 1001 || level.id === 2;

      // Skip API for virtual LATAM levels to prevent 404 logs
      if (isS1 || isS2) {
        setLoading(false);
      } else {
        try {
          setLoading(true);
          finalContents = await apiClient.get<Contenido[]>(`/api/student/levels/${level.id}/contents`);
        } catch (error: any) {
          console.warn("Contents not found for level:", level.id);
        } finally {
          setLoading(false);
        }
      }

      // INJECTION: If it's a LATAM session, we ALWAYS add the interactive session item
      if (isS1 || isS2) {
        const interactiveItem: Contenido = {
          id: isS1 ? 9991 : 9992, // High IDs to avoid collisions
          tipo: 'video',
          tituloEjercicio: isS1 ? '🎮 Sesión Interactiva S1: Mi Primer Día' : '🎮 Sesión Interactiva S2: Las Instrucciones',
          descripcionEjercicio: 'Carga el visor de Academy con la historia y retos en vivo.',
          urlRecurso: '#'
        };
        
        // Add only if not already present
        if (!finalContents.some(c => c.tituloEjercicio?.includes('Sesión Interactiva'))) {
            finalContents = [interactiveItem, ...finalContents];
        }
      }

      setContenidos(finalContents);
      setLoading(false);
    };
    fetchContenidos();
  }, [level.id, level.tituloNivel]);

  // Group contents by phase
  const suministros = contenidos.filter(c => ['video', 'pdf', 'slides', 'nota'].includes(c.tipo || ''));
  const maquinaria = contenidos.filter(c => ['link', 'codigo_lab'].includes(c.tipo || ''));
  const calidad = contenidos.filter(c => ['entregable', 'quiz', 'tarea'].includes(c.tipo || ''));

  const PhaseSection = ({ title, icon: Icon, items, color, description }: any) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-black text-slate-800 uppercase tracking-tight leading-none">{title}</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 italic font-medium p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No hay elementos cargados en esta fase.
          </p>
        ) : (
          items.map((item: any) => (
            <motion.div 
              key={item.id}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group hover:border-blue-200 transition-all cursor-pointer shadow-sm"
              onClick={() => {
                // If it's a GDevelop session for LATAM, open the interactive viewer
                const title = item.tituloEjercicio?.toLowerCase() || '';
                const isGDevelop = title.includes('gdevelop');
                const isLatamS1 = title.includes('s1') || title.includes('historia') || item.id === 9991;
                const isLatamS2 = title.includes('s2') || title.includes('instrucciones') || item.id === 9992;

                if (isGDevelop || isLatamS1 || isLatamS2) {
                    const sessionId = isLatamS1 ? 1 : 1001;
                    setLocation(`/latam/session/${sessionId}`);
                    onClose();
                } else if (item.urlRecurso) {
                    window.open(item.urlRecurso, '_blank');
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                   {['video', 'slides'].includes(item.tipo) ? <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-blue-500" /> : <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{item.tituloEjercicio || "Sin título"}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black">{item.tipo}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500 transition-colors" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-[3rem] w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Package className="text-white w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <h2 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">{level.tituloNivel}</h2>
                   <div className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Activo</div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Sede Corporativa de Entrenamiento</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {level.googleMeetUrl && (
                <Button 
                  onClick={() => window.open(level.googleMeetUrl, '_blank')}
                  className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black italic px-6 gap-3 group"
                >
                  <Video className="w-5 h-5" />
                  UNIRSE A GOOGLE MEET
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              )}
              {level.googleCalendarUrl && (
                <Button 
                  onClick={() => window.open(level.googleCalendarUrl, '_blank')}
                  variant="outline"
                  className="h-12 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-black italic px-6 gap-3"
                >
                  <Calendar className="w-5 h-5 text-blue-500" />
                  CALENDARIO DE CLASES
                </Button>
              )}
              
              {/* FORCED LATAM BUTTON */}
              {(level.id === 1 || level.id === 2 || level.id === 1001 || level.tituloNivel?.toLowerCase().includes('s1') || level.tituloNivel?.toLowerCase().includes('s2')) && (
                <Button 
                  onClick={() => {
                    const sessionId = (level.id === 1 || level.tituloNivel?.toLowerCase().includes('s1')) ? 1 : 1001;
                    setLocation(`/latam/session/${sessionId}`);
                    onClose();
                  }}
                  className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black italic px-8 gap-3 shadow-lg shadow-blue-600/20 animate-pulse-slow"
                >
                  <Gamepad2 className="w-6 h-6" />
                  ACCEDER A SESIÓN INTERACTIVA
                </Button>
              )}

              <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100 ml-2">
                <X className="text-slate-400 w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-10 overflow-y-auto grid md:grid-cols-3 gap-12 bg-gradient-to-b from-white to-slate-50/30">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <PhaseSection 
                  title="1. Suministros" 
                  icon={Package} 
                  items={suministros}
                  color="bg-blue-50 border-blue-100 text-blue-600"
                  description="Materiales y Teoría"
                />
                <PhaseSection 
                  title="2. Maquinaria" 
                  icon={Cpu} 
                  items={maquinaria}
                  color="bg-purple-50 border-purple-100 text-purple-600"
                  description="Herramientas y Labs"
                />
                <PhaseSection 
                  title="3. Control Calidad" 
                  icon={ShieldCheck} 
                  items={calidad}
                  color="bg-emerald-50 border-emerald-100 text-emerald-600"
                  description="Tareas y Evaluación"
                />
              </>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
             <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                   <Award className="w-5 h-5 text-amber-500" />
                   <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Recompensa: 250 XP + 0.25 Geniomonedas</p>
                </div>
                <div className="flex items-center gap-2">
                   <FlaskConical className="w-5 h-5 text-blue-500" />
                   <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Estado: Operativo</p>
                </div>
             </div>
             <p className="text-[10px] text-slate-400 font-bold italic">Latam Academy Professional Management v2.0</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

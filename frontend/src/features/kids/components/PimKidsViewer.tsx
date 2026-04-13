import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, CheckCircle2, Video, Lightbulb, ArrowRight, Star } from 'lucide-react';

interface PimKidsViewerProps {
  user: any;
  template: any;
  standalone?: boolean;
  onFinish: () => void;
}

export function PimKidsViewer({ template, onFinish }: PimKidsViewerProps) {
  const { actividades, titulo, videoUrl } = template;
  const milestones = actividades?.milestones || [];
  const description = actividades?.description || "";

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = videoUrl ? getYouTubeId(videoUrl) : null;

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
        {/* Header Project */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200"
        >
          <Rocket className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">{titulo}</h1>
        <div className="flex justify-center gap-2">
           <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full font-bold text-sm uppercase tracking-widest">Proyecto PIM</span>
           <span className="bg-amber-100 text-amber-600 px-4 py-1 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-1">
             <Star className="w-3 h-3 fill-amber-500" /> Nivel Maestro
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Info & Video */}
        <div className="space-y-6">
          <Card className="rounded-[3rem] border-4 border-indigo-50 shadow-xl shadow-indigo-500/5">
            <CardHeader className="bg-indigo-50/50 pb-2">
              <CardTitle className="text-indigo-800 font-black flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-indigo-500" /> LA GRAN IDEA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-xl text-slate-600 leading-relaxed font-medium capitalize-first">
                {description || "¡Es hora de construir algo increíble! Sigue los pasos para completar tu proyecto tecnológico."}
              </p>
            </CardContent>
          </Card>

          {videoId && (
            <Card className="rounded-[3rem] border-4 border-red-50 shadow-xl shadow-red-500/5 overflow-hidden">
               <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full"
                  />
               </div>
               <div className="p-4 bg-red-50 text-red-700 font-bold flex items-center justify-center gap-2">
                 <Video className="w-5 h-5" /> Video de Inspiración
               </div>
            </Card>
          )}
        </div>

        {/* Right Column: Milestones */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 ml-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" /> ETAPAS DEL PROYECTO
          </h2>
          
          <div className="space-y-4">
            {milestones.length > 0 ? milestones.map((m: string, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ x: 50, opacity: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center font-black text-xl transition-colors">
                  {idx + 1}
                </div>
                <p className="text-lg font-bold text-slate-700">{m}</p>
              </motion.div>
            )) : (
              <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold">
                 No se han definido etapas aún.
              </div>
            )}
          </div>

          <Button 
            onClick={onFinish}
            className="w-full h-20 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-2xl shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 group"
          >
            ¡LISTO, LO COMPLETÉ! <ArrowRight className="w-8 h-8 ml-3 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}

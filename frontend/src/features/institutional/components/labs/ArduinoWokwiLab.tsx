import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, X, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArduinoWokwiLabProps {
  backHref?: string;
}

export const ArduinoWokwiLab = ({ backHref = '/city-dashboard' }: ArduinoWokwiLabProps) => {
  const wokwiUrl = "https://wokwi.com/projects/new/arduino-uno";
  const [key, setKey] = React.useState(0);

  const handleRefresh = () => setKey(prev => prev + 1);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[400] bg-slate-950 flex flex-col border-[12px] border-black"
    >
      {/* Header Estilo Neo-Bot */}
      <div className="h-20 bg-black border-b-4 border-white/5 flex items-center justify-between px-8 relative overflow-hidden">
        <div className="absolute inset-0 city-grid-pattern opacity-10 pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <Link href={backHref}>
            <Button variant="ghost" className="text-slate-400 hover:text-white group">
              <ArrowLeft className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform" />
              VOLVER
            </Button>
          </Link>
          <div className="h-8 w-1 bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border-2 border-teal-500 flex items-center justify-center text-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                LABORATORIO <span className="text-teal-500">ARDUINO</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[8px] font-black uppercase">WOKWI ENGINE CONNECTED</Badge>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SISTEMA DE SIMULACIÓN PROFESIONAL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="border-2 border-black bg-slate-900 text-slate-400 hover:text-white rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_#000]"
          >
            <RefreshCw className="w-3 h-3 mr-2" /> REINICIAR
          </Button>
          <Button 
            onClick={() => window.open(wokwiUrl, '_blank')}
            className="border-2 border-black bg-teal-500 hover:bg-teal-400 text-black rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_#000]"
          >
            <ExternalLink className="w-3 h-3 mr-2" /> PESTAÑA APARTE
          </Button>
          <Link href={backHref}>
            <Button className="w-12 h-12 bg-red-600 border-4 border-black text-white p-0 rounded-2xl shadow-[4px_4px_0_#000]">
              <X />
            </Button>
          </Link>
        </div>
      </div>

      {/* Iframe de Wokwi */}
      <div className="flex-1 bg-[#1e1e1e] relative">
        <iframe
          key={key}
          src={wokwiUrl}
          className="w-full h-full border-0"
          title="Wokwi Arduino Simulator"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone"
          allowFullScreen
        />
      </div>

      <style>{`
        .city-grid-pattern {
           background-image: linear-gradient(rgba(20, 184, 166, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.05) 1px, transparent 1px);
           background-size: 40px 40px;
        }
      `}</style>
    </motion.div>
  );
};

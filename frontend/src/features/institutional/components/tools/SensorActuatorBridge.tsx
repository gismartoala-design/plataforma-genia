
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Moon, 
  Sun,
  Activity,
  RotateCcw, 
  CheckCircle2, 
  Cpu,
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import '../../styles/ConstructionTheme.css';

export const SensorActuatorBridge = ({ onComplete }: { onComplete: () => void }) => {
  const [, setLocation] = useLocation();
  const [isNight, setIsNight] = useState(false);
  const [bridgeLogic, setBridgeLogic] = useState<'ALWAYS' | 'AUTO'>('ALWAYS');
  const [isRunning, setIsRunning] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleSensor = () => {
    if (isRunning || success) return;
    setIsNight(!isNight);
  };

  const toggleLogic = () => {
    if (isRunning || success) return;
    setBridgeLogic(prev => prev === 'ALWAYS' ? 'AUTO' : 'ALWAYS');
  };

  const testSystem = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Goal: System should be in AUTO and state should be NIGHT to successfully activate the sequence
      if (bridgeLogic === 'AUTO' && isNight) {
        setSuccess(true);
        setTimeout(onComplete, 2500);
      } else {
        setIsRunning(false);
      }
    }, 1200);
  };

  const isLightOn = bridgeLogic === 'ALWAYS' || (bridgeLogic === 'AUTO' && isNight && isRunning);

  return (
    <div className="flex flex-col h-full bg-[#020617] p-6 md:p-10 gap-8 overflow-hidden font-sans text-white relative">
      <div className="absolute inset-0 construction-grid opacity-10" />
      
      <header className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-black uppercase tracking-widest text-[9px] holographic px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit">
            <Activity className="w-3 h-3" /> Protocolo de Nivel 2
          </div>
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">
            Puente de <span className="text-cyan-400 text-glitch">Sensores y Actuadores</span>
          </h2>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/city-dashboard')}
          className="text-slate-500 hover:text-white"
        >
          Abortar Misión
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-16 relative z-10">
         <div className="flex items-center gap-6 md:gap-20">
            {/* Sensor (Input) */}
            <motion.div
              onClick={toggleSensor}
              className={cn(
                "w-32 h-40 rounded-3xl flex flex-col items-center justify-center gap-4 border-2 transition-all relative overflow-hidden group cursor-pointer shadow-2xl",
                isNight ? "bg-slate-900 border-indigo-500/50" : "bg-orange-500/10 border-orange-500/50"
              )}
            >
               <p className="text-[9px] font-black uppercase tracking-widest absolute top-4">Sensor Lux</p>
               {isNight ? <Moon className="w-12 h-12 text-indigo-400 animate-pulse" /> : <Sun className="w-12 h-12 text-orange-500" />}
               <Badge className={cn("uppercase text-[8px]", isNight ? "bg-indigo-950 text-indigo-400" : "bg-orange-600 text-white")}>
                 {isNight ? "Oscuridad" : "Luz Solar"}
               </Badge>
               <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500/20" />
            </motion.div>

            {/* Bridge (Logic) */}
            <div className="flex flex-col items-center gap-4">
               <div className={cn("h-1 w-20 transition-all duration-1000", isRunning ? "bg-cyan-500 shadow-glow" : "bg-slate-800")} />
               <motion.button
                 onClick={toggleLogic}
                 className={cn(
                   "w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center gap-2 transition-all safety-border shadow-2xl",
                   bridgeLogic === 'AUTO' ? "bg-cyan-500/20 border-cyan-500" : "bg-slate-900 border-white/10"
                 )}
               >
                  <Cpu className={cn("w-10 h-10", bridgeLogic === 'AUTO' ? "text-cyan-400 animate-spin-slow" : "text-slate-600")} />
                  <p className="text-[10px] font-black uppercase tracking-widest">{bridgeLogic}</p>
               </motion.button>
               <div className={cn("h-1 w-20 transition-all duration-1000", isRunning && isNight && bridgeLogic === 'AUTO' ? "bg-cyan-500 shadow-glow" : "bg-slate-800")} />
            </div>

            {/* Actuator (Output) */}
            <div
              className={cn(
                "w-32 h-40 rounded-3xl flex flex-col items-center justify-center gap-4 border-2 transition-all shadow-2xl relative overflow-hidden",
                isLightOn ? "bg-yellow-500/20 border-yellow-500/50" : "bg-slate-900 border-white/5 opacity-40"
              )}
            >
               <p className="text-[9px] font-black uppercase tracking-widest absolute top-4">Alumbrado</p>
               <Lightbulb className={cn("w-12 h-12 transition-all", isLightOn ? "text-yellow-400 fill-current drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" : "text-slate-700")} />
               <Badge className={cn("uppercase text-[8px]", isLightOn ? "bg-yellow-600 text-white" : "bg-slate-800 text-slate-500")}>
                 {isLightOn ? "Activo" : "Apagado"}
               </Badge>
            </div>
         </div>

         <Card className="max-w-md bg-slate-900/60 backdrop-blur-md border-white/5 p-8 rounded-[2rem] text-center space-y-4 shadow-3xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center justify-center gap-2">
               <Fingerprint className="w-4 h-4" /> Diagnóstico de Automatización
            </h3>
            <p className="text-slate-300 text-sm font-medium italic leading-relaxed">
              "Para ahorrar energía en la ciudad, configura el puente en **AUTO**. Las luces solo deben encenderse si el sensor detecta **Oscuridad**."
            </p>
         </Card>
      </div>

      <footer className="flex justify-center gap-4 relative z-10">
        <Button 
          onClick={() => { setIsNight(false); setBridgeLogic('ALWAYS'); setIsRunning(false); setSuccess(false); }}
          className="h-14 px-8 rounded-2xl bg-white/5 border border-white/5 text-slate-400 font-bold"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar
        </Button>
        <Button 
          onClick={testSystem}
          disabled={isRunning || success}
          className={cn(
            "h-14 px-12 rounded-2xl font-black italic uppercase tracking-widest shadow-2lg active:scale-95 transition-all safety-border",
            success ? "bg-cyan-500 text-white shadow-cyan-500/30" : "bg-orange-600 hover:bg-orange-500 text-white"
          )}
        >
          {success ? "Eficiencia Lograda" : isRunning ? "Simulando Ciclo..." : "Probar Sistema"}
        </Button>
      </footer>
    </div>
  );
};

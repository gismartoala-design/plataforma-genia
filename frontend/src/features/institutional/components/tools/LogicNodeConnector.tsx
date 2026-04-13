
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import '../../styles/ConstructionTheme.css';

export const LogicNodeConnector = ({ onComplete }: { onComplete: () => void }) => {
  const [, setLocation] = useLocation();
  const [nodes, setNodes] = useState([
    { id: '1', active: true, label: 'Generador A', type: 'source' },
    { id: '2', active: false, label: 'Nodo de Enlace', type: 'bridge' },
    { id: '3', active: false, label: 'Suministro Core', type: 'target' },
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleNode = (id: string) => {
    if (isRunning || success) return;
    setNodes(prev => prev.map(n => {
      if (n.id === id && n.type === 'bridge') {
        return { ...n, active: !n.active };
      }
      return n;
    }));
  };

  const checkConnection = () => {
    setIsRunning(true);
    setTimeout(() => {
      const isBridgeActive = nodes.find(n => n.id === '2')?.active;
      if (isBridgeActive) {
        setNodes(prev => prev.map(n => n.id === '3' ? { ...n, active: true } : n));
        setSuccess(true);
        setTimeout(onComplete, 2000);
      } else {
        setIsRunning(false);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] p-6 md:p-10 gap-8 overflow-hidden font-sans text-white relative">
      <div className="absolute inset-0 construction-grid opacity-10" />
      
      <header className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500 font-black uppercase tracking-widest text-[9px] holographic px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full w-fit">
            <Zap className="w-3 h-3 fill-current" /> Protocolo de Nivel 1
          </div>
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">
            Conector de <span className="text-orange-500 text-glitch">Nodos Lógicos</span>
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

      <div className="flex-1 flex flex-col items-center justify-center gap-12 relative z-10">
         <div className="flex items-center gap-4 md:gap-16">
            {nodes.map((node, i) => (
              <React.Fragment key={node.id}>
                <motion.div
                  onClick={() => toggleNode(node.id)}
                  whileHover={node.type === 'bridge' ? { scale: 1.1 } : {}}
                  className={cn(
                    "w-24 h-24 md:w-32 md:h-32 rounded-3xl flex flex-col items-center justify-center gap-2 border-2 transition-all relative",
                    node.active 
                      ? "bg-orange-500/20 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] holographic" 
                      : "bg-slate-900 border-white/5 opacity-60",
                    node.type === 'bridge' && !success && "cursor-pointer hover:border-orange-500/50"
                  )}
                >
                  {node.type === 'source' && <Zap className={cn("w-8 h-8", node.active && "text-orange-500 fill-current animate-pulse")} />}
                  {node.type === 'bridge' && <ShieldCheck className={cn("w-8 h-8", node.active ? "text-orange-500" : "text-slate-700")} />}
                  {node.type === 'target' && <Cpu className={cn("w-8 h-8", node.active ? "text-cyan-400 animate-bounce" : "text-slate-700")} />}
                  
                  <p className="text-[8px] font-black uppercase tracking-widest text-center px-2">{node.label}</p>
                </motion.div>
                
                {i < nodes.length - 1 && (
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "w-8 md:w-16 h-1 rounded-full transition-all duration-1000",
                      (i === 0 || (i === 1 && nodes[1].active)) && success ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" : "bg-slate-800"
                    )} />
                    <ArrowRight className={cn("w-4 h-4", success ? "text-orange-500" : "text-slate-700")} />
                  </div>
                )}
              </React.Fragment>
            ))}
         </div>

         <div className="max-w-md text-center space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">Instrucción de Campo</h3>
            <p className="text-slate-400 text-sm font-medium italic">
              "Para restaurar la energía en el Core, debes activar el **Nodo de Enlace**. Haz clic en el escudo para cerrar el circuito."
            </p>
         </div>
      </div>

      <footer className="flex justify-center gap-4 relative z-10">
        <Button 
          onClick={() => setNodes(nodes.map(n => n.id === '2' ? { ...n, active: false } : n.id === '3' ? { ...n, active: false } : n))}
          className="h-14 px-8 rounded-2xl bg-white/5 border border-white/5 text-slate-400 font-bold"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar
        </Button>
        <Button 
          onClick={checkConnection}
          disabled={isRunning || success}
          className={cn(
            "h-14 px-12 rounded-2xl font-black italic uppercase tracking-widest shadow-2lg active:scale-95 transition-all safety-border",
            success ? "bg-cyan-500 text-white" : "bg-orange-600 hover:bg-orange-500 text-white"
          )}
        >
          {success ? "Conexión Establecida" : isRunning ? "Verificando..." : "Cerrar Circuito"}
        </Button>
      </footer>
    </div>
  );
};

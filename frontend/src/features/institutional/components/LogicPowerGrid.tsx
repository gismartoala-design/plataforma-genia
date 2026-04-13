
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Settings, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import '../styles/ConstructionTheme.css';

interface GateProps {
  type: 'AND' | 'OR' | 'NOT' | 'XOR';
  inputA: boolean;
  inputB?: boolean;
}

const computeGate = (type: string, a: boolean, b?: boolean): boolean => {
  switch (type) {
    case 'AND': return a && (b ?? false);
    case 'OR': return a || (b ?? false);
    case 'NOT': return !a;
    case 'XOR': return a !== (b ?? false);
    default: return false;
  }
};

export const LogicPowerGrid = ({ onComplete }: { onComplete: () => void }) => {
  const [nodes, setNodes] = useState([
    { id: 'in1', type: 'source', value: true, label: 'Reactor α' },
    { id: 'in2', type: 'source', value: false, label: 'Reactor β' },
    { id: 'gate1', type: 'gate', gateType: 'OR', inputA: 'in1', inputB: 'in2', value: false },
    { id: 'gate2', type: 'gate', gateType: 'NOT', inputA: 'gate1', value: false },
    { id: 'out', type: 'target', inputA: 'gate2', value: false, goal: true }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleGate = (id: string) => {
    if (isRunning) return;
    setNodes((prev: any[]) => prev.map(node => {
      if (node.id === id && node.type === 'gate') {
        const types = ['AND', 'OR', 'XOR'];
        if (node.gateType === 'NOT') return node; // NOT is fixed for this puzzle level
        const currentIndex = types.indexOf(node.gateType!);
        const nextIndex = (currentIndex + 1) % types.length;
        return { ...node, gateType: types[nextIndex] };
      }
      return node;
    }));
  };

  const runSimulation = () => {
    setIsRunning(true);
    
    // Simulate signal propagation
    setTimeout(() => {
      const updatedNodes = [...nodes];
      
      // Compute gate 1
      const in1 = updatedNodes.find(n => n.id === 'in1')!.value;
      const in2 = updatedNodes.find(n => n.id === 'in2')!.value;
      const g1 = updatedNodes.find(n => n.id === 'gate1')!;
      g1.value = computeGate(g1.gateType!, in1, in2);
      
      // Compute gate 2
      const g2 = updatedNodes.find(n => n.id === 'gate2')!;
      g2.value = computeGate(g2.gateType!, g1.value);
      
      // Compute output
      const out = updatedNodes.find(n => n.id === 'out')!;
      out.value = g2.value;
      
      setNodes(updatedNodes);
      setIsRunning(false);
      
      if (out.value === out.goal) {
        setSuccess(true);
        setTimeout(onComplete, 2000);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--inst-peach)] p-8 gap-8 overflow-hidden font-sans text-[var(--inst-slate)] relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 construction-grid opacity-10" />
        <div className="scaffold-lines opacity-10" />
      </div>

      <header className="flex justify-between items-center relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[var(--inst-rose)] font-black uppercase tracking-widest text-[10px] holographic px-3 py-1 bg-[var(--inst-rose)]/10 border border-[var(--inst-rose)]/20 rounded-full w-fit">
            <Zap className="w-3 h-3 fill-current" /> Sistema de Protocolo Lógico
          </div>
          <h2 className="text-3xl font-black italic uppercase text-[var(--inst-slate)] tracking-tighter mt-2">
            Restauración de <span className="text-[var(--inst-rose)] text-glitch">Nodos Críticos</span>
          </h2>
        </div>
        
        <Card className="bg-[var(--inst-salmon)]/40 backdrop-blur-xl border-[var(--inst-mauve)]/20 p-5 flex gap-8 italic rounded-3xl safety-border shadow-sm">
            <div className="text-center">
                <p className="text-[10px] uppercase text-[var(--inst-slate)]/60 font-black tracking-widest">Objetivo Académico</p>
                <p className="text-sm font-bold text-[var(--inst-rose)] uppercase tracking-widest">Activar Core 4.0</p>
            </div>
            <div className="w-px h-full bg-[var(--inst-mauve)]/20" />
            <div className="text-center">
                <p className="text-[10px] uppercase text-[var(--inst-slate)]/60 font-black tracking-widest">Salida Requerida</p>
                <p className="text-sm font-bold text-[var(--inst-mauve)] uppercase tracking-widest">TRUE (1)</p>
            </div>
        </Card>
      </header>

      <div className="flex-1 relative flex items-center justify-center border-2 border-white/5 rounded-[3rem] bg-slate-900/20 overflow-hidden">
         {/* Circuit Lines (Background) */}
         <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 800 400">
                <path d="M 100 150 L 300 200 M 100 250 L 300 200" stroke="#475569" strokeWidth="4" fill="none" />
                <path d="M 300 200 L 500 200" stroke="#475569" strokeWidth="4" fill="none" />
                <path d="M 500 200 L 700 200" stroke="#475569" strokeWidth="4" fill="none" />
            </svg>
         </div>

         {/* Logic Components */}
         <div className="relative z-10 w-full max-w-4xl flex justify-between items-center px-20">
            {/* Input Sources */}
            <div className="flex flex-col gap-20">
                {nodes.filter(n => n.type === 'source').map(source => (
                    <motion.div 
                        key={source.id}
                        className={cn(
                            "w-28 h-28 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-sm transition-all border-2 safety-border font-sans",
                            source.value ? "bg-[var(--inst-rose)]/10 border-[var(--inst-rose)]/50 text-[var(--inst-rose)]" : "bg-[var(--inst-salmon)]/20 border-[var(--inst-mauve)]/10 text-[var(--inst-slate)]/40"
                        )}
                    >
                        <Zap className={cn("w-8 h-8", source.value && "fill-current animate-pulse")} />
                        <p className="text-[8px] font-black uppercase tracking-widest">{source.label}</p>
                        <Badge className={source.value ? "bg-[var(--inst-rose)] text-white" : "bg-[var(--inst-mauve)]/20 text-[var(--inst-slate)]/50"}>
                            {source.value ? 'ON' : 'OFF'}
                        </Badge>
                    </motion.div>
                ))}
            </div>

            {/* Configurable Gates */}
            <div className="flex gap-20">
                {nodes.filter(n => n.type === 'gate').map(gate => (
                    <motion.button
                        key={gate.id}
                        onClick={() => toggleGate(gate.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "w-36 h-36 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 border-2 transition-all relative group safety-border",
                            gate.value && isRunning ? "bg-[var(--inst-rose)]/20 border-[var(--inst-rose)]/50 shadow-[var(--inst-rose)]/20 holographic" : "bg-[var(--inst-salmon)]/30 border-[var(--inst-mauve)]/10 shadow-sm"
                        )}
                    >
                        <div className="absolute -top-4 bg-[var(--inst-rose)] border border-[var(--inst-mauve)]/20 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            {gate.gateType === 'NOT' ? 'Fijo' : 'Reconfigurar'}
                        </div>
                        <Settings className={cn("w-12 h-12 animate-spin-slow", isRunning ? "text-[var(--inst-rose)]" : "text-[var(--inst-mauve)]")} />
                        <p className="text-3xl font-black italic tracking-tighter text-[var(--inst-slate)]">
                            {gate.gateType}
                        </p>
                    </motion.button>
                ))}
            </div>

            {/* Target Output */}
            <div className={cn(
                "w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 border-4 transition-all relative safety-border",
                nodes.find(n => n.id === 'out')!.value 
                    ? "bg-[var(--inst-mauve)]/20 border-[var(--inst-mauve)] shadow-[0_0_80px_rgba(183,140,152,0.3)] holographic" 
                    : "bg-[var(--inst-salmon)]/40 border-[var(--inst-mauve)]/10"
            )}>
                {nodes.find(n => n.id === 'out')!.value && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-[var(--inst-mauve)]/40 rounded-full"
                    />
                )}
                <Cpu className={cn("w-14 h-14 mb-1", nodes.find(n => n.id === 'out')!.value ? "text-[var(--inst-mauve)] animate-pulse" : "text-[var(--inst-slate)]/20")} />
                <p className="text-[10px] font-black uppercase text-[var(--inst-slate)] tracking-widest italic">Core Neobot</p>
            </div>
         </div>
      </div>

      <footer className="flex justify-between items-center bg-white/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-[var(--inst-mauve)]/10">
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-[var(--inst-slate)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[var(--inst-mauve)]" /> Instrucciones Técnicas
            </h4>
            <p className="text-xs text-[var(--inst-slate)]/70 font-medium max-w-md">
                Ajusta las compuertas lógicas para que la señal de los reactores llegue al Core con valor <strong className="text-[var(--inst-mauve)]">TRUE (1)</strong>. Recuerda: NOT invierte la señal.
            </p>
         </div>

         <div className="flex gap-4">
            <Button 
                variant="outline" 
                onClick={() => setNodes(nodes.map(n => ({ ...n, value: n.type === 'source' ? n.value : false })))}
                className="h-16 px-8 rounded-2xl border-[var(--inst-mauve)]/20 text-[var(--inst-slate)]/60 font-black hover:bg-[var(--inst-salmon)]/20"
            >
                <RotateCcw className="w-5 h-5 mr-3" /> Reiniciar
            </Button>
            
            <Button 
                onClick={runSimulation}
                disabled={isRunning || success}
                className={cn(
                    "h-16 px-12 rounded-2xl font-black italic uppercase tracking-widest text-lg transition-all safety-border",
                    success ? "bg-[var(--inst-mauve)] text-white" : "bg-[var(--inst-rose)] hover:bg-[var(--inst-rose)]/90 text-white shadow-lg hover:scale-105 shadow-[var(--inst-rose)]/20"
                )}
            >
                {success ? (
                    <>Protocolo Exitoso <CheckCircle2 className="w-6 h-6 ml-3" /></>
                ) : isRunning ? (
                    "Ejecutando..."
                ) : (
                    <>Cerrar Circuito 4.0 <Play className="w-5 h-5 ml-3" /></>
                )}
            </Button>
         </div>
      </footer>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

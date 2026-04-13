
import React, { useState } from 'react';
import { 
  Cpu, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle2,
  Save,
  Wrench,
  Settings,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ArduinoLabEditorProps {
    data: any;
    onSave: (data: any) => void;
}

const ARDUINO_PARTS = [
    { id: 'usb', name: 'Puerto USB', description: 'Enlace de datos y energía', pos: "top-[15%] left-0 w-16 h-20" },
    { id: 'power_jack', name: 'Jack de Fuerza', description: 'Entrada DC externa', pos: "bottom-[12%] left-0 w-20 h-24" },
    { id: 'micro', name: 'Microcontrolador', description: 'Cerebro ATmega328P', pos: "bottom-[20%] right-[15%] w-24 h-32 transform -rotate-15" },
    { id: 'digital_pins', name: 'Pines Digitales', description: 'Entradas/Salidas D0-D13', pos: "top-2 right-4 w-[60%] h-8" },
    { id: 'analog_pins', name: 'Pines Analógicos', description: 'Entradas A0-A5', pos: "bottom-2 right-8 w-[40%] h-8" },
    { id: 'reset', name: 'Núcleo Reset', description: 'Reinicio de sistema', pos: "top-10 right-12 w-8 h-8 rounded-full" }
];

export const ArduinoLabEditor = ({ data, onSave }: ArduinoLabEditorProps) => {
    const [selectedParts, setSelectedParts] = useState<string[]>(data.parts || []);

    const togglePart = (id: string) => {
        if (selectedParts.includes(id)) {
            setSelectedParts(selectedParts.filter(p => p !== id));
        } else {
            setSelectedParts([...selectedParts, id]);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Engine Preview Container */}
            <div className="bg-[#0b1121] border-2 border-white/5 rounded-[3rem] p-10 flex flex-col items-center gap-8 relative overflow-hidden group shadow-3xl">
                <div className="absolute inset-0 arduino-grid opacity-10 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                
                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-4 h-4 text-cyan-500" />
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Configuración Técnica</span>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        MAPEO DE <span className="text-cyan-500">HARDWARE</span>
                    </h3>
                </div>

                {/* Previsualización de la Placa */}
                <div className="relative p-6 bg-black/20 rounded-[3rem] border border-white/5 backdrop-blur-sm">
                    <motion.div 
                        className="relative w-[280px] h-[400px] bg-[#005082] rounded-[3rem] border-[8px] border-[#003d63] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col p-4 shadow-inner"
                    >
                         {/* Silk Screen Details */}
                        <div className="absolute top-6 left-10 opacity-10 pointer-events-none select-none">
                            <h4 className="text-[30px] font-black italic text-white tracking-widest -rotate-90 origin-top-left transform translate-y-16">ARDUINO</h4>
                        </div>
                        
                        <div className="absolute bottom-8 right-6 text-[10px] font-black italic text-white/30 uppercase tracking-[0.4em]">UNO R3</div>
                        
                        {/* Interactive Zones */}
                        {ARDUINO_PARTS.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => togglePart(p.id)}
                                className={cn(
                                    "absolute transition-all rounded-xl border-2 flex items-center justify-center cursor-pointer group/node",
                                    selectedParts.includes(p.id) 
                                        ? "bg-emerald-500 border-white shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10" 
                                        : "bg-black/40 border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 z-0",
                                    p.pos
                                )}
                            >
                                {selectedParts.includes(p.id) ? (
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                ) : (
                                    <Plus className="w-4 h-4 text-white/20 group-hover/node:text-cyan-400 group-hover/node:scale-125 transition-all" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                </div>

                <div className="bg-slate-900/60 px-6 py-2 rounded-full border border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Nodos Activos: <span className="text-white">{selectedParts.length}</span>
                    </span>
                </div>
            </div>

            {/* Part Selection List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Listado de Componentes</h4>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Selección Manual</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    {ARDUINO_PARTS.map(part => (
                        <Button 
                            key={part.id}
                            variant="ghost"
                            className={cn(
                                "h-20 rounded-2xl flex flex-col items-start justify-center p-5 border-2 transition-all group/btn relative overflow-hidden",
                                selectedParts.includes(part.id) 
                                    ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400" 
                                    : "bg-white/5 border-transparent text-slate-500 hover:border-white/10 hover:bg-white/10"
                            )}
                            onClick={() => togglePart(part.id)}
                        >
                            <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{part.name}</span>
                                {selectedParts.includes(part.id) && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <span className="text-[9px] opacity-60 font-bold truncate w-full text-left uppercase tracking-tighter">
                                {part.description}
                            </span>
                            
                            {selectedParts.includes(part.id) && (
                                <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-full" />
                            )}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                <Button 
                    onClick={() => onSave({ parts: selectedParts })}
                    className="w-full h-16 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest italic group shadow-[0_20px_40px_-10px_rgba(8,145,178,0.3)] transition-all hover:-translate-y-1"
                >
                    <Save className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                    Sincronizar Protocolo de Laboratorio
                </Button>
                <div className="flex items-center justify-center gap-4 mt-6 opacity-30">
                    <div className="h-px flex-1 bg-white/10" />
                    <Settings className="w-4 h-4 text-white" />
                    <div className="h-px flex-1 bg-white/10" />
                </div>
            </div>

            <style>{`
                .arduino-grid {
                    background-image: linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
};


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Send,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PreguntaChallengeProps {
    data: {
        pregunta: string;
        feedback: string;
    };
    onComplete: () => void;
}

export const PreguntaChallenge = ({ data, onComplete }: PreguntaChallengeProps) => {
    const [respuesta, setRespuesta] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    const handleSubmit = () => {
        if (!respuesta.trim()) return;
        setIsComplete(true);
        setTimeout(onComplete, 3000);
    };

    return (
        <div className="max-w-2xl mx-auto w-full space-y-8">
            <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border-2 border-cyan-500/50 flex items-center justify-center mx-auto holographic">
                    <HelpCircle className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Análisis de <span className="text-cyan-400">Protocolo</span></h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed max-w-sm mx-auto">
                    {data.pregunta || "Reflexiona sobre los conceptos técnicos abordados en esta actividad."}
                </p>
            </div>

            {!isComplete ? (
                <div className="space-y-6">
                    <Textarea 
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                        placeholder="Escribe tu respuesta técnica aquí..."
                        className="min-h-[150px] bg-slate-900 border-white/10 rounded-[2rem] p-8 focus:border-cyan-500/50 transition-all text-white font-medium italic text-lg shadow-2xl"
                    />
                    <Button 
                        onClick={handleSubmit}
                        disabled={!respuesta.trim()}
                        className="w-full h-20 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] italic text-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] safety-border"
                    >
                        Enviar Respuesta <Send className="ml-4 w-6 h-6" />
                    </Button>
                </div>
            ) : (
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-[3rem] p-10 text-center space-y-6 backdrop-blur-xl"
                >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h4 className="text-2xl font-black italic uppercase text-emerald-400">¡Validación Exitosa!</h4>
                    <p className="text-slate-300 font-medium italic text-lg leading-relaxed">
                        "{data.feedback || "Tu análisis ha sido registrado en el sistema de la ciudad."}"
                    </p>
                    <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500/60">
                         <ShieldCheck className="w-4 h-4" /> Encriptación de Respuesta Finalizada
                    </div>
                </motion.div>
            )}
        </div>
    );
};

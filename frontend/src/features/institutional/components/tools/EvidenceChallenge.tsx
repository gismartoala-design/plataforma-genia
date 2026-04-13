import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Video, 
  Image as ImageIcon,
  CheckCircle2,
  X,
  File,
  Send,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EvidenceChallengeProps {
    data: {
        instrucciones: string;
        feedback?: string;
    };
    onComplete: () => void;
}

export const EvidenceChallenge = ({ data, onComplete }: EvidenceChallengeProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const handleUpload = () => {
        if (!file) return;
        setIsComplete(true);
        // In a real scenario, this would call an API/S3
        setTimeout(onComplete, 3000);
    };

    return (
        <div className="max-w-2xl mx-auto w-full space-y-8 px-6">
            <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center mx-auto holographic shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Entrega de <span className="text-blue-400">Evidencias</span></h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed max-w-sm mx-auto">
                    {data.instrucciones || "Sube tu archivo de respaldo (Documento, Video o Imagen) para validar esta actividad académica en tu ciudad."}
                </p>
            </div>

            {!isComplete ? (
                <div className="space-y-6">
                    <label className="block">
                        <div className={cn(
                            "group relative flex flex-col items-center justify-center w-full h-72 border-4 border-dashed rounded-[3rem] transition-all cursor-pointer overflow-hidden",
                            file 
                              ? "border-emerald-500/50 bg-emerald-500/5" 
                              : "border-white/10 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/50 backdrop-blur-sm"
                        )}>
                            {!file ? (
                                <>
                                    <div className="flex gap-4 mb-4">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform"><FileText className="w-6 h-6 text-slate-400" /></div>
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform delay-75"><Video className="w-6 h-6 text-slate-400" /></div>
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform delay-150"><ImageIcon className="w-6 h-6 text-slate-400" /></div>
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Arrastra o haz clic para subir</p>
                                    <p className="text-[10px] text-slate-600 mt-3 font-bold uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">Soporta: PDF, MP4, MOV, JPG, PNG</p>
                                </>
                            ) : (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center gap-4 w-full"
                                >
                                    <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500/30">
                                       <File className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <div className="text-center px-10 w-full">
                                        <p className="text-base font-black text-emerald-400 truncate max-w-full italic">{file.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB · PROTOCOLO LISTO</p>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); }} 
                                        className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-all shadow-lg active:scale-90"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </motion.div>
                            )}
                            <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => {
                                    const selected = e.target.files?.[0];
                                    if (selected) setFile(selected);
                                }}
                                accept=".pdf,.doc,.docx,.mp4,.mov,.jpg,.jpeg,.png"
                            />
                        </div>
                    </label>

                    <Button 
                        onClick={handleUpload}
                        disabled={!file}
                        className="w-full h-20 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] italic text-xl shadow-[0_10px_40px_rgba(59,130,246,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                        Sincronizar Entrega <Send className="ml-4 w-6 h-6" />
                    </Button>
                </div>
            ) : (
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-[3rem] p-12 text-center space-y-6 backdrop-blur-xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                    <div className="relative z-10">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h4 className="text-3xl font-black italic uppercase text-emerald-400 tracking-tighter">¡Entrega Confirmada!</h4>
                        <p className="text-slate-300 font-medium italic text-lg leading-relaxed mt-4">
                            "{data.feedback || "Tu evidencia técnica ha sido encriptada y cargada en el servidor de la institución correctamente."}"
                        </p>
                        <div className="pt-8 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50">
                             <ShieldCheck className="w-5 h-5" /> Nivel de Integridad: 100%
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

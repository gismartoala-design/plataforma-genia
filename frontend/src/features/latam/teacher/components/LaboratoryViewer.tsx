import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const LaboratoryViewer = ({ lab, onClose }: { lab: any, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900 z-[60] flex flex-col"
    >
      <div className="bg-slate-900 border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", lab.color)}>
            <lab.icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-black italic uppercase tracking-tighter leading-none">{lab.name}</h2>
            <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">Laboratorio Interactivo LATAM</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
        >
          <X className="w-5 h-5 mr-2" />
          Cerrar
        </Button>
      </div>

      <div className="flex-1 bg-[#1e1e1e] relative">
        <iframe
          src={lab.url}
          className="w-full h-full border-0"
          title={lab.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone"
          allowFullScreen
        />
      </div>
    </motion.div>
  );
};

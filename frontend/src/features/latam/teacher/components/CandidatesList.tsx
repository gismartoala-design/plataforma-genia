import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Download, Clock, CheckCircle2, TrendingUp, AlertCircle, Mail, FileSearch, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const CandidatesList = ({ 
  candidates, 
  expandedCandidate, 
  setExpandedCandidate 
}: { 
  candidates: any[];
  expandedCandidate: number | null;
  setExpandedCandidate: (id: number | null) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 rounded-xl gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-4 h-4" />Filtrar por Nivel
          </Button>
          <Button variant="outline" className="h-10 rounded-xl gap-2 text-xs font-bold text-slate-500">
            <Download className="w-4 h-4" />Reporte Semanal
          </Button>
        </div>
        <p className="text-xs font-bold text-slate-400">Mostrando {candidates.length} talentos</p>
      </div>

      <div className="grid gap-4">
        {candidates.map((candidate, i) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="latam-card bg-white overflow-hidden"
          >
            <div className="p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-blue-200 cursor-pointer"
              onClick={() => setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)}>
              <div className="flex items-center gap-4 min-w-[240px]">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                  <img src={candidate.avatar} alt={candidate.name} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{candidate.name}</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{candidate.level}</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Asignación: <span className="text-slate-900">{candidate.project}</span></span>
                  <span className="text-blue-600">{candidate.progress}%</span>
                </div>
                <Progress value={candidate.progress} className="h-1.5 bg-slate-50" />
              </div>

              <div className="flex items-center gap-4 min-w-[180px] justify-end">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                  candidate.status === 'reviewing' ? "bg-orange-50 text-orange-600 border-orange-100" :
                  candidate.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  candidate.status === 'active' ? "bg-blue-50 text-blue-600 border-blue-100" :
                  "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                  {candidate.status === 'reviewing' && <Clock className="w-3 h-3" />}
                  {candidate.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                  {candidate.status === 'active' && <TrendingUp className="w-3 h-3" />}
                  {candidate.status === 'on_hold' && <AlertCircle className="w-3 h-3" />}
                  {candidate.status}
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600"><Mail className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600"><FileSearch className="w-4 h-4" /></button>
                </div>
                {expandedCandidate === candidate.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {/* Expandable detail */}
            <AnimatePresence>
              {expandedCandidate === candidate.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-slate-100"
                >
                  <div className="p-6 bg-slate-50/50 grid grid-cols-3 gap-4">
                    {[
                      { label: 'Actividades Completadas', value: `${Math.round(candidate.progress / 10)}/10` },
                      { label: 'XP Acumulado', value: `${candidate.progress * 12} XP` },
                      { label: 'Días en Academy', value: '42d' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-xl font-black text-slate-800 mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

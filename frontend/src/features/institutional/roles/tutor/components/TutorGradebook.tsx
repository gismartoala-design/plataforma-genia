import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Search, 
  Download, 
  GraduationCap, 
  Trophy, 
  AlertCircle, 
  TrendingUp,
  ArrowRight,
  Filter,
  Users
} from 'lucide-react';
import { institutionApi } from '@/services/institution.api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Props {
  courseId: number;
}

export const TutorGradebook = ({ courseId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchGrades();
    }
  }, [courseId]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      // Fetching real data from backend service
      const res: any = await institutionApi.getGradeReport(courseId);
      
      // Map and clean real data
      const data = Array.isArray(res) ? res.map(s => {
        const avg = parseFloat(s.promedio) || 0;
        return {
          ...s,
          promedioNum: avg,
          status: avg >= 90 ? 'Sobresaliente' : avg >= 75 ? 'Esperado' : avg > 0 ? 'En Proceso' : 'Sin Entregas'
        };
      }) : [];
      
      setStudents(data);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const STUDENT_ROLE_IDS = [3, 6, 10, 11];
  const filtered = students.filter(s => 
    STUDENT_ROLE_IDS.includes(s.roleId) &&
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--inst-cyan)]" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generando Reporte de Rendimiento Real...</p>
      </div>
    );
  }

  const getStatusColor = (promedio: number) => {
    if (promedio >= 90) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (promedio >= 75) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (promedio === 0) return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-8 bg-[#0F172A] border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 construction-grid opacity-10 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg shadow-blue-900/40 flex items-center justify-center text-white">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Notas Reales</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Sincronización con Base de Datos Académica</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-blue-400 transition-colors" />
            <Input 
              placeholder="Localizar por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 w-64 bg-white/5 border-white/10 rounded-2xl text-white font-bold text-xs placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
            />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-2xl bg-white/5 border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all">
            <Download className="w-4 h-4 mr-2" /> Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Perfil Estudiante</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Entregas</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Estado de Alerta</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Calificación Real</th>
                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Evaluación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map((student, sIdx) => (
                <motion.tr 
                  key={student.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sIdx * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-all duration-300"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-white group-hover:bg-blue-600 transition-all duration-500 border border-white/5">
                        {student.nombre.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-sm text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">{student.nombre}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">ID: SYSTEM-00{student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <Trophy className={cn("w-3.5 h-3.5", student.entregas > 0 ? "text-amber-500" : "text-slate-600")} />
                       <span className="text-[10px] font-black text-white">{student.entregas} Envíos</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     {student.promedioNum < 75 && student.entregas > 0 ? (
                        <div className="flex items-center gap-2 text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Optimización Requerida</span>
                        </div>
                     ) : student.promedioNum === 0 ? (
                       <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">Sin Actividad</div>
                     ) : (
                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic">Rendimiento Estable</div>
                     )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5 w-24">
                       <div className="flex justify-between items-center">
                         <span className={cn("text-lg font-black italic tracking-tighter", 
                           student.promedioNum >= 90 ? 'text-emerald-400' : student.promedioNum >= 75 ? 'text-blue-400' : student.promedioNum === 0 ? 'text-slate-600' : 'text-rose-400'
                         )}>
                           {student.promedioNum}%
                         </span>
                         <TrendingUp className={cn("w-3.5 h-3.5", student.promedioNum >= 75 ? "text-blue-500" : "text-rose-500")} />
                       </div>
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${student.promedioNum}%` }}
                           transition={{ duration: 1.2, ease: 'circOut' }}
                           className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]", student.promedioNum >= 90 ? "bg-emerald-500" : student.promedioNum >= 75 ? "bg-blue-500" : "bg-rose-500")}
                         />
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border", getStatusColor(student.promedioNum))}>
                      {student.status}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
              {(filtered.length === 0 && !loading) && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="space-y-4 opacity-30">
                      <Users className="w-16 h-16 text-white mx-auto" strokeWidth={1} />
                      <p className="text-white text-xs font-black uppercase tracking-[0.3em]">Directorio Académico Vacío</p>
                      <p className="text-slate-500 text-[10px] uppercase font-bold">No se detectaron estudiantes enrolados en este sector</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TutorGradebook;

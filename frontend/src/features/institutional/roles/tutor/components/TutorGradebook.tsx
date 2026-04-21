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
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
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
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Sobresaliente' | 'Esperado' | 'En Proceso' | 'Sin Entregas'>('all');

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
    STUDENT_ROLE_IDS.includes(s.roleId) && s.activo &&
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedStatus === 'all' || s.status === selectedStatus)
  );

  // --- Analytics Calculation ---
  const stats = {
    total: students.length,
    average: students.length > 0 ? (students.reduce((acc, s) => acc + s.promedioNum, 0) / students.length).toFixed(1) : 0,
    alerts: students.filter(s => s.promedioNum < 75 && s.entregas > 0).length,
    excellence: students.filter(s => s.promedioNum >= 90).length,
    deliveryRate: students.length > 0 ? (students.filter(s => s.entregas > 0).length / students.length * 100).toFixed(0) : 0
  };

  const chartData = [
    { name: 'Sobresaliente', value: students.filter(s => s.status === 'Sobresaliente').length, color: '#34d399' },
    { name: 'Esperado', value: students.filter(s => s.status === 'Esperado').length, color: '#3b82f6' },
    { name: 'En Proceso', value: students.filter(s => s.status === 'En Proceso').length, color: '#f59e0b' },
    { name: 'Sin Entregas', value: students.filter(s => s.status === 'Sin Entregas').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const statsCards = [
    { label: 'Promedio Curso', value: `${stats.average}%`, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Estudiantes Alerta', value: stats.alerts, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Tasa de Éxito', value: `${stats.deliveryRate}%`, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Egresados / OK', value: stats.excellence, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
  ];

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
    if (promedio <= 0) return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
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
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {(['all', 'Sobresaliente', 'En Proceso'] as const).map(f => (
              <button
                key={f}
                onClick={() => setSelectedStatus(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  selectedStatus === f ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-white"
                )}
              >
                {f === 'all' ? 'Ver Todos' : f}
              </button>
            ))}
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-2xl bg-white/5 border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-[#0F172A] border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-blue-500/30 hover:bg-[#111a2f] transition-all cursor-default"
          >
            <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 opacity-[0.03] transition-transform group-hover:scale-125 group-hover:opacity-[0.07]", card.bg)} style={{ borderRadius: '50%' }} />
            <div className="flex flex-col gap-4 relative z-10">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110", card.bg, card.color)}>
                <card.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-4xl font-black italic tracking-tighter text-white leading-none">{card.value}</p>
                  <TrendingUp className="w-4 h-4 text-emerald-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Graphics and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-10 bg-[#0F172A] border border-white/5 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]">
          <div className="absolute inset-0 construction-grid opacity-5 pointer-events-none" />
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter text-white italic leading-tight">Métrica de Rendimiento</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Distribución de estados académicos</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: '0.05em' }} 
                />
                <YAxis hide />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{payload[0].payload.name}</p>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                            <p className="text-2xl font-black text-white italic tracking-tighter">{payload[0].value} <span className="text-xs uppercase text-slate-400 not-italic ml-1">ALUMNOS</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[15, 15, 5, 5]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} className="hover:fill-opacity-100 transition-all cursor-pointer" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 p-10 bg-[#0F172A] border border-white/5 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="w-full flex items-center gap-4 mb-10 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                <PieChartIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter text-white italic leading-tight">Análisis Crítico</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Composición del sector</p>
              </div>
            </div>
            
            <div className="h-64 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                         return (
                           <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl">
                             <p className="text-[9px] font-black uppercase text-white tracking-widest">{payload[0].name}</p>
                           </div>
                         );
                       }
                       return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Total</p>
                 <p className="text-3xl font-black text-white italic tracking-tighter">{stats.total}</p>
              </div>
            </div>
            
            <div className="w-full space-y-2 mt-8 relative z-10">
               {chartData.map((d, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 hover:border-white/20">
                   <div className="flex items-center gap-3">
                     <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: d.color }} />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.name}</span>
                   </div>
                   <span className="text-xs font-black text-white italic">{Math.round((d.value / stats.total) * 100)}%</span>
                 </div>
               ))}
            </div>
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

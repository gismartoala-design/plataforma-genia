import { useState, useEffect } from "react";
import { studentApi } from "@/features/student/services/student.api";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Star, Flame, Zap, ChevronRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Leaderboard() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('edu_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const id = user.id || user.user?.id;
        if (id) setCurrentUserId(Number(id));
      } catch (e) {
        console.error("Error parsing user for leaderboard", e);
      }
    }
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await studentApi.getLeaderboard();
      if (Array.isArray(data)) {
        setRanking(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Calculando posiciones...</p>
      </div>
    </div>
  );

  const top3 = ranking.slice(0, 3);
  const remaining = ranking.slice(3);

  // Reorder for podium display: [2, 1, 3]
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-4 md:p-12 max-w-5xl mx-auto space-y-12 pb-32">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm animate-bounce">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-amber-700 font-black text-xs uppercase tracking-tighter">Genios Awards 2026</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">
          Liga de <span className="text-blue-600">Excelencia</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">Escala pusto a puesto para convertirte en una leyenda</p>
      </motion.div>

      {/* Podium Section */}
      <div className="mt-16 relative px-4">
        <div className="flex items-end justify-center gap-2 md:gap-8 min-h-[280px]">
          <AnimatePresence>
            {podiumOrder.map((player, idx) => {
              const originalIndex = ranking.indexOf(player);
              const position = originalIndex + 1;
              const isMain = position === 1;
              const isUser = player.studentId === currentUserId;

              return (
                <motion.div
                  key={player.studentId}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.2, type: "spring", stiffness: 100 }}
                  className={cn(
                    "relative flex flex-col items-center group",
                    isMain ? "w-40 md:w-56 z-10" : "w-32 md:w-44"
                  )}
                >
                  {/* Avatar & Rank Badge */}
                  <div className="relative mb-4">
                    <div className={cn(
                      "rounded-full p-1.5 border-4 transition-transform group-hover:scale-105 duration-500 flex items-center justify-center",
                      position === 1 ? "w-24 h-24 md:w-32 md:h-32 border-amber-400 bg-amber-50 shadow-[0_0_30px_rgba(251,191,36,0.3)]" :
                      position === 2 ? "w-20 h-20 md:w-28 md:h-28 border-slate-300 bg-slate-50 shadow-[0_0_20px_rgba(148,163,184,0.2)]" :
                      "w-18 h-18 md:w-24 md:h-24 border-orange-400 bg-orange-50 shadow-[0_0_20px_rgba(251,146,60,0.2)]"
                    )}>
                      <div className={cn(
                        "w-full h-full rounded-full bg-white flex items-center justify-center font-black",
                        isMain ? "text-3xl md:text-5xl text-amber-600" : "text-2xl md:text-4xl text-slate-600"
                      )}>
                        {getInitials(player.name)}
                      </div>
                    </div>
                    <div className={cn(
                      "absolute -top-3 -right-3 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black shadow-xl border-2",
                      position === 1 ? "bg-amber-400 border-amber-200 text-amber-900 rotate-12 scale-110" :
                      position === 2 ? "bg-slate-300 border-slate-100 text-slate-700 -rotate-12" :
                      "bg-orange-400 border-orange-200 text-orange-900 rotate-6"
                    )}>
                      {position}
                    </div>
                    {isUser && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0047AB] text-white text-[9px] font-black px-3 py-1 rounded-full border border-blue-400 shadow-lg animate-pulse whitespace-nowrap uppercase">
                        ¡Eres Tú!
                      </div>
                    )}
                  </div>

                  {/* Podium Base */}
                  <div className={cn(
                    "w-full rounded-t-3xl p-6 flex flex-col items-center justify-center border-t-4 shadow-2xl transition-all duration-500",
                    position === 1 ? "h-48 md:h-56 bg-gradient-to-b from-amber-400 to-amber-600 border-amber-300" :
                    position === 2 ? "h-36 md:h-44 bg-gradient-to-b from-slate-300 to-slate-500 border-slate-200" :
                    "h-28 md:h-36 bg-gradient-to-b from-orange-400 to-orange-600 border-orange-300"
                  )}>
                    <p className="text-white font-black text-center text-[10px] md:text-lg break-words w-full px-2 italic uppercase leading-tight">
                      {player.name || "ESTUDIANTE"}
                    </p>
                    <div className="mt-3 flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      <Star className="w-3 h-3 text-white fill-current" />
                      <span className="text-[10px] md:text-xs font-black text-white">{player.xp?.toLocaleString()} <span className="opacity-70">XP</span></span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {/* Glow behind podium */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-40 bg-blue-500/5 blur-[100px] rounded-full -z-10" />
      </div>

      {/* Remaining Ranking Rows */}
      <div className="space-y-3 px-2">
        <AnimatePresence>
          {remaining.map((player, index) => {
            const isUser = player.studentId === currentUserId;
            const position = index + 4;

            return (
              <motion.div
                key={player.studentId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.6 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className={cn(
                  "group flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300",
                  isUser 
                    ? "bg-blue-600 border-blue-400 shadow-[0_8px_30px_rgba(37,99,235,0.3)]" 
                    : "bg-white border-slate-100/60 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100"
                )}
              >
                {/* Position */}
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner",
                  isUser ? "bg-white/10 text-white" : "bg-slate-50 text-slate-400"
                )}>
                  {position}
                </div>

                {/* Avatar Initial */}
                <div className="relative shrink-0">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border-2 font-black text-xs",
                    isUser ? "bg-white/20 border-white/30 text-white" : "bg-slate-100 border-slate-50 text-slate-400"
                  )}>
                    {getInitials(player.name)}
                  </div>
                  {player.level && (
                    <div className={cn(
                      "absolute -bottom-2 -right-2 w-6 h-6 rounded-xl flex items-center justify-center text-[9px] font-black border-2",
                      isUser ? "bg-white text-blue-600 border-blue-500" : "bg-violet-600 text-white border-white"
                    )}>
                      {player.level}
                    </div>
                  )}
                </div>

                {/* Name & Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-black text-sm md:text-base truncate",
                      isUser ? "text-white" : "text-slate-800"
                    )}>
                      {player.name}
                    </p>
                    {isUser && <span className="bg-white/20 text-white text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border border-white/20">Tú</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className={cn(
                      "flex items-center gap-1 opacity-70",
                      isUser ? "text-white" : "text-slate-400"
                    )}>
                      <Flame className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{player.streak || 0} Días de racha</span>
                    </div>
                  </div>
                </div>

                {/* XP Stats */}
                <div className="text-right">
                  <div className={cn(
                    "flex items-center justify-end gap-1.5",
                    isUser ? "text-white" : "text-slate-800"
                  )}>
                    <Zap className={cn("w-4 h-4", isUser ? "text-blue-300" : "text-amber-500 fill-current")} />
                    <p className="text-xl font-black italic tracking-tighter">{(player.xp || 0).toLocaleString()}</p>
                  </div>
                  <p className={cn(
                    "text-[8px] font-bold uppercase tracking-[0.2em] mt-1 opacity-50",
                    isUser ? "text-white" : "text-slate-500"
                  )}>Puntos XP</p>
                </div>

                <div className={cn(
                  "hidden md:flex ml-2 transition-transform group-hover:translate-x-1",
                  isUser ? "text-white/40" : "text-slate-200"
                )}>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Call to Action for bottom-ranked users */}
      {ranking.length > 0 && !top3.some(p => p.studentId === currentUserId) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900 via-blue-800 to-violet-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-400/30 rounded-3xl flex items-center justify-center p-4">
                <Target className="w-full h-full text-blue-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-white text-xl font-black uppercase italic tracking-tighter">¡Sigue escalando, Genio!</h3>
                <p className="text-blue-200/70 text-sm font-bold mt-1">Completa una lección para superar a tu siguiente rival.</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl shrink-0 text-center">
              <p className="text-blue-300 text-[9px] font-black uppercase tracking-widest mb-1">Tu posición actual</p>
              <p className="text-white text-3xl font-black italic">#{ranking.findIndex(p => p.studentId === currentUserId) + 1}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

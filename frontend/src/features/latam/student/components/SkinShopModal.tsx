
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShoppingBag, 
  Coins, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { professorApi } from '@/features/professor/services/professor.api'; // Reuse similar API client if needed or create student one

// Note: In a real app, I'd use a dedicated studentApi
import apiClient from '@/services/api.client';

interface Skin {
  id: number;
  nombre: string;
  descripcion: string;
  rarity: 'común' | 'raro' | 'épico' | 'legendario';
  precioGeniomonedas: number;
  unlocked: boolean;
  urlImagen: string;
}

export const SkinShopModal = ({ studentId, onClose, onSkinEquipped }: { studentId: number, onClose: () => void, onSkinEquipped: () => void }) => {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [ownedSkins, setOwnedSkins] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [geniomonedas, setGeniomonedas] = useState(0);
  const [points, setPoints] = useState(0);

const STATIC_SKINS: Skin[] = [
  {
    id: 9001, nombre: "Hacker Neon", descripcion: "Traje digital de élite con efectos de glitch y neón verde. Muestra tu dominio del código.",
    rarity: 'legendario', precioGeniomonedas: 50, unlocked: false,
    urlImagen: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&fit=crop&q=80"
  },
  {
    id: 9002, nombre: "Astronauta ARG", descripcion: "Explorador del espacio académico. Viaja por los mundos del conocimiento con estilo.",
    rarity: 'épico', precioGeniomonedas: 25, unlocked: false,
    urlImagen: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&fit=crop&q=80"
  },
  {
    id: 9003, nombre: "Cyber Bot", descripcion: "El robot del futuro está aquí. Domina la tecnología con esta skin metálica premium.",
    rarity: 'épico', precioGeniomonedas: 20, unlocked: false,
    urlImagen: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&fit=crop&q=80"
  },
  {
    id: 9004, nombre: "Dev Clásico", descripcion: "El look del desarrollador clásico. Limpio, profesional, y siempre listo para codificar.",
    rarity: 'raro', precioGeniomonedas: 10, unlocked: false,
    urlImagen: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=400&fit=crop&q=80"
  },
  {
    id: 9005, nombre: "Ninja Digital", descripcion: "Silencioso, rápido y letal en el teclado. La skin perfecta para el estudiante silencioso.",
    rarity: 'raro', precioGeniomonedas: 8, unlocked: false,
    urlImagen: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&fit=crop&q=80"
  },
  {
    id: 9006, nombre: "Iniciado ARG", descripcion: "Tu primera skin de la academia. Sencilla pero poderosa. Todo genio empieza desde aquí.",
    rarity: 'común', precioGeniomonedas: 2, unlocked: false,
    urlImagen: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&fit=crop&q=80"
  },
];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allSkinsRes, ownedSkinsRes, statsRes] = await Promise.all([
        apiClient.get<Skin[]>(`/api/student/${studentId}/gamification/skins`),
        apiClient.get<any[]>(`/api/student/${studentId}/gamification/skins/owned`),
        apiClient.get<any>(`/api/student/${studentId}/gamification`)
      ]);

      // Use static skins as fallback if API returns empty
      setSkins(allSkinsRes?.length > 0 ? allSkinsRes : STATIC_SKINS);
      setOwnedSkins(ownedSkinsRes?.map(s => s.skinId) || []);
      setGeniomonedas(statsRes.geniomonedas || 0);
      setPoints(statsRes.totalPoints || statsRes.xpTotal || 0);
    } catch (error) {
      console.error("Error fetching shop data:", error);
      // Fallback to static skins on error too
      setSkins(STATIC_SKINS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const handleBuy = async (skinId: number) => {
    try {
      await apiClient.post(`/api/student/${studentId}/gamification/skins/${skinId}/buy`, {});
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al comprar la skin");
    }
  };

  const handleEquip = async (skinId: number) => {
    try {
      await apiClient.post(`/api/student/${studentId}/gamification/skins/${skinId}/equip`, {});
      onSkinEquipped();
      onClose();
    } catch (error) {
      console.error("Error equipping skin:", error);
    }
  };

  const handleConvert = async () => {
    if (points < 1000) {
        alert("Necesitas al menos 1000 puntos para convertirlos en 1 Geniomoneda");
        return;
    }
    try {
        await apiClient.post(`/api/student/${studentId}/gamification/convert`, {});
        await fetchData();
    } catch (error) {
        console.error("Error converting points:", error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'común': return 'bg-slate-400';
      case 'raro': return 'bg-blue-500';
      case 'épico': return 'bg-purple-500';
      case 'legendario': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-blue-500/10"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-purple-900/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <ShoppingBag className="text-white w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white italic tracking-tight">TIENDA <span className="text-blue-500 underline decoration-blue-500/50 underline-offset-4">CYBER-SKIN</span></h2>
                <p className="text-blue-300/60 text-xs font-bold uppercase tracking-widest">Personaliza tu avatar táctico</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                 <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                    <Coins className="text-amber-500 w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Geniomonedas</p>
                    <p className="text-xl font-black text-white">{geniomonedas}</p>
                 </div>
              </div>

              <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                <X className="text-white w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar: Economy */}
            <div className="w-80 border-r border-white/5 p-8 space-y-8 bg-black/20">
              <div className="space-y-4">
                 <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em]">Cámara Acorazada</h4>
                 <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Puntos Acumulados</p>
                       <p className="text-2xl font-black text-white">{points} pts</p>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        className="h-full bg-blue-600"
                        animate={{ width: `${Math.min(100, (points / 1000) * 100)}%` }}
                       />
                    </div>
                    <p className="text-[10px] font-bold text-blue-500/80 uppercase">
                        {points >= 1000 ? "¡Listo para convertir!" : `Faltan ${1000 - points} para 1 Geniomoneda`}
                    </p>
                    <Button 
                        onClick={handleConvert}
                        disabled={points < 1000}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black italic gap-2 group"
                    >
                        CONVERTIR 1000 PUNTOS
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-black text-purple-400 uppercase tracking-[0.3em]">Información de Compra</h4>
                 <div className="space-y-3">
                    {[
                      { icon: Sparkles, text: "Skins exclusivas LATAM", color: "text-blue-400" },
                      { icon: Zap, text: "Convertidor 1000:1 activo", color: "text-amber-400" },
                      { icon: CheckCircle2, text: "Equipa desde el Dashboard", color: "text-emerald-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-bold text-white/50">
                        <item.icon className={cn("w-4 h-4", item.color)} />
                        {item.text}
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Main: Skins Grid */}
            <div className="flex-1 overflow-y-auto p-8">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {skins.map((skin) => {
                    const isOwned = ownedSkins.includes(skin.id);
                    return (
                      <motion.div
                        key={skin.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "bg-white/5 border rounded-[2rem] p-6 space-y-4 group transition-all duration-500 hover:bg-white/10",
                          isOwned ? "border-emerald-500/30" : "border-white/5"
                        )}
                      >
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                           <img 
                             src={skin.urlImagen || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop"} 
                             alt={skin.nombre} 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                           />
                           <div className={cn("absolute top-3 left-3 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter text-white", getRarityColor(skin.rarity))}>
                             {skin.rarity}
                           </div>
                           {!isOwned && (
                             <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
                               <Coins className="text-amber-500 w-3 h-3" />
                               <span className="text-[10px] font-black text-white">{skin.precioGeniomonedas}</span>
                             </div>
                           )}
                        </div>

                        <div className="space-y-1">
                           <h5 className="font-black text-white italic uppercase tracking-tight">{skin.nombre}</h5>
                           <p className="text-[10px] text-white/40 leading-tight line-clamp-2">{skin.descripcion}</p>
                        </div>

                        {isOwned ? (
                          <Button 
                            onClick={() => handleEquip(skin.id)}
                            className="w-full h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-bold uppercase tracking-widest text-[9px]"
                          >
                            Equipar Skin
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleBuy(skin.id)}
                            disabled={geniomonedas < skin.precioGeniomonedas}
                            className={cn(
                              "w-full h-10 rounded-xl font-bold uppercase tracking-widest text-[9px] gap-2",
                              geniomonedas >= skin.precioGeniomonedas 
                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                            )}
                          >
                            {geniomonedas >= skin.precioGeniomonedas ? (
                              <>Comprar <ArrowRight className="w-3 h-3" /></>
                            ) : (
                              <><Lock className="w-3 h-3" /> Saldo Insuficiente</>
                            )}
                          </Button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

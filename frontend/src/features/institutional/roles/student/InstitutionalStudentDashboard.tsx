import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, ClipboardList, Bug, Globe, ChevronRight, X, Navigation,
  Trophy, BookOpen, Building2, Wrench, Hammer, Cog, HardHat,
  Construction, Map as MapIcon, Play, ArrowRight, ArrowUpRight,
  ArrowDownRight, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon,
  CheckCircle2, Lock, ListFilter, ZoomIn, ZoomOut, Search, Focus, MapPin, Rocket, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { studentApi } from '@/features/student/services/student.api';
import { institutionalCurriculumApi, ModuloInst, SectionInst } from '@/features/institutional/services/curriculum.api';
import { InstitutionalDynamicViewer } from './InstitutionalDynamicViewer';
import '../../styles/ConstructionTheme.css';
import { EngineerOwl } from '../../components/EngineerOwl';
import { RPGPlayer } from '../../components/RPGPlayer';
import { Building2D } from '../../components/Building2D';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Each module gets a fixed spot across the large map (spread wide so you have to walk)
const MODULE_GRID_POSITIONS = [
  { x: 20, y: 20 }, // NW
  { x: 80, y: 20 }, // NE
  { x: 50, y: 55 }, // CENTER
  { x: 15, y: 75 }, // SW
  { x: 82, y: 72 }, // SE
  { x: 50, y: 15 }, // N
  { x: 20, y: 50 }, // W
  { x: 80, y: 50 }, // E
];

const MODULE_ICONS = [Hammer, Wrench, Building2, HardHat, Construction, Cog, Hammer, Wrench];

// Directional arrow toward a target (angle in degrees)
function getArrow(dx: number, dy: number) {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle > -22.5 && angle <= 22.5) return ArrowRightIcon;
  if (angle > 22.5 && angle <= 67.5) return ArrowDownRight;
  if (angle > 67.5 && angle <= 112.5) return ArrowDown;
  if (angle > 112.5 && angle <= 157.5) return ArrowDownRight; // SE
  if (angle > 157.5 || angle <= -157.5) return ArrowLeftIcon;
  if (angle > -157.5 && angle <= -112.5) return ArrowUpRight;
  if (angle > -112.5 && angle <= -67.5) return ArrowUp;
  return ArrowUpRight;
}

const NEAR_THRESHOLD = 7; // % of map

// Decorative elements
const DECORATIONS = [
  { id: 'd1', icon: Cog, coords: { x: 35, y: 35 }, color: 'text-slate-600' },
  { id: 'd2', icon: Construction, coords: { x: 65, y: 35 }, color: 'text-slate-600' },
  { id: 'd3', icon: Cog, coords: { x: 35, y: 65 }, color: 'text-slate-600' },
  { id: 'd4', icon: HardHat, coords: { x: 65, y: 65 }, color: 'text-amber-500/30' },
];

export const InstitutionalStudentDashboard = ({ user }: { user: any }) => {
  const [, setLocation] = useLocation();
  const [viewState, setViewState] = useState<'WORLD_SELECT' | 'CITY_VIEW'>('WORLD_SELECT');
  const [courseName, setCourseName] = useState<string>("Academia Global");
  const [sections, setSections] = useState<SectionInst[]>([]);
  const [realModules, setRealModules] = useState<ModuloInst[]>([]);
  const [activeModularModule, setActiveModularModule] = useState<ModuloInst | null>(null);
  const [nearBuilding, setNearBuilding] = useState<any | null>(null);
  const [activePanel, setActivePanel] = useState<any | null>(null); // building instruction panel
  const [loading, setLoading] = useState(true);
  const [owlMessage, setOwlMessage] = useState("");
  const [showGrades, setShowGrades] = useState(false);
  const [showRawDebug, setShowRawDebug] = useState(false);
  const [spawned, setSpawned] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [blueprintOpen, setBlueprintOpen] = useState(false);
  const [searchBlueprint, setSearchBlueprint] = useState('');

  // Camera & player
  const MAP_SIZE = 3000;
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 });
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [playerDirection, setPlayerDirection] = useState<'left' | 'right' | 'up' | 'down'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [isSaluting, setIsSaluting] = useState(false);

  const playerRef = useRef({ x: 50, y: 50 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const walkTimeout = useRef<NodeJS.Timeout | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => { if (user?.id) fetchRealData(); }, [user]);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      if (!user?.cursoId) return;

      const [sectionsData, modulesData] = await Promise.all([
        institutionalCurriculumApi.getSections(user.cursoId),
        institutionalCurriculumApi.getModulesByCourse(user.cursoId)
      ]);

      setSections(sectionsData.filter((s: any) => s.activo !== false));
      setRealModules(modulesData.filter((m: any) => m.activo !== false));

      // Get real course name from the new endpoint
      try {
        const courseData = await institutionalCurriculumApi.getCourse(user.cursoId);
        if (courseData?.nombre) {
          setCourseName(courseData.nombre);
        } else {
          setCourseName(user.cursoNombre || "Proyecto Institucional");
        }
      } catch (err) {
        console.warn("Could not fetch course metadata, using fallback", err);
        setCourseName(user.cursoNombre || "Proyecto Institucional");
      }

      if (sectionsData.length > 0) {
        setOwlMessage(`Bienvenido. La obra tiene ${sectionsData.length} frentes de trabajo (módulos). ¡Explóralos!`);
      } else {
        setOwlMessage(`No se detectan planos de obra asignados. Consulta con tu supervisor.`);
      }
    } catch (e) {
      console.error(e);
      setOwlMessage("Error al sincronizar con el centro de mando.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Build map objects from real sections ─────────────────────────────────────
  const mapBuildings = useMemo(() =>
    sections.map((s, idx) => {
      const sectionModules = realModules.filter(m => m.seccionId === s.id);
      // Simple progress calculation (for display)
      const progress = sectionModules.length > 0 ? 0 : 0; 

      return {
        id: s.id,
        name: s.nombre,
        description: s.descripcion || "Módulo de aprendizaje",
        levels: sectionModules,
        levelCount: sectionModules.length,
        progress: progress,
        icon: MODULE_ICONS[idx % MODULE_ICONS.length],
        coords: MODULE_GRID_POSITIONS[idx % MODULE_GRID_POSITIONS.length],
        repaired: progress >= 100,
        raw: s 
      };
    }),
    [sections, realModules]);

  const firstIncomplete = mapBuildings.find(b => !b.repaired);

  // ─── Auto-spawn at closest incomplete building ────────────────────────────────
  useEffect(() => {
    if (viewState === 'CITY_VIEW' && mapBuildings.length > 0 && !spawned) {
      const target = firstIncomplete ?? mapBuildings[0];
      setPlayerPos(target.coords);
      playerRef.current = target.coords;
      setSpawned(true);
      setOwlMessage(`¡Mundo cargado! Primer objetivo: "${target.name}". Usa WASD o flechas para moverte. Presiona ENTER para inspeccionar.`);
    }
  }, [viewState, mapBuildings, spawned]);

  // ─── Camera follow ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (viewState !== 'CITY_VIEW') return;
    const v = viewportRef.current;
    if (!v) return;
    const update = () => {
      const pPX = (playerPos.x / 100) * MAP_SIZE;
      const pPY = (playerPos.y / 100) * MAP_SIZE;
      setCameraOffset({ x: v.clientWidth / 2 - pPX, y: v.clientHeight / 2 - pPY });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [playerPos, viewState]);

  // ─── Movement + proximity detection ──────────────────────────────────────────
  useEffect(() => {
    if (viewState !== 'CITY_VIEW') return;
    const handleKey = (e: KeyboardEvent) => {
      if (activePanel || loading || showRawDebug) return;

      // ENTER → open building panel
      if (e.key === 'Enter' && nearBuilding) {
        setActivePanel(nearBuilding);
        return;
      }

      // Salute
      if (e.key.toLowerCase() === 'h') { setIsSaluting(true); setTimeout(() => setIsSaluting(false), 2000); return; }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(e.key)) e.preventDefault();
      const step = 2.5;
      let { x, y } = playerRef.current;
      let moving = false;

      if (e.key === 'w' || e.key === 'ArrowUp') { y -= step; setPlayerDirection('up'); moving = true; }
      if (e.key === 's' || e.key === 'ArrowDown') { y += step; setPlayerDirection('down'); moving = true; }
      if (e.key === 'a' || e.key === 'ArrowLeft') { x -= step; setPlayerDirection('left'); moving = true; }
      if (e.key === 'd' || e.key === 'ArrowRight') { x += step; setPlayerDirection('right'); moving = true; }

      if (moving) {
        setIsWalking(true);
        if (walkTimeout.current) clearTimeout(walkTimeout.current);
        walkTimeout.current = setTimeout(() => setIsWalking(false), 150);
        x = Math.max(2, Math.min(98, x)); y = Math.max(2, Math.min(98, y));
        playerRef.current = { x, y };
        setPlayerPos({ x, y });

        // Proximity check
        const close = mapBuildings.find(b =>
          Math.abs(x - b.coords.x) < NEAR_THRESHOLD &&
          Math.abs(y - b.coords.y) < NEAR_THRESHOLD
        ) ?? null;

        if (close?.id !== nearBuilding?.id) {
          setNearBuilding(close);
          if (close) setOwlMessage(`\uD83C\uDFD7️ Estás cerca de "${close.name}". Presiona ENTER para inspeccionar.`);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [viewState, mapBuildings, nearBuilding, activePanel, loading, showRawDebug]);

  // ─── Loading screen ───────────────────────────────────────────────────────────
  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Cog className="w-10 h-10 text-blue-600 animate-spin" /></div>;
  }

  return (
    <div className="relative min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-800">

      {/* ══════════════════════════════════════════════════════════════
          WORLD SELECT SCREEN
          ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewState === 'WORLD_SELECT' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 z-[200] flex flex-col items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 opacity-40 academic-grid-pattern" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 blur-[150px] rounded-full pointer-events-none" />
            </div>

            <div className="z-10 text-center mb-16">
              <Badge className="bg-blue-100 text-blue-600 border border-blue-200 mb-4 tracking-[0.3em] font-black uppercase text-[10px] px-4">Directorio Principal</Badge>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900">Selecciona tu Mundo</h1>
              <p className="text-slate-500 mt-2 font-medium">Ingresa a tu mundo para explorar y reparar los edificios de aprendizaje.</p>
            </div>

            <div className="z-10 max-w-6xl w-full">
              <button onClick={() => setViewState('CITY_VIEW')}
                className="group relative bg-white rounded-[3rem] p-10 border-2 border-slate-100 hover:border-blue-500 transition-all hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] text-left w-full md:w-96 mx-auto block">
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-125 group-hover:bg-blue-600 group-hover:text-slate-800 transition-all">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <div className="w-20 h-20 rounded-3xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 mb-8 border border-blue-100">
                  <Globe className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">{courseName}</h2>
                <div className="flex items-center gap-3">
                  <Badge className="bg-slate-100 text-slate-600 pointer-events-none border-none">{mapBuildings.length} Edificios</Badge>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                    <MapIcon className="w-3 h-3 inline mr-1" /> Mapa Activo
                  </span>
                </div>
                {/* Progress preview */}
                <div className="mt-6 space-y-2">
                  {mapBuildings.slice(0, 4).map(b => (
                    <div key={b.id} className="flex items-center gap-3">
                      <b.icon className="w-3 h-3 text-slate-500" />
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${b.progress}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-500 font-bold">{b.progress}%</span>
                    </div>
                  ))}
                  {mapBuildings.length > 4 && <p className="text-[9px] text-slate-600 font-bold">+{mapBuildings.length - 4} más...</p>}
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          CITY VIEW
          ══════════════════════════════════════════════════════════════ */}
      {viewState === 'CITY_VIEW' && (
        <div ref={viewportRef} className="flex-1 relative overflow-hidden bg-[white] select-none">

          {/* Top-left controls */}
          <div className="absolute top-4 left-4 z-[150] flex items-center gap-2">
            <button onClick={() => setViewState('WORLD_SELECT')}
              className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 text-slate-700 font-black text-xs uppercase tracking-widest border border-slate-200 shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
              <ChevronRight className="w-4 h-4 rotate-180" /> Mundos
            </button>
            <button onClick={() => setShowGrades(true)}
              className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 text-slate-700 font-black text-xs uppercase tracking-widest border border-slate-200 shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-500" /> Bitácora
            </button>
            <button onClick={() => setShowRawDebug(!showRawDebug)}
              className="w-10 h-10 bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-600 transition-all shadow-sm">
              <Bug className="w-4 h-4" />
            </button>
            <div className="h-10 w-[2px] bg-slate-200/50 mx-1" />
            <div className="flex bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-1">
              <button 
                onClick={() => setZoom(prev => Math.max(0.4, prev - 0.2))}
                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-slate-500">
                {Math.round(zoom * 100)}%
              </div>
              <button 
                onClick={() => setZoom(prev => Math.min(1.5, prev + 0.2))}
                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Floating Controls */}
          <div className="absolute top-4 right-4 z-[150] flex flex-col gap-2">
            <button 
              onClick={() => setBlueprintOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] px-6 py-4 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 flex items-center gap-3 group transition-all active:scale-95"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <MapIcon className="w-4 h-4 text-white" />
              </div>
              PLANO DE OBRA
            </button>
          </div>

          {/* CONTROLS HINT */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[150] bg-white/80 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-slate-200 shadow-sm flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>WASD / ↑↓←→ Mover</span>
            <span className="w-px h-4 bg-slate-300" />
            <kbd className="bg-slate-100 border border-slate-300 rounded px-2 py-0.5 text-slate-700">ENTER</kbd>
            <span>Inspeccionar edificio</span>
          </div>

          {/* NEARBY BUILDING PROMPT */}
          <AnimatePresence>
            {nearBuilding && !activePanel && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[150]">
                <button onClick={() => setActivePanel(nearBuilding)}
                  className="bg-white text-slate-800 border-2 border-slate-100 rounded-2xl px-8 py-4 shadow-2xl font-black text-sm flex items-center gap-4 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 group">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Construction className="w-4 h-4" />
                  </div>
                  INSPECCIONAR MÓDULO: {nearBuilding.name}
                  <ArrowRight className="w-5 h-5 ml-2 text-blue-600" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MAP */}
          <motion.div
            className="absolute top-0 left-0 origin-center"
            animate={{ 
              x: cameraOffset.x, 
              y: cameraOffset.y,
              scale: zoom
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            style={{ width: MAP_SIZE, height: MAP_SIZE }}
          >
            <div className="absolute inset-0 bg-slate-50 academic-grid-pattern opacity-100" />

            {DECORATIONS.map((d) => (
              <div key={`d-${d.id}`} className="absolute" style={{ left: `${d.coords.x}%`, top: `${d.coords.y}%`, transform: `translate(-50%, -50%)` }}>
                <d.icon className={cn("w-12 h-12 opacity-20", d.color)} />
              </div>
            ))}

            {/* ALL BUILDINGS */}
            {mapBuildings.map((b) => {
              const isNear = Math.abs(playerPos.x - b.coords.x) < NEAR_THRESHOLD && Math.abs(playerPos.y - b.coords.y) < NEAR_THRESHOLD;
              const isNext = firstIncomplete?.id === b.id;
              return (
                <div key={`b-${b.id}`} className="absolute" style={{ left: `${b.coords.x}%`, top: `${b.coords.y}%`, transform: 'translate(-50%, -50%)' }}>
                  <button className="relative group" onClick={() => { if (isNear) setActivePanel(b); }}>
                    <Building2D icon={b.icon} name={b.name} isRepaired={b.repaired} isLocked={false} isNext={isNext} isNear={isNear} />
                    {!b.repaired && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl text-white font-black text-[9px] shadow-2xl whitespace-nowrap">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        MÓDULO EN OBRA
                      </div>
                    )}
                  </button>
                </div>
              );
            })}

            {/* Player */}
            <motion.div className="absolute z-50 pointer-events-none" style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: 'translate(-50%, -50%)' }}>
              <RPGPlayer name={user?.name?.split(' ')[0]} isWalking={isWalking} direction={playerDirection} isSaluting={isSaluting} />
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CINEMATIC SELECTION PANEL
          ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activePanel && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }} 
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="fixed inset-0 z-[400] bg-slate-50 flex flex-col overflow-hidden"
          >
            {/* HERO SECTION */}
            <div className="relative w-full h-[35vh] min-h-[250px] shrink-0 bg-white border-b border-slate-100">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent z-10" />
               <div className="absolute inset-0 academic-grid-pattern opacity-40" />
               
               {/* Close Button */}
               <button 
                  onClick={() => setActivePanel(null)} 
                  className="absolute top-8 right-8 z-50 w-12 h-12 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center shadow-lg transition-all border border-slate-100 text-slate-500 hover:text-rose-500"
               >
                  <X className="w-6 h-6" />
               </button>

               {/* Background big icon */}
               <div className="absolute right-20 top-1/2 -translate-y-1/2 opacity-10 blur-sm pointer-events-none z-0 scale-150">
                  <activePanel.icon className="w-96 h-96 text-blue-600" />
               </div>

               {/* Hero Content */}
               <div className="absolute bottom-10 left-12 right-12 z-20">
                  <div className="max-w-4xl">
                     <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-blue-600 text-white border-none shadow-lg px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                           SECTOR DE OBRA
                        </Badge>
                        <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                           <Construction className="w-3.5 h-3.5" /> ID-CONSTRUCT-{activePanel.id}
                        </span>
                     </div>
                     <h2 className="text-4xl md:text-6xl font-black text-slate-800 italic tracking-tighter uppercase leading-[0.85] mb-4">
                        {activePanel.name}
                     </h2>
                     <p className="text-slate-500 text-sm md:text-base font-medium max-w-2xl leading-relaxed italic border-l-4 border-blue-500 pl-4 bg-white/40 py-2 rounded-r-2xl">
                        "{activePanel.description}"
                     </p>
                     
                     <div className="mt-8 flex items-center gap-6">
                        <Button 
                           onClick={() => {
                              const firstAvailable = activePanel.levels.find((l: any) => !l.bloqueado);
                              if(firstAvailable) {
                                 setActiveModularModule(firstAvailable);
                              }
                           }}
                           disabled={!activePanel.levels.find((l: any) => !l.bloqueado)}
                           className="bg-blue-600 text-white hover:bg-blue-700 h-14 px-8 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                           <Play className="w-5 h-5 mr-3 fill-white" /> REANUDAR OBRA
                        </Button>
                        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-[2rem] border border-slate-100 shadow-xl">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AVANCE ACTUAL</span>
                           <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${activePanel.progress}%` }}
                                className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                              />
                           </div>
                           <span className="text-lg font-black text-slate-800 tabular-nums italic tracking-tighter">
                              {activePanel.progress}%
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* LEVELS CAROUSEL */}
            <div className="flex-1 relative z-20 pb-12 pt-10 flex flex-col min-h-0 bg-slate-50">
               <div className="px-12 mb-8 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Fases de la Operación</h3>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                        <ListFilter className="w-4 h-4 text-blue-500" /> Selecciona un sector para iniciar el despliegue técnico
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Sistemas en Línea</span>
                  </div>
               </div>
               
               <div className="flex-1 overflow-x-auto pb-12 pt-4 px-12 snap-x snap-mandatory flex gap-10 items-stretch custom-scrollbar">
                  {activePanel.levels.length > 0 ? activePanel.levels.map((level: any, idx: number) => {
                     const isLocked = level.bloqueado;
                     const isCompleted = level.completado;
                     return (
                     <div key={level.id} className="snap-start shrink-0 first:pl-2 last:pr-32">
                        <button
                           onClick={() => {
                              if (!isLocked) setActiveModularModule(level);
                           }}
                           className={cn(
                               "relative w-80 md:w-96 h-[260px] rounded-[3.5rem] border-2 flex flex-col p-10 transition-all duration-700 group text-left",
                               isLocked 
                                  ? "bg-slate-100/50 border-slate-200/50 cursor-not-allowed grayscale" 
                                  : "bg-white border-slate-100 hover:border-blue-500 hover:shadow-[0_40px_80px_rgba(37,99,235,0.15)] hover:-translate-y-4"
                           )}
                        >
                           {!isLocked && (
                               <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                           )}
                           
                           {isLocked && (
                              <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-4">
                                 <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-2xl text-slate-300">
                                    <Lock className="w-7 h-7" />
                                 </div>
                                 <Badge className="bg-slate-200 text-slate-500 border-none font-black text-[9px] tracking-[0.3em] uppercase px-4 py-1">Bloqueo de Seguridad</Badge>
                              </div>
                           )}

                            <div className="relative z-20 flex justify-between items-start w-full mb-6">
                               <div className={cn(
                                   "w-16 h-16 rounded-[1.75rem] flex items-center justify-center border-2 transition-all duration-700",
                                   isLocked ? "bg-slate-100 border-slate-200 text-slate-300" : "bg-white border-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:border-blue-600 shadow-xl shadow-blue-500/5"
                               )}>
                                  {level.tipo === 'mission' || level.tipo === 'mission_advanced' ? <Rocket className="w-8 h-8" /> : 
                                   level.tipo === 'maker_lab' ? <Wrench className="w-8 h-8" /> : 
                                   <Target className="w-8 h-8" />}
                               </div>
                               <span className={cn("text-7xl font-black italic tracking-tighter opacity-5 transition-all duration-500 group-hover:opacity-10 group-hover:scale-110", isLocked ? "text-slate-400" : "text-blue-500")}>
                                  {String(idx + 1).padStart(2, '0')}
                               </span>
                            </div>
                           
                           <div className="relative z-20 w-full mt-auto space-y-4">
                              <div className="flex items-center gap-3">
                                <Badge className={cn(
                                    "border-0 text-[9px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-xl",
                                    isLocked ? "bg-slate-200 text-slate-500" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                )}>
                                    {level.tipo ? level.tipo.replace('_', ' ').toUpperCase() : 'NIVEL ESTÁNDAR'}
                                </Badge>
                                {isCompleted && (
                                    <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20">
                                        COMPLETADO
                                    </Badge>
                                )}
                              </div>
                              <h4 className={cn(
                                  "font-bold text-xl md:text-2xl italic uppercase tracking-tighter leading-[1] line-clamp-2 transition-colors duration-300",
                                  isLocked ? "text-slate-400" : "text-slate-700 group-hover:text-slate-900"
                              )}>
                                 {level.titulo}
                              </h4>
                              {!isLocked && (
                                  <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0 tracking-widest uppercase">
                                      INICIAR DESPLIEGUE <ArrowRight className="w-4 h-4 translate-y-[-1px]" />
                                  </div>
                              )}
                           </div>
                        </button>
                     </div>
                  )}) : (
                     <div className="w-full max-w-2xl h-80 border-4 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center bg-white/50 text-center px-20 mx-auto shadow-inner">
                         <div className="w-24 h-24 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center mb-8 border border-slate-100">
                            <Construction className="w-12 h-12 text-slate-300 animate-bounce" />
                         </div>
                         <h4 className="text-slate-800 font-black uppercase tracking-tighter italic text-3xl">Planos en Construcción</h4>
                         <p className="text-slate-400 text-base mt-3 font-medium leading-relaxed max-w-md">Vuelve pronto para iniciar la operación.</p>
                     </div>
                  )}
               </div>
            </div>
          </motion.div>
        )}

        {showRawDebug && (
          <div className="fixed inset-0 z-[500] bg-black/90 flex flex-col p-10">
            <Button variant="ghost" onClick={() => setShowRawDebug(false)} className="self-end bg-amber-600 text-slate-800 mb-4">CERRAR DEBUG</Button>
            <pre className="flex-1 overflow-auto bg-slate-950 p-8 rounded-3xl text-[10px] text-amber-400 border-4 border-amber-900 leading-tight">
              {JSON.stringify({ mapBuildings, playerPos }, null, 2)}
            </pre>
          </div>
        )}
      </AnimatePresence>

      {/* GRADES MODAL */}
      <AnimatePresence>
        {showGrades && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-12">
            <Card className="w-full max-w-4xl bg-[white] border border-slate-200 rounded-[4rem] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
              <div className="p-10 border-b border-slate-200 flex justify-between items-center bg-[white] relative overflow-hidden">
                <div className="absolute inset-0 academic-grid-pattern opacity-10" />
                <div className="relative z-10">
                  <Badge className="bg-blue-100 text-blue-600 border-0 shadow-none mb-2 px-3 py-1 font-black text-[10px] tracking-widest uppercase">Sistema de Trazabilidad</Badge>
                  <h2 className="text-4xl font-black text-slate-800 italic tracking-tighter uppercase leading-none">Bitácora de <span className="text-blue-600">Construcción</span></h2>
                </div>
                <button onClick={() => setShowGrades(false)}
                  className="w-16 h-16 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-colors border border-slate-200 relative z-10 group">
                  <X className="w-8 h-8 text-slate-500 group-hover:text-slate-800 transition-colors" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-6">
                {mapBuildings.map((b, idx) => (
                  <div key={`g-${b.id}`} className="group flex items-center gap-6 p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-blue-500/30 transition-all bg-white/5 relative overflow-hidden">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-200 flex items-center justify-center text-slate-500 font-black italic text-xl">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-black text-slate-800 text-xl tracking-tight uppercase italic">{b.name}</p>
                        <Badge className={cn("border-0 font-black text-[10px] tracking-widest px-2 py-0.5",
                          b.repaired ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>
                          {b.repaired ? 'ENTREGABLE' : 'FASE ACTIVA'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div className={cn("h-full rounded-full transition-all", b.repaired ? "bg-emerald-500" : "bg-blue-500")}
                            style={{ width: `${b.progress}%` }} />
                        </div>
                        <span className="text-sm font-black text-slate-800 italic tabular-nums">{b.progress}%</span>
                      </div>
                    </div>
                    <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all",
                      b.repaired ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-slate-200 text-slate-600 group-hover:border-blue-500/30 group-hover:text-blue-400")}>
                      {b.repaired ? <CheckCircle2 className="w-8 h-8" /> : <Construction className="w-8 h-8" />}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLANO DE OBRA SIDEBAR */}
      <AnimatePresence>
        {blueprintOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBlueprintOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[500]"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[white] z-[510] flex flex-col border-l border-slate-200 shadow-3xl"
            >
              <div className="p-8 bg-[white] border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 academic-grid-pattern opacity-10" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <MapIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-black italic tracking-tighter uppercase leading-none">Plano Maestro</h3>
                      <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest mt-1">Directorio de Sectores</p>
                    </div>
                  </div>
                  <button onClick={() => setBlueprintOpen(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-8 relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <Input 
                    placeholder="Buscar sector de obra..."
                    value={searchBlueprint}
                    onChange={e => setSearchBlueprint(e.target.value)}
                    className="pl-12 bg-white border-slate-200 text-slate-800 rounded-2xl h-12"
                   />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {mapBuildings
                  .filter(b => b.name.toLowerCase().includes(searchBlueprint.toLowerCase()))
                  .map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setPlayerPos(b.coords);
                        playerRef.current = b.coords;
                        setBlueprintOpen(false);
                        setTimeout(() => setActivePanel(b), 500);
                      }}
                      className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] border-2 bg-white border-slate-100 hover:border-blue-500 group transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <b.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 uppercase italic transition-colors">{b.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold truncate">{b.levelCount} Niveles • {b.progress}% Terminado</p>
                      </div>
                      <Focus className="w-5 h-5 text-slate-300" />
                    </button>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .academic-grid-pattern {
          background-image: linear-gradient(rgba(26, 86, 219, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 86, 219, 0.04) 1px, transparent 1px);
          background-size: 100px 100px;
        }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>

      <EngineerOwl message={owlMessage} />

      <AnimatePresence>
        {activeModularModule && (
          <InstitutionalDynamicViewer
            module={activeModularModule}
            onClose={() => setActiveModularModule(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

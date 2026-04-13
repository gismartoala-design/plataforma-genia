import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, ClipboardList, Bug, Globe, ChevronRight, X, Navigation,
  Trophy, BookOpen, Building2, Wrench, Hammer, Cog, HardHat,
  Construction, Map as MapIcon, Play, ArrowRight, ArrowUpRight,
  ArrowDownRight, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon,
  CheckCircle2, Lock, ListFilter, ZoomIn, ZoomOut, Search, Focus, MapPin
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
  { id: 'd1', icon: Cog, coords: { x: 35, y: 35 }, color: 'text-slate-300' },
  { id: 'd2', icon: Construction, coords: { x: 65, y: 35 }, color: 'text-slate-300' },
  { id: 'd3', icon: Cog, coords: { x: 35, y: 65 }, color: 'text-slate-300' },
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
      const progress = sectionModules.length > 0 ? 0 : 0; // In a future step we'd fetch actual progress

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
        raw: s // Keep the original section object
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
          if (close) setOwlMessage(`🏗️ Estás cerca de "${close.name}". Presiona ENTER para inspeccionar.`);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [viewState, mapBuildings, nearBuilding, activePanel, loading, showRawDebug]);

  // ─── Loading screen ───────────────────────────────────────────────────────────
  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Cog className="w-10 h-10 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="relative min-h-screen bg-[#0B132C] flex overflow-hidden font-sans text-slate-100">

      {/* ══════════════════════════════════════════════════════════════
          WORLD SELECT SCREEN
          ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewState === 'WORLD_SELECT' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 z-[200] flex flex-col items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 opacity-10 academic-grid-pattern" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/30 blur-[150px] rounded-full pointer-events-none" />
            </div>

            <div className="z-10 text-center mb-16">
              <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-4 tracking-[0.3em] font-black uppercase text-[10px] px-4">Directorio Principal</Badge>
              <h1 className="text-5xl font-black tracking-tighter text-white">Selecciona tu Mundo</h1>
              <p className="text-slate-400 mt-2 font-medium">Ingresa a tu mundo para explorar y reparar los edificios de aprendizaje.</p>
            </div>

            <div className="z-10 max-w-6xl w-full">
              <button onClick={() => setViewState('CITY_VIEW')}
                className="group relative bg-[#131F41] rounded-[3rem] p-10 border-2 border-slate-700/50 hover:border-blue-500 transition-all hover:shadow-[0_0_80px_rgba(37,99,235,0.2)] text-left w-full md:w-96 mx-auto block">
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-125 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <div className="w-20 h-20 rounded-3xl bg-blue-500/20 flex flex-col items-center justify-center text-blue-400 mb-8 border border-blue-500/30">
                  <Globe className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">{courseName}</h2>
                <div className="flex items-center gap-3">
                  <Badge className="bg-slate-800 text-slate-300 pointer-events-none border-none">{mapBuildings.length} Edificios</Badge>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    <MapIcon className="w-3 h-3 inline mr-1" /> Mapa Activo
                  </span>
                </div>
                {/* Progress preview */}
                <div className="mt-6 space-y-2">
                  {mapBuildings.slice(0, 4).map(b => (
                    <div key={b.id} className="flex items-center gap-3">
                      <b.icon className="w-3 h-3 text-slate-400" />
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
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
          CITY VIEW — All buildings on map
          ══════════════════════════════════════════════════════════════ */}
      {viewState === 'CITY_VIEW' && (
        <div ref={viewportRef} className="flex-1 relative overflow-hidden bg-[var(--inst-bg)] select-none">

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
              className="w-10 h-10 bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all shadow-sm">
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
              <div className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-slate-400">
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
                <MapIcon className="w-4 h-4" />
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
                  className="bg-slate-900 text-white border-2 border-white/20 rounded-2xl px-8 py-4 shadow-2xl font-black text-sm flex items-center gap-4 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Construction className="w-4 h-4" />
                  </div>
                  INSPECCIONAR MÓDULO: {nearBuilding.name}
                  <ArrowRight className="w-5 h-5 ml-2 text-blue-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DIRECTIONAL SIGNS to OTHER buildings (HUD overlay, screen-space) */}
          {mapBuildings.filter(b => {
            const dx = b.coords.x - playerPos.x;
            const dy = b.coords.y - playerPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist > NEAR_THRESHOLD + 5; // only show arrows for far buildings
          }).map(b => {
            const dx = b.coords.x - playerPos.x;
            const dy = b.coords.y - playerPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ArrowIcon = getArrow(dx, dy);
            // Clamp arrow to screen edge
            const angle = Math.atan2(dy, dx);
            const edgeDist = 42; // % from center
            const screenX = 50 + Math.cos(angle) * edgeDist;
            const screenY = 50 + Math.sin(angle) * edgeDist;

            return (
              <motion.div
                key={`sign-${b.id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute z-[140] pointer-events-none"
                style={{ left: `${Math.max(5, Math.min(92, screenX))}%`, top: `${Math.max(5, Math.min(92, screenY))}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl border shadow-lg",
                  b.repaired
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-700"
                    : "bg-amber-50/80 border-amber-300 text-amber-700"
                )}>
                  <ArrowIcon className="w-4 h-4" />
                  <span className="text-[8px] font-black uppercase whitespace-nowrap max-w-[64px] truncate">{b.name.split(' ')[0]}</span>
                  <span className="text-[7px] font-bold">{Math.round(dist)}u</span>
                  {b.repaired
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    : <Wrench className="w-3 h-3 text-amber-500" />
                  }
                </div>
              </motion.div>
            );
          })}

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

            {/* ALL BUILDINGS — every module */}
            {mapBuildings.map((b) => {
              const isNear = Math.abs(playerPos.x - b.coords.x) < NEAR_THRESHOLD && Math.abs(playerPos.y - b.coords.y) < NEAR_THRESHOLD;
              const isNext = firstIncomplete?.id === b.id;
              return (
                <div key={`b-${b.id}`} className="absolute" style={{ left: `${b.coords.x}%`, top: `${b.coords.y}%`, transform: 'translate(-50%, -50%)' }}>
                  {/* Clickable building */}
                  <button className="relative group" onClick={() => { if (isNear) setActivePanel(b); }}>
                    <Building2D icon={b.icon} name={b.name} isRepaired={b.repaired} isLocked={false} isNext={isNext} isNear={isNear} />
                    {!b.repaired && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl text-white font-black text-[9px] shadow-2xl whitespace-nowrap">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        MÓDULO EN OBRA
                      </div>
                    )}
                    {isNext && (
                      <motion.div 
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="absolute -top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                      >
                         <div className="bg-blue-600 text-white p-2 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.5)] border-2 border-white/20">
                           <MapPin className="w-6 h-6" />
                         </div>
                         <div className="w-2 h-2 rounded-full bg-blue-500 blur-[2px]" />
                      </motion.div>
                    )}
                    {b.repaired && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 font-black text-[9px] shadow-2xl whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3" /> COMPLETADO
                      </div>
                    )}
                    {/* Progress bar under building */}
                    <div className="mt-4 w-full h-2 bg-white/5 border border-white/5 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-blue-500 rounded-full transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${b.progress}%` }} />
                    </div>
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
          BUILDING INSPECTION PANEL
          ══════════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════
          BUILDING INSPECTION PANEL (SECTION PROMPT)
          ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activePanel && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#0F172A] z-[300] flex flex-col shadow-2xl border-l border-white/10 overflow-hidden">

            {/* Header - Industrial Style */}
            <div className="bg-[#1E293B] p-10 text-white relative overflow-hidden border-b border-white/5">
              <div className="absolute inset-0 academic-grid-pattern opacity-10" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />

              <button onClick={() => setActivePanel(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-colors border border-white/10">
                <X className="w-6 h-6" />
              </button>

              <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 relative z-10",
                activePanel.repaired ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-blue-500/10 border border-blue-500/30")}>
                <activePanel.icon className={cn("w-10 h-10", activePanel.repaired ? "text-emerald-400" : "text-blue-400")} />
              </div>

              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className={cn("text-[10px] font-black uppercase tracking-[0.2em] border-0 px-3",
                    activePanel.repaired ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400")}>
                    {activePanel.repaired ? 'PROYECTO FINALIZADO' : 'INSPEC-MÓDULO'}
                  </Badge>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID-CONSTRUCT-{activePanel.id}</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter leading-none text-white italic">{activePanel.name}</h2>
              </div>

              <div className="mt-8 flex items-center gap-4 relative z-10">
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ width: `${activePanel.progress}%` }} />
                </div>
                <span className="text-xl font-black text-white italic tabular-nums">{activePanel.progress}%</span>
              </div>
            </div>

            {/* Body — levels/modules list */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-[#0F172A]">
              {/* Description */}
              <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Construction className="w-12 h-12 text-blue-400" />
                </div>
                <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.3em] mb-3">Expediente Técnico</p>
                <p className="text-slate-300 text-lg font-medium leading-relaxed italic">"{activePanel.description}"</p>
              </div>

              {/* Levels (instructions) */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Niveles de Construcción ({activePanel.levelCount})</p>
                  <div className="h-px flex-1 bg-white/5 mx-4" />
                </div>

                <div className="space-y-4">
                  {activePanel.levels.length > 0 ? activePanel.levels.map((level: any, idx: number) => (
                    <button
                      key={level.id}
                      onClick={() => {
                        setActiveModularModule(level);
                        setActivePanel(null);
                      }}
                      className="w-full flex items-center gap-6 p-6 rounded-[2rem] border-2 border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all bg-white/5 group text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-lg text-slate-400 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400 transition-all shrink-0 italic">
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0 z-10">
                        <p className="font-black text-white text-xl tracking-tight group-hover:text-blue-400 transition-colors uppercase italic">{level.titulo}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-white/5 text-slate-500 border-0 text-[8px] font-bold tracking-widest px-2">NIVEL-{level.tipo.toUpperCase()}</Badge>
                          <span className="text-[10px] font-bold text-slate-600 uppercase">Listo para despliegue</span>
                        </div>
                      </div>

                      <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center text-slate-600 group-hover:text-blue-400 group-hover:border-blue-500 transition-all shrink-0">
                        <ArrowRightIcon className="w-6 h-6" />
                      </div>
                    </button>
                  )) : (
                    <div className="p-12 rounded-[3rem] bg-white/5 border-2 border-dashed border-white/5 text-center">
                      <Construction className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-50" />
                      <p className="text-slate-500 text-lg font-black uppercase tracking-widest italic">Edificio sin Niveles</p>
                      <p className="text-slate-600 text-sm mt-2">La ingeniería técnica de este módulo aún no ha sido aprobada.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-8 border-t border-white/5 bg-[#0F172A]">
              <Button
                variant="ghost"
                onClick={() => setActivePanel(null)}
                className="w-full h-16 rounded-3xl font-black uppercase tracking-[0.3em] text-xs text-slate-500 hover:text-white transition-colors">
                Regresar al Mapa Ciudad
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRADES MODAL (BITÁCORA) */}
      <AnimatePresence>
        {showGrades && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-12">
            <Card className="w-full max-w-4xl bg-[#0F172A] border border-white/10 rounded-[4rem] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-10 border-b border-white/10 flex justify-between items-center bg-[#1E293B] relative overflow-hidden">
                <div className="absolute inset-0 academic-grid-pattern opacity-10" />
                <div className="relative z-10">
                  <Badge className="bg-blue-500/10 text-blue-400 border-0 mb-2 px-3 py-1 font-black text-[10px] tracking-widest uppercase">Sistema de Trazabilidad</Badge>
                  <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Bitácora de <span className="text-blue-500">Construcción</span></h2>
                </div>
                <button onClick={() => setShowGrades(false)}
                  className="w-16 h-16 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-colors border border-white/10 relative z-10 group">
                  <X className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-10 space-y-6">
                {mapBuildings.map((b, idx) => (
                  <div key={`g-${b.id}`} className="group flex items-center gap-6 p-8 rounded-[2.5rem] border-2 border-white/5 hover:border-blue-500/30 transition-all bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Index */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500 font-black italic text-xl">
                      {idx + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-black text-white text-xl tracking-tight uppercase italic">{b.name}</p>
                        <Badge className={cn("border-0 font-black text-[9px] tracking-widest px-2 py-0.5",
                          b.repaired ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>
                          {b.repaired ? 'ENTREGABLE' : 'FASE ACTIVA'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div className={cn("h-full rounded-full transition-all", b.repaired ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]")}
                            style={{ width: `${b.progress}%` }} />
                        </div>
                        <span className="text-sm font-black text-white italic tabular-nums">{b.progress}%</span>
                      </div>
                    </div>

                    {/* Result Icon */}
                    <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all",
                      b.repaired ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-600 group-hover:border-blue-500/30 group-hover:text-blue-400")}>
                      {b.repaired ? <CheckCircle2 className="w-8 h-8" /> : <Construction className="w-8 h-8" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-10 border-t border-white/10 bg-[#0F172A] flex justify-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Argos Academy v4.0 — Unified Construction Log</p>
              </div>
            </Card>
          </motion.div>
        )}

        {showRawDebug && (
          <div className="fixed inset-0 z-[500] bg-black/90 flex flex-col p-10">
            <Button variant="ghost" onClick={() => setShowRawDebug(false)} className="self-end bg-amber-600 text-white mb-4">CERRAR DEBUG</Button>
            <pre className="flex-1 overflow-auto bg-slate-950 p-8 rounded-3xl text-[10px] text-amber-400 border-4 border-amber-900 leading-tight">
              {JSON.stringify({ mapBuildings, playerPos }, null, 2)}
            </pre>
          </div>
        )}
      </AnimatePresence>

      {/* PLANO DE OBRA SIDEBAR */}
      <AnimatePresence>
        {blueprintOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setBlueprintOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[500]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0F172A] z-[510] flex flex-col border-l border-white/10 shadow-3xl"
            >
              <div className="p-8 bg-[#1E293B] border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 academic-grid-pattern opacity-10" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                      <MapIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-black italic tracking-tighter uppercase leading-none">Plano Maestro</h3>
                      <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mt-1">Directorio de Sectores</p>
                    </div>
                  </div>
                  <button onClick={() => setBlueprintOpen(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-8 relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <Input 
                    placeholder="Buscar sector de obra..."
                    value={searchBlueprint}
                    onChange={e => setSearchBlueprint(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white rounded-2xl h-12 focus:ring-blue-500/20 focus:border-blue-500/50"
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
                        // Trigger panel automatically after teleport
                        setTimeout(() => setActivePanel(b), 500);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all group text-left",
                        b.repaired 
                          ? "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30" 
                          : "bg-white/5 border-white/5 hover:border-blue-500/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                        b.repaired ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-500 group-hover:bg-blue-600 group-hover:text-white"
                      )}>
                        <b.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white uppercase italic group-hover:text-blue-400 transition-colors">{b.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold truncate">{b.levelCount} Niveles • {b.progress}% Terminado</p>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:border-blue-500/30 transition-all">
                        <Focus className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                      </div>
                    </button>
                  ))}
              </div>

              <div className="p-8 border-t border-white/5 bg-[#0B132C]">
                 <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] text-center mb-4">Usa el plano para transporte rápido</p>
                 <Button onClick={() => setBlueprintOpen(false)} className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Cerrar Plano</Button>
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
      `}</style>

      <EngineerOwl message={owlMessage} />

      {/* Dynamic Viewer Overlay */}
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


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelWorker } from './PixelWorker';
import { cn } from '@/lib/utils';
import { 
  Building2, X, ArrowUpRight, Code2, BrainCircuit, Cpu, 
  Gamepad2, Database, Layout, Terminal, ChevronRight, Zap
} from 'lucide-react';

interface PixelWorldProps {
    user: any;
    levels: any[];
    onSelectLevel: (levelId: number) => void;
    onClose?: () => void;
}

const LAB_TOOLS = [
  { id: 'scratch', name: 'Scratch Studio', icon: Layout, color: '#f59e0b', url: 'https://scratch.mit.edu/projects/editor/?tutorial=getstarted' },
  { id: 'python', name: 'Python IDE', icon: Code2, color: '#2563eb', url: 'https://trinket.io/embed/python/3' },
  { id: 'arduino', name: 'Arduino Lab', icon: Cpu, color: '#0d9488', url: 'https://wokwi.com/projects/new/arduino-uno' },
  { id: 'ai', name: 'AI Studio', icon: BrainCircuit, color: '#7c3aed', url: 'https://teachablemachine.withgoogle.com/train/image' },
  { id: 'data', name: 'Data Lab', icon: Database, color: '#059669', url: 'https://colab.research.google.com/' },
  { id: 'game', name: 'Game Dev', icon: Gamepad2, color: '#dc2626', url: 'https://www.webots.cloud/' },
];

// Pixel art decorative elements
const DECOR = [
  { x: 10, y: 10, w: 80, h: 60, color: '#1e40af', border: '#1e3a8a', label: 'OFICINA' },
  { x: 900, y: 50, w: 100, h: 70, color: '#065f46', border: '#064e3b', label: 'SERVER' },
  { x: 50, y: 500, w: 70, h: 90, color: '#7c3aed', border: '#6d28d9', label: 'LAB' },
  { x: 1050, y: 450, w: 60, h: 80, color: '#b45309', border: '#92400e', label: 'ALMACÉN' },
  { x: 450, y: 520, w: 120, h: 50, color: '#0e7490', border: '#0c4a6e', label: 'CONFERENCIAS' },
];

export const PixelWorld = ({ user, levels, onSelectLevel, onClose }: PixelWorldProps) => {
    const [pos, setPos] = useState({ x: 600, y: 400 });
    const [isWalking, setIsWalking] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down'>('down');
    const [activeTool, setActiveTool] = useState<typeof LAB_TOOLS[0] | null>(null);
    const [showToolbox, setShowToolbox] = useState(false);
    const [nearbyLevel, setNearbyLevel] = useState<any>(null);
    const keysPressed = useRef(new Set<string>());
    const animFrameRef = useRef<number>(0);

    // World size (virtual canvas)
    const WORLD_W = 1200;
    const WORLD_H = 700;
    const STEP = 5;

    // Prevent default scroll on arrow keys
    useEffect(() => {
        const preventScroll = (e: KeyboardEvent) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', preventScroll, { passive: false });
        return () => window.removeEventListener('keydown', preventScroll);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        keysPressed.current.add(e.key);
        setIsWalking(true);
    }, []);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        keysPressed.current.delete(e.key);
        if (keysPressed.current.size === 0) setIsWalking(false);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    // Game loop
    useEffect(() => {
        const loop = () => {
            setPos(prev => {
                let nx = prev.x, ny = prev.y;
                let newDir = direction;
                if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w') || keysPressed.current.has('W')) {
                    ny -= STEP; newDir = 'up';
                }
                if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s') || keysPressed.current.has('S')) {
                    ny += STEP; newDir = 'down';
                }
                if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || keysPressed.current.has('A')) {
                    nx -= STEP; newDir = 'left';
                }
                if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || keysPressed.current.has('D')) {
                    nx += STEP; newDir = 'right';
                }
                setDirection(newDir);
                return {
                    x: Math.min(Math.max(nx, 30), WORLD_W - 30),
                    y: Math.min(Math.max(ny, 30), WORLD_H - 60),
                };
            });
            animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, []);

    // Detect nearby buildings
    useEffect(() => {
        let found = null;
        for (let i = 0; i < levels.length; i++) {
            const bX = 180 + (i * 340);
            const bY = 220;
            const dist = Math.hypot(pos.x - bX, pos.y - bY);
            if (dist < 100) { found = { ...levels[i], bX, bY }; break; }
        }
        setNearbyLevel(found);
    }, [pos, levels]);

    // Building positions
    const getBuildingPos = (i: number) => ({ x: 180 + (i * 340), y: 220 });

    return (
        <div
            className="fixed inset-0 z-50 bg-slate-950 overflow-hidden"
            style={{ userSelect: 'none' }}
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.1) 0%, transparent 50%), #0f172a'
            }} />

            {/* ISOMETRIC GRID FLOOR */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `
                    linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
            }} />

            {/* World container (scrollable internally if needed) */}
            <div
                className="relative w-full h-full overflow-hidden"
            >
                {/* === DECORATIVE PIXEL BUILDINGS (background) === */}
                {DECOR.map((d, i) => (
                    <div
                        key={i}
                        className="absolute rounded-sm opacity-60"
                        style={{
                            left: d.x,
                            top: d.y,
                            width: d.w,
                            height: d.h,
                            background: d.color,
                            border: `3px solid ${d.border}`,
                            boxShadow: `inset 0 0 20px rgba(0,0,0,0.4), 0 0 10px rgba(0,0,0,0.3)`
                        }}
                    >
                        <p className="text-[7px] font-black text-white/50 uppercase tracking-widest p-1">{d.label}</p>
                    </div>
                ))}

                {/* Floor paths / roads */}
                <div className="absolute" style={{
                    left: 0, top: 290, width: '100%', height: 40,
                    background: 'rgba(30,41,59,0.8)',
                    borderTop: '2px solid rgba(59,130,246,0.3)',
                    borderBottom: '2px solid rgba(59,130,246,0.3)',
                }} />
                <div className="absolute" style={{
                    left: 160, top: 0, width: 40, height: '100%',
                    background: 'rgba(30,41,59,0.8)',
                    borderLeft: '2px solid rgba(59,130,246,0.2)',
                    borderRight: '2px solid rgba(59,130,246,0.2)',
                }} />

                {/* === COMPANY BUILDINGS (interactive) === */}
                {levels.map((level, i) => {
                    const { x: bX, y: bY } = getBuildingPos(i);
                    const dist = Math.hypot(pos.x - bX, pos.y - bY);
                    const isNear = dist < 100;
                    const levelColors = [
                        { bg: '#1d4ed8', glow: 'rgba(29,78,216,0.6)', border: '#1e40af', icon: '#60a5fa' },
                        { bg: '#065f46', glow: 'rgba(6,95,70,0.6)', border: '#064e3b', icon: '#34d399' },
                        { bg: '#7c3aed', glow: 'rgba(124,58,237,0.6)', border: '#6d28d9', icon: '#a78bfa' },
                    ];
                    const c = levelColors[i % levelColors.length];

                    return (
                        <motion.div
                            key={level.id}
                            className="absolute flex flex-col items-center gap-2"
                            style={{ left: bX, top: bY, transform: 'translate(-50%, -50%)' }}
                            animate={{
                                filter: isNear
                                    ? [`drop-shadow(0 0 20px ${c.glow})`, `drop-shadow(0 0 35px ${c.glow})`, `drop-shadow(0 0 20px ${c.glow})`]
                                    : `drop-shadow(0 0 5px rgba(0,0,0,0.5))`
                            }}
                            transition={{ repeat: isNear ? Infinity : 0, duration: 1.5 }}
                        >
                            {/* Building structure */}
                            <div
                                className="relative flex flex-col items-center justify-center rounded-2xl"
                                style={{
                                    width: isNear ? 140 : 120,
                                    height: isNear ? 140 : 120,
                                    background: `linear-gradient(135deg, ${c.bg}, ${c.border})`,
                                    border: `3px solid ${c.icon}`,
                                    transition: 'all 0.3s ease',
                                    boxShadow: `inset 0 0 30px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.4)`
                                }}
                            >
                                {/* Windows pattern */}
                                <div className="absolute inset-2 grid grid-cols-3 gap-1 opacity-30">
                                    {[...Array(9)].map((_, wi) => (
                                        <div key={wi} className="rounded-sm" style={{
                                            background: c.icon,
                                            opacity: Math.random() > 0.5 ? 1 : 0.3
                                        }} />
                                    ))}
                                </div>
                                <Building2 className="relative z-10 w-10 h-10 mb-1" style={{ color: c.icon }} />
                                <p className="relative z-10 text-[9px] font-black uppercase text-center leading-tight px-2"
                                    style={{ color: c.icon }}>
                                    {level.tituloNivel}
                                </p>
                            </div>

                            {/* Interaction badge */}
                            <AnimatePresence>
                                {isNear && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                        onClick={() => onSelectLevel(level.id)}
                                        className="px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                                        style={{
                                            background: c.icon,
                                            color: '#0f172a',
                                            boxShadow: `0 4px 16px ${c.glow}`
                                        }}
                                    >
                                        INGRESAR <ArrowUpRight className="w-3 h-3" />
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {/* Progress indicator */}
                            {level.porcentajeCompletado > 0 && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black"
                                    style={{ background: c.icon, color: '#0f172a' }}>
                                    {level.porcentajeCompletado}%
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {/* === TOOLBOX STATION (top-right corner of world) === */}
                <div
                    className="absolute"
                    style={{ right: 20, bottom: 60 }}
                >
                    <motion.div
                        className="relative flex flex-col items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="rounded-2xl p-3 flex flex-col items-center gap-1 cursor-pointer"
                            style={{
                                background: 'linear-gradient(135deg, #1e1b4b, #2d1b69)',
                                border: '2px solid #7c3aed',
                                boxShadow: '0 0 20px rgba(124,58,237,0.3)'
                            }}
                            onClick={() => setShowToolbox(true)}
                        >
                            <Zap className="w-8 h-8 text-violet-400" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-violet-300">TOOLBOX</p>
                            <p className="text-[7px] text-violet-500 font-bold">{LAB_TOOLS.length} herramientas</p>
                        </div>
                    </motion.div>
                </div>

                {/* === PLAYER === */}
                <motion.div
                    animate={{ x: pos.x - 24, y: pos.y - 48 }}
                    transition={{ type: 'tween', duration: 0.05 }}
                    className="absolute z-50 pointer-events-none"
                >
                    <PixelWorker
                        name={user.name?.split(' ')[0] || 'Tú'}
                        isWalking={isWalking}
                        direction={direction}
                    />
                </motion.div>

                {/* === HUD - TOP BAR === */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(15,23,42,0.95), transparent)',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1d4ed8' }}>
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">SEDE CORPORATIVA LATAM</p>
                            <p className="text-[10px] text-slate-400 font-medium">Usa ← → ↑ ↓ o WASD para moverte</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {nearbyLevel && (
                            <motion.p
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[10px] font-bold text-blue-300 bg-blue-900/50 px-3 py-1 rounded-full border border-blue-700/50"
                            >
                                📍 Cerca de: {nearbyLevel.tituloNivel}
                            </motion.p>
                        )}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.3)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                            >
                                <X className="w-4 h-4 text-red-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* === HUD - BOTTOM CONTROLS === */}
                <div className="absolute bottom-4 left-5">
                    <div className="rounded-2xl px-4 py-2 flex items-center gap-4"
                        style={{
                            background: 'rgba(15,23,42,0.85)',
                            border: '1px solid rgba(59,130,246,0.2)',
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="grid grid-cols-3 gap-0.5">
                                <div />
                                <div className="w-5 h-5 bg-slate-700 border border-slate-600 rounded flex items-center justify-center text-[8px] text-slate-300">↑</div>
                                <div />
                                <div className="w-5 h-5 bg-slate-700 border border-slate-600 rounded flex items-center justify-center text-[8px] text-slate-300">←</div>
                                <div className="w-5 h-5 bg-slate-700 border border-slate-600 rounded flex items-center justify-center text-[8px] text-slate-300">↓</div>
                                <div className="w-5 h-5 bg-slate-700 border border-slate-600 rounded flex items-center justify-center text-[8px] text-slate-300">→</div>
                            </div>
                            <span className="text-[8px] text-slate-500 font-bold uppercase ml-1">Mover</span>
                        </div>
                        <div className="w-px h-6" style={{ background: 'rgba(148,163,184,0.2)' }} />
                        <button
                            onClick={() => setShowToolbox(true)}
                            className="flex items-center gap-1.5 text-[9px] font-bold text-violet-400 uppercase tracking-wider hover:text-violet-300 transition-colors"
                        >
                            <Zap className="w-3 h-3" />
                            Abrir Toolbox
                        </button>
                    </div>
                </div>
            </div>

            {/* === TOOLBOX MODAL === */}
            <AnimatePresence>
                {showToolbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
                        onClick={e => e.target === e.currentTarget && setShowToolbox(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="rounded-3xl overflow-hidden shadow-2xl"
                            style={{
                                background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
                                border: '1px solid rgba(124,58,237,0.4)',
                                width: '90vw',
                                maxWidth: 900,
                                boxShadow: '0 0 80px rgba(124,58,237,0.2)'
                            }}
                        >
                            <div className="p-6 flex items-center justify-between border-b border-white/5">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-violet-400">Centro de Recursos</p>
                                    <h2 className="text-xl font-black text-white tracking-tight">Toolbox LATAM</h2>
                                </div>
                                <button onClick={() => setShowToolbox(false)}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {activeTool ? (
                                <div className="flex flex-col" style={{ height: '70vh' }}>
                                    <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5">
                                        <button onClick={() => setActiveTool(null)}
                                            className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest flex items-center gap-1">
                                            ← Volver
                                        </button>
                                        <div className="w-px h-4 bg-white/10" />
                                        <activeTool.icon className="w-4 h-4" style={{ color: activeTool.color }} />
                                        <span className="text-sm font-bold text-white">{activeTool.name}</span>
                                    </div>
                                    <div className="flex-1 bg-[#1a1a2e]">
                                        <iframe
                                            src={activeTool.url}
                                            className="w-full h-full border-0"
                                            title={activeTool.name}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        {LAB_TOOLS.map(tool => (
                                            <motion.button
                                                key={tool.id}
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => setActiveTool(tool)}
                                                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                                                style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = `${tool.color}15`;
                                                    e.currentTarget.style.borderColor = `${tool.color}40`;
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                                }}
                                            >
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                                    style={{ background: `${tool.color}20`, border: `1px solid ${tool.color}40` }}>
                                                    <tool.icon className="w-6 h-6" style={{ color: tool.color }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white leading-none mb-1">{tool.name}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tool.color }}>
                                                        Abrir Lab →
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

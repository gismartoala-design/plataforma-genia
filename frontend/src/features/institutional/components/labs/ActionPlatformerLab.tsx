import React, { useState, useEffect, useRef } from 'react';
import { Play, Flame, RefreshCcw, Gamepad2, Terminal, Code2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Props to handle Teacher Configuration
interface ActionPlatformerLabProps {
    config?: {
        titulo?: string;
        instrucciones?: string;
        mapa?: number[];
        codigoBase?: string;
    };
    onComplete?: (data: any) => void;
}

export const ActionPlatformerLab = ({ config, onComplete }: ActionPlatformerLabProps) => {
    // 0: ground, 1: pit, 2: goal
    const defaultMap = [0, 0, 0, 1, 0, 0, 1, 0, 0, 2];
    const LEVEL_MAP = config?.mapa || defaultMap;
    const GOAL_INDEX = LEVEL_MAP.indexOf(2) !== -1 ? LEVEL_MAP.indexOf(2) : LEVEL_MAP.length - 1;

    // Code State
    const [code, setCode] = useState(config?.codigoBase || '# Define tus variables\ntecla_salto = " "\ntecla_derecha = "ArrowRight"\n\n# Programa las acciones\nbind_key(tecla_derecha, "walk")\nbind_key(tecla_salto, "jump")\n\nprint("¡Hola, soy un robot programable!")');
    const [bindings, setBindings] = useState<Record<string, string>>({});
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Engine State
    const [pos, setPos] = useState(0); 
    const [isJumping, setIsJumping] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'PLAYING' | 'DIED' | 'WON'>('IDLE');

    const isJumpingRef = useRef(false);
    const lastMoveRef = useRef(0);
    const posRef = useRef(0);
    const statusRef = useRef<'IDLE' | 'PLAYING' | 'DIED' | 'WON'>('IDLE');
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const activeKeysRef = useRef<Set<string>>(new Set());
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        posRef.current = pos;
        statusRef.current = status;
    }, [pos, status]);

    const resetLevel = () => {
        setPos(0);
        setIsJumping(false);
        isJumpingRef.current = false;
        setStatus('PLAYING');
        setError(null);
        activeKeysRef.current.clear();
    };

    const showMessage = (text: string) => {
        setMessage(text);
        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = setTimeout(() => setMessage(null), 3000);
    };

    // Enhanced regex-based "Python" parser
    const parseAndRun = () => {
        try {
            const newVariables: Record<string, string> = {};
            const newBindings: Record<string, string> = {};
            let found = false;

            const lines = code.split('\n');

            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith('#')) continue;

                // 1. Check for Variable Assignments: var = "value"
                const varMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*['"](.+?)['"]/);
                if (varMatch) {
                    newVariables[varMatch[1]] = varMatch[2];
                    continue;
                }

                // 2. Check for print("message")
                const printMatch = line.match(/^print\(['"](.+?)['"]\)/);
                if (printMatch) {
                    showMessage(printMatch[1]);
                    found = true;
                    continue;
                }

                // 3. Check for bind_key(key, action)
                const bindMatch = line.match(/^bind_key\((.+?)\s*,\s*(.+?)\)/);
                if (bindMatch) {
                    let keyPart = bindMatch[1].trim();
                    let actionPart = bindMatch[2].trim();

                    // Resolve key
                    let finalKey = keyPart;
                    if ((keyPart.startsWith('"') || keyPart.startsWith("'"))) {
                        finalKey = keyPart.slice(1, -1).toLowerCase();
                    } else if (newVariables[keyPart]) {
                        finalKey = newVariables[keyPart].toLowerCase();
                    }

                    // Resolve action
                    let finalAction = actionPart;
                    if ((actionPart.startsWith('"') || actionPart.startsWith("'"))) {
                        finalAction = actionPart.slice(1, -1);
                    } else if (newVariables[actionPart]) {
                        finalAction = newVariables[actionPart];
                    }

                    const normalizedKey = finalKey === 'space' ? ' ' : finalKey;
                    newBindings[normalizedKey] = finalAction;
                    found = true;
                }
            }

            if (!found && code.trim().length > 0 && !Object.keys(newVariables).length) {
                if (code.includes('bind') && !code.includes('bind_key')) {
                    throw new Error("Sintaxis incorrecta. ¿Quisiste usar bind_key?");
                }
            }

            setVariables(newVariables);
            setBindings(newBindings);
            resetLevel();
        } catch (err: any) {
            setError(err.message || "Error al leer el código Python.");
            setStatus('IDLE');
        }
    };

    const checkCollision = (currentPos: number, jumping: boolean) => {
        if (LEVEL_MAP[Math.round(currentPos)] === 1 && !jumping) {
            setStatus('DIED');
            activeKeysRef.current.clear();
            return true;
        } else if (Math.round(currentPos) === GOAL_INDEX) {
            setStatus('WON');
            activeKeysRef.current.clear();
            if (onComplete) onComplete({ status: 'WON', code });
            return true;
        }
        return false;
    };

    const jump = () => {
        if (statusRef.current !== 'PLAYING' || isJumpingRef.current) return;
        
        setIsJumping(true);
        isJumpingRef.current = true;
        
        setTimeout(() => {
            setIsJumping(false);
            isJumpingRef.current = false;
            // Check landing logic
            checkCollision(posRef.current, false);
        }, 700); 
    };

    // Game Loop Logic (30 FPS)
    useEffect(() => {
        if (status === 'PLAYING') {
            gameLoopRef.current = setInterval(() => {
                const keys = activeKeysRef.current;
                let moveDir = 0;

                // Check all active keys against bindings
                keys.forEach(key => {
                    const action = bindings[key.toLowerCase()] || bindings[key];
                    if (action === 'walk' || action === 'move' || action === 'right') moveDir = 1;
                    if (action === 'left' || action === 'back') moveDir = -1;
                    if (action === 'jump') jump();
                });

                if (moveDir !== 0) {
                    setPos(prev => {
                        let nextPos = prev + (moveDir * 0.15); // Smoother, smaller steps
                        if (nextPos < 0) nextPos = 0;
                        if (nextPos >= LEVEL_MAP.length - 0.5) nextPos = LEVEL_MAP.length - 1;
                        
                        checkCollision(nextPos, isJumpingRef.current);
                        return nextPos;
                    });
                }
            }, 33); // ~30fps
        } else {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [status, bindings]);

    // Global Key Listeners for Active Set
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'TEXTAREA') return;
            activeKeysRef.current.add(e.key.toLowerCase());
            // Prevent scrolling on space
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            activeKeysRef.current.delete(e.key.toLowerCase());
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-[#020617] text-white">
            
            {/* Python IDE Section */}
            <div className="md:w-2/5 flex flex-col bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden safety-border">
                <div className="bg-slate-800 border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                           <Terminal className="w-5 h-5" />
                        </div>
                        <div>
                           <h2 className="font-black italic uppercase text-lg tracking-tighter">Python IDE</h2>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Console.input()</p>
                        </div>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 animate-pulse">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[8px] font-black uppercase">Syntax Error</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <div className="p-4 bg-slate-900/50 flex items-center gap-2 border-b border-white/5">
                        <Info className="w-3 h-3 text-cyan-400" />
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                           {config?.instrucciones || "Usa bind_key(tecla, accion) para programar tus movimientos."}
                        </p>
                    </div>

                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-slate-950 p-6 font-mono text-xs text-cyan-400 outline-none resize-none selection:bg-cyan-500/20 custom-scrollbar"
                        placeholder="# Escribe código aquí..."
                        spellCheck={false}
                    />

                    {error && (
                        <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 backdrop-blur-md border border-red-500/50 p-3 rounded-xl text-[10px] font-bold text-red-100 animate-in slide-in-from-bottom-2">
                           ⚠️ {error}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-900 border-t border-white/10 flex gap-2">
                    <Button 
                        onClick={parseAndRun}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl h-12 font-black uppercase tracking-widest text-xs shadow-lg shadow-yellow-600/20 transition-all"
                    >
                        <Code2 className="w-4 h-4 mr-2" /> Compilar y Ejecutar
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => { setStatus('IDLE'); setError(null); }}
                        className="bg-white/5 border-white/10 hover:bg-white/10 h-12 w-12 rounded-xl"
                    >
                        <RefreshCcw className="w-4 h-4 text-slate-400" />
                    </Button>
                </div>
            </div>

            {/* Simulation Viewport */}
            <div className="md:w-3/5 bg-black border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col items-center justify-center safety-border group">
                
                {/* Visual Label */}
                <div className="absolute top-6 left-6 z-20 bg-slate-900/80 backdrop-blur-md px-4 py-2 border border-white/10 rounded-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase text-white tracking-widest">Runtime: {status}</p>
                </div>

                {/* Overlays */}
                <AnimatePresence>
                    {status === 'IDLE' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                            <Gamepad2 className="w-16 h-16 text-slate-700 mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Esperando Compilación Python</p>
                        </motion.div>
                    )}
                    {status === 'DIED' && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute z-50 flex flex-col items-center p-8 bg-black/90 backdrop-blur-xl rounded-3xl border border-red-500/50 shadow-2xl">
                            <Flame className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
                            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">¡Caída Técnica!</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Check your logic, engineer.</p>
                            <Button className="mt-6 bg-red-600 hover:bg-red-500 rounded-xl px-10 h-12 font-black uppercase tracking-widest text-[10px]" onClick={resetLevel}>Reintentar</Button>
                        </motion.div>
                    )}
                    {status === 'WON' && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute z-50 flex flex-col items-center p-10 bg-black/90 backdrop-blur-xl rounded-3xl border border-emerald-500/50 shadow-2xl">
                            <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4 animate-bounce" />
                            <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">SUCCESS</h2>
                            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-2">Nivel Superado con Éxito</p>
                            <Button className="mt-8 bg-emerald-600 hover:bg-emerald-500 rounded-xl px-12 h-14 font-black uppercase tracking-widest text-xs" onClick={resetLevel}>Siguiente Desafío</Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* World Map Render */}
                <div className="relative w-full h-80 bg-gradient-to-b from-slate-900 to-black overflow-hidden flex items-end px-12 pb-20">
                    
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMzMzNCNDQiIHN0cm9rZS13aWR0aD0iMC41Ij48cGF0aCBkPSJNMCA0MGg0ME00MCAwaC00ME0wIDBoNDBNMCAwaDBtNDAgMGwwIDQwbTAgMEwwIDQwIi8+PC9nPjwvc3ZnPg==')] opacity-10" />

                    {/* Ground and Obstacles */}
                    <div className="absolute bottom-0 left-0 w-full h-24 flex">
                        {LEVEL_MAP.map((type, i) => (
                            <div key={i} className="flex-1 h-full relative">
                                {type === 0 && (
                                    <div className="absolute bottom-0 w-full h-full bg-slate-800 border-t-4 border-cyan-500/30">
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                                    </div>
                                )}
                                {type === 1 && (
                                    <div className="absolute bottom-0 w-full h-12 bg-red-950/50 border-t-2 border-red-500 flex items-center justify-center">
                                       <Flame className="w-4 h-4 text-red-500/40 animate-pulse" />
                                    </div>
                                )}
                                {type === 2 && (
                                    <div className="absolute bottom-0 w-full h-full bg-slate-800 border-t-4 border-emerald-500">
                                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-1.5 h-32 bg-slate-400" />
                                        <div className="absolute bottom-40 left-1/2 w-14 h-10 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Character Sprite */}
                    {status !== 'IDLE' && (
                        <motion.div
                            className="absolute bottom-24 w-[10%] h-14 z-20"
                            animate={{ 
                                left: `${(pos / LEVEL_MAP.length) * 100}%`,
                                y: status === 'DIED' ? 100 : isJumping ? -120 : 0,
                                rotate: status === 'DIED' ? 90 : 0
                            }}
                            transition={{ 
                                left: { type: 'spring', stiffness: 350, damping: 25 },
                                y: { type: 'spring', stiffness: isJumping ? 120 : 400, damping: 15 },
                                rotate: { duration: 0.5 }
                            }}
                        >
                            <div className="relative group/player">
                                {/* Speech Bubble (print) */}
                                <AnimatePresence>
                                    {message && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: -60 }}
                                            exit={{ opacity: 0, scale: 0.5, y: 10 }}
                                            className="absolute left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-2 rounded-2xl text-[10px] font-bold whitespace-nowrap shadow-xl border-2 border-cyan-500 z-30"
                                        >
                                            {message}
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-white" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Aura */}
                                <div className="absolute inset-[-10px] bg-red-500/20 blur-xl rounded-full opacity-50 animate-pulse" />
                                
                                {/* Robot Core */}
                                <div className="w-12 h-12 bg-slate-900 border-2 border-red-500 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-red-400/50" />
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]" />
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]" />
                                    </div>
                                    <div className="absolute bottom-1 w-6 h-0.5 bg-red-900/50 rounded-full" />
                                </div>

                                {/* Jump Thruster */}
                                {isJumping && (
                                    <motion.div 
                                        initial={{ scale: 0 }} 
                                        animate={{ scale: 1.5 }} 
                                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-transparent via-cyan-500 to-cyan-300 blur-sm rounded-full" 
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, Box, Trash2, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type CommandType = 'FORWARD' | 'LEFT' | 'RIGHT' | 'PLACE_BASE' | 'PLACE_WOOD';

interface DroneCommand {
    id: string;
    type: CommandType;
}

interface Cell {
    x: number;
    y: number;
    block: 'none' | 'base' | 'wood';
}

const GRID_SIZE = 8; // 8x8 grid

const INITIAL_DRONE_POS = { x: 0, y: 0 };
const INITIAL_DRONE_DIR = 1; // 0=Up(-y), 1=Right(+x), 2=Down(+y), 3=Left(-x)

export const MinecraftCodeLab = () => {
    const [commands, setCommands] = useState<DroneCommand[]>([]);
    const [grid, setGrid] = useState<Cell[]>([]);
    const [dronePos, setDronePos] = useState(INITIAL_DRONE_POS);
    const [droneDir, setDroneDir] = useState(INITIAL_DRONE_DIR);
    const [isRunning, setIsRunning] = useState(false);
    const [currentCodeIndex, setCurrentCodeIndex] = useState(-1);

    // Initialize Grid
    useEffect(() => {
        resetGrid();
    }, []);

    const resetGrid = () => {
        const newGrid: Cell[] = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                newGrid.push({ x, y, block: 'none' });
            }
        }
        setGrid(newGrid);
        setDronePos(INITIAL_DRONE_POS);
        setDroneDir(INITIAL_DRONE_DIR);
        setCurrentCodeIndex(-1);
    };

    const addCommand = (type: CommandType) => {
        if (isRunning) return;
        setCommands([...commands, { id: Date.now().toString(), type }]);
    };

    const removeCommand = (index: number) => {
        if (isRunning) return;
        setCommands(commands.filter((_, i) => i !== index));
    };

    const executeProgram = async () => {
        if (commands.length === 0 || isRunning) return;
        
        setIsRunning(true);
        resetGrid(); // Restart position and blocks before full playback
        await new Promise(r => setTimeout(r, 500)); // Small pause

        let currentPos = { ...INITIAL_DRONE_POS };
        let currentDir = INITIAL_DRONE_DIR;
        let currentGrid = [];
        // Pre-fill a local copy to mutate syncly during execution step
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                currentGrid.push({ x, y, block: 'none' as any });
            }
        }

        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            setCurrentCodeIndex(i);
            
            // Execute logical step
            if (cmd.type === 'LEFT') {
                currentDir = (currentDir + 3) % 4;
            } else if (cmd.type === 'RIGHT') {
                currentDir = (currentDir + 1) % 4;
            } else if (cmd.type === 'FORWARD') {
                if (currentDir === 0 && currentPos.y > 0) currentPos.y--;
                if (currentDir === 1 && currentPos.x < GRID_SIZE - 1) currentPos.x++;
                if (currentDir === 2 && currentPos.y < GRID_SIZE - 1) currentPos.y++;
                if (currentDir === 3 && currentPos.x > 0) currentPos.x--;
            } else if (cmd.type === 'PLACE_BASE' || cmd.type === 'PLACE_WOOD') {
                const cellIndex = currentGrid.findIndex(c => c.x === currentPos.x && c.y === currentPos.y);
                if (cellIndex !== -1) {
                    currentGrid[cellIndex].block = cmd.type === 'PLACE_BASE' ? 'base' : 'wood';
                }
            }

            // Update React State
            setDronePos({ ...currentPos });
            setDroneDir(currentDir);
            setGrid([...currentGrid]);

            // Delay for animation
            await new Promise(r => setTimeout(r, 700));
        }

        setCurrentCodeIndex(-1);
        setIsRunning(false);
    };

    // Calculate rotation in degrees based on generic direction matrix
    const getRotationDegrees = (dir: number) => {
        switch (dir) {
            case 0: return -90; // Up
            case 1: return 0;   // Right
            case 2: return 90;  // Down
            case 3: return 180; // Left
            default: return 0;
        }
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-[#020617] text-white">
            
            {/* Programming Panel */}
            <div className="md:w-1/3 flex flex-col bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden safety-border">
                <div className="bg-slate-800 border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
                           <Code2 className="w-5 h-5" />
                        </div>
                        <div>
                           <h2 className="font-black italic uppercase text-lg tracking-tighter">Editor Dron</h2>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Algoritmo</p>
                        </div>
                    </div>
                </div>

                {/* Blocks Palette */}
                <div className="p-4 grid grid-cols-2 gap-2 bg-slate-900/50 border-b border-white/5">
                    <Button variant="outline" onClick={() => addCommand('FORWARD')} className="h-10 text-xs font-bold border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                       <ArrowUp className="w-4 h-4 mr-1" /> Avanzar
                    </Button>
                    <Button variant="outline" onClick={() => addCommand('LEFT')} className="h-10 text-xs font-bold border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                       <RotateCcw className="w-4 h-4 mr-1 scale-x-[-1]" /> Girar Izq.
                    </Button>
                    <Button variant="outline" onClick={() => addCommand('RIGHT')} className="h-10 text-xs font-bold border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                       <RotateCcw className="w-4 h-4 mr-1" /> Girar Der.
                    </Button>
                    <Button variant="outline" onClick={() => addCommand('PLACE_BASE')} className="h-10 text-xs font-bold border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                       <Box className="w-4 h-4 mr-1" /> Poner Tierra
                    </Button>
                    <Button variant="outline" onClick={() => addCommand('PLACE_WOOD')} className="h-10 text-xs font-bold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 col-span-2">
                       <Box className="w-4 h-4 mr-1" /> Poner Concreto
                    </Button>
                </div>

                {/* Queue display */}
                <ScrollArea className="flex-1 p-4 bg-black/50">
                    <AnimatePresence>
                        {commands.map((cmd, i) => (
                            <motion.div 
                                key={cmd.id} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border mb-2 group",
                                    currentCodeIndex === i 
                                        ? "bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse" 
                                        : "bg-slate-800 border-white/10 hover:border-white/20"
                                )}
                            >
                                <span className="font-black text-[10px] text-slate-500 mr-3">{i+1}</span>
                                <span className={cn(
                                    "flex-1 font-bold text-xs uppercase tracking-widest",
                                    cmd.type.includes('PLACE') ? "text-emerald-400" : "text-cyan-400"
                                )}>
                                    {cmd.type.replace('_', ' ')}
                                </span>
                                <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   disabled={isRunning}
                                   onClick={() => removeCommand(i)} 
                                   className="opacity-0 group-hover:opacity-100 h-6 w-6 text-slate-500 hover:text-red-400 flex-shrink-0"
                                >
                                   <Trash2 className="w-3 h-3" />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {commands.length === 0 && (
                        <div className="text-center p-8 text-slate-500 text-xs font-bold uppercase tracking-widest opacity-50">
                            Añade bloques de <br/>instrucción arriba
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 bg-slate-900 border-t border-white/10 flex gap-2">
                    <Button 
                        disabled={isRunning || commands.length === 0}
                        onClick={executeProgram} 
                        className="flex-1 rounded-xl h-12 bg-orange-600 hover:bg-orange-500 font-black uppercase tracking-widest text-xs"
                    >
                        {isRunning ? 'Construyendo...' : 'Ejecutar Programa'} <Play className="w-4 h-4 ml-2" />
                    </Button>
                    <Button 
                        disabled={isRunning} 
                        onClick={() => setCommands([])} 
                        variant="outline" 
                        className="w-12 h-12 rounded-xl shrink-0 text-slate-400 hover:text-white border-white/10 hover:bg-red-500/20"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Virtual World Panel */}
            <div className="md:w-2/3 bg-black border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col items-center justify-center safety-border">
                {/* Visual Guidance Overlay */}
                <div className="absolute top-6 left-6 z-20 bg-slate-900/80 backdrop-blur-md px-4 py-2 border border-white/10 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Plano Vectorial [8x8]</p>
                    <p className="text-xs text-slate-300 font-medium italic">Simulador del Dron Constructor</p>
                </div>

                {/* Interactive Voxel 2D Grid (Top-down visual style) */}
                <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] border-4 border-slate-800 rounded-3xl bg-slate-900/50 shadow-inner grid" 
                     style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
                    
                    {/* Render grid cells */}
                    {grid.map((cell, idx) => (
                        <div key={idx} className="border border-white/5 relative flex items-center justify-center w-full h-full">
                            {/* Render Block Data */}
                            <AnimatePresence>
                                {cell.block !== 'none' && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1, rotateX: 20 }}
                                        className={cn(
                                            "w-[80%] h-[80%] rounded-[4px] shadow-lg border-t-2 border-l-2",
                                            cell.block === 'base' 
                                                ? "bg-amber-700 border-amber-500/50" 
                                                : "bg-emerald-600 border-emerald-400/50"
                                        )}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    ))}

                    {/* Render Drone absolute to grid container */}
                    <motion.div
                        className="absolute w-[12.5%] h-[12.5%] flex items-center justify-center z-10 pointer-events-none"
                        animate={{ 
                            left: `${(dronePos.x / GRID_SIZE) * 100}%`,
                            top: `${(dronePos.y / GRID_SIZE) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                        <motion.div 
                            className="bg-cyan-500 w-6 h-6 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)] border-2 border-white flex items-center justify-center"
                            animate={{ rotate: getRotationDegrees(droneDir) }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Drone orientation marker */}
                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-white transform translate-x-[2px] rotate-90" />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    Float,
    OrbitControls,
    Html,
    Stars,
    PerspectiveCamera,
    Environment,
    useGLTF,
    ContactShadows,
    Sparkles
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
    Rocket,
    Zap,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Gamepad2,
    Music,
    MousePointer2,
    Target,
    Code2,
    Cpu,
    Coins,
    ShoppingBag
} from "lucide-react";
import { studentApi } from "../services/student.api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkinShopModal } from "../../latam/student/components/SkinShopModal";
import EarthModelAsset from "@/assets/models/Earth.glb";

// Fallback component for when the GLB fails to load
function EarthFallback({ color, hovered }: { color: string; hovered: boolean }) {
    return (
        <mesh>
            <sphereGeometry args={[7.2, 32, 32]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={hovered ? 0.6 : 0.2}
                metalness={0.8}
                roughness={0.2}
            />
        </mesh>
    );
}

/**
 * COMPONENTE PLANETA (USANDO MODELO GLB EXTERNO)
 */
// Using the local Earth model asset
const Earth = EarthModelAsset;
// Preload standard GLB
useGLTF.preload(Earth);

function EarthModel({ color, hovered }: { color: string; hovered: boolean }) {
    try {
        const { scene } = useGLTF(Earth); // Standard loader
        const clone = useMemo(() => scene.clone(), [scene]);

        useEffect(() => {
            clone.traverse((child: any) => {
                if (child.isMesh && child.material) {
                    child.material.emissive = new THREE.Color(color);
                    child.material.emissiveIntensity = hovered ? 0.4 : 0.05;
                }
            });
        }, [clone, color, hovered]);

        return <primitive object={clone} scale={7.2} />;
    } catch (error) {
        console.error("Failed to load Earth.glb, using fallback sphere:", error);
        return <EarthFallback color={color} hovered={hovered} />;
    }
}

function CsModel({ color, hovered }: { color: string; hovered: boolean }) {
    return (
        <group>
            {/* Core Cube */}
            <mesh>
                <boxGeometry args={[6, 6, 6]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.8 : 0.4}
                    transparent
                    opacity={0.8}
                    wireframe={!hovered}
                />
            </mesh>
            {/* Inner Glitchy Cube */}
            <mesh scale={0.7}>
                <boxGeometry args={[6, 6, 6]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={hovered ? 1 : 0.5} />
            </mesh>
            {/* Spinning Rings/Data Segments */}
            <group rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                <mesh>
                    <torusGeometry args={[8, 0.1, 16, 100]} />
                    <meshBasicMaterial color={color} transparent opacity={0.3} />
                </mesh>
            </group>
        </group>
    );
}

function MechatronicsModel({ color, hovered }: { color: string; hovered: boolean }) {
    const gearRef = useRef<THREE.Group>(null!);
    useFrame((state) => {
        if (gearRef.current) {
            gearRef.current.rotation.z += 0.01;
            gearRef.current.rotation.x += 0.005;
        }
    });

    return (
        <group ref={gearRef}>
            {/* Mechanical Core */}
            <mesh>
                <sphereGeometry args={[5, 16, 16]} />
                <meshStandardMaterial
                    color="#444444"
                    metalness={1}
                    roughness={0.2}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.3 : 0.1}
                />
            </mesh>
            {/* External Gear Teeth / Structure */}
            {[0, 1, 2, 3].map((i) => (
                <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
                    <boxGeometry args={[12, 1, 3]} />
                    <meshStandardMaterial color="#666666" metalness={1} roughness={0.3} />
                </mesh>
            ))}
            {/* Energy Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[7, 0.2, 16, 100]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1 : 0.5} />
            </mesh>
        </group>
    );
}

/**
 * COMPONENTE EXPLORADOR (Avatar/Dron del Estudiante)
 * Sigue al módulo seleccionado o flota cerca del mouse
 */
function ExplorerDrone({ targetPosition, color }: { targetPosition: [number, number, number]; color: string }) {
    const droneRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (droneRef.current) {
            // Suavizado de movimiento hacia el objetivo
            droneRef.current.position.lerp(new THREE.Vector3(
                targetPosition[0] + Math.sin(t * 2) * 0.5,
                targetPosition[1] + 2.5 + Math.cos(t * 1.5) * 0.3,
                targetPosition[2] + Math.cos(t * 2) * 0.5
            ), 0.05);

            // Rotación constante
            droneRef.current.rotation.y += 0.02;
            droneRef.current.rotation.z = Math.sin(t) * 0.1;
        }
    });

    return (
        <group ref={droneRef}>
            {/* Cuerpo del Dron */}
            <mesh castShadow>
                <octahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
            {/* Ojo/Luz Central */}
            <mesh position={[0, 0, 0.3]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>
            {/* Anillo de Energía */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.5, 0.02, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} />
            </mesh>
            <pointLight distance={3} intensity={2} color={color} />
        </group>
    );
}

/**
 * MANEJADOR DE CÁMARA CINEMÁTICA
 * Realiza el efecto de "vuelo" hacia el planeta seleccionado
 */
function CameraHandler({ activePosition }: { activePosition: [number, number, number] | null }) {
    const { camera } = useThree();
    const targetCamPos = useRef(new THREE.Vector3());
    const lookAtPos = useRef(new THREE.Vector3());

    useFrame(() => {
        if (activePosition) {
            // Solo cuando hay un planeta seleccionado, la cámara lo sigue
            targetCamPos.current.set(
                activePosition[0] * 1.3,
                activePosition[1] + 18,
                activePosition[2] + 45
            );
            lookAtPos.current.lerp(new THREE.Vector3(...activePosition), 0.1);
            camera.position.lerp(targetCamPos.current, 0.05);
            camera.lookAt(lookAtPos.current);
        }
        // Si no hay posición activa, NO HACEMOS NADA. 
        // Esto permite que OrbitControls mantenga la cámara donde el usuario la dejó.
    });

    return null;
}

function Planet({ id, position, color, name, progress, onClick, index: idx, isActive, userSpecialization, especializacion }: any) {
    const groupRef = useRef<THREE.Group>(null!);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.005;
            if (!hovered && !isActive) {
                groupRef.current.position.y = position[1] + Math.sin(t + idx) * 0.2;
            }
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Detector de interacción */}
            {/* Invisible catch area for easier interaction */}
            <mesh
                visible={false}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[9, 32, 32]} />
            </mesh>

            {/* Mesh base para hover (visual sutil) */}
            <mesh
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(id);
                }}
            >
                <sphereGeometry args={[isActive ? 8 : 6.5, 32, 32]} />
                <meshStandardMaterial
                    transparent
                    opacity={0}
                />
            </mesh>

            {/* Model Selection */}
            <group scale={isActive ? 1.4 : (hovered ? 1.15 : 1)} transition-all duration-500>
                <Suspense fallback={<mesh><sphereGeometry args={[3, 16, 16]} /><meshStandardMaterial color={color} /></mesh>}>
                    {especializacion === 'cs' ? (
                        <CsModel color={color} hovered={hovered || isActive} />
                    ) : especializacion === 'mechatronics' ? (
                        <MechatronicsModel color={color} hovered={hovered || isActive} />
                    ) : (
                        <EarthModel color={color} hovered={hovered || isActive} />
                    )}
                </Suspense>

                {/* Aura de atmósfera sutil */}
                <mesh scale={8.4}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={isActive ? 0.25 : (hovered ? 0.15 : 0.05)}
                        side={THREE.BackSide}
                    />
                </mesh>

                {(hovered || isActive) && (
                    <Sparkles count={80} scale={10} size={idx === 0 ? 6 : 4} speed={0.5} color={color} />
                )}
            </group>

            {/* Anillo de Selección Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
                <ringGeometry args={[7.0, 7.2, 64]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={isActive ? 1 : (hovered ? 0.8 : 0.2)}
                />
            </mesh>

            {/* UI de Información (HTML) */}
            <Html
                position={[0, 11, 0]}
                center
                distanceFactor={isActive ? 25 : 35}
                className="pointer-events-none select-none"
            >
                <div className={cn(
                    "flex flex-col items-center gap-4 transition-all duration-700 transform w-[280px]",
                    (hovered || isActive) ? "scale-100 opacity-100" : "scale-80 opacity-50 blur-[0.5px]"
                )}>
                    <div className={cn(
                        "bg-slate-900/98 backdrop-blur-3xl border-2 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-colors",
                        isActive ? "border-cyan-400/50 ring-4 ring-cyan-400/20" : "border-white/20"
                    )}>
                        {/* Status dot */}
                        <div className={cn(
                            "absolute top-5 right-6 w-3 h-3 rounded-full",
                            (hovered || isActive) ? "bg-green-400 animate-pulse" : "bg-white/10"
                        )} />

                        <div className="mb-2">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Sector {idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            {userSpecialization === "Ciencias Computacionales" && (
                                <div className="p-2 bg-cyan-400/20 rounded-lg">
                                    <Code2 className="w-5 h-5 text-cyan-400" />
                                </div>
                            )}
                            {userSpecialization === "Mecatrónica" && (
                                <div className="p-2 bg-orange-400/20 rounded-lg">
                                    <Cpu className="w-5 h-5 text-orange-400" />
                                </div>
                            )}
                            {userSpecialization === "Electrónica" && (
                                <div className="p-2 bg-yellow-400/20 rounded-lg">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                </div>
                            )}
                            <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight">
                                {name}
                            </h3>
                        </div>

                        <div className="w-full space-y-3">
                            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-[2px] border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                                />
                            </div>
                            <div className="flex justify-between items-center text-[8px] font-black text-cyan-400 uppercase tracking-widest">
                                <span>Progreso</span>
                                <span>{progress}%</span>
                            </div>
                        </div>

                        {(hovered || isActive) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-8 flex flex-col items-center"
                            >
                                <div className="px-4 py-2 border border-cyan-400/30 bg-cyan-400/10 rounded-xl">
                                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                        SELECCIONADO
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </Html>
        </group>
    );
}

function Scene({ modules, activeId, setActiveId, onSelect, generalProgress, user }: any) {
    const planetPositions = useMemo(() => {
        const radius = 28;
        return modules.map((_: any, i: number) => {
            const angle = (i / modules.length) * Math.PI * 2;
            return [
                Math.sin(angle) * radius,
                Math.cos(angle * 2) * 5.0,
                Math.cos(angle) * radius
            ];
        });
    }, [modules.length]);

    const colors = ["#ff3e3e", "#0ea5e9", "#10b981", "#f59e0b", "#a855f7", "#ec4899"];

    const activeModulePos = useMemo(() => {
        const idx = modules.findIndex((m: any) => m.id === activeId);
        return idx !== -1 ? planetPositions[idx] : null;
    }, [activeId, modules, planetPositions]);

    return (
        <>
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={30}
                maxDistance={120}
                enableDamping={true}
                dampingFactor={0.08}
                autoRotate={!activeId}
                autoRotateSpeed={0.5}
                makeDefault
            />

            <CameraHandler activePosition={activeModulePos} />

            <ExplorerDrone
                targetPosition={activeModulePos || [0, 0, 0]}
                color={activeId ? colors[modules.findIndex((m: any) => m.id === activeId) % colors.length] : "#00f3ff"}
            />

            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 40, 10]} intensity={2.5} />

            <Stars radius={150} depth={60} count={5000} factor={6} fade speed={1.5} />

            <group>
                {modules.map((mod: any, i: number) => (
                    <Planet
                        key={mod.id}
                        id={mod.id}
                        index={i}
                        position={planetPositions[i]}
                        color={colors[i % colors.length]}
                        name={mod.nombreModulo}
                        progress={generalProgress?.moduleProgress?.find((p: any) => p.moduloId === mod.id)?.progressPercentage || 0}
                        isActive={activeId === mod.id}
                        userSpecialization={user.especializacion}
                        especializacion={mod.especializacion}
                        onClick={() => {
                            if (activeId === mod.id) onSelect(mod.id);
                            else setActiveId(mod.id);
                        }}
                    />
                ))}
            </group>

            <Environment preset="night" />
        </>
    );
}

export default function WorldSelector({ user }: WorldSelectorProps) {
    const [, setLocation] = useLocation();
    const [modules, setModules] = useState<any[]>([]);
    const [gamification, setGamification] = useState<any>(null);
    const [generalProgress, setGeneralProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [showShop, setShowShop] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mods, stats, progress] = await Promise.all([
                    studentApi.getModules(user.id),
                    studentApi.getGamificationStats(parseInt(user.id)),
                    studentApi.getProgress(user.id)
                ]);

                setModules(mods.modules || []);
                setGamification(stats);
                setGeneralProgress(progress);

                if (mods.modules?.length > 0) {
                    setActiveId(mods.modules[0].id); // Auto-select first module
                }
            } catch (error: any) {
                console.error("Error loading student data:", error);
                setErrorMsg(error.message || "Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    const activeIndex = useMemo(() =>
        modules.findIndex(m => m.id === activeId),
        [modules, activeId]);

    const handleNext = () => {
        const nextIdx = (activeIndex + 1) % modules.length;
        setActiveId(modules[nextIdx].id);
    };

    const handlePrev = () => {
        const prevIdx = (activeIndex - 1 + modules.length) % modules.length;
        setActiveId(modules[prevIdx].id);
    };

    // Cinematic intro - auto-dismiss after 2.8s or when data is ready
    useEffect(() => {
        if (!loading && showIntro) {
            const timer = setTimeout(() => setShowIntro(false), 2800);
            return () => clearTimeout(timer);
        }
    }, [loading, showIntro]);

    if (loading || showIntro) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="intro"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden relative"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1a2e 0%, #020617 70%)' }}
                >
                    {/* Animated grid */}
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

                    {/* Ambient top glow */}
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px]"
                        style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.25) 0%, transparent 70%)' }}
                    />

                    {/* Scanning horizontal line */}
                    <motion.div
                        initial={{ top: '-2%' }}
                        animate={{ top: '102%' }}
                        transition={{ duration: 2.5, ease: 'linear', repeat: Infinity }}
                        className="absolute left-0 right-0 h-px pointer-events-none z-10"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.8), transparent)' }}
                    />

                    {/* Main content */}
                    <div className="relative z-20 flex flex-col items-center gap-8">
                        {/* Logo Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                            className="relative"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0 rounded-full border border-cyan-500/30"
                                style={{ width: 120, height: 120, margin: -10 }}
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0 rounded-full border border-dashed border-cyan-400/20"
                                style={{ width: 140, height: 140, margin: -20 }}
                            />
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-[0_0_60px_rgba(6,182,212,0.6)]">
                                <Rocket className="w-12 h-12 text-white" />
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-center space-y-2"
                        >
                            <p className="text-[10px] font-black tracking-[0.6em] text-cyan-400/60 uppercase">Arg Academy</p>
                            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                                <span className="text-white">BIENVENIDO, </span>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-transparent bg-clip-text"
                                    style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #3b82f6, #a855f7)' }}
                                >
                                    {(user.name || 'EXPLORADOR').split(' ')[0].toUpperCase()}
                                </motion.span>
                            </h1>
                        </motion.div>

                        {/* Loading bars */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="w-72 space-y-2"
                        >
                            {['SINCRONIZANDO MUNDOS', 'CARGANDO SECTORES', 'PREPARANDO MISIONES'].map((label, i) => (
                                <div key={label} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-black text-cyan-400/50 uppercase tracking-widest">{label}</span>
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.2 + i * 0.3 }}
                                            className="text-[8px] font-black text-cyan-400"
                                        >OK</motion.span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 0.8, delay: 0.8 + i * 0.3, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ background: `linear-gradient(90deg, #06b6d4, #3b82f6)` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Skip button */}
                        {!loading && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.8 }}
                                onClick={() => setShowIntro(false)}
                                className="text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-widest transition-colors mt-2"
                            >
                                Toca para continuar →
                            </motion.button>
                        )}
                    </div>

                    {/* Bottom info */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="absolute bottom-8 text-white/20 text-[10px] font-black uppercase tracking-[0.4em]"
                    >
                        Sistema Operativo · v2.0 · Arg Academy
                    </motion.p>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (errorMsg || (modules && modules.length === 0)) {
        return (
            <div className="h-screen w-full bg-[#030712] flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <Zap className="w-12 h-12 text-red-400" />
                </div>
                <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">
                   {errorMsg ? "Error de Conexión" : "Contenido No Disponible"}
                </h2>
                <p className="text-slate-400 max-w-md mb-8 font-medium">
                    {errorMsg 
                      ? "No hemos podido cargar tus datos de sesión. Por favor, intenta cerrar sesión y volver a entrar." 
                      : "Aún no tienes módulos asignados. Contacta a tu profesor para comenzar tu aventura."}
                </p>
                <Button 
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-6 rounded-2xl text-lg uppercase tracking-widest"
                >
                    Reiniciar Sesión
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-screen w-full bg-[#01040a] relative flex flex-col overflow-hidden select-none font-sans"
        >

            {/* SkinShop Modal - disponible para todos los estudiantes */}
            {showShop && (
                <SkinShopModal
                    studentId={parseInt(user.id)}
                    onClose={() => setShowShop(false)}
                    onSkinEquipped={() => setShowShop(false)}
                />
            )}

            <div className="absolute inset-0 z-0 bg-[#020617]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#020617] to-[#020617]" />
                <div className="absolute inset-0 bg-radial-at-t from-blue-600/10 via-transparent to-transparent opacity-40" />
            </div>

            {/* HUD Central ESCALADO (Diseño Gaming Elegante) */}
            <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-start justify-start pt-12 pl-10">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter uppercase italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                >
                    ELIGE TU CURSO
                </motion.h1>
            </div>

            {/* Navigation Arrows (Carousel Style) */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 px-10 flex justify-between pointer-events-none">
                <button
                    onClick={handlePrev}
                    className="w-16 h-16 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all active:scale-90 pointer-events-auto group"
                >
                    <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                    onClick={handleNext}
                    className="w-16 h-16 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all active:scale-90 pointer-events-auto group"
                >
                    <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Bottom HUD - Action Button */}
            <div className="absolute bottom-16 inset-x-0 z-30 flex justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                    {activeId && (
                        <motion.div
                            key={activeId}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="pointer-events-auto"
                        >
                            <button
                                onClick={() => setLocation(`/dashboard/module/${activeId}`)}
                                className="group relative px-16 py-6 bg-cyan-500 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(6,182,212,0.4)] hover:shadow-[0_25px_60px_rgba(6,182,212,0.6)] transition-all active:scale-95"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)]" />
                                <div className="relative flex items-center gap-4">
                                    <span className="text-2xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
                                        ¡A JUGAR AHORA!
                                    </span>
                                    <Rocket className="w-6 h-6 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            </button>
                            <p className="text-center mt-4 text-[9px] font-black text-cyan-400 uppercase tracking-[0.5em] animate-pulse">
                                Presiona para ingresar al sector
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Escena 3D */}
            <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 25, 65]} fov={45} />
                    <Suspense fallback={null}>
                        <Scene
                            modules={modules}
                            activeId={activeId}
                            setActiveId={setActiveId}
                            generalProgress={generalProgress}
                            onSelect={(id: any) => setLocation(`/dashboard/module/${id}`)}
                            user={user}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Floating HUD: Geniomonedas + Tienda + XP */}
            <div className="absolute top-10 right-10 z-20 pointer-events-auto flex items-center gap-3">
                {/* Geniomonedas + Tienda de Skins */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setShowShop(true)}
                    className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 p-3 px-5 rounded-[1.5rem] backdrop-blur-3xl shadow-xl hover:bg-amber-500/20 hover:border-amber-500/60 transition-all group"
                >
                    <Coins className="w-4 h-4 text-amber-400" />
                    <div className="flex flex-col items-start">
                        <span className="text-[7px] font-black text-amber-400/60 uppercase tracking-[0.3em]">Geniomonedas</span>
                        <span className="text-sm font-black text-amber-300 leading-none">{gamification?.geniomonedas ?? gamification?.totalPoints ?? 0}</span>
                    </div>
                    <ShoppingBag className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                {/* XP */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-4 bg-slate-900/90 border border-white/10 p-3 px-6 rounded-[1.5rem] backdrop-blur-3xl shadow-xl"
                >
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-0.5">XP Total</span>
                        <span className="text-lg font-black text-white leading-none">
                            {gamification?.totalPoints || gamification?.xpTotal || 0}
                        </span>
                    </div>
                    <div className="p-2 bg-cyan-500/20 rounded-xl">
                        <Trophy className="w-4 h-4 text-cyan-400 fill-current" />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

// Helper props for Scene
interface WorldSelectorProps {
    user: {
        name: string;
        id: string;
        role: string;
        avatar?: string;
        especializacion?: string;
    };
}

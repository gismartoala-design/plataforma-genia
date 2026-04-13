import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Sparkles, User, Phone, Briefcase, Mail, Rocket, Star, Zap, Shield } from "lucide-react";
import confetti from "canvas-confetti";
import { authApi } from '../services/auth.api';
import { useToast } from "@/hooks/use-toast";

// Import avatars
import avatarBoy from "@/assets/avatars/avatar_boy.png";
import avatarGirl from "@/assets/avatars/avatar_girl.png";
import avatarRobot from "@/assets/avatars/avatar_robot.png";
import avatarPet from "@/assets/avatars/avatar_pet.png";

const AVATARS = [
    { id: 'avatar_boy', src: avatarBoy, label: "Genio Tech", desc: "El estudiante clásico con sed de conocimiento", color: "#3b82f6", glow: "rgba(59,130,246,0.5)" },
    { id: 'avatar_girl', src: avatarGirl, label: "Cyber Girl", desc: "Hacker de élite, domina cualquier desafío digital", color: "#ec4899", glow: "rgba(236,72,153,0.5)" },
    { id: 'avatar_robot', src: avatarRobot, label: "Robo-Amigo", desc: "Inteligencia artificial al servicio del aprendizaje", color: "#06b6d4", glow: "rgba(6,182,212,0.5)" },
    { id: 'avatar_pet', src: avatarPet, label: "Astro Cat", desc: "El explorador cósmico más ágil del universo", color: "#a855f7", glow: "rgba(168,85,247,0.5)" },
];

interface OnboardingWizardProps {
    isOpen: boolean;
    userId: string;
    onComplete: (avatarId: string) => void;
}

// Floating particle component
function Particle({ delay, x, y, size, color }: any) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, filter: 'blur(1px)' }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.5, 1] }}
            transition={{ duration: 3 + Math.random() * 2, delay, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    color: ['#3b82f6', '#06b6d4', '#a855f7', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 5)],
    delay: Math.random() * 3,
}));

export function OnboardingWizard({ isOpen, userId, onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [selectedAvatarId, setSelectedAvatarId] = useState(AVATARS[0].id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const [parentInfo, setParentInfo] = useState({ nombrePadre: '', emailPadre: '', celularPadre: '', trabajoPadre: '' });
    const [studentInfo, setStudentInfo] = useState({ identificacion: '', fechaNacimiento: '', edad: '', institucion: '', curso: '' });

    const selectedAvatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];
    const totalSteps = 4;

    const isParentStepValid = () =>
        parentInfo.nombrePadre.trim().length > 3 &&
        parentInfo.celularPadre.trim().length > 5 &&
        parentInfo.trabajoPadre.trim().length > 2;

    const isStudentStepValid = () =>
        studentInfo.identificacion.trim().length > 5 &&
        studentInfo.fechaNacimiento.trim().length > 0 &&
        studentInfo.institucion.trim().length > 3 &&
        studentInfo.curso.trim().length > 0;

    const handleFinish = async () => {
        if (!isParentStepValid()) {
            toast({ title: "Faltan datos", description: "Por favor completa la información del representante.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            await authApi.updateUser(userId, {
                avatar: selectedAvatarId,
                onboardingCompleted: true,
                ...parentInfo,
                ...studentInfo,
                edad: studentInfo.edad ? parseInt(studentInfo.edad) : undefined,
            });
            confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: [selectedAvatar.color, '#ffffff', '#f59e0b'] });
            setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 80, origin: { x: 0 } }), 300);
            setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 80, origin: { x: 1 } }), 500);
            onComplete(selectedAvatarId);
        } catch {
            toast({ title: "Error", description: "No se pudo guardar la información. Inténtalo de nuevo.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, #1e1033 0%, #05050f 60%)' }}
            >
                {/* Animated Background Grid */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                {/* Ambient glow orbs */}
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full blur-[120px]"
                    style={{ background: selectedAvatar.color, opacity: 0.15 }} />
                <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                    className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full blur-[120px] bg-fuchsia-600 opacity-10" />

                {/* Particles */}
                {PARTICLES.map(p => <Particle key={p.id} {...p} />)}

                {/* Progress dots */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ width: i + 1 === step ? 32 : 8, opacity: i + 1 <= step ? 1 : 0.3 }}
                            transition={{ duration: 0.3 }}
                            className="h-2 rounded-full"
                            style={{ background: i + 1 <= step ? selectedAvatar.color : 'rgba(255,255,255,0.2)' }}
                        />
                    ))}
                </div>

                {/* Main Card */}
                <div className="relative z-10 w-full max-w-5xl min-h-[580px] flex rounded-[2rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)] border border-white/10">

                    {/* LEFT PANEL – Always shows avatar preview */}
                    <div className="hidden md:flex w-[45%] flex-col items-center justify-center relative overflow-hidden"
                        style={{ background: `radial-gradient(ellipse at center, ${selectedAvatar.glow.replace('0.5', '0.15')} 0%, rgba(5,5,15,0.9) 70%)` }}>
                        <div className="absolute inset-0 border-r border-white/5" />

                        {/* Big Avatar Preview */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedAvatarId}
                                initial={{ scale: 0.7, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.7, opacity: 0, y: -20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="relative flex flex-col items-center"
                            >
                                {/* Glow ring */}
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full blur-[60px]"
                                    style={{ background: selectedAvatar.glow, width: 280, height: 280, margin: 'auto' }}
                                />
                                <img
                                    src={selectedAvatar.src}
                                    alt={selectedAvatar.label}
                                    className="w-64 h-64 object-contain relative z-10 drop-shadow-2xl"
                                    style={{ filter: `drop-shadow(0 0 40px ${selectedAvatar.color}80)` }}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Avatar name & desc */}
                        <AnimatePresence mode="wait">
                            <motion.div key={selectedAvatarId + "-info"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center mt-6 px-8">
                                <h3 className="font-black text-2xl text-white uppercase tracking-tight">{selectedAvatar.label}</h3>
                                <p className="text-sm text-white/40 mt-1 font-medium leading-relaxed">{selectedAvatar.desc}</p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Decorative stars */}
                        {[...Array(5)].map((_, i) => (
                            <motion.div key={i}
                                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.5 }}
                                className="absolute"
                                style={{ left: `${10 + i * 18}%`, bottom: `${8 + (i % 3) * 6}%` }}
                            >
                                <Star className="w-3 h-3" style={{ color: selectedAvatar.color }} fill="currentColor" />
                            </motion.div>
                        ))}
                    </div>

                    {/* RIGHT PANEL – Steps content */}
                    <div className="flex-1 flex flex-col bg-[#08081a]/95 backdrop-blur-3xl">
                        <AnimatePresence mode="wait">

                            {/* STEP 1 – Welcome */}
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                                    className="flex flex-col items-center justify-center h-full p-10 text-center gap-6">
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="w-20 h-20 rounded-[1.8rem] flex items-center justify-center shadow-2xl"
                                        style={{ background: `linear-gradient(135deg, ${selectedAvatar.color}, #a855f7)`, boxShadow: `0 20px 60px ${selectedAvatar.glow}` }}
                                    >
                                        <Rocket className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em] mb-2">Arg Academy</p>
                                        <h2 className="text-4xl font-black text-white leading-none tracking-tighter">¡BIENVENIDO AL<br /><span style={{ color: selectedAvatar.color }}>UNIVERSO!</span></h2>
                                    </div>
                                    <p className="text-white/50 max-w-sm font-medium leading-relaxed">
                                        Estás a punto de iniciar una aventura increíble en el mundo de la tecnología. 
                                        Primero, elige tu avatar y completa tu perfil.
                                    </p>
                                    <div className="flex items-center gap-3 text-white/30 text-xs font-bold uppercase tracking-widest">
                                        <Zap className="w-4 h-4" />
                                        <span>3 pasos rápidos</span>
                                        <Shield className="w-4 h-4" />
                                        <span>Datos seguros</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: `0 20px 40px ${selectedAvatar.glow}` }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setStep(2)}
                                        className="w-full max-w-xs py-4 rounded-2xl font-black text-white text-lg uppercase tracking-wider flex items-center justify-center gap-3 transition-all"
                                        style={{ background: `linear-gradient(135deg, ${selectedAvatar.color}, #7c3aed)` }}
                                    >
                                        ¡Comenzar! <ChevronRight className="w-5 h-5" />
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* STEP 2 – Avatar selector */}
                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                                    className="flex flex-col justify-center h-full p-8 gap-5">
                                    <div>
                                        <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em] mb-1">Paso 1 de 3</p>
                                        <h2 className="text-3xl font-black text-white tracking-tight">ELIGE TU<br /><span style={{ color: selectedAvatar.color }}>PERSONAJE</span></h2>
                                        <p className="text-white/40 text-sm mt-1">Este será tu avatar en todas tus aventuras</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {AVATARS.map((avatar) => {
                                            const isSelected = selectedAvatarId === avatar.id;
                                            return (
                                                <motion.button
                                                    key={avatar.id}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => setSelectedAvatarId(avatar.id)}
                                                    className="relative p-4 rounded-2xl text-left border transition-all overflow-hidden"
                                                    style={{
                                                        borderColor: isSelected ? avatar.color : 'rgba(255,255,255,0.08)',
                                                        background: isSelected ? `${avatar.glow.replace('0.5', '0.12')}` : 'rgba(255,255,255,0.03)',
                                                        boxShadow: isSelected ? `0 0 30px ${avatar.glow.replace('0.5', '0.2')}` : 'none',
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                                                            style={{ background: avatar.color }}>
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </motion.div>
                                                    )}
                                                    <div className="flex items-center gap-3">
                                                        <img src={avatar.src} alt={avatar.label} className="w-14 h-14 object-contain"
                                                            style={{ filter: isSelected ? `drop-shadow(0 0 12px ${avatar.color})` : 'none' }} />
                                                        <div>
                                                            <p className="font-black text-white text-sm">{avatar.label}</p>
                                                            <p className="text-[10px] text-white/40 mt-0.5 leading-tight line-clamp-2">{avatar.desc}</p>
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <Button variant="ghost" onClick={() => setStep(1)} className="text-white/40 hover:text-white gap-2"><ChevronLeft className="w-4 h-4" />Atrás</Button>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setStep(3)}
                                            className="flex-1 py-4 rounded-2xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2"
                                            style={{ background: `linear-gradient(135deg, ${selectedAvatar.color}, #7c3aed)` }}>
                                            ¡Elegido! <ChevronRight className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3 – Student data */}
                            {step === 3 && (
                                <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                                    className="flex flex-col justify-center h-full p-8 gap-4 overflow-y-auto">
                                    <div>
                                        <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em] mb-1">Paso 2 de 3</p>
                                        <h2 className="text-3xl font-black text-white tracking-tight">TUS <span style={{ color: selectedAvatar.color }}>DATOS</span></h2>
                                        <p className="text-white/40 text-sm mt-1">Información de tu perfil de estudiante</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'N° de Cédula', key: 'identificacion', placeholder: 'Ej: 1712345678' },
                                                { label: 'Edad', key: 'edad', placeholder: 'Ej: 14', type: 'number' },
                                            ].map(f => (
                                                <div key={f.key} className="space-y-1.5">
                                                    <Label className="text-xs font-black text-white/50 uppercase tracking-widest">{f.label}</Label>
                                                    <Input placeholder={f.placeholder} type={f.type || 'text'}
                                                        value={(studentInfo as any)[f.key]}
                                                        onChange={e => setStudentInfo({ ...studentInfo, [f.key]: e.target.value })}
                                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 h-11 rounded-xl" />
                                                </div>
                                            ))}
                                        </div>
                                        {[
                                            { label: 'Fecha de Nacimiento', key: 'fechaNacimiento', type: 'date', placeholder: '' },
                                            { label: 'Unidad Educativa / Institución', key: 'institucion', placeholder: 'Ej: Colegio San Gabriel' },
                                            { label: 'Curso / Grado', key: 'curso', placeholder: 'Ej: 10mo EGB / 2do BGU' },
                                        ].map(f => (
                                            <div key={f.key} className="space-y-1.5">
                                                <Label className="text-xs font-black text-white/50 uppercase tracking-widest">{f.label}</Label>
                                                <Input placeholder={f.placeholder} type={f.type || 'text'}
                                                    value={(studentInfo as any)[f.key]}
                                                    onChange={e => setStudentInfo({ ...studentInfo, [f.key]: e.target.value })}
                                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 h-11 rounded-xl" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => setStep(2)} className="text-white/40 hover:text-white gap-2"><ChevronLeft className="w-4 h-4" />Atrás</Button>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            onClick={() => isStudentStepValid() ? setStep(4) : toast({ title: "Datos incompletos", description: "Completa los campos obligatorios.", variant: "destructive" })}
                                            className="flex-1 py-4 rounded-2xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2"
                                            style={{ background: `linear-gradient(135deg, ${selectedAvatar.color}, #7c3aed)` }}>
                                            Continuar <ChevronRight className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4 – Parent data */}
                            {step === 4 && (
                                <motion.div key="s4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                                    className="flex flex-col justify-center h-full p-8 gap-4">
                                    <div>
                                        <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em] mb-1">Paso 3 de 3</p>
                                        <h2 className="text-3xl font-black text-white tracking-tight">TU <span style={{ color: selectedAvatar.color }}>REPRESENTANTE</span></h2>
                                        <p className="text-white/40 text-sm mt-1">Información de contacto de emergencia</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { label: 'Nombre completo del Padre/Madre', key: 'nombrePadre', placeholder: 'Ej: María Pérez', icon: User },
                                            { label: 'Email del Padre/Madre', key: 'emailPadre', placeholder: 'Ej: maria@gmail.com', type: 'email', icon: Mail },
                                            { label: 'Teléfono / Celular', key: 'celularPadre', placeholder: 'Ej: 0991234567', icon: Phone },
                                            { label: 'Profesión / Lugar de Trabajo', key: 'trabajoPadre', placeholder: 'Ej: Ingeniero Civil', icon: Briefcase },
                                        ].map(f => (
                                            <div key={f.key} className="space-y-1.5">
                                                <Label className="text-xs font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                                                    <f.icon className="w-3 h-3" />{f.label}
                                                </Label>
                                                <Input placeholder={f.placeholder} type={f.type || 'text'}
                                                    value={(parentInfo as any)[f.key]}
                                                    onChange={e => setParentInfo({ ...parentInfo, [f.key]: e.target.value })}
                                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 h-11 rounded-xl" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <Button variant="ghost" onClick={() => setStep(3)} className="text-white/40 hover:text-white gap-2"><ChevronLeft className="w-4 h-4" />Atrás</Button>
                                        <motion.button
                                            whileHover={{ scale: 1.02, boxShadow: `0 20px 40px ${selectedAvatar.glow}` }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={handleFinish}
                                            disabled={isSubmitting}
                                            className="flex-1 py-4 rounded-2xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
                                            style={{ background: `linear-gradient(135deg, #10b981, ${selectedAvatar.color})` }}>
                                            {isSubmitting ? (
                                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                                            ) : (
                                                <><Sparkles className="w-5 h-5" /> ¡COMENZAR AVENTURA!</>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Bottom hint */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 text-xs font-bold uppercase tracking-[0.3em]">
                    Arg Academy · Tu aventura comienza aquí
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

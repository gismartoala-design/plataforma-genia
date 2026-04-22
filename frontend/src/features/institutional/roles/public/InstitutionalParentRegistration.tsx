import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Mail, 
    Phone, 
    Briefcase, 
    Baby, 
    Calendar, 
    GraduationCap, 
    Rocket, 
    CheckCircle2, 
    ArrowRight, 
    Loader2,
    ShieldCheck,
    Download,
    Trophy
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { institutionApi } from '@/services/institution.api';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

export const InstitutionalParentRegistration = ({ params }: { params: { institucionId: string } }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [courseFixedByToken, setCourseFixedByToken] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [completedData, setCompletedData] = useState<any>(null);

    const [formData, setFormData] = useState({
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        parentJob: '',
        studentName: '',
        studentBirthDate: '',
        studentCourseId: '',
        studentRoleId: '10' // Default Estudiante Institucional
    });

    const queryParams = new URLSearchParams(window.location.search);
    const inviteToken = queryParams.get('token');

    useEffect(() => {
        if (params.institucionId) {
            fetchCourses();
        }
        if (inviteToken) {
            validateToken();
        }
    }, [params.institucionId, inviteToken]);

    const validateToken = async () => {
        try {
            const inv = await institutionApi.getInvitation(inviteToken!) as any;
            if (inv && inv.cursoId) {
                setFormData(prev => ({
                    ...prev,
                    studentCourseId: String(inv.cursoId)
                }));
                setCourseFixedByToken(true);
            }
        } catch (error) {
            toast({ title: "Invitación Inválida", description: "El enlace ya fue usado o ha expirado.", variant: "destructive" });
        }
    };

    const fetchCourses = async () => {
        try {
            const data = await institutionApi.getPublicCourses(Number(params.institucionId)) as any[];
            setCourses(data || []);
        } catch (error) {
            console.error("Error fetching courses", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                token: inviteToken || undefined,
                studentData: {
                    nombre: formData.studentName,
                    fechaNacimiento: formData.studentBirthDate,
                    cursoId: Number(formData.studentCourseId),
                    institucionId: Number(params.institucionId),
                    roleId: Number(formData.studentRoleId),
                    nombrePadre: formData.parentName,
                    emailPadre: formData.parentEmail,
                    celularPadre: formData.parentPhone,
                    trabajoPadre: formData.parentJob
                }
            };

            const result = await institutionApi.registerStudentFromParent(payload);
            setCompletedData(result);
            setStep(4);
            toast({
                title: "¡Registro Exitoso!",
                description: "Los datos han sido guardados correctamente."
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo completar el registro. Intente nuevamente.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const renderPassword = (password: string) => {
        const patternRegex = /^[1-9]-[1-9]-[1-9]-[1-9]$/;
        if (patternRegex.test(password)) {
            const icons = [
                { id: '1', emoji: '🐶' }, { id: '2', emoji: '🐱' }, { id: '3', emoji: '🐭' },
                { id: '4', emoji: '🐰' }, { id: '5', emoji: '🦊' }, { id: '6', emoji: '🐻' },
                { id: '7', emoji: '🐼' }, { id: '8', emoji: '🐸' }, { id: '9', emoji: '🐵' },
            ];
            return (
                <div className="flex gap-2 justify-center">
                    {password.split('-').map((id, idx) => (
                        <div key={idx} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/10 shadow-lg">
                            {icons.find(i => i.id === id)?.emoji}
                        </div>
                    ))}
                </div>
            );
        }
        return <span className="text-cyan-400 font-black tracking-widest text-2xl">{password}</span>;
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute inset-0 construction-grid opacity-10" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <ShieldCheck className="w-3 h-3" /> Registro Institucional
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Datos del Tutor</h1>
                                <p className="text-slate-400 text-sm font-medium">Información de contacto oficial para la plataforma</p>
                            </div>

                            <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Nombre Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <Input 
                                                name="parentName" 
                                                value={formData.parentName}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Juan Pérez" 
                                                className="bg-white/5 border-white/10 pl-11 h-12 rounded-2xl text-white placeholder:text-slate-600 focus:ring-indigo-500/50" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Correo Electrónico</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <Input 
                                                name="parentEmail"
                                                value={formData.parentEmail}
                                                onChange={handleInputChange}
                                                placeholder="juan@ejemplo.com" 
                                                className="bg-white/5 border-white/10 pl-11 h-12 rounded-2xl text-white placeholder:text-slate-600 focus:ring-indigo-500/50" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Teléfono / Celular</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <Input 
                                                name="parentPhone"
                                                value={formData.parentPhone}
                                                onChange={handleInputChange}
                                                placeholder="+593 ..." 
                                                className="bg-white/5 border-white/10 pl-11 h-12 rounded-2xl text-white placeholder:text-slate-600 focus:ring-indigo-500/50" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Ocupación / Trabajo</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <Input 
                                                name="parentJob"
                                                value={formData.parentJob}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Ingeniero" 
                                                className="bg-white/5 border-white/10 pl-11 h-12 rounded-2xl text-white placeholder:text-slate-600 focus:ring-indigo-500/50" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <Button 
                                    onClick={handleNext}
                                    disabled={!formData.parentName || !formData.parentEmail}
                                    className="w-full mt-10 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 group"
                                >
                                    Siguiente Paso <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <Baby className="w-3 h-3" /> Perfil del Alumno
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Datos del Estudiante</h1>
                                <p className="text-slate-400 text-sm font-medium">Configuración de la cuenta académica</p>
                            </div>

                            <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Nombre del Estudiante</label>
                                        <div className="relative">
                                            <Baby className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                                            <Input 
                                                name="studentName"
                                                value={formData.studentName}
                                                onChange={handleInputChange}
                                                placeholder="Nombre completo" 
                                                className="bg-white/5 border-white/10 pl-11 h-12 rounded-2xl text-white placeholder:text-slate-600 focus:ring-cyan-500/50" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Fecha de Nacimiento</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                                            <Input 
                                                name="studentBirthDate"
                                                type="date"
                                                value={formData.studentBirthDate}
                                                onChange={handleInputChange}
                                                className="bg-white/5 border-white/10 pl-11 h-12 rounded-2xl text-white focus:ring-cyan-500/50" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Grado / Curso</label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                                            {courseFixedByToken ? (
                                                <div className="w-full bg-white/10 border border-white/20 pl-11 h-12 rounded-2xl text-white flex items-center font-bold text-sm uppercase">
                                                    {courses.find(c => String(c.id) === formData.studentCourseId)?.nombre || 'Cargando curso...'}
                                                </div>
                                            ) : (
                                                <select 
                                                    name="studentCourseId"
                                                    value={formData.studentCourseId}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white/5 border border-white/10 pl-11 h-12 rounded-2xl text-white focus:ring-cyan-500/50 outline-none appearance-none"
                                                >
                                                    <option value="" disabled className="bg-slate-900 text-slate-500">Seleccionar Curso</option>
                                                    {courses.map(c => (
                                                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.nombre}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Tipo de Experiencia</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => setFormData(prev => ({ ...prev, studentRoleId: '6' }))}
                                                className={cn(
                                                    "p-4 rounded-2xl border transition-all text-left",
                                                    formData.studentRoleId === '6' 
                                                        ? "bg-cyan-500/20 border-cyan-500 shadow-lg" 
                                                        : "bg-white/5 border-white/10 grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Rocket className="w-5 h-5 text-cyan-400" />
                                                    <span className="text-xs font-black uppercase">Kids</span>
                                                </div>
                                                <p className="text-[9px] text-slate-400 leading-relaxed font-medium">Gamificación pura con emojis y retos visuales.</p>
                                            </button>
                                            <button 
                                                onClick={() => setFormData(prev => ({ ...prev, studentRoleId: '10' }))}
                                                className={cn(
                                                    "p-4 rounded-2xl border transition-all text-left",
                                                    formData.studentRoleId === '10' 
                                                        ? "bg-indigo-500/20 border-indigo-500 shadow-lg" 
                                                        : "bg-white/5 border-white/10 grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                                                    <span className="text-xs font-black uppercase">Académico</span>
                                                </div>
                                                <p className="text-[9px] text-slate-400 leading-relaxed font-medium">Interface estándar enfocada en proyectos técnicos.</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-10">
                                    <Button variant="ghost" onClick={handleBack} className="h-14 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest">
                                        Atrás
                                    </Button>
                                    <Button 
                                        onClick={handleNext}
                                        disabled={!formData.studentName || !formData.studentCourseId}
                                        className="h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 group"
                                    >
                                        Finalizar <CheckCircle2 className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Confirmar Registro</h1>
                                <p className="text-slate-400 text-sm font-medium">Verifique que toda la información sea correcta</p>
                            </div>

                            <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                                    <ShieldCheck className="w-40 h-40" />
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tutor Responsable</p>
                                            <p className="font-bold text-white uppercase">{formData.parentName}</p>
                                            <p className="text-xs text-slate-400">{formData.parentEmail}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                            <Baby className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Estudiante</p>
                                            <p className="font-bold text-white uppercase">{formData.studentName}</p>
                                            <p className="text-xs text-slate-400">{courses.find(c => c.id === Number(formData.studentCourseId))?.nombre}</p>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-center text-slate-500 italic">Al confirmar, se generarán las credenciales de acceso automáticamente.</p>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <Button variant="ghost" onClick={handleBack} disabled={loading} className="h-14 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest">
                                            Editar
                                        </Button>
                                        <Button 
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar y Crear Cuenta"}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {step === 4 && completedData && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-900/40">
                                    <Trophy className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter uppercase italic text-emerald-400">¡Registro Completado!</h1>
                                <p className="text-slate-400 text-sm font-medium">Guarde sus credenciales de acceso seguro</p>
                            </div>

                            <Card className="bg-[#0F172A] border-emerald-500/30 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center space-y-8 border-2 relative">
                                <div className="absolute top-4 right-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Usuario / Email</p>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-xl text-white">
                                            {completedData.user.email}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Clave de Acceso</p>
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                                            {renderPassword(completedData.password)}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-4">
                                    <p className="text-[11px] font-medium text-slate-400 max-w-sm mx-auto">
                                        Recomendamos tomar una captura de pantalla o anotar estos datos. El tutor recibirá un correo con el manual de uso.
                                    </p>
                                    <div className="flex gap-4">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => window.print()}
                                            className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest"
                                        >
                                            <Download className="w-4 h-4 mr-2" /> Imprimir Ticket
                                        </Button>
                                        <Button 
                                            onClick={() => window.location.href = '/login'}
                                            className="flex-1 h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-200 font-black uppercase text-[10px] tracking-widest"
                                        >
                                            Ir al Login <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

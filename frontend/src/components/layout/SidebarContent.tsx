import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import apiClient from "@/services/api.client";
import {
    Book,
    Trophy,
    Target,
    User,
    Shield,
    Code,
    GraduationCap,
    LogOut,
    Settings,
    Bot,
    Award,
    FileText,
    Cpu,
    ChevronRight,
    Sparkles,
    Store,
    BarChart3,
    Rocket,
    Layout,
    Coins
} from "lucide-react";
import generatedImage from '@/assets/generated_images/arg_academy_logo.png';
import { UserRole } from "@/types/common.types";
import { SkinShopModal } from "@/features/latam/student/components/SkinShopModal";

interface SidebarContentProps {
    currentRole: UserRole;
    onLogout: () => void;
    userPlanId?: number;
    userId?: string;
    onClose?: () => void;
}

const iconMap: Record<string, any> = {
    BookOpen: Book,
    Trophy,
    Code,
    User,
    Bot,
    Award,
    Target,
    Shield,
    Settings,
    GraduationCap,
    Gift: Store,
    Cpu
};

export function SidebarContent({ currentRole, onLogout, userPlanId = 1, userId, onClose }: SidebarContentProps) {
    const [location] = useLocation();
    const [studentLinks, setStudentLinks] = useState<any[]>([]);
    const [geniomonedas, setGeniomonedas] = useState<number | null>(null);
    const [moduleLeaderboard, setModuleLeaderboard] = useState<any[]>([]);
    const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
    const [showShop, setShowShop] = useState(false);

    useEffect(() => {
        if (currentRole === "student" && userPlanId) {
            fetchPlanFeatures();
        }
        if ((currentRole === "student" || currentRole === "estudiante_latam") && userId) {
            fetchGamification();
            fetchInitialModule();
        }
    }, [currentRole, userPlanId, userId]);

    useEffect(() => {
        if (currentModuleId) {
            fetchModuleLeaderboard(currentModuleId);
        }
    }, [currentModuleId]);

    const fetchGamification = async () => {
        try {
            const res = await apiClient.get<any>(`/api/student/${userId}/gamification`);
            setGeniomonedas(res.geniomonedas ?? 0);
        } catch {
            // Silently fail
        }
    };

    const fetchInitialModule = async () => {
        try {
            const modules = await apiClient.get<any[]>(`/api/student/${userId}/modules`);
            if (modules && modules.length > 0) {
                setCurrentModuleId(modules[0].module.id);
            }
        } catch (error) {
            console.error('Error fetching modules for sidebar:', error);
        }
    };

    const fetchModuleLeaderboard = async (moduleId: number) => {
        setIsLoadingLeaderboard(true);
        try {
            const leaderboard = await apiClient.get<any[]>(`/api/student/leaderboard/module/${moduleId}`);
            setModuleLeaderboard(leaderboard);
        } catch (error) {
            console.error('Error fetching module leaderboard:', error);
        } finally {
            setIsLoadingLeaderboard(false);
        }
    };

    const fetchPlanFeatures = async () => {
        // Plan 1 (Genio Digital): Only "Aprender" and "Perfil"
        if (userPlanId === 1) {
            setStudentLinks([
                { href: "/dashboard", icon: Book, label: "Aprender" },
                { href: "/leaderboard", icon: Award, label: "Ranking" },
                { href: "/profile", icon: User, label: "Perfil" }
            ]);
            return;
        }

        // Other plans: Full access
        try {
            const planData = await apiClient.get<any>(`/api/plans/${userPlanId}/features`);
            const links = planData.sidebar.map((item: any) => ({
                href: item.path,
                icon: iconMap[item.icon] || Book,
                label: item.label
            }));
            if (!links.find((l: any) => l.href === '/lab')) {
                links.push({ href: "/lab", icon: Code, label: "Lab de Código" });
            }
            if (!links.find((l: any) => l.href === '/arduino-lab')) {
                links.push({ href: "/arduino-lab", icon: Cpu, label: "Lab Arduino" });
            }
            setStudentLinks(links);
        } catch (error) {
            // Fallback: Full access for all other plans
            setStudentLinks([
                { href: "/dashboard", icon: Book, label: "Aprender" },
                { href: "/achievements", icon: Trophy, label: "Logros" },
                { href: "/leaderboard", icon: Award, label: "Ranking" },
                { href: "/missions", icon: Target, label: "Misiones" },
                { href: "/store", icon: Store, label: "Tienda" },
                { href: "/lab", icon: Code, label: "Lab de Código" },
                { href: "/arduino-lab", icon: Cpu, label: "Lab Arduino" },
                { href: "/profile", icon: User, label: "Perfil" }
            ]);
        }
    };

    const adminLinks = [
        { href: "/admin", icon: Shield, label: "Dashboard" },
        { href: "/admin/users", icon: User, label: "Usuarios" },
        { href: "/admin/modules", icon: Book, label: "Módulos" },
        { href: "/admin/assignments", icon: Target, label: "Asignaciones" },
        { href: "/admin/prizes", icon: Trophy, label: "Premios" },
    ];

    const superadminLinks = adminLinks;

    const professorLinks = [
        { href: "/teach", icon: GraduationCap, label: "Mis Módulos" },
        { href: "/files", icon: FileText, label: "Archivos" },
        { href: "/profile", icon: Settings, label: "Perfil" },
    ];

    const institutionalLinks = [
        { href: "/institucional-dashboard", icon: Shield, label: "Dashboard" },
        { href: "/institucional-dashboard?tab=courses", icon: Book, label: "Cursos" },
        { href: "/institucional-dashboard?tab=students", icon: User, label: "Estudiantes" },
        { href: "/lab", icon: Code, label: "Hub de Labs" },
    ];

    const institutionalProfessorLinks = [
        { href: "/institucional-teach", icon: GraduationCap, label: "Mis Clases" },
        { href: "/lab", icon: Code, label: "Hub de Labs" },
        { href: "/files", icon: FileText, label: "Archivos" },
        { href: "/profile", icon: Settings, label: "Perfil" },
    ];

    const kidsProfessorLinks = [
        { href: "/kids-teach", icon: GraduationCap, label: "Mis Módulos Kids" },
        { href: "/files", icon: FileText, label: "Archivos" },
        { href: "/profile", icon: Settings, label: "Perfil" },
    ];

    const latamProfessorLinks = [
        { href: "/latam-teach", icon: GraduationCap, label: "Centro de Innovación" },
        { href: "/lab", icon: Code, label: "Hub de Labs" },
        { href: "/files", icon: FileText, label: "Archivos" },
        { href: "/profile", icon: Settings, label: "Perfil" },
    ];

    const latamStudentLinks = [
        { href: "/latam-dashboard", icon: Rocket, label: "Mi Trayectoria" },
        { href: "/lab", icon: Code, label: "Hub de Labs" },
        { href: "/profile", icon: User, label: "Perfil" },
    ];

    const links = currentRole === "admin" ? adminLinks :
        currentRole === "superadmin" ? superadminLinks :
            currentRole === "professor" ? professorLinks :
                currentRole === "kids_professor" ? kidsProfessorLinks :
                    currentRole === "institutional_admin" ? institutionalLinks :
                        currentRole === "institutional_professor" ? institutionalProfessorLinks :
                            currentRole === "profesor_latam" ? latamProfessorLinks :
                                currentRole === "estudiante_latam" ? latamStudentLinks :
                                    studentLinks;

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-100 relative">
            {/* SkinShop Modal para todos los estudiantes */}
            {showShop && userId && (
                <div className="fixed inset-0 z-[100]">
                    <SkinShopModal
                        studentId={parseInt(userId)}
                        onClose={() => setShowShop(false)}
                        onSkinEquipped={() => {
                            setShowShop(false);
                            // Refresh logic si es necesario
                        }}
                    />
                </div>
            )}

            {/* Brand Header */}
            <div className="relative h-28 flex items-center px-8 shrink-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
                <div className="flex items-center gap-4 z-10">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-violet-600 rounded-2xl blur-lg opacity-10 group-hover:opacity-20 transition-opacity" />
                        <img src={generatedImage} alt="Logo" className="h-11 w-11 object-contain relative rounded-xl bg-white p-2 border border-slate-100 shadow-xl" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-slate-800 leading-none tracking-tight">ARG</h1>
                        <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">Plataforma Académica</span>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                {links.map((link) => {
                    const isActive = location === link.href;
                    return (
                        <Link key={link.href} href={link.href} onClick={onClose}>
                            <div
                                className={cn(
                                    "group relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 cursor-pointer",
                                    isActive
                                        ? "bg-violet-50 text-violet-700 border border-violet-100 shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg transition-all duration-300",
                                    isActive
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                                        : "bg-white text-slate-400 group-hover:text-violet-600 border border-slate-100 group-hover:border-violet-100 shadow-sm"
                                )}>
                                    <link.icon className="h-4 w-4" />
                                </div>

                                <span className={cn(
                                    "font-bold text-xs tracking-wide transition-colors duration-300",
                                    isActive ? "text-violet-900" : "group-hover:text-slate-900"
                                )}>
                                    {link.label}
                                </span>

                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600 shadow-sm" />
                                )}
                            </div>
                        </Link>
                    );
                })}

                {/* Module Leaderboard Section */}
                {(currentRole === "student" || currentRole === "estudiante_latam") && moduleLeaderboard.length > 0 && (
                    <div className="mt-8 px-5 pb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ranking del Módulo</span>
                            </div>
                            {userPlanId < 3 && (
                                <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-tighter">
                                    Gratis por 7 días
                                </span>
                            )}
                        </div>
                        
                        <div className="space-y-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                            {moduleLeaderboard.map((item, idx) => (
                                <div key={item.studentId} className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0",
                                        idx === 0 ? "bg-amber-100 text-amber-600 border border-amber-200" :
                                        idx === 1 ? "bg-slate-200 text-slate-600 border border-slate-300" :
                                        idx === 2 ? "bg-orange-100 text-orange-600 border border-orange-200" :
                                        "bg-white text-slate-400 border border-slate-100"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <div className="relative shrink-0">
                                        <img 
                                            src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`} 
                                            alt={item.name} 
                                            className="w-7 h-7 rounded-full border border-white shadow-sm"
                                        />
                                        {item.level && (
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-violet-600 rounded-full flex items-center justify-center border border-white">
                                                <span className="text-[7px] text-white font-black">{item.level}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-[10px] font-bold truncate",
                                            item.studentId === parseInt(userId || "0") ? "text-violet-700" : "text-slate-700"
                                        )}>
                                            {item.name}
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-400 leading-none">{item.xp} XP</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Bottom Action Area */}
            <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50 space-y-3">
                {/* Geniomonedas Widget & Skin Store - only for students */}
                {(currentRole === "student" || currentRole === "estudiante_latam") && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 shadow-sm">
                            <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center border border-amber-300/40 shrink-0">
                                <Coins className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-amber-600/70 uppercase tracking-widest leading-none">Geniomonedas</p>
                                <p className="text-base font-black text-amber-700 leading-tight">{geniomonedas ?? 0} <span className="text-[10px] font-bold text-amber-500/70">monedas</span></p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowShop(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black text-[10px] tracking-widest uppercase hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20"
                        >
                            <Store className="w-4 h-4" />
                            Tienda de Skins
                        </button>
                    </div>
                )}

                <button
                    onClick={() => {
                        onLogout();
                        onClose?.();
                    }}
                    className="flex items-center gap-4 w-full px-5 py-4 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-100 transition-all duration-300 font-bold text-[10px] tracking-widest uppercase group bg-white shadow-sm"
                >
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-red-100 group-hover:text-red-600 transition-colors border border-slate-100">
                        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}

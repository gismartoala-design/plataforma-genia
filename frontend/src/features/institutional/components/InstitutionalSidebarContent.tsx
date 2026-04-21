import { useState, useEffect } from 'react';
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
    Book,
    Users,
    Code,
    GraduationCap,
    FileText,
    Settings,
    LogOut,
    LayoutDashboard,
    Activity,
    Globe,
    Gamepad2,
    Rocket,
    BrainCircuit,
    ClipboardList,
    Eye,
    Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { institutionApi } from "@/services/institution.api";
import kidsProfessorApi from "@/features/kids-professor/services/kidsProfessor.api";

interface InstitutionalSidebarContentProps {
    currentRole: "institutional_admin" | "institutional_professor" | "profesor_vista" | "kids_professor" | any;
    onLogout: () => void;
    onClose?: () => void;
}

export function InstitutionalSidebarContent({ currentRole, onLogout, onClose }: InstitutionalSidebarContentProps) {
    const [location] = useLocation();
    const [instLogo, setInstLogo] = useState<string | null>(null);
    const [instName, setInstName] = useState<string | null>(null);
    const [isTutor, setIsTutor] = useState(false);
    const [currentSearch, setCurrentSearch] = useState(window.location.search);
    const [kidsModules, setKidsModules] = useState<any[]>([]);
    const [kidsCourses, setKidsCourses] = useState<any[]>([]);

    useEffect(() => {
        if (currentRole === "kids_professor") {
            const userStr = localStorage.getItem("edu_user");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.id) {
                    kidsProfessorApi.getModules(user.id).then(data => {
                        setKidsModules(data);
                    }).catch(err => console.error("Error fetching kids modules for sidebar", err));

                    import("@/features/professor/services/professor.api").then(({ professorApi }) => {
                        professorApi.getProfessorCourses(user.id).then(data => {
                            setKidsCourses(data || []);
                        });
                    }).catch(err => console.error("Error fetching kids courses for sidebar", err));
                }
            }
        }
    }, [currentRole]);

    useEffect(() => {
        const handleNav = () => setCurrentSearch(window.location.search);
        window.addEventListener('tutor-navigate', handleNav);
        window.addEventListener('popstate', handleNav);
        return () => {
            window.removeEventListener('tutor-navigate', handleNav);
            window.removeEventListener('popstate', handleNav);
        };
    }, []);

    useEffect(() => {
        const loadBranding = () => {
            const userStr = localStorage.getItem("edu_user");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.roleId === 13) setIsTutor(true);
                if (user.institucionId) {
                    // Fetch institution info for branding
                    institutionApi.getAllInstitutions().then((insts: any) => {
                        const myInst = insts.find((i: any) => i.id === user.institucionId);
                        if (myInst) {
                            setInstLogo(myInst.logoUrl);
                            setInstName(myInst.nombre);
                        }
                    });
                }
            }
        };

        loadBranding();
        window.addEventListener('institution-updated', loadBranding);
        return () => window.removeEventListener('institution-updated', loadBranding);
    }, []);

    const adminLinks = [
        { href: "/institucional-dashboard", icon: LayoutDashboard, label: "Vista General" },
        { href: "/institucional-dashboard?tab=courses", icon: Book, label: "Planos (Cursos)" },
        { href: "/institucional-dashboard?tab=students", icon: Users, label: "Usuarios" },
        { href: "/lab", icon: Code, label: "Labs de Innovación" },
        { href: "/institucional-notas", icon: ClipboardList, label: "Notas" },
        { href: "/profile", icon: Settings, label: "Configuración" },
    ];

    const professorLinks = [
        { href: "/institucional-teach", icon: GraduationCap, label: "Mis Sectores" },
        { href: "/lab", icon: Code, label: "Laboratorios" },
        { href: "/files", icon: FileText, label: "Archivos" },
        { href: "/institucional-notas", icon: ClipboardList, label: "Notas" },
        { href: "/profile", icon: Settings, label: "Perfil" },
    ];

    const tutorLinks = [
        { href: "/institucional-tutor", icon: Eye, label: "Seguimiento" },
        { href: "/institucional-tutor?view=sectores", icon: Shield, label: "Mis Sectores" },
        { href: "/institucional-tutor?view=calificaciones", icon: ClipboardList, label: "Calificaciones" },
        { href: "/institucional-tutor?view=usuarios", icon: Users, label: "Usuarios y Claves" },
        { href: "/profile", icon: Settings, label: "Perfil" },
    ];

    const studentLinks = [
        { href: "/city-dashboard", icon: LayoutDashboard, label: "Metrópolis Neo-Bot" },
        { href: "/lab", icon: Code, label: "Laboratorios" },
        { href: "/profile", icon: Settings, label: "Mi Perfil" },
    ];

    const kidsProfessorLinks = [
        { href: "/kids-teach", icon: LayoutDashboard, label: "Laboratorio Kids" },
        { href: "/profile", icon: Settings, label: "Ajustes de Perfil" }
    ];

    const links = (isTutor || currentRole === "tutor") ? tutorLinks :
        currentRole === "institutional_admin" ? adminLinks :
            (currentRole === "institutional_professor" || currentRole === "profesor_vista") ? professorLinks :
                currentRole === "kids_professor" ? kidsProfessorLinks :
                    studentLinks;

    return (
        <div className="flex flex-col h-full bg-transparent text-white border-r border-white/5 relative z-10">
            {/* Elegant Header */}
            <div className="relative h-28 flex items-center px-8 shrink-0 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-white/20 overflow-hidden">
                        {instLogo ? (
                            <img src={instLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--inst-blue)] to-[var(--inst-cyan)] flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none truncate max-w-[140px]">
                            {instName || "Genia."}
                        </h1>
                        <div className="flex items-center gap-2 mt-1.5 opacity-80">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--inst-emerald)] animate-pulse shadow-[0_0_8px_var(--inst-emerald)]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--inst-blue-lt)]">Lab Activo</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Navigation Links */}
            <nav className="flex-1 px-5 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="px-3 mb-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Menú Principal</span>
                </div>
                {links.map((link) => {
                    const isTutorLink = (isTutor || currentRole === 'tutor') && link.href.includes('institucional-tutor');
                    const isActive = isTutorLink
                        ? (window.location.pathname + currentSearch) === link.href ||
                        (link.href === '/institucional-tutor' && !currentSearch && window.location.pathname === '/institucional-tutor')
                        : location === link.href;

                    const handleTutorNav = (e: React.MouseEvent) => {
                        if (!isTutorLink) return;
                        e.preventDefault();
                        window.history.pushState(null, '', link.href);
                        window.dispatchEvent(new CustomEvent('tutor-navigate'));
                        onClose?.();
                    };

                    return isTutorLink ? (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={handleTutorNav}
                            style={{ textDecoration: 'none' }}
                        >
                            <div
                                className={cn(
                                    "group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden",
                                    isActive
                                        ? "bg-[var(--inst-blue)]/20 text-white shadow-inner border border-[var(--inst-blue)]/50"
                                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <link.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-[var(--inst-cyan)]" : "group-hover:text-[var(--inst-blue-lt)]")} />
                                <span className="font-bold text-[10px] uppercase tracking-widest">
                                    {link.label}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--inst-cyan)] shadow-[0_0_8px_var(--inst-cyan)]" />
                                )}
                            </div>
                        </a>
                    ) : (
                        <Link key={link.href} href={link.href} onClick={onClose}>
                            <div
                                className={cn(
                                    "group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden",
                                    isActive
                                        ? "bg-[var(--inst-blue)]/20 text-white shadow-inner border border-[var(--inst-blue)]/50"
                                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <link.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-[var(--inst-cyan)]" : "group-hover:text-[var(--inst-blue-lt)]")} />
                                <span className="font-bold text-[10px] uppercase tracking-widest">
                                    {link.label}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--inst-cyan)] shadow-[0_0_8px_var(--inst-cyan)]" />
                                )}
                            </div>
                        </Link>
                    );
                })}

                {/* Lab Hub Section */}
                {!(currentRole === "institutional_admin" || currentRole === "institutional_professor" || currentRole === "profesor_vista" || isTutor || currentRole === "tutor" || currentRole === "kids_professor") && (
                    <>
                        <div className="pt-8 px-3 mb-4">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Laboratorios</span>
                        </div>
                        {[
                            { href: "/lab", icon: Code, label: "Laboratorio Python" },
                            { href: "/lab-arduino", icon: Activity, label: "Laboratorio Arduino" },
                            { href: "/lab-web", icon: Globe, label: "Constructor Web" },
                            { href: "/lab-minecraft", icon: Gamepad2, label: "Mundo Minecraft" },
                            { href: "/lab-chatbot", icon: BrainCircuit, label: "Asistente AI" },
                            { href: "/lab-qa", icon: Rocket, label: "Laboratorio QA" },
                        ].map((lab) => {
                            const isActive = location === lab.href;
                            return (
                                <Link key={lab.href} href={lab.href} onClick={onClose}>
                                    <div className={cn(
                                        "group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer border",
                                        isActive ? "bg-[var(--inst-blue)]/20 text-white border-[var(--inst-blue)]/50" : "text-slate-400 hover:bg-white/5 hover:text-white border-transparent"
                                    )}>
                                        <lab.icon className={cn("h-4 w-4 transition-all opacity-70", isActive ? "opacity-100 text-[var(--inst-cyan)]" : "group-hover:opacity-100 group-hover:text-[var(--inst-blue-lt)] group-hover:scale-110")} />
                                        <span className="font-bold text-[9px] uppercase tracking-widest leading-none">
                                            {lab.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Assistant Control */}
            {!(currentRole === "institutional_admin" || currentRole === "institutional_professor" || currentRole === "profesor_vista" || isTutor || currentRole === "tutor" || currentRole === "kids_professor") && (
                <div className="px-5 py-4 space-y-2 border-t border-white/5">
                    <button
                        onClick={() => {
                            localStorage.removeItem('arg_hide_owl');
                            window.location.reload();
                        }}
                        className="flex items-center justify-center gap-3 w-full px-5 py-3.5 rounded-xl text-slate-300 hover:bg-[var(--inst-blue)]/20 hover:text-white transition-all duration-300 font-bold text-[9px] tracking-widest uppercase group border border-dashed border-white/20 hover:border-[var(--inst-cyan)]/50"
                    >
                        <BrainCircuit className="h-4 w-4 text-[var(--inst-cyan)] group-hover:scale-110 transition-transform" />
                        <span>Reactivar AI</span>
                    </button>
                </div>
            )}

            {/* Bottom Logistics Footer */}
            <div className="p-5 border-t border-white/5 bg-white/5 backdrop-blur-md">
                <button
                    onClick={() => {
                        onLogout();
                        onClose?.();
                    }}
                    className="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-xl text-slate-300 hover:bg-red-500/20 hover:text-red-300 border border-transparent hover:border-red-500/30 transition-all duration-300 font-black text-[10px] tracking-widest uppercase group shadow-sm bg-black/10"
                >
                    <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}

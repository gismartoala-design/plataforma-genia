import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Eye, 
  EyeOff,
  UserCheck,
  Building2,
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  Fingerprint,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { institutionApi } from '@/services/institution.api';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

interface TutorUserListProps {
    institutionId: number;
}

export function InstitutionalTutorUserList({ institutionId }: TutorUserListProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (institutionId) fetchUsers();
    }, [institutionId]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await institutionApi.getInstitutionalUsers(institutionId) as any[];
            setUsers(data || []);
        } catch (error) {
            toast({
                title: "Error al cargar usuarios",
                description: "No se pudieron obtener los usuarios de la institución.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const togglePassword = (userId: number) => {
        setShowPasswords(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    // Only show students — exclude admin, teacher, and tutor accounts
    const STUDENT_ROLE_IDS = [3, 6, 10, 11];
    const filteredUsers = users.filter(u => 
        STUDENT_ROLE_IDS.includes(u.roleId) &&
        (u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const renderPassword = (password: string) => {
        const patternRegex = /^[1-9]-[1-9]-[1-9]-[1-9]$/;
        if (patternRegex && patternRegex.test(password)) {
            const icons = [
                { id: '1', emoji: '🐶' },
                { id: '2', emoji: '🐱' },
                { id: '3', emoji: '🐭' },
                { id: '4', emoji: '🐰' },
                { id: '5', emoji: '🦊' },
                { id: '6', emoji: '🐻' },
                { id: '7', emoji: '🐼' },
                { id: '8', emoji: '🐸' },
                { id: '9', emoji: '🐵' },
            ];
            const ids = password.split('-');
            return (
                <div className="flex gap-2">
                    {ids.map((id, idx) => (
                        <div key={idx} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/5">
                            {icons.find(i => i.id === id)?.emoji || '?'}
                        </div>
                    ))}
                </div>
            );
        }
        return <span className="text-blue-400 font-bold tracking-widest">{password}</span>;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[var(--inst-cyan)] animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultando Protocolos de Acceso...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-[#0F172A] border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 construction-grid opacity-10 pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-cyan-900/40 flex items-center justify-center text-white">
                        <Fingerprint className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Gestión de Accesos</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Directorio de Credenciales Institucionales</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                        <Input 
                            placeholder="Buscar usuario o email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-12 w-full md:w-80 bg-white/5 border-white/10 rounded-2xl text-white font-bold text-xs placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500 transition-all"
                        />
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={fetchUsers}
                        className="h-12 w-12 rounded-2xl bg-white/5 border-white/10 p-0 flex items-center justify-center hover:bg-white/10 transition-all text-white"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* User Matrix */}
            <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl mb-10">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Identidad Digital</th>
                                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Email</th>
                                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Privilegios</th>
                                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {filteredUsers.map((u, idx) => (
                                <motion.tr 
                                    key={u.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="group hover:bg-white/[0.02] transition-all duration-300"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-white group-hover:bg-cyan-600 transition-all duration-500 shadow-inner">
                                                {u.nombre?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-black text-sm text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors uppercase">{u.nombre}</div>
                                                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Socio ID: EDU-{u.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-white transition-colors">
                                            <Mail className="w-3.5 h-3.5 text-cyan-500" />
                                            <span className="text-xs font-medium">{u.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border", 
                                            'border-cyan-500/30 text-cyan-400 bg-cyan-500/5'
                                        )}>
                                            Estudiante
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {u.activo ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">En Línea</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inactivo</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

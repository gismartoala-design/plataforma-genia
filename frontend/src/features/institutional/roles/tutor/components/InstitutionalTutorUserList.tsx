import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Eye, 
  EyeOff,
  UserCheck,
  Building2,
  Mail,
  Lock,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { institutionApi } from '@/services/institution.api';
import { toast } from '@/hooks/use-toast';

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

    const filteredUsers = users.filter(u => 
        u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderPassword = (password: string) => {
        // Pattern check: 1-2-3-4 format
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
                <div className="flex gap-1">
                    {ids.map((id, idx) => (
                        <span key={idx} className="text-lg" title={`Icono ${id}`}>
                            {icons.find(i => i.id === id)?.emoji || '?'}
                        </span>
                    ))}
                </div>
            );
        }
        return password;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-100">
                <Loader2 className="w-10 h-10 text-[var(--inst-blue)] animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Consultando Base de Datos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 edu-enter">
            <Card className="blueprint-card overflow-hidden">
                <CardHeader className="pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--inst-blue-lt)] text-[var(--inst-blue)] flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black uppercase tracking-tight">Directorio de Usuarios</CardTitle>
                                <p className="technical-label">Consulta de credenciales y perfiles institucionales</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input 
                                placeholder="Buscar por nombre o email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-white border-slate-100 rounded-xl focus:ring-[var(--inst-blue)]"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="border rounded-2xl overflow-hidden bg-white shadow-sm border-slate-100">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Nombre del Usuario</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Credenciales (Email)</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Rol</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Llave de Acceso (Clave)</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((u) => (
                                    <TableRow key={u.id} className="hover:bg-blue-50/20 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                                    {u.nombre?.substring(0, 2)}
                                                </div>
                                                <span className="font-bold text-sm text-[var(--inst-deep)]">{u.nombre}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                <Mail className="w-3 h-3" />
                                                {u.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest">
                                                {u.roleId === 10 || u.roleId === 3 ? 'Estudiante' : 
                                                 u.roleId === 9 || u.roleId === 2 ? 'Profesor' : 
                                                 u.roleId === 13 ? 'Tutor' : 'Administrador'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="min-w-[100px] font-mono text-sm tracking-wider">
                                                    {showPasswords[u.id] ? (
                                                        <div className="flex items-center gap-2">
                                                            {renderPassword(u.password)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300">••••••••</span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => togglePassword(u.id)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                                                >
                                                    {showPasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {u.activo ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[8px] font-black uppercase">Activo</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="px-2 py-0.5 text-[8px] font-black uppercase">Inactivo</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                                            No se encontraron usuarios con ese criterio
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

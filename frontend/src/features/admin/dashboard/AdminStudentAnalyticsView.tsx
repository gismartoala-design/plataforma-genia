import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Search,
    Users,
    Activity,
    Contact,
    Mail,
    Phone,
    Briefcase,
    CheckCircle2,
    Clock,
    ArrowRight,
    TrendingUp,
    FileDown,
    Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { adminApi } from "../services/admin.api";
import { institutionApi } from "@/services/institution.api";
import { User, ModuleWithStats } from "../types/admin.types";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AdminStudentAnalyticsView() {
    const [students, setStudents] = useState<User[]>([]);
    const [modules, setModules] = useState<ModuleWithStats[]>([]);
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned' | 'unassigned'>('assigned');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [moduleFilter, setModuleFilter] = useState<string>("all");
    const [institutionFilter, setInstitutionFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<'name' | 'connection' | 'levels' | 'missions'>('connection');
    
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [showParentDialog, setShowParentDialog] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [studentsData, modulesData, instsData] = await Promise.all([
                adminApi.getSystemStudents(),
                adminApi.getAllModulesWithStats(),
                institutionApi.getAllInstitutions()
            ]);
            setStudents(studentsData);
            setModules(modulesData);
            setInstitutions(instsData as any[]);
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos analíticos",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter((s) => {
        const matchesSearch =
            (s.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.identificacion || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAssignment =
            assignmentFilter === "all" ||
            (assignmentFilter === "assigned" && s.estaAsignado) ||
            (assignmentFilter === "unassigned" && !s.estaAsignado);

        const matchesModule = 
            moduleFilter === "all" || 
            (s.modulosAsignados && s.modulosAsignados.some(m => m === moduleFilter));

        const matchesInstitution = 
            institutionFilter === "all" || 
            String(s.institucionId) === institutionFilter;

        const matchesStatus = 
            statusFilter === "all" || 
            (statusFilter === "active" && s.activo) || 
            (statusFilter === "inactive" && !s.activo);

        return matchesSearch && matchesAssignment && matchesModule && matchesInstitution && matchesStatus;
    }).sort((a, b) => {
        if (sortBy === 'name') return (a.nombre || '').localeCompare(b.nombre || '');
        if (sortBy === 'levels') return (b.nivelesCompletados || 0) - (a.nivelesCompletados || 0);
        if (sortBy === 'missions') return (b.misionesCompletadas || 0) - (a.misionesCompletadas || 0);
        if (sortBy === 'connection') {
            const dateA = a.ultimaConexion ? new Date(a.ultimaConexion).getTime() : 0;
            const dateB = b.ultimaConexion ? new Date(b.ultimaConexion).getTime() : 0;
            return dateB - dateA;
        }
        return 0;
    });

    const openParentDetails = (student: User) => {
        setSelectedStudent(student);
        setShowParentDialog(true);
    };

    const exportToExcel = () => {
        const dataToExport = filteredStudents.map(s => ({
            "Nombre": s.nombre,
            "ID/Identificación": s.identificacion || "N/A",
            "Email": s.email || "N/A",
            "Plan": s.planId === 3 ? 'Pro' : s.planId === 2 ? 'Digital' : 'Básico',
            "Última Conexión": s.ultimaConexion ? new Date(s.ultimaConexion).toLocaleString() : "NUNCA",
            "Niveles Completados (Únicos)": s.nivelesCompletados || 0,
            "Misiones Completadas": s.misionesCompletadas || 0,
            "Módulos Asignados": s.modulosAsignados?.join(", ") || "Ninguno",
            "Asignado": s.estaAsignado ? "SÍ" : "NO",
            "Nombre Representante": s.nombrePadre || "N/A",
            "Email Representante": s.emailPadre || "N/A",
            "Celular Representante": s.celularPadre || "N/A",
            "Trabajo Representante": s.trabajoPadre || "N/A"
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");

        const date = new Date().toISOString().split('T')[0];
        const filename = `Reporte_Estudiantes_${assignmentFilter.toUpperCase()}_${date}.xlsx`;

        XLSX.writeFile(workbook, filename);

        toast({
            title: "Exportación exitosa",
            description: `Se ha descargado el archivo: ${filename}`,
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600 mb-4"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Analizando Datos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Search & Header Section */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 items-center flex-1 w-full">
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-fuchsia-500" />
                            <Input
                                placeholder="Filtrar por nombre o identificación..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 h-12 rounded-2xl bg-white border-slate-200 shadow-sm focus:ring-fuchsia-500/20"
                            />
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
                            <button
                                onClick={() => setAssignmentFilter("assigned")}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black transition-all",
                                    assignmentFilter === "assigned"
                                        ? "bg-white text-fuchsia-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                ASIGNADOS
                            </button>
                            <button
                                onClick={() => setAssignmentFilter("unassigned")}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black transition-all",
                                    assignmentFilter === "unassigned"
                                        ? "bg-white text-fuchsia-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                SIN ASIGNAR
                            </button>
                            <button
                                onClick={() => setAssignmentFilter("all")}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black transition-all",
                                    assignmentFilter === "all"
                                        ? "bg-white text-fuchsia-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                TODOS
                            </button>
                        </div>

                        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                            <SelectTrigger className="w-full md:w-[160px] h-12 rounded-2xl">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Ver Todos</SelectItem>
                                <SelectItem value="active">Solo Activos</SelectItem>
                                <SelectItem value="inactive">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={moduleFilter} onValueChange={setModuleFilter}>
                            <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl">
                                <SelectValue placeholder="Módulo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Módulos</SelectItem>
                                {modules.map(m => (
                                    <SelectItem key={m.id} value={m.nombreModulo}>{m.nombreModulo}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                            <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl">
                                <SelectValue placeholder="Institución" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Inst.</SelectItem>
                                {institutions.map(i => (
                                    <SelectItem key={i.id} value={String(i.id)}>{i.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto justify-end">
                        <Button
                            onClick={exportToExcel}
                            disabled={filteredStudents.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-2xl px-6 font-black italic gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                        >
                            <FileDown className="w-5 h-5" />
                            EXPORTAR
                        </Button>

                        <Card className="bg-fuchsia-50/50 border-fuchsia-100 flex items-center px-4 py-2 gap-3 rounded-2xl hidden sm:flex">
                            <Users className="w-5 h-5 text-fuchsia-600" />
                            <div>
                                <p className="text-[10px] font-black text-fuchsia-400 uppercase leading-none">Viendo</p>
                                <p className="text-xl font-black text-fuchsia-700">{filteredStudents.length}</p>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Ordenar por:</span>
                    {[
                        { id: 'connection', label: 'MÁS RECIENTES', icon: Clock },
                        { id: 'levels', label: 'MAYOR Nivel', icon: TrendingUp },
                        { id: 'missions', label: 'MISIONES', icon: Award },
                        { id: 'name', label: 'NOMBRE', icon: Contact },
                    ].map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => setSortBy(item.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all border",
                                sortBy === item.id 
                                    ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-lg shadow-fuchsia-100" 
                                    : "bg-white text-slate-500 border-slate-100 hover:border-fuchsia-200"
                            )}
                        >
                            <item.icon className="w-3 h-3" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Table Container */}
            <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] bg-white/80 backdrop-blur-xl">
                <CardHeader className="p-8 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-950 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Reporte Detallado</CardTitle>
                            <CardDescription className="font-bold text-slate-400">Progreso académico y datos de contacto de representantes.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100 h-16">
                                <TableHead className="pl-8 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Estudiante / Módulo</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center">Conexión</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center">Progreso Único</TableHead>
                                <TableHead className="pr-8 text-slate-500 font-bold uppercase text-[10px] tracking-widest text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <TableRow key={student.id} className="h-20 hover:bg-fuchsia-50/30 border-slate-50 transition-colors group">
                                    <TableCell className="pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-fuchsia-100 group-hover:text-fuchsia-600 transition-colors">
                                                    {(student.nombre || '?')[0]}
                                                </div>
                                                {student.ultimaConexion && (new Date().getTime() - new Date(student.ultimaConexion).getTime() < 300000) && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" title="Online ahora" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 leading-tight">{student.nombre}</p>
                                                <div className="flex gap-1.5 mt-0.5">
                                                    {student.modulosAsignados && student.modulosAsignados.length > 0 ? (
                                                        student.modulosAsignados.map((m, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-[8px] h-4 border-slate-100 text-slate-500 font-bold">
                                                                {m}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-300 italic">Sin asignar</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <p className="text-xs font-black text-slate-700">
                                                {student.ultimaConexion ? new Date(student.ultimaConexion).toLocaleDateString() : 'NUNCA'}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 leading-none">
                                                {student.ultimaConexion ? new Date(student.ultimaConexion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-black text-slate-800">{student.nivelesCompletados || 0}</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase leading-none">NIVELES</span>
                                            </div>
                                            <div className="w-px h-6 bg-slate-200" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-black text-slate-800">{student.misionesCompletadas || 0}</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase leading-none">MISIONES</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <Button
                                            variant="ghost"
                                            onClick={() => openParentDetails(student)}
                                            className="group/btn h-10 px-4 rounded-xl font-bold gap-2 text-fuchsia-600 hover:bg-fuchsia-600 hover:text-white transition-all scale-95 hover:scale-100"
                                        >
                                            <Contact className="w-4 h-4" />
                                            VER DATOS
                                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredStudents.length === 0 && (
                        <div className="py-20 text-center">
                            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold italic">No se encontraron estudiantes con ese criterio.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Parent Details Dialog */}
            <Dialog open={showParentDialog} onOpenChange={setShowParentDialog}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-fuchsia-600 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
                        <DialogTitle className="text-2xl font-black italic tracking-tight uppercase leading-none mb-2">Representante Legal</DialogTitle>
                        <p className="text-fuchsia-100 text-xs font-bold uppercase tracking-widest">{selectedStudent?.nombre}</p>
                    </div>

                    <div className="p-8 space-y-6 bg-white">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-fuchsia-50 rounded-2xl group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                                    <Contact className="w-5 h-5 text-fuchsia-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Nombre Completo</p>
                                    <p className="text-lg font-black text-slate-800">{selectedStudent?.nombrePadre || 'No registrado'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-fuchsia-50 rounded-2xl group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                                    <Mail className="w-5 h-5 text-fuchsia-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Email del Padre</p>
                                    <p className="text-lg font-black text-slate-800">{selectedStudent?.emailPadre || 'Sin correo'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-fuchsia-50 rounded-2xl group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                                    <Phone className="w-5 h-5 text-fuchsia-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Celular de Contacto</p>
                                    <p className="text-lg font-black text-slate-800">{selectedStudent?.celularPadre || 'No registrado'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-fuchsia-50 rounded-2xl group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                                    <Briefcase className="w-5 h-5 text-fuchsia-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Ocupación / Empresa</p>
                                    <p className="text-lg font-black text-slate-800">{selectedStudent?.trabajoPadre || 'No registrado'}</p>
                                </div>
                            </div>
                        </div>

                        <Button onClick={() => setShowParentDialog(false)} className="w-full bg-slate-900 hover:bg-black h-14 rounded-2xl font-black italic tracking-widest text-sm uppercase transition-all shadow-xl shadow-slate-200">
                            Cerrar Expediente
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

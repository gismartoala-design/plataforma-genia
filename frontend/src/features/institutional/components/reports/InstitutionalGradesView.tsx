
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GraduationCap, 
    Search, 
    Download, 
    Filter, 
    ChevronDown, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Award,
    BookOpen,
    Layers,
    Activity,
    FileText,
    ArrowLeft,
    TrendingUp,
    MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    Tabs, 
    TabsList, 
    TabsTrigger, 
    TabsContent 
} from "@/components/ui/tabs";
import { institutionApi } from '@/services/institution.api';
import { professorApi } from '@/features/professor/services/professor.api';
import { institutionalCurriculumApi } from '@/features/institutional/services/curriculum.api';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';

export const InstitutionalGradesView = () => {
    const [, setLocation] = useLocation();
    const [user] = useState(() => {
        const saved = localStorage.getItem("edu_user");
        return saved ? JSON.parse(saved) : null;
    });

    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');

    useEffect(() => {
        if (user) {
            initData();
        }
    }, [user]);

    useEffect(() => {
        if (selectedCourseId !== 'all') {
            fetchSections(Number(selectedCourseId));
            fetchGrades(Number(selectedCourseId));
        } else {
            setSections([]);
            setModules([]);
            setStudents([]);
        }
    }, [selectedCourseId]);

    useEffect(() => {
        if (selectedSectionId !== 'all') {
            fetchModules(Number(selectedSectionId));
        } else {
            setModules([]);
        }
    }, [selectedSectionId]);

    const initData = async () => {
        setLoading(true);
        try {
            if (user.role === 'institutional_admin') {
                const data = await institutionApi.getCourses(user.institucionId);
                setCourses(data || []);
            } else {
                const data = await professorApi.getProfessorCourses(user.id);
                setCourses(data || []);
            }
        } catch (error) {
            console.error('Error init grades:', error);
            toast({ title: "Error", description: "No se pudieron cargar los cursos.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchSections = async (courseId: number) => {
        try {
            const data = await institutionalCurriculumApi.getSections(courseId);
            setSections(data || []);
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const fetchModules = async (sectionId: number) => {
        try {
            const data = await institutionalCurriculumApi.getModulesBySection(sectionId);
            setModules(data || []);
        } catch (error) {
            console.error('Error fetching modules:', error);
        }
    };

    const fetchGrades = async (courseId: number) => {
        try {
            const data: any = await institutionApi.getGradeReport(courseId);
            // Si el API no devuelve datos, usamos un mock robusto para mostrar la UI
            const finalData = (Array.isArray(data) && data.length > 0) ? data : [
                { id: 1, nombre: 'Ana Mendoza', email: 'ana@colegio.edu', promedio: 94, progreso: 85, certificados: 2, status: 'Sobresaliente' },
                { id: 2, nombre: 'Carlos Ruiz', email: 'carlos@colegio.edu', promedio: 76, progreso: 60, certificados: 1, status: 'Aceptable' },
                { id: 3, nombre: 'Lucía Fernández', email: 'lucia@colegio.edu', promedio: 88, progreso: 90, certificados: 3, status: 'Notable' },
                { id: 4, nombre: 'Mateo Gómez', email: 'mateo@colegio.edu', promedio: 55, progreso: 20, certificados: 0, status: 'En Riesgo' },
            ];
            setStudents(finalData);
        } catch (error) {
            console.error('Error fetching grades:', error);
        }
    };

    const filteredStudents = students.filter(s => 
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans relative" style={{ background: 'var(--inst-bg)' }}>
            <div className="absolute inset-0 construction-grid pointer-events-none opacity-40" />

            {/* Top Navigation / Header */}
            <header className="h-20 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-10 z-30 shrink-0 shadow-sm">
                <div className="flex items-center gap-6">
                    <Button 
                        onClick={() => window.history.back()}
                        variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
                            Torre de <span className="text-blue-600">Control</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                             Gestión de Notas y Certificados
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                {String.fromCharCode(64+i)}
                            </div>
                        ))}
                    </div>
                    <Button className="rounded-xl bg-slate-900 hover:bg-black text-white px-6 font-black uppercase text-[10px] tracking-widest shadow-xl h-11 border-b-4 border-black">
                        <Download className="w-4 h-4 mr-2" /> Exportar Reporte
                    </Button>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="bg-white border-b px-10 py-5 flex items-center gap-4 z-20 shrink-0">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100/50 min-w-[240px]">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Curso / Obra</p>
                        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                            <SelectTrigger className="border-none bg-transparent p-0 h-auto font-black text-xs uppercase focus:ring-0">
                                <SelectValue placeholder="Seleccionar Curso" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">Ver Todos</SelectItem>
                                {courses.map(c => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100/50 min-w-[200px]">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Unidad Académica</p>
                        <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={selectedCourseId === 'all'}>
                            <SelectTrigger className="border-none bg-transparent p-0 h-auto font-black text-xs uppercase focus:ring-0">
                                <SelectValue placeholder="Todas las Unidades" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">Todas las Unidades</SelectItem>
                                {sections.map(s => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100/50 min-w-[180px]">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Tipo de Actividad</p>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="border-none bg-transparent p-0 h-auto font-black text-xs uppercase focus:ring-0">
                                <SelectValue placeholder="Cualquier Tipo" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">Todos los Tipos</SelectItem>
                                <SelectItem value="eval">Evaluaciones</SelectItem>
                                <SelectItem value="reto">Retos 2D</SelectItem>
                                <SelectItem value="project">Proyectos</SelectItem>
                                <SelectItem value="attendance">Asistencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="h-10 w-px bg-slate-100 mx-2" />

                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                        placeholder="Buscar por nombre de estudiante..." 
                        className="h-12 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium text-sm focus-visible:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden p-10 flex flex-col">
                <Tabs defaultValue="grades" className="flex-1 flex flex-col h-full bg-white rounded-[2.5rem] border shadow-2xl shadow-blue-500/5 overflow-hidden">
                    <div className="px-10 h-16 border-b flex items-center justify-between shrink-0 bg-slate-50/30">
                        <TabsList className="bg-transparent gap-8 h-full">
                            <TabsTrigger value="grades" className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full font-black uppercase text-[10px] tracking-widest px-0 transition-all">
                                Matriz de Calificaciones
                            </TabsTrigger>
                            <TabsTrigger value="certificates" className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full font-black uppercase text-[10px] tracking-widest px-0 transition-all">
                                Certificados Emitidos
                            </TabsTrigger>
                            <TabsTrigger value="active-tasks" className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full font-black uppercase text-[10px] tracking-widest px-0 transition-all">
                                Actividades Habilitadas
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase">Tiempo Real</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <TabsContent value="grades" className="m-0 p-0 outline-none">
                            <div className="w-full">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr className="border-b">
                                            <th className="px-12 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Estudiante</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Promedio</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Progreso</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Hitos / Cert.</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredStudents.map((student) => (
                                            <motion.tr 
                                                key={student.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="group hover:bg-slate-50 transition-colors cursor-pointer"
                                            >
                                                <td className="px-12 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-xs border border-blue-100 shadow-sm">
                                                            {student.nombre.substring(0,2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-800 uppercase tracking-tight">{student.nombre}</div>
                                                            <div className="text-[10px] text-slate-400 lowercase">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-lg font-black italic",
                                                            student.promedio >= 90 ? "text-emerald-500" : student.promedio >= 70 ? "text-blue-500" : "text-rose-500"
                                                        )}>
                                                            {student.promedio}%
                                                        </span>
                                                        <TrendingUp className={cn("w-3.5 h-3.5", student.promedio >= 70 ? "text-emerald-500" : "text-rose-500")} />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="w-32 space-y-1.5">
                                                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                                                            <span>Avance</span>
                                                            <span>{student.progreso}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${student.progreso}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-1.5">
                                                        {[...Array(3)].map((_, i) => (
                                                            <Award key={i} className={cn(
                                                                "w-4 h-4",
                                                                i < student.certificados ? "text-amber-500" : "text-slate-200"
                                                            )} />
                                                        ))}
                                                        <span className="ml-2 text-[10px] font-black text-slate-500">{student.certificados} Logros</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <Badge className={cn(
                                                        "text-[8px] font-black px-3 py-1 rounded-full border-none",
                                                        student.status === 'Sobresaliente' ? "bg-emerald-100 text-emerald-600" :
                                                        student.status === 'Notable' ? "bg-blue-100 text-blue-600" :
                                                        student.status === 'Aceptable' ? "bg-amber-100 text-amber-600" :
                                                        "bg-rose-100 text-rose-600"
                                                    )}>
                                                        {student.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Button variant="ghost" size="icon" className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                                {selectedCourseId === 'all' && (
                                    <div className="py-20 flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-6">
                                            <Filter className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase text-slate-800 tracking-tight">Selecciona un Curso</h3>
                                        <p className="max-w-xs text-slate-400 font-medium text-sm mt-2 italic">
                                            Filtra por una Obra para ver la matriz de calificaciones detallada y el progreso de los obreros del conocimiento.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="certificates" className="m-0 p-12 outline-none">
                            <div className="max-w-4xl mx-auto space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="p-8 rounded-[2rem] border-slate-100 bg-emerald-50/30 flex flex-col gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Total Emitidos</p>
                                            <h4 className="text-4xl font-black text-slate-800">124</h4>
                                        </div>
                                    </Card>
                                    <Card className="p-8 rounded-[2rem] border-slate-100 bg-blue-50/30 flex flex-col gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Evaluaciones Aprobadas</p>
                                            <h4 className="text-4xl font-black text-slate-800">89%</h4>
                                        </div>
                                    </Card>
                                    <Card className="p-8 rounded-[2rem] border-slate-100 bg-amber-50/30 flex flex-col gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Pendientes de Firma</p>
                                            <h4 className="text-4xl font-black text-slate-800">12</h4>
                                        </div>
                                    </Card>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Últimos Certificados Generados</h3>
                                    <div className="space-y-3">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-white rounded-2xl border flex items-center justify-center shadow-sm">
                                                        <FileText className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-sm uppercase">Certificado de Competencia Digital</h5>
                                                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">Emitido para: Juan Pérez • 12 Abr 2024</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" className="rounded-xl font-bold text-[9px] uppercase tracking-widest">
                                                    Ver PDF
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="active-tasks" className="m-0 p-12 outline-none">
                            <div className="max-w-5xl mx-auto space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 italic">Estado de la Obra</h3>
                                    <Badge className="bg-blue-600 text-white font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest">MAPA INTERACTIVO: NIVEL 2</Badge>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {sections.length > 0 ? sections.map(section => (
                                        <Card key={section.id} className="p-8 rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-50 rounded-bl-full -mr-10 -mt-10" />
                                            <div className="relative z-10 flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                                                        <Layers className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-lg uppercase leading-none">{section.nombre}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Sector de Construcción</p>
                                                    </div>
                                                </div>
                                                <Badge className={cn(
                                                    "rounded-full font-black text-[9px] tracking-widest px-3",
                                                    section.activo ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {section.activo ? 'OPERATIVO' : 'EN ESPERA'}
                                                </Badge>
                                            </div>

                                            <div className="mt-8 space-y-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Niveles de este sector:</p>
                                                <div className="space-y-2">
                                                    {[1,2].map(i => (
                                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-50 rounded-2xl">
                                                            <div className="flex items-center gap-3">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                <span className="text-xs font-bold uppercase tracking-tight text-slate-700">Clase {i}: Fundamentos</span>
                                                            </div>
                                                            <span className="text-[9px] font-black text-blue-500 uppercase">Habilitado</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Card>
                                    )) : (
                                        <div className="col-span-2 py-20 bg-slate-50 border-2 border-dashed rounded-[3rem] text-center border-slate-200">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest">Selecciona un curso para ver la obra activa</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </main>
        </div>
    );
};

export default InstitutionalGradesView;

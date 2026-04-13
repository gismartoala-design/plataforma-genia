
import { useEffect, useState } from "react";
import { professorApi } from "@/features/professor/services/professor.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, FileText, XCircle, Search, Clock, User, ChevronRight, BookOpen, Layers, Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function GradingDashboard() {
    const [submissions, setSubmissions] = useState<{ rag: any[], ha: any[], bd: any[], it: any[], pic: any[] }>({ 
        rag: [], ha: [], bd: [], it: [], pic: [] 
    });
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [grade, setGrade] = useState<number>(0);
    const [feedback, setFeedback] = useState("");
    const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [availableLevels, setAvailableLevels] = useState<string[]>([]);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const data = await professorApi.getSubmissions();
            setSubmissions(data);

            // Extraer niveles únicos de todos los tipos
            const levels = new Set<string>();
            [...data.rag, ...data.ha, ...data.bd, ...data.it, ...data.pic].forEach(item => {
                if (item.levelTitle) levels.add(item.levelTitle);
            });
            setAvailableLevels(Array.from(levels).sort());
        } catch (error) {
            console.error("Error fetching submissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmit = async () => {
        if (!selectedSubmission) return;

        try {
            await professorApi.gradeSubmission(selectedSubmission.id, {
                type: selectedSubmission.type,
                grade,
                feedback
            });
            setIsGradeDialogOpen(false);
            fetchSubmissions(); // Refresh list
        } catch (error) {
            console.error("Error submitting grade:", error);
        }
    };

    const openGradeDialog = (sub: any) => {
        setSelectedSubmission(sub);
        setGrade(sub.grade || (sub.validated ? 100 : 0)); 
        setFeedback(sub.feedback || sub.comment || "");
        setIsGradeDialogOpen(true);
    };

    const filterSubmissions = (list: any[]) => {
        return list.filter(item => {
            const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.activityTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.moduleTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.levelTitle?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesLevel = selectedLevel === "all" || item.levelTitle === selectedLevel;

            return matchesSearch && matchesLevel;
        });
    };

    const groupSubmissions = (list: any[]) => {
        const grouped: any = {};
        list.forEach(item => {
            const mTitle = item.moduleTitle || "Sin Módulo";
            const lTitle = item.levelTitle || "Sin Nivel";
            
            if (!grouped[mTitle]) grouped[mTitle] = {};
            if (!grouped[mTitle][lTitle]) grouped[mTitle][lTitle] = [];
            
            grouped[mTitle][lTitle].push(item);
        });
        return grouped;
    };

    if (loading) return <div className="p-8 flex items-center justify-center">Cargando entregas...</div>;

    const ragList = filterSubmissions(submissions.rag);
    const haList = filterSubmissions(submissions.ha);
    const bdList = filterSubmissions(submissions.bd);
    const itList = filterSubmissions(submissions.it);
    const picList = filterSubmissions(submissions.pic);
    
    const ragGrouped = groupSubmissions(ragList);
    const haGrouped = groupSubmissions(haList);
    const bdGrouped = groupSubmissions(bdList);
    const itGrouped = groupSubmissions(itList);
    const picGrouped = groupSubmissions(picList);

    const renderGroupedList = (grouped: any, typeLabel: string) => {
        const modules = Object.keys(grouped);
        if (modules.length === 0) return <p className="text-muted-foreground text-center py-8">No hay entregas de {typeLabel} pendientes.</p>;

        return (
            <Accordion type="multiple" className="w-full space-y-4">
                {modules.map(moduleName => (
                    <AccordionItem key={moduleName} value={moduleName} className="border-2 border-slate-100 rounded-2xl overflow-hidden bg-white px-2">
                        <AccordionTrigger className="hover:no-underline py-4 px-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">{moduleName}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                        {Object.keys(grouped[moduleName]).length} Niveles con entregas
                                    </p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6">
                            <div className="space-y-6 pt-2">
                                {Object.keys(grouped[moduleName]).map(levelName => (
                                    <div key={levelName} className="space-y-4 px-2">
                                        <div className="flex items-center gap-2 text-slate-500 pl-4 border-l-2 border-slate-100 ml-2">
                                            <Layers className="w-4 h-4" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest">{levelName}</h3>
                                            <Badge variant="outline" className="text-[9px] h-4 leading-none bg-slate-50 text-slate-400 border-none font-bold">
                                                {grouped[moduleName][levelName].length} Estudiantes
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {grouped[moduleName][levelName].map((item: any) => (
                                                <Card key={`${item.type}-${item.id}`} className="hover:shadow-md transition-shadow bg-white/50 border-2 border-slate-50 rounded-2xl">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex justify-between items-start">
                                                            <Badge variant="outline" className={`mb-2 text-[9px] font-black 
                                                                ${item.type === 'rag' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                                  item.type === 'ha' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                  'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                                {item.type === 'rag' ? `RAG - PASO ${item.stepIndex + 1}` : 
                                                                 item.type === 'ha' ? 'HITO DE APRENDIZAJE' :
                                                                 item.type === 'bd' ? 'BLOQUE DESARROLLO' :
                                                                 item.type === 'it' ? 'ITERACIÓN' : 'PIC'}
                                                            </Badge>
                                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> {new Date(item.submittedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <CardTitle className="text-sm line-clamp-1 font-bold">{item.activityTitle}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex items-center gap-3 mb-4 p-2 bg-slate-50/80 rounded-xl">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border-2 border-white shadow-sm">
                                                                {item.studentName[0]}
                                                            </div>
                                                            <span className="font-bold text-xs text-slate-700">{item.studentName}</span>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.type === 'ha' ? (
                                                                    JSON.parse(item.files || '[]').map((url: string, i: number) => (
                                                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 text-blue-600 font-bold hover:underline border rounded-lg px-2 py-1 bg-white shadow-sm">
                                                                            <FileText className="w-3 h-3" /> Evidencia {i + 1}
                                                                        </a>
                                                                    ))
                                                                ) : (
                                                                    <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 text-blue-600 font-bold hover:underline border rounded-lg px-2 py-1 bg-white shadow-sm">
                                                                        <FileText className="w-3 h-3" /> {item.fileType || 'Archivo'}
                                                                    </a>
                                                                )}
                                                            </div>

                                                            {item.grade !== null ? (
                                                                <div className="flex items-center justify-between p-2 bg-green-50 rounded-xl border border-green-100">
                                                                    <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Nota:</span>
                                                                    <span className="text-sm font-black text-green-700">{item.grade}/100</span>
                                                                </div>
                                                            ) : (
                                                                <div className="p-2 bg-yellow-50 rounded-xl border border-yellow-100 text-center">
                                                                    <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Pendiente</span>
                                                                </div>
                                                            )}

                                                            <Button onClick={() => openGradeDialog(item)} className="w-full h-10 text-xs font-black rounded-xl" variant={item.grade !== null ? "outline" : "default"}>
                                                                {item.grade !== null ? "EDITAR" : "CALIFICAR"}
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        );
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-800">Calificaciones</h1>
                    <p className="text-slate-500 font-medium">Gestiona y evalúa el progreso de tus estudiantes por módulos.</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar estudiante o actividad..."
                            className="pl-12 h-12 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger className="w-full md:w-[200px] h-12 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-600">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <SelectValue placeholder="Filtrar por Nivel" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                            <SelectItem value="all" className="font-bold text-slate-600">Todos los Niveles</SelectItem>
                            {availableLevels.map(level => (
                                <SelectItem key={level} value={level} className="font-medium">
                                    {level}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="rag" className="space-y-6">
                <TabsList className="bg-slate-100/50 p-1.5 border-2 border-slate-100 rounded-2xl w-fit flex h-auto flex-wrap">
                    <TabsTrigger value="rag" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">RAG ({ragList.length})</TabsTrigger>
                    <TabsTrigger value="ha" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Hitos ({haList.length})</TabsTrigger>
                    <TabsTrigger value="bd" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">BD ({bdList.length})</TabsTrigger>
                    <TabsTrigger value="it" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">IT ({itList.length})</TabsTrigger>
                    <TabsTrigger value="pic" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">PIC ({picList.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="rag">{renderGroupedList(ragGrouped, "RAG")}</TabsContent>
                <TabsContent value="ha">{renderGroupedList(haGrouped, "Hitos")}</TabsContent>
                <TabsContent value="bd">{renderGroupedList(bdGrouped, "Bloque Desarrollo")}</TabsContent>
                <TabsContent value="it">{renderGroupedList(itGrouped, "Iteración")}</TabsContent>
                <TabsContent value="pic">{renderGroupedList(picGrouped, "PIC")}</TabsContent>
            </Tabs>

            <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-800">Evaluar Entrega</DialogTitle>
                        <CardDescription className="text-slate-500 font-medium pt-2 text-sm">
                            Estudiante: <strong className="text-blue-600 font-black">{selectedSubmission?.studentName}</strong><br/>
                            Actividad: <strong className="text-slate-800 font-bold">{selectedSubmission?.activityTitle}</strong>
                        </CardDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        <div className="grid gap-2">
                            <label htmlFor="grade" className="text-[11px] font-black uppercase text-slate-400 tracking-[0.1em]">Calificación (0-100)</label>
                            <Input
                                id="grade"
                                type="number"
                                value={grade}
                                onChange={(e) => setGrade(Number(e.target.value))}
                                className="h-14 text-2xl font-black bg-slate-50 border-slate-200 focus:border-blue-500 rounded-2xl text-center text-blue-700"
                                min={0}
                                max={100}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="feedback" className="text-[11px] font-black uppercase text-slate-400 tracking-[0.1em]">Feedback para el estudiante</label>
                            <Textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="bg-slate-50 border-slate-200 focus:border-blue-500 rounded-2xl resize-none font-medium h-32 p-4"
                                placeholder="Escribre tus observaciones aquí..."
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button onClick={handleGradeSubmit} className="bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 transition-all hover:scale-[1.02]">
                            GUARDAR EVALUACIÓN
                        </Button>
                        <Button variant="ghost" onClick={() => setIsGradeDialogOpen(false)} className="h-12 rounded-2xl font-bold text-slate-400">
                            Cerrar sin guardar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

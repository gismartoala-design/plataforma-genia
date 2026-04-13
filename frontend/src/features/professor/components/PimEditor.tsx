
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    Layers,
    Info,
    Search,
    PenTool,
    CheckCircle2,
    Image as ImageIcon,
    Target,
    FileText,
    BookOpen,
    Layout,
    ChevronRight,
    Settings,
    FileCheck
} from "lucide-react";
import { professorApi } from "@/features/professor/services/professor.api";
import { toast } from "@/hooks/use-toast";
import { ImagePickerModal } from "./ImagePickerModal";
import { cn } from "@/lib/utils";

interface PimModule {
    titulo: string;
    enfoqueTecnico: string;
    problemaTecnico: string;
    actividadesInvestigacion: string[];
    formatoSugerido: string[];
    actividadesPractica: string[];
    ejerciciosPracticos: string[];
    aporteTecnico: string[];
}

interface PimFormData {
    tituloProyecto: string;
    anioNivel: string;
    descripcionGeneral: string;
    problematicaGeneral: string;
    contextoProblema: string;
    objetivoProyecto: string;
    imagenUrl?: string;
    modulos: PimModule[];
}

interface PimEditorProps {
    levelId: number;
    moduleId: number;
    initialData?: any;
    onClose: () => void;
}

export default function PimEditor({ levelId, initialData, onClose }: PimEditorProps) {
    const [formData, setFormData] = useState<PimFormData>({
        tituloProyecto: "",
        anioNivel: "Primer Año",
        descripcionGeneral: "",
        problematicaGeneral: "",
        contextoProblema: "",
        objetivoProyecto: "",
        imagenUrl: "",
        modulos: []
    });

    const [activeSection, setActiveSection] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const sections = [
        { id: 1, name: "Datos Generales", icon: Info },
        { id: 2, name: "Propósito y Visión", icon: Target },
        { id: 3, name: "Problemática", icon: FileText },
        { id: 4, name: "Investigación", icon: Search },
        { id: 5, name: "Módulos Técnicos", icon: Layers },
        { id: 6, name: "Práctica", icon: PenTool },
        { id: 7, name: "Entregables", icon: FileCheck },
        { id: 8, name: "Rúbrica y Aporte", icon: Layout },
    ];

    useEffect(() => {
        if (initialData) {
            let parsedModulos = [];
            try {
                parsedModulos = typeof initialData.modulos === 'string'
                    ? JSON.parse(initialData.modulos)
                    : (initialData.modulos || []);

                // Normalizar nombres de campos si vienen del esquema viejo (nombreModulo -> titulo)
                parsedModulos = parsedModulos.map((m: any) => ({
                    ...m,
                    titulo: m.titulo || m.nombreModulo || ""
                }));
            } catch (e) {
                console.error("Error parsing modulos", e);
            }

            setFormData({
                ...initialData,
                modulos: parsedModulos
            });
        }
    }, [initialData]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await professorApi.savePimTemplate(levelId, formData);
            toast({ title: "Proyecto PIM guardado con éxito" });
            if (onClose) onClose();
        } catch (error) {
            toast({ title: "Error al guardar", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const addModule = () => {
        const newModule: PimModule = {
            titulo: "",
            enfoqueTecnico: "",
            problemaTecnico: "",
            actividadesInvestigacion: [""],
            formatoSugerido: ["PDF", "Código"],
            actividadesPractica: [""],
            ejerciciosPracticos: [""],
            aporteTecnico: [""]
        };
        setFormData({ ...formData, modulos: [...formData.modulos, newModule] });
    };

    const updateModule = (index: number, updates: Partial<PimModule>) => {
        const newModulos = [...formData.modulos];
        newModulos[index] = { ...newModulos[index], ...updates };
        setFormData({ ...formData, modulos: newModulos });
    };

    const removeModule = (index: number) => {
        setFormData({ ...formData, modulos: formData.modulos.filter((_, i) => i !== index) });
    };

    const addListItem = (moduleIndex: number, field: keyof PimModule) => {
        const module = formData.modulos[moduleIndex];
        const list = module[field] as string[];
        updateModule(moduleIndex, { [field]: [...list, ""] });
    };

    const updateListItem = (moduleIndex: number, field: keyof PimModule, itemIndex: number, value: string) => {
        const module = formData.modulos[moduleIndex];
        const list = [...(module[field] as string[])];
        list[itemIndex] = value;
        updateModule(moduleIndex, { [field]: list });
    };

    const removeListItem = (moduleIndex: number, field: keyof PimModule, itemIndex: number) => {
        const module = formData.modulos[moduleIndex];
        const list = (module[field] as string[]).filter((_, i) => i !== itemIndex);
        updateModule(moduleIndex, { [field]: list });
    };

    return (
        <div className="fixed inset-0 bg-slate-50/50 backdrop-blur-xl z-[100] flex animate-in modal-in">
            {/* Sidebar Navigation */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
                <div className="p-8 border-b border-slate-100 bg-linear-to-b from-slate-50 to-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Layers className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight italic">ARG PIM</h2>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Constructor de Proyectos</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                                activeSection === section.id
                                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            )}
                        >
                            <section.icon className={cn("w-4 h-4 transition-transform duration-500", activeSection === section.id && "scale-110")} />
                            {section.name}
                            {activeSection === section.id && (
                                <ChevronRight className="w-4 h-4 ml-auto animate-in slide-in-from-left-2" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <Button onClick={handleSave} disabled={loading} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 gap-2 transition-all active:scale-95">
                        <Save className="w-5 h-5" />
                        {loading ? "GUARDANDO..." : "GUARDAR PIM"}
                    </Button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white/40 backdrop-blur-md">
                <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Nivel {levelId}</span>
                            <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase italic">{formData.tituloProyecto || "Nuevo Proyecto Integrador"}</h3>
                        </div>
                    </div>
                </header>

                <ScrollArea className="flex-1">
                    <div className="max-w-4xl mx-auto p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Section 1: Datos Generales */}
                        {activeSection === 1 && (
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">DATOS GENERALES</h2>
                                    <p className="text-slate-500 font-medium">Define la identidad básica de tu proyecto integrador modular.</p>
                                </div>
                                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                                    <CardContent className="p-10 space-y-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título del Proyecto</Label>
                                                <Input
                                                    value={formData.tituloProyecto}
                                                    onChange={e => setFormData({ ...formData, tituloProyecto: e.target.value })}
                                                    placeholder="Ej: SmartShield 2024"
                                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500/20 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Año / Nivel</Label>
                                                <Input
                                                    value={formData.anioNivel}
                                                    onChange={e => setFormData({ ...formData, anioNivel: e.target.value })}
                                                    placeholder="Ej: Primer Año"
                                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500/20 font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">URL de Imagen de Portada</Label>
                                            <div className="flex gap-4">
                                                <Input
                                                    value={formData.imagenUrl}
                                                    onChange={e => setFormData({ ...formData, imagenUrl: e.target.value })}
                                                    placeholder="https://..."
                                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500/20 font-bold flex-1"
                                                />
                                                <Button variant="outline" onClick={() => setIsPickerOpen(true)} className="h-14 w-14 rounded-2xl border-slate-200 hover:bg-slate-50">
                                                    <ImageIcon className="w-5 h-5 text-slate-400" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Section 2: Propósito y Visión */}
                        {activeSection === 2 && (
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">PROPÓSITO Y VISIÓN</h2>
                                    <p className="text-slate-500 font-medium">¿Cuál es el "por qué" de este proyecto? Define el impacto esperado.</p>
                                </div>
                                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                                    <CardContent className="p-10 space-y-10">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descripción General (Visión)</Label>
                                            <Textarea
                                                value={formData.descripcionGeneral}
                                                onChange={e => setFormData({ ...formData, descripcionGeneral: e.target.value })}
                                                placeholder="Describe la esencia del proyecto en una frase inspiradora..."
                                                className="min-h-[120px] rounded-3xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500/20 font-medium text-lg leading-relaxed p-6"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Objetivos Pedagógicos</Label>
                                            <Textarea
                                                value={formData.objetivoProyecto}
                                                onChange={e => setFormData({ ...formData, objetivoProyecto: e.target.value })}
                                                placeholder="¿Qué competencias desarrollará el estudiante?"
                                                className="min-h-[120px] rounded-3xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500/20 font-medium p-6"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Section 3: Problemática */}
                        {activeSection === 3 && (
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">PROBLEMÁTICA</h2>
                                    <p className="text-slate-500 font-medium">Define el desafío real que los estudiantes deben resolver técnicamente.</p>
                                </div>
                                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                                    <CardContent className="p-10 space-y-10">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                La Problemática General
                                            </Label>
                                            <Textarea
                                                value={formData.problematicaGeneral}
                                                onChange={e => setFormData({ ...formData, problematicaGeneral: e.target.value })}
                                                placeholder="Describe el problema central..."
                                                className="min-h-[140px] rounded-3xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500/20 font-medium p-6"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                Contexto o Escenario de Uso
                                            </Label>
                                            <Textarea
                                                value={formData.contextoProblema}
                                                onChange={e => setFormData({ ...formData, contextoProblema: e.target.value })}
                                                placeholder="Ej: En un entorno de manufactura automatizada..."
                                                className="min-h-[140px] rounded-3xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500/20 font-medium p-6"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Sections 4-8 are module-dependent */}
                        {activeSection >= 4 && (
                            <div className="space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{sections[activeSection - 1].name}</h2>
                                        <p className="text-slate-500 font-medium">Configuración de detalles por cada módulo técnico del proyecto.</p>
                                    </div>
                                    <Button onClick={addModule} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl gap-2 shadow-lg shadow-indigo-100 px-6">
                                        <Plus className="w-4 h-4" /> Agregar Módulo
                                    </Button>
                                </div>

                                {formData.modulos.length === 0 ? (
                                    <div className="py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <Layers className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay módulos definidos</p>
                                        <Button onClick={addModule} variant="link" className="text-indigo-600 p-0 mt-2 font-black italic tracking-tighter">CREAR EL PRIMER MÓDULO</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        {formData.modulos.map((module, mIdx) => (
                                            <Card key={mIdx} className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden border-t-4 border-indigo-500">
                                                <CardHeader className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                                                    <div className="flex-1 mr-6 flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                                                            {mIdx + 1}
                                                        </div>
                                                        <Input
                                                            value={module.titulo}
                                                            onChange={e => updateModule(mIdx, { titulo: e.target.value })}
                                                            placeholder="Título del Módulo Técnico..."
                                                            className="text-xl font-black italic tracking-tight bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto placeholder:text-slate-300"
                                                        />
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => removeModule(mIdx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-10">
                                                    {activeSection === 4 && (
                                                        <div className="space-y-6">
                                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Líneas de Investigación Sugeridas</Label>
                                                            <div className="grid grid-cols-1 gap-4">
                                                                {module.actividadesInvestigacion.map((item, iIdx) => (
                                                                    <div key={iIdx} className="flex gap-4 animate-in slide-in-from-right-4">
                                                                        <Input value={item} onChange={e => updateListItem(mIdx, 'actividadesInvestigacion', iIdx, e.target.value)} placeholder="Ej: Explorar sensores de proximidad..." className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 shadow-sm font-medium p-6" />
                                                                        <Button variant="ghost" size="icon" onClick={() => removeListItem(mIdx, 'actividadesInvestigacion', iIdx)} className="h-14 w-14 rounded-2xl text-red-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></Button>
                                                                    </div>
                                                                ))}
                                                                <Button variant="outline" onClick={() => addListItem(mIdx, 'actividadesInvestigacion')} className="h-14 rounded-2xl border-dashed border-indigo-200 text-indigo-500 hover:bg-indigo-50 hover:border-indigo-400 transition-all font-black text-xs uppercase tracking-widest">
                                                                    <Plus className="w-4 h-4 mr-2" /> Añadir Línea de Investigación
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activeSection === 5 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                            <div className="space-y-4">
                                                                <Label className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <Settings className="w-4 h-4" /> Enfoque Técnico
                                                                </Label>
                                                                <Textarea
                                                                    value={module.enfoqueTecnico}
                                                                    onChange={e => updateModule(mIdx, { enfoqueTecnico: e.target.value })}
                                                                    placeholder="Ej: Arquitectura de software y lógica..."
                                                                    className="min-h-[120px] rounded-3xl border-slate-200 bg-slate-50/50 p-6 font-medium leading-relaxed"
                                                                />
                                                            </div>
                                                            <div className="space-y-4">
                                                                <Label className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                                                    <PenTool className="w-4 h-4" /> Problema Técnico
                                                                </Label>
                                                                <Textarea
                                                                    value={module.problemaTecnico}
                                                                    onChange={e => updateModule(mIdx, { problemaTecnico: e.target.value })}
                                                                    placeholder="¿Qué reto técnico específico resuelve este módulo?"
                                                                    className="min-h-[120px] rounded-3xl border-slate-200 bg-slate-50/50 p-6 font-medium leading-relaxed"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activeSection === 6 && (
                                                        <div className="space-y-10">
                                                            <div className="space-y-6">
                                                                <Label className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                                    <CheckCircle2 className="w-4 h-4" /> Actividades de Práctica Guiada
                                                                </Label>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {module.actividadesPractica.map((item, pIdx) => (
                                                                        <div key={pIdx} className="flex gap-4">
                                                                            <Input value={item} onChange={e => updateListItem(mIdx, 'actividadesPractica', pIdx, e.target.value)} placeholder="Paso de ejecución técnica..." className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-medium px-6" />
                                                                            <Button variant="ghost" size="icon" onClick={() => removeListItem(mIdx, 'actividadesPractica', pIdx)} className="h-14 w-14 rounded-2xl text-red-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></Button>
                                                                        </div>
                                                                    ))}
                                                                    <Button variant="outline" onClick={() => addListItem(mIdx, 'actividadesPractica')} className="h-14 rounded-2xl border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-black text-xs uppercase tracking-widest">
                                                                        <Plus className="w-4 h-4 mr-2" /> Añadir Paso de Ejecución
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <Separator className="bg-slate-100" />

                                                            <div className="space-y-6">
                                                                <Label className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                                                    <BookOpen className="w-4 h-4" /> Ejercicios de Aplicación (Laboratorio)
                                                                </Label>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {module.ejerciciosPracticos.map((item, eIdx) => (
                                                                        <div key={eIdx} className="flex gap-4">
                                                                            <Input value={item} onChange={e => updateListItem(mIdx, 'ejerciciosPracticos', eIdx, e.target.value)} placeholder="Reto de aplicación inmediata..." className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-medium px-6" />
                                                                            <Button variant="ghost" size="icon" onClick={() => removeListItem(mIdx, 'ejerciciosPracticos', eIdx)} className="h-14 w-14 rounded-2xl text-red-200 hover:text-red-500"><Trash2 className="w-5 h-5" /></Button>
                                                                        </div>
                                                                    ))}
                                                                    <Button variant="outline" onClick={() => addListItem(mIdx, 'ejerciciosPracticos')} className="h-14 rounded-2xl border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 font-black text-xs uppercase tracking-widest">
                                                                        <Plus className="w-4 h-4 mr-2" /> Añadir Ejercicio de Clase
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activeSection === 7 && (
                                                        <div className="space-y-6">
                                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Formatos de Entrega Requeridos</Label>
                                                            <div className="flex flex-wrap gap-4">
                                                                {module.formatoSugerido.map((item, fIdx) => (
                                                                    <div key={fIdx} className="flex items-center gap-2 animate-in zoom-in-95">
                                                                        <Input value={item} onChange={e => updateListItem(mIdx, 'formatoSugerido', fIdx, e.target.value)} placeholder="Ej: Captura..." className="h-11 w-40 rounded-xl border-slate-200 bg-slate-50/50 font-bold text-xs" />
                                                                        <Button variant="ghost" size="icon" onClick={() => removeListItem(mIdx, 'formatoSugerido', fIdx)} className="text-red-300 hover:text-red-500 p-0 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                                                                    </div>
                                                                ))}
                                                                <Button variant="outline" onClick={() => addListItem(mIdx, 'formatoSugerido')} className="h-11 rounded-xl border-dashed border-indigo-200 text-indigo-500 px-4 font-black text-[10px] uppercase">
                                                                    <Plus className="w-3 h-3 mr-2" /> Nuevo Formato
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activeSection === 8 && (
                                                        <div className="bg-indigo-50/30 p-8 rounded-[2rem] border border-indigo-100 flex flex-col gap-6">
                                                            <Label className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                                                <Target className="w-4 h-4" /> Aporte Técnico al Proyecto Integrador
                                                            </Label>
                                                            {module.aporteTecnico.map((item, aIdx) => (
                                                                <div key={aIdx} className="flex gap-4">
                                                                    <Input value={item} onChange={e => updateListItem(mIdx, 'aporteTecnico', aIdx, e.target.value)} placeholder="Ej: Mejora la eficiencia del motor..." className="h-14 rounded-2xl border-slate-200 bg-white font-bold p-6 shadow-sm flex-1" />
                                                                    <Button variant="ghost" size="icon" onClick={() => removeListItem(mIdx, 'aporteTecnico', aIdx)} className="h-14 w-14 text-red-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></Button>
                                                                </div>
                                                            ))}
                                                            <Button onClick={() => addListItem(mIdx, 'aporteTecnico')} className="h-14 rounded-2xl bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-black text-xs uppercase tracking-widest">
                                                                <Plus className="w-4 h-4 mr-2" /> Definir Nuevo Aporte
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </main>

            <ImagePickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(url) => setFormData({ ...formData, imagenUrl: url })}
            />
        </div>
    );
}

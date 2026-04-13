
import React from 'react';
import {
    Video,
    FileText,
    Link as LinkIcon,
    PenTool,
    Cpu,
    Workflow,
    HelpCircle,
    CheckSquare,
    ClipboardList,
    Wrench,
    Package,
    HardHat,
    Terminal,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface ActivityType {
    id: string;
    label: string;
    icon: any;
    color: string;
    description: string;
    category: 'supply' | 'machinery' | 'eval';
}

const ACTIVITIES: ActivityType[] = [
    // SUMINISTROS (Contenido Pasivo/Recursos)
    { id: 'modular_class', label: 'Sesión Modular', icon: Workflow, color: 'text-indigo-400', description: 'Construye una clase con múltiples bloques', category: 'supply' },
    { id: 'video', label: 'Video Académico', icon: Video, color: 'text-blue-400', description: 'Video de YouTube o Vimeo', category: 'supply' },
    { id: 'pdf', label: 'Planos PDF', icon: FileText, color: 'text-emerald-400', description: 'Documentos y guías descargables', category: 'supply' },
    { id: 'link', label: 'Enlace de Red', icon: LinkIcon, color: 'text-sky-400', description: 'Recursos externos y sitios web', category: 'supply' },
    { id: 'nota', label: 'Nota Técnica', icon: PenTool, color: 'text-cyan-400', description: 'Contenido teórico directo', category: 'supply' },

    // MAQUINARIA (Interacción/Labs)
    { id: 'desafio_algoritmo', label: 'Estación Lógica', icon: Cpu, color: 'text-violet-400', description: 'Desafío de Algoritmos y Código', category: 'machinery' },
    { id: 'python_lab', label: 'Aventuras Python', icon: Terminal, color: 'text-yellow-400', description: 'Juego de plataformas programable', category: 'machinery' },
    { id: 'arduino_lab', label: 'Arduino Lab', icon: Wrench, color: 'text-indigo-400', description: 'Simulador de circuitos', category: 'machinery' },
    { id: 'clasificacion', label: 'Clasificador', icon: Workflow, color: 'text-pink-400', description: 'Ordenar y clasificar componentes', category: 'machinery' },

    // EVALUACIÓN (Validación)
    { id: 'quiz', label: 'Cuestionario', icon: CheckSquare, color: 'text-amber-400', description: 'Opción múltiple con feedback', category: 'eval' },
    { id: 'pregunta_abierta', label: 'Reflexión', icon: HelpCircle, color: 'text-blue-400', description: 'Pregunta abierta técnica', category: 'eval' },
    { id: 'tarea', label: 'Entrega Final', icon: ClipboardList, color: 'text-orange-400', description: 'Subida de archivos y proyectos', category: 'eval' },
];

interface ActivityToolboxProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (typeId: string) => void;
}

export const ActivityToolbox = ({ isOpen, onClose, onSelect }: ActivityToolboxProps) => {

    const renderCategory = (category: 'supply' | 'machinery' | 'eval', title: string, icon: any, color: string) => {
        const CategoryIcon = icon;
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'rgba(26,86,219,0.08)' }}>
                    <CategoryIcon className={`w-3.5 h-3.5 ${color}`} />
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-80 ${color}`}>{title}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {ACTIVITIES.filter(a => a.category === category).map((activity) => {
                        const Icon = activity.icon;
                        return (
                            <button
                                key={activity.id}
                                onClick={() => {
                                    console.log('[TOOLBOX] Activity selected:', activity.id);
                                    onSelect(activity.id);
                                }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all text-left group"
                            >
                                <div className={`w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                    <Icon className={cn("w-4 h-4", activity.color)} />
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                    <div className="text-xs font-black truncate" style={{ color: 'var(--inst-deep)' }}>{activity.label}</div>
                                    <div className="text-[9px] opacity-40 font-bold uppercase tracking-tighter truncate" style={{ color: 'var(--inst-deep)' }}>{activity.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-xl border-none rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <HardHat className="w-64 h-64" style={{ color: 'var(--inst-blue)' }} />
                </div>

                <DialogHeader className="mb-10 relative z-10 text-left">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100">
                            <Plus className="w-5 h-5 text-blue-500" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight" style={{ color: 'var(--inst-deep)' }}>Añadir Nuevo Nivel</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm font-medium opacity-60" style={{ color: 'var(--inst-deep)' }}>
                        Selecciona el tipo de herramienta o recurso que deseas integrar en este módulo.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {renderCategory('supply', 'Contenidos', Package, 'text-cyan-500')}
                    {renderCategory('machinery', 'Interactivos', Wrench, 'text-violet-500')}
                    {renderCategory('eval', 'Evaluación', HardHat, 'text-orange-500')}
                </div>
            </DialogContent>
        </Dialog>
    );
};

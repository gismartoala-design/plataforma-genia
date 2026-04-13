import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Plus, Trash2, Save, ArrowLeft, Trophy, Sparkles, CheckCircle2,
    Image as ImageIcon, Link2, ChevronDown, ChevronUp
} from "lucide-react";
import kidsProfessorApi from "../services/kidsProfessor.api";
import { toast } from "@/hooks/use-toast";
import { ImageUploadInput } from "./ImageUploadInput";

// --- Shared Activity Block Types (same as RAG) ---
type ActivityBlock =
    | { type: 'video'; data: { url: string; title: string } }
    | { type: 'step'; data: { text: string } }
    | { type: 'multiple_choice'; data: { question: string; options: string[]; correctIndex: number } }
    | { type: 'image_upload'; data: { instruction: string; exampleUrl: string } }
    | { type: 'label_image'; data: { instruction: string; imageUrl: string; labels: string[] } }
    | { type: 'match_lines'; data: { instruction: string; leftItems: string[]; rightItems: string[] } };

interface HaKidsProps {
    levelId: number;
    onClose: () => void;
    user?: any;
}

const BLOCK_TYPES = [
    { type: 'video', label: '🎬 Video YouTube', color: 'text-red-600 border-red-200 hover:bg-red-50' },
    { type: 'step', label: '📋 Instrucción', color: 'text-slate-600 border-slate-200 hover:bg-slate-50' },
    { type: 'multiple_choice', label: '❓ Pregunta de Selección', color: 'text-indigo-600 border-indigo-200 hover:bg-indigo-50' },
    { type: 'image_upload', label: '🖼️ Subir Imagen', color: 'text-pink-600 border-pink-200 hover:bg-pink-50' },
    { type: 'label_image', label: '🏷️ Identificar Partes', color: 'text-amber-600 border-amber-200 hover:bg-amber-50' },
    { type: 'match_lines', label: '🔗 Unir con Líneas', color: 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' },
];

function createDefaultBlock(type: string): ActivityBlock {
    if (type === 'video') return { type: 'video', data: { url: '', title: 'Video Tutorial' } };
    if (type === 'step') return { type: 'step', data: { text: '' } };
    if (type === 'multiple_choice') return { type: 'multiple_choice', data: { question: '', options: ['', '', ''], correctIndex: 0 } };
    if (type === 'image_upload') return { type: 'image_upload', data: { instruction: '¡Sube una foto de tu trabajo!', exampleUrl: '' } };
    if (type === 'label_image') return { type: 'label_image', data: { instruction: 'Identifica las partes de la imagen', imageUrl: '', labels: ['', ''] } };
    return { type: 'match_lines', data: { instruction: 'Une con líneas', leftItems: ['', ''], rightItems: ['', ''] } };
}

function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default function HaKidsEditor({ levelId, onClose, user }: HaKidsProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState<string[]>(['']);
    const [blocks, setBlocks] = useState<ActivityBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);

    useEffect(() => {
        kidsProfessorApi.getTemplateByType(levelId, 'ha_kids').then(data => {
            if (data) {
                setTitle(data.titulo);
                setDescription(data.actividades?.description || "");
                setRequirements(data.actividades?.requirements || ['']);
                setBlocks(data.actividades?.blocks || []);
            }
        });
    }, [levelId]);

    const addBlock = (type: string) => {
        setBlocks([...blocks, createDefaultBlock(type) as ActivityBlock]);
        setShowAddMenu(false);
    };

    const removeBlock = (idx: number) => setBlocks(blocks.filter((_, i) => i !== idx));

    const updateBlock = (idx: number, newData: any) => {
        const newBlocks = [...blocks];
        (newBlocks[idx] as any).data = { ...(newBlocks[idx] as any).data, ...newData };
        setBlocks(newBlocks);
    };

    const moveBlock = (idx: number, dir: 'up' | 'down') => {
        const newBlocks = [...blocks];
        const target = dir === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= newBlocks.length) return;
        [newBlocks[idx], newBlocks[target]] = [newBlocks[target], newBlocks[idx]];
        setBlocks(newBlocks);
    };

    const handleSave = async () => {
        if (!title) {
            toast({ title: "¡Ups!", description: "Ponle un título al reto.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            await kidsProfessorApi.saveTypedTemplate(levelId, 'ha_kids', {
                titulo: title,
                tipo: 'ha_kids',
                actividades: { description, requirements: requirements.filter(r => r.trim()), blocks },
                configuracion: { primaryColor: "#10b981" }
            });
            toast({ title: "¡Guardado!", description: "El reto HA Kids está listo." });
            onClose();
        } catch {
            toast({ title: "Error", description: "No pudimos guardar.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-emerald-50 z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b-4 border-emerald-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-emerald-100">
                        <ArrowLeft className="w-6 h-6 text-emerald-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-emerald-800 flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-emerald-500" /> Editor HA Kids
                        </h1>
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Reto de Habilidades</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="rounded-2xl border-2 border-emerald-200 font-bold">Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black px-8">
                        <Save className="w-5 h-5 mr-2" /> {loading ? "Guardando..." : "¡LISTO!"}
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Basic Info */}
                    <Card className="rounded-3xl border-4 border-emerald-100">
                        <CardHeader className="bg-emerald-50 py-4">
                            <CardTitle className="text-emerald-800 font-black flex gap-2"><Sparkles className="w-5 h-5" /> Información del Reto</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="font-black text-emerald-700">Título del Reto</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)}
                                    placeholder="Ej: ¡Diseña tu primer Mundo en Roblox!"
                                    className="rounded-2xl h-14 text-lg border-2 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black text-emerald-700">Descripción del Reto</Label>
                                <Textarea value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="¿Qué deberán lograr los alumnos al completar este reto?"
                                    className="rounded-2xl border-2 min-h-[80px]" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requirements */}
                    <Card className="rounded-3xl border-4 border-emerald-100">
                        <CardHeader className="bg-emerald-50 py-4">
                            <CardTitle className="text-emerald-800 font-black flex gap-2"><CheckCircle2 className="w-5 h-5" /> Requisitos para Entregar</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                            {requirements.map((req, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center font-black text-emerald-700 flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <Input value={req} onChange={e => {
                                        const reqs = [...requirements];
                                        reqs[i] = e.target.value;
                                        setRequirements(reqs);
                                    }}
                                        placeholder={`Requisito ${i + 1}: Ej: "Subir captura de pantalla del mundo"`}
                                        className="rounded-xl h-11 flex-1" />
                                    {requirements.length > 1 && (
                                        <Button variant="ghost" size="icon" onClick={() => setRequirements(requirements.filter((_, ri) => ri !== i))}
                                            className="text-red-400 h-10 w-10"><Trash2 className="w-4 h-4" /></Button>
                                    )}
                                </div>
                            ))}
                            <Button variant="outline" onClick={() => setRequirements([...requirements, ''])}
                                className="rounded-xl font-bold text-sm border-2 border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 w-full h-11">
                                <Plus className="w-4 h-4 mr-2" /> Añadir Requisito
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Activity Blocks */}
                    <div className="space-y-4">
                        {blocks.map((block, idx) => (
                            <Card key={idx} className="rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 px-5 py-3 flex items-center justify-between border-b">
                                    <span className="font-black text-slate-600 text-sm uppercase tracking-wider">
                                        {BLOCK_TYPES.find(b => b.type === block.type)?.label || block.type}
                                    </span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => moveBlock(idx, 'up')} className="h-8 w-8"><ChevronUp className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => moveBlock(idx, 'down')} className="h-8 w-8"><ChevronDown className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => removeBlock(idx)} className="h-8 w-8 text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>

                                <CardContent className="p-5 space-y-4">
                                    {block.type === 'video' && (
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs font-black uppercase text-slate-500">Título del Video</Label>
                                                <Input value={block.data.title} onChange={e => updateBlock(idx, { title: e.target.value })} placeholder="Título" className="rounded-xl h-11 mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-xs font-black uppercase text-slate-500">URL de YouTube</Label>
                                                <Input value={block.data.url} onChange={e => updateBlock(idx, { url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="rounded-xl h-11 mt-1" />
                                            </div>
                                            {block.data.url && getYouTubeId(block.data.url) && (
                                                <div className="aspect-video rounded-2xl overflow-hidden border-2">
                                                    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeId(block.data.url)}`} frameBorder="0" allowFullScreen />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {block.type === 'step' && (
                                        <div>
                                            <Label className="text-xs font-black uppercase text-slate-500">Instrucción</Label>
                                            <Textarea value={block.data.text} onChange={e => updateBlock(idx, { text: e.target.value })} placeholder="Escribe la instrucción..." className="rounded-xl mt-1 min-h-[80px]" />
                                        </div>
                                    )}

                                    {block.type === 'multiple_choice' && (
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs font-black uppercase text-slate-500">Pregunta</Label>
                                                <Input value={block.data.question} onChange={e => updateBlock(idx, { question: e.target.value })} placeholder="¿Cuál es la respuesta correcta?" className="rounded-xl h-11 mt-1" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase text-slate-500">Opciones (marca la correcta con ✓)</Label>
                                                {block.data.options.map((opt: string, oi: number) => (
                                                    <div key={oi} className="flex gap-2 items-center">
                                                        <button onClick={() => updateBlock(idx, { correctIndex: oi })}
                                                            className={`w-8 h-8 rounded-xl flex-shrink-0 font-black text-sm border-2 transition-all ${block.data.correctIndex === oi ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-200'}`}>
                                                            {block.data.correctIndex === oi ? '✓' : (oi + 1)}
                                                        </button>
                                                        <Input value={opt}
                                                            onChange={e => {
                                                                const opts = [...block.data.options];
                                                                opts[oi] = e.target.value;
                                                                updateBlock(idx, { options: opts });
                                                            }}
                                                            placeholder={`Opción ${oi + 1}`} className="rounded-xl h-10 flex-1" />
                                                        <Button variant="ghost" size="icon" onClick={() => {
                                                            const opts = block.data.options.filter((_: string, i: number) => i !== oi);
                                                            updateBlock(idx, { options: opts, correctIndex: Math.min(block.data.correctIndex, opts.length - 1) });
                                                        }} className="text-red-400 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" onClick={() => updateBlock(idx, { options: [...block.data.options, ''] })} className="rounded-xl font-bold text-xs">
                                                    <Plus className="w-3 h-3 mr-1" /> Añadir Opción
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'image_upload' && (
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs font-black uppercase text-slate-500">Instrucción para el Alumno</Label>
                                                <Input value={block.data.instruction} onChange={e => updateBlock(idx, { instruction: e.target.value })}
                                                    placeholder="Ej: ¡Sube una captura de tu mundo en Roblox!" className="rounded-xl h-11 mt-1" />
                                            </div>
                                            <ImageUploadInput 
                                                label="Imagen de Ejemplo (Opcional)" 
                                                value={block.data.exampleUrl} 
                                                onChange={val => updateBlock(idx, { exampleUrl: val })} 
                                            />
                                            {block.data.exampleUrl && (
                                                <img src={block.data.exampleUrl} alt="Ejemplo" className="max-h-48 mx-auto object-contain rounded-2xl border-2" />
                                            )}
                                            <div className="bg-pink-50 border-2 border-dashed border-pink-200 rounded-2xl p-6 text-center">
                                                <ImageIcon className="w-8 h-8 text-pink-300 mx-auto mb-2" />
                                                <p className="text-pink-500 font-bold text-sm">Los alumnos subirán una imagen aquí</p>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'label_image' && (
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs font-black uppercase text-slate-500">Instrucción</Label>
                                                <Input value={block.data.instruction} onChange={e => updateBlock(idx, { instruction: e.target.value })}
                                                    placeholder="Ej: Identifica las partes de un mundo en Roblox" className="rounded-xl h-11 mt-1" />
                                            </div>
                                            <ImageUploadInput 
                                                label="URL de la Imagen" 
                                                value={block.data.imageUrl} 
                                                onChange={val => updateBlock(idx, { imageUrl: val })} 
                                            />
                                            {block.data.imageUrl && (
                                                <img src={block.data.imageUrl} alt="Imagen" className="max-h-48 mx-auto object-contain rounded-2xl border-2" />
                                            )}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase text-slate-500">Partes a Identificar</Label>
                                                {block.data.labels.map((lbl: string, li: number) => (
                                                    <div key={li} className="flex gap-2">
                                                        <Input value={lbl}
                                                            onChange={e => {
                                                                const lbls = [...block.data.labels];
                                                                lbls[li] = e.target.value;
                                                                updateBlock(idx, { labels: lbls });
                                                            }}
                                                            placeholder={`Parte ${li + 1}: Ej. "Menú de Roblox"`} className="rounded-xl h-10" />
                                                        <Button variant="ghost" size="icon" onClick={() => updateBlock(idx, { labels: block.data.labels.filter((_: string, i: number) => i !== li) })} className="text-red-400 h-10 w-10"><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" onClick={() => updateBlock(idx, { labels: [...block.data.labels, ''] })} className="rounded-xl font-bold text-xs">
                                                    <Plus className="w-3 h-3 mr-1" /> Añadir Parte
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'match_lines' && (
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs font-black uppercase text-slate-500">Instrucción</Label>
                                                <Input value={block.data.instruction} onChange={e => updateBlock(idx, { instruction: e.target.value })}
                                                    placeholder="Ej: Une cada herramienta con su función en Roblox" className="rounded-xl h-11 mt-1" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase text-slate-500">Columna Izquierda</Label>
                                                    {block.data.leftItems.map((item: string, li: number) => (
                                                        <div key={li} className="flex gap-2">
                                                            <Input value={item}
                                                                onChange={e => {
                                                                    const items = [...block.data.leftItems];
                                                                    items[li] = e.target.value;
                                                                    updateBlock(idx, { leftItems: items });
                                                                }}
                                                                placeholder={`Elemento ${li + 1}`} className="rounded-xl h-10 flex-1" />
                                                            <Button variant="ghost" size="icon" onClick={() => updateBlock(idx, { leftItems: block.data.leftItems.filter((_: string, i: number) => i !== li) })} className="text-red-400 h-10 w-10"><Trash2 className="w-4 h-4" /></Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => updateBlock(idx, { leftItems: [...block.data.leftItems, ''] })} className="rounded-xl font-bold text-xs w-full">
                                                        <Plus className="w-3 h-3 mr-1" /> Añadir
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase text-slate-500 flex gap-1 items-center"><Link2 className="w-3 h-3" /> Columna Derecha (Respuestas)</Label>
                                                    {block.data.rightItems.map((item: string, ri: number) => (
                                                        <div key={ri} className="flex gap-2">
                                                            <Input value={item}
                                                                onChange={e => {
                                                                    const items = [...block.data.rightItems];
                                                                    items[ri] = e.target.value;
                                                                    updateBlock(idx, { rightItems: items });
                                                                }}
                                                                placeholder={`Respuesta ${ri + 1}`} className="rounded-xl h-10 flex-1" />
                                                            <Button variant="ghost" size="icon" onClick={() => updateBlock(idx, { rightItems: block.data.rightItems.filter((_: string, i: number) => i !== ri) })} className="text-red-400 h-10 w-10"><Trash2 className="w-4 h-4" /></Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => updateBlock(idx, { rightItems: [...block.data.rightItems, ''] })} className="rounded-xl font-bold text-xs w-full">
                                                        <Plus className="w-3 h-3 mr-1" /> Añadir
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl p-4 text-center">
                                                <Link2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                                                <p className="text-emerald-600 font-bold text-sm">Los alumnos unirán las columnas con líneas</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Add Block Menu */}
                    <div className="relative">
                        <Button onClick={() => setShowAddMenu(!showAddMenu)}
                            className="w-full h-16 rounded-3xl border-2 border-dashed border-emerald-300 bg-white text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 font-black text-lg transition-all">
                            <Plus className="w-6 h-6 mr-2" /> AÑADIR ACTIVIDAD
                        </Button>
                        {showAddMenu && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-3xl border-2 border-emerald-100 shadow-2xl p-4 z-10 grid grid-cols-2 md:grid-cols-3 gap-3">
                                {BLOCK_TYPES.map(bt => (
                                    <Button key={bt.type} variant="outline" onClick={() => addBlock(bt.type)}
                                        className={`rounded-2xl h-16 font-bold text-sm flex-col gap-1 border-2 ${bt.color}`}>
                                        {bt.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

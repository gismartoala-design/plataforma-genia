import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Plus, Trash2, Save, ArrowLeft, Star, ChevronDown, ChevronUp,
    Video, Image as ImageIcon, Move, Zap, Award, Sparkles, CheckCircle2,
    Hand, RotateCcw, Palette, Rocket, Layout, Target, BookOpen, Layers
} from "lucide-react";
import kidsProfessorApi from "../services/kidsProfessor.api";
import { institutionalCurriculumApi } from "@/features/institutional/services/curriculum.api";
import { toast } from "sonner";
import { ImageUploadInput } from "./ImageUploadInput";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
type ScreenType =
    | 'welcome'
    | 'video'
    | 'image_choice'
    | 'drag_drop'
    | 'animation_interaction'
    | 'creative_choice'
    | 'celebration';

interface MissionScreen {
    id: string;
    type: ScreenType;
    data: Record<string, any>;
}

interface RagKidsProps {
    levelId: number;
    onClose: () => void;
    user?: any;
    instModuleId?: number; // Added for institutional sync
}

// ── Screen Definitions ─────────────────────────────────────────────────────
const SCREEN_DEFS: {
    type: ScreenType;
    label: string;
    emoji: string;
    description: string;
    color: string;
    bg: string;
    border: string;
    icon: any;
}[] = [
    { type: 'welcome', label: 'Bienvenida', emoji: '🌟', description: 'Ilustración + personaje + audio', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Sparkles },
    { type: 'video', label: 'Video', emoji: '🎬', description: 'Video YouTube o MP4 tematizado', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: Video },
    { type: 'image_choice', label: 'Misión Visual', emoji: '🖼️', description: 'Selección de imagen correcta', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: ImageIcon },
    { type: 'drag_drop', label: 'Construcción', emoji: '✋', description: 'Arrastrar objetos al destino', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', icon: Hand },
    { type: 'animation_interaction', label: 'Lógica RAC', emoji: '🤖', description: 'Minijuego de bloques y rutas', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', icon: Zap },
    { type: 'creative_choice', label: 'Reto Creativo', emoji: '🎨', description: 'Elección de qué construir hoy', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Palette },
    { type: 'celebration', label: 'Cierre', emoji: '🏆', description: 'Confeti e insignia de logro', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Award },
];

function defaultData(type: ScreenType): Record<string, any> {
    switch (type) {
        case 'welcome': return { title: '', subtitle: '¿Estás listo?', illustrationUrl: '', characterUrl: '', audioUrl: '', ctaText: '¡Comenzar la Misión!' };
        case 'video': return { title: '', videoUrl: '', duration: '1-2 min', notes: '' };
        case 'image_choice': return { instruction: '¡Toca la imagen correcta!', images: [{ url: '', label: '', correct: true }, { url: '', label: '', correct: false }, { url: '', label: '', correct: false }] };
        case 'drag_drop': return { title: '', instruction: 'Arrastra los bloques hacia la casa', backgroundUrl: '', items: ['Bloque 1', 'Bloque 2'], targetLabel: 'Casa incompleta', iframeUrl: '' };
        case 'animation_interaction': return { title: '¡Lleva a nuestro amigo hasta la meta!', instruction: 'Usa las flechas para crear un camino.', gridSize: 5, targetX: 4, targetY: 4 };
        case 'creative_choice': return { instruction: '¿Qué quieres construir hoy?', choices: [{ label: '🏠 Casa', imageUrl: '' }, { label: '🏰 Castillo', imageUrl: '' }, { label: '🗼 Torre', imageUrl: '' }] };
        case 'celebration': return { title: '¡Lo lograste, Genio!', message: 'Has completado la misión con éxito.', badgeUrl: '', lottieUrl: '' };
    }
}

function getYouTubeId(url: string) {
    const m = url.match(/(?:youtu.be\/|watch\?v=|embed\/)([^#&?]{11})/);
    return m ? m[1] : null;
}

// ── Screen Type Icon ───────────────────────────────────────────────────────
function ScreenIcon({ type }: { type: ScreenType }) {
    const icons: Record<ScreenType, React.ReactNode> = {
        welcome: <Sparkles className="w-5 h-5" />,
        video: <Video className="w-5 h-5" />,
        image_choice: <ImageIcon className="w-5 h-5" />,
        drag_drop: <Hand className="w-5 h-5" />,
        animation_interaction: <Zap className="w-5 h-5" />,
        creative_choice: <Palette className="w-5 h-5" />,
        celebration: <Award className="w-5 h-5" />,
    };
    return <>{icons[type]}</>;
}

// ── Welcome Screen Editor ──────────────────────────────────────────────────
function WelcomeEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Título de la Misión</Label>
                    <Input value={data.title} onChange={e => onChange({ title: e.target.value })} placeholder="Ej: ¡Construye tu primera casa en Roblox!" className="rounded-xl h-11" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Subtítulo / Pregunta inicial</Label>
                    <Input value={data.subtitle} onChange={e => onChange({ subtitle: e.target.value })} placeholder="¿Estás listo?" className="rounded-xl h-11" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <ImageUploadInput 
                    label="Ilustración del Mundo (PNG)" 
                    value={data.illustrationUrl} 
                    onChange={val => onChange({ illustrationUrl: val })} 
                />
                <ImageUploadInput 
                    label="Personaje Guía (PNG)" 
                    value={data.characterUrl} 
                    onChange={val => onChange({ characterUrl: val })} 
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <ImageUploadInput 
                    label="Audio Narrado (MP3 · ElevenLabs)" 
                    value={data.audioUrl} 
                    onChange={val => onChange({ audioUrl: val })} 
                    accept="audio/*"
                />
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Texto del Botón de Inicio</Label>
                    <Input value={data.ctaText} onChange={e => onChange({ ctaText: e.target.value })} placeholder="¡Comenzar la Misión!" className="rounded-xl h-11" />
                </div>
            </div>
            {/* Preview */}
            {data.illustrationUrl && (
                <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-100 flex items-end gap-4">
                    <img src={data.illustrationUrl} className="h-32 object-contain rounded-xl" alt="Ilustración" onError={e => (e.currentTarget.style.display = 'none')} />
                    {data.characterUrl && <img src={data.characterUrl} className="h-24 object-contain" alt="Personaje" onError={e => (e.currentTarget.style.display = 'none')} />}
                    <div className="flex-1 text-center">
                        <h3 className="font-black text-indigo-800 text-lg">{data.title || "Título de la misión"}</h3>
                        <p className="text-indigo-500 font-bold text-sm">{data.subtitle}</p>
                        <div className="mt-3 bg-indigo-600 text-white font-black py-2 px-6 rounded-full inline-block text-sm">{data.ctaText}</div>
                    </div>
                </div>
            )}
            <p className="text-[11px] text-slate-400 italic">🎨 Recomendado: Canva (ilustración), ElevenLabs (narración)</p>
        </div>
    );
}

// ── Video Screen Editor ────────────────────────────────────────────────────
function VideoEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    const ytId = getYouTubeId(data.videoUrl || '');
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Título del Video</Label>
                    <Input value={data.title} onChange={e => onChange({ title: e.target.value })} placeholder="Ej: Cómo crear bloques en Roblox Studio" className="rounded-xl h-11" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Duración Aprox.</Label>
                    <Input value={data.duration} onChange={e => onChange({ duration: e.target.value })} placeholder="1–2 min" className="rounded-xl h-11" />
                </div>
            </div>
            <div className="space-y-1">
                <Label className="text-xs font-black uppercase text-slate-500">URL YouTube / MP4</Label>
                <Input value={data.videoUrl} onChange={e => onChange({ videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="rounded-xl h-11" />
            </div>
            {ytId && (
                <div className="aspect-video rounded-2xl overflow-hidden border-2">
                    <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}`} allowFullScreen />
                </div>
            )}
            <div className="space-y-1">
                <Label className="text-xs font-black uppercase text-slate-500">Notas para el alumno (opcional)</Label>
                <Textarea value={data.notes} onChange={e => onChange({ notes: e.target.value })} placeholder="Ej: Presta atención a cómo se usan los bloques..." className="rounded-xl min-h-[60px]" />
            </div>
            <p className="text-[11px] text-slate-400 italic">🎥 Recomendado: Camtasia (grabar Roblox), Animaker (animación educativa)</p>
        </div>
    );
}

// ── Image Choice Screen Editor ─────────────────────────────────────────────
function ImageChoiceEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    const updateImage = (i: number, field: string, value: any) => {
        const imgs = [...data.images];
        imgs[i] = { ...imgs[i], [field]: value };
        onChange({ images: imgs });
    };
    const markCorrect = (i: number) => {
        const imgs = data.images.map((img: any, idx: number) => ({ ...img, correct: idx === i }));
        onChange({ images: imgs });
    };
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <Label className="text-xs font-black uppercase text-slate-500">Instrucción para el Alumno</Label>
                <Input value={data.instruction} onChange={e => onChange({ instruction: e.target.value })} placeholder="¡Toca la imagen correcta!" className="rounded-xl h-11" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.images.map((img: any, i: number) => (
                    <div key={i} className={`border-2 rounded-2xl p-3 space-y-2 ${img.correct ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase text-slate-400">Opción {i + 1}</span>
                            <button onClick={() => markCorrect(i)} className={`text-xs font-black px-2 py-1 rounded-lg border transition-all ${img.correct ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-300 hover:border-emerald-400'}`}>
                                {img.correct ? '✓ Correcta' : 'Marcar ✓'}
                            </button>
                        </div>
                        <ImageUploadInput 
                            value={img.url} 
                            onChange={val => updateImage(i, 'url', val)} 
                            placeholder="URL imagen (PNG)" 
                        />
                        <Input value={img.label} onChange={e => updateImage(i, 'label', e.target.value)} placeholder="Etiqueta (ej: Bloque)" className="rounded-xl h-9 text-xs" />
                        {img.url && <img src={img.url} alt={img.label} className="w-full h-28 object-cover rounded-xl border" onError={e => (e.currentTarget.style.display = 'none')} />}
                        <Button variant="ghost" size="sm" onClick={() => onChange({ images: data.images.filter((_: any, idx: number) => idx !== i) })} className="text-red-400 text-xs h-7 w-full"><Trash2 className="w-3 h-3 mr-1" /> Eliminar</Button>
                    </div>
                ))}
                <button onClick={() => onChange({ images: [...data.images, { url: '', label: '', correct: false }] })}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-300 transition-all">
                    <Plus className="w-8 h-8 mb-1" />
                    <span className="text-xs font-bold">Añadir opción</span>
                </button>
            </div>
            <p className="text-[11px] text-slate-400 italic">🖼️ Crea imágenes en Canva (800x800 PNG). Tamaño recomendado: 800x800px</p>
        </div>
    );
}

// ── Drag & Drop Screen Editor ──────────────────────────────────────────────
function DragDropEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Título</Label>
                    <Input value={data.title} onChange={e => onChange({ title: e.target.value })} placeholder="Construye la pared" className="rounded-xl h-11" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Zona de Destino</Label>
                    <Input value={data.targetLabel} onChange={e => onChange({ targetLabel: e.target.value })} placeholder="Ej: Casa incompleta" className="rounded-xl h-11" />
                </div>
            </div>
            <div className="space-y-1">
                <Label className="text-xs font-black uppercase text-slate-500">Instrucción</Label>
                <Input value={data.instruction} onChange={e => onChange({ instruction: e.target.value })} placeholder="Arrastra los bloques hacia la casa" className="rounded-xl h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <ImageUploadInput 
                    label="Imagen de Fondo (PNG)" 
                    value={data.backgroundUrl} 
                    onChange={val => onChange({ backgroundUrl: val })} 
                />
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">URL Interacción Genially (iframe, opcional)</Label>
                    <Input value={data.iframeUrl} onChange={e => onChange({ iframeUrl: e.target.value })} placeholder="https://view.genially.com/..." className="rounded-xl h-11" />
                </div>
            </div>
            {data.backgroundUrl && <img src={data.backgroundUrl} alt="fondo" className="max-h-40 rounded-2xl border-2 object-contain mx-auto" onError={e => (e.currentTarget.style.display = 'none')} />}
            <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-500">Objetos a Arrastrar</Label>
                {data.items.map((item: string, i: number) => (
                    <div key={i} className="flex gap-2">
                        <Input value={item} onChange={e => { const it = [...data.items]; it[i] = e.target.value; onChange({ items: it }); }} placeholder={`Objeto ${i + 1}: Ej. Bloque de madera`} className="rounded-xl h-10 flex-1" />
                        <Button variant="ghost" size="icon" onClick={() => onChange({ items: data.items.filter((_: string, idx: number) => idx !== i) })} className="text-red-400 h-10 w-10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => onChange({ items: [...data.items, ''] })} className="rounded-xl font-bold text-xs w-full">
                    <Plus className="w-3 h-3 mr-1" /> Añadir Objeto
                </Button>
            </div>
            {data.iframeUrl && <div className="aspect-video rounded-2xl overflow-hidden border-2"><iframe src={data.iframeUrl} className="w-full h-full" /></div>}
            <p className="text-[11px] text-slate-400 italic">🎮 Recomendado: Genially (drag & drop visual), Construct 3 (mini juego HTML5)</p>
        </div>
    );
}

// ── Logic Game Interaction Editor ───────────────────────────────────────────
function AnimationEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    const size = parseInt(data.gridSize) || 5;
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Título</Label>
                    <Input value={data.title} onChange={e => onChange({ title: e.target.value })} placeholder="Ej: ¡Lleva a nuestro amigo hasta la meta!" className="rounded-xl h-11" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Instrucción al Alumno</Label>
                    <Input value={data.instruction} onChange={e => onChange({ instruction: e.target.value })} placeholder="Ej: Usa las flechas para crear un camino." className="rounded-xl h-11" />
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Tamaño del Tablero (N x N)</Label>
                    <Input type="number" min="3" max="10" value={data.gridSize || 5} onChange={e => onChange({ gridSize: parseInt(e.target.value) || 5 })} className="rounded-xl h-11" />
                </div>
                 <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Columna Meta (X : 0 a {size-1})</Label>
                    <Input type="number" min="0" max={size-1} value={data.targetX ?? 4} onChange={e => onChange({ targetX: parseInt(e.target.value) || 0 })} className="rounded-xl h-11" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Fila Meta (Y : 0 a {size-1})</Label>
                    <Input type="number" min="0" max={size-1} value={data.targetY ?? 4} onChange={e => onChange({ targetY: parseInt(e.target.value) || 0 })} className="rounded-xl h-11" />
                </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200 flex flex-col gap-2">
                <p className="text-sm font-black text-purple-800">🎮 Minijuego Generado Automáticamente</p>
                <p className="text-xs font-bold text-purple-600">El alumno verá un tablero de {size}x{size} e intentará mover al personaje hasta la columna {data.targetX ?? 4} y fila {data.targetY ?? 4} usando los bloques de código.</p>
            </div>
        </div>
    );
}

// ── Creative Choice Editor ─────────────────────────────────────────────────
function CreativeChoiceEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <Label className="text-xs font-black uppercase text-slate-500">Instrucción</Label>
                <Input value={data.instruction} onChange={e => onChange({ instruction: e.target.value })} placeholder="¿Qué quieres construir hoy?" className="rounded-xl h-11" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.choices.map((ch: any, i: number) => (
                    <div key={i} className="border-2 border-emerald-100 rounded-2xl p-3 space-y-2 bg-emerald-50">
                        <Input value={ch.label} onChange={e => { const c = [...data.choices]; c[i] = { ...c[i], label: e.target.value }; onChange({ choices: c }); }}
                            placeholder="🏠 Casa" className="rounded-xl h-9 text-sm font-bold text-center border-emerald-200" />
                        <ImageUploadInput 
                            value={ch.imageUrl} 
                            onChange={val => { const c = [...data.choices]; c[i] = { ...c[i], imageUrl: val }; onChange({ choices: c }); }} 
                            placeholder="URL imagen (PNG)" 
                        />
                        {ch.imageUrl && <img src={ch.imageUrl} alt={ch.label} className="w-full h-24 object-cover rounded-xl border" onError={e => (e.currentTarget.style.display = 'none')} />}
                        <Button variant="ghost" size="sm" onClick={() => onChange({ choices: data.choices.filter((_: any, idx: number) => idx !== i) })} className="text-red-400 text-xs h-7 w-full"><Trash2 className="w-3 h-3 mr-1" /> Quitar</Button>
                    </div>
                ))}
                <button onClick={() => onChange({ choices: [...data.choices, { label: '', imageUrl: '' }] })}
                    className="border-2 border-dashed border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-300 hover:text-emerald-500 hover:border-emerald-400 transition-all">
                    <Plus className="w-8 h-8 mb-1" />
                    <span className="text-xs font-bold">Añadir opción</span>
                </button>
            </div>
            <p className="text-[11px] text-slate-400 italic">🎨 Recomendado: Genially (click imagen → elegir misión). Imágenes en Canva.</p>
        </div>
    );
}

// ── Celebration Editor ─────────────────────────────────────────────────────
function CelebrationEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label className="text-xs font-black uppercase text-slate-500">Título de Celebración</Label>
                    <Input value={data.title} onChange={e => onChange({ title: e.target.value })} placeholder="¡Lo lograste, Genio!" className="rounded-xl h-11" />
                </div>
                <ImageUploadInput 
                    label="Insignia / Badge (PNG)" 
                    value={data.badgeUrl} 
                    onChange={val => onChange({ badgeUrl: val })} 
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs font-black uppercase text-slate-500">Mensaje de Felicitación</Label>
                <Textarea value={data.message} onChange={e => onChange({ message: e.target.value })} placeholder="¡Has completado la misión con éxito! Eres un verdadero constructor." className="rounded-xl min-h-[70px]" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs font-black uppercase text-slate-500">URL Animación Lottie (confeti/estrellas, opcional)</Label>
                <Input value={data.lottieUrl} onChange={e => onChange({ lottieUrl: e.target.value })} placeholder="https://lottiefiles.com/..." className="rounded-xl h-11" />
            </div>
            {/* Preview */}
            {data.title && (
                <div className="bg-gradient-to-br from-pink-50 to-amber-50 rounded-2xl p-6 text-center border-2 border-pink-100 space-y-3">
                    {data.badgeUrl && <img src={data.badgeUrl} className="w-24 h-24 mx-auto object-contain" alt="badge" onError={e => (e.currentTarget.style.display = 'none')} />}
                    <div className="text-4xl">🎉 ⭐ 🏆</div>
                    <h3 className="font-black text-2xl text-pink-800">{data.title}</h3>
                    <p className="text-pink-600 font-medium">{data.message}</p>
                </div>
            )}
            <p className="text-[11px] text-slate-400 italic">🏆 Recomendado: Canva (insignias), LottieFiles (animación confeti gratis)</p>
        </div>
    );
}

// ── Screen Block ───────────────────────────────────────────────────────────
function ScreenBlock({ screen, idx, total, onChange, onDelete, onMove }: {
    screen: MissionScreen; idx: number; total: number;
    onChange: (d: any) => void; onDelete: () => void; onMove: (d: 'up' | 'down') => void;
}) {
    const def = SCREEN_DEFS.find(s => s.type === screen.type)!;
    const [collapsed, setCollapsed] = useState(false);
    const Icon = def.icon;

    return (
        <Card className={cn(
            "rounded-[2rem] border-2 overflow-hidden transition-all duration-500 shadow-sm hover:shadow-xl",
            collapsed ? "opacity-90" : "bg-white",
            def.border
        )}>
            {/* Header */}
            <div className={cn(
                "px-8 py-5 flex items-center justify-between border-b-2",
                def.bg, def.border
            )}>
                <div className="flex items-center gap-5">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5",
                        def.bg.replace('bg-', 'bg-').replace('-50', '-500') // Dynamic primary for icon
                    ).replace('bg-indigo-500', 'bg-indigo-600').replace('bg-blue-500', 'bg-blue-600').replace('bg-rose-500', 'bg-rose-600').replace('bg-sky-500', 'bg-sky-600').replace('bg-violet-500', 'bg-violet-600').replace('bg-emerald-500', 'bg-emerald-600').replace('bg-amber-500', 'bg-amber-600')}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className={cn("font-black text-xs uppercase tracking-[0.2em]", def.color)}>
                            ESTACIÓN {idx + 1}: {def.label}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {def.emoji} Configuración de Interacción
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex rounded-xl bg-white/50 p-1 border border-white/80 mr-4">
                        <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => onMove('up')} className="h-8 w-8 text-slate-400 hover:text-blue-600"><ChevronUp className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" disabled={idx === total - 1} onClick={() => onMove('down')} className="h-8 w-8 text-slate-400 hover:text-blue-600"><ChevronDown className="w-4 h-4" /></Button>
                    </div>
                    
                    <button 
                        onClick={() => setCollapsed(!collapsed)} 
                        className="h-10 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                        {collapsed ? 'EDITAR ESTACIÓN' : 'MINIMIZAR'}
                    </button>

                    <Button variant="ghost" size="icon" onClick={onDelete} className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            {/* Content */}
            {!collapsed && (
                <CardContent className="p-10 bg-white/50 backdrop-blur-sm">
                    {screen.type === 'welcome' && <WelcomeEditor data={screen.data} onChange={onChange} />}
                    {screen.type === 'video' && <VideoEditor data={screen.data} onChange={onChange} />}
                    {screen.type === 'image_choice' && <ImageChoiceEditor data={screen.data} onChange={onChange} />}
                    {screen.type === 'drag_drop' && <DragDropEditor data={screen.data} onChange={onChange} />}
                    {screen.type === 'animation_interaction' && <AnimationEditor data={screen.data} onChange={onChange} />}
                    {screen.type === 'creative_choice' && <CreativeChoiceEditor data={screen.data} onChange={onChange} />}
                    {screen.type === 'celebration' && <CelebrationEditor data={screen.data} onChange={onChange} />}
                </CardContent>
            )}
        </Card>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function RagKidsEditor({ levelId, onClose, user, instModuleId }: RagKidsProps) {
    const [title, setTitle] = useState("");
    const [screens, setScreens] = useState<MissionScreen[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);

    useEffect(() => {
        if (instModuleId) {
            // Load from institutional API if we have the module ID
            institutionalCurriculumApi.getModule(instModuleId).then(mod => {
                if (mod && mod.contenido) {
                    setTitle(mod.titulo);
                    setScreens(mod.contenido.steps || mod.contenido.screens || []);
                }
            });
        } else {
            // Fallback load
            kidsProfessorApi.getTemplateByType(levelId, 'rag_kids').then(data => {
                if (data) {
                    setTitle(data.titulo);
                    setScreens(data.actividades?.steps || data.actividades?.screens || []);
                }
            });
        }
    }, [levelId, instModuleId]);

    const addScreen = (type: ScreenType) => {
        setScreens([...screens, { id: crypto.randomUUID(), type, data: defaultData(type) }]);
        setShowAddMenu(false);
    };

    const updateScreen = (idx: number, newData: any) => {
        const ns = [...screens];
        ns[idx] = { ...ns[idx], data: { ...ns[idx].data, ...newData } };
        setScreens(ns);
    };

    const deleteScreen = (idx: number) => setScreens(screens.filter((_, i) => i !== idx));

    const moveScreen = (idx: number, dir: 'up' | 'down') => {
        const ns = [...screens];
        const t = dir === 'up' ? idx - 1 : idx + 1;
        if (t < 0 || t >= ns.length) return;
        [ns[idx], ns[t]] = [ns[t], ns[idx]];
        setScreens(ns);
    };

    const handleSave = async () => {
        if (!title) { toast.error("Falta el título de la misión"); return; }
        setLoading(true);
        try {
            const activitiesData = { steps: screens };
            
            // 1. Always save to legacy kids templates for compatibility
            await kidsProfessorApi.saveTypedTemplate(levelId, 'rag_kids', {
                titulo: title,
                tipo: 'rag_kids',
                actividades: activitiesData,
                configuracion: { primaryColor: '#2563eb' } // Blue-600
            });

            // 2. If institutional, also update the module content
            if (instModuleId) {
                await institutionalCurriculumApi.updateModule(instModuleId, {
                    titulo: title,
                    contenido: activitiesData
                });
            }

            toast.success("¡Misión RAC Guardada con éxito! 🚀");
            onClose();
        } catch {
            toast.error("Error al guardar la misión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Top Bar - Genia Blue Engineering Style */}
            <header className="bg-white border-b-[6px] border-blue-600 px-8 py-5 flex items-center justify-between shadow-xl z-20 shrink-0">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={onClose} 
                        className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                            MAPA DE <span className="text-blue-600">MISIÓN RAC</span> KIDS
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                             <Rocket className="w-3 h-3 text-blue-500" /> {screens.length} ESTACIONES EN LA RUTA · INGENIERÍA KIDS
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Screen count pills */}
                    <div className="hidden xl:flex items-center bg-slate-50 p-2 rounded-2xl border-2 border-slate-100 gap-1.5 shadow-inner">
                        {screens.map((s, i) => {
                            const def = SCREEN_DEFS.find(d => d.type === s.type);
                            return (
                                <div key={i} title={def?.label} className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center text-lg border-2 transition-all shadow-sm",
                                    def?.border, def?.bg
                                )}>
                                    {def?.emoji}
                                </div>
                            );
                        })}
                    </div>
                    <div className="w-px h-10 bg-slate-200 mx-2 hidden xl:block" />
                    <Button variant="outline" onClick={onClose} className="rounded-2xl border-2 border-slate-200 font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="rounded-2xl bg-[#0F172A] hover:bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest h-12 px-10 shadow-lg shadow-blue-500/20 group">
                        {loading ? <RotateCcw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
                        {loading ? 'Sincronizando...' : 'Finalizar Diseño'}
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-grid-slate-100/50">
                <div className="max-w-4xl mx-auto p-12 space-y-8 pb-32">
                    {/* Mission Identity Header Card */}
                    <Card className="rounded-[2.5rem] border-0 shadow-2xl shadow-blue-900/5 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />
                        <CardContent className="p-10 bg-white">
                            <div className="flex items-center gap-4 mb-4">
                                <Badge className="bg-blue-600 text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                                    Identidad de Misión
                                </Badge>
                            </div>
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Título del Proyecto RAC</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)}
                                placeholder="Ej: ¡CONSTRUYE TU PRIMERA CIUDAD EN ROBLOX!"
                                className="rounded-2xl h-16 text-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-blue-100 font-black mt-3 transition-all placeholder:text-slate-200" />
                            <p className="mt-4 text-[11px] text-slate-400 font-medium flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-blue-400" /> Este título será lo primero que el estudiante vea al iniciar la aventura.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Progress line indicator (vertical) */}
                    <div className="relative pl-10 space-y-10">
                        <div className="absolute left-[19px] top-6 bottom-6 w-1 bg-gradient-to-b from-blue-200 via-indigo-100 to-transparent rounded-full" />
                        
                        {screens.map((screen, idx) => (
                            <div key={screen.id} className="relative group">
                                {/* Connector Dot */}
                                <div className="absolute -left-[51px] top-8 w-6 h-6 rounded-full bg-white border-4 border-blue-600 z-10 shadow-lg group-hover:scale-125 transition-transform" />
                                
                                <ScreenBlock
                                    screen={screen}
                                    idx={idx}
                                    total={screens.length}
                                    onChange={d => updateScreen(idx, d)}
                                    onDelete={() => deleteScreen(idx)}
                                    onMove={d => moveScreen(idx, d)}
                                />
                            </div>
                        ))}

                        {/* Add Screen Interface */}
                        <div className="relative group">
                            <div className="absolute -left-[51px] top-8 w-6 h-6 rounded-full bg-slate-200 border-4 border-white z-10" />
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setShowAddMenu(!showAddMenu)}
                                    className={cn(
                                        "w-full h-24 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all border-4 border-dashed flex flex-col items-center justify-center gap-2",
                                        showAddMenu 
                                            ? "bg-blue-600 text-white border-blue-600 shadow-2xl shadow-blue-500/40" 
                                            : "bg-white text-blue-600 border-blue-100 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                                    )}
                                >
                                    <Plus className={cn("w-7 h-7 transition-transform duration-500", showAddMenu && "rotate-45")} />
                                    {showAddMenu ? 'CANCELAR SELECCIÓN' : 'INYECTAR NUEVA ESTACIÓN'}
                                </button>

                                <AnimatePresence>
                                {showAddMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        className="mt-6 bg-slate-900 rounded-[3rem] border-0 shadow-2xl p-10 grid grid-cols-2 md:grid-cols-4 gap-4 z-10"
                                    >
                                        {SCREEN_DEFS.map(sd => {
                                            const Icon = sd.icon;
                                            return (
                                                <button 
                                                    key={sd.type} 
                                                    onClick={() => addScreen(sd.type)}
                                                    className="group/btn bg-white/5 hover:bg-blue-600 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-3 transition-all transform hover:-translate-y-2"
                                                >
                                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover/btn:bg-white/20 transition-colors">
                                                        <Icon className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-black text-[10px] uppercase tracking-widest text-white mb-1">{sd.label}</p>
                                                        <p className="text-[8px] text-slate-400 font-bold leading-tight group-hover/btn:text-blue-100">{sd.description}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop footer decoration */}
            <div className="h-6 bg-[#0F172A] w-full flex items-center justify-center px-10 gap-8 overflow-hidden opacity-50 shrink-0">
                {Array.from({length: 10}).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        <Layers className="w-3 h-3" /> GENIA KIDS ENGINEERING SYSTEM 2.0
                    </div>
                ))}
            </div>
        </div>
    );
}

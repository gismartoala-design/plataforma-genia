import React, { useState, useRef } from 'react';
import { Video, Link2, Upload, Loader2, CheckCircle2, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import apiClient from '@/services/api.client';

interface VideoEditorProps {
    data: any;
    onSave: (data: any) => void;
    isReadOnly?: boolean;
}

export const VideoEditor = ({ data, onSave, isReadOnly = false }: VideoEditorProps) => {
    const [url, setUrl] = useState(data.url || '');
    const [titulo, setTitulo] = useState(data.titulo || '');
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Formato no soportado. Usa MP4, WebM, OGG o MOV.');
            return;
        }
        setUploading(true);
        setUploadError('');
        setUploadSuccess(false);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res: any = await apiClient.post('/api/professor/upload', formData);
            setUrl(res.url || res);
            setUploadSuccess(true);
            if (!titulo) setTitulo(file.name.replace(/\.[^.]+$/, ''));
        } catch (err: any) {
            setUploadError('Error al subir el video. Inténtalo de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    const isYoutubeOrVimeo = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');

    return (
        <div className="space-y-6 p-1">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                        <Video className="w-5 h-5 text-rose-400" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-rose-400">Título del Video</Label>
                </div>
                <Input
                    readOnly={isReadOnly}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Tutorial de Soldadura..."
                    className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-rose-500/50 transition-all text-white font-bold"
                />
            </div>

            {!isReadOnly && (
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Subir Archivo de Video</Label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "relative h-28 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all",
                            uploading ? "border-rose-500/30 bg-rose-500/5" :
                            uploadSuccess ? "border-rose-500/60 bg-rose-500/10" :
                            "border-white/10 hover:border-rose-500/40 hover:bg-white/5"
                        )}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Subiendo video...</p>
                            </>
                        ) : uploadSuccess ? (
                            <>
                                <CheckCircle2 className="w-8 h-8 text-rose-400" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">¡Video subido correctamente!</p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-slate-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Haz clic para elegir un video (MP4, WebM)</p>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/webm,video/ogg,video/quicktime"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>
                    {uploadError && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <p className="text-[10px] font-bold text-red-400">{uploadError}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-white/10 flex items-center justify-center">
                        <Link2 className="w-5 h-5 text-white/50" />
                    </div>
                    <Label className="text-sm font-black uppercase tracking-[0.2em] text-white/50">URL del Recurso (YouTube/Vimeo/Directo)</Label>
                </div>
                <Input
                    readOnly={isReadOnly}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="h-14 bg-slate-900 border-white/10 rounded-xl px-6 focus:border-rose-500/50 transition-all text-white font-medium"
                />
            </div>

            {url && (
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-3">
                    <Play className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-rose-400 truncate hover:underline">
                        {isYoutubeOrVimeo ? 'Ver en YouTube/Vimeo →' : url}
                    </a>
                </div>
            )}

            {!isReadOnly && (
                <Button
                    onClick={() => onSave({ url, titulo })}
                    disabled={!url || !titulo}
                    className="w-full h-14 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest italic"
                >
                    Confirmar Video
                </Button>
            )}
        </div>
    );
};

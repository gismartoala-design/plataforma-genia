import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Link as LinkIcon } from "lucide-react";
import kidsProfessorApi from "../services/kidsProfessor.api";
import { toast } from "@/hooks/use-toast";

interface ImageUploadInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    accept?: string;
    professorId?: string;
}

export function ImageUploadInput({ value, onChange, placeholder, label, accept = "image/*", professorId: propProfessorId }: ImageUploadInputProps) {
    const professorId = propProfessorId || (() => {
        const savedUser = localStorage.getItem("edu_user");
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                return user.id?.toString() || "1";
            } catch { return "1"; }
        }
        return "1";
    })();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const { url } = await kidsProfessorApi.uploadFile(file, professorId);
            onChange(url);
            toast({ title: "¡Archivo subido!", description: "La imagen se ha guardado correctamente." });
        } catch (error) {
            console.error("Error uploading file:", error);
            toast({ title: "Error al subir", description: "No se pudo cargar el archivo.", variant: "destructive" });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-1">
            {label && <label className="text-xs font-black uppercase text-slate-500">{label}</label>}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input 
                        value={value} 
                        onChange={e => onChange(e.target.value)} 
                        placeholder={placeholder || "https://..."} 
                        className="rounded-xl h-11 pr-10" 
                    />
                    <LinkIcon className="absolute right-3 top-3 w-4 h-4 text-slate-300" />
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept={accept} 
                    className="hidden" 
                />
                <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-xl h-11 px-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-600 transition-all font-bold"
                >
                    {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Upload className="w-5 h-5 mr-2" />
                            Subir
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

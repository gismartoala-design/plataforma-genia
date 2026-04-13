import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { institutionApi } from '@/services/institution.api';
import { toast } from '@/hooks/use-toast';

interface Props {
  courseId: number;
  sectionId?: number; // Optional section fallback
  onCreated: () => void;
}

export const AuthenticClassCreator = ({ courseId, sectionId, onCreated }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'authentic_class',
    duracionDias: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo) {
      toast({ title: "Falta el título", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // In the backend schema:
      // If we use standard modulosInst creation from institutional curriculum
      const payload = {
        cursoId: courseId,
        seccionId: sectionId || 1, // Fallback if sections mapping is required
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        activo: true,
        bloqueado: false
      };

      // Depending on API, we hit createModule. Wait, institutionApi has createModule taking {nombreModulo, duracionDias, cursoId} mapped to old modulos.
      // If we map to modulosInst we likely need to use curriculum framework, or fallback to standard createModule payload structure.
      await institutionApi.createModule({
        nombreModulo: formData.titulo,
        duracionDias: formData.duracionDias,
        cursoId: courseId
      });

      toast({ title: "Clase Auténtica Creada", description: "Se ha añadido a tu curso exitosamente." });
      onCreated();
      setFormData({ ...formData, titulo: '', descripcion: '' });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo crear la clase auténtica.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm" style={{borderColor:'var(--inst-powder)'}}>
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{background:'var(--inst-bg)', color:'var(--inst-blue)'}}>
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight" style={{color:'var(--inst-deep)'}}>
            Creador de Clases Auténticas
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Diseña experiencias fuera de la malla estándar
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--inst-blue)]">Título de la Clase</label>
          <Input 
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            placeholder="Ej: Análisis de Sistemas Climáticos"
            className="h-12 rounded-xl focus-visible:ring-[var(--inst-cyan)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--inst-blue)]">Descripción y Objetivos</label>
          <Textarea 
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            placeholder="¿Qué lograrán los estudiantes hoy?... "
            className="min-h-[120px] rounded-xl focus-visible:ring-[var(--inst-cyan)] p-4 resize-none"
          />
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-900 font-medium">Las clases auténticas se activan automáticamente para todos los estudiantes de este curso.</p>
        </div>

        <div className="pt-4 border-t border-[var(--inst-powder)]">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:-translate-y-1 transition-transform"
            style={{background:'linear-gradient(135deg, var(--inst-blue) 0%, var(--inst-cyan) 100%)', color:'white'}}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Desplegar Clase Auténtica</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthenticClassCreator;

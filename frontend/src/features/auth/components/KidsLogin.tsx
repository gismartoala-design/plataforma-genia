import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from '../services/auth.api';
import { motion, AnimatePresence } from "framer-motion";
import { Delete } from "lucide-react";

const ICONS = [
  { id: '1', emoji: '🐶', name: 'Perro' },
  { id: '2', emoji: '🐱', name: 'Gato' },
  { id: '3', emoji: '🐭', name: 'Ratón' },
  { id: '4', emoji: '🐰', name: 'Conejo' },
  { id: '5', emoji: '🦊', name: 'Zorro' },
  { id: '6', emoji: '🐻', name: 'Oso' },
  { id: '7', emoji: '🐼', name: 'Panda' },
  { id: '8', emoji: '🐸', name: 'Rana' },
  { id: '9', emoji: '🐵', name: 'Mono' },
];

interface KidsLoginProps {
  onLogin: (role: any, name: string, id: string, planId?: number, accessToken?: string, institucionId?: number, roleId?: number, cursoId?: number) => void;
  onSwitchToNormal: () => void;
}

export default function KidsLogin({ onLogin, onSwitchToNormal }: KidsLoginProps) {
  const [username, setUsername] = useState("");
  const [pattern, setPattern] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleIconClick = (id: string) => {
    if (pattern.length < 4) {
      const newPattern = [...pattern, id];
      setPattern(newPattern);
      if (newPattern.length === 4) {
        handleLogin(newPattern);
      }
    }
  };

  const handleRemoveLast = () => {
    setPattern(prev => prev.slice(0, -1));
  };

  const handleLogin = async (currentPattern: string[]) => {
    if (!username) {
      toast({ title: "Falta tu nombre", description: "Escribe tu nombre mágico primero.", variant: "destructive" });
      setPattern([]);
      return;
    }

    setLoading(true);
    try {
      // Enviamos el 'username' tal cual (que puede ser el nombre del niño o su correo)
      // El backend se encargará de buscar en la columna 'nombre' o 'email'.
      const email = username;
      const password = currentPattern.join('-'); // e.g. "1-4-2-9"
      
      const data = await authApi.login({ email, password });
      const user = data.user;
      
      const u = user as any;
      onLogin("kids", u.nombre || username, String(u.id), u.planId || 0, data.access_token, u.institucionId || undefined, u.roleId, u.cursoId);
      
      setLocation("/kids-dashboard");
      toast({ title: "¡Súper!", description: `Bienvenido a tu aventura.` });
    } catch (error: any) {
      toast({ title: "Ups...", description: "Ese patrón no es correcto. ¡Inténtalo de nuevo!", variant: "destructive" });
      setPattern([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-sky-300 to-indigo-500 selection:bg-yellow-300/30 font-sans">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">☁️</div>
        <div className="absolute top-20 right-20 text-6xl opacity-20 animate-bounce delay-150">🎈</div>
        <div className="absolute bottom-20 left-1/4 text-6xl opacity-20 animate-pulse">🌟</div>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white/90 backdrop-blur-xl border-4 border-white rounded-[3rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md z-10 flex flex-col items-center"
      >
        <h1 className="text-4xl font-black text-indigo-600 mb-6 text-center drop-shadow-sm">¡Hola Genio! 🚀</h1>
        
        <div className="w-full mb-8">
          <label className="text-lg font-bold text-slate-600 mb-2 block text-center">¿Cuál es tu nombre?</label>
          <Input 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ejemplo: mateo"
            className="text-center text-2xl h-14 rounded-2xl border-4 border-indigo-100 placeholder:text-slate-300 font-bold focus-visible:ring-indigo-400"
            autoComplete="off"
            autoCorrect="off"
          />
        </div>

        <div className="w-full mb-6">
          <label className="text-lg font-bold text-slate-600 mb-4 block text-center">Tu Clave Secreta</label>
          
          <div className="flex justify-center gap-3 mb-6 h-16">
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index}
                className={`w-14 h-14 rounded-2xl border-4 flex items-center justify-center text-3xl transition-all duration-300
                  ${pattern[index] ? 'border-green-400 bg-green-50 scale-110 shadow-lg' : 'border-slate-200 bg-slate-50'}`}
              >
                {pattern[index] ? ICONS.find(i => i.id === pattern[index])?.emoji : '❓'}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {ICONS.map((icon) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={icon.id}
                onClick={() => handleIconClick(icon.id)}
                disabled={loading || pattern.length >= 4}
                className="aspect-square bg-white border-4 border-indigo-50 rounded-2xl text-4xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex items-center justify-center"
              >
                {icon.emoji}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="w-full flex justify-between mt-4">
          <Button 
            variant="ghost" 
            onClick={handleRemoveLast}
            disabled={pattern.length === 0 || loading}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
          >
            <Delete className="w-6 h-6 mr-2" /> Borrar
          </Button>

          <Button 
            variant="link" 
            onClick={onSwitchToNormal}
            className="text-indigo-400 hover:text-indigo-600 font-bold"
          >
            Soy Profesor/Adulto
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

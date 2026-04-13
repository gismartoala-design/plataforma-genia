import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, X, MessageSquare, Wrench, HardHat, 
  Construction, Sparkles, AlertCircle, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import apiClient from '@/services/api.client';
import foremanConfig from '../data/foreman-config.json';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ForemanAssistantProps {
  moduleTitle: string;
  moduleContent: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ForemanAssistant = ({ moduleTitle, moduleContent, isOpen, onClose }: ForemanAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const g = foremanConfig.personality.phrases.greetings;
      const welcomeMsg: Message = {
        id: 'welcome',
        type: 'bot',
        content: g[Math.floor(Math.random() * g.length)],
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Construction of ground truth context
      const blocksDescription = moduleContent?.blocks?.map((b: any) => {
        return `[Bloque ${b.type}]: ${JSON.stringify(b.data)}`;
      }).join('\n') || "No hay bloques específicos en este nivel.";

      const systemPrompt = `
        Identidad: Eres el ${foremanConfig.personality.name}, un ${foremanConfig.personality.role}.
        Estilo: ${foremanConfig.personality.style}
        CONTESTA SIEMPRE EN ESPAÑOL.
        
        CONTEXTO DEL MÓDULO ACTUAL (DATO DE BASE DE DATOS):
        Título: ${moduleTitle}
        Contenido Técnico:
        ${blocksDescription}
        
        INSTRUCCIONES:
        1. Usa términos de construcción (Sector, Obra, Plano, Grúa, etc.) según el glosario técnico.
        2. Responde basándote en el contenido técnico proporcionado. Si no sabes algo, di que "no está en los planos de este sector".
        3. Sé motivador y profesional.
      `;

      const fullPrompt = `${systemPrompt}\n\nPregunta del Estudiante: ${input}`;

      const response = await apiClient.post<{ response: string }>('/api/ai/chat', { prompt: fullPrompt });
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in Foreman AI:', error);
      const errorMsg: Message = {
        id: 'error',
        type: 'bot',
        content: "¡Hubo una falla eléctrica en la radio! No puedo contactar con el centro de mando ahora mismo.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0F172A] z-[600] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/10"
        >
          {/* Header */}
          <div className="p-6 bg-[#1E293B] border-b border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none academic-grid-pattern" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <HardHat className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black italic tracking-tighter uppercase leading-none">Canal de Capataz</h3>
                  <p className="text-orange-400 text-[9px] font-black uppercase tracking-widest mt-1 animate-pulse flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-orange-500" /> Comunicación Activa
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
              <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[8px] font-black shrink-0">CONTEXTO</Badge>
              <span className="text-[10px] text-slate-400 font-bold truncate">Obra: {moduleTitle}</span>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.type === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl relative",
                  msg.type === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-500/10" 
                    : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5 shadow-xl shadow-black/20"
                )}>
                   {msg.type === 'bot' && (
                     <p className="text-[8px] font-black uppercase text-orange-400 tracking-widest mb-1 italic">Mensaje de Radio</p>
                   )}
                   <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                   <span className="text-[8px] opacity-30 mt-2 block text-right font-mono">
                     {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-2 items-center">
                  <RefreshCw className="w-3 h-3 text-orange-500 animate-spin" />
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Consultando planos...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-[#0B132C] border-t border-white/5">
            <div className="flex gap-2 p-2 bg-white/5 rounded-[1.5rem] border border-white/10 focus-within:border-orange-500/50 transition-all">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu consulta técnica aquí..."
                className="flex-1 bg-transparent border-0 text-white placeholder:text-slate-500 focus-visible:ring-0 h-10"
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "w-10 h-10 rounded-xl transition-all p-0",
                  input.trim() ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-white/5 text-slate-500"
                )}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-center text-[8px] text-slate-600 mt-3 uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles className="w-2 h-2" /> Búho Capataz Genia AI v4.1 — Datos de Obra en Tiempo Real
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

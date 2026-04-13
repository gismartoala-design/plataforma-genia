import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Plus, Trash2, Database, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface QAPair {
  id: string;
  question: string;
  answer: string;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export const ChatbotBuilderLab = () => {
  const [pairs, setPairs] = useState<QAPair[]>([
    { id: '1', question: 'hola', answer: '¡Hola humano! Soy un Constructor-Bot.' },
    { id: '2', question: 'reparar', answer: 'Para reparar el sector, debes escribir código limpio.' }
  ]);
  
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 'start', sender: 'bot', text: 'Sistemas en línea. Listo para aprender.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addPair = () => {
    if (!newQ.trim() || !newA.trim()) return;
    setPairs([...pairs, { id: Date.now().toString(), question: newQ.trim().toLowerCase(), answer: newA.trim() }]);
    setNewQ('');
    setNewA('');
  };

  const removePair = (id: string) => {
    setPairs(pairs.filter(p => p.id !== id));
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    const userText = chatInput.trim();
    const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulate bot thinking
    setTimeout(() => {
        // Find best match (simple keyword match)
        const lowerText = userText.toLowerCase();
        const match = pairs.find(p => lowerText.includes(p.question));
        
        const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: match ? match.answer : 'Esa instrucción no está en mi base de datos. ¡Entréname en el panel izquierdo!'
        };
        setMessages(prev => [...prev, botResponse]);
    }, 600);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-[#020617] text-white">
      {/* Panel de Entrenamiento (Base de Datos) */}
      <div className="md:w-1/2 flex flex-col bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden safety-border relative">
        <div className="bg-slate-800 border-b border-white/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
             <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black italic uppercase text-lg tracking-tighter">Memoria del Bot</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base de Conocimientos</p>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4 border-b border-white/5 bg-slate-900/50">
           <div className="space-y-2">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Cuando el usuario escriba (Palabra clave):</p>
             <Input 
                value={newQ}
                onChange={e => setNewQ(e.target.value)}
                placeholder="Ej. 'gracias'"
                className="bg-black/50 border-white/10 text-white rounded-xl h-10"
             />
           </div>
           <div className="space-y-2">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">El bot responderá:</p>
             <Input 
                value={newA}
                onChange={e => setNewA(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPair()}
                placeholder="Ej. '¡De nada humano!'"
                className="bg-black/50 border-white/10 text-white rounded-xl h-10"
             />
           </div>
           <Button onClick={addPair} className="bg-cyan-600 hover:bg-cyan-500 text-white h-10 rounded-xl font-bold gap-2">
              <Plus className="w-4 h-4" /> Entrenar Instrucción
           </Button>
        </div>

        <ScrollArea className="flex-1 p-4 bg-slate-900">
           <AnimatePresence>
              {pairs.map(p => (
                 <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 mb-3 group"
                 >
                    <div className="overflow-hidden">
                       <p className="text-xs font-black text-cyan-400 uppercase">Q: {p.question}</p>
                       <p className="text-sm text-slate-300 font-medium italic mt-1 truncate">A: {p.answer}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removePair(p.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity shrink-0">
                       <Trash2 className="w-4 h-4" />
                    </Button>
                 </motion.div>
              ))}
           </AnimatePresence>
           {pairs.length === 0 && (
             <div className="text-center p-8 text-slate-500 italic opacity-50">Base de datos vacía</div>
           )}
        </ScrollArea>
      </div>

      {/* Terminal de Pruebas (Chat en Vivo) */}
      <div className="md:w-1/2 flex flex-col bg-black border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
         <div className="bg-slate-900 border-b border-white/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 border border-orange-500/30 flex items-center justify-center animate-pulse">
             <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black italic uppercase text-lg tracking-tighter">Consola de Prueba</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enlace Directo</p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6 flex flex-col gap-4">
           {messages.map(msg => (
              <div key={msg.id} className={cn("flex w-full mb-6", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                 <div className={cn(
                    "max-w-[80%] flex items-end gap-2",
                    msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
                 )}>
                    <div className={cn(
                       "w-8 h-8 rounded-full shrink-0 flex items-center justify-center border",
                       msg.sender === 'user' ? "bg-cyan-600/30 border-cyan-500/50 text-cyan-400" : "bg-orange-600/30 border-orange-500/50 text-orange-500"
                    )}>
                       {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                       "p-3 rounded-2xl text-sm font-medium",
                       msg.sender === 'user' 
                          ? "bg-slate-800 rounded-br-sm border border-slate-700" 
                          : "bg-slate-900 border border-white/10 rounded-bl-sm italic"
                    )}>
                       {msg.text}
                    </div>
                 </div>
              </div>
           ))}
           <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="p-4 bg-slate-900 border-t border-white/10 flex gap-2">
           <Input 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Habla con el bot..."
              className="bg-black/50 border-white/10 rounded-xl h-12 text-white"
           />
           <Button onClick={sendMessage} className="h-12 w-12 rounded-xl bg-orange-600 hover:bg-orange-500 shrink-0">
              <Send className="w-5 h-5" />
           </Button>
        </div>
      </div>
    </div>
  );
};

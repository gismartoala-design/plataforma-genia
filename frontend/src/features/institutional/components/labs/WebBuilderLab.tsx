
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Eye, 
  Play, 
  Save, 
  ExternalLink,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  History,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const WebBuilderLab = () => {
    const [html, setHtml] = useState('<!-- Escribe tu HTML aquí -->\n<div class="box">\n  <h1>¡Hola Mundo!</h1>\n  <p>Estoy creando mi primera página web.</p>\n</div>');
    const [css, setCss] = useState('/* Escribe tu CSS aquí */\n.box {\n  padding: 40px;\n  background: linear-gradient(135deg, #f97316, #ea580c);\n  color: white;\n  border-radius: 30px;\n  text-align: center;\n  font-family: sans-serif;\n  box-shadow: 0 20px 40px rgba(0,0,0,0.3);\n}');
    const [srcDoc, setSrcDoc] = useState('');
    const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <html>
                    <style>${css}</style>
                    <body>${html}</body>
                </html>
            `);
        }, 500);

        return () => clearTimeout(timeout);
    }, [html, css]);

    return (
        <div className="flex flex-col h-full bg-[#020617] text-white">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Globe className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tighter">Web Builder Pro</h3>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Compilador HTML/CSS en tiempo real</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mr-4">
                        <button 
                            onClick={() => setViewMode('desktop')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'desktop' ? "bg-white/10 text-white" : "text-slate-500")}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('tablet')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'tablet' ? "bg-white/10 text-white" : "text-slate-500")}
                        >
                            <Tablet className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('mobile')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'mobile' ? "bg-white/10 text-white" : "text-slate-500")}
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <Button variant="outline" className="h-10 border-white/10 bg-white/5 font-bold uppercase text-[10px] tracking-widest gap-2">
                        <Save className="w-3 h-3" /> Guardar
                    </Button>
                    <Button className="h-10 bg-emerald-600 hover:bg-emerald-500 font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-emerald-500/20">
                        <Play className="w-3 h-3" /> Publicar
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Side Editor */}
                <div className="w-1/2 flex flex-col border-r border-white/5">
                    <div className="flex border-b border-white/5 bg-slate-900/30">
                        <button 
                            onClick={() => setActiveTab('html')}
                            className={cn(
                                "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                                activeTab === 'html' ? "border-orange-500 text-white bg-white/5" : "border-transparent text-slate-500"
                            )}
                        >
                            index.html
                        </button>
                        <button 
                            onClick={() => setActiveTab('css')}
                            className={cn(
                                "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                                activeTab === 'css' ? "border-cyan-500 text-white bg-white/5" : "border-transparent text-slate-500"
                            )}
                        >
                            styles.css
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <textarea
                            value={activeTab === 'html' ? html : css}
                            onChange={(e) => activeTab === 'html' ? setHtml(e.target.value) : setCss(e.target.value)}
                            className="absolute inset-0 w-full h-full bg-[#0a0f1e] p-8 font-mono text-sm text-cyan-400 outline-none resize-none selection:bg-cyan-500 selection:text-black"
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Preview Area */}
                <div className="w-1/2 bg-slate-950 flex items-center justify-center p-8 overflow-auto">
                    <motion.div 
                        animate={{ 
                            width: viewMode === 'mobile' ? 375 : viewMode === 'tablet' ? 768 : '100%',
                            height: '100%'
                        }}
                        className="bg-white rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-4 border-slate-800"
                    >
                        <iframe
                            srcDoc={srcDoc}
                            title="preview"
                            sandbox="allow-scripts"
                            width="100%"
                            height="100%"
                            className="bg-white"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="px-6 py-3 border-t border-white/5 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-500">
                <div className="flex gap-6">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Servidor Activo</span>
                    <span>Charset: UTF-8</span>
                </div>
                <div>Líneas: {(activeTab === 'html' ? html : css).split('\n').length}</div>
            </div>
        </div>
    );
};

const Globe = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);


import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2,
  Tag,
  CircleDot,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ClasificacionEditorProps {
    data: any;
    onSave: (data: any) => void;
}

export const ClasificacionEditor = ({ data, onSave }: ClasificacionEditorProps) => {
    const [categories, setCategories] = useState<string[]>(data.categories || ['', '']);
    const [items, setItems] = useState<{text: string, categoryIdx: number}[]>(data.items || []);
    const [newItemText, setNewItemText] = useState('');
    const [newItemCategory, setNewItemCategory] = useState(0);

    const handleAddItem = () => {
        if (!newItemText) return;
        setItems([...items, { text: newItemText, categoryIdx: newItemCategory }]);
        setNewItemText('');
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-amber-400 font-black uppercase tracking-widest text-[10px]">
                    <Layers className="w-4 h-4" /> Categorías de Clasificación
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {categories.map((cat, i) => (
                        <div key={i} className="space-y-2">
                             <span className="text-[9px] font-black text-slate-500">CATEGORÍA {i+1}</span>
                             <Input 
                                value={cat}
                                onChange={(e) => {
                                    const next = [...categories];
                                    next[i] = e.target.value;
                                    setCategories(next);
                                }}
                                placeholder={`Ej: Software`}
                                className="bg-white/5 border-white/10 rounded-xl h-12 text-white font-bold"
                             />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                 <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-6 space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder="Elemento a clasificar..."
                            className="bg-white/5 border-white/10 rounded-xl h-12"
                        />
                        <select 
                            value={newItemCategory}
                            onChange={(e) => setNewItemCategory(Number(e.target.value))}
                            className="bg-slate-800 border-white/10 rounded-xl px-4 text-xs font-bold text-white outline-none"
                        >
                            {categories.map((cat, i) => (
                                <option key={i} value={i}>{cat || `Categoría ${i+1}`}</option>
                            ))}
                        </select>
                        <Button 
                            onClick={handleAddItem}
                            className="h-12 w-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {items.map((item, i) => (
                            <Badge key={i} className="bg-white/5 border-white/10 text-slate-300 py-2 px-4 rounded-xl gap-2 flex items-center group">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    item.categoryIdx === 0 ? "bg-cyan-500" : "bg-orange-500"
                                )} />
                                {item.text}
                                <button onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                                    <Trash2 className="w-3 h-3 text-slate-500 group-hover:text-red-400 transition-colors" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                 </div>
            </div>

            <Button 
                onClick={() => onSave({ categories, items })}
                disabled={items.length === 0 || categories.some(c => !c)}
                className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest italic"
            >
                Confirmar Sistema de Clasificación
            </Button>
        </div>
    );
};

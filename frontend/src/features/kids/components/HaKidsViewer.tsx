import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Play, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import studentApi from '@/features/student/services/student.api';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import confetti from 'canvas-confetti';

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function BlockRenderer({ block, idx }: { block: any; idx: number }) {
  const [mcAnswer, setMcAnswer] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  if (block.type === 'video') {
    const ytId = getYouTubeId(block.data.url || '');
    return (
      <div className="space-y-3">
        {block.data.title && <h3 className="text-xl font-black text-slate-800">{block.data.title}</h3>}
        {ytId ? (
          <div className="aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-xl">
            <iframe
              width="100%" height="100%"
              src={`https://www.youtube.com/embed/${ytId}`}
              frameBorder="0" allowFullScreen title={block.data.title}
            />
          </div>
        ) : (
          <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center border-4 border-white">
            <div className="text-center text-slate-400">
              <Play className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p className="font-bold">Video no configurado</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'step') {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6">
        <p className="text-lg font-bold text-slate-700 leading-relaxed">{block.data.text}</p>
      </div>
    );
  }

  if (block.type === 'multiple_choice') {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-800">{block.data.question}</h3>
        <div className="grid gap-3">
          {block.data.options?.map((opt: string, i: number) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setMcAnswer(i);
                if (i === block.data.correctIndex) {
                  confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
                }
              }}
              className={`p-4 rounded-2xl border-3 text-left font-bold transition-all text-lg ${
                mcAnswer === i
                  ? i === block.data.correctIndex
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                    : 'bg-red-100 border-red-400 text-red-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span className="mr-3">{['A', 'B', 'C', 'D'][i]}.</span>{opt}
              {mcAnswer === i && i === block.data.correctIndex && (
                <CheckCircle2 className="inline w-5 h-5 ml-2 text-emerald-500" />
              )}
            </motion.button>
          ))}
        </div>
        {mcAnswer !== null && mcAnswer !== block.data.correctIndex && (
          <p className="text-red-600 font-bold text-center">¡Inténtalo de nuevo! La respuesta correcta es otra.</p>
        )}
      </div>
    );
  }

  if (block.type === 'image_upload') {
    return (
      <div className="space-y-4">
        <p className="text-xl font-black text-slate-800">{block.data.instruction}</p>
        {block.data.exampleUrl && (
          <img src={block.data.exampleUrl} alt="Ejemplo" className="max-h-48 mx-auto object-contain rounded-2xl border-4 border-white shadow-lg" />
        )}
        <div className="bg-pink-50 border-4 border-dashed border-pink-200 rounded-3xl p-8 text-center">
          <input
            type="file" accept="image/*"
            className="hidden" id={`upload-${idx}`}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                const url = URL.createObjectURL(f);
                setUploadedFile(url);
                confetti({ particleCount: 30, spread: 30 });
              }
            }}
          />
          <label htmlFor={`upload-${idx}`} className="cursor-pointer">
            {uploadedFile ? (
              <img src={uploadedFile} alt="Tu trabajo" className="max-h-48 mx-auto object-contain rounded-2xl" />
            ) : (
              <>
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">📸</span>
                </div>
                <p className="font-black text-pink-600 text-lg">Toca para subir tu imagen</p>
                <p className="text-pink-400 text-sm mt-1">JPG, PNG, GIF</p>
              </>
            )}
          </label>
        </div>
      </div>
    );
  }

  if (block.type === 'label_image') {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-800">{block.data.instruction}</h3>
        {block.data.imageUrl && (
          <img src={block.data.imageUrl} alt="Imagen" className="max-h-64 mx-auto object-contain rounded-2xl border-4 border-white shadow-xl" />
        )}
        <div className="grid grid-cols-2 gap-3">
          {block.data.labels?.map((lbl: string, li: number) => (
            <div key={li} className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 font-bold text-amber-800 text-center">
              {li + 1}. {lbl}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === 'match_lines') {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-800">{block.data.instruction}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {block.data.leftItems?.map((item: string, li: number) => (
              <div key={li} className="bg-white border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-700 text-center">
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {block.data.rightItems?.map((item: string, ri: number) => (
              <div key={ri} className="bg-emerald-50 border-2 border-emerald-100 rounded-xl p-3 font-bold text-emerald-800 text-center">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function HaKidsViewer({ user, template, standalone = false, onFinish }: {
  user: any;
  template: any;
  standalone?: boolean;
  onFinish?: () => void;
}) {
  const [, setLocation] = useLocation();
  const [currentBlock, setCurrentBlock] = useState(0);
  const [finished, setFinished] = useState(false);

  const actividades = template?.actividades || {};
  const blocks: any[] = Array.isArray(actividades.blocks) ? actividades.blocks : [];
  const description = actividades.description || '';
  const requirements: string[] = Array.isArray(actividades.requirements) ? actividades.requirements : [];

  const handleFinish = async () => {
    try {
      await studentApi.submitKidsResult({
        estudianteId: user.id,
        plantillaKidsId: template.id,
        resultados: [{ completed: true }],
        calificacionNumerica: 100
      });
      confetti({ particleCount: 100, spread: 70 });
      setFinished(true);
    } catch {
      toast({ title: "Error", description: "No se pudo guardar tu progreso.", variant: "destructive" });
    }
  };

  if (finished) {
    return (
      <div className={`${standalone ? 'fixed inset-0' : 'w-full min-h-[500px] rounded-3xl'} bg-emerald-50 flex flex-col items-center justify-center p-8 text-center`}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
          className="bg-white w-72 h-72 rounded-full flex items-center justify-center shadow-2xl border-8 border-emerald-100 mb-8">
          <Trophy className="w-40 h-40 text-yellow-400" />
        </motion.div>
        <h1 className="text-5xl font-black text-emerald-800 mb-4">¡MISIÓN CUMPLIDA!</h1>
        <p className="text-xl text-emerald-600 font-bold mb-8">¡Eres increíble! Completaste el reto.</p>
        <Button onClick={() => onFinish ? onFinish() : setLocation('/kids-dashboard')}
          className="h-16 px-12 text-2xl font-black rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-xl">
          ¡Ver mi progreso! <ArrowRight className="ml-3 w-6 h-6" />
        </Button>
      </div>
    );
  }

  // If no blocks, show description/requirements as basic view
  if (blocks.length === 0) {
    return (
      <div className={`${standalone ? 'fixed inset-0' : 'w-full min-h-[500px] rounded-3xl'} bg-emerald-50 flex flex-col p-8 overflow-y-auto`}>
        <div className="max-w-3xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-emerald-100">
            <h2 className="text-3xl font-black text-emerald-800 mb-4">{template.titulo}</h2>
            {description && <p className="text-lg text-slate-600 font-medium">{description}</p>}
          </div>
          {requirements.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-emerald-100">
              <h3 className="text-xl font-black text-emerald-700 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" /> Debes entregar:
              </h3>
              <ul className="space-y-3">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                    <span className="w-8 h-8 bg-emerald-100 text-emerald-700 font-black rounded-xl flex items-center justify-center flex-shrink-0">{i+1}</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button onClick={handleFinish} className="w-full h-16 text-xl font-black rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-xl">
            ¡Completé el reto! <Trophy className="ml-3 w-6 h-6" />
          </Button>
        </div>
      </div>
    );
  }

  const block = blocks[currentBlock];
  const isLast = currentBlock === blocks.length - 1;

  return (
    <div className={`${standalone ? 'fixed inset-0' : 'w-full h-full rounded-3xl'} bg-emerald-50 flex flex-col pt-6 pb-6 overflow-hidden`}>
      {/* Header */}
      <div className="px-6 mb-4 flex justify-between items-center max-w-4xl mx-auto w-full">
        <div>
          <h2 className="text-xl font-black text-emerald-800">{template.titulo}</h2>
          {description && <p className="text-sm text-emerald-600 font-medium">{description}</p>}
        </div>
        <div className="flex gap-1">
          {blocks.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i <= currentBlock ? 'bg-emerald-500' : 'bg-white border-2 border-emerald-200'}`} />
          ))}
        </div>
      </div>

      {/* Block content */}
      <div className="flex-1 px-6 max-w-4xl mx-auto w-full overflow-y-auto scrollbar-hide py-4">
        <motion.div
          key={currentBlock}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl border-4 border-emerald-50 min-h-[300px] mb-4 flex flex-col justify-center"
        >
          <BlockRenderer block={block} idx={currentBlock} />
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="px-6 mt-6 flex justify-between max-w-4xl mx-auto w-full">
        {currentBlock > 0 ? (
          <Button variant="outline" onClick={() => setCurrentBlock(c => c - 1)}
            className="rounded-2xl h-12 px-6 border-2 border-emerald-200 font-bold text-emerald-600">
            <ArrowLeft className="w-5 h-5 mr-2" /> Anterior
          </Button>
        ) : <div />}

        {isLast ? (
          <Button onClick={handleFinish}
            className="rounded-2xl h-14 px-10 bg-emerald-500 hover:bg-emerald-600 font-black text-lg shadow-xl">
            ¡Terminé! <Trophy className="ml-2 w-5 h-5" />
          </Button>
        ) : (
          <Button onClick={() => setCurrentBlock(c => c + 1)}
            className="rounded-2xl h-12 px-8 bg-emerald-500 hover:bg-emerald-600 font-black shadow-lg">
            Siguiente <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

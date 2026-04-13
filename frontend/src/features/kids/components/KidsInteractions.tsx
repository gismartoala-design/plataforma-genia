import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Volume2, VolumeX, Play, ArrowRight, RotateCw, 
  Maximize, Minimize, CheckCircle2, Star, 
  Trophy, Castle, Mic, Trash2, ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSpeech } from '@/hooks/useSpeech';

interface ScreenProps {
  data: any;
  onNext: (result?: any) => void;
}

/** Floating narrator button sub-component */
function NarratorButton({ text }: { text: string }) {
  const { speak, isMuted, toggleMute, isSpeaking } = useSpeech({ defaultRate: 0.88, defaultPitch: 1.15 });

  useEffect(() => {
    if (text && !isMuted) {
      const timer = setTimeout(() => speak(text), 500);
      return () => clearTimeout(timer);
    }
  }, [text]);

  return (
    <button
      onClick={() => {
        if (isMuted) {
          toggleMute();
          setTimeout(() => speak(text, true), 100);
        } else {
          speak(text, true);
        }
      }}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-x-4 border-t-4 border-b-8 shadow-lg font-black text-sm transition-all active:border-b-4 active:translate-y-1
        ${isSpeaking ? 'bg-indigo-500 text-white border-indigo-700 animate-pulse' : 'bg-white text-indigo-500 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200'}`}
      title="Escuchar instrucción"
    >
      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      {isSpeaking ? 'Narrando...' : 'Escuchar'}
    </button>
  );
}

/**
 * PANTALLA 1: Bienvenida
 */
export function WelcomeScreen({ data, onNext }: ScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Accept both illustrationUrl (from RagKidsEditor) and backgroundUrl (legacy)
  const imageUrl = data.illustrationUrl || data.backgroundUrl;
  const narrationText = data.subtitle || data.title || '¡Bienvenido a esta aventura de aprendizaje!';

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); }
      else { audioRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col items-center text-center gap-6 w-full max-w-2xl mx-auto">
      {imageUrl && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white"
          style={{ maxHeight: '280px' }}
        >
          <img
            src={imageUrl}
            alt="Ilustración"
            className="w-full object-cover"
            style={{ maxHeight: '280px' }}
            onError={e => (e.currentTarget.style.display = 'none')}
          />
          {data.characterUrl && (
            <motion.img
              src={data.characterUrl}
              alt="Personaje"
              className="absolute -bottom-4 -left-4 w-32 h-32 object-contain drop-shadow-2xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          )}
        </motion.div>
      )}

      <div className="space-y-3">
        <h2 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight">
          {data.title || '¡Bienvenidos!'}
        </h2>
        {data.subtitle && (
          <p className="text-xl text-slate-500 font-bold max-w-lg">{data.subtitle}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 justify-center items-center">
        {data.audioUrl && (
          <>
            <audio ref={audioRef} src={data.audioUrl} onEnded={() => setIsPlaying(false)} />
            <button
              onClick={toggleAudio}
              className={`w-16 h-16 rounded-2xl border-x-4 border-t-4 border-b-8 shadow-xl flex items-center justify-center transition-all active:border-b-4 active:translate-y-1 ${isPlaying ? 'bg-indigo-500 text-white border-indigo-700 animate-pulse' : 'bg-amber-100 text-amber-600 border-amber-300 hover:bg-amber-50'}`}
            >
              {isPlaying ? <Mic className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
            </button>
          </>
        )}
        <NarratorButton text={narrationText} />
        <button
          onClick={() => onNext()}
          className="flex items-center justify-center h-16 px-12 text-2xl font-black rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400 shadow-xl border-x-4 border-t-4 border-b-8 border-emerald-700 active:border-b-4 active:translate-y-1 transition-all"
        >
          {data.buttonText || data.ctaText || 'Comenzar'} <ArrowRight className="ml-3 w-7 h-7 drop-shadow-sm" />
        </button>
      </div>
    </div>
  );
}

/**
 * PANTALLA 2: Video Tutorial
 */
export function VideoScreen({ data, onNext }: ScreenProps) {
  const narrationText = data.notes ? `${data.title || 'Mira este video'}. ${data.notes}` : (data.title || 'Mira este video con atención.');

  return (
    <div className="w-full max-w-4xl space-y-6 text-center">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-3xl font-black text-slate-800">{data.title || 'Mira este video'}</h2>
        <NarratorButton text={narrationText} />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white"
      >
        {data.videoUrl ? (() => {
          // Extraer ID de YouTube y convertir a embed URL para evitar X-Frame-Options
          const getYouTubeId = (url: string) => {
            if (!url) return null;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
          };
          const videoId = getYouTubeId(data.videoUrl);
          const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : data.videoUrl;
          
          return <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Tutorial" />;
        })() : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-4">
            <Play className="w-24 h-24" />
            <p className="font-black text-lg">Próximamente 🎬</p>
          </div>
        )}
      </motion.div>

      {data.notes && (
        <div className="bg-amber-50 border-4 border-amber-200 rounded-3xl p-5 text-left">
          <p className="font-bold text-amber-800 text-base">💡 {data.notes}</p>
        </div>
      )}

      <button
        onClick={() => onNext()}
        className="flex items-center justify-center max-w-sm mx-auto h-16 px-10 text-xl font-black rounded-2xl bg-indigo-500 text-white hover:bg-indigo-400 shadow-xl border-x-4 border-t-4 border-b-8 border-indigo-700 active:border-b-4 active:translate-y-1 transition-all"
      >
        ¡Ya lo ví! Siguiente <ArrowRight className="ml-2 w-5 h-5 drop-shadow-sm" />
      </button>
    </div>
  );
}

/**
 * PANTALLA 3: Elección de imágenes
 */
export function BlockPickerScreen({ data, onNext }: ScreenProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongShake, setWrongShake] = useState<number | null>(null);

  // Normalize from RagKidsEditor format (array of {url, label, correct}) or legacy (options with correctIndex)
  const images: { url: string; label: string; correct: boolean }[] = 
    data.images || 
    (data.options || []).map((opt: any, i: number) => ({ url: opt.imageUrl || opt.url, label: opt.label, correct: i === data.correctIndex }));
  const correctIndex = images.findIndex(img => img.correct);
  const instruction = data.instruction || data.question || '¿Cuál es la correcta?';

  const handleSelect = (idx: number) => {
    setSelected(idx);
    if (idx === correctIndex) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      setTimeout(() => onNext({ selected: idx, correct: true }), 1200);
    } else {
      setWrongShake(idx);
      setTimeout(() => setWrongShake(null), 600);
    }
  };

  return (
    <div className="space-y-6 text-center w-full max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 flex-1 text-center">{instruction}</h2>
        <NarratorButton text={instruction} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {images.map((img, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: selected === null ? 1.06 : 1 }}
            whileTap={{ scale: 0.95 }}
            animate={wrongShake === i ? { x: [-8, 8, -8, 8, 0] } : {}}
            onClick={() => handleSelect(i)}
            className={`p-5 bg-white rounded-[3rem] border-4 transition-all shadow-xl flex flex-col items-center gap-4 overflow-hidden
              ${selected === i && i === correctIndex ? 'border-emerald-400 bg-emerald-50 shadow-emerald-200' : ''}
              ${selected === i && i !== correctIndex ? 'border-red-400 bg-red-50' : ''}
              ${selected === null ? 'border-slate-100 hover:border-indigo-300' : ''}
            `}
          >
            <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50 border-2 border-slate-100">
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-contain"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="text-5xl">🖼️</div>
              )}
            </div>
            <span className="text-xl font-black text-slate-700">{img.label}</span>
            {selected === i && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {i === correctIndex
                  ? <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  : <span className="text-3xl">❌</span>}
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/**
 * PANTALLA 4: Arrastra y Suelta (interactivo clic)
 */
export function DragDropScreen({ data, onNext }: ScreenProps) {
  const itemCount = Array.isArray(data.items) ? data.items.length : (data.totalBlocks || 3);
  const [placed, setPlaced] = useState<boolean[]>(new Array(itemCount).fill(false));
  const allPlaced = placed.every(p => p);
  const instruction = data.instruction || data.title || '¡A construir!';

  const handlePlace = (idx: number) => {
    if (placed[idx]) return;
    const newPlaced = [...placed];
    newPlaced[idx] = true;
    setPlaced(newPlaced);
    if (newPlaced.every(p => p)) {
      confetti({ particleCount: 80, spread: 70 });
      setTimeout(() => onNext(), 1500);
    }
  };

  const blockImg = data.blockImageUrl || data.backgroundUrl;

  return (
    <div className="space-y-6 text-center w-full max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 flex-1">{instruction}</h2>
        <NarratorButton text={`${instruction}. Toca cada bloque para colocarlo en su lugar.`} />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-10">
        {/* Source blocks */}
        <div className="flex flex-wrap justify-center gap-4 p-6 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 min-w-[200px] min-h-[140px]">
          {placed.map((p, i) => !p && (
            <motion.button
              key={i}
              layoutId={`block-${i}`}
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePlace(i)}
              className="w-24 h-24 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl shadow-xl border-b-4 border-orange-700 flex flex-col items-center justify-center p-2 overflow-hidden gap-1 cursor-grab active:cursor-grabbing"
            >
              {blockImg ? (
                <img src={blockImg} className="w-12 h-12 object-contain rounded" onError={e => (e.currentTarget.style.display = 'none')} />
              ) : (
                <Castle className="w-10 h-10 text-white/70" />
              )}
              {Array.isArray(data.items) && data.items[i] && (
                <span className="text-[10px] font-black text-white leading-tight truncate w-full text-center">{data.items[i]}</span>
              )}
            </motion.button>
          ))}
          {allPlaced && <p className="text-emerald-500 font-black animate-bounce text-xl">¡Genial! 🎉</p>}
        </div>

        <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowRight className="w-12 h-12 text-slate-300 hidden md:block" />
        </motion.div>

        {/* Target space */}
        <div className="relative w-64 h-64 border-8 border-white bg-slate-100 rounded-[2rem] shadow-inner flex flex-wrap content-end p-4 gap-2">
          {placed.map((p, i) => p && (
            <motion.div
              key={i}
              layoutId={`block-${i}`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="w-16 h-12 bg-gradient-to-br from-orange-400 to-rose-500 rounded-lg shadow-md border-b-2 border-orange-700 flex items-center justify-center"
            >
              {blockImg && <img src={blockImg} className="w-10 h-8 object-contain opacity-60" onError={e => (e.currentTarget.style.display = 'none')} />}
            </motion.div>
          ))}
          <div className="absolute inset-x-0 bottom-2 h-2 bg-slate-300 rounded-full mx-4" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <span className="font-black text-slate-800 text-base uppercase tracking-widest">{data.targetLabel || 'Tu creación'}</span>
          </div>
        </div>
      </div>
      <p className="text-slate-400 font-bold italic">👆 Toca los bloques para colocarlos</p>
    </div>
  );
}

/**
 * PANTALLA 5 & 6: Transformaciones (Reemplazado por Juego de Lógica / Programación Visual)
 */
export function TransformScreen({ data, onNext }: ScreenProps) {
  const instruction = data.instruction || data.title || '¡Lleva a nuestro amigo hasta la meta!';
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Tablero dinámico configurado por el profesor
  const GRID_SIZE = parseInt(data.gridSize) || 5;
  const targetPosition = { 
    x: data.targetX !== undefined ? parseInt(data.targetX) : 4, 
    y: data.targetY !== undefined ? parseInt(data.targetY) : 4 
  };

  const addCommand = (cmd: string) => {
    if (!isPlaying && sequence.length < 10) {
      setSequence([...sequence, cmd]);
    }
  };

  const removeLastCommand = () => {
    if (!isPlaying && sequence.length > 0) {
      setSequence(sequence.slice(0, -1));
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setPlayerPosition({ x: 0, y: 0 });
    setSequence([]);
  };

  const runSequence = async () => {
    if (isPlaying || sequence.length === 0) return;
    setIsPlaying(true);
    setPlayerPosition({ x: 0, y: 0 });

    let currentPos = { x: 0, y: 0 };
    
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(r => setTimeout(r, 600)); // Delay between moves
      
      const cmd = sequence[i];
      if (cmd === 'UP' && currentPos.y > 0) currentPos.y -= 1;
      if (cmd === 'DOWN' && currentPos.y < GRID_SIZE - 1) currentPos.y += 1;
      if (cmd === 'LEFT' && currentPos.x > 0) currentPos.x -= 1;
      if (cmd === 'RIGHT' && currentPos.x < GRID_SIZE - 1) currentPos.x += 1;
      
      setPlayerPosition({ ...currentPos });

      // Verificamos si llegó a la meta en este paso
      if (currentPos.x === targetPosition.x && currentPos.y === targetPosition.y) {
        setTimeout(() => {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setTimeout(() => onNext({ success: true, sequence }), 1500);
        }, 300);
        return; 
      }
    }

    // Si terminó la secuencia y no llegó a la meta
    setTimeout(() => {
      if (currentPos.x !== targetPosition.x || currentPos.y !== targetPosition.y) {
        setIsPlaying(false);
        setPlayerPosition({ x: 0, y: 0 }); // Regresa al inicio
      }
    }, 800);
  };

  return (
    <div className="space-y-6 text-center w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-3xl font-black text-slate-800 flex-1">{instruction}</h2>
          <NarratorButton text={`${instruction}. Usa las flechas para crear tu código y presiona ejecutar para que el Robot llegue a la estrella.`} />
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 text-amber-700 font-bold shadow-sm inline-flex items-center justify-center gap-2 text-sm max-w-lg mx-auto w-full">
          🕹️ <span className="opacity-80">|</span> Guía al Robot 🤖 hasta la Estrella ⭐ usando las flechas de código, y luego dale a EJECUTAR.
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8 justify-center">
        {/* Tablero (Grid Estilo Roblox/Bloques) */}
        <div 
          className="bg-sky-100 p-3 rounded-2xl shadow-2xl border-b-8 border-sky-300 relative overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gap: '2px', // gap pequeñito para dar efecto de bloques unidos
            width: '320px',
            height: '320px'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);
            const isPlayer = playerPosition.x === x && playerPosition.y === y;
            const isTarget = targetPosition.x === x && targetPosition.y === y;

            return (
              <div 
                key={idx} 
                className={`flex items-center justify-center rounded-sm relative
                  ${isTarget ? 'bg-amber-100 shadow-[inset_0_0_20px_rgba(251,191,36,0.6)]' : 'bg-emerald-400 border-b-4 border-emerald-600'}`}
              >
                {isTarget && !isPlayer && (
                  <Star className="w-10 h-10 text-yellow-300 fill-yellow-400 drop-shadow-lg animate-bounce absolute z-10" />
                )}
                {isPlayer && (
                  <motion.div 
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-[85%] h-[85%] bg-indigo-500 rounded-md shadow-[0_4px_0_#4338ca] z-20 flex items-center justify-center text-2xl border-2 border-indigo-400 relative overflow-hidden"
                  >
                    <div className="absolute top-0 inset-x-0 h-1/2 bg-white/20 pointer-events-none"></div>
                    🤖
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controles de Programación */}
        <div className="flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-3xl border-4 border-slate-200 w-full max-w-sm shrink-0">
          <div className="grid grid-cols-3 gap-2 w-48">
            <div />
            <Button disabled={isPlaying} onClick={() => addCommand('UP')} className="h-14 rounded-2xl bg-white border-b-4 border-slate-300 text-slate-700 hover:bg-slate-100 text-2xl shadow-sm">⬆️</Button>
            <div />
            <Button disabled={isPlaying} onClick={() => addCommand('LEFT')} className="h-14 rounded-2xl bg-white border-b-4 border-slate-300 text-slate-700 hover:bg-slate-100 text-2xl shadow-sm">⬅️</Button>
            <Button disabled={isPlaying} onClick={() => addCommand('DOWN')} className="h-14 rounded-2xl bg-white border-b-4 border-slate-300 text-slate-700 hover:bg-slate-100 text-2xl shadow-sm">⬇️</Button>
            <Button disabled={isPlaying} onClick={() => addCommand('RIGHT')} className="h-14 rounded-2xl bg-white border-b-4 border-slate-300 text-slate-700 hover:bg-slate-100 text-2xl shadow-sm">➡️</Button>
          </div>

          <div className="w-full bg-white h-16 rounded-2xl border-2 border-slate-200 shadow-inner flex items-center px-2 py-1 gap-1 overflow-x-auto whitespace-nowrap">
            {sequence.length === 0 && <span className="text-slate-400 font-bold mx-auto text-sm italic">Tu camino aquí...</span>}
            <AnimatePresence>
              {sequence.map((cmd, i) => (
                <motion.div 
                  key={`${i}-${cmd}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="w-10 h-10 shrink-0 bg-indigo-100 border-2 border-indigo-200 text-indigo-700 rounded-xl flex items-center justify-center font-black text-lg"
                >
                  {cmd === 'UP' ? '⬆️' : cmd === 'DOWN' ? '⬇️' : cmd === 'LEFT' ? '⬅️' : '➡️'}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 w-full mt-2">
            <Button 
              disabled={isPlaying || sequence.length === 0} 
              onClick={removeLastCommand}
              variant="outline"
              className="flex-1 border-2 border-rose-200 text-rose-500 hover:bg-rose-50 rounded-2xl h-12 font-bold"
            >
              Borrar
            </Button>
            <Button 
              disabled={isPlaying || sequence.length === 0} 
              onClick={runSequence}
              className="flex-2 bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 text-white rounded-2xl h-12 font-black tracking-wider text-base"
            >
              {isPlaying ? 'Corriendo...' : 'EJECUTAR ▶'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PANTALLA 7: Selección de Reto Creativo y Mesa de Construcción 2D
 */
export function ChallengePicker({ data, onNext }: ScreenProps) {
  const instruction = data.instruction || '¿Qué quieres construir ahora?';

  const choices: { label: string; imageUrl?: string }[] = data.choices && data.choices.length > 0
    ? data.choices
    : [
      { label: '🏠 Una Casa', imageUrl: '' },
      { label: '🏰 Un Castillo', imageUrl: '' },
      { label: '🗼 Una Torre', imageUrl: '' },
    ];

  // Modos de estado: Selección de Reto vs Mesa de Dibujo
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  
  // Grid 10x10 state
  const GRID_SIZE = 10;
  const [grid, setGrid] = useState<string[]>(Array(GRID_SIZE * GRID_SIZE).fill(''));
  const [activeColor, setActiveColor] = useState<string>('bg-amber-700'); // Por defecto Madera
  const [isDrawing, setIsDrawing] = useState(false);

  // Paleta de colores/materiales
  const colors = [
    { id: 'bg-amber-700', label: 'Madera', emoji: '🟫' },
    { id: 'bg-slate-400', label: 'Piedra', emoji: '⬜' },
    { id: 'bg-emerald-500', label: 'Hojas', emoji: '🟩' },
    { id: 'bg-sky-300', label: 'Cristal', emoji: '🟦' },
    { id: 'bg-rose-500', label: 'Ladrillo', emoji: '🧱' },
    { id: '', label: 'Borrador', emoji: '❌' },
  ];

  const handlePaint = (idx: number) => {
    const newGrid = [...grid];
    newGrid[idx] = activeColor;
    setGrid(newGrid);
  };

  const clearGrid = () => {
    if(confirm('¿Seguro quieres borrar todo?')) {
      setGrid(Array(GRID_SIZE * GRID_SIZE).fill(''));
    }
  };

  // ──────────────────────────────────────────
  // FASE 2: MESA DE CONSTRUCCIÓN (DIBUJO 2D)
  // ──────────────────────────────────────────
  if (selectedChallenge) {
    const onlyName = selectedChallenge.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '').trim();
    
    return (
      <div className="space-y-6 text-center w-full max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-3xl font-black text-slate-800 flex-1">
              Construyendo: {onlyName}
            </h2>
            <NarratorButton text={`Dibuja tu ${onlyName} tocando los cuadritos, luego presiona Hecho cuando termines`} />
          </div>
          <p className="text-slate-500 font-bold bg-amber-50 p-2 rounded-xl text-sm border-2 border-amber-200">
            🎨 Elige un material de la paleta y desliza sobre el lienzo para pintar.
          </p>
        </div>

        <div className="bg-slate-50 p-5 rounded-[2rem] shadow-xl border-4 border-slate-200 flex flex-col items-center gap-5">
          
          {/* Paleta (Materiales) */}
          <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-2xl shadow-sm border-2 border-slate-100">
            {colors.map(c => (
              <button
                key={c.id || 'erase'}
                onClick={() => setActiveColor(c.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                  activeColor === c.id ? 'bg-indigo-100 border-2 border-indigo-400 scale-110 shadow-md' : 'hover:bg-slate-100 border-2 border-transparent opacity-70'
                }`}
              >
                <div className={`w-8 h-8 rounded-md shadow-inner flex items-center justify-center text-lg ${c.id ? c.id : 'bg-slate-100 border-2 border-dashed border-slate-300'}`}>
                  {c.id ? '' : '❌'}
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">{c.label}</span>
              </button>
            ))}
            <button onClick={clearGrid} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-red-50 text-red-500 transition-all border-2 border-transparent hover:border-red-200 ml-2">
              <div className="w-8 h-8 flex items-center justify-center bg-rose-100 rounded-md text-rose-500"><Trash2 className="w-5 h-5" /></div>
              <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Limpiar</span>
            </button>
          </div>

          {/* Lienzo / Canvas 10x10 */}
          <div 
            className="bg-sky-50 p-2 rounded-2xl shadow-inner border-4 border-slate-200 cursor-crosshair touch-none overflow-hidden"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gap: '1px',
              width: '320px',
              height: '320px'
            }}
            onMouseLeave={() => setIsDrawing(false)}
            onMouseUp={() => setIsDrawing(false)}
            onTouchEnd={() => setIsDrawing(false)}
          >
            {grid.map((cellColor, idx) => (
              <div
                key={idx}
                onMouseDown={() => { setIsDrawing(true); handlePaint(idx); }}
                onMouseEnter={() => { if (isDrawing) handlePaint(idx); }}
                onTouchStart={() => { setIsDrawing(true); handlePaint(idx); }}
                onTouchMove={(e) => {
                  if (isDrawing) {
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element && element.getAttribute('data-idx')) {
                      handlePaint(Number(element.getAttribute('data-idx')));
                    }
                  }
                }}
                data-idx={idx}
                className={`w-full h-full rounded-sm border border-black/5 transition-colors duration-75 ${cellColor || 'bg-white hover:bg-slate-100'}`}
              />
            ))}
          </div>

          <div className="flex w-full gap-3 mt-2">
            <Button variant="outline" onClick={() => setSelectedChallenge(null)} className="h-12 flex-1 rounded-2xl border-2 font-bold text-slate-500 hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 mr-2" /> Volver
            </Button>
            <Button onClick={() => onNext({ challenge: selectedChallenge, canvas: grid })} className="bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 h-12 flex-1 rounded-2xl font-black text-white text-base">
              ¡Hecho! <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // FASE 1: MENÚ DE SELECCIÓN DE PLANO/IDEA
  // ──────────────────────────────────────────
  return (
    <div className="space-y-8 text-center w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 flex-1">{instruction}</h2>
        <NarratorButton text={`${instruction}. Toca la opción que más te guste para empezar a diseñarla.`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
        {choices.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedChallenge(opt.label)}
            className="group bg-white p-6 rounded-[3rem] shadow-2xl border-4 border-slate-100 hover:border-indigo-200 transition-all flex flex-col items-center gap-5 overflow-hidden h-full"
          >
            {opt.imageUrl ? (
              <div className="w-full h-40 overflow-hidden rounded-2xl border-4 border-slate-100 flex-shrink-0">
                <img
                  src={opt.imageUrl} alt={opt.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              </div>
            ) : (
              <div className={`w-24 h-24 ${['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-emerald-500', 'bg-rose-500'][i % 5]} text-white rounded-[2rem] flex items-center justify-center shadow-xl text-5xl group-hover:scale-110 transition-transform flex-shrink-0`}>
                {['🏠', '🏰', '🗼', '🚗', '🤖'][i] || '⭐'}
              </div>
            )}
            <span className="text-2xl font-black text-slate-700 leading-tight flex-1 flex items-center">{opt.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/**
 * PANTALLA 8: Celebración Final
 */
export function CelebrationScreen({ data, onNext }: ScreenProps) {
  useEffect(() => {
    const duration = 3500;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6366f1', '#f59e0b', '#10b981', '#f472b6'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6366f1', '#f59e0b', '#10b981', '#f472b6'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const celebrationText = data.title || '¡Felicitaciones genio!';

  return (
    <div className="flex flex-col items-center text-center gap-8 animate-in zoom-in duration-700 py-4">
      <NarratorButton text={`${celebrationText}. ${data.message || 'Has completado la misión y ganado una nueva insignia.'}`} />

      <div className="relative">
        <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-25 animate-pulse rounded-full" />
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="relative w-64 h-64 bg-white rounded-full shadow-2xl flex items-center justify-center border-8 border-yellow-100"
        >
          {data.badgeUrl ? (
            <img src={data.badgeUrl} alt="Insignia" className="w-52 h-52 object-contain"
              onError={e => (e.currentTarget.style.display = 'none')} />
          ) : (
            <Trophy className="w-32 h-32 text-yellow-500" />
          )}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white"
          >
            <Star className="w-10 h-10 fill-current" />
          </motion.div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <h2 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter">
          {celebrationText}
        </h2>
        <p className="text-2xl text-slate-500 font-bold max-w-xl">
          {data.message || 'Has completado la misión y ganado una nueva insignia.'}
        </p>
      </div>

      <Button
        onClick={() => onNext()}
        className="h-20 px-16 text-3xl font-black italic rounded-[2rem] bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-2xl shadow-indigo-500/40 hover:-translate-y-2 transition-all border-4 border-white"
      >
        ¡TERMINAR! <CheckCircle2 className="ml-4 w-10 h-10" />
      </Button>
    </div>
  );
}

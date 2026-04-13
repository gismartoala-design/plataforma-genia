import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Star, PackageOpen, Package, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface LootboxXPNotificationProps {
  show: boolean;
  xpAmount: number;
  missionTitle?: string;
  onDone: () => void;
}

const Coin = ({ delay, x, y }: { delay: number; x: number; y: number }) => {
  return (
    <motion.div
      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
      animate={{
        scale: [0, 1.5, 1],
        x: [0, x * 1.5, x],
        y: [0, y * 1.5, y + 100],
        opacity: [1, 1, 0],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: 1.5,
        delay: delay,
        ease: "easeOut",
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] z-10"
    >
      <Trophy className="w-8 h-8 fill-yellow-400" />
    </motion.div>
  );
};

export const LootboxXPNotification = ({ show, xpAmount, missionTitle = "¡Has completado el objetivo!", onDone }: LootboxXPNotificationProps) => {
  const [phase, setPhase] = useState<'falling' | 'shaking' | 'open'>('falling');

  useEffect(() => {
    if (show) {
      setPhase('falling');

      const shakeTimer = setTimeout(() => setPhase('shaking'), 800);
      const openTimer = setTimeout(() => {
        setPhase('open');
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#facc15', '#f59e0b', '#3b82f6', '#8b5cf6'],
          disableForReducedMotion: true
        });
      }, 1800);

      const doneTimer = setTimeout(() => {
        onDone();
      }, 5000);

      return () => {
        clearTimeout(shakeTimer);
        clearTimeout(openTimer);
        clearTimeout(doneTimer);
      };
    }
  }, [show, onDone]);

  // Generate random trajectories for coins
  const coins = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 0.3,
    x: (Math.random() - 0.5) * 400,
    y: -100 - (Math.random() * 200),
  }));

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          {/* Backdrop Blur Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          <div className="relative flex flex-col items-center justify-center">
            
            {/* The Lootbox */}
            <div className="relative w-48 h-48 flex items-center justify-center z-20">
              <AnimatePresence mode="wait">
                {phase === 'falling' && (
                  <motion.div
                    key="falling"
                    initial={{ y: -500, scale: 0.5, rotate: -20, opacity: 0 }}
                    animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
                    className="absolute"
                  >
                    <Package className="w-40 h-40 text-amber-500 drop-shadow-2xl fill-amber-700 font-bold" />
                  </motion.div>
                )}
                
                {phase === 'shaking' && (
                  <motion.div
                    key="shaking"
                    animate={{ 
                      x: [-10, 10, -10, 10, -5, 5, 0],
                      scale: [1, 1.1, 1, 1.1, 1]
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity }}
                    className="absolute"
                  >
                    <Package className="w-40 h-40 text-amber-500 drop-shadow-[0_0_40px_rgba(245,158,11,0.6)] fill-amber-700" />
                  </motion.div>
                )}

                {phase === 'open' && (
                  <motion.div
                    key="open"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.1 }}
                    className="absolute relative"
                  >
                    {/* The Open Box */}
                    <PackageOpen className="w-48 h-48 text-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,0.8)] fill-amber-500" />
                    
                    {/* Magical glow inside the box */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: [1, 1.5, 1.2] }}
                      transition={{ duration: 1 }}
                      className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-yellow-200/80 rounded-full blur-2xl z-10"
                    />

                    {/* Coins expanding outward */}
                    {coins.map((coin) => (
                      <Coin key={coin.id} delay={coin.delay} x={coin.x} y={coin.y} />
                    ))}
                    
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* XP and TITLE Result - Shows only after opened */}
            <AnimatePresence>
              {phase === 'open' && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: 0.3 }}
                  className="mt-8 text-center relative z-30"
                >
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="bg-slate-900/80 border-2 border-yellow-400/50 backdrop-blur-xl px-10 py-6 rounded-[2rem] shadow-[0_0_40px_rgba(250,204,21,0.3)] flex flex-col items-center gap-2"
                  >
                    <p className="text-yellow-400 font-black uppercase tracking-[0.2em] text-sm">
                      {missionTitle}
                    </p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 italic drop-shadow-sm">
                        +{xpAmount}
                      </h2>
                      <span className="text-3xl font-black text-yellow-500 italic">XP</span>
                    </div>
                    <div className="flex gap-2 text-yellow-200/50 mt-2">
                       <Sparkles className="w-5 h-5 animate-pulse" />
                       <Gem className="w-5 h-5 animate-pulse delay-75" />
                       <Star className="w-5 h-5 animate-pulse delay-150" />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

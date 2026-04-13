
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PixelWorkerProps {
    name: string;
    isWalking: boolean;
    direction: 'left' | 'right' | 'up' | 'down';
}

/**
 * PixelWorker Component
 * A CSS-powered 8-bit style office worker.
 */
export const PixelWorker = ({ name, isWalking, direction }: PixelWorkerProps) => {
    const isFlipped = direction === 'left';
    
    // Animation variants for the "bobbing" walk effect
    const walkVariants: Variants = {
        walking: {
            y: [0, -4, 0],
            transition: {
                repeat: Infinity,
                duration: 0.3,
                ease: "linear"
            }
        },
        idle: { y: 0 }
    };

    return (
        <div className="relative flex flex-col items-center group">
            {/* Shadow (Pixelated) */}
            <div className="w-10 h-2 bg-black/30 absolute -bottom-1 rounded-full blur-[2px]" />

            {/* Character Body Container */}
            <motion.div
                variants={walkVariants}
                animate={isWalking ? "walking" : "idle"}
                style={{ 
                    rotateY: isFlipped ? 180 : 0,
                    imageRendering: 'pixelated'
                }}
                className="relative w-12 h-16 flex flex-col items-center"
            >
                {/* Hair (Black/Brown Pixel Block) */}
                <div className="w-8 h-3 bg-[#4a2e1a] border-2 border-black" />
                
                {/* Face (Skin Tone) */}
                <div className="w-8 h-5 bg-[#ffdbac] border-x-2 border-b-2 border-black relative">
                    {/* Eyes */}
                    <div className="absolute top-1 left-1.5 w-1 h-1 bg-black" />
                    <div className="absolute top-1 right-1.5 w-1 h-1 bg-black" />
                </div>

                {/* Shirt (White) */}
                <div className="w-10 h-6 bg-white border-x-2 border-black relative">
                    {/* Tie (Blue) */}
                    <div className="absolute top-0 left-1/2 -ml-1 w-2 h-4 bg-blue-700 border-x-1 border-b-1 border-black" />
                    
                    {/* Arms (Skin + Sleeve) */}
                    <div className="absolute -left-2 top-0 w-3 h-4 bg-white border-2 border-black" />
                    <div className="absolute -right-2 top-0 w-3 h-4 bg-white border-2 border-black" />
                </div>

                {/* Pants (Dark Grey/Black) */}
                <div className="w-10 h-4 bg-[#2c3e50] border-x-2 border-black flex">
                    <div className="w-1/2 h-full border-r-1 border-black/20" />
                    <div className="w-1/2 h-full" />
                </div>

                {/* Shoes (Black) */}
                <div className="flex gap-1 -mt-1">
                    <div className="w-4 h-2 bg-black" />
                    <div className="w-4 h-2 bg-black" />
                </div>

                {/* Briefcase (Brown - only visible when not facing up/away) */}
                {direction !== 'up' && (
                  <motion.div 
                    animate={{ rotate: isWalking ? [-5, 5] : 0 }}
                    transition={{ repeat: Infinity, duration: 0.3, repeatType: "reverse" }}
                    className="absolute -right-4 bottom-2 w-5 h-4 bg-[#6e4120] border-2 border-black"
                  >
                    <div className="absolute -top-1 left-1 w-3 h-1 bg-[#4a2e1a] border-x-1 border-t-1 border-black" />
                  </motion.div>
                )}
            </motion.div>

            {/* Name Tag (Pixel Font Style) */}
            <div className="mt-3 px-3 py-1 bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-[8px] font-black uppercase tracking-widest text-slate-800 whitespace-nowrap">
                {name}
            </div>
        </div>
    );
};

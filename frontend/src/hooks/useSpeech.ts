import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechProps {
    defaultVolume?: number;
    defaultRate?: number;
    defaultPitch?: number;
    lang?: string;
}

export function useSpeech({
    defaultVolume = 1,
    defaultRate = 1.05,
    defaultPitch = 1.1,
    lang = 'es-MX'
}: UseSpeechProps = {}) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false); // Default a activado según solicitud del usuario
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
            
            const loadVoices = () => {
                let availableVoices = synthRef.current?.getVoices() || [];
                // Intentar buscar voces en español latino, si no es-ES
                let spanishVoices = availableVoices.filter(v => v.lang.includes('es-'));
                if (spanishVoices.length === 0) spanishVoices = availableVoices; // fallback
                setVoices(spanishVoices);
            };

            loadVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const next = !prev;
            if (next && synthRef.current) {
                synthRef.current.cancel();
            }
            return next;
        });
    }, []);

    const speak = useCallback((text: string, forceStart: boolean = false) => {
        // Enforce mute logic unless bypass is given (e.g. user manually clicks a 'speak' button)
        if (!synthRef.current || (isMuted && !forceStart)) return;

        // Limpiar cola existente si es necesario (opcional)
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = defaultVolume;
        utterance.rate = defaultRate;
        utterance.pitch = defaultPitch;
        
        // Seleccionar una buena voz 
        // 1. Google español si está
        // 2. Microsoft Sabina/Elena
        // 3. Primera española
        const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('es')) ||
                                voices.find(v => v.name.includes('Microsoft') && v.lang.includes('es')) || 
                                voices[0];
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech Synthesis Error:", e);
            setIsSpeaking(false);
        };

        synthRef.current.speak(utterance);
    }, [voices, defaultVolume, defaultRate, defaultPitch, isMuted]);

    const stop = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        speak,
        stop,
        isSpeaking,
        isMuted,
        toggleMute,
        setIsMuted
    };
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, BookOpen, X, Play, Pause, RefreshCcw, ChevronRight, Loader2, MessageSquare } from 'lucide-react';
import { BrainIcon } from './BrainIcon';
import { evaluateExitReason } from '../lib/gemini';

interface FocusModeProps {
  isActive: boolean;
  onStop: () => void;
  onStart: () => void;
}

export default function FocusMode({ isActive, onStop, onStart }: FocusModeProps) {
  const [seconds, setSeconds] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);
  
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [exitReason, setExitReason] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(25 * 60);
  };

  const handleExitRequest = async () => {
    if (!exitReason.trim()) return;
    setIsEvaluating(true);
    const response = await evaluateExitReason(exitReason);
    setAiResponse(response);
    setIsEvaluating(false);
  };

  const closeEverything = () => {
    setIsExitDialogOpen(false);
    setExitReason('');
    setAiResponse(null);
    onStop();
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center text-white p-6"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="grid grid-cols-12 gap-4 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border-r border-b border-white/20 h-24 w-full" />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2 tracking-tight uppercase">Sessione di Focus</h2>
          <p className="text-red-100 mb-12 text-sm opacity-80 italic">"La disciplina è il ponte tra gli obiettivi e il successo."</p>

          <div className="text-9xl font-mono font-black mb-12 tracking-tighter tabular-nums drop-shadow-2xl">
            {formatTime(seconds)}
          </div>

          <div className="flex gap-6 mb-16">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="w-20 h-20 rounded-full bg-white text-red-600 flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
            >
              {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-20 h-20 rounded-full bg-red-700/50 text-white border border-red-400/30 flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
            >
              <RefreshCcw size={28} />
            </button>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mb-12">
            <a
              href="tel:112"
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Phone size={32} />
              <span className="text-xs font-semibold uppercase tracking-widest">Telefono</span>
            </a>
            <a
              href="https://www.registro-elettronico.it"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <BookOpen size={32} />
              <span className="text-xs font-semibold uppercase tracking-widest">Registro</span>
            </a>
          </div>

          <button
            onClick={() => setIsExitDialogOpen(true)}
            className="flex items-center gap-2 text-red-200 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest"
          >
            <X size={18} />
            Termina Sessione
          </button>
        </div>

        {/* Exit Motivation Dialog */}
        <AnimatePresence>
          {isExitDialogOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[60] bg-red-950/90 backdrop-blur-md flex items-center justify-center p-6"
            >
              <div className="bg-white rounded-3xl p-8 max-w-md w-full text-red-900 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-50 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <BrainIcon className="text-red-600" size={28} />
                    <h3 className="text-xl font-black uppercase tracking-tight">Perché vuoi uscire?</h3>
                  </div>

                  {!aiResponse ? (
                    <>
                      <p className="text-sm text-red-900/60 mb-6 leading-relaxed">
                        Il tuo cervello è al massimo della concentrazione. Spiegaci perché vuoi interrompere il tuo potenziale al 100%.
                      </p>
                      <textarea
                        value={exitReason}
                        onChange={(e) => setExitReason(e.target.value)}
                        placeholder="Esempio: Sono stanco, ho finito i compiti, c'è un'emergenza..."
                        className="w-full p-4 rounded-2xl border border-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all h-32 mb-6 resize-none text-sm"
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={() => setIsExitDialogOpen(false)}
                          className="flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-red-900/40 hover:text-red-900 transition-colors"
                        >
                          Resta al 100%
                        </button>
                        <button
                          onClick={handleExitRequest}
                          disabled={!exitReason.trim() || isEvaluating}
                          className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isEvaluating ? <Loader2 className="animate-spin" size={18} /> : "Invia"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start gap-4 mb-8 p-6 rounded-2xl bg-red-50 border border-red-100">
                        <MessageSquare className="text-red-600 shrink-0 mt-1" size={20} />
                        <p className="text-sm font-medium italic leading-relaxed text-red-900">
                          "{aiResponse}"
                        </p>
                      </div>
                      <div className="flex flex-col gap-4">
                        <button
                          onClick={() => {
                            setAiResponse(null);
                            setIsExitDialogOpen(false);
                            setExitReason('');
                          }}
                          className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                        >
                          Hai ragione, continuo
                        </button>
                        <button
                          onClick={closeEverything}
                          className="w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-red-900/40 hover:text-red-900 transition-colors"
                        >
                          Esci comunque
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

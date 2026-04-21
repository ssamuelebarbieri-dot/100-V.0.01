import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Sparkles, Target } from 'lucide-react';
import { BrainIcon } from './BrainIcon';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-red-600 flex items-center justify-center p-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-900 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative z-10 text-center"
      >
        <div className="relative mx-auto mb-8 w-20 h-20 group">
          <div className="absolute inset-[-10px] bg-gradient-to-t from-orange-600 via-red-500 to-transparent blur-md rounded-[32px] opacity-80 animate-pulse" />
          <div className="relative w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-red-100">
            <BrainIcon size={40} className="fill-white" />
          </div>
        </div>

        <h1 className="text-5xl font-black uppercase tracking-tighter text-red-900 mb-4 leading-none">100%</h1>
        <p className="text-red-900/60 font-medium mb-12 leading-relaxed">
          Sfrutta il 100% del tuo tempo e del tuo cervello. Accedi per salvare i tuoi progressi e sfidare i tuoi amici.
        </p>

        <div className="space-y-4 mb-12">
          {[
            { icon: BrainIcon, text: "Analisi IA dell'attenzione" },
            { icon: Target, text: "Obiettivi personalizzati" },
            { icon: Sparkles, text: "Sincronizzazione Cloud" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-left p-4 rounded-2xl bg-red-50 border border-red-100/50">
              <item.icon className="text-red-600" size={20} />
              <span className="text-xs font-bold uppercase tracking-widest text-red-900/60">{item.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3 active:scale-95"
        >
          <LogIn size={20} />
          Accedi con Google
        </button>
      </motion.div>
    </div>
  );
}

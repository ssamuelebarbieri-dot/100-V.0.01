import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Sparkles, Target, Mail, Lock, ChevronRight, ArrowLeft } from 'lucide-react';
import { BrainIcon } from './BrainIcon';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
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
        className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl relative z-10 text-center max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="relative mx-auto mb-6 w-16 h-16 group">
          <div className="absolute inset-[-8px] bg-gradient-to-t from-orange-600 via-red-500 to-transparent blur-md rounded-[24px] opacity-80 animate-pulse" />
          <div className="relative w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100">
            <BrainIcon size={32} className="fill-white" />
          </div>
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tighter text-red-900 mb-2 leading-none">100%</h1>
        
        <AnimatePresence mode="wait">
          {!showEmailLogin ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <p className="text-red-900/60 font-medium mb-8 leading-relaxed text-sm">
                Sfrutta il 100% del tuo tempo e del tuo cervello. Accedi per salvare i tuoi progressi.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: BrainIcon, text: "Analisi IA dell'attenzione" },
                  { icon: Target, text: "Obiettivi personalizzati" },
                  { icon: Sparkles, text: "Sincronizzazione Cloud" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-left p-3 rounded-xl bg-red-50 border border-red-100/50">
                    <item.icon className="text-red-600" size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-900/60">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-white border-2 border-red-100 text-red-900 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                  Accedi con Google
                </button>
                
                <button
                  onClick={() => setShowEmailLogin(true)}
                  className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-3 active:scale-95"
                >
                  <Mail size={18} />
                  Email e Password
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleEmailAuth}
              className="text-left"
            >
              <button 
                type="button" 
                onClick={() => setShowEmailLogin(false)}
                className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-widest mb-6 hover:underline"
              >
                <ArrowLeft size={14} /> Torna indietro
              </button>

              <h2 className="text-xl font-black text-red-900 uppercase tracking-tight mb-6">
                {isRegistering ? 'Crea Account' : 'Accedi'}
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-red-300" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-red-100 focus:ring-2 focus:ring-red-600 outline-none transition-all text-sm"
                      placeholder="la-tua@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-red-300" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-red-100 focus:ring-2 focus:ring-red-600 outline-none transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-600 text-[10px] font-bold mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3 mb-4"
              >
                {isRegistering ? 'Registrati' : 'Accedi'}
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-center text-[10px] font-bold text-red-900/40 uppercase tracking-widest hover:text-red-600 transition-colors"
              >
                {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

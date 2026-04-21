import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Sparkles, Globe, GraduationCap, User, ChevronRight } from 'lucide-react';
import { BrainIcon } from './BrainIcon';

interface CompleteProfileProps {
  onComplete: (data: { language: string; age: number; school: string; routineDescription: string }) => void;
}

export default function CompleteProfile({ onComplete }: CompleteProfileProps) {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState('italiano');
  const [age, setAge] = useState(16);
  const [school, setSchool] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (school.trim()) {
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (routineDescription.trim()) {
      onComplete({ language, age, school, routineDescription });
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-red-600 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-900 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="relative mx-auto mb-6 w-16 h-16 group">
          <div className="absolute inset-[-8px] bg-gradient-to-t from-orange-600 via-red-500 to-transparent blur-sm rounded-2xl opacity-60 animate-pulse" />
          <div className="relative w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
            <BrainIcon size={32} />
          </div>
        </div>

        {step === 1 ? (
          <>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-red-900 mb-2 text-center">Completa il Profilo</h2>
            <p className="text-red-900/60 text-sm mb-8 text-center">
              Aiutaci a personalizzare il tuo percorso al 100%.
            </p>

            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-2">
                  <BrainIcon size={12} className="text-red-600" /> Lingua Preferita
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-red-100 focus:ring-2 focus:ring-red-600 outline-none transition-all bg-white"
                >
                  <option value="italiano">Italiano</option>
                  <option value="english">English</option>
                  <option value="español">Español</option>
                  <option value="français">Français</option>
                  <option value="deutsch">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-2">
                  <Target size={12} /> Età
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  min="10"
                  max="99"
                  className="w-full p-4 rounded-2xl border border-red-100 focus:ring-2 focus:ring-red-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-2">
                  <GraduationCap size={12} /> Scuola / Università
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Es: Liceo Scientifico, Ingegneria..."
                  className="w-full p-4 rounded-2xl border border-red-100 focus:ring-2 focus:ring-red-600 outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3"
              >
                Continua
                <ChevronRight size={20} />
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-red-900 mb-2 text-center">Tua Routine</h2>
            <p className="text-red-900/60 text-xs mb-6 text-center leading-relaxed">
              Questa parte è fondamentale per l'IA per creare il tuo piano perfetto.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-red-50 p-4 rounded-2xl space-y-3">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Domande Guida:</p>
                <ul className="text-[10px] text-red-900/70 space-y-1 ml-4 list-disc uppercase tracking-wider">
                  <li>Orari di sveglia e sonno?</li>
                  <li>Orari scolastici (variano tra i giorni?)</li>
                  <li>Attività fisica o hobby?</li>
                  <li>Tempo sui social/telefono?</li>
                  <li>Come va a scuola?</li>
                </ul>
              </div>

              <textarea
                value={routineDescription}
                onChange={(e) => setRoutineDescription(e.target.value)}
                placeholder="Esempio: Mi sveglio alle 7, vado a dormire alle 23. A scuola faccio 6 ore Lun/Mer, 5 gli altri giorni. Faccio palestra 3 volte a settimana. Uso il telefono 5 ore al giorno. A scuola ho la media del 7..."
                className="w-full p-4 rounded-2xl border border-red-100 focus:ring-2 focus:ring-red-600 outline-none transition-all h-40 resize-none text-sm"
                required
              />

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-red-50 text-red-600 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  Indietro
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3"
                >
                  Inizia Ora
                  <Sparkles size={20} />
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Calendar as CalendarIcon, Sparkles, Clock, CheckCircle2, Circle, ChevronRight, Play } from 'lucide-react';
import { BrainIcon } from './BrainIcon';
import { Task } from '../types';
import { format, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';

interface DashboardProps {
  tasks: Task[];
  onStartFocus: () => void;
  onToggleTask: (id: string) => void;
  onNavigateToAI: () => void;
}

export default function Dashboard({ tasks, onStartFocus, onToggleTask, onNavigateToAI }: DashboardProps) {
  const today = new Date();
  const todayTasks = tasks.filter((t) => isSameDay(new Date(t.startTime), today));
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const progress = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

  const [bannerTextIndex, setBannerTextIndex] = useState(0);
  const bannerTexts = ["100% Potenziale", "100% Concentrazione", "100% Studio", "100% Te"];

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerTextIndex((prev) => (prev + 1) % bannerTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTask = todayTasks.find((t) => !t.completed);

  return (
    <div className="flex flex-col h-full gap-6 overflow-y-auto pr-2 custom-scrollbar">
      {/* Welcome Section */}
      <div className="bg-red-600 rounded-3xl p-8 text-white shadow-xl shadow-red-200 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-[-4px] bg-orange-500 blur-sm rounded-full opacity-40 animate-pulse" />
              <BrainIcon size={24} className="fill-white relative z-10" />
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={bannerTexts[bannerTextIndex]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs font-bold uppercase tracking-widest opacity-80"
              >
                {bannerTexts[bannerTextIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none">Pronto al 100%?</h1>
          <div className="flex flex-wrap gap-4">
            <p className="text-red-100 text-sm font-medium opacity-80 max-w-md">
              Oggi hai {todayTasks.length} attività in programma. Mantieni l'ordine e la concentrazione.
            </p>
            <button
              onClick={onNavigateToAI}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
            >
              <Sparkles size={14} />
              Chiedi all'IA
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Focus Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-red-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-red-900/40 uppercase tracking-widest">Progresso Odierno</h3>
              <span className="text-lg font-black text-red-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-4 bg-red-50 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-red-600"
              />
            </div>
          </div>
          <p className="text-xs text-red-900/60 font-medium">
            {completedCount} di {todayTasks.length} attività completate
          </p>
        </div>

        <button
          onClick={onStartFocus}
          className="bg-red-600 rounded-3xl p-6 text-white shadow-lg shadow-red-200 flex items-center justify-between group hover:bg-red-700 transition-all"
        >
          <div className="flex flex-col items-start text-left">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Modalità Focus</h3>
            <p className="text-xl font-black uppercase tracking-tight">Inizia Sessione</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
            <Play size={28} className="ml-1" />
          </div>
        </button>
      </div>

      {/* Next Task & Quick List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-red-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-red-900/40 uppercase tracking-widest">Prossime Attività</h3>
            <button className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline">Vedi Tutto</button>
          </div>

          <div className="space-y-4">
            {todayTasks.length === 0 ? (
              <div className="text-center py-12 text-red-900/20 uppercase tracking-widest text-xs font-bold">
                Nessuna attività per oggi
              </div>
            ) : (
              todayTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    task.completed ? 'bg-red-50/50 border-red-100 opacity-60' : 'bg-white border-red-100 hover:border-red-200'
                  }`}
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`transition-colors ${task.completed ? 'text-red-600' : 'text-red-200 hover:text-red-400'}`}
                  >
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-red-900 truncate ${task.completed ? 'line-through opacity-50' : ''}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-red-900/40 uppercase tracking-widest">
                      <Clock size={10} />
                      {format(new Date(task.startTime), 'HH:mm')}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-red-200" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-red-50/50 rounded-3xl p-6 border border-red-100 flex flex-col">
          <h3 className="text-sm font-bold text-red-900/40 uppercase tracking-widest mb-6">Stato Studio</h3>
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
                <BrainIcon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest">Streak</p>
                <p className="text-lg font-black text-red-900">5 Giorni</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest">Tempo Focus</p>
                <p className="text-lg font-black text-red-900">12h 30m</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-white border border-red-100 text-[10px] font-bold text-red-900/60 leading-relaxed uppercase tracking-widest">
            "L'ordine è la prima legge del cielo."
          </div>
        </div>
      </div>
    </div>
  );
}

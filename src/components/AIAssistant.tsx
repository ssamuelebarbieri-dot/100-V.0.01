import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Lightbulb, MessageSquare, ChevronRight, Info, Loader2, Search, Send, Edit3 } from 'lucide-react';
import { BrainIcon } from './BrainIcon';
import ReactMarkdown from 'react-markdown';
import { Task, StudyTip, UserStats } from '../types';
import { getStudyTips, explainSchedule, askAssistant } from '../lib/gemini';

interface AIAssistantProps {
  tasks: Task[];
  userStats: UserStats | null;
}

export default function AIAssistant({ tasks, userStats }: AIAssistantProps) {
  const [tips, setTips] = useState<StudyTip[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [userContext, setUserContext] = useState<string>(userStats?.routineDescription || '');
  const [isEditingContext, setIsEditingContext] = useState(false);
  const [tempContext, setTempContext] = useState(userStats?.routineDescription || '');

  useEffect(() => {
    if (userStats?.routineDescription) {
      setUserContext(userStats.routineDescription);
      setTempContext(userStats.routineDescription);
    }
  }, [userStats?.routineDescription]);

  useEffect(() => {
    const fetchTips = async () => {
      setIsLoadingTips(true);
      const newTips = await getStudyTips(tasks, userStats || undefined);
      setTips(newTips);
      setIsLoadingTips(false);
    };
    fetchTips();
  }, [tasks.length, userStats]);

  const handleExplain = async () => {
    setIsLoadingExplanation(true);
    const text = await explainSchedule(tasks);
    setExplanation(text);
    setIsLoadingExplanation(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const response = await askAssistant(searchQuery, tasks, userContext, userStats || undefined);
    setChatResponse(response);
    setIsSearching(false);
  };

  const saveContext = () => {
    if (tempContext.trim()) {
      // In a real app we'd update Firestore here too. 
      // For now we update local state and localStorage for compatibility.
      localStorage.setItem('studio_100_context', tempContext);
      setUserContext(tempContext);
      setIsEditingContext(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 overflow-y-auto pr-2 custom-scrollbar">
      {/* Context Summary / Edit Section */}
      <div className="bg-red-600 rounded-3xl p-6 text-white shadow-xl shadow-red-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BrainIcon size={24} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Il Tuo Profilo IA</h2>
          </div>
          <button 
            onClick={() => setIsEditingContext(!isEditingContext)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Edit3 size={18} />
          </button>
        </div>
        
        {isEditingContext ? (
          <div className="space-y-4">
             <textarea
              value={tempContext}
              onChange={(e) => setTempContext(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none h-32 resize-none text-sm"
            />
            <div className="flex gap-2">
              <button onClick={saveContext} className="flex-1 bg-white text-red-600 py-2 rounded-xl font-bold text-xs uppercase">Salva</button>
              <button onClick={() => setIsEditingContext(false)} className="flex-1 bg-red-700 text-white py-2 rounded-xl font-bold text-xs uppercase">Annulla</button>
            </div>
          </div>
        ) : (
          <p className="text-red-100 text-xs opacity-90 line-clamp-3 leading-relaxed italic">
            "{userContext || 'Nessuna routine impostata.'}"
          </p>
        )}
      </div>

      {/* AI Search/Chat Section */}
      <div className="bg-white rounded-3xl p-6 border border-red-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Search className="text-red-600" size={24} />
          <h2 className="text-xl font-bold text-red-900 uppercase tracking-tight">Chiedi al 100%</h2>
        </div>
        
        <form onSubmit={handleSearch} className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Chiedi consigli su come studiare meglio..."
            className="w-full p-4 pr-12 rounded-2xl border border-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-2 top-2 w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>

        <AnimatePresence>
          {chatResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-red-50 border border-red-100 prose prose-sm prose-red max-w-none"
            >
              <ReactMarkdown>{chatResponse}</ReactMarkdown>
              <button 
                onClick={() => setChatResponse(null)}
                className="mt-4 text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline"
              >
                Chiudi Risposta
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Tips Section */}
      <div className="bg-white rounded-3xl p-6 border border-red-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="text-red-600" size={24} />
            <h2 className="text-xl font-bold text-red-900 uppercase tracking-tight">Analisi 100%</h2>
          </div>
          {isLoadingTips && <Loader2 className="animate-spin text-red-600" size={20} />}
        </div>

        <div className="space-y-4">
          {tips.map((tip, index) => (
            <motion.div
              key={tip.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-2xl bg-red-50/50 border border-red-100/50 hover:bg-red-50 transition-colors group cursor-default"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg bg-white text-red-600 shadow-sm">
                  {tip.category === 'efficiency' ? <BrainIcon size={16} /> :
                   tip.category === 'concentration' ? <Lightbulb size={16} /> :
                   <Info size={16} />}
                </div>
                <div>
                  <h3 className="font-bold text-red-900 text-sm mb-1 uppercase tracking-wide">{tip.title}</h3>
                  <p className="text-xs text-red-900/60 leading-relaxed">{tip.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {tips.length === 0 && !isLoadingTips && (
            <p className="text-center text-red-900/30 text-xs uppercase tracking-widest py-8">
              Nessun consiglio disponibile al momento.
            </p>
          )}
        </div>
      </div>

      {/* Schedule Explanation Section */}
      <div className="flex-1 bg-red-600 rounded-3xl p-8 text-white shadow-xl shadow-red-200 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-red-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare size={24} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Perché questa programmazione?</h2>
          </div>

          <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
            {explanation ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-red-100/60 text-center">
                <BrainIcon size={48} strokeWidth={1} className="mb-4 opacity-40" />
                <p className="text-sm font-medium uppercase tracking-widest leading-relaxed">
                  L'IA può analizzare il tuo calendario e spiegarti la logica dietro l'ordine delle attività.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleExplain}
            disabled={isLoadingExplanation || tasks.length === 0}
            className="w-full bg-white text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-50 transition-colors shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingExplanation ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Analizza Programmazione
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Calendar as CalendarIcon, Sparkles, Clock, CheckCircle2, Circle, ChevronRight, Play, Menu, X, Flame } from 'lucide-react';
import { Task, UserStats } from './types';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import AIAssistant from './components/AIAssistant';
import FocusMode from './components/FocusMode';
import Login from './components/Login';
import ProfileDashboard from './components/ProfileDashboard';
import CompleteProfile from './components/CompleteProfile';
import { BrainIcon } from './components/BrainIcon';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'ai'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setShowCompleteProfile(true);
        } else {
          const stats = userSnap.data() as UserStats;
          setUserStats(stats);
          if (!stats.language || !stats.age || !stats.school || !stats.routineDescription) {
            setShowCompleteProfile(true);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCompleteProfile = async (data: { language: string; age: number; school: string; routineDescription: string }) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const newStats: UserStats = {
      uid: user.uid,
      displayName: user.displayName || 'Studente',
      photoURL: user.photoURL || '',
      bio: "Sfrutto il mio potenziale al 100%.",
      language: data.language,
      age: data.age,
      school: data.school,
      routineDescription: data.routineDescription,
      totalStudyMinutes: 0,
      streak: 0,
      lastActive: new Date().toISOString()
    };
    await setDoc(userRef, newStats);
    setUserStats(newStats);
    setShowCompleteProfile(false);
    // Also save in localStorage for legacy reasons if needed, but Firestore is primary
    localStorage.setItem('studio_100_context', data.routineDescription);
  };

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }
    const q = query(collection(db, 'tasks'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Task[];
      setTasks(fetchedTasks);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const messages = [
        "Sei sicuro di voler uscire? Il tuo potenziale al 100% ti aspetta!",
        "Non mollare proprio ora! Ogni minuto di studio conta.",
        "Ricorda: l'ordine e la disciplina portano al successo. Resta con noi!",
        "Il tuo cervello sta dando il massimo. Non interrompere il flusso!",
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      e.preventDefault();
      e.returnValue = randomMessage;
      return randomMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleAddTask = async (task: Task) => {
    if (!user) return;
    await addDoc(collection(db, 'tasks'), {
      ...task,
      uid: user.uid
    });
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, { completed: !task.completed });
  };

  const handleUpdateTasks = async (updatedTasks: Task[]) => {
    if (!user) return;
    for (const task of updatedTasks) {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, { 
        startTime: task.startTime,
        reasoning: task.reasoning || null
      });
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${
        activeTab === id
          ? 'bg-red-600 text-white shadow-lg shadow-red-200'
          : 'text-red-900/60 hover:bg-red-50 hover:text-red-900'
      }`}
    >
      <Icon size={24} />
      <span className="font-bold uppercase tracking-widest text-xs">{label}</span>
      {activeTab === id && (
        <motion.div
          layoutId="active-indicator"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
        />
      )}
    </button>
  );

  if (!isAuthReady) return null;
  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-red-50/30 text-red-900 font-sans selection:bg-red-200 selection:text-red-900">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-red-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="relative group"
          >
            <div className="absolute inset-0 bg-orange-500 blur-md opacity-20 rounded-full group-hover:opacity-40 transition-opacity" />
            <div className="relative w-8 h-8 rounded-full border-2 border-orange-500 overflow-hidden shadow-lg">
              <img src={user.photoURL || ''} alt="Profile" referrerPolicy="no-referrer" />
            </div>
          </button>
          <div className="relative ml-2 group">
            <div className="absolute inset-[-4px] bg-gradient-to-t from-orange-600 via-red-500 to-transparent blur-sm rounded-lg opacity-60 animate-pulse" />
            <div className="relative w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <BrainIcon size={18} />
            </div>
          </div>
          <span className="font-black uppercase tracking-tighter text-xl ml-1">100%</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-red-100 p-6 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="hidden lg:flex items-center gap-3 mb-12 px-2">
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="relative group"
            >
              <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 rounded-full group-hover:opacity-40 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl border-2 border-orange-500 overflow-hidden shadow-lg">
                <img src={user.photoURL || ''} alt="Profile" referrerPolicy="no-referrer" />
              </div>
            </button>
            <div className="relative ml-2 group">
              <div className="absolute inset-[-6px] bg-gradient-to-t from-orange-600 via-red-500 to-transparent blur-md rounded-xl opacity-80 animate-pulse" />
              <div className="relative w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <BrainIcon size={24} />
              </div>
            </div>
            <span className="font-black uppercase tracking-tighter text-2xl ml-1">100%</span>
          </div>

          <nav className="space-y-2">
            <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem id="calendar" icon={CalendarIcon} label="Calendario" />
            <NavItem id="ai" icon={Sparkles} label="Assistente IA" />
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="p-6 rounded-3xl bg-red-50 border border-red-100 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-1">Sessione Odierna</p>
                <p className="text-xl font-black text-red-900">02:45:00</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  tasks={tasks}
                  onStartFocus={() => setIsFocusMode(true)}
                  onToggleTask={handleToggleTask}
                  onNavigateToAI={() => setActiveTab('ai')}
                />
              )}
              {activeTab === 'calendar' && (
                <Calendar
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onUpdateTasks={handleUpdateTasks}
                />
              )}
              {activeTab === 'ai' && <AIAssistant tasks={tasks} userStats={userStats} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Focus Mode Overlay */}
      <FocusMode
        isActive={isFocusMode}
        onStop={() => setIsFocusMode(false)}
        onStart={() => setIsFocusMode(true)}
      />

      <AnimatePresence>
        {isProfileOpen && (
          <ProfileDashboard onClose={() => setIsProfileOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompleteProfile && (
          <CompleteProfile onComplete={handleCompleteProfile} />
        )}
      </AnimatePresence>

      {/* Global Styles for Scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fee2e2;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fecaca;
        }
      `}} />
    </div>
  );
}

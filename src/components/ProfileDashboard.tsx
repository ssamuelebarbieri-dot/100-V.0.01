import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, LogOut, TrendingUp, Users, Search, Flame, Clock, Calendar, Award, X, Edit2, Camera, Save } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { UserStats } from '../types';

interface ProfileDashboardProps {
  onClose: () => void;
}

const FireEffect = () => (
  <div className="absolute inset-[-12px] pointer-events-none">
    <div className="relative w-full h-full">
      {/* Realistic Fire Layers */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-t from-orange-600 via-yellow-500 to-transparent blur-md rounded-full"
      />
      <motion.div
        animate={{ 
          scale: [1.1, 1.2, 1.1],
          rotate: [0, -8, 8, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-t from-red-600 via-orange-400 to-transparent blur-lg rounded-full"
      />
      <div className="absolute inset-0 flex justify-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [-10, -30],
              x: [0, (i % 2 === 0 ? 10 : -10)],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.2]
            }}
            transition={{ 
              duration: 1 + Math.random(), 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
            className="w-2 h-6 bg-orange-400 blur-[2px] rounded-full absolute bottom-4"
            style={{ left: `${15 + i * 10}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default function ProfileDashboard({ onClose }: ProfileDashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserStats[]>([]);
  const [view, setView] = useState<'overview' | 'analytics' | 'social'>('overview');
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);

  const mockData = [
    { name: 'Lun', minutes: 120 },
    { name: 'Mar', minutes: 180 },
    { name: 'Mer', minutes: 150 },
    { name: 'Gio', minutes: 210 },
    { name: 'Ven', minutes: 90 },
    { name: 'Sab', minutes: 240 },
    { name: 'Dom', minutes: 300 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserStats;
          setStats(data);
          setNewBio(data.bio || '');
          setNewPhotoURL(data.photoURL || '');
        }
      }
    };
    fetchStats();
  }, []);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, {
      bio: newBio,
      photoURL: newPhotoURL
    });
    setStats(prev => prev ? { ...prev, bio: newBio, photoURL: newPhotoURL } : null);
    setIsEditingBio(false);
    setIsEditingPhoto(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const q = query(collection(db, 'users'), where('displayName', '>=', searchQuery));
    const querySnapshot = await getDocs(q);
    const results: UserStats[] = [];
    querySnapshot.forEach((doc) => results.push(doc.data() as UserStats));
    setSearchResults(results);
    setView('social');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      className="fixed inset-0 z-[70] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-red-100 flex items-center justify-between bg-red-50/50">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-xl transition-colors">
            <X size={24} className="text-red-600" />
          </button>
          <div className="relative">
            <FireEffect />
            <div className="relative w-14 h-14 rounded-full border-2 border-orange-500 overflow-hidden shadow-2xl z-10 bg-white">
              <img src={stats?.photoURL || auth.currentUser?.photoURL || ''} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h2 className="font-black uppercase tracking-tight text-red-900">{auth.currentUser?.displayName}</h2>
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Sei on fire! 🔥</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca amici..."
              className="pl-10 pr-4 py-2 rounded-xl border border-red-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 w-48"
            />
            <Search className="absolute left-3 top-2.5 text-red-300" size={16} />
            <button onClick={handleSearch} className="hidden" />
          </div>
          <button
            onClick={() => auth.signOut().then(onClose)}
            className="p-2 text-red-400 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-red-50 p-2 gap-2">
        {[
          { id: 'overview', icon: UserIcon, label: 'TU' },
          { id: 'analytics', icon: TrendingUp, label: 'Analisi' },
          { id: 'social', icon: Users, label: 'Amici' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              view === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-red-900/40 hover:bg-red-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {view === 'overview' && (
          <div className="space-y-6">
            {/* Profile Edit Section */}
            <div className="bg-white p-8 rounded-[40px] border border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-50 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl border-4 border-orange-500 overflow-hidden shadow-2xl">
                        <img src={stats?.photoURL || auth.currentUser?.photoURL || ''} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <button 
                        onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                        className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
                      >
                        <Camera size={16} />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-red-900 uppercase tracking-tight">{auth.currentUser?.displayName}</h3>
                      <p className="text-xs font-bold text-red-900/40 uppercase tracking-widest">
                        {stats?.age} anni • {stats?.school} • {stats?.language}
                      </p>
                    </div>
                  </div>
                </div>

                {isEditingPhoto && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <label className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-2 block">URL Immagine Profilo</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPhotoURL}
                        onChange={(e) => setNewPhotoURL(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 p-3 rounded-xl border border-red-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                      <button onClick={handleUpdateProfile} className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700">
                        <Save size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest">Bio</h4>
                    <button 
                      onClick={() => setIsEditingBio(!isEditingBio)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                  
                  {isEditingBio ? (
                    <div className="space-y-3">
                      <textarea
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value)}
                        className="w-full p-4 rounded-2xl border border-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm h-24 resize-none"
                        placeholder="Racconta chi sei..."
                      />
                      <button 
                        onClick={handleUpdateProfile}
                        className="w-full bg-red-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-colors"
                      >
                        Salva Bio
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-red-900/70 leading-relaxed italic">
                      "{stats?.bio || "Nessuna descrizione fornita."}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                <Clock className="text-red-600 mb-4" size={24} />
                <div className="text-3xl font-black text-red-900">{stats?.totalStudyMinutes || 0}</div>
                <div className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest">Minuti Totali</div>
              </div>
              <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                <Flame className="text-orange-600 mb-4" size={24} />
                <div className="text-3xl font-black text-orange-900">{stats?.streak || 0}</div>
                <div className="text-[10px] font-bold text-orange-900/40 uppercase tracking-widest">Giorno Streak</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-tight text-red-900 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-red-600" />
                Attività Settimanale
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fee2e2" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#991b1b' }} />
                    <Tooltip cursor={{ fill: '#fef2f2' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="minutes" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {view === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-tight text-red-900 mb-6">Andamento Focus</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fee2e2" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#991b1b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#991b1b' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="minutes" stroke="#dc2626" strokeWidth={4} dot={{ r: 6, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-red-900 text-white p-6 rounded-3xl shadow-xl shadow-red-200">
                <Award className="mb-4" size={32} />
                <h4 className="text-xl font-black uppercase tracking-tight mb-2">Prossimo Obiettivo</h4>
                <p className="text-red-200 text-sm mb-4">Raggiungi 500 minuti di studio per sbloccare il badge "Maestro del Focus".</p>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'social' && (
          <div className="space-y-4">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div key={user.uid} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-red-100 hover:border-red-300 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border border-red-100" />
                    <div>
                      <div className="font-bold text-red-900">{user.displayName}</div>
                      <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                        <Flame size={10} /> {user.streak} streak
                      </div>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline">
                    Confronta
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto text-red-100 mb-4" size={48} />
                <p className="text-red-900/40 font-bold uppercase tracking-widest text-xs">Cerca i tuoi amici per confrontare i progressi</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

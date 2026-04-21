import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  Loader2, 
  Info, 
  CheckCircle2, 
  Circle,
  Clock,
  BookOpen,
  Music,
  X
} from 'lucide-react';
import { Task, UserStats } from '../types';
import { getSmartSchedule } from '../lib/gemini';

interface CalendarProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onUpdateTasks: (tasks: Task[]) => void;
  userStats?: UserStats;
}

export default function Calendar({ tasks, onAddTask, onToggleTask, onUpdateTasks, userStats }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'study' as Task['type'],
    time: '14:00',
  });

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-red-900">
            {format(currentMonth, 'MMMM yyyy', { locale: it })}
          </h2>
          <p className="text-xs font-bold text-red-900/40 uppercase tracking-widest">Pianifica il tuo successo</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-red-100 rounded-xl transition-colors text-red-600"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-red-100 rounded-xl transition-colors text-red-600"
          >
            <ChevronRight size={24} />
          </button>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="ml-4 bg-red-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
          >
            {isOptimizing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Ottimizza
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-red-900/30">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayTasks = tasks.filter((t) => isSameDay(new Date(t.startTime), day));
          
          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`relative h-24 p-2 rounded-2xl border transition-all flex flex-col items-start gap-1 ${
                !isCurrentMonth ? 'opacity-20 border-transparent' : 
                isSelected ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-100' : 
                'bg-white border-red-50 hover:border-red-200 text-red-900'
              }`}
            >
              <span className="text-xs font-black">{format(day, 'd')}</span>
              <div className="flex flex-wrap gap-0.5 mt-auto">
                {dayTasks.slice(0, 4).map((t, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 
                      t.type === 'school' ? 'bg-blue-500' : 
                      t.type === 'extra' ? 'bg-orange-500' : 'bg-red-500'
                    }`} 
                  />
                ))}
                {dayTasks.length > 4 && <span className={`text-[8px] font-bold ${isSelected ? 'text-white' : 'text-red-900/40'}`}>+</span>}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const selectedDayTasks = tasks
    .filter((t) => isSameDay(new Date(t.startTime), selectedDate))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleCreateTask = () => {
    if (!newTask.title) return;
    const [hours, minutes] = newTask.time.split(':');
    const startTime = new Date(selectedDate);
    startTime.setHours(parseInt(hours), parseInt(minutes));
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    onAddTask({
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: newTask.description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      type: newTask.type,
      completed: false,
    });

    setNewTask({ title: '', description: '', type: 'study', time: '14:00' });
    setIsAddingTask(false);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const suggestions = await getSmartSchedule(tasks, userStats);
    
    const updatedTasks = tasks.map(task => {
      const suggestion = suggestions.find((s: any) => s.taskId === task.id);
      if (suggestion) {
        return {
          ...task,
          startTime: suggestion.suggestedStartTime,
          endTime: new Date(new Date(suggestion.suggestedStartTime).getTime() + 3600000).toISOString(),
          reasoning: suggestion.reasoning
        };
      }
      return task;
    });

    onUpdateTasks(updatedTasks);
    setIsOptimizing(false);
  };

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {renderHeader()}
        {renderDays()}
        {renderCells()}

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black uppercase tracking-tight text-red-900">
              Attività per il {format(selectedDate, 'd MMMM', { locale: it })}
            </h3>
            <button
              onClick={() => setIsAddingTask(true)}
              className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {selectedDayTasks.length > 0 ? (
              selectedDayTasks.map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  className={`p-6 rounded-[32px] border transition-all ${
                    task.completed ? 'bg-red-50/50 border-transparent opacity-60' : 'bg-white border-red-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button onClick={() => onToggleTask(task.id)} className="mt-1">
                      {task.completed ? (
                        <CheckCircle2 className="text-red-600" size={24} />
                      ) : (
                        <Circle className="text-red-200 hover:text-red-400 transition-colors" size={24} />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-black uppercase tracking-tight ${task.completed ? 'line-through text-red-900/40' : 'text-red-900'}`}>
                          {task.title}
                        </h4>
                        <span className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={12} />
                          {format(new Date(task.startTime), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-red-900/60 mb-3">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                          task.type === 'school' ? 'bg-blue-100 text-blue-600' :
                          task.type === 'extra' ? 'bg-orange-100 text-orange-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {task.type}
                        </span>
                      </div>

                      {task.reasoning && (
                        <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
                          <Info size={16} className="text-red-600 shrink-0 mt-0.5" />
                          <p className="text-xs font-medium text-red-900/70 italic">"{task.reasoning}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-[32px] border border-dashed border-red-200">
                <p className="text-red-900/30 font-bold uppercase tracking-widest text-xs">Nessuna attività programmata</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAddingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-red-950/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-red-900">Nuova Attività</h3>
                <button onClick={() => setIsAddingTask(false)} className="p-2 hover:bg-red-50 rounded-xl">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-2 block">Titolo</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full p-4 rounded-2xl border border-red-100 focus:ring-2 focus:ring-red-600 outline-none transition-all"
                    placeholder="Es: Studio Storia"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-2 block">Descrizione</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full p-4 rounded-2xl border border-red-100 focus:ring-2 focus:ring-red-600 outline-none transition-all h-24 resize-none"
                    placeholder="Dettagli dell'attività..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-2 block">Orario</label>
                    <input
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                      className="w-full p-4 rounded-2xl border border-red-100 focus:ring-2 focus:ring-red-600 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest mb-2 block">Tipo</label>
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({ ...newTask, type: e.target.value as any })}
                      className="w-full p-4 rounded-2xl border border-red-100 focus:ring-2 focus:ring-red-600 outline-none transition-all appearance-none bg-white"
                    >
                      <option value="study">Studio</option>
                      <option value="school">Scuola</option>
                      <option value="extra">Extra</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCreateTask}
                  className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200"
                >
                  Aggiungi al 100%
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

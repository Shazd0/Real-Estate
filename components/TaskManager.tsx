
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, User } from '../types';
import { getTasks, saveTask, deleteTask } from '../services/mockData';
import { ClipboardList, Plus, CheckCircle, Clock, Circle, ArrowRight, Trash2 } from 'lucide-react';

interface TaskManagerProps {
    currentUser: User;
}

const TaskManager: React.FC<TaskManagerProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    setTasks(getTasks(currentUser.id));
  }, [currentUser]);

  const handleAddTask = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newTaskTitle.trim()) return;
      
      const newTask: Task = {
          id: crypto.randomUUID(),
          userId: currentUser.id,
          title: newTaskTitle,
          status: TaskStatus.TODO,
          createdAt: Date.now()
      };
      
      saveTask(newTask);
      setTasks(getTasks(currentUser.id));
      setNewTaskTitle('');
  };

  const moveTask = (task: Task, newStatus: TaskStatus) => {
      const updated = { ...task, status: newStatus };
      saveTask(updated);
      setTasks(getTasks(currentUser.id));
  };

  const removeTask = (id: string) => {
      deleteTask(id);
      setTasks(getTasks(currentUser.id));
  };

  const Column = ({ status, title, icon: Icon, color }: any) => {
      const columnTasks = tasks.filter(t => t.status === status);
      return (
          <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[400px]">
              <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${color}`}>
                  <Icon size={18} />
                  <h3 className="font-bold text-slate-700">{title}</h3>
                  <span className="ml-auto bg-white px-2 py-0.5 rounded text-xs font-bold text-slate-400">{columnTasks.length}</span>
              </div>
              <div className="space-y-3">
                  {columnTasks.map(t => (
                      <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 group hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-slate-800 text-sm">{t.title}</p>
                              <button onClick={() => removeTask(t.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 size={14} />
                              </button>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                             {status !== TaskStatus.TODO && (
                                 <button onClick={() => moveTask(t, status === TaskStatus.DONE ? TaskStatus.IN_PROGRESS : TaskStatus.TODO)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                                     &larr; Prev
                                 </button>
                             )}
                             {status !== TaskStatus.DONE && (
                                 <button onClick={() => moveTask(t, status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS : TaskStatus.DONE)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 ml-auto">
                                     Next &rarr;
                                 </button>
                             )}
                          </div>
                      </div>
                  ))}
                  {columnTasks.length === 0 && (
                      <div className="text-center py-8 text-slate-300 text-xs font-medium italic">Empty List</div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 h-[calc(100vh-140px)] flex flex-col animate-fadeIn">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <ClipboardList className="text-blue-500" /> My Tasks
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Private Kanban Board</p>
             </div>
             
             <form onSubmit={handleAddTask} className="flex gap-2">
                 <input 
                    type="text" 
                    placeholder="New task..." 
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                 />
                 <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                     <Plus size={20} />
                 </button>
             </form>
        </div>

        <div className="flex-1 p-6 flex gap-6 overflow-x-auto">
            <Column status={TaskStatus.TODO} title="To Do" icon={Circle} color="border-slate-200 text-slate-500" />
            <Column status={TaskStatus.IN_PROGRESS} title="In Progress" icon={Clock} color="border-blue-200 text-blue-500" />
            <Column status={TaskStatus.DONE} title="Completed" icon={CheckCircle} color="border-emerald-200 text-emerald-500" />
        </div>
    </div>
  );
};

export default TaskManager;

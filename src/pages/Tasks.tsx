import { useState } from 'react';
import { PlusIcon, Calendar, Clock, FilterIcon, CheckCheck } from 'lucide-react';
import TaskItem from '../components/tasks/TaskItem';
import { motion } from 'framer-motion';

// Mock data
const mockTasks = [
  { id: '1', title: 'Complete project proposal', description: 'Finish drafting the Q3 project proposal document', dueDate: '2023-06-15', completed: false, priority: 'high' },
  { id: '2', title: 'Schedule team meeting', description: 'Set up the monthly team sync meeting', dueDate: '2023-06-10', completed: true, priority: 'medium' },
  { id: '3', title: 'Review analytics report', description: 'Go through the latest analytics and prepare summary', dueDate: '2023-06-12', completed: false, priority: 'medium' },
  { id: '4', title: 'Update website content', description: 'Refresh the about page with new team information', dueDate: '2023-06-20', completed: false, priority: 'low' },
  { id: '5', title: 'Prepare for client presentation', description: 'Create slides for the upcoming client meeting', dueDate: '2023-06-18', completed: false, priority: 'high' },
];

const Tasks = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const task = {
      id: Date.now().toString(),
      title: newTask,
      description: '',
      dueDate: '',
      completed: false,
      priority: 'medium' as const
    };
    
    setTasks([task, ...tasks]);
    setNewTask('');
  };
  
  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Tasks</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your tasks and stay organized</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="input flex-1"
          />
          <button type="submit" className="button-primary">
            <PlusIcon size={18} className="mr-1" />
            Add
          </button>
        </form>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === 'all' 
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
          onClick={() => setFilter('all')}
        >
          <FilterIcon size={16} />
          All
        </button>
        <button 
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === 'pending' 
              ? 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-100' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
          onClick={() => setFilter('pending')}
        >
          <Clock size={16} />
          Pending
        </button>
        <button 
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === 'completed' 
              ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-100' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
          onClick={() => setFilter('completed')}
        >
          <CheckCheck size={16} />
          Completed
        </button>
        <button 
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
        >
          <Calendar size={16} />
          Due date
        </button>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            {filter === 'all' 
              ? 'No tasks found' 
              : filter === 'completed' 
                ? 'No completed tasks yet' 
                : 'No pending tasks'}
          </p>
          {filter !== 'all' && (
            <button className="text-primary-600 hover:text-primary-700" onClick={() => setFilter('all')}>
              View all tasks
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filteredTasks.map(task => (
            <motion.div key={task.id} variants={item}>
              <TaskItem
                task={task}
                onToggleComplete={() => handleToggleComplete(task.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Tasks;
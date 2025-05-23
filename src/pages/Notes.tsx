import { useState } from 'react';
import { PlusIcon, Search, GridIcon, ListIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import { motion } from 'framer-motion';

// Mock data
const mockNotes = [
  { id: '1', title: 'Project Ideas', content: 'List of potential new projects to work on', createdAt: '2023-06-10T14:30:00Z', tags: ['work', 'ideas'] },
  { id: '2', title: 'Meeting Notes', content: 'Notes from the team meeting on product roadmap', createdAt: '2023-06-12T09:15:00Z', tags: ['work', 'meeting'] },
  { id: '3', title: 'Recipe: Pasta Carbonara', content: 'Ingredients and steps for making pasta carbonara', createdAt: '2023-06-08T18:45:00Z', tags: ['recipe', 'food'] },
  { id: '4', title: 'Books to Read', content: 'Collection of book recommendations from friends', createdAt: '2023-06-05T20:30:00Z', tags: ['personal', 'books'] },
  { id: '5', title: 'Workout Plan', content: 'Weekly exercise routine with specific workouts for each day', createdAt: '2023-06-01T07:20:00Z', tags: ['fitness', 'health'] },
];

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const filteredNotes = searchQuery 
    ? mockNotes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mockNotes;

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Notes</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-full"
            />
          </div>
          
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-1">
            <button
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <GridIcon size={18} />
            </button>
            <button
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={18} />
            </button>
          </div>
          
          <Link to="/notes/new" className="button-primary">
            <PlusIcon size={18} className="mr-1" />
            New Note
          </Link>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No notes found</p>
          <Link to="/notes/new" className="button-primary">
            <PlusIcon size={18} className="mr-1" />
            Create your first note
          </Link>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"
          }
        >
          {filteredNotes.map(note => (
            <motion.div key={note.id} variants={item}>
              <NoteCard note={note} viewMode={viewMode} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Notes;
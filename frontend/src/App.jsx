import React, { useState, useEffect } from 'react';
import { api } from './api';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import { Plus, Filter, AlertCircle, Search } from 'lucide-react';

export default function App() {
  const [board, setBoard] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [boards, setBoards] = useState([]);
const [activeBoardId, setActiveBoardId] = useState(1);
const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
const [newBoardTitle, setNewBoardTitle] = useState('');

  // Fetch board list on mount
useEffect(() => {
  const loadBoards = async () => {
    try {
      const data = await api.getBoards();
      setBoards(data);
      if (data.length > 0) setActiveBoardId(data[0].id);
    } catch (err) {
      setErrorMessage('Failed to fetch boards.');
    }
  };
  loadBoards();
}, []);

// Fetch active board data when activeBoardId or priorityFilter changes
const fetchBoard = async () => {
  if (!activeBoardId) return;
  try {
    const data = await api.getBoard(activeBoardId, priorityFilter);
    setBoard(data);
    setErrorMessage('');
  } catch (err) {
    setErrorMessage('Failed to load board data.');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchBoard();
}, [activeBoardId, priorityFilter]);

const handleCreateBoard = async (e) => {
  e.preventDefault();
  if (!newBoardTitle.trim()) return;
  try {
    const createdBoard = await api.createBoard(newBoardTitle);
    setBoards([...boards, createdBoard]);
    setActiveBoardId(createdBoard.id);
    setNewBoardTitle('');
    setIsNewBoardModalOpen(false);
  } catch (err) {
    setErrorMessage('Failed to create board.');
  }
};

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        await api.updateTask(taskData.id, taskData);
      } else {
        await api.createTask(taskData);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      fetchBoard();
    } catch (err) {
      setErrorMessage(err.message || 'Error saving task.');
    }
  };

  const handleMoveTask = async (taskId, newColumnId) => {
    try {
      await api.updateTask(taskId, { column_id: newColumnId });
      fetchBoard();
    } catch (err) {
      setErrorMessage('Failed to move task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      fetchBoard();
    } catch (err) {
      setErrorMessage('Failed to delete task.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading board...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
          <p className="text-xs text-gray-500">Lightweight Team Board</p>
        </div>




     <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
    <p className="text-sm text-gray-500">Lightweight Team Board</p>
  </div>

  {/* Board Selector Dropdown & New Board Button */}
  <div className="flex items-center space-x-3">
    <select
      value={activeBoardId || ''}
      onChange={(e) => setActiveBoardId(Number(e.target.value))}
      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
    >
      {boards.map((b) => (
        <option key={b.id} value={b.id}>
          {b.title}
        </option>
      ))}
    </select>

    <button
      onClick={() => setIsNewBoardModalOpen(true)}
      className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors shadow-sm flex items-center gap-1"
    >
      + New Board
    </button>
  </div>
</header>





        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">





          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-xs w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
               type="text"
                placeholder="Search tasks or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-gray-800 placeholder-gray-400 outline-none w-full"
              />
             {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 text-xs">
               ✕
               </button>
              )}
           </div>






           
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-600 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <button
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-semibold hover:underline">Dismiss</button>
        </div>
      )}

      <main className="flex-1 p-6 overflow-x-auto">
        <div className="flex gap-6 min-w-[768px] items-start">






{board?.columns.map((column) => {
  // Filter tasks matching either Title OR Description
  const filteredTasks = column.tasks.filter((task) => {
    const query = searchTerm.toLowerCase().trim();
    const matchesTitle = task.title?.toLowerCase().includes(query);
    const matchesDescription = task.description?.toLowerCase().includes(query);
    
    return matchesTitle || matchesDescription;
  });

  return (
    <div key={column.id} className="flex-1 bg-gray-200/60 rounded-xl p-4 min-w-[280px]">
      {/* Column Header + Count */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-gray-700 text-sm">{column.title}</h3>
        <span className="bg-gray-300/80 text-gray-700 text-xs px-2 py-0.5 rounded-full font-semibold">
          {filteredTasks.length}
        </span>
      </div>

      {/* Render Filtered Tasks */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columns={board.columns}
            onMove={handleMoveTask}
            onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }}
            onDelete={handleDeleteTask}
          />
        ))}

        {filteredTasks.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-xs text-gray-400">
            {searchTerm ? 'No matching tasks' : 'No tasks here'}
          </div>
        )}
      </div>
    </div>
  );
})}





        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultColumnId={board?.columns[0]?.id || 1}
      />


      {isNewBoardModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
      <h3 className="text-md font-bold text-gray-800 mb-4">Create New Board</h3>
      <form onSubmit={handleCreateBoard} className="space-y-4">
        <input
          type="text"
          placeholder="Board Name (e.g. Marketing, Sprint 1)"
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsNewBoardModalOpen(false)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
)}



    </div>
  );
}
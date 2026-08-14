import React from 'react';
import { Pencil, Trash2, ArrowRightLeft } from 'lucide-react';

const priorityColors = {
  Low: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  High: 'bg-red-100 text-red-800 border-red-200'
};

export default function TaskCard({ task, columns, onMove, onEdit, onDelete }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 break-words flex-1 pr-2">{task.title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 whitespace-pre-wrap">{task.description}</p>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <ArrowRightLeft className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={task.column_id}
            onChange={(e) => onMove(task.id, Number(e.target.value))}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-xs rounded p-1 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                Move to {col.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(task)} 
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
            title="Edit Task"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(task.id)} 
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
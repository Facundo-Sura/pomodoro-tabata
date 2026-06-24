import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineTrash, HiOutlinePencil, HiOutlineCheck } from 'react-icons/hi'
import { useTaskContext } from '../../context/TaskContext'

export default function TaskItem({ task }) {
  const { toggleTask, deleteTask, updateTask, CATEGORIES, PRIORITIES } = useTaskContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const category = CATEGORIES.find((c) => c.id === task.category)
  const priority = PRIORITIES[task.priority]

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateTask({ id: task.id, title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-all ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => toggleTask(task.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          task.completed
            ? 'border-accent bg-accent text-white'
            : 'border-muted hover:border-accent'
        }`}
      >
        {task.completed && <HiOutlineCheck size={12} />}
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            className="w-full rounded border border-accent bg-card px-2 py-1 text-sm text-text focus:outline-none"
            autoFocus
          />
        ) : (
          <p className={`text-sm ${task.completed ? 'line-through text-muted' : 'text-text'}`}>
            {task.title}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          {category && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${category.color} bg-opacity-20 text-muted`}>
              <span className={`h-1.5 w-1.5 rounded-full ${category.color}`} />
              {category.label}
            </span>
          )}
          <span className={`text-xs ${priority.color}`}>
            {priority.label}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 gap-1">
        {!task.completed && (
          <button
            onClick={() => { setIsEditing(!isEditing); setEditTitle(task.title) }}
            className="rounded p-1.5 text-muted hover:bg-card hover:text-text transition-colors"
          >
            <HiOutlinePencil size={14} />
          </button>
        )}
        <button
          onClick={() => deleteTask(task.id)}
          className="rounded p-1.5 text-muted hover:bg-card hover:text-danger transition-colors"
        >
          <HiOutlineTrash size={14} />
        </button>
      </div>
    </motion.div>
  )
}

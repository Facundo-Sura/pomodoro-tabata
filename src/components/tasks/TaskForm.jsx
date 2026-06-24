import { useState } from 'react'
import Button from '../common/Button'
import { useTaskContext } from '../../context/TaskContext'

export default function TaskForm() {
  const { addTask, CATEGORIES } = useTaskContext()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('work')
  const [priority, setPriority] = useState('medium')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({ title: title.trim(), category, priority })
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nueva tarea..."
        className="flex-1 min-w-[200px] rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-accent"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
      >
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
      >
        <option value="high">Alta</option>
        <option value="medium">Media</option>
        <option value="low">Baja</option>
      </select>
      <Button type="submit" variant="primary" size="md">Añadir</Button>
    </form>
  )
}

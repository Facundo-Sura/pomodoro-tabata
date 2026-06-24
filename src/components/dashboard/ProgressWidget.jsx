import { motion } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'

export default function ProgressWidget() {
  const { todayTasks, completedToday, todayProgress } = useTaskContext()

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-text">Tareas de Hoy</h3>
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-muted mb-1">
          <span>{completedToday} / {todayTasks.length} completadas</span>
          <span>{Math.round(todayProgress * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${todayProgress * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
      <div className="space-y-2">
        {todayTasks.length === 0 ? (
          <p className="text-xs text-muted">No hay tareas para hoy</p>
        ) : (
          todayTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                task.completed ? 'bg-accent' : 'bg-muted'
              }`} />
              <span className={`text-xs truncate ${
                task.completed ? 'line-through text-muted' : 'text-text'
              }`}>
                {task.title}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

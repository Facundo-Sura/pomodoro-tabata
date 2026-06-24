import { AnimatePresence } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'
import TaskFilters from './TaskFilters'

export default function TaskList() {
  const { filteredTasks } = useTaskContext()

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h2 className="text-xl font-bold text-text">Lista de Tareas</h2>
      <TaskForm />
      <TaskFilters />
      <AnimatePresence mode="popLayout">
        {filteredTasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            No hay tareas. ¡Añade una!
          </p>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

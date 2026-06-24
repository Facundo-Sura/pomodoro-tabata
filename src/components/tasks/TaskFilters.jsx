import { useTaskContext } from '../../context/TaskContext'

const filters = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Activas' },
  { id: 'completed', label: 'Completadas' },
]

export default function TaskFilters() {
  const { filter, setFilter, searchQuery, setSearch } = useTaskContext()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-border bg-surface p-0.5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.id ? 'bg-accent text-white' : 'text-muted hover:text-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar tareas..."
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text placeholder-muted focus:outline-none focus:border-accent"
      />
    </div>
  )
}

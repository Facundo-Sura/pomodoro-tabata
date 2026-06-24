import { useTaskContext } from '../../context/TaskContext'

const ACHIEVEMENTS = {
  firstPomodoro: { id: 'firstPomodoro', label: 'Primer Pomodoro', icon: '🍅', condition: (stats) => stats.pomodorosDone >= 1 },
  fivePomodoros: { id: 'fivePomodoros', label: '5 Pomodoros', icon: '🔥', condition: (stats) => stats.pomodorosDone >= 5 },
  tenPomodoros: { id: 'tenPomodoros', label: '10 Pomodoros', icon: '⭐', condition: (stats) => stats.pomodorosDone >= 10 },
  firstTabata: { id: 'firstTabata', label: 'Primer Tabata', icon: '🥊', condition: (stats) => stats.tabatasDone >= 1 },
  warriorTabata: { id: 'warriorTabata', label: '5 Tabatas', icon: '⚔️', condition: (stats) => stats.tabatasDone >= 5 },
}

export default function StatsPanel({ stats }) {
  const { completedToday } = useTaskContext()

  const unlockedAchievements = Object.values(ACHIEVEMENTS).filter((a) => a.condition(stats))

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-text">Estadísticas</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Pomodoros hoy</span>
          <span className="font-medium text-text">{stats.pomodorosDone}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Tabatas completadas</span>
          <span className="font-medium text-text">{stats.tabatasDone}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Tareas hoy</span>
          <span className="font-medium text-text">{completedToday}</span>
        </div>
      </div>

      {unlockedAchievements.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-xs font-semibold text-text">Logros</p>
          <div className="flex flex-wrap gap-2">
            {unlockedAchievements.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs text-muted" title={a.label}>
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

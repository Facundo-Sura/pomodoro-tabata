import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useTimerContext } from '../../context/TimerContext'
import { useTaskContext } from '../../context/TaskContext'
import { formatTime } from '../../utils/formatTime'
import { PHASE_LABELS, PHASE_COLORS } from '../../utils/constants'
import ProgressWidget from './ProgressWidget'
import StatsPanel from './StatsPanel'
import Card from '../common/Card'

const MOTIVATIONAL_QUOTES = [
  '"El éxito es la suma de pequeños esfuerzos repetidos día tras día." — R. Collier',
  '"No cuentes los días, haz que los días cuenten." — M. Ali',
  '"El único mal entrenamiento es el que no hiciste."',
  '"La disciplina es el puente entre metas y logros." — J. Rohn',
  '"No se trata de tener tiempo, se trata de hacer tiempo."',
  '"Tu única competencia es tu yo de ayer."',
  '"El dolor es temporal. Rendirse dura para siempre." — L. Armstrong',
  '"Cada pomodoro es una victoria contra la procrastinación."',
]

function getRandomQuote() {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
}

export default function Dashboard() {
  const { setModule, MODULES } = useApp()
  const { mode, phase, timeRemaining, isRunning, stats, start, pause, currentRound, tabataSettings } = useTimerContext()
  const { todayTasks, completedToday, todayProgress } = useTaskContext()
  const [quote] = useState(getRandomQuote)

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-muted">Resumen de tu productividad</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Timer widget */}
        <Card className="md:col-span-2" title="Temporizador">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${PHASE_COLORS[phase] || 'text-text'}`}>
                {PHASE_LABELS[phase] || phase}
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-text">
                {formatTime(timeRemaining)}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {mode === 'pomodoro' ? 'Modo Pomodoro' : `Tabata - Round ${currentRound}/${tabataSettings.rounds}`}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={isRunning ? pause : start}
                className="rounded-xl bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
              >
                {isRunning ? 'Pausar' : 'Iniciar'}
              </button>
              <button
                onClick={() => setModule(MODULES.TIMER)}
                className="rounded-xl border border-border px-6 py-2 text-sm text-muted hover:bg-card hover:text-text transition-colors"
              >
                Abrir
              </button>
            </div>
          </div>
        </Card>

        {/* Stats mini */}
        <StatsPanel stats={stats} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {/* Tasks widget */}
        <div className="md:col-span-2">
          <ProgressWidget />
        </div>

        {/* Motivational quote */}
        <Card>
          <p className="text-sm italic leading-relaxed text-muted">
            {quote}
          </p>
        </Card>
      </div>

      {/* Quick access */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickCard
          label="Temporizador"
          color="bg-blue-500"
          onClick={() => setModule(MODULES.TIMER)}
        />
        <QuickCard
          label="Tareas"
          color="bg-green-500"
          onClick={() => setModule(MODULES.TASKS)}
        />
        <QuickCard
          label="Calculadora"
          color="bg-purple-500"
          onClick={() => setModule(MODULES.CALCULATOR)}
        />
        <QuickCard
          label="Ajustes"
          color="bg-gray-500"
          onClick={() => setModule(MODULES.SETTINGS)}
        />
      </div>
    </div>
  )
}

function QuickCard({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-accent hover:bg-surface active:scale-95"
    >
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-sm font-medium text-text">{label}</span>
    </button>
  )
}

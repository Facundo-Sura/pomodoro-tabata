import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiOutlinePlay, HiOutlinePause, HiOutlineRefresh, HiOutlineFastForward } from 'react-icons/hi'
import { useTimerContext } from '../../context/TimerContext'
import { PHASE_BG_COLORS, PHASES, TABATA_DEFAULTS } from '../../utils/constants'
import CircularProgress from './CircularProgress'
import TimerDisplay from './TimerDisplay'
import PomodoroConfig from './PomodoroConfig'
import TabataConfig from './TabataConfig'
import Button from '../common/Button'

export default function TimerContainer() {
  const {
    mode, phase, timeRemaining, isRunning, currentRound,
    pomodoroSettings, tabataSettings, stats,
    setMode, start, pause, reset, skipPhase,
    updatePomodoroSettings, updateTabataSettings,
  } = useTimerContext()

  const totalRounds = mode === 'pomodoro' ? pomodoroSettings.sessionsBeforeLongBreak : tabataSettings.rounds
  const maxTime = mode === 'pomodoro'
    ? (phase === PHASES.FOCUS ? pomodoroSettings.focusTime : phase === PHASES.SHORT_BREAK ? pomodoroSettings.shortBreak : pomodoroSettings.longBreak)
    : (phase === PHASES.PREP ? tabataSettings.prepTime : phase === PHASES.WORK ? tabataSettings.workTime : tabataSettings.restTime)

  const progress = maxTime > 0 ? timeRemaining / maxTime : 0
  const phaseColor = phase === PHASES.FOCUS ? 'text-blue-400' : phase === PHASES.WORK ? 'text-red-500' : phase === PHASES.REST ? 'text-green-400' : phase === PHASES.PREP ? 'text-yellow-400' : 'text-purple-400'

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        if (isRunning) pause()
        else start()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isRunning, start, pause])

  return (
    <motion.div
      className={`flex min-h-svh flex-col items-center justify-center transition-colors duration-500 ${PHASE_BG_COLORS[phase] || 'bg-bg'}`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex rounded-lg border border-border bg-surface p-1">
          <button
            onClick={() => setMode('pomodoro')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'pomodoro' ? 'bg-accent text-white' : 'text-muted hover:text-text'
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setMode('tabata')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'tabata' ? 'bg-accent text-white' : 'text-muted hover:text-text'
            }`}
          >
            Tabata / Peleador
          </button>
        </div>

        <CircularProgress progress={progress} size={300} strokeWidth={8} phaseColor={phaseColor}>
          <TimerDisplay
            phase={phase}
            timeRemaining={timeRemaining}
            currentRound={mode === 'tabata' ? currentRound : 0}
            totalRounds={totalRounds}
          />
        </CircularProgress>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={isRunning ? pause : start}
          >
            {isRunning ? <HiOutlinePause size={20} /> : <HiOutlinePlay size={20} />}
            {isRunning ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button variant="ghost" size="md" onClick={reset}>
            <HiOutlineRefresh size={18} /> Reiniciar
          </Button>
          <Button variant="ghost" size="md" onClick={skipPhase} disabled={phase === PHASES.DONE}>
            <HiOutlineFastForward size={18} /> Saltar
          </Button>
        </div>

        <div className="flex gap-2">
          {mode === 'pomodoro'
            ? <PomodoroConfig settings={pomodoroSettings} onUpdate={updatePomodoroSettings} />
            : <TabataConfig settings={tabataSettings} onUpdate={updateTabataSettings} />
          }
        </div>

        <div className="flex gap-6 text-xs text-muted">
          <span>Pomodoros: {stats.pomodorosDone}</span>
          <span>Tabatas: {stats.tabatasDone}</span>
        </div>
      </div>
    </motion.div>
  )
}

import { createContext, useContext, useReducer, useCallback, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { POMODORO_DEFAULTS, TABATA_DEFAULTS, PHASES, PHASE_LABELS } from '../utils/constants'
import { useTimer } from '../hooks/useTimer'
import { useNotifications } from '../hooks/useNotifications'
import { useAudio } from '../hooks/useAudio'
import { playBeep, playVictory, playPhaseStart } from '../utils/audio'

const TimerContext = createContext()

function getPhaseDuration(phase, settings) {
  switch (phase) {
    case PHASES.FOCUS: return settings.focusTime
    case PHASES.SHORT_BREAK: return settings.shortBreak
    case PHASES.LONG_BREAK: return settings.longBreak
    case PHASES.PREP: return settings.prepTime
    case PHASES.WORK: return settings.workTime
    case PHASES.REST: return settings.restTime
    default: return 0
  }
}

function getNextPhase(state) {
  if (state.mode === 'pomodoro') {
    switch (state.phase) {
      case PHASES.FOCUS:
        if (state.sessionsCompleted + 1 >= state.pomodoroSettings.sessionsBeforeLongBreak) {
          return PHASES.LONG_BREAK
        }
        return PHASES.SHORT_BREAK
      case PHASES.SHORT_BREAK:
      case PHASES.LONG_BREAK:
        return PHASES.FOCUS
      default:
        return PHASES.FOCUS
    }
  } else {
    switch (state.phase) {
      case PHASES.PREP: return PHASES.WORK
      case PHASES.WORK: return PHASES.REST
      case PHASES.REST:
        if (state.currentRound >= state.tabataSettings.rounds) {
          return PHASES.DONE
        }
        return PHASES.WORK
      default:
        return PHASES.WORK
    }
  }
}

function timerReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload, phase: action.payload === 'pomodoro' ? PHASES.FOCUS : PHASES.PREP, timeRemaining: 0, isRunning: false, currentRound: 0, sessionsCompleted: 0 }
    case 'START': {
      const dur = state.timeRemaining === 0 && state.phase !== PHASES.DONE
        ? getPhaseDuration(state.phase, state.mode === 'pomodoro' ? state.pomodoroSettings : state.tabataSettings)
        : state.timeRemaining
      return { ...state, isRunning: true, timeRemaining: dur || 1 }
    }
    case 'PAUSE':
      return { ...state, isRunning: false }
    case 'RESET':
      return {
        ...state,
        isRunning: false,
        phase: state.mode === 'pomodoro' ? PHASES.FOCUS : PHASES.PREP,
        timeRemaining: 0,
        currentRound: 0,
      }
    case 'TICK': {
      if (state.timeRemaining <= 1) {
        const nextPhase = getNextPhase(state)
        let newSessions = state.sessionsCompleted
        let newRound = state.currentRound
        if (state.mode === 'pomodoro' && state.phase === PHASES.FOCUS) newSessions++
        if (state.mode === 'tabata' && state.phase === PHASES.PREP) newRound++
        if (state.mode === 'tabata' && state.phase === PHASES.REST) newRound++
        const isDone = nextPhase === PHASES.DONE
        return {
          ...state,
          phase: nextPhase,
          isRunning: !isDone,
          timeRemaining: isDone ? 0 : getPhaseDuration(nextPhase, state.mode === 'pomodoro' ? state.pomodoroSettings : state.tabataSettings),
          sessionsCompleted: newSessions,
          currentRound: newRound,
        }
      }
      return { ...state, timeRemaining: state.timeRemaining - 1 }
    }
    case 'SKIP_PHASE': {
      const nextPhase = getNextPhase(state)
      let newSessions2 = state.sessionsCompleted
      let newRound2 = state.currentRound
      if (state.mode === 'pomodoro' && state.phase === PHASES.FOCUS) newSessions2++
      if (state.mode === 'tabata' && state.phase === PHASES.PREP) newRound2++
      if (state.mode === 'tabata' && state.phase === PHASES.REST) newRound2++
      const isDone2 = nextPhase === PHASES.DONE
      return {
        ...state,
        phase: nextPhase,
        isRunning: !isDone2,
        timeRemaining: isDone2 ? 0 : getPhaseDuration(nextPhase, state.mode === 'pomodoro' ? state.pomodoroSettings : state.tabataSettings),
        sessionsCompleted: newSessions2,
        currentRound: newRound2,
      }
    }
    case 'UPDATE_POMODORO_SETTINGS':
      return { ...state, pomodoroSettings: { ...state.pomodoroSettings, ...action.payload } }
    case 'UPDATE_TABATA_SETTINGS':
      return { ...state, tabataSettings: { ...state.tabataSettings, ...action.payload } }
    default:
      return state
  }
}

export function TimerProvider({ children }) {
  const [pomodoroSettings, setPomodoroSettings] = useLocalStorage('pomodoroSettings', POMODORO_DEFAULTS)
  const [tabataSettings, setTabataSettings] = useLocalStorage('tabataSettings', TABATA_DEFAULTS)
  const [stats, setStats] = useLocalStorage('timerStats', { pomodorosDone: 0, tabatasDone: 0 })

  const [state, dispatch] = useReducer(timerReducer, {
    mode: 'pomodoro',
    phase: PHASES.FOCUS,
    timeRemaining: 0,
    isRunning: false,
    currentRound: 0,
    sessionsCompleted: 0,
    pomodoroSettings,
    tabataSettings,
  })

  const prevPhaseRef = useRef(state.phase)
  const { notify } = useNotifications()
  const audio = useAudio()

  const onTick = useCallback(() => {
    const prevTime = state.timeRemaining

    dispatch({ type: 'TICK' })

    if (prevTime <= 5 && prevTime > 0 && (state.phase === PHASES.FOCUS || state.phase === PHASES.WORK)) {
      playBeep()
    }
  }, [state.timeRemaining, state.phase])

  if (prevPhaseRef.current !== state.phase) {
    prevPhaseRef.current = state.phase
    if (state.phase === PHASES.DONE) {
      playVictory()
      notify('¡Completado!', state.mode === 'pomodoro' ? 'Sesión Pomodoro completada' : 'Entrenamiento Tabata completado')
      setStats(prev => ({
        pomodorosDone: prev.pomodorosDone + (state.mode === 'pomodoro' ? 1 : 0),
        tabatasDone: prev.tabatasDone + (state.mode === 'tabata' ? 1 : 0),
      }))
    } else if (state.timeRemaining > 0) {
      playPhaseStart()
      notify(
        state.mode === 'pomodoro' ? 'Cambio de fase' : '¡Siguiente fase!',
        PHASE_LABELS[state.phase] || state.phase
      )
    }
  }

  const { clearTimer } = useTimer(state.isRunning, onTick)

  const value = {
    mode: state.mode,
    phase: state.phase,
    timeRemaining: state.timeRemaining,
    isRunning: state.isRunning,
    currentRound: state.currentRound,
    sessionsCompleted: state.sessionsCompleted,
    pomodoroSettings,
    tabataSettings,
    stats,
    setMode: (mode) => { clearTimer(); dispatch({ type: 'SET_MODE', payload: mode }) },
    start: () => dispatch({ type: 'START' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    reset: () => { clearTimer(); dispatch({ type: 'RESET' }) },
    skipPhase: () => dispatch({ type: 'SKIP_PHASE' }),
    updatePomodoroSettings: (s) => { setPomodoroSettings(s); dispatch({ type: 'UPDATE_POMODORO_SETTINGS', payload: s }) },
    updateTabataSettings: (s) => { setTabataSettings(s); dispatch({ type: 'UPDATE_TABATA_SETTINGS', payload: s }) },
  }

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimerContext() {
  const context = useContext(TimerContext)
  if (!context) throw new Error('useTimerContext must be used within TimerProvider')
  return context
}

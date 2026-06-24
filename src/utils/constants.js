export const POMODORO_DEFAULTS = {
  focusTime: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  sessionsBeforeLongBreak: 4,
}

export const TABATA_DEFAULTS = {
  rounds: 8,
  workTime: 3 * 60,
  restTime: 60,
  prepTime: 10,
}

export const PHASES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
  PREP: 'prep',
  WORK: 'work',
  REST: 'rest',
  DONE: 'done',
}

export const PHASE_COLORS = {
  focus: 'text-blue-400',
  shortBreak: 'text-green-400',
  longBreak: 'text-green-400',
  prep: 'text-yellow-400',
  work: 'text-red-500',
  rest: 'text-green-400',
  done: 'text-purple-400',
}

export const PHASE_BG_COLORS = {
  focus: 'bg-dark-bg',
  shortBreak: 'bg-dark-bg',
  longBreak: 'bg-dark-bg',
  prep: 'bg-amber-950/60',
  work: 'bg-red-950/60',
  rest: 'bg-emerald-950/60',
  done: 'bg-dark-bg',
}

export const PHASE_LABELS = {
  focus: 'ENFOQUE',
  shortBreak: 'DESCANSO CORTO',
  longBreak: 'DESCANSO LARGO',
  prep: '¡PREPÁRATE!',
  work: '¡PELEA!',
  rest: 'DESCANSO',
  done: '¡COMPLETADO!',
}

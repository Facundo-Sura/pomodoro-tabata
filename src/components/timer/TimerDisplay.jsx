import { PHASE_LABELS, PHASE_COLORS } from '../../utils/constants'
import { formatTime } from '../../utils/formatTime'

export default function TimerDisplay({ phase, timeRemaining, currentRound, totalRounds }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-semibold ${PHASE_COLORS[phase] || 'text-text'}`}>
        {PHASE_LABELS[phase] || phase}
      </p>
      <p className="mt-2 text-6xl font-bold tracking-wider text-text tabular-nums md:text-7xl">
        {formatTime(timeRemaining)}
      </p>
      {currentRound > 0 && (
        <p className="mt-1 text-sm text-muted">
          Round {currentRound} / {totalRounds}
        </p>
      )}
    </div>
  )
}

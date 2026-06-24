import { useCallback } from 'react'
import { playBell, playBeep, playVictory, playPhaseStart } from '../utils/audio'

export function useAudio() {
  const playSessionEnd = useCallback(() => playBell(), [])
  const playBreakEnd = useCallback(() => playBell(), [])
  const playTick = useCallback(() => playBeep(), [])
  const playComplete = useCallback(() => playVictory(), [])
  const playPhaseChange = useCallback(() => playPhaseStart(), [])

  return { playSessionEnd, playBreakEnd, playTick, playComplete, playPhaseChange }
}

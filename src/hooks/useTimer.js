import { useEffect, useRef, useCallback } from 'react'

export function useTimer(isRunning, onTick, interval = 1000) {
  const intervalRef = useRef(null)
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        onTickRef.current()
      }, interval)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [isRunning, interval, clearTimer])

  return { clearTimer }
}

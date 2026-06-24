import { useCallback } from 'react'

export function useNotifications() {
  const notify = useCallback((title, body) => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: '/vite.svg' })
        }
      })
    }
  }, [])

  return { notify }
}

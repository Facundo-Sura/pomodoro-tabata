import { useEffect } from 'react'
import { HiOutlineX } from 'react-icons/hi'
import { useApp } from '../../context/AppContext'

export default function FocusMode({ children }) {
  const { isFocusMode, setFocusMode } = useApp()

  useEffect(() => {
    if (!isFocusMode) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setFocusMode(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isFocusMode, setFocusMode])

  if (!isFocusMode) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
      <button
        onClick={() => setFocusMode(false)}
        className="absolute right-4 top-4 rounded-lg p-2 text-muted hover:bg-card hover:text-text transition-colors"
        aria-label="Salir del modo enfoque"
      >
        <HiOutlineX size={24} />
      </button>
      {children}
    </div>
  )
}

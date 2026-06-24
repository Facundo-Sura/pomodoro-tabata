import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 text-muted hover:bg-card hover:text-text transition-colors"
      aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {theme === 'dark' ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
    </button>
  )
}

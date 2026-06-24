import {
  HiOutlineHome, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineCalculator, HiOutlineChat, HiOutlineCog,
} from 'react-icons/hi'
import { useApp, MODULES } from '../../context/AppContext'

const navItems = [
  { id: MODULES.DASHBOARD, icon: HiOutlineHome, label: 'Inicio' },
  { id: MODULES.TIMER, icon: HiOutlineClock, label: 'Timer' },
  { id: MODULES.TASKS, icon: HiOutlineCheckCircle, label: 'Tareas' },
  { id: MODULES.CALCULATOR, icon: HiOutlineCalculator, label: 'Calc' },
  { id: MODULES.CHAT, icon: HiOutlineChat, label: 'Chat' },
  { id: MODULES.SETTINGS, icon: HiOutlineCog, label: 'Ajustes' },
]

export default function MobileNav() {
  const { activeModule, setModule, isCalculatorOpen, toggleCalculator } = useApp()

  const handleNav = (id) => {
    if (id === MODULES.CALCULATOR) {
      toggleCalculator()
    } else {
      setModule(id)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-border bg-surface px-2 py-2 md:hidden">
      {navItems.map(({ id, icon: Icon, label }) => {
        const isActive = id === MODULES.CALCULATOR ? isCalculatorOpen : activeModule === id
        return (
          <button
            key={id}
            onClick={() => handleNav(id)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'text-accent'
                : 'text-muted hover:text-text'
            }`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

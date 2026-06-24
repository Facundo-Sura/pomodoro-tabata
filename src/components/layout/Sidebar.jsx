import { motion } from 'framer-motion'
import {
  HiOutlineHome, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineCalculator, HiOutlineChat, HiOutlineCog,
  HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight,
} from 'react-icons/hi'
import { useApp, MODULES } from '../../context/AppContext'

const navItems = [
  { id: MODULES.DASHBOARD, icon: HiOutlineHome, label: 'Dashboard' },
  { id: MODULES.TIMER, icon: HiOutlineClock, label: 'Temporizador' },
  { id: MODULES.TASKS, icon: HiOutlineCheckCircle, label: 'Tareas' },
  { id: MODULES.CALCULATOR, icon: HiOutlineCalculator, label: 'Calculadora' },
  { id: MODULES.CHAT, icon: HiOutlineChat, label: 'Chat' },
  { id: MODULES.SETTINGS, icon: HiOutlineCog, label: 'Ajustes' },
]

export default function Sidebar() {
  const { activeModule, setModule, isSidebarCollapsed, toggleSidebar, isCalculatorOpen, toggleCalculator } = useApp()

  const handleNav = (id) => {
    if (id === MODULES.CALCULATOR) {
      toggleCalculator()
    } else {
      setModule(id)
    }
  }

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? 64 : 240 }}
      className="fixed left-0 top-0 z-40 flex h-svh flex-col border-r border-border bg-surface pt-4 hidden md:flex"
    >
      <div className="mb-6 flex items-center justify-between px-4">
        {!isSidebarCollapsed && (
          <span className="text-lg font-bold text-accent">PHub</span>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-muted hover:bg-card hover:text-text transition-colors"
          aria-label={isSidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isSidebarCollapsed
            ? <HiOutlineChevronDoubleRight size={20} />
            : <HiOutlineChevronDoubleLeft size={20} />
          }
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = id === MODULES.CALCULATOR ? isCalculatorOpen : activeModule === id
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/20 text-accent'
                  : 'text-muted hover:bg-card hover:text-text'
              }`}
              title={isSidebarCollapsed ? label : undefined}
            >
              <Icon size={22} className="shrink-0" />
              {!isSidebarCollapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>
    </motion.aside>
  )
}

import { useApp, MODULES } from './context/AppContext'
import { TimerProvider, useTimerContext } from './context/TimerContext'
import { TaskProvider } from './context/TaskContext'
import Sidebar from './components/layout/Sidebar'
import MobileNav from './components/layout/MobileNav'
import FocusMode from './components/layout/FocusMode'
import Dashboard from './components/dashboard/Dashboard'
import TimerContainer from './components/timer/TimerContainer'
import TaskList from './components/tasks/TaskList'
import Calculator from './components/calculator/Calculator'
import ChatWidget from './components/chatbot/ChatWidget'
import Settings from './components/settings/Settings'

function ModuleRenderer() {
  const { activeModule, isCalculatorOpen } = useApp()
  const { isFocusMode } = useApp()

  return (
    <div className="flex-1">
      {/* Calculator panel overlay — renders on TOP of any module */}
      <Calculator />

      {/* Main module content */}
      {activeModule === MODULES.DASHBOARD && <Dashboard />}
      {activeModule === MODULES.TIMER && <TimerContainer />}
      {activeModule === MODULES.TASKS && <TaskList />}
      {activeModule === MODULES.SETTINGS && <Settings />}
      {/* Calculator and Chat are overlays — not full modules */}

      {/* Focus mode overlay */}
      <FocusMode>
        <TimerContainer />
      </FocusMode>
    </div>
  )
}

export default function App() {
  return (
    <TimerProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </TimerProvider>
  )
}

function AppContent() {
  const { isFocusMode } = useApp()

  return (
    <div className="flex min-h-svh bg-bg text-text">
      {/* Sidebar — hidden in focus mode */}
      {!isFocusMode && <Sidebar />}

      {/* Main content area */}
      <div className={`flex flex-1 flex-col ${!isFocusMode ? 'md:ml-16' : ''}`}>
        <ModuleRenderer />
      </div>

      {/* Mobile nav — hidden in focus mode */}
      {!isFocusMode && <MobileNav />}

      {/* Chat widget — floating */}
      <ChatWidget />
    </div>
  )
}

import { createContext, useContext, useReducer } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AppContext = createContext()

const MODULES = {
  DASHBOARD: 'dashboard',
  TIMER: 'timer',
  TASKS: 'tasks',
  CALCULATOR: 'calculator',
  CHAT: 'chat',
  SETTINGS: 'settings',
}

const initialState = {
  activeModule: MODULES.DASHBOARD,
  isSidebarCollapsed: false,
  isFocusMode: false,
  isCalculatorOpen: false,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_MODULE':
      return { ...state, activeModule: action.payload }
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarCollapsed: !state.isSidebarCollapsed }
    case 'SET_FOCUS_MODE':
      return { ...state, isFocusMode: action.payload }
    case 'TOGGLE_CALCULATOR':
      return { ...state, isCalculatorOpen: !state.isCalculatorOpen }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [collapsed, setCollapsed] = useLocalStorage('sidebarCollapsed', false)
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    isSidebarCollapsed: collapsed,
  })

  const setModule = (module) => dispatch({ type: 'SET_MODULE', payload: module })
  const toggleSidebar = () => {
    const next = !state.isSidebarCollapsed
    setCollapsed(next)
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }
  const setFocusMode = (on) => dispatch({ type: 'SET_FOCUS_MODE', payload: on })
  const toggleCalculator = () => dispatch({ type: 'TOGGLE_CALCULATOR' })

  return (
    <AppContext.Provider
      value={{
        activeModule: state.activeModule,
        isSidebarCollapsed: state.isSidebarCollapsed,
        isFocusMode: state.isFocusMode,
        isCalculatorOpen: state.isCalculatorOpen,
        setModule,
        toggleSidebar,
        setFocusMode,
        toggleCalculator,
        MODULES,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

export { MODULES }

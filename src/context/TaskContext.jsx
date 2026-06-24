import { createContext, useContext, useReducer } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const TaskContext = createContext()

const CATEGORIES = [
  { id: 'work', label: 'Trabajo', color: 'bg-blue-500' },
  { id: 'training', label: 'Entrenamiento', color: 'bg-red-500' },
  { id: 'personal', label: 'Personal', color: 'bg-green-500' },
  { id: 'study', label: 'Estudio', color: 'bg-purple-500' },
  { id: 'other', label: 'Otro', color: 'bg-gray-500' },
]

const PRIORITIES = {
  high: { label: 'Alta', color: 'text-red-400', bar: 'bg-red-500' },
  medium: { label: 'Media', color: 'text-yellow-400', bar: 'bg-yellow-500' },
  low: { label: 'Baja', color: 'text-green-400', bar: 'bg-green-500' },
}

function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask = {
        id: Date.now().toString(),
        title: action.payload.title,
        category: action.payload.category || 'other',
        priority: action.payload.priority || 'medium',
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        dueDate: action.payload.dueDate || null,
      }
      return { ...state, tasks: [newTask, ...state.tasks] }
    }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) }
    case 'TOGGLE_TASK': {
      const now = new Date().toISOString()
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload
            ? { ...t, completed: !t.completed, completedAt: !t.completed ? now : null }
            : t
        ),
      }
    }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }
    default:
      return state
  }
}

export function TaskProvider({ children }) {
  const [savedTasks, setSavedTasks] = useLocalStorage('tasks', [])
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: savedTasks,
    filter: 'all',
    searchQuery: '',
  })

  const syncAndDispatch = (action) => {
    dispatch(action)
    setTimeout(() => {
      const nextState = taskReducer({ tasks: savedTasks }, action)
      setSavedTasks(nextState.tasks)
    }, 0)
  }

  const addTask = (task) => syncAndDispatch({ type: 'ADD_TASK', payload: task })
  const updateTask = (task) => syncAndDispatch({ type: 'UPDATE_TASK', payload: task })
  const deleteTask = (id) => syncAndDispatch({ type: 'DELETE_TASK', payload: id })
  const toggleTask = (id) => syncAndDispatch({ type: 'TOGGLE_TASK', payload: id })
  const setFilter = (f) => dispatch({ type: 'SET_FILTER', payload: f })
  const setSearch = (q) => dispatch({ type: 'SET_SEARCH', payload: q })

  const filteredTasks = state.tasks
    .filter((t) => {
      if (state.filter === 'active') return !t.completed
      if (state.filter === 'completed') return t.completed
      return true
    })
    .filter((t) =>
      state.searchQuery
        ? t.title.toLowerCase().includes(state.searchQuery.toLowerCase())
        : true
    )

  const todayTasks = state.tasks.filter((t) => {
    const today = new Date().toDateString()
    const created = new Date(t.createdAt).toDateString()
    return created === today
  })

  const completedToday = todayTasks.filter((t) => t.completed).length
  const todayProgress = todayTasks.length > 0 ? completedToday / todayTasks.length : 0

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        filteredTasks,
        todayTasks,
        completedToday,
        todayProgress,
        filter: state.filter,
        searchQuery: state.searchQuery,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        setFilter,
        setSearch,
        CATEGORIES,
        PRIORITIES,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTaskContext must be used within TaskProvider')
  return context
}

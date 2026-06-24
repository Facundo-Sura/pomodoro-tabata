import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { evaluate } from 'mathjs'
import { HiOutlineX, HiOutlineBackspace, HiOutlineClock } from 'react-icons/hi'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useApp } from '../../context/AppContext'
import CalculatorButton from './CalculatorButton'
import CalculatorHistory from './CalculatorHistory'

const BASIC_KEYS = [
  { label: 'C', variant: 'function' }, { label: '(', variant: 'function' }, { label: ')', variant: 'function' }, { label: '÷', variant: 'operator' },
  { label: '7', variant: 'default' }, { label: '8', variant: 'default' }, { label: '9', variant: 'default' }, { label: '×', variant: 'operator' },
  { label: '4', variant: 'default' }, { label: '5', variant: 'default' }, { label: '6', variant: 'default' }, { label: '-', variant: 'operator' },
  { label: '1', variant: 'default' }, { label: '2', variant: 'default' }, { label: '3', variant: 'default' }, { label: '+', variant: 'operator' },
  { label: '±', variant: 'function' }, { label: '0', variant: 'default' }, { label: '.', variant: 'default' }, { label: '=', variant: 'equals' },
]

const SCIENTIFIC_KEYS = [
  { label: 'sin', variant: 'function' }, { label: 'cos', variant: 'function' }, { label: 'tan', variant: 'function' }, { label: 'π', variant: 'function' },
  { label: 'log', variant: 'function' }, { label: 'ln', variant: 'function' }, { label: '√', variant: 'function' }, { label: 'x!', variant: 'function' },
  { label: 'exp', variant: 'function' }, { label: 'xʸ', variant: 'function' }, { label: 'e', variant: 'function' }, { label: 'asin', variant: 'function' },
  { label: 'acos', variant: 'function' }, { label: 'atan', variant: 'function' }, { label: 'x²', variant: 'function' }, { label: '1/x', variant: 'function' },
]

// Maps scientific labels → mathjs syntax (auto-wraps functions with parentheses)
const SCIENTIFIC_MAP = {
  'sin': 'sin(', 'cos': 'cos(', 'tan': 'tan(',
  'log': 'log10(', 'ln': 'log(', 'exp': 'exp(',
  'asin': 'asin(', 'acos': 'acos(', 'atan': 'atan(',
  '√': 'sqrt(', 'π': 'pi', 'e': 'e',
  'x!': '!', 'xʸ': '^',
}

export default function Calculator() {
  const { isCalculatorOpen, toggleCalculator } = useApp()
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [isScientific, setIsScientific] = useState(false)
  const [memory, setMemory] = useLocalStorage('calcMemory', 0)
  const [hasMemory, setHasMemory] = useState(false)
  const [history, setHistory] = useLocalStorage('calcHistory', [])
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState(false)

  const updateFromExpr = useCallback((expr) => {
    setExpression(expr)
    setDisplay(expr || '0')
    setError(false)
  }, [])

  const handleInput = useCallback((label) => {
    setError(false)
    switch (label) {
      case 'C':
        setExpression('')
        setDisplay('0')
        setError(false)
        return
      case '1/x':
        try {
          const val = evaluate(expression || '0')
          if (val === 0) {
            setError(true)
            setDisplay('Error')
            return
          }
          const inv = String(Math.round((1 / val) * 1e10) / 1e10)
          setExpression(inv)
          setDisplay(inv)
          return inv
        } catch {
          setError(true)
          setDisplay('Error')
          return
        }
      case 'x²':
        try {
          const val = evaluate(expression || '0')
          const squared = String(Math.round(val * val * 1e10) / 1e10)
          setExpression(squared)
          setDisplay(squared)
          return squared
        } catch {
          setError(true)
          setDisplay('Error')
          return
        }
      case '=':
        try {
          let expr = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
          // Auto-close unclosed parentheses
          const opens = (expr.match(/\(/g) || []).length
          const closes = (expr.match(/\)/g) || []).length
          for (let i = closes; i < opens; i++) expr += ')'
          // Inverse trig: convert result to degrees (do FIRST to avoid partial match)
          expr = expr
            .replace(/\b(asin|acos|atan)\(([^)]+)\)/g, (_, fn, arg) => `(${fn}(${arg}) * 180 / pi)`)
          // Trig functions: convert degrees → radians for mathjs
          expr = expr
            .replace(/\b(sin|cos|tan)\(([^)]+)\)/g, (_, fn, arg) => `${fn}((${arg}) * pi / 180)`)
          const result = evaluate(expr)
          const resultStr = Number.isFinite(result) ? String(Math.round(result * 1e10) / 1e10) : String(result)
          setHistory((prev) => [{ expr: expression, result: resultStr, time: Date.now() }, ...prev].slice(0, 100))
          setExpression(resultStr)
          setDisplay(resultStr)
          return resultStr
        } catch {
          setError(true)
          setDisplay('Error')
          return
        }
      case '±':
        if (expression.startsWith('-')) {
          setExpression(expression.slice(1))
        } else {
          setExpression('-' + expression)
        }
        return
      case '⌫':
        setExpression((prev) => prev.slice(0, -1))
        return
      case 'M+':
        try { setMemory((prev) => prev + Number(evaluate(expression || '0'))); setHasMemory(true) } catch {}
        return
      case 'M-':
        try { setMemory((prev) => prev - Number(evaluate(expression || '0'))); setHasMemory(true) } catch {}
        return
      case 'MR':
        setExpression((prev) => prev + String(memory))
        return
      case 'MC':
        setMemory(0); setHasMemory(false); return
      default:
        setExpression((prev) => prev + (SCIENTIFIC_MAP[label] || label))
    }
  }, [expression, memory, setMemory, setHistory, isScientific])

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
    const keyMap = {
      'Enter': '=', 'Backspace': '⌫', 'Escape': 'C',
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
      '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
      '+': '+', '-': '-', '*': '×', '/': '÷', '.': '.',
      '(': '(', ')': ')',
    }
    const mapped = keyMap[e.key]
    if (mapped) {
      e.preventDefault()
      handleInput(mapped)
    }
  }, [handleInput])

  useEffect(() => {
    if (isCalculatorOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCalculatorOpen, handleKeyDown])

  if (!isCalculatorOpen) return null

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed right-0 top-0 z-40 flex h-svh w-[380px] max-w-full flex-col border-l border-border bg-surface shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text">Calculadora</span>
          <button
            onClick={() => setIsScientific(!isScientific)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              isScientific ? 'bg-accent text-white' : 'bg-card text-muted hover:text-text'
            }`}
          >
            {isScientific ? 'Básica' : 'Científica'}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="rounded-md p-1.5 text-muted hover:bg-card hover:text-text transition-colors"
          >
            <HiOutlineClock size={16} />
          </button>
        </div>
        <button
          onClick={toggleCalculator}
          className="rounded-lg p-1.5 text-muted hover:bg-card hover:text-text transition-colors"
        >
          <HiOutlineX size={20} />
        </button>
      </div>

      {/* Display */}
      <div className="border-b border-border px-4 py-6">
        <div className="text-right">
          <p className={`min-h-[24px] text-sm ${error ? 'text-danger' : 'text-muted'} font-mono break-all`}>
            {error ? 'Error en la expresión' : expression || '\u00A0'}
          </p>
          <p className={`text-3xl font-bold font-mono ${error ? 'text-danger' : 'text-text'} tabular-nums mt-1`}>
            {display}
          </p>
        </div>
        {hasMemory && <p className="text-xs text-yellow-400 font-medium mt-1">M</p>}
      </div>

      {/* Scientific keys */}
      <AnimatePresence>
        {isScientific && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="grid grid-cols-4 gap-1 overflow-hidden border-b border-border p-2"
          >
            {SCIENTIFIC_KEYS.map((key) => (
              <CalculatorButton key={key.label} {...key} onClick={() => handleInput(key.label)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory buttons */}
      <div className="grid grid-cols-4 gap-1 border-b border-border p-2">
        <CalculatorButton label="MC" variant="memory" onClick={() => handleInput('MC')} />
        <CalculatorButton label="MR" variant="memory" onClick={() => handleInput('MR')} />
        <CalculatorButton label="M+" variant="memory" onClick={() => handleInput('M+')} />
        <CalculatorButton label="M-" variant="memory" onClick={() => handleInput('M-')} />
      </div>

      {/* Basic keys */}
      <div className="grid flex-1 grid-cols-4 gap-1 overflow-y-auto p-2">
        {BASIC_KEYS.map((key) => (
          <CalculatorButton key={key.label} {...key} onClick={() => handleInput(key.label)} />
        ))}
      </div>

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <CalculatorHistory history={history} onClose={() => setShowHistory(false)} onSelect={(expr) => setExpression(expr)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

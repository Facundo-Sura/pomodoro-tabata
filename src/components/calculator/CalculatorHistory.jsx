import { motion } from 'framer-motion'
import { HiOutlineTrash } from 'react-icons/hi'

export default function CalculatorHistory({ history, onClose, onSelect, onClear }) {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 200 }}
      exit={{ height: 0 }}
      className="overflow-hidden border-t border-border"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-xs font-semibold text-text">Historial</span>
          <div className="flex gap-2">
            {onClear && (
              <button onClick={onClear} className="text-muted hover:text-danger transition-colors">
                <HiOutlineTrash size={14} />
              </button>
            )}
            <button onClick={onClose} className="text-xs text-accent hover:underline">Cerrar</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {history.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted">Sin historial</p>
          ) : (
            <div className="space-y-1">
              {history.map((entry, i) => (
                <button
                  key={entry.time + i}
                  onClick={() => onSelect(entry.expr)}
                  className="w-full rounded-lg bg-card px-3 py-2 text-left transition-colors hover:bg-border"
                >
                  <p className="text-xs text-muted">{entry.expr} =</p>
                  <p className="text-sm font-medium text-text">{entry.result}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

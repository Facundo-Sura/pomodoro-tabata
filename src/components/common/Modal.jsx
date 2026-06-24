import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineX } from 'react-icons/hi'

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

export default function Modal({ isOpen, onClose, title, children }) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleEscape])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            variants={overlayVariants}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            variants={modalVariants}
            className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              {title && <h2 className="text-lg font-semibold text-text">{title}</h2>}
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-muted hover:bg-card hover:text-text transition-colors"
                aria-label="Cerrar"
              >
                <HiOutlineX size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

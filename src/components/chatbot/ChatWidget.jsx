import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineChat, HiOutlineX } from 'react-icons/hi'
import ChatMessage from './ChatMessage'
import { chatbot } from '../../data/chatResponses'

// Quick FAQ buttons
const FAQ_BUTTONS = [
  { label: '¿Qué es Pomodoro?', query: 'pomodoro' },
  { label: 'Tips Tabata', query: 'tabata' },
  { label: 'Consejos', query: 'tips' },
  { label: 'Respiración', query: 'respiración' },
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: '¡Hola! Soy tu asistente de productividad. ¿En qué puedo ayudarte?', time: getTime() },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text) => {
    const msg = text || input
    if (!msg.trim()) return

    setMessages((prev) => [...prev, { role: 'user', text: msg.trim(), time: getTime() }])
    setInput('')
    setIsLoading(true)

    const response = chatbot.getResponse(msg.trim())

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'bot', text: response, time: getTime() }])
      setIsLoading(false)
    }, 600) // Simulate response delay
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* FAB button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover transition-colors md:bottom-6"
        >
          <HiOutlineChat size={24} />
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-20 right-4 z-40 flex h-[500px] w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-border bg-surface shadow-2xl md:bottom-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl border-b border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Asistente</p>
                  <p className="text-[10px] text-muted">En línea</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-text transition-colors"
              >
                <HiOutlineX size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-2">
                  <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FAQ quick buttons */}
            <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-2">
              {FAQ_BUTTONS.map((faq) => (
                <button
                  key={faq.query}
                  onClick={() => handleSend(faq.query)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted hover:bg-accent/20 hover:text-accent transition-colors"
                >
                  {faq.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí un mensaje..."
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function getTime() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

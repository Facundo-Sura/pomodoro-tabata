import { motion } from 'framer-motion'

export default function ChatMessage({ message }) {
  const isBot = message.role === 'bot'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-2`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isBot
            ? 'bg-card text-text rounded-tl-sm'
            : 'bg-accent text-white rounded-tr-sm'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        {message.time && (
          <p className={`mt-1 text-[10px] ${isBot ? 'text-muted' : 'text-white/60'}`}>
            {message.time}
          </p>
        )}
      </div>
    </motion.div>
  )
}

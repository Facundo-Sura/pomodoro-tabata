import { motion } from 'framer-motion'

export default function CircularProgress({ progress = 0, size = 280, strokeWidth = 8, phaseColor = 'text-blue-400', children }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  const colorMap = {
    'text-blue-400': '#60a5fa',
    'text-green-400': '#4ade80',
    'text-yellow-400': '#facc15',
    'text-red-500': '#ef4444',
    'text-purple-400': '#c084fc',
  }
  const strokeColor = colorMap[phaseColor] || '#60a5fa'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

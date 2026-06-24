export default function CalculatorButton({ label, onClick, span = false, variant = 'default', disabled = false }) {
  const variants = {
    default: 'bg-surface hover:bg-card text-text',
    operator: 'bg-accent/20 hover:bg-accent/30 text-accent',
    equals: 'bg-accent hover:bg-accent-hover text-white',
    function: 'bg-card hover:bg-border text-muted text-xs',
    memory: 'bg-card hover:bg-border text-yellow-400 text-xs',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-lg font-medium transition-all active:scale-95 disabled:opacity-30 h-11 ${
        span ? 'col-span-2' : ''
      } ${variants[variant]}`}
    >
      {label}
    </button>
  )
}

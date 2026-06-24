const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white',
  secondary: 'bg-card hover:bg-border text-text',
  ghost: 'hover:bg-card text-muted hover:text-text',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children, variant = 'primary', size = 'md',
  className = '', disabled, ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

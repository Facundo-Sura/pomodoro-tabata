export default function Card({ children, className = '', title, actions }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-text">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

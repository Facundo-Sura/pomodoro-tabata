import { useTheme } from '../../context/ThemeContext'
import { useApp } from '../../context/AppContext'
import Card from '../common/Card'
import ThemeToggle from '../common/ThemeToggle'

export default function Settings() {
  const { theme } = useTheme()
  const { isFocusMode, setFocusMode } = useApp()

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h2 className="mb-6 text-xl font-bold text-text">Ajustes</h2>
      <div className="space-y-4">
        <Card title="Apariencia">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text">Tema</p>
              <p className="text-xs text-muted">
                Actual: {theme === 'dark' ? 'Oscuro' : 'Claro'}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        <Card title="Modo Enfoque">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text">Ocultar paneles</p>
              <p className="text-xs text-muted">
                Muestra solo el temporizador en pantalla completa
              </p>
            </div>
            <button
              onClick={() => setFocusMode(!isFocusMode)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isFocusMode
                  ? 'bg-accent text-white'
                  : 'bg-card text-muted hover:text-text'
              }`}
            >
              {isFocusMode ? 'Activado' : 'Desactivado'}
            </button>
          </div>
        </Card>

        <Card title="Atajos de Teclado">
          <div className="space-y-2 text-sm text-muted">
            <p><kbd className="rounded bg-card px-2 py-0.5 text-xs text-text">Space</kbd> Pausar/Reanudar temporizador</p>
            <p><kbd className="rounded bg-card px-2 py-0.5 text-xs text-text">Esc</kbd> Salir del modo enfoque</p>
          </div>
        </Card>

        <Card title="Acerca de">
          <p className="text-sm text-muted">
            Productivity Hub v1.0 — Una aplicación de productividad y entrenamiento que funciona completamente en el navegador. Todos los datos se guardan localmente en tu navegador.
          </p>
        </Card>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { HiOutlineCog } from 'react-icons/hi'
import Modal from '../common/Modal'
import Button from '../common/Button'

export default function PomodoroConfig({ settings, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ ...settings })

  const handleSave = () => {
    onUpdate({
      focusTime: Number(form.focusTime) * 60,
      shortBreak: Number(form.shortBreak) * 60,
      longBreak: Number(form.longBreak) * 60,
      sessionsBeforeLongBreak: Number(form.sessionsBeforeLongBreak),
    })
    setIsOpen(false)
  }

  const openModal = () => {
    setForm({
      focusTime: settings.focusTime / 60,
      shortBreak: settings.shortBreak / 60,
      longBreak: settings.longBreak / 60,
      sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
    })
    setIsOpen(true)
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={openModal}>
        <HiOutlineCog size={16} /> Configurar
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Configuración Pomodoro">
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-text">Enfoque (min)</span>
            <input type="number" min={1} max={120} value={form.focusTime}
              onChange={(e) => setForm({ ...form, focusTime: e.target.value })}
              className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-right text-text" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-text">Descanso corto (min)</span>
            <input type="number" min={1} max={30} value={form.shortBreak}
              onChange={(e) => setForm({ ...form, shortBreak: e.target.value })}
              className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-right text-text" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-text">Descanso largo (min)</span>
            <input type="number" min={1} max={60} value={form.longBreak}
              onChange={(e) => setForm({ ...form, longBreak: e.target.value })}
              className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-right text-text" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-text">Sesiones antes de descanso largo</span>
            <input type="number" min={1} max={10} value={form.sessionsBeforeLongBreak}
              onChange={(e) => setForm({ ...form, sessionsBeforeLongBreak: e.target.value })}
              className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-right text-text" />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

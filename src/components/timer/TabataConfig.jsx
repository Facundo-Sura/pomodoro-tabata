import { useState } from 'react'
import { HiOutlineCog } from 'react-icons/hi'
import Modal from '../common/Modal'
import Button from '../common/Button'

export default function TabataConfig({ settings, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ ...settings })

  const handleSave = () => {
    onUpdate({
      rounds: Number(form.rounds),
      workTime: Number(form.workTime) * 60,
      restTime: Number(form.restTime) * 60,
      prepTime: Number(form.prepTime),
    })
    setIsOpen(false)
  }

  const openModal = () => {
    setForm({
      rounds: settings.rounds,
      workTime: settings.workTime / 60,
      restTime: settings.restTime / 60,
      prepTime: settings.prepTime,
    })
    setIsOpen(true)
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={openModal}>
        <HiOutlineCog size={16} /> Configurar
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Configuración Tabata">
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-text">Rounds</span>
            <input type="number" min={1} max={99} value={form.rounds}
              onChange={(e) => setForm({ ...form, rounds: e.target.value })}
              className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-right text-text" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-text">Trabajo (min)</span>
            <input type="number" min={0.5} max={10} step={0.5} value={form.workTime}
              onChange={(e) => setForm({ ...form, workTime: e.target.value })}
              className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-right text-text" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-text">Descanso (min)</span>
            <input type="number" min={0.5} max={5} step={0.5} value={form.restTime}
              onChange={(e) => setForm({ ...form, restTime: e.target.value })}
              className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-right text-text" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-text">Preparación (seg)</span>
            <input type="number" min={0} max={30} value={form.prepTime}
              onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
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

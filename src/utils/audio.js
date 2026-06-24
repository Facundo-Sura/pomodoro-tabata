let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

function createTone(frequency, duration, type = 'sine', volume = 0.3) {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch (e) {
    console.warn('Audio not available:', e)
  }
}

export function playBell() {
  createTone(880, 0.8, 'sine', 0.2)
  setTimeout(() => createTone(1100, 0.6, 'sine', 0.15), 150)
}

export function playBeep() {
  createTone(800, 0.08, 'square', 0.1)
}

export function playVictory() {
  createTone(523, 0.2, 'sine', 0.2)
  setTimeout(() => createTone(659, 0.2, 'sine', 0.2), 200)
  setTimeout(() => createTone(784, 0.2, 'sine', 0.2), 400)
  setTimeout(() => createTone(1047, 0.4, 'sine', 0.2), 600)
}

export function playPhaseStart() {
  createTone(660, 0.3, 'triangle', 0.15)
  setTimeout(() => createTone(880, 0.3, 'triangle', 0.15), 100)
}

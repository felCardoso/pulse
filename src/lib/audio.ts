let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function playTone(frequency: number, duration: number, gainValue = 0.4) {
  const context = getCtx()
  const osc = context.createOscillator()
  const gainNode = context.createGain()
  osc.connect(gainNode)
  gainNode.connect(context.destination)
  osc.frequency.value = frequency
  osc.type = 'sine'
  gainNode.gain.setValueAtTime(gainValue, context.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration)
  osc.start(context.currentTime)
  osc.stop(context.currentTime + duration)
}

export function playRestEndSound() {
  try {
    playTone(880, 0.15)
    setTimeout(() => playTone(1320, 0.3), 160)
  } catch {
    // audio not available
  }
}

export function playSetDoneSound() {
  try {
    playTone(660, 0.1, 0.2)
  } catch {
    // audio not available
  }
}

export function unlockAudio() {
  try {
    getCtx()
  } catch {
    // audio not available
  }
}

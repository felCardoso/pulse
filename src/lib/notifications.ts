// Local notifications (PWA-friendly). Uses the service worker registration
// when available so notifications work reliably even with the tab in
// background; falls back to the plain Notification constructor.
//
// Important limitation: this is a client-only app with no push server, so
// these can only fire while the app is open (or freshly reopened) — there
// is no true background/scheduled delivery when the app is fully closed.

import { getLocalDateStr } from '@/utils/format'

export function canNotify(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function requestNotificationPermission(): void {
  if (!canNotify()) return
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

async function showLocalNotification(title: string, options: NotificationOptions): Promise<void> {
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      await reg.showNotification(title, options)
      return
    }
  } catch {
    // fall through to plain Notification
  }

  try {
    new Notification(title, options)
  } catch {
    // Notifications unavailable (e.g. Android requires SW) — ignore.
  }
}

function todayKey(): string {
  return getLocalDateStr()
}

/** True once per calendar day per key — used to avoid re-notifying on every reopen. */
function alreadyFiredToday(storageKey: string): boolean {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(storageKey) === todayKey()
}

function markFiredToday(storageKey: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, todayKey())
}

export async function notifyRestEnd(): Promise<void> {
  if (!canNotify() || Notification.permission !== 'granted') return
  // Only notify when the app is NOT visible — in foreground the
  // haptic + sound feedback already covers it.
  if (document.visibilityState === 'visible') return

  await showLocalNotification('Descanso concluído 💪', {
    body: 'Hora da próxima série!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'echo-rest-end',
  })
}

/**
 * Reminds you about today's workout. Fires at most once per day, and only
 * when called (e.g. on opening Início) — not a true scheduled reminder.
 */
export async function notifyWorkoutReminder(workoutName: string): Promise<void> {
  if (!canNotify() || Notification.permission !== 'granted') return
  if (alreadyFiredToday('echo-notified-workout')) return
  markFiredToday('echo-notified-workout')

  await showLocalNotification('Treino de hoje 💪', {
    body: `${workoutName} está te esperando.`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'echo-workout-reminder',
  })
}

/**
 * Reminds you about pending Rotinas for today. Fires at most once per day,
 * and only when called (e.g. on opening the Rotinas tab).
 */
export async function notifyRoutineReminder(pendingCount: number): Promise<void> {
  if (!canNotify() || Notification.permission !== 'granted') return
  if (pendingCount <= 0) return
  if (alreadyFiredToday('echo-notified-routine')) return
  markFiredToday('echo-notified-routine')

  await showLocalNotification(
    pendingCount === 1 ? '1 rotina pendente hoje' : `${pendingCount} rotinas pendentes hoje`,
    {
      body: 'Não quebre a sequência — marque suas rotinas de hoje.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: 'echo-routine-reminder',
    }
  )
}

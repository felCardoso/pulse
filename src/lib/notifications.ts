// Local notifications. On the web (PWA/browser) this uses the service
// worker registration when available so notifications work reliably even
// with the tab in background; falls back to the plain Notification
// constructor. Inside the Capacitor Android shell it uses
// @capacitor/local-notifications instead — real OS notifications that can
// fire even with the app fully closed, unlike the web path below.
//
// Important limitation on the web: this is a client-only app with no push
// server, so browser notifications can only fire while the app is open (or
// freshly reopened) — there is no true background/scheduled delivery.

import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { getLocalDateStr } from '@/utils/format'

const isNative = () => Capacitor.isNativePlatform()

// Capacitor local notifications need a stable numeric id per notification
// "slot" — reusing the same id replaces the previous one instead of
// stacking duplicates, mirroring the web `tag` behavior below.
const NATIVE_ID = {
  restEnd: 1,
  workoutReminder: 2,
  routineReminder: 3,
} as const

export function canNotify(): boolean {
  return isNative() || (typeof window !== 'undefined' && 'Notification' in window)
}

export async function requestNotificationPermission(): Promise<void> {
  if (isNative()) {
    try {
      await LocalNotifications.requestPermissions()
    } catch {
      // ignore
    }
    return
  }
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

async function hasNativePermission(): Promise<boolean> {
  try {
    const { display } = await LocalNotifications.checkPermissions()
    return display === 'granted'
  } catch {
    return false
  }
}

async function showNativeNotification(id: number, title: string, body: string): Promise<void> {
  try {
    await LocalNotifications.schedule({
      notifications: [{ id, title, body, schedule: { at: new Date(Date.now() + 100) } }],
    })
  } catch {
    // ignore
  }
}

async function showWebNotification(title: string, options: NotificationOptions): Promise<void> {
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
  if (isNative()) {
    if (!(await hasNativePermission())) return
    await showNativeNotification(NATIVE_ID.restEnd, 'Descanso concluído 💪', 'Hora da próxima série!')
    return
  }

  if (!canNotify() || Notification.permission !== 'granted') return
  // Only notify when the app is NOT visible — in foreground the
  // haptic + sound feedback already covers it.
  if (document.visibilityState === 'visible') return

  await showWebNotification('Descanso concluído 💪', {
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
  if (alreadyFiredToday('echo-notified-workout')) return

  if (isNative()) {
    if (!(await hasNativePermission())) return
    markFiredToday('echo-notified-workout')
    await showNativeNotification(NATIVE_ID.workoutReminder, 'Treino de hoje 💪', `${workoutName} está te esperando.`)
    return
  }

  if (!canNotify() || Notification.permission !== 'granted') return
  markFiredToday('echo-notified-workout')

  await showWebNotification('Treino de hoje 💪', {
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
  if (pendingCount <= 0) return
  if (alreadyFiredToday('echo-notified-routine')) return

  const title = pendingCount === 1 ? '1 rotina pendente hoje' : `${pendingCount} rotinas pendentes hoje`
  const body = 'Não quebre a sequência — marque suas rotinas de hoje.'

  if (isNative()) {
    if (!(await hasNativePermission())) return
    markFiredToday('echo-notified-routine')
    await showNativeNotification(NATIVE_ID.routineReminder, title, body)
    return
  }

  if (!canNotify() || Notification.permission !== 'granted') return
  markFiredToday('echo-notified-routine')

  await showWebNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'echo-routine-reminder',
  })
}

// Local notifications for rest-timer completion (PWA-friendly).
// Uses the service worker registration when available so notifications
// work reliably even with the tab in background; falls back to the
// plain Notification constructor.

export function canNotify(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function requestNotificationPermission(): void {
  if (!canNotify()) return
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

export async function notifyRestEnd(): Promise<void> {
  if (!canNotify() || Notification.permission !== 'granted') return
  // Only notify when the app is NOT visible — in foreground the
  // haptic + sound feedback already covers it.
  if (document.visibilityState === 'visible') return

  const title = 'Descanso concluído 💪'
  const options: NotificationOptions = {
    body: 'Hora da próxima série!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'pulse-rest-end',
  }

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

import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'

/** Shares plain text via the native share sheet on Android, the Web Share
 * API where available (mobile browsers), or a clipboard-copy fallback. */
export async function shareText(title: string, text: string): Promise<'shared' | 'copied' | 'unavailable'> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({ title, text })
      return 'shared'
    } catch {
      return 'unavailable'
    }
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text })
      return 'shared'
    } catch {
      return 'unavailable'
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return 'copied'
    } catch {
      return 'unavailable'
    }
  }

  return 'unavailable'
}

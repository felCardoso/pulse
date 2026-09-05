import { registerPlugin, Capacitor } from '@capacitor/core'

interface HomeWidgetPlugin {
  update(options: { workoutName: string; streak: number }): Promise<void>
}

// Custom native plugin (android/app/src/main/java/com/echo/app/HomeWidgetPlugin.java)
// — no web implementation, so this only ever does anything inside the
// Capacitor Android app.
const HomeWidget = registerPlugin<HomeWidgetPlugin>('HomeWidget')

/** Pushes the next suggested workout + current streak into the Android
 * home-screen widget. No-ops outside the native app. */
export function updateHomeWidget(workoutName: string, streak: number): void {
  if (!Capacitor.isNativePlatform()) return
  HomeWidget.update({ workoutName, streak }).catch(() => {})
}

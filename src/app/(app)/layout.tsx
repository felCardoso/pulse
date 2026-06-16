import BottomNav from '@/components/layout/BottomNav'
import StoreHydration from '@/components/StoreHydration'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <StoreHydration />
      <main
        className="mx-auto max-w-lg px-4 pt-6"
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

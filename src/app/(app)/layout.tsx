import Navigation from "@/components/Navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-14 pb-24 px-4 max-w-lg mx-auto">
        {children}
      </main>
    </div>
  )
}

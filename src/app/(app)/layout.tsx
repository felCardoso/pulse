import Navigation from "@/components/Navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main
        className="pt-14 px-4 max-w-lg mx-auto"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>
    </div>
  )
}

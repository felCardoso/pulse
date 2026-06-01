import { Zap } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="flex items-center gap-2 mb-8">
        <Zap className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold tracking-tight">DailyPulse</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}

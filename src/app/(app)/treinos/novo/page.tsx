import { Suspense } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import TemplateForm from '@/components/template/TemplateForm'

export default function NovoTreinoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/treinos" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Novo Treino</h1>
      </div>
      {/* TemplateForm reads ?fichaId= via useSearchParams — needs a Suspense
          boundary for this statically-generated page. */}
      <Suspense>
        <TemplateForm />
      </Suspense>
    </div>
  )
}

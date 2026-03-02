import { LinkManager } from "@/components/app/link-manager";

export default function SheetsPage() {
  return (
    <div className="container mx-auto p-4 md:pl-24">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Gestor de Hojas de Cálculo</h1>
        <p className="text-muted-foreground mb-6">Guarda, edita y accede rápidamente a tus hojas de cálculo más importantes.</p>
        <LinkManager category="sheets" />
    </div>
  )
}

import { LinkManager } from "@/components/app/link-manager";

export default function FormsPage() {
  return (
    <div className="container mx-auto p-4 md:pl-24">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Gestor de Formularios</h1>
        <p className="text-muted-foreground mb-6">Guarda, edita y accede rápidamente a tus formularios más importantes.</p>
        <LinkManager category="forms" />
    </div>
  )
}

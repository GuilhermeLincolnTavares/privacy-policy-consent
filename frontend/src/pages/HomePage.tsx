import { useAuth } from '../hooks/useAuth'

export const HomePage = () => {
  const { session } = useAuth()

  return (
    <section className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
      <h1 className="font-display text-2xl font-bold text-ink">Olá, {session?.name}!</h1>
      <p className="mt-2 text-muted">Seja bem-vindo(a)! É bom ter você por aqui.</p>
    </section>
  )
}

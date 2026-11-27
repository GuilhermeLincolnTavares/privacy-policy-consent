import { useAuth } from '../hooks/useAuth'

export const HomePage = () => {
  const { session } = useAuth()

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-semibold text-slate-900">Olá, {session?.name}!</h1>
      <p className="mt-2 text-slate-600">
        Você está autenticado. Quando houver uma nova versão da política de privacidade, o aviso
        para aceite aparece nesta tela.
      </p>
    </section>
  )
}

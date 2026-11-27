import { Outlet } from 'react-router'
import { AppHeader } from './AppHeader'

export const AppLayout = () => {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

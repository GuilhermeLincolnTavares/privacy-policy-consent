import { Outlet } from 'react-router'
import { AppHeader } from './AppHeader'
import { ConsentGate } from './ConsentGate'

export const AppLayout = () => (
  <div className="min-h-screen">
    <AppHeader />
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Outlet />
    </main>
    <ConsentGate />
  </div>
)

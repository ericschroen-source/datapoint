import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

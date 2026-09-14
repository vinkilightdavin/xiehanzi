import { useEffect } from 'react'
import { AppLayout } from './components/editor/AppLayout'
import { AdminPage } from './components/admin/AdminPage'
import { useAuthStore } from './store/useAuthStore'
import { useStore } from './store/useStore'
import './styles/print.css'

function App() {
  const { init, role, user } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (user) {
      useStore.getState().syncFromCloud()
    }
  }, [user])

  if (window.location.pathname === '/admin') {
    if (role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Bạn không có quyền truy cập trang này.
        </div>
      )
    }
    return <AdminPage />
  }

  return (
    <AppLayout />
  )
}

export default App

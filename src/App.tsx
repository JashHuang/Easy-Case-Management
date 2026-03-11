import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import CaseList from './pages/CaseList'
import CaseDetail from './pages/CaseDetail'
import CaseCreate from './pages/CaseCreate'
import Login from './pages/Login'
import Register from './pages/Register'
import UserManagement from './pages/UserManagement'
import PendingApproval from './pages/PendingApproval'
import { AuthProvider, useAuth } from './context/AuthContext'

/**
 * 路由保護元元件
 */
export function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, isAdmin, isPending, loading, authErrorCode } = useAuth()

  if (loading) return <div>載入中...</div>
  if (authErrorCode) return <Navigate to={`/login?reason=${encodeURIComponent(authErrorCode)}`} replace />
  if (!user) return <Navigate to="/login" replace />
  if (isPending) return <Navigate to="/pending" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/cases" replace />

  return <>{children}</>
}

function MainLayout() {
  const { user, profile, isAdmin, isPending, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/cases" className="text-xl font-bold text-blue-600">案件管理系統</Link>
            {user && !isPending && (
              <div className="hidden md:flex space-x-4">
                <Link to="/cases" className="text-gray-600 hover:text-blue-600">案件列表</Link>
                <Link to="/cases/new" className="text-gray-600 hover:text-blue-600">建立新案件</Link>
                {isAdmin && (
                  <Link to="/users" className="text-purple-600 hover:text-purple-800 font-medium">管理使用者</Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-sm text-right hidden sm:block">
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">{profile?.role === 'admin' ? '管理員' : '一般使用者'}</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  登出
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="text-blue-600 font-medium">登入</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">註冊</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4">
        <Routes>
          <Route path="/" element={<Navigate to="/cases" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending" element={<PendingApproval />} />
          <Route path="/cases" element={
            <ProtectedRoute>
              <CaseList />
            </ProtectedRoute>
          } />
          <Route path="/cases/new" element={
            <ProtectedRoute>
              <CaseCreate />
            </ProtectedRoute>
          } />
          <Route path="/cases/:id" element={
            <ProtectedRoute>
              <CaseDetail />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  )
}

export default App

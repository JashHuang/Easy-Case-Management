import { useEffect, useState } from 'react'
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
  const [fontScale, setFontScale] = useState(() => {
    try {
      const stored = localStorage.getItem('app_font_scale')
      const parsed = stored ? Number(stored) : NaN
      return Number.isFinite(parsed) ? parsed : 1
    } catch {
      return 1
    }
  })

  const minScale = 0.85
  const maxScale = 3
  const step = 0.05
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const baseSize = 16
    document.documentElement.style.fontSize = `${baseSize * fontScale}px`
    try {
      localStorage.setItem('app_font_scale', String(fontScale))
    } catch {
      // ignore storage errors
    }
  }, [fontScale])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 sm:space-x-8">
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

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-600">
              <span className="text-xs text-gray-500">字體</span>
              <button
                type="button"
                onClick={() => setFontScale((value) => Math.max(minScale, Number((value - step).toFixed(2))))}
                disabled={fontScale <= minScale}
                className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-40"
                aria-label="縮小字體"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontScale(1)}
                className="px-2 py-1 rounded-md hover:bg-gray-100"
                aria-label="重設字體大小"
              >
                {Math.round(fontScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setFontScale((value) => Math.min(maxScale, Number((value + step).toFixed(2))))}
                disabled={fontScale >= maxScale}
                className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-40"
                aria-label="放大字體"
              >
                A+
              </button>
            </div>
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
            {user && !isPending && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100"
                aria-label="切換選單"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {user && !isPending && mobileMenuOpen && (
          <div className="max-w-7xl mx-auto mt-4 md:hidden space-y-3">
            <div className="flex items-center space-x-2 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-600 w-fit">
              <span className="text-xs text-gray-500">字體</span>
              <button
                type="button"
                onClick={() => setFontScale((value) => Math.max(minScale, Number((value - step).toFixed(2))))}
                disabled={fontScale <= minScale}
                className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-40"
                aria-label="縮小字體"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontScale(1)}
                className="px-2 py-1 rounded-md hover:bg-gray-100"
                aria-label="重設字體大小"
              >
                {Math.round(fontScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setFontScale((value) => Math.min(maxScale, Number((value + step).toFixed(2))))}
                disabled={fontScale >= maxScale}
                className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-40"
                aria-label="放大字體"
              >
                A+
              </button>
            </div>

            <div className="flex flex-col space-y-2">
              <Link
                to="/cases"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600"
              >
                案件列表
              </Link>
              <Link
                to="/cases/new"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600"
              >
                建立新案件
              </Link>
              {isAdmin && (
                <Link
                  to="/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-purple-700 hover:text-purple-800 font-medium"
                >
                  管理使用者
                </Link>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500">{profile?.role === 'admin' ? '管理員' : '一般使用者'}</p>
            </div>
          </div>
        )}
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

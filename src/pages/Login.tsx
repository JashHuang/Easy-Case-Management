import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AUTH_REASON_MESSAGES: Record<string, string> = {
    profile_timeout: '系統驗證逾時，請重新登入。（代碼：profile_timeout）',
    profile_unavailable: '系統無法讀取權限資料，請重新登入。（代碼：profile_unavailable）',
}

export default function Login() {
    const { user } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const authReason = searchParams.get('reason')
    const authReasonMessage = authReason ? AUTH_REASON_MESSAGES[authReason] : null

    // 反應式導航：當 AuthContext 的 user 狀態更新後自動跳轉
    useEffect(() => {
        if (user) {
            navigate('/cases', { replace: true })
        }
    }, [user, navigate])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            // 登入成功後由 useEffect 偵測 user 變化自動跳轉，不再手動導航
        } catch (error: any) {
            alert('登入失敗: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">登入案件管理系統</h2>
            {authReasonMessage && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {authReasonMessage}
                </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? '登入中...' : '登入'}
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
                尚未有帳號？ <Link to="/register" className="text-blue-600 hover:underline">立即註冊</Link>
            </p>
        </div>
    )
}

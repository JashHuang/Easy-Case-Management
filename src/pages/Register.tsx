import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
    const { user } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // 反應式導航：若註冊後自動登入，偵測 user 狀態更新後跳轉
    useEffect(() => {
        if (user) {
            navigate('/cases', { replace: true })
        }
    }, [user, navigate])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // 1. 註冊 Auth 帳號
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            })
            if (authError) throw authError

            if (authData.user) {
                // 2. 建立 Profile
                // 注意：在實際專案中，通常會用 Supabase Trigger 自動處理
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            email: email,
                            role: 'user',
                            status: 'pending',
                        }
                    ])

                if (profileError) {
                    console.error('Profile 建立失敗:', profileError.message)
                    // 如果 profile 建立失敗，可能需要特別處理
                }
            }

            alert('註冊成功！請檢查信箱驗證（如有開啟驗證）或直接登入。')
            navigate('/login')
        } catch (error: any) {
            alert('註冊失敗: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">註冊新帳號</h2>
            <form onSubmit={handleRegister} className="space-y-4">
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
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? '註冊中...' : '註冊'}
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
                已有帳號？ <Link to="/login" className="text-blue-600 hover:underline">立即登入</Link>
            </p>
        </div>
    )
}

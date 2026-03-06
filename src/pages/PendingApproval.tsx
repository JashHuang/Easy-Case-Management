import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function PendingApproval() {
    const { user, isPending, signOut } = useAuth()

    if (!user) return <Navigate to="/login" />
    if (!isPending) return <Navigate to="/cases" />

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-md border border-gray-100 text-center">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">帳號審核中</h2>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-8 text-sm leading-relaxed">
                您的註冊申請已經送出，目前正在等待管理員審核。<br />
                請耐心等候，審核通過後即可使用系統功能。
            </div>
            <button
                onClick={() => signOut()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg transition-colors font-medium shadow-sm transition-all"
            >
                先登出
            </button>
        </div>
    )
}

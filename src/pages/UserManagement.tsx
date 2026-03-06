import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import type { Profile } from '../types/database'
import { useAuth } from '../context/AuthContext'

export default function UserManagement() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const { isAdmin } = useAuth()

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (err: any) {
            alert('獲取使用者列表失敗: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleRole = async (userId: string, currentRole: string) => {
        if (!isAdmin) return
        const newRole = currentRole === 'admin' ? 'user' : 'admin'
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error
            fetchUsers()
        } catch (err: any) {
            alert('修改權限失敗: ' + err.message)
        }
    }

    const toggleStatus = async (userId: string, currentStatus: string) => {
        if (!isAdmin) return
        const newStatus = currentStatus === 'pending' ? 'active' : 'pending'
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', userId)

            if (error) throw error
            fetchUsers()
        } catch (err: any) {
            alert('修改狀態失敗: ' + err.message)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            fetchUsers()
        }
    }, [isAdmin])

    if (!isAdmin) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-red-600">存取拒絕</h2>
                <p className="mt-2 text-gray-600">只有管理員可以進入此頁面。</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">使用者管理</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">權限</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {u.role === 'admin' ? '管理員' : '一般使用者'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {u.status === 'active' ? '已啟用' : '待審核'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-4">
                                    <button
                                        onClick={() => toggleRole(u.id, u.role)}
                                        className="text-blue-600 hover:text-blue-900 font-medium"
                                    >
                                        切換為 {u.role === 'admin' ? '使用者' : '管理員'}
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(u.id, u.status)}
                                        className={`${u.status === 'active' ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-900'} font-medium`}
                                    >
                                        {u.status === 'active' ? '停權' : '核准'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">尚無其他使用者。</div>
                )}
            </div>
        </div>
    )
}

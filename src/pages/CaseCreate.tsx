import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function CaseCreate() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        summary: '',
        description: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('cases')
                .insert([
                    {
                        name: formData.name,
                        title: formData.title,
                        summary: formData.summary,
                        description: formData.description,
                        status: 'open',
                    },
                ])
                .select()

            if (error) throw error

            if (data && data[0]) {
                navigate(`/cases/${data[0].id}`)
            } else {
                navigate('/cases')
            }
        } catch (err: any) {
            alert('建立案件時發生錯誤: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">建立新案件</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">案件名稱 / 編號</label>
                    <input
                        required
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="例如：CASE-2025-001"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                    <input
                        required
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="請輸入簡短的描述性標題"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
                    <textarea
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        placeholder="請輸入案件內容摘要"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">詳細描述</label>
                    <textarea
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="請輸入案件的詳細背景與描述內容"
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/cases')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                    >
                        {loading ? '建立中...' : '建立案件'}
                    </button>
                </div>
            </form>
        </div>
    )
}

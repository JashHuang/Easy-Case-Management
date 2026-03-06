import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import type { CaseEvent } from '../types/database'

interface EventFormProps {
    caseId: string;
    event?: CaseEvent; // 如果有傳入 event，則為編輯模式
    onSuccess: () => void;
    onCancel: () => void;
}

export default function EventForm({ caseId, event, onSuccess, onCancel }: EventFormProps) {
    const [loading, setLoading] = useState(false)
    const isEdit = !!event

    const [formData, setFormData] = useState({
        title: event?.title || '',
        description: event?.description || '',
        event_date: event?.event_date
            ? new Date(event.event_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isEdit && event) {
                // 編輯模式
                const { error } = await supabase
                    .from('events')
                    .update({
                        title: formData.title,
                        description: formData.description,
                        event_date: formData.event_date,
                    })
                    .eq('id', event.id)

                if (error) throw error
            } else {
                // 新增模式
                const { error } = await supabase
                    .from('events')
                    .insert([
                        {
                            case_id: caseId,
                            title: formData.title,
                            description: formData.description,
                            event_date: formData.event_date,
                        },
                    ])

                if (error) throw error
            }
            onSuccess()
        } catch (err: any) {
            alert(`${isEdit ? '更新' : '新增'}事件時發生錯誤: ` + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{isEdit ? '編輯事件' : '新增事件'}</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">事件標題</label>
                <input
                    required
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：初步訪談、現場採證等"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">事件日期</label>
                <input
                    required
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">內容描述</label>
                <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="請輸入事件詳細內容記錄..."
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                >
                    取消
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                >
                    {loading ? (isEdit ? '更新中...' : '新增中...') : '提交'}
                </button>
            </div>
        </form>
    )
}

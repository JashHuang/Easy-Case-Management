import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import type { Attachment, Case, CaseEvent } from '../types/database'
import { format } from 'date-fns'
import Timeline from '../components/Timeline'
import EventForm from '../components/EventForm'
import FileUploader from '../components/FileUploader'
import AttachmentList from '../components/AttachmentList'

const STATUS_OPTIONS = [
    { value: 'open', label: '開啟中' },
    { value: 'closed', label: '已結案' },
    { value: 'pending', label: '待處理' },
    { value: 'delayed', label: '延遲中' },
]

const STATUS_LABEL_MAP: Record<string, string> = STATUS_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label
    return acc
}, {} as Record<string, string>)

const LEGACY_STATUS_MAP: Record<string, string> = {
    進行中: 'open',
    已結案: 'closed',
    待處理: 'pending',
    延遲中: 'delayed',
}

const STATUS_CLASS_MAP: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    pending: 'bg-amber-100 text-amber-800',
    delayed: 'bg-red-100 text-red-800',
}

const normalizeStatus = (status: string) => {
    if (STATUS_LABEL_MAP[status]) return status
    return LEGACY_STATUS_MAP[status] || status
}

export default function CaseDetail() {
    const { id } = useParams<{ id: string }>()
    const [caseData, setCaseData] = useState<Case | null>(null)
    const [isEditingCase, setIsEditingCase] = useState(false)
    const [caseSaving, setCaseSaving] = useState(false)
    const [caseForm, setCaseForm] = useState({
        name: '',
        title: '',
        summary: '',
        description: '',
        status: '',
    })
    const [events, setEvents] = useState<CaseEvent[]>([])
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAddEvent, setShowAddEvent] = useState(false)
    const [editingEvent, setEditingEvent] = useState<CaseEvent | null>(null)

    const fetchCaseDetail = useCallback(async () => {
        if (!id) return
        try {
            setLoading(true)

            const { data: caseResult, error: caseError } = await supabase
                .from('cases')
                .select('*')
                .eq('id', id)
                .single()

            if (caseError) throw caseError
            setCaseData(caseResult)

            const { data: eventsResult, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .eq('case_id', id)
                .order('event_date', { ascending: true })

            if (eventsError) throw eventsError
            setEvents(eventsResult || [])

            const { data: attachmentsResult, error: attachmentsError } = await supabase
                .from('attachments')
                .select('*')
                .eq('case_id', id)
                .order('created_at', { ascending: false })

            if (attachmentsError) throw attachmentsError
            setAttachments(attachmentsResult || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchCaseDetail()
    }, [fetchCaseDetail])

    useEffect(() => {
        if (caseData && !isEditingCase) {
            const normalizedStatus = normalizeStatus(caseData.status || '')
            setCaseForm({
                name: caseData.name || '',
                title: caseData.title || '',
                summary: caseData.summary || '',
                description: caseData.description || '',
                status: normalizedStatus,
            })
        }
    }, [caseData, isEditingCase])

    const handleRefresh = () => {
        fetchCaseDetail()
    }

    const handleStartEditCase = () => {
        if (!caseData) return
        const normalizedStatus = normalizeStatus(caseData.status || '')
        setCaseForm({
            name: caseData.name || '',
            title: caseData.title || '',
            summary: caseData.summary || '',
            description: caseData.description || '',
            status: normalizedStatus,
        })
        setIsEditingCase(true)
    }

    const handleCancelEditCase = () => {
        setIsEditingCase(false)
        if (caseData) {
            const normalizedStatus = normalizeStatus(caseData.status || '')
            setCaseForm({
                name: caseData.name || '',
                title: caseData.title || '',
                summary: caseData.summary || '',
                description: caseData.description || '',
                status: normalizedStatus,
            })
        }
    }

    const handleSaveCase = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!caseData) return
        setCaseSaving(true)

        try {
            const { data, error: updateError } = await supabase
                .from('cases')
                .update({
                    name: caseForm.name.trim(),
                    title: caseForm.title.trim(),
                    summary: caseForm.summary.trim(),
                    description: caseForm.description.trim(),
                    status: caseForm.status.trim(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', caseData.id)
                .select()
                .single()

            if (updateError) throw updateError
            setCaseData(data)
            setIsEditingCase(false)
        } catch (err: any) {
            alert('更新案件失敗: ' + err.message)
        } finally {
            setCaseSaving(false)
        }
    }

    const handleEventAdded = () => {
        setShowAddEvent(false)
        setEditingEvent(null)
        handleRefresh()
    }

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm('確定要刪除此事件嗎？')) return

        try {
            const { error: deleteError } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId)

            if (deleteError) throw deleteError
            handleRefresh()
        } catch (err: any) {
            alert('刪除事件失敗: ' + err.message)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error || !caseData) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                錯誤: {error || '找不到相符案件'}
                <div className="mt-4">
                    <Link to="/cases" className="underline">返回案件列表</Link>
                </div>
            </div>
        )
    }

    const normalizedStatus = normalizeStatus(caseData.status)
    const statusLabel = STATUS_LABEL_MAP[normalizedStatus] || caseData.status
    const statusClass = STATUS_CLASS_MAP[normalizedStatus] || 'bg-blue-100 text-blue-800'

    return (
        <div className="space-y-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    <form onSubmit={handleSaveCase} className="space-y-6">
                        <div className="flex justify-between items-start gap-6">
                            <div className="min-w-0">
                                <nav className="flex mb-4 text-sm text-gray-500">
                                    <Link to="/cases" className="hover:text-blue-600">案件列表</Link>
                                    <span className="mx-2">/</span>
                                    <span className="text-gray-900 font-medium">{caseData.name}</span>
                                </nav>

                                {isEditingCase ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={caseForm.title}
                                                onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                                                placeholder="請輸入簡短的描述性標題"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">案件名稱 / 編號</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={caseForm.name}
                                                onChange={(e) => setCaseForm({ ...caseForm, name: e.target.value })}
                                                placeholder="例如：CASE-2025-001"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
                                        <p className="text-lg text-gray-500 mt-1">{caseData.name}</p>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-3 shrink-0">
                                {isEditingCase ? (
                                    <>
                                        <div className="w-44">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                                            <select
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={caseForm.status}
                                                onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}
                                            >
                                                {STATUS_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCancelEditCase}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                            >
                                                取消
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={caseSaving}
                                                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                                            >
                                                {caseSaving ? '儲存中...' : '儲存變更'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`}>
                                            {statusLabel}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleStartEditCase}
                                            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                        >
                                            編輯案件
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900">摘要</h2>
                                {isEditingCase ? (
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={caseForm.summary}
                                        onChange={(e) => setCaseForm({ ...caseForm, summary: e.target.value })}
                                        placeholder="請輸入案件內容摘要"
                                    />
                                ) : (
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{caseData.summary}</p>
                                )}
                            </section>

                            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900">詳細描述</h2>
                                {isEditingCase ? (
                                    <textarea
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={caseForm.description}
                                        onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                                        placeholder="請輸入案件的詳細背景與描述內容"
                                    />
                                ) : (
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{caseData.description}</p>
                                )}
                            </section>
                        </div>
                    </form>

                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">事件時間軸</h2>
                            {!showAddEvent && (
                                <button
                                    onClick={() => setShowAddEvent(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
                                >
                                    + 新增事件
                                </button>
                            )}
                        </div>

                        {showAddEvent && (
                            <EventForm
                                caseId={caseData.id}
                                onSuccess={handleEventAdded}
                                onCancel={() => setShowAddEvent(false)}
                            />
                        )}

                        {editingEvent && (
                            <EventForm
                                caseId={caseData.id}
                                event={editingEvent}
                                onSuccess={handleEventAdded}
                                onCancel={() => setEditingEvent(null)}
                            />
                        )}

                        <Timeline
                            events={events}
                            onEdit={setEditingEvent}
                            onDelete={handleDeleteEvent}
                        />
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">基本資訊</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">建立時間</span>
                                <span className="text-gray-900">
                                    {format(new Date(caseData.created_at), 'yyyy-MM-dd HH:mm')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">最後更新</span>
                                <span className="text-gray-900">
                                    {format(new Date(caseData.updated_at), 'yyyy-MM-dd HH:mm')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">附件列表</h2>
                        <AttachmentList attachments={attachments} onDeleted={handleRefresh} />
                        <FileUploader caseId={caseData.id} onSuccess={handleRefresh} />
                    </div>
                </div>
            </div>
        </div>
    )
}

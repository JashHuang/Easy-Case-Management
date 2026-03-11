import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import type { Attachment, Case, CaseEvent } from '../types/database'
import { format } from 'date-fns'
import Timeline from '../components/Timeline'
import EventForm from '../components/EventForm'
import FileUploader from '../components/FileUploader'
import AttachmentList from '../components/AttachmentList'

export default function CaseDetail() {
    const { id } = useParams<{ id: string }>()
    const [caseData, setCaseData] = useState<Case | null>(null)
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

    const handleRefresh = () => {
        fetchCaseDetail()
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

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-start">
                <div>
                    <nav className="flex mb-4 text-sm text-gray-500">
                        <Link to="/cases" className="hover:text-blue-600">案件列表</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">{caseData.name}</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
                    <p className="text-lg text-gray-500 mt-1">{caseData.name}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${caseData.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {caseData.status === 'open' ? '開啟中' : '已結案'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900">摘要</h2>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{caseData.summary}</p>
                        </section>

                        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900">詳細描述</h2>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{caseData.description}</p>
                        </section>
                    </div>

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

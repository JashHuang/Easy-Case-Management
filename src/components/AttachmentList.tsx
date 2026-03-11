import { useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import type { Attachment } from '../types/database'

interface AttachmentListProps {
    attachments: Attachment[];
    onDeleted?: () => void;
}

export default function AttachmentList({ attachments, onDeleted }: AttachmentListProps) {
    const [downloadingId, setDownloadingId] = useState<string | null>(null)
    const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})
    const downloadControllers = useRef<Map<string, AbortController>>(new Map())

    const updateProgress = (id: string, value: number | null) => {
        setDownloadProgress((prev) => {
            if (value === null) {
                const next = { ...prev }
                delete next[id]
                return next
            }
            return { ...prev, [id]: value }
        })
    }

    const isOpenableInBrowser = (fileType: string | null | undefined) => {
        if (!fileType) return false
        if (fileType.startsWith('image/')) return true
        if (fileType.startsWith('text/')) return true
        return ['application/pdf'].includes(fileType)
    }

    const handleDownload = async (attachment: Attachment) => {
        try {
            const openable = isOpenableInBrowser(attachment.file_type)
            setDownloadingId(attachment.id)
            if (!openable) {
                updateProgress(attachment.id, 0)
            }

            if (attachment.storage_provider === 'r2' && attachment.storage_key) {
                const { data: sessionData } = await supabase.auth.getSession()
                const accessToken = sessionData?.session?.access_token
                const { data, error } = await supabase.functions.invoke('attachments-download-url', {
                    body: { attachment_id: attachment.id },
                    headers: {
                        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                })

                if (error) throw error
                if (!data?.downloadUrl) throw new Error('下載連結取得失敗')

                if (openable) {
                    window.open(data.downloadUrl, '_blank', 'noopener,noreferrer')
                    return
                }

                const controller = new AbortController()
                downloadControllers.current.set(attachment.id, controller)

                const response = await fetch(data.downloadUrl, { signal: controller.signal })
                if (!response.ok) {
                    throw new Error('下載失敗')
                }

                const contentLength = response.headers.get('Content-Length')
                const total = contentLength ? Number(contentLength) : null

                if (!response.body) {
                    window.open(data.downloadUrl, '_blank', 'noopener,noreferrer')
                    return
                }

                const reader = response.body.getReader()
                const chunks: Uint8Array[] = []
                let loaded = 0

                try {
                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break
                        if (value) {
                            const chunk = new Uint8Array(value)
                            chunks.push(chunk)
                            loaded += chunk.length
                            if (total) {
                                updateProgress(attachment.id, Math.round((loaded / total) * 100))
                            }
                        }
                    }
                } catch (error: any) {
                    if (error?.name === 'AbortError') {
                        return
                    }
                    throw error
                }

                const blob = new Blob(chunks as BlobPart[])
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = attachment.file_name || 'download'
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
                return
            }

            if (attachment.file_url) {
                if (openable) {
                    window.open(attachment.file_url, '_blank', 'noopener,noreferrer')
                    return
                }
                window.open(attachment.file_url, '_blank', 'noopener,noreferrer')
                return
            }

            throw new Error('沒有可用的下載連結')
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                alert('下載失敗: ' + error.message)
            }
        } finally {
            setDownloadingId(null)
            updateProgress(attachment.id, null)
            downloadControllers.current.delete(attachment.id)
        }
    }

    const handleCancelDownload = (attachmentId: string) => {
        const controller = downloadControllers.current.get(attachmentId)
        if (controller) {
            controller.abort()
            downloadControllers.current.delete(attachmentId)
        }
    }

    const handleDelete = async (attachment: Attachment) => {
        if (!confirm('確定要刪除此附件嗎？')) return

        try {
            const { data: sessionData } = await supabase.auth.getSession()
            const accessToken = sessionData?.session?.access_token
            const { error } = await supabase.functions.invoke('attachments-delete', {
                body: { attachment_id: attachment.id },
                headers: {
                    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
            })

            if (error) throw error
            if (onDeleted) onDeleted()
        } catch (error: any) {
            alert('刪除附件失敗: ' + error.message)
        }
    }
    if (attachments.length === 0) {
        return (
            <p className="text-sm text-gray-400 italic">尚無附件資料。</p>
        )
    }

    return (
        <ul className="space-y-2">
            {attachments.map((attachment) => (
                <li
                    key={attachment.id}
                    className="relative flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100"
                >
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate font-medium" title={attachment.file_name}>
                            {attachment.file_name}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleDownload(attachment)}
                        disabled={downloadingId === attachment.id}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50"
                    >
                        {downloadingId === attachment.id
                            ? '準備中...'
                            : isOpenableInBrowser(attachment.file_type)
                                ? '開啟'
                                : '下載'}
                    </button>
                    {downloadingId === attachment.id && !isOpenableInBrowser(attachment.file_type) && (
                        <button
                            type="button"
                            onClick={() => handleCancelDownload(attachment.id)}
                            className="ml-2 text-xs text-red-600 hover:text-red-800 font-semibold"
                        >
                            取消下載
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => handleDelete(attachment)}
                        className="ml-2 text-xs text-gray-600 hover:text-gray-800 font-semibold"
                    >
                        刪除
                    </button>
                    {typeof downloadProgress[attachment.id] === 'number' && (
                        <div className="absolute left-3 right-3 bottom-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-1 bg-blue-600 transition-all"
                                style={{ width: `${downloadProgress[attachment.id]}%` }}
                            />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    )
}

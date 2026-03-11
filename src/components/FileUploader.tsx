import { useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient'

interface FileUploaderProps {
    caseId: string;
    eventId?: string;
    onSuccess: () => void;
}

export default function FileUploader({ caseId, eventId, onSuccess }: FileUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null)
    const xhrRef = useRef<XMLHttpRequest | null>(null)
    const canceledRef = useRef(false)

    const uploadToR2 = (uploadUrl: string, file: File) => {
        return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhrRef.current = xhr
            xhr.open('PUT', uploadUrl, true)
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100)
                    setUploadProgress(percent)
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve()
                } else {
                    reject(new Error(`檔案上傳至 R2 失敗 (${xhr.status})`))
                }
            }

            xhr.onerror = () => {
                reject(new Error('檔案上傳至 R2 失敗 (network error)'))
            }

            xhr.onabort = () => {
                reject(new Error('上傳已取消'))
            }

            xhr.send(file)
        })
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            setUploadProgress(0)
            canceledRef.current = false

            if (!e.target.files || e.target.files.length === 0) {
                return
            }

            const file = e.target.files[0]
            const { data: sessionData } = await supabase.auth.getSession()
            if (import.meta.env.DEV) {
                console.info('[attachments-upload-url] session', sessionData?.session ? 'present' : 'missing')
                console.info('[attachments-upload-url] anon key present', Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY))
            }
            const accessToken = sessionData?.session?.access_token
            const { data: uploadData, error: uploadError } = await supabase.functions.invoke('attachments-upload-url', {
                body: {
                    case_id: caseId,
                    file_name: file.name,
                    content_type: file.type || 'application/octet-stream',
                },
                headers: {
                    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
            })

            if (uploadError) {
                throw uploadError
            }

            if (!uploadData?.uploadUrl || !uploadData?.objectKey) {
                throw new Error('上傳位址取得失敗')
            }

            await uploadToR2(uploadData.uploadUrl, file)

            const { error: dbError } = await supabase
                .from('attachments')
                .insert([
                    {
                        case_id: caseId,
                        event_id: eventId || null,
                        file_name: file.name,
                        file_url: '',
                        file_type: file.type,
                        storage_provider: 'r2',
                        storage_key: uploadData.objectKey,
                        status: 'uploaded',
                    },
                ])

            if (dbError) {
                throw dbError
            }

            onSuccess()
        } catch (error: any) {
            if (!canceledRef.current) {
                alert('上傳檔案時發生錯誤: ' + error.message)
            }
        } finally {
            setUploading(false)
            setUploadProgress(null)
            xhrRef.current = null
        }
    }

    const handleCancelUpload = () => {
        if (xhrRef.current) {
            canceledRef.current = true
            xhrRef.current.abort()
        }
    }

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                上傳新附件
            </label>
            <input
                type="file"
                disabled={uploading}
                onChange={handleUpload}
                className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          disabled:opacity-50"
            />
            {uploading && (
                <div className="mt-2 space-y-1">
                    <p className="text-sm text-blue-600 animate-pulse">上傳中...</p>
                    {typeof uploadProgress === 'number' && (
                        <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-2 bg-blue-600 transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}
                    {typeof uploadProgress === 'number' && (
                        <p className="text-xs text-gray-500">{uploadProgress}%</p>
                    )}
                    <button
                        type="button"
                        onClick={handleCancelUpload}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold"
                    >
                        取消上傳
                    </button>
                </div>
            )}
        </div>
    )
}

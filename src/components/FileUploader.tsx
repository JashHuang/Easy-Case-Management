import { useState } from 'react'
import { supabase } from '../services/supabaseClient'

interface FileUploaderProps {
    caseId: string;
    eventId?: string;
    onSuccess: () => void;
}

export default function FileUploader({ caseId, eventId, onSuccess }: FileUploaderProps) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!e.target.files || e.target.files.length === 0) {
                return
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${caseId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('case-files')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('case-files')
                .getPublicUrl(filePath)

            const { error: dbError } = await supabase
                .from('attachments')
                .insert([
                    {
                        case_id: caseId,
                        event_id: eventId || null,
                        file_name: file.name,
                        file_url: publicUrl,
                        file_type: file.type,
                    },
                ])

            if (dbError) {
                throw dbError
            }

            onSuccess()
        } catch (error: any) {
            alert('上傳檔案時發生錯誤: ' + error.message)
        } finally {
            setUploading(false)
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
            {uploading && <p className="mt-2 text-sm text-blue-600 animate-pulse">上傳中...</p>}
        </div>
    )
}

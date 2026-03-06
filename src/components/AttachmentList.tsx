import type { Attachment } from '../types/database'

interface AttachmentListProps {
    attachments: Attachment[];
}

export default function AttachmentList({ attachments }: AttachmentListProps) {
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
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100"
                >
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate font-medium" title={attachment.file_name}>
                            {attachment.file_name}
                        </span>
                    </div>
                    <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        下載
                    </a>
                </li>
            ))}
        </ul>
    )
}

import { Link } from 'react-router-dom'
import type { Case } from '../types/database'
import { format } from 'date-fns'
import { TrashIcon } from '@heroicons/react/24/outline'

interface CaseCardProps {
    caseData: Case;
    isAdmin?: boolean;
    isSelected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
    onDelete?: (id: string) => void;
}

export default function CaseCard({ caseData, isAdmin, isSelected, onSelect, onDelete }: CaseCardProps) {
    return (
        <div className="relative group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            {isAdmin && (
                <div className="absolute top-5 left-4 z-10 flex items-center">
                    <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={(e) => onSelect?.(caseData.id, e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                </div>
            )}
            <Link
                to={`/cases/${caseData.id}`}
                className={`block p-6 ${isAdmin ? 'pl-12' : ''}`}
            >
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{caseData.name}</h2>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${caseData.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {caseData.status === 'open' ? '開啟中' : '已結案'}
                    </span>
                </div>
                <p className="text-md text-blue-600 font-medium mb-3">{caseData.title}</p>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{caseData.summary}</p>
                <div className="text-xs text-gray-400">
                    建立日期: {format(new Date(caseData.created_at), 'yyyy-MM-dd')}
                </div>
            </Link>
            {isAdmin && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(caseData.id);
                    }}
                    className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors z-10"
                    title="刪除此案件"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    )
}

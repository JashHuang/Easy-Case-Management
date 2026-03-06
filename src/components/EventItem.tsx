import type { CaseEvent } from '../types/database'
import { format } from 'date-fns'

interface EventItemProps {
    event: CaseEvent;
    onEdit: (event: CaseEvent) => void;
    onDelete: (id: string) => void;
}

export default function EventItem({ event, onEdit, onDelete }: EventItemProps) {
    return (
        <div className="relative pl-8 pb-8 border-l-2 border-blue-200 last:border-l-0 last:pb-0">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
            <div className="group bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mt-1">
                            {format(new Date(event.event_date), 'yyyy-MM-dd')}
                        </span>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(event)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="編輯事件"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onDelete(event.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="刪除事件"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
        </div>
    )
}

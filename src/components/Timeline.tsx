import type { CaseEvent } from '../types/database'
import EventItem from './EventItem'

interface TimelineProps {
    events: CaseEvent[];
    onEdit: (event: CaseEvent) => void;
    onDelete: (id: string) => void;
}

export default function Timeline({ events, onEdit, onDelete }: TimelineProps) {
    if (events.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-400 italic">此案件尚無事件記錄。</p>
            </div>
        )
    }

    // Sort events by date ascending for timeline flow
    const sortedEvents = [...events].sort((a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    )

    return (
        <div className="py-2">
            {sortedEvents.map((event) => (
                <EventItem
                    key={event.id}
                    event={event}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}

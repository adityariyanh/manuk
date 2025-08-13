
import type { LogEntry } from "@/lib/types";
import { format, formatDistanceToNow } from "date-fns";

export function HistoryItem({ log, equipmentName }: { log: LogEntry; equipmentName?: string }) {
    return (
        <div className="border-b last:border-b-0 p-4 space-y-2">
            <div className='flex justify-between items-center'>
                <div className='flex flex-col'>
                    <span className="font-medium">{log.action}</span>
                    {equipmentName && <span className='text-sm text-muted-foreground'>{equipmentName}</span>}
                </div>
                 <span className="text-sm text-muted-foreground text-right" title={format(log.timestamp, 'PPP p')}>
                    {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>User:</strong> {log.user || 'N/A'}</p>
                <p><strong>Notes:</strong> {log.notes || 'N/A'}</p>
            </div>
        </div>
    )
}

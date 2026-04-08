import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function GenericNode({ data }: NodeProps) {
    const d = data as Record<string, unknown>;
    const resourceType = (d.resource_type as string) || 'RESOURCE';

    return (
        <div className="glass !rounded-xl !p-3 min-w-[140px] hover:border-dark-300/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-dark-400/30 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8aaa" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-dark-300">{resourceType}</div>
                    <div className="text-xs font-bold text-white truncate">{d.label as string}</div>
                </div>
            </div>

            {Boolean(d.summary) && typeof d.summary === 'object' && (
                <div className="space-y-1">
                    {Object.entries(d.summary as Record<string, unknown>).slice(0, 4).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-[10px] text-dark-300">{key}</span>
                            <span className="text-[10px] text-dark-200 font-mono truncate max-w-[100px]">{String(val)}</span>
                        </div>
                    ))}
                </div>
            )}

            <Handle type="target" position={Position.Top} className="!bg-dark-300 !w-2 !h-2 !border-none" />
            <Handle type="source" position={Position.Bottom} className="!bg-dark-300 !w-2 !h-2 !border-none" />
        </div>
    );
}

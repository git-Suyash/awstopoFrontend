import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function SubnetNode({ data }: NodeProps) {
    const d = data as Record<string, unknown>;
    const summary = d.summary as Record<string, unknown> || {};
    const isPublic = summary.public === true;

    return (
        <div
            className={`relative w-full h-full rounded-xl border p-2.5 ${isPublic
                    ? 'border-accent-green/30 bg-accent-green/5'
                    : 'border-accent-purple/30 bg-accent-purple/5'
                }`}
        >
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isPublic ? 'bg-accent-green/20' : 'bg-accent-purple/20'
                    }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isPublic ? '#10b981' : '#a855f7'} strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <div className={`text-[9px] font-semibold uppercase tracking-wider ${isPublic ? 'text-accent-green' : 'text-accent-purple'}`}>
                        {isPublic ? 'Public' : 'Private'} Subnet
                    </div>
                    <div className="text-[11px] font-bold text-white truncate">{d.label as string}</div>
                </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
                {Boolean(summary.cidr) && <span className="text-[9px] text-dark-300 font-mono">{summary.cidr as string}</span>}
                {Boolean(summary.az) && (
                    <span className={`text-[8px] px-1 py-0.5 rounded font-medium ${isPublic ? 'bg-accent-green/15 text-accent-green' : 'bg-accent-purple/15 text-accent-purple'
                        }`}>
                        {summary.az as string}
                    </span>
                )}
            </div>

            <Handle type="target" position={Position.Top} className={`!w-2 !h-2 !border-none ${isPublic ? '!bg-accent-green' : '!bg-accent-purple'}`} />
            <Handle type="source" position={Position.Bottom} className={`!w-2 !h-2 !border-none ${isPublic ? '!bg-accent-green' : '!bg-accent-purple'}`} />
        </div>
    );
}

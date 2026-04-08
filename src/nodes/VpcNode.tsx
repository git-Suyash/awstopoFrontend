import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function VpcNode({ data }: NodeProps) {
    const d = data as Record<string, unknown>;
    const summary = d.summary as Record<string, unknown> || {};

    return (
        <div className="relative w-full h-full rounded-2xl border-2 border-dashed border-accent-blue/40 bg-accent-blue/5 p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-accent-blue/20 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="4" />
                        <path d="M2 12h20" />
                        <path d="M12 2v20" />
                    </svg>
                </div>
                <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-accent-blue">VPC</div>
                    <div className="text-xs font-bold text-white truncate">{d.label as string}</div>
                </div>
                {Boolean(summary.region) && (
                    <span className="ml-auto text-[9px] bg-accent-blue/15 text-accent-blue px-1.5 py-0.5 rounded-full font-medium shrink-0">
                        {summary.region as string}
                    </span>
                )}
            </div>
            {Boolean(summary.cidr) && (
                <div className="text-[10px] text-dark-300 font-mono mt-0.5">{summary.cidr as string}</div>
            )}

            <Handle type="target" position={Position.Top} className="!bg-accent-blue !w-2 !h-2 !border-none" />
            <Handle type="source" position={Position.Bottom} className="!bg-accent-blue !w-2 !h-2 !border-none" />
        </div>
    );
}

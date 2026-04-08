import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function SecurityGroupNode({ data }: NodeProps) {
    const d = data as Record<string, unknown>;
    const summary = d.summary as Record<string, unknown> || {};

    return (
        <div className="glass !rounded-xl !p-3 min-w-[150px] !border-accent-red/20 hover:!border-accent-red/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent-red/15 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-accent-red">Security Group</div>
                    <div className="text-xs font-bold text-white truncate">{d.label as string}</div>
                </div>
            </div>

            <div className="space-y-1">
                {summary.inbound_rules !== undefined && (
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-dark-300">Inbound</span>
                        <span className="text-[10px] text-accent-green font-mono">{summary.inbound_rules as number} rules</span>
                    </div>
                )}
                {summary.outbound_rules !== undefined && (
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-dark-300">Outbound</span>
                        <span className="text-[10px] text-accent-amber font-mono">{summary.outbound_rules as number} rules</span>
                    </div>
                )}
                {Boolean(summary.id) && (
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-dark-300">ID</span>
                        <span className="text-[10px] text-dark-200 font-mono">{summary.id as string}</span>
                    </div>
                )}
            </div>

            <Handle type="target" position={Position.Top} className="!bg-accent-red !w-2 !h-2 !border-none" />
            <Handle type="source" position={Position.Bottom} className="!bg-accent-red !w-2 !h-2 !border-none" />
        </div>
    );
}

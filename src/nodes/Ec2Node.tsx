import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function Ec2Node({ data }: NodeProps) {
    const d = data as Record<string, unknown>;
    const summary = d.summary as Record<string, unknown> || {};
    const state = (summary.state as string) || 'unknown';
    const isRunning = state === 'running';

    return (
        <div className="glass !rounded-xl !p-3 min-w-[160px] hover:border-accent-cyan/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent-amber/15 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-accent-amber">EC2</div>
                    <div className="text-xs font-bold text-white truncate">{d.label as string}</div>
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-dark-300">State</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isRunning
                            ? 'bg-accent-green/20 text-accent-green'
                            : 'bg-accent-red/20 text-accent-red'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`} />
                        {state}
                    </span>
                </div>
                {Boolean(summary.instance_type) && (
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-dark-300">Type</span>
                        <span className="text-[10px] text-dark-100 font-mono">{summary.instance_type as string}</span>
                    </div>
                )}
                {Boolean(summary.private_ip) && (
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-dark-300">Private IP</span>
                        <span className="text-[10px] text-dark-100 font-mono">{summary.private_ip as string}</span>
                    </div>
                )}
                {Boolean(summary.public_ip) && (
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-dark-300">Public IP</span>
                        <span className="text-[10px] text-accent-cyan font-mono">{summary.public_ip as string}</span>
                    </div>
                )}
            </div>

            <Handle type="target" position={Position.Top} className="!bg-accent-amber !w-2 !h-2 !border-none" />
            <Handle type="source" position={Position.Bottom} className="!bg-accent-amber !w-2 !h-2 !border-none" />
        </div>
    );
}

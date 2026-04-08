import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function IgwNode({ data }: NodeProps) {
    const d = data as Record<string, unknown>;
    const summary = d.summary as Record<string, unknown> || {};
    const state = (summary.state as string) || 'attached';

    return (
        <div className="glass !rounded-xl !p-3 min-w-[140px] !border-accent-cyan/20 hover:!border-accent-cyan/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent-cyan/15 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-accent-cyan">Internet Gateway</div>
                    <div className="text-xs font-bold text-white truncate">{d.label as string}</div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-[10px] text-dark-300">State</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${state === 'attached'
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'bg-dark-400/30 text-dark-300'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${state === 'attached' ? 'bg-accent-green' : 'bg-dark-400'}`} />
                    {state}
                </span>
            </div>

            <Handle type="target" position={Position.Top} className="!bg-accent-cyan !w-2 !h-2 !border-none" />
            <Handle type="source" position={Position.Bottom} className="!bg-accent-cyan !w-2 !h-2 !border-none" />
        </div>
    );
}

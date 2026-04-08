interface StatusBadgeProps {
    status: 'running' | 'stopped' | 'pending' | 'success' | 'error' | 'active' | 'inactive';
    label?: string;
    size?: 'sm' | 'md';
}

const colors: Record<string, string> = {
    running: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    active: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    success: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    stopped: 'bg-accent-red/20 text-accent-red border-accent-red/30',
    error: 'bg-accent-red/20 text-accent-red border-accent-red/30',
    inactive: 'bg-dark-400/30 text-dark-300 border-dark-400/30',
    pending: 'bg-accent-amber/20 text-accent-amber border-accent-amber/30',
};

export default function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
    const display = label || status;
    const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

    return (
        <span
            className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider rounded-full border ${colors[status] || colors.inactive} ${sizeClass}`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${status === 'running' || status === 'active' ? 'animate-pulse' : ''
                    } ${status === 'running' || status === 'active' || status === 'success' ? 'bg-accent-green' : status === 'stopped' || status === 'error' ? 'bg-accent-red' : status === 'pending' ? 'bg-accent-amber' : 'bg-dark-300'}`}
            />
            {display}
        </span>
    );
}

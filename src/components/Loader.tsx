interface LoaderProps {
    message?: string;
    fullScreen?: boolean;
}

export default function Loader({ message = 'Loading...', fullScreen = false }: LoaderProps) {
    const wrapperClass = fullScreen
        ? 'fixed inset-0 z-50 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center'
        : 'flex items-center justify-center py-12';

    return (
        <div className={wrapperClass}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-dark-500 border-t-accent-cyan animate-spin" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-b-accent-indigo animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="text-sm text-dark-200 animate-pulse">{message}</p>
            </div>
        </div>
    );
}

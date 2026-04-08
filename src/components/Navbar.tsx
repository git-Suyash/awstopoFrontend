import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="w-full z-50 flex items-center justify-between px-8 h-14 bg-[#f7f9fe] border-b border-surface-container font-headline tracking-tight">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
                <span className="text-base font-black text-[#181c20] uppercase tracking-tighter">AWSTopo</span>
            </div>

            {/* Auth links */}
            <nav className="flex items-center gap-1">
                <Link
                    to="/login"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                        isActive('/login')
                            ? 'text-primary bg-primary/5 font-bold'
                            : 'text-[#576474] hover:bg-surface-container'
                    }`}
                >
                    Sign In
                </Link>
                <Link
                    to="/register"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                        isActive('/register')
                            ? 'text-primary bg-primary/5 font-bold'
                            : 'text-[#576474] hover:bg-surface-container'
                    }`}
                >
                    Sign Up
                </Link>
            </nav>
        </header>
    );
}

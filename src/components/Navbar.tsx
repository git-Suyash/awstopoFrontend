import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-t-0 border-x-0 rounded-none">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 no-underline group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-indigo to-accent-cyan flex items-center justify-center shadow-lg shadow-accent-indigo/20 group-hover:shadow-accent-cyan/30 transition-shadow">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-accent-indigo-light to-accent-cyan bg-clip-text text-transparent">
                        CloudView
                    </span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-1">
                    {user ? (
                        <>
                            <Link
                                to="/configure"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline ${isActive('/configure')
                                        ? 'text-accent-cyan bg-accent-cyan/10'
                                        : 'text-dark-200 hover:text-dark-100 hover:bg-dark-600'
                                    }`}
                            >
                                Configure
                            </Link>
                            <div className="w-px h-6 bg-dark-500 mx-2" />
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center text-xs font-bold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}>
                                    Logout
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline ${isActive('/login')
                                        ? 'text-accent-cyan bg-accent-cyan/10'
                                        : 'text-dark-200 hover:text-dark-100 hover:bg-dark-600'
                                    }`}
                            >
                                Login
                            </Link>
                            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                                Get Started
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

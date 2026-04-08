import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdAccountTree } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('All fields are required'); return; }

        setLoading(true);
        try {
            await login(email, password);
            navigate('/configure');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-[calc(100vh-56px)] flex flex-col font-body">
            {/* Subtle Background Texture */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary-container/10 rounded-full blur-[150px]"></div>
            </div>
            
            {/* Login Container */}
            <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-[440px]">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-surface-container-low mb-4">
                            <MdAccountTree className="text-primary text-3xl" />
                        </div>
                        <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface">
                            AWSTopo
                        </h1>
                        <p className="text-on-secondary-container text-sm mt-1 font-medium">Internal AWS Infrastructure Visualizer</p>
                    </div>
                    
                    {/* Sign In Card */}
                    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(24,28,32,0.04)] outline outline-1 outline-outline-variant/20 p-8 md:p-10">
                        <header className="mb-8">
                            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Sign In</h2>
                            <p className="text-on-secondary-container text-sm mt-2">Access your cloud visualization workspace</p>
                        </header>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block font-label text-[11px] font-semibold uppercase tracking-wider text-on-secondary-container" htmlFor="email">
                                    Email
                                </label>
                                <div className="relative">
                                    <input 
                                        className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-primary focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline/50" 
                                        id="email" type="email" placeholder="name@company.com" 
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block font-label text-[11px] font-semibold uppercase tracking-wider text-on-secondary-container" htmlFor="password">
                                        Password
                                    </label>
                                </div>
                                <div className="relative">
                                    <input 
                                        className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-primary focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline/50" 
                                        id="password" type="password" placeholder="••••••••" 
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg font-medium">
                                    {error}
                                </div>
                            )}
                            
                            {/* CTA Section */}
                            <div className="pt-2">
                                <button disabled={loading} className="w-full bg-gradient-to-tl from-primary to-primary-container text-on-primary font-headline font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg hover:opacity-95 transition-all active:scale-[0.98] duration-200 disabled:opacity-50" type="submit">
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                        
                        {/* Divider */}
                        <div className="mt-8 pt-8 border-t border-outline-variant/10 flex flex-col items-center">
                            <p className="text-on-secondary-container text-sm">
                                Don't have an account? 
                                <Link to="/register" className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 ml-1">Sign Up</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Visual Accent Element */}
            <div className="hidden lg:block fixed right-12 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                <div className="relative w-96 h-96">
                    <div className="absolute inset-0 bg-surface-container rounded-3xl rotate-12 outline outline-1 outline-outline-variant/20"></div>
                    <div className="absolute inset-0 bg-surface-container-high rounded-3xl -rotate-6 outline outline-1 outline-outline-variant/20 flex items-center justify-center p-12">
                        <div className="grid grid-cols-3 gap-4 w-full">
                            <div className="h-12 bg-white/40 rounded-lg"></div>
                            <div className="h-12 bg-white/40 rounded-lg"></div>
                            <div className="h-12 bg-white/40 rounded-lg"></div>
                            <div className="h-12 bg-white/40 rounded-lg col-span-2"></div>
                            <div className="h-12 bg-white/40 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

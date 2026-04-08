import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password || !confirm) { setError('All fields are required'); return; }
        if (password !== confirm) { setError('Passwords do not match'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters'); return; }

        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/configure');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
            <main className="flex-grow flex items-center justify-center px-6 py-12">
                <div className="max-w-md w-full">
                    {/* Brand Anchor */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-surface-container-low mb-4">
                            <span className="material-symbols-outlined text-primary text-3xl">cloud</span>
                        </div>
                        <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-on-surface mb-2">The Digital Cartographer</h1>
                        <p className="text-on-secondary-container font-medium text-sm">Design your infrastructure with editorial precision.</p>
                    </div>
                    
                    {/* Registration Card */}
                    <div className="bg-surface-container-lowest rounded-xl p-10 shadow-[0px_12px_32px_rgba(24,28,32,0.06)] outline outline-1 outline-outline-variant/20">
                        <h2 className="font-headline font-bold text-xl text-on-surface mb-8 tracking-tight">Create your account</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-secondary-container mb-2 ml-1" htmlFor="full_name">Full Name</label>
                                <div className="relative">
                                    <input 
                                        className="w-full bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-lowest border-b-2 border-transparent focus:border-primary transition-all duration-300 py-3 px-4 rounded-lg text-on-surface placeholder:text-outline-variant font-medium" 
                                        id="full_name" type="text" placeholder="John Doe" 
                                        value={name} onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {/* Email */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-secondary-container mb-2 ml-1" htmlFor="email">Email Address</label>
                                <div className="relative">
                                    <input 
                                        className="w-full bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-lowest border-b-2 border-transparent focus:border-primary transition-all duration-300 py-3 px-4 rounded-lg text-on-surface placeholder:text-outline-variant font-medium" 
                                        id="email" type="email" placeholder="architect@cloud.io" 
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {/* Password Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-on-secondary-container mb-2 ml-1" htmlFor="password">Password</label>
                                    <input 
                                        className="w-full bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-lowest border-b-2 border-transparent focus:border-primary transition-all duration-300 py-3 px-4 rounded-lg text-on-surface placeholder:text-outline-variant font-medium" 
                                        id="password" type="password" placeholder="••••••••" 
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-on-secondary-container mb-2 ml-1" htmlFor="confirm_password">Confirm</label>
                                    <input 
                                        className="w-full bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-lowest border-b-2 border-transparent focus:border-primary transition-all duration-300 py-3 px-4 rounded-lg text-on-surface placeholder:text-outline-variant font-medium" 
                                        id="confirm_password" type="password" placeholder="••••••••" 
                                        value={confirm} onChange={(e) => setConfirm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg font-medium">
                                    {error}
                                </div>
                            )}
                            
                            {/* Submit Action */}
                            <div className="pt-4">
                                <button disabled={loading} className="w-full bg-gradient-to-tl from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-lg hover:opacity-90 transition-all duration-300 shadow-md disabled:opacity-50" type="submit">
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                        
                        {/* Footer Link */}
                        <div className="mt-10 text-center">
                            <p className="text-on-secondary-container text-sm font-medium">
                                Already have an account? 
                                <Link to="/login" className="text-primary font-bold hover:underline ml-1">Sign In</Link>
                            </p>
                        </div>
                    </div>
                    
                    {/* Visual Decoration */}
                    <div className="mt-12 flex justify-center space-x-8 opacity-20 grayscale transition-all hover:grayscale-0 hover:opacity-40">
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-sm">verified_user</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Secure</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-sm">hub</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">AWS Certified</span>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Footer Component */}
            <footer className="flex flex-col md:flex-row justify-between items-center px-12 mt-auto w-full opacity-60 py-8 bg-transparent">
                <div className="mb-4 md:mb-0">
                    <span className="text-sm font-bold text-on-surface font-headline tracking-tight">The Digital Cartographer</span>
                </div>
                <div className="flex flex-col items-center md:items-end space-y-2">
                    <nav className="flex space-x-6">
                        <a className="font-body text-xs font-medium text-on-secondary-container hover:text-primary transition-colors duration-200" href="#">Privacy Policy</a>
                        <a className="font-body text-xs font-medium text-on-secondary-container hover:text-primary transition-colors duration-200" href="#">Terms of Service</a>
                        <a className="font-body text-xs font-medium text-on-secondary-container hover:text-primary transition-colors duration-200" href="#">Help Center</a>
                    </nav>
                    <p className="font-body text-xs font-medium text-on-secondary-container">© 2024 The Digital Cartographer. Built for AWS Architecture.</p>
                </div>
            </footer>
        </div>
    );
}

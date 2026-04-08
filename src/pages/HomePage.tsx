import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
    {
        icon: (
            <span className="material-symbols-outlined text-3xl">security</span>
        ),
        title: 'Security Insights',
        desc: 'Identify security groups, IAM policies, and potential vulnerabilities across your infrastructure.',
        color: 'text-error bg-error-container',
    },
    {
        icon: (
            <span className="material-symbols-outlined text-3xl">radar</span>
        ),
        title: 'Real-time Scanning',
        desc: 'Connect your AWS account and scan your entire infrastructure in minutes with zero downtime.',
        color: 'text-primary bg-primary-container',
    },
    {
        icon: (
            <span className="material-symbols-outlined text-3xl">account_tree</span>
        ),
        title: 'Interactive Maps',
        desc: 'Explore your VPCs, subnets, EC2 instances, and their connections in a fully interactive diagram.',
        color: 'text-[#832700] bg-[#ffdbcf]',
    },
];

export default function HomePage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-surface font-body text-on-surface overflow-hidden hidden-scrollbar relative flex flex-col">
            {/* Top Navigation */}
            {/* <header className="absolute top-0 w-full px-8 py-6 z-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-2xl">account_tree</span>
                    <span className="text-xl font-bold font-headline tracking-tighter text-on-surface uppercase">Digital Cartographer</span>
                </div>
                <div>
                   {user ? (
                        <Link to="/configure" className="text-primary font-bold px-4 py-2 hover:bg-primary/5 rounded-lg transition-colors">Go to App</Link>
                    ) : (
                        <Link to="/login" className="text-on-secondary-container font-bold px-4 py-2 hover:bg-surface-container-highest rounded-lg transition-colors">Sign In</Link>
                    )}
                </div>
            </header> */}

            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#c2c6d9 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Hero Section */}
            <section className="relative z-10 pt-40 pb-24 px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-8">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Now in Public Beta
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-[1.1] tracking-tight text-on-surface mb-6">
                    MAPPING YOUR CLOUD <br/> 
                    <span className="text-primary">MADE EFFORTLESS.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-on-secondary-container max-w-2xl leading-relaxed mb-10 font-medium">
                    Securely connect your AWS account and instantly visualize every VPC, subnet, instance, and their relationships in a stunning, interactive workspace.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
                    {user ? (
                        <Link to="/configure" className="w-full sm:w-auto text-center px-8 py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-headline text-lg hover:-translate-y-0.5">
                            Configure Workspace
                        </Link>
                    ) : (
                        <>
                            <Link to="/register" className="w-full sm:w-auto text-center px-8 py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-headline text-lg hover:-translate-y-0.5">
                                Start Mapping Free
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto text-center px-8 py-4 bg-surface-container-lowest text-on-surface font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-all font-headline text-lg">
                                Access Account
                            </Link>
                        </>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full border border-outline-variant/20 bg-white/50 backdrop-blur-xl p-8 rounded-3xl">
                     {[['10+', 'Resources Tracked'], ['Zero', 'Agents to Install'], ['100%', 'Read-Only Security']].map(([val, label]) => (
                        <div key={label} className="flex flex-col items-center">
                            <span className="text-4xl font-extrabold text-primary font-headline tracking-tighter mb-1">{val}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-on-secondary-container">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 bg-surface-container-low py-32 px-6 flex-1">
                <div className="max-w-6xl mx-auto">
                     <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-4">Discover Your Architecture</h2>
                        <p className="text-lg text-on-secondary-container max-w-2xl mx-auto">Automated discovery gives you the ultimate source of truth, from security policies down to individual network interfaces.</p>
                     </div>

                     <div className="grid md:grid-cols-3 gap-8">
                         {features.map((f, i) => (
                             <div key={i} className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/15 hover:shadow-md transition-shadow group">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${f.color}`}>
                                     {f.icon}
                                 </div>
                                 <h3 className="text-xl font-bold font-headline text-on-surface mb-3 tracking-tight">{f.title}</h3>
                                 <p className="text-on-secondary-container leading-relaxed">{f.desc}</p>
                             </div>
                         ))}
                     </div>
                </div>
            </section>
            
            {/* CTA */}
            <footer className="relative z-10 flex flex-col items-center justify-center py-20 px-6 bg-surface border-t border-outline-variant/10 text-center">
                <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline tracking-tight">Ready to illuminate your cloud?</h3>
                <p className="text-on-secondary-container mb-8">Join the beta and start visualizing your infrastructure in minutes.</p>
                <Link to={user ? '/configure' : '/register'} className="px-8 py-4 bg-inverse-surface text-inverse-on-surface font-bold rounded-xl hover:-translate-y-0.5 transition-all shadow-md font-headline">
                    {user ? 'Return to Workspace' : 'Create Free Account'}
                </Link>
            </footer>
        </div>
    );
}

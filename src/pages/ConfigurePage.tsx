import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { configureAws, validateAws, startPipeline, getPipelineStatus } from '../api/api';

type Step = 'arn' | 'validate' | 'scan' | 'scanning';

export default function ConfigurePage() {
    const [step, setStep] = useState<Step>('arn');
    const [arn, setArn] = useState('');
    const [externalId, setExternalId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const handleConfigure = async () => {
        if (!arn.trim()) { setError('Please enter a valid ARN'); return; }
        setError('');
        setLoading(true);
        try {
            const result = await configureAws(arn);
            setExternalId(result.external_id);
            setStep('validate');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Configuration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await validateAws(arn, externalId);
            if (result.valid) {
                setStep('scan');
            } else {
                setError(result.message || 'Validation failed — ensure the trust policy is configured correctly.');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Validation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleStartScan = async () => {
        setError('');
        setLoading(true);
        setStep('scanning');
        try {
            const { scan_id } = await startPipeline(arn.split(':')[4] || '123456789012');
            let status = 'running';
            let prog = 0;
            while (status === 'running' || status === 'pending') {
                const res = await getPipelineStatus(scan_id);
                status = res.status;
                prog = res.progress;
                setProgress(prog);
                if (status === 'completed') break;
                await new Promise((r) => setTimeout(r, 1000));
            }
            navigate(`/visualize/${scan_id}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Pipeline failed');
            setStep('scan');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const stepIndex = step === 'scanning' ? 2 : ['arn', 'validate', 'scan'].indexOf(step);

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col font-body">
            {/* TopAppBar */}
            <header className="w-full top-0 z-50 flex justify-between items-center px-8 h-16 bg-[#f7f9fe] font-headline tracking-tight border-b border-surface-container">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">account_tree</span>
                    <span className="text-xl font-bold text-[#181c20] uppercase tracking-tighter">Digital Cartographer</span>
                </div>
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex gap-8">
                        <Link className="text-[#576474] hover:bg-[#f1f4f9] transition-colors px-3 py-2 rounded-lg text-sm font-medium" to="/visualize/demo">Dashboard</Link>
                        <Link className="text-primary font-bold px-3 py-2 rounded-lg text-sm bg-primary/5" to="/configure">Configuration</Link>
                    </nav>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* NavigationDrawer */}
                <aside className="hidden md:flex h-[calc(100vh-64px)] w-64 border-r border-surface-container bg-[#f1f4f9] flex-col py-6 gap-2">
                    <div className="px-6 mb-8">
                        <span className="font-headline text-sm uppercase tracking-wider text-[#181c20] font-black">AWS NAVIGATOR</span>
                    </div>
                    <nav className="flex flex-col gap-1 pr-4">
                        <a className="flex items-center gap-3 px-6 py-3 text-[#576474] transition-transform duration-200" href="#">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="font-headline text-sm uppercase tracking-wider">Workspace</span>
                        </a>
                        <a className="flex items-center gap-3 px-6 py-3 bg-white text-primary rounded-r-full font-bold shadow-sm translate-x-1" href="#">
                            <span className="material-symbols-outlined">shield_person</span>
                            <span className="font-headline text-sm uppercase tracking-wider">IAM Config</span>
                        </a>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 px-8 py-12 md:px-16 lg:px-24 bg-surface max-h-[calc(100vh-64px)] overflow-y-auto relative pb-32">
                    {/* Progress Indicator */}
                    <section className="max-w-4xl mx-auto mb-16">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container -translate-y-1/2 z-0"></div>
                            <div className={`absolute top-1/2 left-0 h-[2px] bg-primary transition-all duration-500 z-0 ${stepIndex === 0 ? 'w-0' : stepIndex === 1 ? 'w-1/2' : 'w-full'}`}></div>
                            
                            {/* Step 1 */}
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${stepIndex >= 0 ? 'bg-primary text-white' : 'bg-surface-container text-on-secondary-container'}`}>
                                    {stepIndex > 0 ? <span className="material-symbols-outlined text-sm">check</span> : <span className="font-headline font-bold">1</span>}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${stepIndex >= 0 ? 'text-primary' : 'text-on-secondary-container'}`}>Step 1: Account</span>
                            </div>
                            {/* Step 2 */}
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${stepIndex >= 1 ? 'bg-primary text-white shadow-xl ring-4 ring-primary-fixed' : 'bg-surface-container text-on-secondary-container'}`}>
                                    {stepIndex > 1 ? <span className="material-symbols-outlined text-sm">check</span> : <span className="font-headline font-bold">2</span>}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${stepIndex >= 1 ? 'text-primary' : 'text-on-secondary-container'}`}>Step 2: Configuration</span>
                            </div>
                            {/* Step 3 */}
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${stepIndex >= 2 ? 'bg-primary text-white shadow-lg' : 'bg-surface-container text-on-secondary-container'}`}>
                                    <span className="font-headline font-bold">3</span>
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${stepIndex >= 2 ? 'text-primary' : 'text-on-secondary-container'}`}>Step 3: Verify</span>
                            </div>
                        </div>
                    </section>

                    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Left Column */}
                        <div className="lg:col-span-7 space-y-10">
                            <div>
                                <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Configure AWS Role</h1>
                                <p className="text-on-secondary-container font-body">Establish a secure, cross-account trust relationship to allow Cloud Cartographer to visualize your infrastructure.</p>
                            </div>
                            
                            <div className="space-y-6">
                                {/* ARN Input (Always visible but disabled later) */}
                                <div className="group">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-on-secondary-container mb-3">IAM Role ARN</label>
                                    <div className="relative">
                                        <input 
                                            className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:bg-surface-container-lowest focus:ring-0 transition-all duration-300 p-4 rounded-t-lg font-mono text-sm text-on-surface disabled:opacity-50" 
                                            placeholder="arn:aws:iam::123456789012:role/CloudCartographerRole" type="text"
                                            value={arn} onChange={(e) => setArn(e.target.value)}
                                            disabled={step !== 'arn'}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-on-secondary-container opacity-70">Paste the full ARN of the role you created in your AWS Console.</p>
                                </div>

                                {/* External ID Display for Validate Step */}
                                {step === 'validate' && (
                                    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/15 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-on-secondary-container mb-3">Unique External ID</label>
                                        <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-lg">
                                            <code className="text-primary font-bold tracking-wider">{externalId}</code>
                                            <button 
                                                onClick={() => copyToClipboard(externalId)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-secondary-fixed text-on-secondary-fixed rounded-full hover:bg-secondary-container transition-colors text-xs font-bold uppercase tracking-tighter">
                                                <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                        <p className="mt-3 text-xs text-on-secondary-container">Add this ID to your Trust Relationship to prevent 'Confused Deputy' attacks.</p>
                                    </div>
                                )}

                                {/* Scanning States */}
                                {step === 'scan' && (
                                    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/15 text-center py-10 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-3xl text-primary">verified</span>
                                        </div>
                                        <h2 className="text-xl font-bold text-on-surface mb-2">Account Validated!</h2>
                                        <p className="text-sm text-on-secondary-container">Your AWS account is securely connected. Begin the mapping process.</p>
                                    </div>
                                )}

                                {step === 'scanning' && (
                                    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/15 text-center py-10 animate-in fade-in">
                                         <div className="mb-4">
                                            <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
                                         </div>
                                         <h2 className="text-xl font-bold text-on-surface mb-4">Scanning Infrastructure...</h2>
                                         <div className="w-full bg-surface-container rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                         </div>
                                         <p className="text-xs text-on-secondary-container mt-3">{progress}% complete</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-error-container text-on-error-container text-sm p-4 rounded-lg font-medium border border-error/20">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Policies */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="material-symbols-outlined text-primary">security</span>
                                    <h2 className="font-headline font-bold text-lg text-on-surface">Security Policies</h2>
                                </div>
                                <div className="space-y-4">
                                    <details className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/15" open>
                                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container transition-colors">
                                            <span className="text-sm font-bold text-on-surface">IAM Trust Policy</span>
                                            <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                                        </summary>
                                        <div className="p-4 bg-inverse-surface text-inverse-on-surface font-mono text-xs overflow-x-auto">
                                        <pre>{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<Account>:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "${externalId || '...'}"
        }
      }
    }
  ]
}`}</pre>
                                        </div>
                                    </details>

                                    <details className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/15">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container transition-colors">
                                            <span className="text-sm font-bold text-on-surface">IAM Permissions Policy</span>
                                            <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                                        </summary>
                                        <div className="p-4 bg-inverse-surface text-inverse-on-surface font-mono text-xs overflow-x-auto">
                                            <pre>{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ec2:Describe*",
        "rds:Describe*",
        "s3:List*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}`}</pre>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Sticky Actions Footer */}
            <footer className="absolute bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-12px_32px_rgba(24,28,32,0.04)] px-8 py-6 z-50">
                <div className="max-w-screen-xl mx-auto flex items-center justify-end">
                    <div className="flex items-center gap-4">
                        {step === 'validate' || step === 'scan' ? (
                            <button onClick={() => { setStep('arn'); setError(''); }} className="px-6 py-3 text-on-secondary-container font-headline font-bold hover:bg-surface-container-low rounded-lg transition-all">
                                Back
                            </button>
                        ): null}

                        {step === 'arn' && (
                            <button disabled={loading} onClick={handleConfigure} className="flex items-center gap-3 bg-gradient-to-br from-primary to-primary-container px-10 py-3 rounded-lg text-white font-headline font-extrabold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50">
                                {loading ? 'Processing...' : 'Submit ARN'}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        )}

                        {step === 'validate' && (
                            <button disabled={loading} onClick={handleValidate} className="flex items-center gap-3 bg-gradient-to-br from-primary to-primary-container px-10 py-3 rounded-lg text-white font-headline font-extrabold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50">
                                {loading ? 'Validating...' : 'Validate Account'}
                                <span className="material-symbols-outlined">check_circle</span>
                            </button>
                        )}

                        {step === 'scan' && (
                            <button disabled={loading} onClick={handleStartScan} className="flex items-center gap-3 bg-gradient-to-br from-primary to-primary-container px-10 py-3 rounded-lg text-white font-headline font-extrabold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50">
                                {loading ? 'Starting...' : 'Start Mapping'}
                                <span className="material-symbols-outlined">rocket_launch</span>
                            </button>
                        )}
                        {step === 'scanning' && (
                            <button disabled className="flex items-center gap-3 bg-surface-container px-10 py-3 rounded-lg text-outline opacity-50 font-headline font-extrabold transition-all">
                                Mapping In Progress...
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}

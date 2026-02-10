import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useParams, useNavigate } from 'react-router-dom';
import { User, CardData, DEFAULT_CARD, PREMIUM_TEMPLATES, TemplateId, Service, BusinessHour, SectionId, Plan } from './types';
import { storageService } from './services/storage';
import { generateBio } from './services/geminiService';
import { Icons } from './components/Icons';
import { TemplateRenderer } from './components/TemplateRenderer';

// --- Helper Functions ---
const resizeImage = (file: File, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const elem = document.createElement('canvas');
                const scaleFactor = maxWidth / img.width;
                const width = maxWidth;
                const height = img.height * scaleFactor;
                elem.width = width;
                elem.height = height;
                const ctx = elem.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(elem.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};

// --- Pricing Modal ---
const PricingModal: React.FC<{ user: User; isOpen: boolean; onClose: () => void; onUpgrade: (u: User) => void }> = ({ user, isOpen, onClose, onUpgrade }) => {
    const [processing, setProcessing] = useState<string | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    useEffect(() => { storageService.getPlans().then(setPlans); }, []);
    if (!isOpen) return null;
    const handleUpgrade = async (plan: Plan) => {
        setProcessing(plan.id);
        const updatedUser = await storageService.upgradeUser(plan.id === 'pro_lifetime' ? 'pro_lifetime' : 'pro_monthly' as any);
        onUpgrade(updatedUser);
        onClose();
        setProcessing(null);
    };
    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-10 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black mb-4 tracking-tight text-slate-900">Choose Your Plan</h2>
                    <p className="text-slate-500 font-bold">Unlock all 20 premium templates and advanced content modules.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {plans.map((plan) => (
                         <div key={plan.id} className={`border-2 rounded-[2.5rem] p-8 flex flex-col items-center transition-all ${plan.isPopular ? 'border-blue-600 shadow-xl scale-105' : 'border-slate-100 hover:border-blue-200'}`}>
                            {plan.isPopular && <span className="bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest shadow-lg shadow-blue-600/20">Most Popular</span>}
                            <h3 className="font-black text-2xl mb-2 text-slate-800">{plan.name}</h3>
                            <div className="text-4xl font-black mb-8 text-slate-900">₹{plan.price}<span className="text-sm font-medium text-slate-400">/{plan.interval === 'lifetime' ? 'once' : 'mo'}</span></div>
                            <ul className="text-sm text-slate-500 mb-10 space-y-4 w-full px-4">
                                {plan.features.map((f, i) => <li key={i} className="flex gap-3 items-center font-bold text-xs"><Icons.Check size={14} className="text-blue-600 flex-shrink-0" /> {f}</li>)}
                            </ul>
                            <button onClick={() => handleUpgrade(plan)} disabled={!!processing} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-700 shadow-xl shadow-blue-600/30 active:scale-95 transition-all text-xs uppercase tracking-widest">
                                {processing === plan.id ? 'Processing...' : `Get ${plan.name}`}
                            </button>
                         </div>
                    ))}
                </div>
                <div className="text-center mt-10">
                    <button onClick={onClose} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition">Maybe later</button>
                </div>
            </div>
        </div>
    );
};

// --- Auth Page ---
const AuthPage: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const user = await storageService.login(email, password, isRegister ? name : undefined);
        onLogin(user);
    } catch (err: any) {
        setError(err.message || 'Authentication failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md animate-fade-in-up border-8 border-slate-800">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30 ring-4 ring-blue-50">
                <Icons.Sparkles size={32} />
            </div>
        </div>
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 tracking-tighter">DigiCard.</h1>
        <p className="text-slate-400 text-center mb-10 font-bold text-sm tracking-tight">Your premium digital networking tool.</p>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl border border-red-100 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
             <div className="relative group">
                <Icons.Sparkles size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                <input required type="text" placeholder="Full Name" className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-sm" value={name} onChange={e => setName(e.target.value)} />
             </div>
          )}
          <div className="relative group">
            <Icons.Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input required type="email" placeholder="Email Address" className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-sm" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="relative group">
            <Icons.Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input required type="password" placeholder="Password" className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-sm" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/40 active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-widest text-xs">
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>

        <div className="mt-10 text-center">
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-xs text-slate-400 font-black uppercase tracking-widest hover:text-blue-600 transition">
                {isRegister ? 'Already have an account? Login' : 'New user? Create account'}
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard ---
const Dashboard: React.FC<{ user: User, onLogout: () => void, onUpgrade: (u: User) => void }> = ({ user, onLogout, onUpgrade }) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [showPricing, setShowPricing] = useState(false);
  useEffect(() => { storageService.getCards(user.id).then(setCards); }, [user.id]);
  const handleDelete = async (id: string) => { if (confirm('Delete this card?')) { await storageService.deleteCard(id); setCards(cards.filter(c => c.id !== id)); } };
  
  const isPro = user.subscription !== 'free';
  const isLifetime = user.subscription === 'pro_lifetime';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <PricingModal user={user} isOpen={showPricing} onClose={() => setShowPricing(false)} onUpgrade={onUpgrade} />
      <nav className="bg-white border-b px-10 py-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tighter text-slate-900">DigiCard.</h1>
            {isLifetime && <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20">Pro Lifetime</span>}
        </div>
        <div className="flex items-center gap-8 font-bold">
            {!isPro && <button onClick={() => setShowPricing(true)} className="text-[10px] bg-yellow-400 px-6 py-2.5 rounded-full hover:bg-yellow-500 transition shadow-lg shadow-yellow-400/20 uppercase tracking-widest font-black text-slate-900">Get Pro</button>}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-600/20">{user.name.charAt(0)}</div>
                <div className="flex flex-col">
                    <span className="text-sm text-slate-900 font-black leading-none">{user.name}</span>
                    <span className="text-[9px] text-slate-400 font-black uppercase mt-1 tracking-widest">{user.subscription}</span>
                </div>
            </div>
            <button onClick={onLogout} className="text-[10px] text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition font-black uppercase tracking-widest">Logout</button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-12">
        <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Digital Assets</h2>
            <Link to="/editor/new" className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all active:scale-95 text-xs uppercase tracking-widest scale-105">Create New Card</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {cards.map(c => (
                <div key={c.id} className="bg-white rounded-[4rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl transition-all group animate-fade-in-up">
                    <div className="h-48 bg-slate-50 rounded-[3rem] relative mb-12 overflow-hidden ring-1 ring-slate-100 shadow-inner">
                        <div className="absolute inset-0 opacity-20" style={{backgroundColor: c.primaryColor}}></div>
                        <img src={c.profileImage} className="w-28 h-28 rounded-[2rem] border-[6px] border-white absolute -bottom-6 left-8 object-cover shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-sm text-slate-900 font-black text-[9px] uppercase tracking-widest border border-white/50">{c.templateId}</div>
                    </div>
                    <h3 className="font-black text-2xl mb-1 text-slate-900 tracking-tight">{c.fullName}</h3>
                    <p className="text-slate-400 font-black text-[10px] mb-12 uppercase tracking-widest leading-none">{c.jobTitle}</p>
                    <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                        <div className="flex gap-4">
                             <a href={`#/card/${c.id}`} target="_blank" className="p-4 bg-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition shadow-sm hover:shadow-lg"><Icons.ExternalLink size={20}/></a>
                             <Link to={`/editor/${c.id}`} className="p-4 bg-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition shadow-sm hover:shadow-lg"><Icons.Edit size={20}/></Link>
                        </div>
                        <button onClick={() => handleDelete(c.id)} className="p-4 bg-red-50 rounded-2xl text-red-200 hover:text-red-500 transition hover:shadow-lg"><Icons.Trash size={20}/></button>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};

// --- Editor ---
const Editor: React.FC<{ user: User, onUpgrade: (u: User) => void }> = ({ user, onUpgrade }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [card, setCard] = useState<CardData>({ ...DEFAULT_CARD, userId: user.id });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showPricing, setShowPricing] = useState(false);

    useEffect(() => {
        if (id && id !== 'new') {
            storageService.getCardById(id).then(c => {
                if (c) setCard({ ...DEFAULT_CARD, ...c, sectionOrder: c.sectionOrder || DEFAULT_CARD.sectionOrder, gallery: c.gallery || [], tags: c.tags || [], services: c.services || [], businessHours: c.businessHours || DEFAULT_CARD.businessHours });
                setLoading(false);
            });
        } else { setLoading(false); }
    }, [id]);

    const handleSave = async () => { setSaving(true); await storageService.saveCard(card); setSaving(false); navigate('/'); };
    const handleAiBio = async () => { 
        setAiLoading(true); 
        try { 
            const bio = await generateBio(card.fullName, card.jobTitle, card.companyName); 
            setCard({ ...card, aboutText: bio, bio: bio }); 
        } catch(e) {} 
        setAiLoading(false); 
    };
    
    const isPro = user.subscription !== 'free';

    const allTemplates: TemplateId[] = [
      'venura', 'minimal', 'modern', 'dark', 'professional', 'creative', 
      'elegant', 'tech', 'gradient', 'glass', 'playful',
      'neobrutalist', 'monochrome', 'softui', 'luxe', 'cyberpunk',
      'retro', 'botanical', 'compact', 'insta', 'terminal'
    ];

    const addService = () => {
        const newService: Service = { id: 's' + Date.now(), title: '', description: '', price: '' };
        setCard({ ...card, services: [...(card.services || []), newService] });
    };

    const removeService = (sId: string) => {
        setCard({ ...card, services: (card.services || []).filter(s => s.id !== sId) });
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const base64 = await resizeImage(e.target.files[0], 600);
            setCard({ ...card, gallery: [...(card.gallery || []), base64] });
        }
    };

    const removeGalleryImage = (idx: number) => {
        setCard({ ...card, gallery: (card.gallery || []).filter((_, i) => i !== idx) });
    };

    const addTag = (tag: string) => {
        if (tag.trim() && !(card.tags || []).includes(tag.trim())) {
            setCard({ ...card, tags: [...(card.tags || []), tag.trim()] });
        }
    };

    const removeTag = (idx: number) => {
        setCard({ ...card, tags: (card.tags || []).filter((_, i) => i !== idx) });
    };

    const updateHour = (hId: string, field: keyof BusinessHour, value: any) => {
        setCard({ ...card, businessHours: (card.businessHours || DEFAULT_CARD.businessHours).map(h => h.id === hId ? { ...h, [field]: value } : h) });
    };

    const updateSocial = (field: keyof typeof card.socials, value: string) => {
        setCard({ ...card, socials: { ...card.socials, [field]: value } });
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...card.sectionOrder];
        if (direction === 'up' && index > 0) [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        if (direction === 'down' && index < newOrder.length - 1) [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setCard({ ...card, sectionOrder: newOrder });
    };

    const cardUrl = window.location.origin + '/#/card/' + (card.id || 'preview');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(cardUrl)}`;

    if (loading) return null;

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            <PricingModal user={user} isOpen={showPricing} onClose={() => setShowPricing(false)} onUpgrade={onUpgrade} />
            
            <div className="w-full md:w-[600px] border-r flex flex-col shadow-2xl z-50 bg-white">
                <div className="p-8 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                    <Link to="/" className="text-slate-400 font-black text-2xl tracking-tighter">DigiCard.</Link>
                    <div className="flex gap-4">
                        <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black shadow-xl shadow-blue-600/30 hover:scale-105 transition-all uppercase tracking-widest">{saving ? 'Saving...' : 'Save Card'}</button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-12 space-y-16 no-scrollbar pb-32">
                    {/* Share Section */}
                    <section className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 flex flex-col items-center gap-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] self-start">Card Sharing</h3>
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-200">
                             <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
                        </div>
                        <div className="w-full space-y-4">
                             <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-2xl">
                                <span className="flex-1 text-[10px] font-bold text-slate-400 truncate">{cardUrl}</span>
                                <button onClick={() => { navigator.clipboard.writeText(cardUrl); alert('URL Copied!'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Icons.Copy size={16}/></button>
                             </div>
                        </div>
                    </section>

                    {/* Template Picker */}
                    <section className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Visual Style</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {allTemplates.map(t => {
                                const locked = PREMIUM_TEMPLATES.includes(t) && !isPro;
                                return (
                                    <button 
                                        key={t} 
                                        onClick={() => { if (locked) setShowPricing(true); else setCard({ ...card, templateId: t }); }} 
                                        className={`py-4 px-3 border-2 rounded-2xl text-[10px] font-black capitalize transition-all relative flex items-center justify-center gap-2 ${card.templateId === t ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg' : 'border-slate-50 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        {locked && <Icons.Lock size={12} className="text-amber-500" />}
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Features Toggle */}
                    <section className="space-y-6 border-t pt-10">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Features</h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Show QR Code Button</span>
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-blue-600" 
                                    checked={card.showQrCode} 
                                    onChange={e => setCard({...card, showQrCode: e.target.checked})} 
                                />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Show Google Map</span>
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-blue-600" 
                                    checked={card.showMap} 
                                    onChange={e => setCard({...card, showMap: e.target.checked})} 
                                />
                            </label>
                        </div>
                    </section>

                    {/* Basic Identity Info */}
                    <section className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Personal Information</h3>
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <img src={card.profileImage} className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white shadow-xl group-hover:scale-105 transition-all" />
                                    <label className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-all">
                                        <Icons.Edit size={20} />
                                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => { if(e.target.files?.[0]) setCard({...card, profileImage: await resizeImage(e.target.files[0])}) }} />
                                    </label>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <input placeholder="Full Name" className="w-full bg-slate-50 py-3 px-5 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none font-black text-sm transition-all" value={card.fullName} onChange={e => setCard({...card, fullName: e.target.value})} />
                                    <input placeholder="Position / Title" className="w-full bg-slate-50 py-3 px-5 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-xs transition-all" value={card.jobTitle} onChange={e => setCard({...card, jobTitle: e.target.value})} />
                                </div>
                            </div>
                            <input placeholder="Company Name" className="w-full bg-slate-50 py-3 px-5 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-xs transition-all" value={card.companyName} onChange={e => setCard({...card, companyName: e.target.value})} />
                        </div>
                    </section>

                    {/* Direct Contact */}
                    <section className="space-y-6 border-t pt-10">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Direct Contact</h3>
                        <div className="space-y-4">
                            <div className="relative group">
                                <Icons.Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    placeholder="Mobile Number" 
                                    className="w-full pl-12 pr-5 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-sm transition-all" 
                                    value={card.socials.phone || ''} 
                                    onChange={e => updateSocial('phone', e.target.value)} 
                                />
                            </div>
                            <div className="relative group">
                                <Icons.Whatsapp size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-600 transition-colors" />
                                <input 
                                    placeholder="WhatsApp Number" 
                                    className="w-full pl-12 pr-5 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-sm transition-all" 
                                    value={card.socials.whatsapp || ''} 
                                    onChange={e => updateSocial('whatsapp', e.target.value)} 
                                />
                            </div>
                            <div className="relative group">
                                <Icons.Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                                <input 
                                    placeholder="Email Address" 
                                    className="w-full pl-12 pr-5 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-sm transition-all" 
                                    value={card.socials.email || ''} 
                                    onChange={e => updateSocial('email', e.target.value)} 
                                />
                            </div>
                        </div>
                    </section>

                    {/* Social Suite */}
                    <section className="space-y-6 border-t pt-10">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Social Suite</h3>
                        <div className="space-y-4">
                            {[
                                { key: 'linkedin', icon: Icons.Linkedin, label: 'LinkedIn URL', color: 'text-blue-700' },
                                { key: 'facebook', icon: Icons.Facebook, label: 'Facebook URL', color: 'text-blue-600' },
                                { key: 'twitter', icon: Icons.Twitter, label: 'Twitter (X) URL', color: 'text-slate-900' },
                                { key: 'instagram', icon: Icons.Instagram, label: 'Instagram URL', color: 'text-pink-600' },
                                { key: 'youtube', icon: Icons.Youtube, label: 'YouTube URL', color: 'text-red-600' },
                            ].map((social) => (
                                <div key={social.key} className="relative group">
                                    <social.icon size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:${social.color} transition-colors`} />
                                    <input 
                                        placeholder={social.label} 
                                        className="w-full pl-12 pr-5 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-xs transition-all" 
                                        value={(card.socials as any)[social.key] || ''} 
                                        onChange={e => updateSocial(social.key as any, e.target.value)} 
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* About Section Editor */}
                    <section className="space-y-6 border-t pt-10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">About Section</h3>
                            <button onClick={handleAiBio} disabled={aiLoading} className="flex items-center gap-2 text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-full transition-all">
                                <Icons.Sparkles size={14} className={aiLoading ? 'animate-spin' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{aiLoading ? 'Writing...' : 'AI Generate Bio'}</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input 
                                placeholder="Section Header" 
                                className="w-full bg-slate-50 py-3 px-5 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none font-black text-sm transition-all" 
                                value={card.aboutTitle || ''} 
                                onChange={e => setCard({...card, aboutTitle: e.target.value})} 
                            />
                            <textarea 
                                placeholder="Summary text..." 
                                rows={6} 
                                className="w-full bg-slate-50 py-4 px-5 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none font-medium text-sm transition-all resize-none" 
                                value={card.aboutText || ''} 
                                onChange={e => setCard({...card, aboutText: e.target.value, bio: e.target.value})} 
                            />
                        </div>
                    </section>

                    {/* Business Hours Editor */}
                    <section className="space-y-6 border-t pt-10">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Business Hours</h3>
                        <div className="space-y-4">
                            {(card.businessHours || DEFAULT_CARD.businessHours).map((h) => (
                                <div key={h.id} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                                    <div className="w-24">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{h.day}</span>
                                    </div>
                                    {!h.isClosed ? (
                                        <div className="flex-1 flex items-center gap-2">
                                            <input type="time" className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold" value={h.open} onChange={e => updateHour(h.id, 'open', e.target.value)} />
                                            <span className="text-[10px] font-bold text-slate-300">-</span>
                                            <input type="time" className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold" value={h.close} onChange={e => updateHour(h.id, 'close', e.target.value)} />
                                        </div>
                                    ) : (
                                        <div className="flex-1">
                                            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest px-4">Closed</span>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => updateHour(h.id, 'isClosed', !h.isClosed)}
                                        className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${h.isClosed ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}
                                    >
                                        {h.isClosed ? 'Open' : 'Close'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Services section */}
                    <section className="space-y-6 border-t pt-10">
                         <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Our Services</h3>
                            <button onClick={addService} className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                                Add Service
                            </button>
                         </div>
                         <div className="space-y-4">
                            {(card.services || []).map((s) => (
                                <div key={s.id} className="p-6 bg-slate-50 rounded-[2.5rem] space-y-4 relative border border-transparent hover:border-blue-100 transition-all group">
                                    <button onClick={() => removeService(s.id)} className="absolute top-4 right-4 p-2 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        <Icons.Trash size={16} />
                                    </button>
                                    <input placeholder="Title" className="w-full bg-transparent border-b border-slate-200 focus:border-blue-600 pb-2 outline-none font-black text-sm pr-10" value={s.title} onChange={e => setCard({...card, services: card.services.map(si => si.id === s.id ? {...si, title: e.target.value} : si)})} />
                                    <textarea placeholder="Service Description" rows={2} className="w-full bg-transparent outline-none text-xs font-bold text-slate-400 resize-none" value={s.description} onChange={e => setCard({...card, services: card.services.map(si => si.id === s.id ? {...si, description: e.target.value} : si)})} />
                                    <input placeholder="Price Label (e.g. $99.00)" className="w-full bg-white border border-slate-100 px-4 py-2 rounded-xl outline-none font-bold text-[10px] text-slate-600 shadow-sm" value={s.price || ''} onChange={e => setCard({...card, services: card.services.map(si => si.id === s.id ? {...si, price: e.target.value} : si)})} />
                                </div>
                            ))}
                         </div>
                    </section>

                    {/* Image Gallery */}
                    <section className="space-y-6 border-t pt-10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Gallery</h3>
                            <label className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                                Add Photos
                                <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                            </label>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {(card.gallery || []).map((img, i) => (
                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-slate-100">
                                    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={`Gallery ${i}`} />
                                    <button onClick={() => removeGalleryImage(i)} className="absolute top-1.5 right-1.5 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl hover:bg-red-600">
                                        <Icons.Trash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section Reordering */}
                    <section className="space-y-6 border-t pt-10">
                         <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Section Layout</h3>
                         <div className="space-y-2">
                            {card.sectionOrder.map((sid, idx) => (
                                <div key={sid} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100 group">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{idx + 1}.</span>
                                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-600">{sid}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => moveSection(idx, 'up')} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 disabled:opacity-20 hover:text-blue-600 transition-all shadow-sm" disabled={idx === 0}>
                                            <Icons.Plus className="rotate-180" size={14}/>
                                        </button>
                                        <button onClick={() => moveSection(idx, 'down')} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 disabled:opacity-20 hover:text-blue-600 transition-all shadow-sm" disabled={idx === card.sectionOrder.length - 1}>
                                            <Icons.Plus className="rotate-0" size={14}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </section>
                </div>
            </div>

            {/* Desktop Preview */}
            <div className="flex-1 flex items-center justify-center bg-slate-100 p-12 hidden md:flex relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>
                <div className="w-[400px] h-[820px] bg-slate-900 rounded-[5rem] p-5 shadow-2xl ring-[14px] ring-slate-800 relative scale-[0.9] lg:scale-100 transition-all duration-500">
                    <div className="w-full h-full bg-white rounded-[3.5rem] overflow-y-auto no-scrollbar relative shadow-inner">
                        <TemplateRenderer card={card} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [user, setUser] = useState<User | null>(storageService.getUser());
  const handleLogout = () => { storageService.logout(); setUser(null); };
  const handleUpgrade = (u: User) => setUser(u);
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user} onLogout={handleLogout} onUpgrade={handleUpgrade} /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <AuthPage onLogin={setUser} /> : <Navigate to="/" />} />
        <Route path="/editor/:id" element={user ? <Editor user={user} onUpgrade={handleUpgrade} /> : <Navigate to="/login" />} />
        <Route path="/card/:id" element={<PublicCard />} />
      </Routes>
    </HashRouter>
  );
}

const PublicCard: React.FC = () => {
    const { id } = useParams();
    const [card, setCard] = useState<CardData | null>(null);
    useEffect(() => { if (id) storageService.getCardById(id).then(c => setCard(c || null)); }, [id]);
    if (!card) return <div className="min-h-screen flex items-center justify-center font-black tracking-tighter text-4xl animate-pulse text-blue-600">DigiCard.</div>;
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center md:p-12">
        <div className="w-full max-w-md h-screen md:h-[840px] bg-white shadow-2xl md:rounded-[4rem] overflow-hidden overflow-y-auto no-scrollbar border-[10px] border-slate-800">
          <TemplateRenderer card={card} />
        </div>
      </div>
    );
}
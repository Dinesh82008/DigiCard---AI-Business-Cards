
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
        const updatedUser = await storageService.upgradeUser(plan.id === 'pro_lifetime' ? 'pro_lifetime' : 'pro_monthly');
        onUpgrade(updatedUser);
        onClose();
        setProcessing(null);
    };
    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-10 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black mb-4 tracking-tight">Choose Your Plan</h2>
                    <p className="text-gray-500">Unlock all 20 premium templates and advanced networking tools.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {plans.map((plan) => (
                         <div key={plan.id} className={`border-2 rounded-[2.5rem] p-8 flex flex-col items-center transition-all ${plan.isPopular ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-100 hover:border-blue-200'}`}>
                            {plan.isPopular && <span className="bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest shadow-lg shadow-blue-600/20">Most Popular</span>}
                            <h3 className="font-black text-2xl mb-2">{plan.name}</h3>
                            <div className="text-4xl font-black mb-8">₹{plan.price}<span className="text-sm font-medium text-gray-400">/{plan.interval === 'lifetime' ? 'once' : 'mo'}</span></div>
                            <ul className="text-sm text-gray-500 mb-10 space-y-4 w-full px-4">
                                {plan.features.map((f, i) => <li key={i} className="flex gap-3 items-center font-medium"><Icons.Check size={16} className="text-blue-600 flex-shrink-0" /> {f}</li>)}
                            </ul>
                            <button onClick={() => handleUpgrade(plan)} disabled={!!processing} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                                {processing === plan.id ? 'Processing...' : `Get ${plan.name}`}
                            </button>
                         </div>
                    ))}
                </div>
                <div className="text-center mt-8">
                    <button onClick={onClose} className="text-gray-400 font-bold hover:text-blue-600 transition">Maybe later</button>
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
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md animate-fade-in-up">
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                <Icons.Sparkles size={32} />
            </div>
        </div>
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 tracking-tight">DigiCard.</h1>
        <p className="text-slate-400 text-center mb-10 font-medium">Create your professional digital presence.</p>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
             <div className="relative group">
                <Icons.Sparkles size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                <input required type="text" placeholder="Full Name" className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold" value={name} onChange={e => setName(e.target.value)} />
             </div>
          )}
          <div className="relative group">
            <Icons.Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input required type="email" placeholder="Email Address" className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="relative group">
            <Icons.Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input required type="password" placeholder="Password" className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/30 active:scale-95 disabled:opacity-50 mt-4">
            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div className="mt-10 text-center">
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-sm text-slate-400 font-bold hover:text-blue-600 transition">
                {isRegister ? 'Already have an account? Sign In' : 'New here? Create an account'}
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
    <div className="min-h-screen bg-slate-50">
      <PricingModal user={user} isOpen={showPricing} onClose={() => setShowPricing(false)} onUpgrade={onUpgrade} />
      <nav className="bg-white border-b px-10 py-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tighter">DigiCard.</h1>
            {isLifetime && <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/20 animate-fade-in-up">Pro Lifetime</span>}
        </div>
        <div className="flex items-center gap-8 font-bold">
            {!isPro && <button onClick={() => setShowPricing(true)} className="text-xs bg-yellow-400 px-6 py-2.5 rounded-full hover:bg-yellow-500 transition shadow-lg shadow-yellow-400/20 uppercase tracking-widest font-black">Upgrade</button>}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-xs">{user.name.charAt(0)}</div>
                <span className="text-sm text-slate-500 hidden md:block">{user.name}</span>
            </div>
            <button onClick={onLogout} className="text-sm text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition">Logout</button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-12">
        <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Cards</h2>
            <Link to="/editor/new" className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black hover:bg-blue-700 shadow-2xl shadow-blue-600/20 transition-all active:scale-95">Create New Card</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {cards.map(c => (
                <div key={c.id} className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl transition-all group animate-fade-in-up">
                    <div className="h-44 bg-slate-50 rounded-[2.5rem] relative mb-12 overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{backgroundColor: c.primaryColor}}></div>
                        <img src={c.profileImage} className="w-28 h-28 rounded-3xl border-4 border-white absolute -bottom-6 left-8 object-cover shadow-2xl group-hover:scale-105 transition-transform" />
                        <div className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm text-slate-900 font-black text-[10px] uppercase tracking-widest">{c.templateId}</div>
                    </div>
                    <h3 className="font-black text-2xl mb-1 text-slate-900">{c.fullName}</h3>
                    <p className="text-slate-400 font-bold text-sm mb-10 uppercase tracking-widest">{c.jobTitle}</p>
                    <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                        <div className="flex gap-3">
                             <a href={`#/card/${c.id}`} target="_blank" className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 transition"><Icons.ExternalLink size={22}/></a>
                             <Link to={`/editor/${c.id}`} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 transition"><Icons.Edit size={22}/></Link>
                        </div>
                        <button onClick={() => handleDelete(c.id)} className="p-4 bg-red-50 rounded-2xl text-red-200 hover:text-red-600 transition"><Icons.Trash size={22}/></button>
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
                if (c) setCard({ ...DEFAULT_CARD, ...c, sectionOrder: c.sectionOrder || DEFAULT_CARD.sectionOrder });
                setLoading(false);
            });
        } else { setLoading(false); }
    }, [id]);

    const handleSave = async () => { setSaving(true); await storageService.saveCard(card); setSaving(false); navigate('/'); };
    const handleAiBio = async () => { setAiLoading(true); try { const bio = await generateBio(card.fullName, card.jobTitle, card.companyName); setCard({ ...card, bio }); } catch(e) {} setAiLoading(false); };
    
    const isPro = user.subscription !== 'free';

    const addService = () => {
        const newService = { id: 's' + Date.now(), title: '', description: '', price: '' };
        setCard({ ...card, services: [...(card.services || []), newService] });
    };

    const removeService = (sId: string) => {
        setCard({ ...card, services: card.services.filter(s => s.id !== sId) });
    };

    const updateHour = (hId: string, field: keyof BusinessHour, value: any) => {
        setCard({ ...card, businessHours: card.businessHours.map(h => h.id === hId ? { ...h, [field]: value } : h) });
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...card.sectionOrder];
        if (direction === 'up' && index > 0) [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        if (direction === 'down' && index < newOrder.length - 1) [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setCard({ ...card, sectionOrder: newOrder });
    };

    if (loading) return null;

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            <PricingModal user={user} isOpen={showPricing} onClose={() => setShowPricing(false)} onUpgrade={onUpgrade} />
            
            <div className="w-full md:w-[600px] border-r flex flex-col shadow-2xl z-10 bg-white">
                <div className="p-8 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                    <Link to="/" className="text-slate-400 font-black text-2xl tracking-tighter">DigiCard.</Link>
                    <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">{saving ? 'Saving...' : 'Save Card'}</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-12 space-y-20 no-scrollbar pb-32">
                    {/* Template Section */}
                    <section className="space-y-8">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Design Templates</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {(['minimal', 'modern', 'dark', 'professional', 'creative', 'elegant', 'tech', 'gradient', 'glass', 'playful', 'cyberpunk', 'neobrutalist', 'luxe', 'terminal', 'insta'] as TemplateId[]).map(t => (
                                <button key={t} onClick={() => { if (PREMIUM_TEMPLATES.includes(t) && !isPro) setShowPricing(true); else setCard({ ...card, templateId: t }); }} className={`py-5 border-2 rounded-3xl text-xs font-black capitalize transition-all relative ${card.templateId === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-50 text-slate-400 hover:border-slate-200'}`}>
                                    {PREMIUM_TEMPLATES.includes(t) && !isPro && <Icons.Lock size={12} className="absolute top-3 right-4 text-yellow-500" />}
                                    {t}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* About Us Manager */}
                    <section className="space-y-8 bg-blue-50/50 p-10 rounded-[3rem] border border-blue-100">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">About Section</h3>
                        <div className="space-y-4">
                            <input placeholder="About Title (e.g. My Story)" className="w-full bg-white border border-blue-100 py-4 px-6 rounded-2xl outline-none font-bold text-sm" value={card.aboutTitle} onChange={e => setCard({...card, aboutTitle: e.target.value})} />
                            <textarea placeholder="Write a professional background or company story..." rows={5} className="w-full bg-white border border-blue-100 p-6 rounded-[2.5rem] text-sm font-bold resize-none" value={card.aboutText} onChange={e => setCard({...card, aboutText: e.target.value})} />
                        </div>
                    </section>

                    {/* Services Manager */}
                    <section className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Service Portfolio</h3>
                            <button onClick={addService} className="text-[10px] font-black bg-blue-600 text-white px-4 py-2 rounded-full uppercase tracking-widest">Add Item</button>
                        </div>
                        <div className="space-y-6">
                            {card.services?.map((s) => (
                                <div key={s.id} className="p-8 bg-slate-50 rounded-[2.5rem] space-y-4 relative border border-transparent hover:border-blue-100 transition-all group">
                                    <button onClick={() => removeService(s.id)} className="absolute top-6 right-6 text-red-200 hover:text-red-500 transition"><Icons.Trash size={18} /></button>
                                    <input placeholder="Service Title" className="w-full bg-transparent border-b-2 border-slate-200 focus:border-blue-600 pb-2 outline-none font-black text-sm" value={s.title} onChange={e => setCard({...card, services: card.services.map(si => si.id === s.id ? {...si, title: e.target.value} : si)})} />
                                    <textarea placeholder="Service description..." rows={2} className="w-full bg-transparent outline-none text-xs font-bold text-slate-400 resize-none" value={s.description} onChange={e => setCard({...card, services: card.services.map(si => si.id === s.id ? {...si, description: e.target.value} : si)})} />
                                    <input placeholder="Price (e.g. ₹5,000)" className="w-full bg-white border border-slate-100 px-4 py-2 rounded-xl outline-none font-bold text-[10px] text-slate-600" value={s.price || ''} onChange={e => setCard({...card, services: card.services.map(si => si.id === s.id ? {...si, price: e.target.value} : si)})} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Hours Manager */}
                    <section className="space-y-8">
                         <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Business Hours</h3>
                         <div className="space-y-3">
                             {card.businessHours.map(h => (
                                 <div key={h.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                     <span className="text-xs font-black text-slate-700 w-24 uppercase tracking-tighter">{h.day}</span>
                                     <div className="flex-1 flex items-center justify-end gap-3">
                                         {!h.isClosed ? (
                                             <div className="flex items-center gap-2">
                                                 <input type="time" className="bg-white border rounded-lg px-2 py-1 text-[10px] font-black" value={h.open} onChange={e => updateHour(h.id, 'open', e.target.value)} />
                                                 <span className="text-slate-300">-</span>
                                                 <input type="time" className="bg-white border rounded-lg px-2 py-1 text-[10px] font-black" value={h.close} onChange={e => updateHour(h.id, 'close', e.target.value)} />
                                             </div>
                                         ) : <span className="text-[10px] font-black text-red-400 uppercase italic">Closed</span>}
                                         <label className="flex items-center gap-2 cursor-pointer ml-4">
                                            <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" checked={h.isClosed} onChange={e => updateHour(h.id, 'isClosed', e.target.checked)} />
                                            <span className="text-[9px] font-black text-slate-400 uppercase">OFF</span>
                                         </label>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </section>

                    {/* Section Order Management */}
                    <section className="space-y-8 bg-slate-900 p-10 rounded-[3rem] text-white">
                        <div className="flex justify-between items-center">
                             <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Section Manager</h3>
                             <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                <span className="text-[9px] font-black text-slate-400 uppercase">Show Map</span>
                                <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" checked={card.showMap} onChange={e => setCard({...card, showMap: e.target.checked})} />
                            </label>
                        </div>
                        <p className="text-xs text-slate-400 font-bold">Rearrange sections to control the flow of your card.</p>
                        <div className="space-y-3">
                            {card.sectionOrder.map((sid, idx) => (
                                <div key={sid} className="bg-slate-800 p-5 rounded-3xl flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center font-black text-[10px] text-slate-400">{idx + 1}</div>
                                        <span className="font-black text-xs uppercase tracking-widest">{sid}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => moveSection(idx, 'up')} className="p-2 bg-slate-700 rounded-xl hover:bg-blue-600 transition disabled:opacity-20" disabled={idx === 0}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 15l-6-6-6 6"/></svg></button>
                                        <button onClick={() => moveSection(idx, 'down')} className="p-2 bg-slate-700 rounded-xl hover:bg-blue-600 transition disabled:opacity-20" disabled={idx === card.sectionOrder.length - 1}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 9l6 6 6-6"/></svg></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 flex items-center justify-center bg-slate-100 p-20 hidden md:flex relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>
                <div className="w-[440px] h-[880px] bg-slate-900 rounded-[4.5rem] p-5 shadow-2xl ring-[15px] ring-slate-800 relative scale-[0.85] lg:scale-100 transition-all duration-500">
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
        <div className="w-full max-w-md h-screen md:h-[880px] bg-white shadow-2xl md:rounded-[4rem] overflow-hidden overflow-y-auto no-scrollbar border-8 border-slate-800">
          <TemplateRenderer card={card} />
        </div>
      </div>
    );
};

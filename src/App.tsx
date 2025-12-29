
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

    useEffect(() => {
        storageService.getPlans().then(setPlans);
    }, []);

    if (!isOpen) return null;

    const handleRazorpay = (plan: Plan) => {
        setProcessing(plan.id);

        if (!(window as any).Razorpay) {
            alert("Payment gateway failed to load. Please check your internet connection.");
            setProcessing(null);
            return;
        }

        const options = {
            key: process.env.RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag", 
            amount: plan.price * 100,
            currency: "INR",
            name: "DigiCard Pro",
            description: plan.name,
            image: "https://cdn-icons-png.flaticon.com/512/2885/2885430.png",
            handler: async function (response: any) {
                try {
                    const updatedUser = await storageService.upgradeUser(plan.interval === 'monthly' ? 'pro_monthly' : 'pro_lifetime');
                    onUpgrade(updatedUser);
                    onClose();
                    alert(`Payment Successful!`);
                } catch (error) {
                    alert('Subscription update failed. Please contact support.');
                } finally {
                    setProcessing(null);
                }
            },
            prefill: {
                name: user.name,
                email: user.email,
            },
            notes: {
                planId: plan.id,
                userId: user.id
            },
            theme: {
                color: "#2563EB"
            },
            modal: {
                ondismiss: () => setProcessing(null)
            }
        };

        try {
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any){
                alert(`Payment Failed: ${response.error.description}`);
                setProcessing(null);
            });
            rzp.open();
        } catch (e) {
            console.error(e);
            alert("Could not open payment gateway.");
            setProcessing(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                            <Icons.Crown className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Upgrade to Digi Pro</h2>
                        <p className="text-gray-500 max-w-lg mx-auto text-lg">
                            Take your professional presence to the next level with exclusive tools and designs.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {plans.map((plan) => (
                             <div key={plan.id} className={`border rounded-2xl p-8 flex flex-col relative ${plan.isPopular ? 'border-2 border-blue-600 bg-blue-50/50 shadow-xl' : 'border-gray-200 bg-white hover:border-blue-500 hover:shadow-lg transition'}`}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-1/2 md:right-8 transform translate-x-1/2 md:translate-x-0 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                        MOST POPULAR
                                    </div>
                                )}
                                
                                <div className="mb-6">
                                    <h3 className={`font-semibold text-sm uppercase tracking-wider mb-2 ${plan.isPopular ? 'text-blue-600' : 'text-gray-500'}`}>{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                                        <span className="text-gray-500 font-medium">/{plan.interval === 'lifetime' ? 'once' : 'mo'}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{plan.interval === 'lifetime' ? 'One-time payment' : 'Billed monthly'}</p>
                                </div>
                                
                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={`mt-1 p-1 rounded-full ${plan.isPopular ? 'bg-blue-100' : 'bg-green-100'}`}>
                                                <Icons.Check className={`w-3 h-3 ${plan.isPopular ? 'text-blue-600' : 'text-green-600'}`} />
                                            </div>
                                            <span className="text-sm text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    onClick={() => handleRazorpay(plan)}
                                    disabled={!!processing}
                                    className={`w-full py-3.5 px-4 font-bold rounded-xl transition disabled:opacity-50 ${plan.isPopular ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transform' : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'}`}
                                >
                                    {processing === plan.id ? 'Processing...' : `Select ${plan.name}`}
                                </button>
                             </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 hover:underline transition">
                            Maybe later, I'll stick to the free plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Admin Panel ---
const AdminPanel: React.FC<{ user: User }> = ({ user }) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    useEffect(() => {
        storageService.getPlans().then(setPlans);
    }, []);

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlan) {
            await storageService.savePlan(editingPlan);
            setPlans(await storageService.getPlans());
            setEditingPlan(null);
        }
    };

    const handleDeletePlan = async (id: string) => {
        if(confirm("Are you sure?")) {
            await storageService.deletePlan(id);
            setPlans(await storageService.getPlans());
        }
    };

    const handleFeatureChange = (index: number, value: string) => {
        if (!editingPlan) return;
        const newFeatures = [...editingPlan.features];
        newFeatures[index] = value;
        setEditingPlan({ ...editingPlan, features: newFeatures });
    };

    const addFeature = () => {
         if (!editingPlan) return;
         setEditingPlan({ ...editingPlan, features: [...editingPlan.features, ""] });
    };

    const removeFeature = (index: number) => {
        if (!editingPlan) return;
        setEditingPlan({ ...editingPlan, features: editingPlan.features.filter((_, i) => i !== index) });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
             <div className="max-w-4xl mx-auto">
                 <div className="flex justify-between items-center mb-8">
                     <h1 className="text-2xl font-bold">Admin: Manage Plans</h1>
                     <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
                 </div>

                 {editingPlan ? (
                     <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                         <h2 className="text-lg font-bold mb-4">{editingPlan.id.startsWith('new') ? 'Create Plan' : 'Edit Plan'}</h2>
                         <form onSubmit={handleSavePlan} className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-sm font-medium">Plan Name</label>
                                     <input className="w-full border rounded p-2" value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} required />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium">Price (INR)</label>
                                     <input type="number" className="w-full border rounded p-2" value={editingPlan.price} onChange={e => setEditingPlan({...editingPlan, price: Number(e.target.value)})} required />
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium">Interval</label>
                                 <select className="w-full border rounded p-2" value={editingPlan.interval} onChange={e => setEditingPlan({...editingPlan, interval: e.target.value as any})}>
                                     <option value="monthly">Monthly</option>
                                     <option value="lifetime">Lifetime</option>
                                 </select>
                             </div>
                             
                             <div>
                                 <label className="block text-sm font-medium mb-2">Features</label>
                                 <div className="space-y-2">
                                     {editingPlan.features.map((f, i) => (
                                         <div key={i} className="flex gap-2">
                                             <input className="flex-1 border rounded p-1" value={f} onChange={e => handleFeatureChange(i, e.target.value)} />
                                             <button type="button" onClick={() => removeFeature(i)} className="text-red-500"><Icons.Trash size={16}/></button>
                                         </div>
                                     ))}
                                     <button type="button" onClick={addFeature} className="text-sm text-blue-600">+ Add Feature</button>
                                 </div>
                             </div>

                             <div className="flex items-center gap-2">
                                 <input type="checkbox" checked={editingPlan.isPopular} onChange={e => setEditingPlan({...editingPlan, isPopular: e.target.checked})} />
                                 <label className="text-sm">Mark as Popular</label>
                             </div>

                             <div className="flex gap-2">
                                 <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save Plan</button>
                                 <button type="button" onClick={() => setEditingPlan(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
                             </div>
                         </form>
                     </div>
                 ) : (
                     <div className="bg-white rounded-xl shadow overflow-hidden">
                         <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                             <h3 className="font-bold">Existing Plans</h3>
                             <button 
                                onClick={() => setEditingPlan({ id: 'new_' + Date.now(), name: '', price: 0, interval: 'monthly', features: [''], isPopular: false })}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                             >
                                 + Add Plan
                             </button>
                         </div>
                         <table className="w-full text-left border-collapse">
                             <thead>
                                 <tr className="bg-gray-100 text-sm text-gray-600">
                                     <th className="p-3">Name</th>
                                     <th className="p-3">Price</th>
                                     <th className="p-3">Type</th>
                                     <th className="p-3 text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {plans.map(p => (
                                     <tr key={p.id} className="border-t">
                                         <td className="p-3 font-medium">{p.name} {p.isPopular && <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Popular</span>}</td>
                                         <td className="p-3">₹{p.price}</td>
                                         <td className="p-3 capitalize">{p.interval}</td>
                                         <td className="p-3 text-right space-x-2">
                                             <button onClick={() => setEditingPlan(p)} className="text-blue-600 hover:underline text-sm">Edit</button>
                                             <button onClick={() => handleDeletePlan(p.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 )}
             </div>
        </div>
    );
}

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
    } catch (e: any) {
        setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">DigiCard</h1>
            <p className="text-gray-500">Create your digital identity in seconds.</p>
        </div>
        {error && <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                required
                type="text" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={e => setName(e.target.value)}
                />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              required
              type="email" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              required
              type="password" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Log In')}
          </button>
        </form>
        <div className="mt-4 text-center">
            <button 
                onClick={() => setIsRegister(!isRegister)} 
                className="text-sm text-blue-600 hover:underline"
            >
                {isRegister ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
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
  const [qrCard, setQrCard] = useState<CardData | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  useEffect(() => {
    storageService.getCards(user.id).then(setCards);
  }, [user.id]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this card?')) {
        await storageService.deleteCard(id);
        setCards(cards.filter(c => c.id !== id));
    }
  };

  const handleShare = async (card: CardData) => {
    const url = `${window.location.origin}${window.location.pathname}#/card/${card.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.fullName,
          text: `Check out my digital business card: ${card.jobTitle} at ${card.companyName}`,
          url: url,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
            copyToClipboard(url, card.id);
        }
      }
    } else {
      copyToClipboard(url, card.id);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  const isPro = user.subscription !== 'free';

  return (
    <div className="min-h-screen bg-gray-50">
      <PricingModal user={user} isOpen={showPricing} onClose={() => setShowPricing(false)} onUpgrade={onUpgrade} />
      
      {/* QR Modal */}
      {qrCard && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => setQrCard(null)}>
            <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setQrCard(null)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"
                >
                    <Icons.X size={24} />
                </button>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Scan QR Code</h3>
                <p className="text-sm text-gray-500 mb-6 truncate px-4">{qrCard.fullName}</p>
                
                <div className="bg-white p-3 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-6">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}#/card/${qrCard.id}`)}`} 
                        alt="QR Code" 
                        className="w-48 h-48" 
                    />
                </div>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => {
                            const url = `${window.location.origin}${window.location.pathname}#/card/${qrCard.id}`;
                            copyToClipboard(url, qrCard.id);
                        }}
                        className="w-full py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2"
                    >
                        {copyingId === qrCard.id ? <Icons.Check size={16} className="text-green-500" /> : <Icons.Copy size={16} />} 
                        {copyingId === qrCard.id ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button 
                        onClick={() => setQrCard(null)}
                        className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
      )}

      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1 rounded">
                <Icons.Sparkles size={16} />
            </div>
            <h1 className="text-xl font-bold text-gray-800">DigiCard</h1>
            {isPro && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-yellow-200">
                    <Icons.Crown size={12}/> PRO
                </span>
            )}
        </div>
        <div className="flex items-center gap-4">
            {user.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600">Admin Panel</Link>
            )}
            {!isPro && (
                <button 
                    onClick={() => setShowPricing(true)}
                    className="hidden sm:flex text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-medium hover:shadow-lg transition items-center gap-1"
                >
                    <Icons.Crown size={14}/> Upgrade
                </button>
            )}
            <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user.name}</span>
            <button onClick={onLogout} className="text-sm text-red-600 hover:text-red-800 font-medium">Logout</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {/* Banner for Free Users */}
        {!isPro && (
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-6 text-white mb-8 flex justify-between items-center shadow-lg">
                <div>
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Icons.Crown className="text-yellow-400" /> Upgrade to Digi Pro</h3>
                    <p className="text-blue-100 text-sm">Unlock premium templates and features starting at just ₹30/month.</p>
                </div>
                <button 
                    onClick={() => setShowPricing(true)}
                    className="bg-white text-blue-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition whitespace-nowrap"
                >
                    View Plans
                </button>
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Your Cards</h2>
            <Link to="/editor/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                <Icons.Plus size={18} />
                Create New Card
            </Link>
        </div>

        {cards.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                <h3 className="text-lg font-medium text-gray-900">No cards yet</h3>
                <p className="text-gray-500 mb-4">Create your first digital business card to get started.</p>
                <Link to="/editor/new" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
                    Create Now &rarr;
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(card => (
                    <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                        <div className="h-24 bg-gray-100 relative">
                             <div className="absolute inset-0 opacity-50" style={{backgroundColor: card.primaryColor}}></div>
                             <div className="absolute -bottom-6 left-6">
                                <img src={card.profileImage} className="w-12 h-12 rounded-full border-2 border-white bg-white object-cover" />
                             </div>
                        </div>
                        <div className="pt-8 pb-4 px-6">
                            <h3 className="font-bold text-lg truncate">{card.fullName}</h3>
                            <p className="text-sm text-gray-500 truncate">{card.jobTitle}</p>
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Icons.Eye size={14}/> {card.views || 0} views</span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 border-t flex justify-between items-center">
                            <div className="flex gap-3">
                                <a href={`#/card/${card.id}`} target="_blank" className="text-gray-500 hover:text-blue-600" title="View Live"><Icons.ExternalLink size={18}/></a>
                                <button 
                                    onClick={() => handleShare(card)} 
                                    className={`p-1.5 rounded-lg transition ${copyingId === card.id ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-green-600'}`} 
                                    title="Share Card"
                                >
                                    {copyingId === card.id ? <Icons.Check size={18} /> : <Icons.Share size={18}/>}
                                </button>
                                <button onClick={() => setQrCard(card)} className="text-gray-500 hover:text-purple-600" title="Show QR Code"><Icons.QrCode size={18}/></button>
                            </div>
                            <div className="flex gap-3">
                                <Link to={`/editor/${card.id}`} className="text-gray-500 hover:text-blue-600" title="Edit Card"><Icons.Edit size={18}/></Link>
                                <button onClick={(e) => handleDelete(card.id, e)} className="text-gray-500 hover:text-red-600" title="Delete Card"><Icons.Trash size={18}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
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
    
    // List of all available templates
    const templates: TemplateId[] = ['minimal', 'modern', 'dark', 'professional', 'creative', 'elegant', 'tech', 'gradient', 'glass', 'playful'];

    useEffect(() => {
        if (id && id !== 'new') {
            storageService.getCardById(id).then(c => {
                if (c) {
                    // Ensure we have all days (backfill for existing cards with missing Sat/Sun)
                    let bHours = c.businessHours || DEFAULT_CARD.businessHours;
                    if (bHours.length < 7) {
                        const defaults = DEFAULT_CARD.businessHours;
                        // Add missing days from default (e.g. Saturday, Sunday)
                        bHours = [
                            ...bHours,
                            ...defaults.slice(bHours.length)
                        ];
                    }

                    const mergedCard = {
                        ...DEFAULT_CARD,
                        ...c,
                        services: c.services || [],
                        businessHours: bHours,
                        showMap: c.showMap ?? true,
                        sectionOrder: c.sectionOrder || ['services', 'hours', 'map']
                    };
                    setCard(mergedCard);
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        await storageService.saveCard(card);
        setSaving(false);
        navigate('/');
    };

    const handleAiBio = async () => {
        setAiLoading(true);
        try {
            const bio = await generateBio(card.fullName, card.jobTitle, card.companyName);
            setCard({ ...card, bio });
        } catch (e) {
            alert("Failed to generate bio.");
        }
        setAiLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await resizeImage(e.target.files[0]);
                setCard({ ...card, profileImage: base64 });
            } catch (error) {
                console.error("Error uploading image", error);
                alert("Failed to upload image. Please try another one.");
            }
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await resizeImage(e.target.files[0], 200); 
                setCard({ ...card, logoImage: base64 });
            } catch (error) {
                console.error("Error uploading logo", error);
                alert("Failed to upload logo. Please try another one.");
            }
        }
    };

    // Services CRUD
    const addService = () => {
        const newService: Service = { id: Date.now().toString(), title: '', description: '', price: '' };
        setCard({ ...card, services: [...card.services, newService] });
    };

    const updateService = (id: string, field: keyof Service, value: string) => {
        setCard({
            ...card,
            services: card.services.map(s => s.id === id ? { ...s, [field]: value } : s)
        });
    };

    const removeService = (id: string) => {
        setCard({ ...card, services: card.services.filter(s => s.id !== id) });
    };

    // Hours CRUD
    const updateHour = (id: string, field: keyof BusinessHour, value: any) => {
        setCard({
            ...card,
            businessHours: card.businessHours.map(h => h.id === id ? { ...h, [field]: value } : h)
        });
    };

    const isPro = user.subscription !== 'free';

    const selectTemplate = (t: TemplateId) => {
        if (PREMIUM_TEMPLATES.includes(t) && !isPro) {
            setShowPricing(true);
            return;
        }
        setCard({ ...card, templateId: t });
    };

    // --- Section Sorting Logic ---
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...card.sectionOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setCard({ ...card, sectionOrder: newOrder });
    };

    const sectionLabels: Record<SectionId, string> = {
        services: 'Services',
        hours: 'Office Hours',
        map: 'Map Location'
    };

    if (loading) return <div className="p-10 text-center">Loading editor...</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <PricingModal user={user} isOpen={showPricing} onClose={() => setShowPricing(false)} onUpgrade={onUpgrade} />

            {/* Sidebar Form */}
            <div className="w-full md:w-1/2 lg:w-2/5 bg-white border-r flex flex-col h-full z-10 shadow-xl">
                <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-20">
                    <Link to="/" className="text-gray-500 hover:text-gray-900">&larr; Back</Link>
                    <h2 className="font-bold">Edit Card</h2>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Card'}
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1 p-6 space-y-6 no-scrollbar">
                    {/* Template Selection */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Template & Branding</h3>
                        {!isPro && (
                            <div 
                                onClick={() => setShowPricing(true)}
                                className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4 flex items-center justify-between cursor-pointer hover:bg-yellow-100 transition"
                            >
                                <div className="flex items-center gap-2">
                                    <Icons.Crown className="text-yellow-600 w-4 h-4"/>
                                    <span className="text-xs font-bold text-yellow-800">Unlock 7 Premium Templates</span>
                                </div>
                                <span className="text-xs font-bold text-blue-600">Upgrade &rarr;</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                            {templates.map((t) => {
                                const isPremium = PREMIUM_TEMPLATES.includes(t);
                                const isLocked = isPremium && !isPro;
                                
                                return (
                                    <button
                                        key={t}
                                        onClick={() => selectTemplate(t)}
                                        className={`p-2 rounded-lg border-2 text-sm capitalize transition-all relative ${card.templateId === t ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {isLocked && (
                                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full p-1 shadow-sm">
                                                <Icons.Lock size={10} />
                                            </div>
                                        )}
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                            <div className="flex gap-2">
                                {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#111827', '#db2777'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCard({ ...card, primaryColor: c })}
                                        className={`w-8 h-8 rounded-full border-2 ${card.primaryColor === c ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* Section Layout Order */}
                    <section className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Icons.Briefcase size={14} className="transform rotate-90" />
                            Reorder Sections
                        </h3>
                        <p className="text-xs text-gray-400 mb-3">Click arrows to change display order on your card.</p>
                        <div className="space-y-2">
                            {card.sectionOrder.map((sectionId, index) => (
                                <div key={sectionId} className="bg-white p-2 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
                                    <span className="text-sm font-medium text-gray-700 pl-2">{sectionLabels[sectionId]}</span>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => moveSection(index, 'up')} 
                                            disabled={index === 0}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400 hover:bg-gray-100 rounded"
                                            title="Move Up"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                                        </button>
                                        <button 
                                            onClick={() => moveSection(index, 'down')} 
                                            disabled={index === card.sectionOrder.length - 1}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400 hover:bg-gray-100 rounded"
                                            title="Move Down"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Personal Info */}
                    <section className="space-y-4">
                         <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Personal Details</h3>
                         
                         <div>
                            <label className="block text-sm text-gray-600 mb-2">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                <img src={card.profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover border" />
                                <label className="cursor-pointer bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm">
                                    <span className="text-sm font-medium text-gray-700">Upload Photo</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600">Full Name</label>
                                <input type="text" className="w-full border rounded p-2 text-sm" value={card.fullName} onChange={e => setCard({...card, fullName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">Job Title</label>
                                <input type="text" className="w-full border rounded p-2 text-sm" value={card.jobTitle} onChange={e => setCard({...card, jobTitle: e.target.value})} />
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm text-gray-600">Company</label>
                            <input type="text" className="w-full border rounded p-2 text-sm" value={card.companyName} onChange={e => setCard({...card, companyName: e.target.value})} />
                        </div>
                        
                        <div>
                           <label className="block text-sm text-gray-600 mb-2">Company Logo (Optional)</label>
                           <div className="flex items-center gap-4">
                               {card.logoImage ? (
                                   <div className="relative">
                                       <img src={card.logoImage} alt="Logo" className="w-16 h-16 object-contain border rounded-lg bg-gray-50" />
                                       <button onClick={() => setCard({...card, logoImage: undefined})} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200">
                                           <Icons.Trash size={12}/>
                                       </button>
                                   </div>
                               ) : (
                                   <div className="w-16 h-16 border rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 text-xs text-center">No Logo</div>
                               )}
                               <label className="cursor-pointer bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm">
                                   <span className="text-sm font-medium text-gray-700">Upload Logo</span>
                                   <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </label>
                           </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm text-gray-600">Bio</label>
                                <button 
                                    onClick={handleAiBio} 
                                    disabled={aiLoading}
                                    className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800"
                                >
                                    <Icons.Sparkles size={12}/> {aiLoading ? 'Generating...' : 'AI Generate'}
                                </button>
                            </div>
                            <textarea 
                                className="w-full border rounded p-2 text-sm h-24" 
                                value={card.bio} 
                                onChange={e => setCard({...card, bio: e.target.value})} 
                            />
                        </div>
                    </section>
                    
                    {/* Services Section */}
                    <section className="space-y-4 border-t pt-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Services</h3>
                            <button onClick={addService} className="text-xs text-blue-600 font-bold hover:underline">+ Add Service</button>
                        </div>
                        {card.services.length === 0 && <p className="text-sm text-gray-400 italic">No services added.</p>}
                        <div className="space-y-3">
                            {card.services.map((service) => (
                                <div key={service.id} className="bg-gray-50 p-3 rounded-lg border relative group">
                                    <button 
                                        onClick={() => removeService(service.id)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hidden group-hover:block"
                                    >
                                        <Icons.Trash size={14} />
                                    </button>
                                    <div className="grid gap-2">
                                        <input 
                                            placeholder="Service Title"
                                            className="w-full bg-white border rounded px-2 py-1 text-sm font-medium"
                                            value={service.title}
                                            onChange={e => updateService(service.id, 'title', e.target.value)}
                                        />
                                        <textarea 
                                            placeholder="Description"
                                            className="w-full bg-white border rounded px-2 py-1 text-sm"
                                            rows={2}
                                            value={service.description}
                                            onChange={e => updateService(service.id, 'description', e.target.value)}
                                        />
                                        <input 
                                            placeholder="Price (Optional)"
                                            className="w-full bg-white border rounded px-2 py-1 text-sm"
                                            value={service.price || ''}
                                            onChange={e => updateService(service.id, 'price', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Office Hours Section */}
                    <section className="space-y-4 border-t pt-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Office Hours</h3>
                        <div className="space-y-2">
                            {card.businessHours.map((hour) => (
                                <div key={hour.id} className="flex items-center gap-2 text-sm">
                                    <div className="w-24 font-medium text-gray-700">{hour.day}</div>
                                    <div className="flex-1 flex items-center gap-2">
                                        {hour.isClosed ? (
                                            <span className="text-gray-400 italic">Closed</span>
                                        ) : (
                                            <>
                                                <input 
                                                    type="time" 
                                                    className="border rounded px-1 py-0.5 text-xs"
                                                    value={hour.open}
                                                    onChange={e => updateHour(hour.id, 'open', e.target.value)}
                                                />
                                                <span className="text-gray-400">-</span>
                                                <input 
                                                    type="time" 
                                                    className="border rounded px-1 py-0.5 text-xs"
                                                    value={hour.close}
                                                    onChange={e => updateHour(hour.id, 'close', e.target.value)}
                                                />
                                            </>
                                        )}
                                    </div>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={hour.isClosed} 
                                            onChange={e => updateHour(hour.id, 'isClosed', e.target.checked)}
                                        />
                                        <span className="text-xs text-gray-500">Closed</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </section>

                     {/* Contact & Map Info */}
                     <section className="space-y-4 border-t pt-4 pb-8">
                         <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact & Social</h3>
                         <div>
                            <label className="block text-sm text-gray-600">Email</label>
                            <input type="email" className="w-full border rounded p-2 text-sm" value={card.socials.email || ''} onChange={e => setCard({...card, socials: {...card.socials, email: e.target.value}})} />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm text-gray-600">Phone</label>
                                <input type="tel" className="w-full border rounded p-2 text-sm" value={card.socials.phone || ''} onChange={e => setCard({...card, socials: {...card.socials, phone: e.target.value}})} />
                             </div>
                             <div>
                                <label className="block text-sm text-gray-600">WhatsApp</label>
                                <input type="tel" className="w-full border rounded p-2 text-sm" value={card.socials.whatsapp || ''} onChange={e => setCard({...card, socials: {...card.socials, whatsapp: e.target.value}})} />
                             </div>
                         </div>
                         <div>
                            <label className="block text-sm text-gray-600">Website URL</label>
                            <input type="url" className="w-full border rounded p-2 text-sm" value={card.socials.website || ''} onChange={e => setCard({...card, socials: {...card.socials, website: e.target.value}})} />
                         </div>
                         
                         <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-sm text-gray-700 font-medium mb-1">Google Map Location</label>
                            <input 
                                type="text" 
                                placeholder="Full Address for Map"
                                className="w-full border rounded p-2 text-sm mb-2" 
                                value={card.socials.address || ''} 
                                onChange={e => setCard({...card, socials: {...card.socials, address: e.target.value}})} 
                            />
                            <div className="flex items-center gap-2 mb-2">
                                <input 
                                    type="checkbox" 
                                    id="showMap"
                                    checked={card.showMap}
                                    onChange={e => setCard({...card, showMap: e.target.checked})}
                                />
                                <label htmlFor="showMap" className="text-sm text-gray-600">Show Map Section</label>
                            </div>
                         </div>

                         <div className="pt-2 border-t mt-2">
                             <label className="block text-sm font-medium text-gray-700 mb-2">Social Profiles</label>
                             <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-500">LinkedIn URL</label>
                                    <input type="url" className="w-full border rounded p-2 text-sm" value={card.socials.linkedin || ''} onChange={e => setCard({...card, socials: {...card.socials, linkedin: e.target.value}})} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Facebook URL</label>
                                    <input type="url" className="w-full border rounded p-2 text-sm" value={card.socials.facebook || ''} onChange={e => setCard({...card, socials: {...card.socials, facebook: e.target.value}})} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Instagram URL</label>
                                    <input type="url" className="w-full border rounded p-2 text-sm" value={card.socials.instagram || ''} onChange={e => setCard({...card, socials: {...card.socials, instagram: e.target.value}})} />
                                </div>
                             </div>
                         </div>
                    </section>
                </div>
            </div>

            {/* Preview Area */}
            <div className="hidden md:flex flex-1 bg-gray-200 items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="w-[375px] h-[760px] bg-black rounded-[3rem] p-3 shadow-2xl border-[8px] border-slate-800 relative ring-4 ring-slate-900/10 scale-[0.9] lg:scale-100">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                    <div className="w-full h-full bg-white rounded-[2rem] overflow-y-auto no-scrollbar relative">
                        <TemplateRenderer card={card} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Public Card Viewer ---
const PublicCard: React.FC = () => {
    const { id } = useParams();
    const [card, setCard] = useState<CardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showQr, setShowQr] = useState(false);

    useEffect(() => {
        if (id) {
            storageService.getCardById(id).then(c => {
                setCard(c || null);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!card) return <div className="min-h-screen flex items-center justify-center">Card not found</div>;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;

    return (
        <div>
            <TemplateRenderer card={card} />
            
            {/* Floating Action Button for Sharing */}
            <div className="fixed bottom-6 right-6 z-50">
                 <button 
                    onClick={() => setShowQr(true)}
                    className="bg-black text-white p-4 rounded-full shadow-2xl hover:scale-105 transition flex items-center gap-2"
                 >
                    <Icons.Share className="w-6 h-6" />
                 </button>
            </div>

            {/* QR Modal */}
            {showQr && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => setShowQr(false)}>
                    <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Share this card</h3>
                        <div className="bg-white p-2 rounded-xl border inline-block mb-4">
                            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-sm text-gray-500 mb-6 break-all bg-gray-100 p-2 rounded">{window.location.href}</p>
                        
                        <div className="flex flex-col gap-3">
                            {navigator.share && (
                                <button 
                                    onClick={() => {
                                        navigator.share({
                                            title: card?.fullName || 'Digital Card',
                                            text: 'Check out this digital business card.',
                                            url: window.location.href
                                        }).catch(console.error);
                                    }}
                                    className="w-full py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition text-sm flex items-center justify-center gap-2"
                                >
                                    <Icons.Share size={16} /> Share via...
                                </button>
                            )}
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied!');
                                }}
                                className="w-full py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2"
                            >
                                <Icons.Copy size={16} /> Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App & Routing ---
export default function App() {
  const [user, setUser] = useState<User | null>(storageService.getUser());

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
  };

  const handleUpgrade = (updatedUser: User) => {
      setUser(updatedUser);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
            user ? <Dashboard user={user} onLogout={handleLogout} onUpgrade={handleUpgrade} /> : <Navigate to="/login" />
        } />
        <Route path="/login" element={
            !user ? <AuthPage onLogin={setUser} /> : <Navigate to="/" />
        } />
        <Route path="/admin" element={
            user?.role === 'admin' ? <AdminPanel user={user} /> : <Navigate to="/" />
        } />
        <Route path="/editor/:id" element={
            user ? <Editor user={user} onUpgrade={handleUpgrade} /> : <Navigate to="/login" />
        } />
        <Route path="/card/:id" element={<PublicCard />} />
      </Routes>
    </HashRouter>
  );
}

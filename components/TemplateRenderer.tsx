
import React from 'react';
import { CardData, SocialLinks, SectionId, Service, BusinessHour } from '../types';
import { Icons } from './Icons';

interface TemplateProps {
  card: CardData;
  previewMode?: boolean;
}

// --- Content Block Components ---

const AboutBlock: React.FC<{ card: CardData, darkMode?: boolean }> = ({ card, darkMode }) => {
    if (!card.aboutText) return null;
    return (
        <div className="mb-8 w-full text-left animate-fade-in-up px-2">
            <h3 className={`text-center font-bold uppercase tracking-widest text-[10px] mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {card.aboutTitle || 'About Us'}
            </h3>
            <div className={`p-5 rounded-2xl border leading-relaxed text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-gray-600 shadow-sm'}`}>
                {card.aboutText.split('\n').map((para, i) => (
                    <p key={i} className={i > 0 ? 'mt-3' : ''}>{para}</p>
                ))}
            </div>
        </div>
    );
};

const ServicesBlock: React.FC<{ card: CardData, darkMode?: boolean }> = ({ card, darkMode }) => {
    if (!card.services || card.services.length === 0) return null;
    return (
        <div className="mb-8 w-full text-left animate-fade-in-up px-2">
            <h3 className={`text-center font-bold uppercase tracking-widest text-[10px] mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Our Services</h3>
            <div className="grid gap-3">
                {card.services.map(s => (
                    <div key={s.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.title}</h4>
                            {s.price && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{s.price}</span>}
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{s.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HoursBlock: React.FC<{ card: CardData, darkMode?: boolean }> = ({ card, darkMode }) => {
    if (!card.businessHours || card.businessHours.length === 0) return null;
    const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

    return (
        <div className="mb-8 w-full text-left animate-fade-in-up px-2">
            <h3 className={`text-center font-bold uppercase tracking-widest text-[10px] mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Business Hours</h3>
            <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {card.businessHours.map((h, i) => {
                    const isToday = h.day === currentDay;
                    return (
                        <div key={h.id} className={`flex justify-between items-center p-3 text-[11px] border-b last:border-0 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-gray-600'} ${isToday ? (darkMode ? 'bg-zinc-700 font-bold text-white' : 'bg-blue-50 font-bold text-blue-700') : ''}`}>
                            <span className="font-medium">{h.day}</span>
                            <span>{h.isClosed ? 'Closed' : `${h.open} - ${h.close}`}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MapBlock: React.FC<{ card: CardData, darkMode?: boolean }> = ({ card, darkMode }) => {
    if (!card.showMap || !card.socials.address) return null;
    const encodedAddress = encodeURIComponent(card.socials.address);
    const mapSrc = card.customMapUrl || `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return (
        <div className="mb-8 w-full text-left animate-fade-in-up px-2">
             <h3 className={`text-center font-bold uppercase tracking-widest text-[10px] mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Find Us</h3>
             <div className="w-full h-48 bg-gray-200 rounded-xl overflow-hidden shadow-inner relative">
                 <iframe width="100%" height="100%" src={mapSrc} frameBorder="0" scrolling="no" className="w-full h-full grayscale opacity-80"></iframe>
                 <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur text-[10px] p-2 text-center text-gray-600 font-bold">
                    <Icons.MapPin size={10} className="inline mr-1" /> {card.socials.address}
                 </div>
             </div>
        </div>
    );
};

const DynamicSections: React.FC<{ card: CardData, darkMode?: boolean }> = ({ card, darkMode }) => {
    const order = card.sectionOrder || ['about', 'services', 'hours', 'map'];
    return (
        <div className="w-full">
            {order.map(sectionId => {
                switch(sectionId) {
                    case 'about': return <AboutBlock key="about" card={card} darkMode={darkMode} />;
                    case 'services': return <ServicesBlock key="services" card={card} darkMode={darkMode} />;
                    case 'hours': return <HoursBlock key="hours" card={card} darkMode={darkMode} />;
                    case 'map': return <MapBlock key="map" card={card} darkMode={darkMode} />;
                    default: return null;
                }
            })}
        </div>
    );
};

const SocialButton: React.FC<{ href?: string; icon: React.FC<any>; label: string; color: string; outline?: boolean; className?: string; textColor?: string; }> = ({ href, icon: Icon, label, color, outline, className = "", textColor }) => {
  if (!href) return null;
  const safeHref = href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') ? href : `https://${href}`;
  const style = outline ? { borderColor: color, color: textColor || color } : { backgroundColor: color, color: textColor || '#fff', borderColor: color };
  return (
    <a href={safeHref} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 border-2 ${className}`} style={style}>
      <Icon className="w-5 h-5" />
      <span className="font-bold text-sm">{label}</span>
    </a>
  );
};

const SocialGrid: React.FC<{ card: CardData, darkMode?: boolean }> = ({ card, darkMode }) => {
    return (
        <div className={`mt-6 mb-10 flex gap-5 flex-wrap justify-center ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
            {card.socials.whatsapp && <a href={`https://wa.me/${card.socials.whatsapp.replace(/\D/g, '')}`} className="hover:text-green-500 transition-all hover:scale-110"><Icons.Whatsapp size={24} /></a>}
            {card.socials.linkedin && <a href={card.socials.linkedin} className="hover:text-blue-600 transition-all hover:scale-110"><Icons.Linkedin size={24} /></a>}
            {card.socials.instagram && <a href={card.socials.instagram} className="hover:text-pink-500 transition-all hover:scale-110"><Icons.Instagram size={24} /></a>}
            {card.socials.facebook && <a href={card.socials.facebook} className="hover:text-blue-700 transition-all hover:scale-110"><Icons.Facebook size={24} /></a>}
            {card.socials.youtube && <a href={card.socials.youtube} className="hover:text-red-600 transition-all hover:scale-110"><Icons.Youtube size={24} /></a>}
        </div>
    );
};

// --- 20 TEMPLATES ---

const MinimalTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-white flex flex-col items-center p-8 text-center max-w-md mx-auto shadow-2xl relative animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: card.primaryColor }}></div>
        <img src={card.profileImage} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mt-8" alt={card.fullName} />
        <h1 className="text-2xl font-black text-gray-900 mt-4 mb-1">{card.fullName}</h1>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: card.primaryColor }}>{card.jobTitle}</p>
        <p className="text-gray-400 text-xs mb-8 font-medium">{card.companyName}</p>
        <div className="w-full space-y-3 mb-10 px-4">
            <SocialButton href={card.socials.phone ? `tel:${card.socials.phone}` : undefined} icon={Icons.Phone} label="Call Me" color={card.primaryColor} />
            <SocialButton href={card.socials.email ? `mailto:${card.socials.email}` : undefined} icon={Icons.Mail} label="Email Me" color={card.primaryColor} outline />
        </div>
        <DynamicSections card={card} />
        <SocialGrid card={card} />
    </div>
);

const DarkTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center p-8 text-center max-w-md mx-auto shadow-2xl relative animate-fade-in-up">
        <div className="absolute top-6 right-6 w-3 h-3 rounded-full" style={{ backgroundColor: card.primaryColor }}></div>
        <img src={card.profileImage} className="w-32 h-32 rounded-full object-cover ring-4 ring-zinc-800 mb-8 shadow-2xl" alt={card.fullName} />
        <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 tracking-tighter">{card.fullName}</h1>
        <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] mb-10">{card.jobTitle} | {card.companyName}</p>
        <div className="w-full grid grid-cols-3 gap-3 mb-10">
            <a href={`tel:${card.socials.phone}`} className="flex flex-col items-center gap-2 py-4 bg-zinc-900 rounded-3xl border border-zinc-800 transition shadow-inner"><Icons.Phone className="text-zinc-400" /><span className="text-[10px] font-bold uppercase opacity-30">Call</span></a>
            <a href={`mailto:${card.socials.email}`} className="flex flex-col items-center gap-2 py-4 bg-zinc-900 rounded-3xl border border-zinc-800 transition shadow-inner"><Icons.Mail className="text-zinc-400" /><span className="text-[10px] font-bold uppercase opacity-30">Email</span></a>
            <a href={card.socials.website} target="_blank" className="flex flex-col items-center gap-2 py-4 bg-zinc-900 rounded-3xl border border-zinc-800 transition shadow-inner"><Icons.Globe className="text-zinc-400" /><span className="text-[10px] font-bold uppercase opacity-30">Web</span></a>
        </div>
        <DynamicSections card={card} darkMode />
        <SocialGrid card={card} darkMode />
    </div>
);

const ModernTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${card.bannerImage})` }}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        </div>
        <div className="px-8 -mt-20 flex flex-col items-center pb-12">
            <img src={card.profileImage} className="w-40 h-40 rounded-[2.5rem] object-cover border-[6px] border-white shadow-2xl mb-6" alt={card.fullName} />
            <h1 className="text-3xl font-black text-slate-900 leading-none mb-2 tracking-tight">{card.fullName}</h1>
            <p className="text-slate-500 font-bold text-sm mb-10">{card.jobTitle} • {card.companyName}</p>
            <div className="w-full grid grid-cols-2 gap-4 mb-12">
                 <SocialButton href={card.socials.phone ? `tel:${card.socials.phone}` : undefined} icon={Icons.Phone} label="Call Now" color={card.primaryColor} />
                 <SocialButton href={card.socials.email ? `mailto:${card.socials.email}` : undefined} icon={Icons.Mail} label="Email Me" color="#111" />
            </div>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const ProfessionalTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto shadow-2xl animate-fade-in-up">
        <div className="bg-slate-900 text-white p-10 rounded-b-[4rem] text-center">
            <img src={card.profileImage} className="w-28 h-28 rounded-full mx-auto border-4 border-white/20 mb-6 object-cover" />
            <h1 className="text-3xl font-bold mb-2">{card.fullName}</h1>
            <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-8">{card.jobTitle}</p>
            <div className="flex justify-center gap-4">
                <a href={`tel:${card.socials.phone}`} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition"><Icons.Phone size={24}/></a>
                <a href={`mailto:${card.socials.email}`} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition"><Icons.Mail size={24}/></a>
                <a href={card.socials.website} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition"><Icons.Globe size={24}/></a>
            </div>
        </div>
        <div className="p-8">
            <p className="text-center text-slate-500 mb-10 italic">"{card.bio}"</p>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const CreativeTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-purple-50 p-6 flex flex-col max-w-md mx-auto shadow-2xl animate-fade-in-up">
        <div className="bg-white rounded-[3rem] p-10 flex-1 flex flex-col items-center text-center shadow-xl border border-purple-100">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-purple-200 rounded-[2.5rem] rotate-6 scale-105"></div>
                <img src={card.profileImage} className="relative w-32 h-32 rounded-[2.5rem] object-cover shadow-lg" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{card.fullName}</h1>
            <p className="text-purple-600 font-black uppercase text-[10px] tracking-[0.3em] mb-10">{card.jobTitle}</p>
            <div className="w-full space-y-4 mb-10">
                <SocialButton href={card.socials.phone ? `tel:${card.socials.phone}` : undefined} icon={Icons.Phone} label="Let's Talk" color="#8b5cf6" className="rounded-full shadow-lg shadow-purple-200" />
                <SocialButton href={card.socials.email ? `mailto:${card.socials.email}` : undefined} icon={Icons.Mail} label="Hire Me" color="white" outline textColor="#8b5cf6" className="rounded-full border-purple-200" />
            </div>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const ElegantTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-[#F9F6F2] p-10 flex flex-col items-center max-w-md mx-auto shadow-2xl animate-fade-in-up font-serif">
        <div className="w-full border border-gray-200 p-8 flex flex-col items-center text-center bg-white shadow-sm">
            <img src={card.profileImage} className="w-24 h-24 rounded-full grayscale object-cover mb-8 shadow-inner" />
            <h1 className="text-2xl tracking-[0.3em] uppercase text-gray-800 mb-2">{card.fullName}</h1>
            <div className="h-px w-12 bg-gray-300 mb-4"></div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-10">{card.jobTitle}</p>
            <div className="w-full space-y-6 mb-12">
                <a href={`tel:${card.socials.phone}`} className="block text-gray-800 text-sm tracking-widest hover:text-black transition">CALL: {card.socials.phone}</a>
                <a href={`mailto:${card.socials.email}`} className="block text-gray-800 text-sm tracking-widest hover:text-black transition uppercase">EMAIL ME</a>
            </div>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const TechTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-black text-[#00ff00] font-mono p-8 max-w-md mx-auto shadow-2xl animate-fade-in-up border border-[#00ff00]/10">
        <div className="mb-10 text-[10px] opacity-40">[SYSTEM_LOGIN_SUCCESS]</div>
        <div className="flex gap-6 mb-12 border-l-2 border-[#00ff00] pl-6 py-2">
            <div>
                <h1 className="text-2xl font-black tracking-widest italic">{card.fullName}</h1>
                <p className="text-xs opacity-70 uppercase underline">/{card.jobTitle}</p>
            </div>
        </div>
        <div className="space-y-6 mb-12">
            <a href={`tel:${card.socials.phone}`} className="block hover:bg-[#00ff00]/10 p-2 transition-all">PROTO:TEL // {card.socials.phone}</a>
            <a href={`mailto:${card.socials.email}`} className="block hover:bg-[#00ff00]/10 p-2 transition-all">PROTO:MAIL // {card.socials.email}</a>
        </div>
        <DynamicSections card={card} darkMode />
        <SocialGrid card={card} darkMode />
        <div className="mt-auto pt-10 text-right opacity-20 text-[8px]">DIGICARD_KERNEL_V2.0</div>
    </div>
);

const GradientTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen flex items-center justify-center p-6 max-w-md mx-auto shadow-2xl animate-fade-in-up" style={{background: `linear-gradient(135deg, ${card.primaryColor}, #000)`}}>
        <div className="bg-white/95 backdrop-blur rounded-[3rem] p-10 w-full shadow-2xl text-center">
            <img src={card.profileImage} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-xl -mt-20 object-cover mb-6" />
            <h1 className="text-3xl font-black text-slate-900 mb-1">{card.fullName}</h1>
            <p className="text-sm font-bold text-slate-400 mb-10 tracking-widest uppercase">{card.jobTitle}</p>
            <div className="w-full space-y-4 mb-10">
                <SocialButton href={`tel:${card.socials.phone}`} icon={Icons.Phone} label="Call Me" color={card.primaryColor} className="rounded-2xl" />
                <SocialButton href={`mailto:${card.socials.email}`} icon={Icons.Mail} label="Email Me" color="transparent" outline textColor={card.primaryColor} className="rounded-2xl" />
            </div>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const GlassTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-6 max-w-md mx-auto shadow-2xl animate-fade-in-up" style={{backgroundImage: `url(${card.bannerImage})`}}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[3rem] w-full text-center relative shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]">
            <img src={card.profileImage} className="w-24 h-24 rounded-full mx-auto border-2 border-white/30 object-cover mb-6" />
            <h1 className="text-3xl font-black text-white mb-1 shadow-sm">{card.fullName}</h1>
            <p className="text-white/60 font-bold uppercase text-[10px] tracking-widest mb-10">{card.jobTitle}</p>
            <div className="w-full space-y-4 mb-10 text-white">
                <a href={`tel:${card.socials.phone}`} className="flex items-center justify-center gap-3 bg-white/20 py-4 rounded-2xl hover:bg-white/30 transition">
                    <Icons.Phone /> <span className="font-bold text-sm">Call Me</span>
                </a>
                <a href={`mailto:${card.socials.email}`} className="flex items-center justify-center gap-3 bg-white/20 py-4 rounded-2xl hover:bg-white/30 transition">
                    <Icons.Mail /> <span className="font-bold text-sm">Email Me</span>
                </a>
            </div>
            <DynamicSections card={card} darkMode />
            <SocialGrid card={card} darkMode />
        </div>
    </div>
);

const PlayfulTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-yellow-50 p-6 flex flex-col max-w-md mx-auto shadow-2xl animate-fade-in-up font-sans">
        <div className="bg-white border-4 border-black rounded-[2rem] p-10 flex-1 flex flex-col items-center text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <img src={card.profileImage} className="w-28 h-28 rounded-full border-4 border-black object-cover mb-6 shadow-lg" />
            <h1 className="text-4xl font-black text-black mb-2 tracking-tighter uppercase">{card.fullName}</h1>
            <div className="bg-black text-white px-4 py-1 text-xs font-black uppercase mb-8 transform -rotate-2">{card.jobTitle}</div>
            <div className="w-full space-y-4 mb-10">
                <a href={`tel:${card.socials.phone}`} className="block bg-[#FF90E8] border-2 border-black py-4 rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-xs tracking-widest">CALL NOW!</a>
                <a href={`mailto:${card.socials.email}`} className="block bg-[#23A094] border-2 border-black py-4 rounded-xl font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-xs tracking-widest">EMAIL ME</a>
            </div>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const LuxeTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-[#0a0a0a] text-[#c9a66b] flex flex-col p-10 max-w-md mx-auto shadow-2xl animate-fade-in-up font-serif border-x border-[#c9a66b]/20">
        <div className="flex flex-col items-center text-center">
            <div className="relative mb-12">
                <div className="absolute inset-0 border border-[#c9a66b] rounded-full scale-110 opacity-30"></div>
                <img src={card.profileImage} className="w-32 h-32 rounded-full object-cover grayscale" />
            </div>
            <h1 className="text-4xl font-light tracking-[0.3em] uppercase mb-4 leading-none">{card.fullName}</h1>
            <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase mb-12">{card.jobTitle} • {card.companyName}</p>
            <div className="h-px w-24 bg-[#c9a66b]/40 mb-12"></div>
            <div className="w-full space-y-6 mb-12">
                 <a href={`tel:${card.socials.phone}`} className="block text-[#c9a66b] tracking-[0.4em] text-xs uppercase hover:text-white transition">PREMIER CALL</a>
                 <a href={`mailto:${card.socials.email}`} className="block text-[#c9a66b] tracking-[0.4em] text-xs uppercase hover:text-white transition">INQUIRY MAIL</a>
            </div>
            <DynamicSections card={card} darkMode />
            <SocialGrid card={card} darkMode />
        </div>
    </div>
);

const CyberpunkTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-black text-[#f3f300] font-mono p-6 max-w-md mx-auto shadow-2xl animate-fade-in-up border-4 border-[#f3f300]">
        <div className="border-2 border-[#ff00ff] p-4 mb-10 flex gap-4 bg-[#ff00ff]/10">
            <img src={card.profileImage} className="w-20 h-20 border-2 border-[#f3f300] grayscale contrast-150" />
            <div>
                <h1 className="text-xl font-black uppercase tracking-tighter italic">DATA: {card.fullName}</h1>
                <p className="text-[10px] text-[#00ffff] font-bold">LVL: PRO_ACCESS</p>
                <p className="text-[10px] opacity-70 mt-2">{card.jobTitle}</p>
            </div>
        </div>
        <div className="bg-[#f3f300] text-black px-2 py-1 font-black mb-6 skew-x-[-15deg] inline-block text-xs uppercase">Terminal://Active</div>
        <div className="space-y-4 mb-12">
            <a href={`tel:${card.socials.phone}`} className="block border-2 border-[#00ffff] p-4 text-center font-bold hover:bg-[#00ffff] hover:text-black transition uppercase tracking-widest">Connect_Voice</a>
            <a href={`mailto:${card.socials.email}`} className="block border-2 border-[#ff00ff] p-4 text-center font-bold hover:bg-[#ff00ff] hover:text-black transition uppercase tracking-widest">Direct_Comms</a>
        </div>
        <DynamicSections card={card} darkMode />
        <SocialGrid card={card} darkMode />
    </div>
);

const TerminalTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-[#050505] text-[#00ff00] font-mono p-8 max-w-md mx-auto shadow-2xl animate-fade-in-up border border-[#00ff00]/20">
        <div className="mb-10 text-[10px] opacity-40">[LOGIN_SUCCESS] [USER:PRO]</div>
        <div className="mb-16 border-l-2 border-[#00ff00] pl-6 py-2">
            <h1 className="text-2xl font-black mb-1 tracking-widest italic">{card.fullName}</h1>
            <p className="text-xs opacity-70 uppercase underline">{card.jobTitle}</p>
        </div>
        <div className="space-y-6 mb-16">
            <a href={`tel:${card.socials.phone}`} className="flex items-center gap-6 hover:bg-[#00ff00]/10 p-2 -ml-2 transition-all">
                <span className="bg-[#00ff00] text-black px-1.5 font-black text-[10px]">TEL</span>
                <span className="text-sm">{card.socials.phone}</span>
            </a>
            <a href={`mailto:${card.socials.email}`} className="flex items-center gap-6 hover:bg-[#00ff00]/10 p-2 -ml-2 transition-all">
                <span className="bg-[#00ff00] text-black px-1.5 font-black text-[10px]">MAIL</span>
                <span className="text-sm truncate">{card.socials.email}</span>
            </a>
        </div>
        <DynamicSections card={card} darkMode />
        <SocialGrid card={card} darkMode />
    </div>
);

const InstaTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto shadow-2xl animate-fade-in-up">
        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
            <Icons.ExternalLink size={24} />
            <span className="font-black text-lg tracking-tight lowercase">{card.fullName.replace(/\s/g, '')}</span>
            <Icons.Share size={24} />
        </div>
        <div className="p-8">
            <div className="flex gap-8 items-center mb-10">
                <img src={card.profileImage} className="w-24 h-24 rounded-full object-cover p-1 border-2 border-pink-500 shadow-lg" />
                <div className="flex flex-1 justify-around text-center">
                    <div><div className="font-black text-lg">24</div><div className="text-[10px] text-slate-400 uppercase font-bold">Cards</div></div>
                    <div><div className="font-black text-lg">1.2k</div><div className="text-[10px] text-slate-400 uppercase font-bold">Reach</div></div>
                </div>
            </div>
            <div className="mb-10">
                <h2 className="font-black text-base">{card.fullName}</h2>
                <p className="text-slate-500 text-sm mb-2">{card.jobTitle} @ {card.companyName}</p>
                <p className="text-slate-800 text-sm leading-relaxed">{card.bio}</p>
            </div>
            <div className="flex gap-4 mb-10">
                <SocialButton href={card.socials.phone ? `tel:${card.socials.phone}` : undefined} icon={Icons.Phone} label="Contact" color="#efeff4" textColor="black" className="border-none rounded-lg py-2" />
                <SocialButton href={card.socials.email ? `mailto:${card.socials.email}` : undefined} icon={Icons.Mail} label="Email" color="#efeff4" textColor="black" className="border-none rounded-lg py-2" />
            </div>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const NeoBrutalistTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-orange-100 p-6 flex flex-col max-w-md mx-auto shadow-2xl animate-fade-in-up">
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 mb-10 flex flex-col items-center">
            <img src={card.profileImage} className="w-full h-64 object-cover border-4 border-black mb-6 grayscale" />
            <h1 className="text-4xl font-black uppercase mb-1 tracking-tighter self-start">{card.fullName}</h1>
            <p className="text-lg font-black bg-yellow-400 border-4 border-black inline-block px-4 py-1 mb-8 self-start transform -rotate-2">{card.jobTitle}</p>
            <div className="w-full space-y-4">
                <a href={`tel:${card.socials.phone}`} className="block bg-green-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 text-center font-black active:shadow-none active:translate-x-1 active:translate-y-1 block uppercase tracking-widest">Call Now</a>
                <a href={`mailto:${card.socials.email}`} className="block bg-blue-400 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 text-center font-black active:shadow-none active:translate-x-1 active:translate-y-1 block text-white uppercase tracking-widest">Send Email</a>
            </div>
        </div>
        <DynamicSections card={card} />
        <SocialGrid card={card} />
    </div>
);

const SoftUITemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-[#e0e5ec] p-10 flex flex-col max-w-md mx-auto shadow-2xl animate-fade-in-up font-sans">
        <div className="shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] rounded-[3rem] p-10 flex flex-col items-center text-center">
            <img src={card.profileImage} className="w-32 h-32 rounded-full object-cover border-8 border-[#e0e5ec] shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.5)] mb-8" />
            <h1 className="text-3xl font-black text-[#4a5568] mb-2">{card.fullName}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{card.jobTitle}</p>
            <div className="w-full space-y-6 mb-12">
                <a href={`tel:${card.socials.phone}`} className="block bg-[#e0e5ec] py-4 rounded-2xl shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] font-bold text-[#4a5568] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] transition-all">CALL</a>
                <a href={`mailto:${card.socials.email}`} className="block bg-[#e0e5ec] py-4 rounded-2xl shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] font-bold text-[#4a5568] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] transition-all">EMAIL</a>
            </div>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const BotanicalTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-[#f1f3f0] p-10 flex flex-col max-w-md mx-auto shadow-2xl animate-fade-in-up font-serif">
        <div className="bg-white rounded-t-full p-10 flex-1 flex flex-col items-center text-center shadow-lg border-t-8 border-[#3d5a44]">
            <img src={card.profileImage} className="w-36 h-36 rounded-full object-cover mb-8 shadow-md border-4 border-white" />
            <h1 className="text-3xl font-light text-[#2d3a30] mb-2">{card.fullName}</h1>
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#3d5a44] font-bold mb-10">{card.jobTitle}</p>
            <div className="w-full space-y-4 mb-12">
                 <SocialButton href={`tel:${card.socials.phone}`} icon={Icons.Phone} label="Voice" color="#3d5a44" className="rounded-full" />
                 <SocialButton href={`mailto:${card.socials.email}`} icon={Icons.Mail} label="Inquiry" color="transparent" outline textColor="#3d5a44" className="rounded-full" />
            </div>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const MonochromeTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-white text-black p-10 flex flex-col max-w-md mx-auto shadow-2xl animate-fade-in-up font-sans">
        <div className="border-8 border-black p-8 flex-1 flex flex-col items-center">
            <img src={card.profileImage} className="w-32 h-32 object-cover border-4 border-black mb-8 grayscale shadow-xl" />
            <h1 className="text-4xl font-black uppercase mb-1 tracking-tighter leading-none text-center">{card.fullName}</h1>
            <p className="text-xs font-black bg-black text-white px-3 py-1 mb-10 self-center">{card.jobTitle}</p>
            <div className="w-full space-y-4 mb-12">
                <a href={`tel:${card.socials.phone}`} className="block border-4 border-black py-4 rounded-none font-black text-center uppercase tracking-widest hover:bg-black hover:text-white transition-all">CALL</a>
                <a href={`mailto:${card.socials.email}`} className="block border-4 border-black py-4 rounded-none font-black text-center uppercase tracking-widest hover:bg-black hover:text-white transition-all">EMAIL</a>
            </div>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const RetroTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-[#ff7b54] p-8 flex flex-col max-w-md mx-auto shadow-2xl animate-fade-in-up font-mono">
        <div className="bg-[#ffffd2] border-4 border-[#111] p-10 flex-1 flex flex-col items-center text-center shadow-[12px_12px_0px_0px_rgba(17,17,17,1)]">
            <img src={card.profileImage} className="w-32 h-32 rounded-none border-4 border-[#111] mb-8 object-cover shadow-lg" />
            <h1 className="text-3xl font-black text-[#111] uppercase mb-2 tracking-tighter">{card.fullName}</h1>
            <div className="bg-[#ffb26b] border-2 border-[#111] px-4 py-1 font-black text-xs mb-10 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] uppercase">{card.jobTitle}</div>
            <div className="w-full space-y-4 mb-10">
                <a href={`tel:${card.socials.phone}`} className="block bg-[#7b113a] text-white border-4 border-[#111] py-4 font-black shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">CALL_NOW</a>
                <a href={`mailto:${card.socials.email}`} className="block bg-[#150e56] text-white border-4 border-[#111] py-4 font-black shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase">EMAIL_US</a>
            </div>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

const CompactTemplate: React.FC<TemplateProps> = ({ card }) => (
    <div className="min-h-screen bg-slate-900 p-4 flex flex-col justify-center max-w-md mx-auto shadow-2xl animate-fade-in-up">
        <div className="bg-white rounded-[2rem] p-6 flex items-center gap-6 shadow-2xl mb-4 overflow-hidden border-b-8 border-blue-600">
            <img src={card.profileImage} className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
            <div className="flex-1">
                <h1 className="text-xl font-black text-slate-900 leading-none mb-1">{card.fullName}</h1>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{card.jobTitle}</p>
                <div className="flex gap-2 mt-4">
                     <a href={`tel:${card.socials.phone}`} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-blue-600 hover:text-white transition"><Icons.Phone size={18}/></a>
                     <a href={`mailto:${card.socials.email}`} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-blue-600 hover:text-white transition"><Icons.Mail size={18}/></a>
                     <a href={card.socials.website} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-blue-600 hover:text-white transition"><Icons.Globe size={18}/></a>
                </div>
            </div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 flex-1 shadow-2xl overflow-y-auto no-scrollbar">
            <p className="text-xs text-slate-500 mb-8 font-medium">"{card.bio}"</p>
            <DynamicSections card={card} />
            <SocialGrid card={card} />
        </div>
    </div>
);

// Router for all 20 templates
export const TemplateRenderer: React.FC<TemplateProps> = (props) => {
  switch (props.card.templateId) {
    case 'modern': return <ModernTemplate {...props} />;
    case 'dark': return <DarkTemplate {...props} />;
    case 'professional': return <ProfessionalTemplate {...props} />;
    case 'creative': return <CreativeTemplate {...props} />;
    case 'elegant': return <ElegantTemplate {...props} />;
    case 'tech': return <TechTemplate {...props} />;
    case 'gradient': return <GradientTemplate {...props} />;
    case 'glass': return <GlassTemplate {...props} />;
    case 'playful': return <PlayfulTemplate {...props} />;
    case 'luxe': return <LuxeTemplate {...props} />;
    case 'cyberpunk': return <CyberpunkTemplate {...props} />;
    case 'terminal': return <TerminalTemplate {...props} />;
    case 'insta': return <InstaTemplate {...props} />;
    case 'neobrutalist': return <NeoBrutalistTemplate {...props} />;
    case 'softui': return <SoftUITemplate {...props} />;
    case 'botanical': return <BotanicalTemplate {...props} />;
    case 'monochrome': return <MonochromeTemplate {...props} />;
    case 'retro': return <RetroTemplate {...props} />;
    case 'compact': return <CompactTemplate {...props} />;
    case 'minimal': 
    default: return <MinimalTemplate {...props} />;
  }
};

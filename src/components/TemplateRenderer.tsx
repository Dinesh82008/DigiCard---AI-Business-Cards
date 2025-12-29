
import React from 'react';
import { CardData, SocialLinks, SectionId } from '../types';
import { Icons } from './Icons';

interface TemplateProps {
  card: CardData;
  previewMode?: boolean;
}

// --- Content Block Components ---

const ServicesBlock: React.FC<{ card: CardData, darkMode?: boolean }> = ({ card, darkMode }) => {
    if (!card.services || card.services.length === 0) return null;
    
    return (
        <div className="mb-8 w-full">
            <h3 className={`text-center font-bold uppercase tracking-wider text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Our Services</h3>
            <div className="grid gap-3">
                {card.services.map(s => (
                    <div key={s.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.title}</h4>
                            {s.price && <span className={`text-sm font-semibold px-2 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{s.price}</span>}
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{s.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HoursBlock: React.FC<{ card: CardData, darkMode?: boolean }> = ({ card, darkMode }) => {
    if (!card.businessHours || card.businessHours.length === 0) return null;

    return (
        <div className="mb-8 w-full">
            <h3 className={`text-center font-bold uppercase tracking-wider text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Office Hours</h3>
            <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {card.businessHours.map((h, i) => (
                    <div key={h.id} className={`flex justify-between items-center p-3 text-sm border-b last:border-0 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-gray-600'} ${i % 2 === 0 ? (darkMode ? 'bg-opacity-50' : 'bg-gray-50') : ''}`}>
                        <span className="font-medium">{h.day}</span>
                        <span>{h.isClosed ? 'Closed' : `${h.open} - ${h.close}`}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MapBlock: React.FC<{ card: CardData, darkMode?: boolean }> = ({ card, darkMode }) => {
    if (!card.showMap || !card.socials.address) return null;
    
    // Default Map Embed URL if custom one isn't provided
    const encodedAddress = encodeURIComponent(card.socials.address);
    const mapSrc = card.customMapUrl || `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="mb-8 w-full">
             <h3 className={`text-center font-bold uppercase tracking-wider text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Find Us</h3>
             <div className="w-full h-48 bg-gray-200 rounded-xl overflow-hidden shadow-inner relative">
                 <iframe 
                    width="100%" 
                    height="100%" 
                    src={mapSrc} 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0}
                    className="w-full h-full"
                 ></iframe>
                 <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur text-xs p-2 text-center text-gray-600">
                     {card.socials.address}
                 </div>
             </div>
        </div>
    );
};

// Helper component to render sections in order
const DynamicSections: React.FC<{ card: CardData, darkMode?: boolean }> = ({ card, darkMode }) => {
    // Default order if not set
    const order = card.sectionOrder || ['services', 'hours', 'map'];
    
    return (
        <>
            {order.map(sectionId => {
                switch(sectionId) {
                    case 'services': return <ServicesBlock key="services" card={card} darkMode={darkMode} />;
                    case 'hours': return <HoursBlock key="hours" card={card} darkMode={darkMode} />;
                    case 'map': return <MapBlock key="map" card={card} darkMode={darkMode} />;
                    default: return null;
                }
            })}
        </>
    );
};

const SocialButton: React.FC<{ 
  href?: string; 
  icon: React.FC<any>; 
  label: string; 
  color: string;
  outline?: boolean;
  className?: string;
  textColor?: string;
}> = ({ href, icon: Icon, label, color, outline, className = "", textColor }) => {
  if (!href) return null;
  
  const safeHref = href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') 
    ? href 
    : `https://${href}`;

  const style = outline 
    ? { borderColor: color, color: textColor || color } 
    : { backgroundColor: color, color: textColor || '#fff', borderColor: color };

  return (
    <a 
      href={safeHref} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 border-2 ${className}`}
      style={style}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </a>
  );
};

// --- Template 1: Minimal ---
const MinimalTemplate: React.FC<TemplateProps> = ({ card }) => {
  const { primaryColor } = card;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-8 text-center max-w-md mx-auto shadow-2xl relative animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: primaryColor }}></div>
        
        {/* Logo */}
        {card.logoImage && (
             <div className="absolute top-4 left-4">
                 <img src={card.logoImage} alt="Logo" className="h-8 object-contain" />
             </div>
        )}

        <div className="mt-8 mb-4 relative">
            <img 
                src={card.profileImage} 
                alt={card.fullName} 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{card.fullName}</h1>
        <p className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: primaryColor }}>{card.jobTitle}</p>
        <p className="text-gray-500 text-sm mb-6">{card.companyName}</p>
        
        <div className="w-16 h-1 mb-6 rounded-full" style={{ backgroundColor: primaryColor }}></div>

        <p className="text-gray-600 mb-8 leading-relaxed">
            {card.bio}
        </p>

        <div className="w-full space-y-3 mb-8">
            <SocialButton href={card.socials.phone ? `tel:${card.socials.phone}` : undefined} icon={Icons.Phone} label="Call Me" color={primaryColor} />
            <SocialButton href={card.socials.email ? `mailto:${card.socials.email}` : undefined} icon={Icons.Mail} label="Email Me" color={primaryColor} outline />
            <SocialButton href={card.socials.whatsapp ? `https://wa.me/${card.socials.whatsapp}` : undefined} icon={Icons.MessageCircle} label="WhatsApp" color="#25D366" />
            <SocialButton href={card.socials.website} icon={Icons.Globe} label="Website" color="#333" outline />
            <SocialButton href={card.socials.address ? `https://maps.google.com/?q=${card.socials.address}` : undefined} icon={Icons.MapPin} label="Location" color="#333" outline />
        </div>
        
        <DynamicSections card={card} />

        <div className="flex justify-center gap-4 mt-8 flex-wrap">
            {card.socials.linkedin && <a href={card.socials.linkedin} className="text-gray-400 hover:text-[#0077b5] transition-transform duration-300 hover:scale-125"><Icons.Linkedin /></a>}
            {card.socials.twitter && <a href={card.socials.twitter} className="text-gray-400 hover:text-[#1DA1F2] transition-transform duration-300 hover:scale-125"><Icons.Twitter /></a>}
            {card.socials.instagram && <a href={card.socials.instagram} className="text-gray-400 hover:text-[#E1306C] transition-transform duration-300 hover:scale-125"><Icons.Instagram /></a>}
            {card.socials.facebook && <a href={card.socials.facebook} className="text-gray-400 hover:text-[#1877F2] transition-transform duration-300 hover:scale-125"><Icons.Facebook /></a>}
            {card.socials.youtube && <a href={card.socials.youtube} className="text-gray-400 hover:text-[#FF0000] transition-transform duration-300 hover:scale-125"><Icons.Youtube /></a>}
        </div>
    </div>
  );
};

// --- Template 2: Modern ---
const ModernTemplate: React.FC<TemplateProps> = ({ card }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden animate-fade-in-up">
        {/* Banner */}
        <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${card.bannerImage})` }}>
           <div className="w-full h-full bg-black/30 backdrop-blur-[2px]"></div>
           {card.logoImage && (
               <div className="absolute top-4 right-4 bg-white/90 p-1.5 rounded-lg shadow-sm">
                   <img src={card.logoImage} className="h-8 object-contain" alt="Logo"/>
               </div>
           )}
        </div>

        <div className="px-6 relative -mt-16 text-center">
            <img 
                src={card.profileImage} 
                alt={card.fullName} 
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl mx-auto"
            />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">{card.fullName}</h1>
            <p className="text-gray-600 font-medium">{card.jobTitle} @ {card.companyName}</p>
        </div>

        <div className="p-6">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                <p className="text-gray-600 text-center text-sm italic">"{card.bio}"</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                 <SocialButton href={card.socials.phone ? `tel:${card.socials.phone}` : undefined} icon={Icons.Phone} label="Call" color={card.primaryColor} />
                 <SocialButton href={card.socials.email ? `mailto:${card.socials.email}` : undefined} icon={Icons.Mail} label="Email" color={card.primaryColor} />
            </div>

            <div className="space-y-3 mb-8">
                 <SocialButton href={card.socials.whatsapp ? `https://wa.me/${card.socials.whatsapp}` : undefined} icon={Icons.MessageCircle} label="Chat on WhatsApp" color="#25D366" />
                 <SocialButton href={card.socials.website} icon={Icons.Globe} label="Visit Website" color="#333" outline />
                 <SocialButton href={card.socials.address ? `https://maps.google.com/?q=${card.socials.address}` : undefined} icon={Icons.MapPin} label="Find Us" color="#333" outline />
            </div>
            
            <DynamicSections card={card} />
            
            <div className="flex justify-center gap-6 mt-8 pb-8 border-t pt-6 flex-wrap">
                {card.socials.linkedin && <a href={card.socials.linkedin} className="p-2 bg-white shadow rounded-full text-gray-600 hover:text-[#0077b5] transition-transform duration-300 hover:scale-125"><Icons.Linkedin /></a>}
                {card.socials.twitter && <a href={card.socials.twitter} className="p-2 bg-white shadow rounded-full text-gray-600 hover:text-[#1DA1F2] transition-transform duration-300 hover:scale-125"><Icons.Twitter /></a>}
                {card.socials.instagram && <a href={card.socials.instagram} className="p-2 bg-white shadow rounded-full text-gray-600 hover:text-[#E1306C] transition-transform duration-300 hover:scale-125"><Icons.Instagram /></a>}
                {card.socials.facebook && <a href={card.socials.facebook} className="p-2 bg-white shadow rounded-full text-gray-600 hover:text-[#1877F2] transition-transform duration-300 hover:scale-125"><Icons.Facebook /></a>}
                {card.socials.youtube && <a href={card.socials.youtube} className="p-2 bg-white shadow rounded-full text-gray-600 hover:text-red-600 transition-transform duration-300 hover:scale-125"><Icons.Youtube /></a>}
            </div>
        </div>
    </div>
  );
};

// --- Template 3: Dark Mode ---
const DarkTemplate: React.FC<TemplateProps> = ({ card }) => {
    const { primaryColor } = card;
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8 max-w-md mx-auto shadow-2xl relative animate-fade-in-up">
            <div className="w-full flex justify-between items-center mb-10">
                 {card.logoImage ? (
                    <img src={card.logoImage} alt="Logo" className="h-6 object-contain grayscale brightness-200" />
                 ) : (
                    <div className="text-xs font-mono text-gray-400 tracking-widest uppercase">Digital Card</div>
                 )}
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
            </div>

            <div className="relative mb-6 group">
                <div className="absolute -inset-1 rounded-full blur opacity-40 transition duration-500 group-hover:opacity-75" style={{ backgroundColor: primaryColor }}></div>
                <img 
                    src={card.profileImage} 
                    alt={card.fullName} 
                    className="relative w-28 h-28 rounded-full object-cover ring-2 ring-gray-800"
                />
            </div>

            <h1 className="text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {card.fullName}
            </h1>
            <p className="text-gray-400 mb-6">{card.jobTitle} | {card.companyName}</p>

            <div className="w-full space-y-4 mb-8">
                 <a href={card.socials.phone ? `tel:${card.socials.phone}` : '#'} className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:border-gray-500">
                    <div className="p-2 rounded-md mr-4 bg-gray-700 text-white">
                        <Icons.Phone size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase">Phone</div>
                        <div className="font-medium">{card.socials.phone || 'N/A'}</div>
                    </div>
                 </a>
                 
                 <a href={card.socials.email ? `mailto:${card.socials.email}` : '#'} className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:border-gray-500">
                    <div className="p-2 rounded-md mr-4 bg-gray-700 text-white">
                        <Icons.Mail size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase">Email</div>
                        <div className="font-medium truncate">{card.socials.email || 'N/A'}</div>
                    </div>
                 </a>

                 {card.socials.whatsapp && (
                    <a href={`https://wa.me/${card.socials.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:border-gray-500">
                        <div className="p-2 rounded-md mr-4 bg-gray-700 text-white">
                            <Icons.Whatsapp size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 uppercase">WhatsApp</div>
                            <div className="font-medium">{card.socials.whatsapp}</div>
                        </div>
                    </a>
                 )}
                 
                 <a href={card.socials.website ?? '#'} className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:border-gray-500">
                    <div className="p-2 rounded-md mr-4 bg-gray-700 text-white">
                        <Icons.Globe size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase">Website</div>
                        <div className="font-medium truncate">{card.socials.website || 'N/A'}</div>
                    </div>
                 </a>

                 {card.socials.facebook && (
                    <a href={card.socials.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:border-gray-500">
                        <div className="p-2 rounded-md mr-4 bg-gray-700 text-white">
                            <Icons.Facebook size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 uppercase">Facebook</div>
                            <div className="font-medium truncate">{card.socials.facebook}</div>
                        </div>
                    </a>
                 )}

                 {card.socials.youtube && (
                    <a href={card.socials.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:border-gray-500">
                        <div className="p-2 rounded-md mr-4 bg-gray-700 text-white">
                            <Icons.Youtube size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 uppercase">YouTube</div>
                            <div className="font-medium truncate">{card.socials.youtube}</div>
                        </div>
                    </a>
                 )}

                 {card.socials.address && (
                    <a href={`https://maps.google.com/?q=${card.socials.address}`} target="_blank" className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:border-gray-500">
                        <div className="p-2 rounded-md mr-4 bg-gray-700 text-white">
                            <Icons.MapPin size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 uppercase">Location</div>
                            <div className="font-medium truncate">{card.socials.address}</div>
                        </div>
                    </a>
                 )}
            </div>

            <DynamicSections card={card} darkMode />

            <div className="mt-8 flex gap-6 flex-wrap justify-center">
                {card.socials.whatsapp && <a href={`https://wa.me/${card.socials.whatsapp}`} className="text-gray-500 hover:text-white transition-all duration-300 hover:scale-125"><Icons.Whatsapp /></a>}
                {card.socials.linkedin && <a href={card.socials.linkedin} className="text-gray-500 hover:text-white transition-all duration-300 hover:scale-125"><Icons.Linkedin /></a>}
                {card.socials.twitter && <a href={card.socials.twitter} className="text-gray-500 hover:text-white transition-all duration-300 hover:scale-125"><Icons.Twitter /></a>}
                {card.socials.instagram && <a href={card.socials.instagram} className="text-gray-500 hover:text-white transition-all duration-300 hover:scale-125"><Icons.Instagram /></a>}
                {card.socials.facebook && <a href={card.socials.facebook} className="text-gray-500 hover:text-white transition-all duration-300 hover:scale-125"><Icons.Facebook /></a>}
                {card.socials.youtube && <a href={card.socials.youtube} className="text-gray-500 hover:text-white transition-all duration-300 hover:scale-125"><Icons.Youtube /></a>}
            </div>

            <div className="mt-auto pt-10 text-center opacity-30 text-xs">
                <p>Saved to contacts</p>
            </div>
        </div>
    );
};

// --- Template 4: Professional ---
const ProfessionalTemplate: React.FC<TemplateProps> = ({ card }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col max-w-md mx-auto shadow-xl animate-fade-in-up">
            <div className="bg-white p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-12 -translate-y-12 rotate-45 opacity-10" style={{backgroundColor: card.primaryColor}}></div>
                <img src={card.profileImage} className="w-20 h-20 rounded-lg object-cover shadow-sm" alt="Profile" />
                <div className="flex-1 z-10">
                    <div className="flex justify-between items-start">
                        <h1 className="text-xl font-bold text-gray-800">{card.fullName}</h1>
                        {card.logoImage && <img src={card.logoImage} className="h-8 w-8 object-contain ml-2" alt="Logo" />}
                    </div>
                    <p className="text-sm font-medium" style={{color: card.primaryColor}}>{card.jobTitle}</p>
                    <p className="text-xs text-gray-500">{card.companyName}</p>
                </div>
            </div>

            <div className="p-6 space-y-6 flex-1 bg-gray-50">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4" style={{borderLeftColor: card.primaryColor}}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">About</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{card.bio}</p>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Contact</h3>
                    <div className="space-y-2">
                        <SocialButton href={card.socials.phone ? `tel:${card.socials.phone}` : undefined} icon={Icons.Phone} label="Mobile" color="white" textColor="#333" outline className="bg-white hover:bg-gray-50 !border-gray-200" />
                        <SocialButton href={card.socials.email ? `mailto:${card.socials.email}` : undefined} icon={Icons.Mail} label="Email" color="white" textColor="#333" outline className="bg-white hover:bg-gray-50 !border-gray-200" />
                        <SocialButton href={card.socials.website} icon={Icons.Globe} label="Website" color="white" textColor="#333" outline className="bg-white hover:bg-gray-50 !border-gray-200" />
                        {card.socials.address && <SocialButton href={`https://maps.google.com/?q=${card.socials.address}`} icon={Icons.MapPin} label="Office" color="white" textColor="#333" outline className="bg-white hover:bg-gray-50 !border-gray-200" />}
                    </div>
                </div>

                <DynamicSections card={card} />

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    {card.socials.linkedin && <a href={card.socials.linkedin} className="text-gray-400 hover:text-[#0077b5] transition-transform duration-300 hover:scale-125"><Icons.Linkedin size={24}/></a>}
                    {card.socials.twitter && <a href={card.socials.twitter} className="text-gray-400 hover:text-[#1DA1F2] transition-transform duration-300 hover:scale-125"><Icons.Twitter size={24}/></a>}
                    {card.socials.instagram && <a href={card.socials.instagram} className="text-gray-400 hover:text-[#E1306C] transition-transform duration-300 hover:scale-125"><Icons.Instagram size={24}/></a>}
                    {card.socials.facebook && <a href={card.socials.facebook} className="text-gray-400 hover:text-[#1877F2] transition-transform duration-300 hover:scale-125"><Icons.Facebook size={24}/></a>}
                </div>
            </div>
            
            <div className="bg-gray-800 text-white text-center py-3 text-xs">
                Connect with me
            </div>
        </div>
    );
};

// --- Template 5: Creative ---
const CreativeTemplate: React.FC<TemplateProps> = ({ card }) => {
    return (
        <div className="min-h-screen bg-white max-w-md mx-auto shadow-2xl overflow-hidden relative animate-fade-in-up">
            {/* Abstract Shapes */}
            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] rounded-full opacity-20 blur-3xl" style={{backgroundColor: card.primaryColor}}></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full bg-purple-200 opacity-40 blur-3xl"></div>

            <div className="relative z-10 p-8 flex flex-col h-full">
                <div className="mb-8 relative">
                    {card.logoImage && <img src={card.logoImage} className="absolute top-0 right-0 h-10 w-10 object-contain" alt="Logo" />}
                    <img src={card.profileImage} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl mb-4" />
                    <h1 className="text-4xl font-black text-gray-900 leading-tight mb-2">{card.fullName}</h1>
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white shadow-md" style={{backgroundColor: card.primaryColor}}>
                        {card.jobTitle}
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    <p className="text-lg text-gray-600 font-light italic border-l-4 pl-4 border-gray-200">
                        {card.bio}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <SocialButton href={card.socials.phone ? `tel:${card.socials.phone}` : undefined} icon={Icons.Phone} label="Call" color={card.primaryColor} />
                        <SocialButton href={card.socials.email ? `mailto:${card.socials.email}` : undefined} icon={Icons.Mail} label="Email" color="#333" />
                    </div>
                    
                    <div className="space-y-3">
                         <SocialButton href={card.socials.whatsapp ? `https://wa.me/${card.socials.whatsapp}` : undefined} icon={Icons.MessageCircle} label="WhatsApp" color="#25D366" outline />
                         <SocialButton href={card.socials.website} icon={Icons.Globe} label="Visit Website" color="#333" outline />
                    </div>

                    <DynamicSections card={card} />
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4 overflow-x-auto pb-2">
                     {/* Horizontal Scroll Socials */}
                    {Object.entries(card.socials).map(([key, value]) => {
                        if (!['linkedin','twitter','instagram','facebook','youtube'].includes(key) || !value) return null;
                        return (
                            <a key={key} href={value} className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-300 hover:scale-110">
                                {key === 'linkedin' && <Icons.Linkedin size={18}/>}
                                {key === 'twitter' && <Icons.Twitter size={18}/>}
                                {key === 'instagram' && <Icons.Instagram size={18}/>}
                                {key === 'facebook' && <Icons.Facebook size={18}/>}
                                {key === 'youtube' && <Icons.Youtube size={18}/>}
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- Template 6: Elegant ---
const ElegantTemplate: React.FC<TemplateProps> = ({ card }) => {
    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-8 max-w-md mx-auto shadow-2xl border-x-8 border-white animate-fade-in-up">
            <div className="w-full border border-gray-200 p-8 bg-white shadow-sm text-center relative">
                {card.logoImage && <img src={card.logoImage} className="absolute top-4 left-4 h-6 w-auto object-contain opacity-50" alt="Logo" />}
                
                <img src={card.profileImage} className="w-24 h-24 rounded-full mx-auto mb-6 grayscale object-cover" />
                <h1 className="text-2xl font-serif text-gray-900 tracking-wide mb-2">{card.fullName}</h1>
                <div className="h-px w-12 bg-gray-300 mx-auto mb-4"></div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-6">{card.jobTitle}</p>
                
                <p className="font-serif text-gray-600 italic mb-8 text-sm">
                    "{card.bio}"
                </p>

                <div className="space-y-3 font-serif mb-8">
                    <a href={card.socials.phone ? `tel:${card.socials.phone}` : '#'} className="block text-gray-800 hover:text-black border-b border-gray-100 pb-2 transition-all duration-300 hover:pl-2">
                        {card.socials.phone || 'Phone Number'}
                    </a>
                    <a href={card.socials.email ? `mailto:${card.socials.email}` : '#'} className="block text-gray-800 hover:text-black border-b border-gray-100 pb-2 transition-all duration-300 hover:pl-2">
                        {card.socials.email || 'Email Address'}
                    </a>
                    <a href={card.socials.website || '#'} className="block text-gray-800 hover:text-black border-b border-gray-100 pb-2 transition-all duration-300 hover:pl-2">
                        {card.socials.website?.replace(/^https?:\/\//, '') || 'Website'}
                    </a>
                </div>

                <DynamicSections card={card} />

                <div className="mt-8 flex justify-center gap-4 text-gray-400">
                    {card.socials.linkedin && <a href={card.socials.linkedin} className="hover:text-gray-900 transition-transform duration-300 hover:scale-125"><Icons.Linkedin /></a>}
                    {card.socials.twitter && <a href={card.socials.twitter} className="hover:text-gray-900 transition-transform duration-300 hover:scale-125"><Icons.Twitter /></a>}
                    {card.socials.instagram && <a href={card.socials.instagram} className="hover:text-gray-900 transition-transform duration-300 hover:scale-125"><Icons.Instagram /></a>}
                </div>
            </div>
        </div>
    );
};

// --- Template 7: Tech ---
const TechTemplate: React.FC<TemplateProps> = ({ card }) => {
    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-4 max-w-md mx-auto shadow-2xl flex flex-col animate-fade-in-up">
            <div className="border border-green-500/50 p-6 flex-1 relative bg-gray-900/50">
                {/* Decoration Lines */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-500"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-green-500"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-green-500"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-green-500"></div>

                <div className="flex items-start gap-4 mb-8">
                     <img src={card.profileImage} className="w-16 h-16 rounded border border-green-500/50 grayscale object-cover" />
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                             <h1 className="text-lg font-bold typing-effect"> {'>'} {card.fullName}</h1>
                             {card.logoImage && <img src={card.logoImage} className="h-6 w-6 object-contain grayscale opacity-70" alt="Logo" />}
                        </div>
                        <p className="text-xs opacity-70 mt-1"> // {card.jobTitle}</p>
                        <p className="text-xs opacity-70"> // {card.companyName}</p>
                     </div>
                </div>

                <div className="mb-8 border-l-2 border-green-500/30 pl-3">
                    <p className="text-sm opacity-90 leading-relaxed">{card.bio}</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="text-xs uppercase opacity-50 border-b border-green-500/20 pb-1">Connection Protocols</div>
                    
                    <a href={card.socials.phone ? `tel:${card.socials.phone}` : '#'} className="flex items-center gap-3 hover:bg-green-500/10 p-2 -mx-2 transition-all duration-300 hover:translate-x-2">
                        <Icons.Phone size={16}/> <span className="text-sm">{card.socials.phone || 'N/A'}</span>
                    </a>
                    <a href={card.socials.email ? `mailto:${card.socials.email}` : '#'} className="flex items-center gap-3 hover:bg-green-500/10 p-2 -mx-2 transition-all duration-300 hover:translate-x-2">
                        <Icons.Mail size={16}/> <span className="text-sm truncate">{card.socials.email || 'N/A'}</span>
                    </a>
                    <a href={card.socials.website || '#'} className="flex items-center gap-3 hover:bg-green-500/10 p-2 -mx-2 transition-all duration-300 hover:translate-x-2">
                        <Icons.Globe size={16}/> <span className="text-sm truncate">{card.socials.website || 'N/A'}</span>
                    </a>
                </div>

                <DynamicSections card={card} darkMode />

                <div className="mt-8 pt-4 border-t border-green-500/20 flex gap-4">
                    {card.socials.linkedin && <a href={card.socials.linkedin} className="hover:text-white transition-transform duration-300 hover:scale-125"><Icons.Linkedin size={18}/></a>}
                    {card.socials.twitter && <a href={card.socials.twitter} className="hover:text-white transition-transform duration-300 hover:scale-125"><Icons.Twitter size={18}/></a>}
                    {card.socials.instagram && <a href={card.socials.instagram} className="hover:text-white transition-transform duration-300 hover:scale-125"><Icons.Instagram size={18}/></a>}
                </div>

                 <div className="absolute bottom-2 right-2 text-[10px] opacity-40">SYS.READY</div>
            </div>
        </div>
    );
};

// --- Template 8: Gradient ---
const GradientTemplate: React.FC<TemplateProps> = ({ card }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 max-w-md mx-auto shadow-2xl relative overflow-hidden animate-fade-in-up" 
             style={{background: `linear-gradient(135deg, ${card.primaryColor}, #1a1a1a)`}}>
            
            <div className="bg-white/95 backdrop-blur rounded-3xl p-8 w-full shadow-2xl text-center relative z-10">
                {card.logoImage && (
                    <div className="absolute top-4 left-4 opacity-50">
                        <img src={card.logoImage} className="h-6 w-auto object-contain" alt="Logo" />
                    </div>
                )}
                
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                    <img src={card.profileImage} className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
                </div>
                
                <div className="mt-12">
                    <h1 className="text-2xl font-bold text-gray-800">{card.fullName}</h1>
                    <p className="text-sm text-purple-600 font-medium mb-4">{card.jobTitle}</p>
                    <p className="text-gray-600 text-sm mb-8">{card.bio}</p>
                    
                    <div className="space-y-3 mb-8">
                         <SocialButton href={card.socials.phone ? `tel:${card.socials.phone}` : undefined} icon={Icons.Phone} label="Call" color={card.primaryColor} />
                         <SocialButton href={card.socials.email ? `mailto:${card.socials.email}` : undefined} icon={Icons.Mail} label="Email" color={card.primaryColor} outline />
                         <SocialButton href={card.socials.website} icon={Icons.Globe} label="Website" color="#333" outline />
                    </div>

                    <DynamicSections card={card} />

                    <div className="mt-8 flex justify-center gap-4">
                         {card.socials.linkedin && <a href={card.socials.linkedin} className="text-gray-400 hover:text-gray-800 transition-transform duration-300 hover:scale-125"><Icons.Linkedin /></a>}
                         {card.socials.instagram && <a href={card.socials.instagram} className="text-gray-400 hover:text-gray-800 transition-transform duration-300 hover:scale-125"><Icons.Instagram /></a>}
                         {card.socials.twitter && <a href={card.socials.twitter} className="text-gray-400 hover:text-gray-800 transition-transform duration-300 hover:scale-125"><Icons.Twitter /></a>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Template 9: Glass ---
const GlassTemplate: React.FC<TemplateProps> = ({ card }) => {
    return (
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 max-w-md mx-auto shadow-2xl text-white animate-fade-in-up" 
             style={{backgroundImage: `url(${card.bannerImage || card.profileImage})`}}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl w-full relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
                 <div className="flex flex-col items-center">
                    <div className="relative">
                        <img src={card.profileImage} className="w-24 h-24 rounded-full border-2 border-white/50 object-cover mb-4" />
                        {card.logoImage && <img src={card.logoImage} className="absolute bottom-2 -right-2 w-8 h-8 rounded bg-white p-0.5" alt="Logo" />}
                    </div>
                    
                    <h1 className="text-2xl font-bold shadow-black drop-shadow-md">{card.fullName}</h1>
                    <p className="text-white/80 font-medium mb-6">{card.jobTitle}</p>
                    
                    <div className="w-full space-y-3 mb-8">
                        <a href={card.socials.phone ? `tel:${card.socials.phone}` : '#'} className="bg-white/20 hover:bg-white/30 transition-all duration-300 p-3 rounded-xl flex items-center gap-3 backdrop-blur-sm hover:scale-[1.02]">
                            <Icons.Phone size={20} /> <span className="font-medium">Call Me</span>
                        </a>
                        <a href={card.socials.email ? `mailto:${card.socials.email}` : '#'} className="bg-white/20 hover:bg-white/30 transition-all duration-300 p-3 rounded-xl flex items-center gap-3 backdrop-blur-sm hover:scale-[1.02]">
                            <Icons.Mail size={20} /> <span className="font-medium">Email</span>
                        </a>
                        <a href={card.socials.website || '#'} className="bg-white/20 hover:bg-white/30 transition-all duration-300 p-3 rounded-xl flex items-center gap-3 backdrop-blur-sm hover:scale-[1.02]">
                            <Icons.Globe size={20} /> <span className="font-medium">Website</span>
                        </a>
                    </div>

                    <div className="w-full space-y-8">
                        {/* Custom rendering for Glass Template because it wraps sections in glass containers */}
                        {(card.sectionOrder || ['services', 'hours', 'map']).map(sectionId => {
                            if (sectionId === 'services') return card.services?.length ? <div key="services" className="bg-white/20 p-4 rounded-xl backdrop-blur-sm"><ServicesBlock card={card} darkMode /></div> : null;
                            if (sectionId === 'hours') return card.businessHours?.length ? <div key="hours" className="bg-white/20 p-4 rounded-xl backdrop-blur-sm"><HoursBlock card={card} darkMode /></div> : null;
                            if (sectionId === 'map') return card.showMap ? <MapBlock key="map" card={card} darkMode /> : null;
                            return null;
                        })}
                    </div>
                    
                    <div className="mt-8 flex justify-center gap-5">
                         {card.socials.linkedin && <a href={card.socials.linkedin} className="text-white hover:opacity-80 transition-transform duration-300 hover:scale-125"><Icons.Linkedin /></a>}
                         {card.socials.instagram && <a href={card.socials.instagram} className="text-white hover:opacity-80 transition-transform duration-300 hover:scale-125"><Icons.Instagram /></a>}
                         {card.socials.facebook && <a href={card.socials.facebook} className="text-white hover:opacity-80 transition-transform duration-300 hover:scale-125"><Icons.Facebook /></a>}
                    </div>
                 </div>
            </div>
        </div>
    );
};

// --- Template 10: Playful ---
const PlayfulTemplate: React.FC<TemplateProps> = ({ card }) => {
    return (
        <div className="min-h-screen bg-yellow-50 p-6 font-sans max-w-md mx-auto shadow-2xl flex flex-col justify-center animate-fade-in-up">
           <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-8 text-center relative max-h-[90vh] overflow-y-auto no-scrollbar">
                {card.logoImage && (
                    <img src={card.logoImage} className="absolute top-4 left-4 w-8 h-8 object-contain" alt="Logo" />
                )}

                <div className="inline-block p-1 border-4 border-black rounded-full mb-4 bg-yellow-300">
                    <img src={card.profileImage} className="w-24 h-24 rounded-full border-2 border-black object-cover" />
                </div>
                
                <h1 className="text-3xl font-black text-black mb-2 uppercase">{card.fullName}</h1>
                <div className="inline-block bg-black text-white px-3 py-1 text-sm font-bold transform -rotate-2 mb-6">
                    {card.jobTitle}
                </div>
                
                <p className="font-bold text-gray-700 mb-8 border-y-2 border-black py-4 border-dashed">
                    {card.bio}
                </p>
                
                <div className="space-y-4 mb-8">
                     <SocialButton href={card.socials.phone ? `tel:${card.socials.phone}` : undefined} icon={Icons.Phone} label="Call Now!" color="#FF90E8" textColor="black" className="!border-black !border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none !rounded-lg" />
                     <SocialButton href={card.socials.email ? `mailto:${card.socials.email}` : undefined} icon={Icons.Mail} label="Send Email" color="#23A094" textColor="black" className="!border-black !border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none !rounded-lg" />
                     <SocialButton href={card.socials.website} icon={Icons.Globe} label="My Site" color="#FFC900" textColor="black" className="!border-black !border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none !rounded-lg" />
                </div>

                <DynamicSections card={card} />

                <div className="mt-8 flex justify-center gap-4">
                     {card.socials.instagram && <a href={card.socials.instagram} className="text-black hover:scale-110 transition transform"><Icons.Instagram size={28} /></a>}
                     {card.socials.twitter && <a href={card.socials.twitter} className="text-black hover:scale-110 transition transform"><Icons.Twitter size={28} /></a>}
                </div>
           </div>
        </div>
    );
};


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
    case 'minimal': 
    default: return <MinimalTemplate {...props} />;
  }
};


import { Icons } from './main.js';

function renderSocialButton(href, icon, label, color, outline) {
    if (!href) return '';
    const safeHref = (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) ? href : `https://${href}`;
    const style = outline 
        ? `border-color: ${color}; color: ${color};` 
        : `background-color: ${color}; color: white; border-color: ${color};`;
    
    return `
    <a href="${safeHref}" target="_blank" class="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-2" style="${style}">
        ${icon}
        <span class="font-medium">${label}</span>
    </a>`;
}

function renderMinimal(card) {
    const { primaryColor, fullName, jobTitle, companyName, bio, profileImage, socials } = card;
    return `
    <div class="min-h-full bg-white flex flex-col items-center p-8 text-center animate-fade-in-up relative">
        <div class="absolute top-0 left-0 w-full h-2" style="background-color: ${primaryColor}"></div>
        <div class="mt-8 mb-4">
            <img src="${profileImage}" class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto">
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-1">${fullName}</h1>
        <p class="text-sm font-semibold uppercase tracking-wide mb-1" style="color: ${primaryColor}">${jobTitle}</p>
        <p class="text-gray-500 text-sm mb-6">${companyName}</p>
        <div class="w-16 h-1 mb-6 rounded-full mx-auto" style="background-color: ${primaryColor}"></div>
        <p class="text-gray-600 mb-8 leading-relaxed">${bio}</p>
        <div class="w-full space-y-3 mb-8">
            ${renderSocialButton(socials.phone ? `tel:${socials.phone}` : null, Icons.Phone(), "Call Me", primaryColor)}
            ${renderSocialButton(socials.email ? `mailto:${socials.email}` : null, Icons.Mail(), "Email Me", primaryColor, true)}
            ${renderSocialButton(socials.whatsapp ? `https://wa.me/${socials.whatsapp}` : null, Icons.Whatsapp(), "WhatsApp", "#25D366")}
            ${renderSocialButton(socials.website, Icons.Globe(), "Website", "#333", true)}
        </div>
    </div>`;
}

function renderModern(card) {
    const { primaryColor, fullName, jobTitle, companyName, bio, profileImage, bannerImage, socials } = card;
    return `
    <div class="min-h-full bg-gray-50 flex flex-col animate-fade-in-up">
        <div class="h-40 bg-cover bg-center relative" style="background-image: url(${bannerImage || 'https://picsum.photos/800/300'})">
            <div class="w-full h-full bg-black/30 backdrop-blur-[2px]"></div>
        </div>
        <div class="px-6 relative -mt-16 text-center">
            <img src="${profileImage}" class="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl mx-auto">
            <h1 class="text-2xl font-bold text-gray-900 mt-4">${fullName}</h1>
            <p class="text-gray-600 font-medium">${jobTitle} @ ${companyName}</p>
        </div>
        <div class="p-6">
            <div class="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                <p class="text-gray-600 text-center text-sm italic">"${bio}"</p>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-6">
                 ${renderSocialButton(socials.phone ? `tel:${socials.phone}` : null, Icons.Phone(), "Call", primaryColor)}
                 ${renderSocialButton(socials.email ? `mailto:${socials.email}` : null, Icons.Mail(), "Email", primaryColor)}
            </div>
            <div class="space-y-3">
                 ${renderSocialButton(socials.whatsapp ? `https://wa.me/${socials.whatsapp}` : null, Icons.MessageCircle(), "WhatsApp", "#25D366")}
                 ${renderSocialButton(socials.website, Icons.Globe(), "Website", "#333", true)}
            </div>
        </div>
    </div>`;
}

function renderDark(card) {
    const { primaryColor, fullName, jobTitle, companyName, profileImage, socials } = card;
    return `
    <div class="min-h-full bg-gray-900 text-white flex flex-col items-center p-8 animate-fade-in-up">
        <div class="w-full flex justify-end mb-10">
            <div class="w-2 h-2 rounded-full" style="background-color: ${primaryColor}"></div>
        </div>
        <div class="relative mb-6">
            <img src="${profileImage}" class="relative w-28 h-28 rounded-full object-cover ring-2 ring-gray-800 mx-auto">
        </div>
        <h1 class="text-3xl font-bold mb-1 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">${fullName}</h1>
        <p class="text-gray-400 mb-6 text-center">${jobTitle} | ${companyName}</p>

        <div class="w-full space-y-4 mb-8">
             <a href="${socials.phone ? `tel:${socials.phone}` : '#'}" class="flex items-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div class="p-2 rounded-md mr-4 bg-gray-700 text-white">${Icons.Phone()}</div>
                <div class="flex-1">
                    <div class="text-xs text-gray-500 uppercase">Phone</div>
                    <div class="font-medium">${socials.phone || 'N/A'}</div>
                </div>
             </a>
             <a href="${socials.email ? `mailto:${socials.email}` : '#'}" class="flex items-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div class="p-2 rounded-md mr-4 bg-gray-700 text-white">${Icons.Mail()}</div>
                <div class="flex-1">
                    <div class="text-xs text-gray-500 uppercase">Email</div>
                    <div class="font-medium truncate">${socials.email || 'N/A'}</div>
                </div>
             </a>
        </div>
    </div>`;
}

// Router for templates
export function renderTemplate(templateId, card) {
    const safeCard = {
        ...card,
        fullName: card.fullName || 'Your Name',
        jobTitle: card.jobTitle || 'Job Title',
        profileImage: card.profileImage || 'https://picsum.photos/200',
        primaryColor: card.primaryColor || '#3b82f6',
        socials: card.socials || {}
    };

    switch(templateId) {
        case 'modern': return renderModern(safeCard);
        case 'dark': return renderDark(safeCard);
        // Fallback for others to minimal/modern for demo completeness
        case 'professional': return renderModern(safeCard); 
        case 'tech': return renderDark(safeCard);
        default: return renderMinimal(safeCard);
    }
}
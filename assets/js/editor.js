
import { api, checkAuth, resizeImage, DEFAULT_CARD, Icons } from './main.js';
import { renderTemplate } from './templates.js';
import { GoogleGenAI } from "@google/genai";

const user = checkAuth();
const params = new URLSearchParams(window.location.search);
const cardId = params.get('id');

let card = { ...DEFAULT_CARD, userId: user.id };
const formContainer = document.getElementById('formContainer');
const previewFrame = document.getElementById('previewFrame');
const saveBtn = document.getElementById('saveBtn');

// --- Initialization ---
async function init() {
    if (cardId && cardId !== 'new') {
        try {
            card = await api.get(`/cards/${cardId}`);
            // Merge defaults to handle old data
            card = { ...DEFAULT_CARD, ...card, services: card.services || [], businessHours: card.businessHours || DEFAULT_CARD.businessHours };
        } catch (e) {
            alert('Card not found');
            window.location.href = 'dashboard.php';
        }
    }
    renderForm();
    renderPreview();
}

// --- Rendering ---
function renderPreview() {
    previewFrame.innerHTML = renderTemplate(card.templateId, card);
}

function updateCard(key, value) {
    // Handle nested keys like socials.email
    if (key.includes('.')) {
        const [parent, child] = key.split('.');
        card[parent] = { ...card[parent], [child]: value };
    } else {
        card[key] = value;
    }
    renderPreview();
}

// --- AI Bio ---
async function generateBio() {
    const btn = document.getElementById('aiBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `${Icons.Sparkles(12)} Generating...`;

    try {
        // Correct initialization using process.env.API_KEY directly as per guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Write a short, engaging professional bio (max 40 words) for a digital business card. 
        Name: ${card.fullName}
        Job: ${card.jobTitle}
        Company: ${card.companyName}
        Tone: professional
        Return only the bio text.`;

        // Update to use gemini-3-flash-preview as recommended for basic text tasks
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        // Using .text property instead of .text() method
        const bio = response.text || "";
        updateCard('bio', bio);
        document.getElementById('bioInput').value = bio;
    } catch (e) {
        console.error(e);
        alert('Failed to generate bio');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// --- Form Rendering ---
function renderForm() {
    formContainer.innerHTML = `
        <section class="space-y-4">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Branding</h3>
            <div>
                <label class="block text-sm font-medium mb-1">Template</label>
                <div class="grid grid-cols-3 gap-2">
                    ${['minimal', 'modern', 'dark', 'professional', 'creative'].map(t => `
                        <button onclick="setTemplate('${t}')" class="p-2 border rounded text-xs capitalize ${card.templateId === t ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50'}">${t}</button>
                    `).join('')}
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Color</label>
                <div class="flex gap-2">
                    ${['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#111827'].map(c => `
                        <button onclick="setColor('${c}')" class="w-8 h-8 rounded-full border-2 ${card.primaryColor === c ? 'border-gray-600 scale-110' : 'border-transparent'}" style="background-color: ${c}"></button>
                    `).join('')}
                </div>
            </div>
        </section>

        <section class="space-y-4 pt-4 border-t">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Profile</h3>
            <div class="flex items-center gap-4">
                <img src="${card.profileImage}" class="w-16 h-16 rounded-full object-cover border">
                <label class="cursor-pointer bg-white border px-3 py-2 rounded text-sm hover:bg-gray-50">
                    Upload Photo <input type="file" class="hidden" accept="image/*" onchange="uploadImage(this, 'profileImage')">
                </label>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" value="${card.fullName}" oninput="updateCard('fullName', this.value)" class="border p-2 rounded text-sm w-full">
                <input type="text" placeholder="Job Title" value="${card.jobTitle}" oninput="updateCard('jobTitle', this.value)" class="border p-2 rounded text-sm w-full">
            </div>
            <input type="text" placeholder="Company" value="${card.companyName}" oninput="updateCard('companyName', this.value)" class="border p-2 rounded text-sm w-full">
            
            <div class="relative">
                <div class="flex justify-between items-center mb-1">
                    <label class="text-sm">Bio</label>
                    <button id="aiBtn" class="text-xs text-purple-600 flex items-center gap-1 hover:underline">
                        ${Icons.Sparkles(12)} AI Generate
                    </button>
                </div>
                <textarea id="bioInput" rows="3" class="w-full border p-2 rounded text-sm" oninput="updateCard('bio', this.value)">${card.bio}</textarea>
            </div>
        </section>

        <section class="space-y-4 pt-4 border-t">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</h3>
            <input type="email" placeholder="Email" value="${card.socials.email || ''}" oninput="updateCard('socials.email', this.value)" class="border p-2 rounded text-sm w-full">
            <input type="tel" placeholder="Phone" value="${card.socials.phone || ''}" oninput="updateCard('socials.phone', this.value)" class="border p-2 rounded text-sm w-full">
            <input type="url" placeholder="Website" value="${card.socials.website || ''}" oninput="updateCard('socials.website', this.value)" class="border p-2 rounded text-sm w-full">
        </section>
    `;

    document.getElementById('aiBtn').onclick = generateBio;
}

// --- Global Handlers ---
window.setTemplate = (t) => { card.templateId = t; init(); }; // Re-render form to show active state
window.setColor = (c) => { updateCard('primaryColor', c); init(); };
window.updateCard = updateCard;
window.uploadImage = async (input, key) => {
    if (input.files && input.files[0]) {
        const base64 = await resizeImage(input.files[0]);
        updateCard(key, base64);
        renderForm(); // Update thumb
    }
};

saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    try {
        await api.post('/cards', card);
        window.location.href = 'dashboard.php';
    } catch (e) {
        alert(e.message);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
    }
};

init();

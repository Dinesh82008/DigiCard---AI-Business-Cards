
// Syncing types with the full set of supported templates and sections used in App.tsx and TemplateRenderer.tsx
export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user'; // Optional role
  subscription: string; // Dynamic subscription ID (e.g., 'free', 'pro_monthly', plan_id)
  subscriptionExpiry?: number; // timestamp
}

export interface Plan {
    id: string;
    name: string;
    price: number;
    interval: 'monthly' | 'lifetime';
    features: string[];
    isPopular?: boolean;
}

// Added 'venura' to TemplateId to fix assignability error in App.tsx
export type TemplateId = 
  | 'minimal' | 'modern' | 'dark' | 'professional' | 'creative' 
  | 'elegant' | 'tech' | 'gradient' | 'glass' | 'playful'
  | 'neobrutalist' | 'monochrome' | 'softui' | 'luxe' | 'cyberpunk'
  | 'retro' | 'botanical' | 'compact' | 'insta' | 'terminal' | 'venura';

export const PREMIUM_TEMPLATES: TemplateId[] = [
  'professional', 'creative', 'elegant', 'tech', 'gradient', 
  'glass', 'playful', 'neobrutalist', 'monochrome', 'softui', 
  'luxe', 'cyberpunk', 'retro', 'botanical', 'compact', 
  'insta', 'terminal', 'venura'
];

export interface SocialLinks {
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  address?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price?: string;
}

export interface BusinessHour {
  id: string;
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export type SectionId = 'about' | 'services' | 'hours' | 'map' | 'gallery';

export interface CardData {
  id: string;
  userId: string;
  slug: string; // unique identifier for URL
  templateId: TemplateId;
  primaryColor: string;
  
  // Personal Info
  fullName: string;
  jobTitle: string;
  companyName: string;
  bio: string;
  aboutTitle: string;
  aboutText: string;
  profileImage?: string; // URL or base64
  bannerImage?: string; // URL or base64 (for modern template)
  logoImage?: string; // URL or base64

  // Contact
  socials: SocialLinks;
  
  // Content Sections
  services: Service[];
  businessHours: BusinessHour[];
  gallery: string[];
  // Added tags property to resolve "Property 'tags' does not exist on type 'CardData'"
  tags: string[];
  showMap: boolean;
  customMapUrl?: string;
  
  // Layout Order
  sectionOrder: SectionId[];

  createdAt: number;
  views: number;
}

export const DEFAULT_CARD: CardData = {
  id: '',
  userId: '',
  slug: '',
  templateId: 'minimal',
  primaryColor: '#3b82f6',
  fullName: 'Your Name',
  jobTitle: 'Job Title',
  companyName: 'Company Inc.',
  bio: 'A short bio about yourself goes here.',
  aboutTitle: 'About Us',
  aboutText: '',
  profileImage: 'https://picsum.photos/200',
  bannerImage: 'https://picsum.photos/800/300',
  socials: {},
  services: [],
  gallery: [],
  // Initialize tags in DEFAULT_CARD
  tags: [],
  businessHours: [
    { id: '1', day: 'Monday', open: '09:00', close: '17:00', isClosed: false },
    { id: '2', day: 'Tuesday', open: '09:00', close: '17:00', isClosed: false },
    { id: '3', day: 'Wednesday', open: '09:00', close: '17:00', isClosed: false },
    { id: '4', day: 'Thursday', open: '09:00', close: '17:00', isClosed: false },
    { id: '5', day: 'Friday', open: '09:00', close: '17:00', isClosed: false },
    { id: '6', day: 'Saturday', open: '10:00', close: '14:00', isClosed: true },
    { id: '7', day: 'Sunday', open: '10:00', close: '14:00', isClosed: true },
  ],
  showMap: true,
  sectionOrder: ['about', 'services', 'gallery', 'hours', 'map'],
  createdAt: Date.now(),
  views: 0,
};

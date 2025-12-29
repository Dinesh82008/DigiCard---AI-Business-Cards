
export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  subscription: string;
  subscriptionExpiry?: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'lifetime';
  features: string[];
  isPopular?: boolean;
}

export type TemplateId = 
  | 'minimal' | 'modern' | 'dark' | 'professional' | 'creative' 
  | 'elegant' | 'tech' | 'gradient' | 'glass' | 'playful'
  | 'neobrutalist' | 'monochrome' | 'softui' | 'luxe' | 'cyberpunk'
  | 'retro' | 'botanical' | 'compact' | 'insta' | 'terminal';

export const PREMIUM_TEMPLATES: TemplateId[] = [
  'professional', 'creative', 'elegant', 'tech', 'gradient', 
  'glass', 'playful', 'neobrutalist', 'monochrome', 'softui', 
  'luxe', 'cyberpunk', 'retro', 'botanical', 'compact', 
  'insta', 'terminal'
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

export type SectionId = 'about' | 'services' | 'hours' | 'map';

export interface CardData {
  id: string;
  userId: string;
  slug: string;
  templateId: TemplateId;
  primaryColor: string;
  fullName: string;
  jobTitle: string;
  companyName: string;
  bio: string;
  aboutTitle: string;
  aboutText: string;
  profileImage: string;
  bannerImage?: string;
  logoImage?: string;
  socials: SocialLinks;
  services: Service[];
  businessHours: BusinessHour[];
  showMap: boolean;
  customMapUrl?: string;
  sectionOrder: SectionId[];
  createdAt: number;
  views: number;
}

export const DEFAULT_CARD: CardData = {
  id: '',
  userId: '',
  slug: '',
  templateId: 'minimal',
  primaryColor: '#4f46e5',
  fullName: 'Your Name',
  jobTitle: 'Professional Title',
  companyName: 'Your Company',
  bio: 'Helping businesses thrive through innovation and strategy.',
  aboutTitle: 'About Us',
  aboutText: '',
  profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  bannerImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800',
  socials: {},
  services: [],
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
  sectionOrder: ['about', 'services', 'hours', 'map'],
  createdAt: Date.now(),
  views: 0,
};

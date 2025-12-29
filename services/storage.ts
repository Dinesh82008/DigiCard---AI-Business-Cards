
import { CardData, User, Plan } from '../types';

const KEYS = {
  SESSION: 'digicard_user_session',
  USERS: 'digicard_registered_users',
  CARDS: 'digicard_cards_data',
  PLANS: 'digicard_plans_data'
};

const INITIAL_PLANS: Plan[] = [
  { id: 'free', name: 'Free Starter', price: 0, interval: 'monthly', features: ['1 Card', '3 Basic Templates'] },
  { id: 'pro', name: 'Pro Monthly', price: 399, interval: 'monthly', features: ['Unlimited Cards', 'All 20 Templates', 'AI Bio Generation'], isPopular: true },
  { id: 'pro_lifetime', name: 'Pro Lifetime', price: 1999, interval: 'lifetime', features: ['Unlimited Cards', 'All 20 Templates', 'AI Bio Generation', 'VIP Support'], isPopular: false }
];

const getRegisteredUsers = (): any[] => {
  const data = localStorage.getItem(KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const storageService = {
  getUser: (): User | null => {
    try {
        const data = localStorage.getItem(KEYS.SESSION);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
  },

  login: async (email: string, password?: string, name?: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const lowerEmail = email.toLowerCase();
    
    // Hardcoded Logic for User Request: dinesh82008@gmail.com with 123123 password
    const isAdmin = lowerEmail === 'dinesh82008@gmail.com' && password === '123123';
    
    let users = getRegisteredUsers();
    let userRecord = users.find(u => u.email.toLowerCase() === lowerEmail);

    if (name) {
      if (userRecord && !isAdmin) throw new Error("Account already exists.");
      const newUser = {
        id: isAdmin ? 'admin-001' : 'u' + Date.now(),
        name: isAdmin ? 'Dinesh Admin' : name,
        email: lowerEmail,
        password: password,
        subscription: isAdmin ? 'pro_lifetime' : 'free',
        role: isAdmin ? 'admin' : 'user'
      };
      if (!isAdmin) {
          users.push(newUser);
          localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
      const sessionUser: User = { id: newUser.id, name: newUser.name, email: newUser.email, subscription: newUser.subscription, role: newUser.role as any };
      localStorage.setItem(KEYS.SESSION, JSON.stringify(sessionUser));
      return sessionUser;
    } else {
      if (isAdmin) {
          const adminUser: User = { id: 'admin-001', name: 'Dinesh Admin', email: 'dinesh82008@gmail.com', subscription: 'pro_lifetime', role: 'admin' };
          localStorage.setItem(KEYS.SESSION, JSON.stringify(adminUser));
          return adminUser;
      }
      if (!userRecord || userRecord.password !== password) throw new Error("Invalid credentials.");
      const sessionUser: User = { id: userRecord.id, name: userRecord.name, email: userRecord.email, subscription: userRecord.subscription, role: userRecord.role };
      localStorage.setItem(KEYS.SESSION, JSON.stringify(sessionUser));
      return sessionUser;
    }
  },

  logout: () => {
    localStorage.removeItem(KEYS.SESSION);
  },

  upgradeUser: async (tier: string): Promise<User> => {
    const data = localStorage.getItem(KEYS.SESSION);
    if (!data) throw new Error("Session expired");
    const user: User = JSON.parse(data);
    user.subscription = tier;
    localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    let users = getRegisteredUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
        users[idx].subscription = tier;
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
    return user;
  },

  getPlans: async (): Promise<Plan[]> => {
    const data = localStorage.getItem(KEYS.PLANS);
    if (!data) {
      localStorage.setItem(KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
      return INITIAL_PLANS;
    }
    return JSON.parse(data);
  },

  getCards: async (userId: string): Promise<CardData[]> => {
    const data = localStorage.getItem(KEYS.CARDS);
    const cards: CardData[] = data ? JSON.parse(data) : [];
    return cards.filter(c => c.userId === userId);
  },

  getCardById: async (id: string): Promise<CardData | undefined> => {
    const data = localStorage.getItem(KEYS.CARDS);
    const cards: CardData[] = data ? JSON.parse(data) : [];
    return cards.find(c => c.id === id);
  },

  saveCard: async (card: CardData): Promise<CardData> => {
    const data = localStorage.getItem(KEYS.CARDS);
    let cards: CardData[] = data ? JSON.parse(data) : [];
    if (!card.id) {
      card.id = 'c' + Date.now();
      card.createdAt = Date.now();
      cards.push(card);
    } else {
      cards = cards.map(c => c.id === card.id ? card : c);
    }
    localStorage.setItem(KEYS.CARDS, JSON.stringify(cards));
    return card;
  },

  deleteCard: async (id: string): Promise<void> => {
    const data = localStorage.getItem(KEYS.CARDS);
    let cards: CardData[] = data ? JSON.parse(data) : [];
    localStorage.setItem(KEYS.CARDS, JSON.stringify(cards.filter(c => c.id !== id)));
  }
};

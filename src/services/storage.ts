import { CardData, User, Plan } from '../types';

// Use relative path for production deployment
// When you build the React app and place it next to api.php on the server
const API_URL = '/api.php/api'; 

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let errorMsg = 'Request failed';
        try {
            const err = await response.json();
            errorMsg = err.error || errorMsg;
        } catch (e) {
            errorMsg = `Request failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
    }
    // Handle empty responses (like 204)
    if (response.status === 204) return null;
    
    try {
        return await response.json();
    } catch (e) {
        // If response is not JSON (but status was OK), return null or throw
        console.warn("Response was not valid JSON", e);
        return null;
    }
};

export const storageService = {
  // --- Auth ---
  getUser: (): User | null => {
    try {
        const data = localStorage.getItem('digicard_user_session');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error("Failed to parse user session", e);
        localStorage.removeItem('digicard_user_session');
        return null;
    }
  },

  login: async (email: string, password?: string, name?: string): Promise<User> => {
    // If name is provided, it's a register call (adapting existing interface)
    const endpoint = name ? '/auth/register' : '/auth/login';
    const payload = name ? { email, password, name } : { email, password };

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const user = await handleResponse(response);
    localStorage.setItem('digicard_user_session', JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem('digicard_user_session');
  },

  upgradeUser: async (tier: 'pro_monthly' | 'pro_lifetime'): Promise<User> => {
      const currentUser = storageService.getUser();
      if (!currentUser) throw new Error("No user logged in");

      const response = await fetch(`${API_URL}/user/upgrade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, tier })
      });
      
      const updatedUser = await handleResponse(response);
      localStorage.setItem('digicard_user_session', JSON.stringify(updatedUser));
      return updatedUser;
  },

  // --- Plans ---
  getPlans: async (): Promise<Plan[]> => {
    try {
        const response = await fetch(`${API_URL}/plans`);
        return await handleResponse(response) || [];
    } catch (e) {
        console.error("Failed to fetch plans", e);
        return [];
    }
  },

  savePlan: async (plan: Plan): Promise<Plan> => {
    const response = await fetch(`${API_URL}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
    });
    return handleResponse(response);
  },

  deletePlan: async (planId: string): Promise<void> => {
      await fetch(`${API_URL}/plans/${planId}`, { method: 'DELETE' });
  },

  // --- Cards ---
  getCards: async (userId: string): Promise<CardData[]> => {
    try {
        const response = await fetch(`${API_URL}/cards?userId=${userId}`);
        return await handleResponse(response) || [];
    } catch (e) {
        console.error("Failed to fetch cards", e);
        return [];
    }
  },

  getCardById: async (cardId: string): Promise<CardData | undefined> => {
    try {
        const response = await fetch(`${API_URL}/cards/${cardId}`);
        if (!response.ok) return undefined;
        return await response.json();
    } catch (e) {
        return undefined;
    }
  },
  
  getCardBySlug: async (slug: string): Promise<CardData | undefined> => {
    try {
        const response = await fetch(`${API_URL}/cards/${slug}`);
        if (!response.ok) return undefined;
        return await response.json();
    } catch (e) {
        return undefined;
    }
  },

  saveCard: async (card: CardData): Promise<CardData> => {
    const response = await fetch(`${API_URL}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card)
    });
    return handleResponse(response);
  },

  deleteCard: async (cardId: string): Promise<void> => {
    await fetch(`${API_URL}/cards/${cardId}`, { method: 'DELETE' });
  }
};

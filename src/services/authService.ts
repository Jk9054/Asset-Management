import { User, UserRole } from '../types';
import { DEMO_USERS } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const CURRENT_USER_KEY = 'govt_asset_mgmt_current_user';

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  if (!data) {
    // Default to Officer for quick demo experience if nothing stored
    return DEMO_USERS[1]; 
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEMO_USERS[1];
  }
};

export const setStoredUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const loginWithEmailPassword = async (email: string): Promise<User> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'password123', // Demo password
      });
      if (!error && data.user) {
        // Fetch profile from users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
          
        if (profile) {
          const userObj: User = {
            id: profile.id,
            name: profile.name || email.split('@')[0],
            email: profile.email,
            role: (profile.role as UserRole) || 'OFFICER',
            department: profile.department || 'Roads & Buildings Department',
          };
          setStoredUser(userObj);
          return userObj;
        }
      }
    } catch (e) {
      console.warn('Supabase auth failed or not seeded, using fallback user lookup', e);
    }
  }

  // Fallback / Demo mode
  const match = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const user = match || {
    id: `user-custom-${Date.now()}`,
    name: email.split('@')[0],
    email,
    role: email.toLowerCase().includes('admin') ? 'ADMIN' : email.toLowerCase().includes('viewer') ? 'VIEWER' : 'OFFICER',
    department: 'Roads & Buildings Department',
  };
  
  setStoredUser(user);
  return user;
};

export const logoutUser = async (): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  }
  setStoredUser(null);
};

export const switchDemoRole = (role: UserRole): User => {
  const user = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[1];
  setStoredUser(user);
  return user;
};

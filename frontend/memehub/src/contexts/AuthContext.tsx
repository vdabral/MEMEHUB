import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';
import { toast } from "sonner";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser?: (user: User | null) => void;
  savedMemes: string[];
  refreshSavedMemes: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMemes, setSavedMemes] = useState<string[]>([]);

  const fetchSavedMemes = async () => {
    if (!authService.isLoggedIn()) {
      setSavedMemes([]);
      return;
    }
    try {
      const memes = await import('../services/memeService').then(m => m.default.getSavedMemes());
      setSavedMemes(memes.map(m => m.id));
    } catch (e) {
      setSavedMemes([]);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (authService.isLoggedIn()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          await fetchSavedMemes();
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const user = await authService.login(identifier, password);
      setUser(user);
      await fetchSavedMemes();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const user = await authService.register(username, email, password);
      setUser(user);
      await fetchSavedMemes();
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setSavedMemes([]);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, savedMemes, refreshSavedMemes: fetchSavedMemes }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/Toast';

export type UserRole = 'ADMIN' | 'FARMER' | 'DISTRIBUTOR' | 'CONSUMER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database (replace with real API calls later)
const MOCK_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@farmconnect.in', password: 'admin123', role: 'ADMIN' as UserRole },
  { id: 2, name: 'John Farmer', email: 'farmer@farmconnect.in', password: 'farmer123', role: 'FARMER' as UserRole },
  { id: 3, name: 'Sarah Distributor', email: 'distributor@farmconnect.in', password: 'dist123', role: 'DISTRIBUTOR' as UserRole },
  { id: 4, name: 'Mike Consumer', email: 'consumer@farmconnect.in', password: 'consumer123', role: 'CONSUMER' as UserRole },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
      setIsLoading(false);
      return true;
    } else {
      toast.error('Invalid email or password');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast.info('You have been logged out');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasRole }}>
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

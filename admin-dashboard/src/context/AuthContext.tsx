import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TokenManager from '../services/TokenManager';

interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  avatar?: string;
  role?: string;
}

interface Tokens {
  access: string;
  refresh: string;
}

interface AuthContextState {
  user: User | null;
  tokens: Tokens | null;
  isLoading: boolean;
  signIn: (tokens: Tokens, user: User) => void;
  signOut: () => void;
}

let AuthContext = createContext<AuthContextState | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

let AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  let navigate = useNavigate();
  let [user, setUser] = useState<User | null>(null);
  let [tokens, setTokens] = useState<Tokens | null>(null);
  let [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let storedTokens = TokenManager.getTokens();
    let storedUser = localStorage.getItem('user');

    if (storedUser && storedTokens && storedTokens.access) {
      setUser(JSON.parse(storedUser));
      setTokens(storedTokens);
    }
    setIsLoading(false);
  }, []);

  let signIn = (newTokens: Tokens, newUser: User) => {
    setTokens(newTokens);
    setUser(newUser);
    TokenManager.setTokens(newTokens);
    localStorage.setItem('user', JSON.stringify(newUser));
    toast.success("Logged in successfully");
    navigate('/dashboard'); // or your dashboard route
  };

  let signOut = () => {
    setUser(null);
    setTokens(null);
    TokenManager.setTokens(null);
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
    navigate('/login'); // or your login route
  };

  return (
    <AuthContext.Provider value={{ user, tokens, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

let useAuth = (): AuthContextState => {
  let context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth, AuthContext };

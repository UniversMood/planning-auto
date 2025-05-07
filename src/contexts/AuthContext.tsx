import React, { createContext, useState, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructeur' | 'eleve';
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('utilisateur')
        .select('id, name, email, role')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error) {
        throw new Error('Email ou mot de passe incorrect');
      }

      if (!data) {
        throw new Error('Utilisateur non trouvé');
      }

      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as 'admin' | 'instructeur' | 'eleve'
      });

      toast.success('Connexion réussie !');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Vérifier si l'email existe déjà
      const { data: existingUser } = await supabase
        .from('utilisateur')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Créer le nouvel utilisateur
      const { data, error } = await supabase
        .from('utilisateur')
        .insert([
          {
            name,
            email,
            password,
            role: 'eleve' // Default role
          }
        ])
        .select('id, name, email, role')
        .single();

      if (error) {
        throw new Error('Erreur lors de la création du compte');
      }

      if (!data) {
        throw new Error('Erreur lors de la création du compte');
      }

      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as 'admin' | 'instructeur' | 'eleve'
      });

      toast.success('Inscription réussie !');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
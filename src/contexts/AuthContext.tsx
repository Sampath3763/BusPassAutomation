
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  role: 'student' | 'admin';
  name?: string;
  rollNumber?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'admin') => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fixed admin credentials
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123456";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string, role: 'student' | 'admin'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Admin login check
      if (role === 'admin') {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          const adminUser: User = {
            id: "admin-1",
            email: ADMIN_EMAIL,
            role: 'admin',
            name: "Administrator",
          };
          
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          toast.success("Logged in as administrator");
          return true;
        } else {
          toast.error("Invalid admin credentials");
          return false;
        }
      }
      
      // Regular student login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demonstration purposes, we'll accept any email/password combo for students
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        email,
        role: 'student',
        name: email.split('@')[0], // Just a placeholder
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      toast.success("Logged in successfully!");
      return true;
    } catch (error) {
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demonstration purposes - student signup only
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        email,
        role: 'student',
        name: email.split('@')[0], // Just a placeholder
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

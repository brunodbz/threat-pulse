import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated users database - In production, this would come from your backend
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@empresa.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin' as const,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
    isActive: true,
  },
  {
    id: '2',
    email: 'gestor@empresa.com',
    password: 'gestor123',
    name: 'João Silva',
    role: 'gestor' as const,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date(),
    isActive: true,
  },
  {
    id: '3',
    email: 'analista@empresa.com',
    password: 'analista123',
    name: 'Maria Santos',
    role: 'analista' as const,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    createdAt: new Date('2024-02-01'),
    lastLogin: new Date(),
    isActive: true,
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('securityDashboardUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('securityDashboardUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      const userData = {
        ...userWithoutPassword,
        lastLogin: new Date(),
      };
      
      setUser(userData);
      localStorage.setItem('securityDashboardUser', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('securityDashboardUser');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
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

// Hook para verificar permissões
export function usePermissions() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      canViewDashboard: false,
      canManageUsers: false,
      canConfigureAlerts: false,
      canExportData: false,
      canViewAuditLog: false,
      canDeleteAuditLog: false,
      canManageIntegrations: false,
    };
  }

  const rolePermissions = {
    admin: {
      canViewDashboard: true,
      canManageUsers: true,
      canConfigureAlerts: true,
      canExportData: true,
      canViewAuditLog: true,
      canDeleteAuditLog: true,
      canManageIntegrations: true,
    },
    gestor: {
      canViewDashboard: true,
      canManageUsers: false,
      canConfigureAlerts: false,
      canExportData: true,
      canViewAuditLog: true,
      canDeleteAuditLog: false,
      canManageIntegrations: false,
    },
    analista: {
      canViewDashboard: true,
      canManageUsers: false,
      canConfigureAlerts: true,
      canExportData: false,
      canViewAuditLog: true,
      canDeleteAuditLog: false,
      canManageIntegrations: true,
    },
  };

  return rolePermissions[user.role];
}
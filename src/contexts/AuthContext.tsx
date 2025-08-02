import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { MFAVerification } from '@/components/auth/MFAVerification';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TODO: Replace with real authentication system (Supabase Auth, Firebase Auth, etc.)
// This should connect to your actual user management system

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMFAVerification, setShowMFAVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

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
    
    try {
      // TODO: Implement real authentication logic here
      // Example integrations:
      // - Supabase: supabase.auth.signInWithPassword({ email, password })
      // - Firebase: signInWithEmailAndPassword(auth, email, password)
      // - Custom API: await authApi.login(email, password)
      
      // For now, return false as no authentication system is configured
      console.log('Authentication system not configured. Please implement real authentication.');
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const handleMFAVerificationSuccess = () => {
    if (pendingUser) {
      setUser(pendingUser);
      localStorage.setItem('securityDashboardUser', JSON.stringify(pendingUser));
      setPendingUser(null);
      setShowMFAVerification(false);
    }
  };

  const handleMFAVerificationCancel = () => {
    setPendingUser(null);
    setShowMFAVerification(false);
  };

  const logout = () => {
    setUser(null);
    setPendingUser(null);
    setShowMFAVerification(false);
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
      {showMFAVerification && pendingUser && (
        <MFAVerification
          onVerificationSuccess={handleMFAVerificationSuccess}
          onCancel={handleMFAVerificationCancel}
          userEmail={pendingUser.email}
        />
      )}
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { MFAVerification } from '@/components/auth/MFAVerification';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMFAVerification, setShowMFAVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select(`
                  *,
                  user_roles (role)
                `)
                .eq('user_id', session.user.id)
                .maybeSingle();

              if (error) {
                console.error('Error fetching user profile:', error);
                setIsLoading(false);
                return;
              }

              if (profile && mounted) {
                const userData: User = {
                  id: profile.user_id,
                  email: profile.email,
                  name: profile.name,
                  role: (profile.user_roles?.[0] as any)?.role || 'analista',
                  avatar: profile.avatar_url,
                  createdAt: new Date(profile.created_at),
                  lastLogin: new Date(),
                  isActive: true
                };
                setUser(userData);
              } else if (mounted) {
                console.log('No profile found for user, creating default user object');
                const userData: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
                  role: 'analista',
                  avatar: undefined,
                  createdAt: new Date(),
                  lastLogin: new Date(),
                  isActive: true
                };
                setUser(userData);
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            } finally {
              if (mounted) {
                setIsLoading(false);
              }
            }
          }, 100);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
        return;
      }
      
      if (!session) {
        setUser(null);
        setIsLoading(false);
      }
      // If session exists, it will be handled by the auth state change listener
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.session) {
        console.log('Login successful, session created');
        // Auth state change will be handled by the listener
        return true;
      }

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

  const logout = async () => {
    try {
      // Clean up auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      setUser(null);
      setSession(null);
      setPendingUser(null);
      setShowMFAVerification(false);
      localStorage.removeItem('securityDashboardUser');
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
    }
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

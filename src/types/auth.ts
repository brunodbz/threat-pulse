export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'gestor' | 'analista';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface Permission {
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canConfigureAlerts: boolean;
  canExportData: boolean;
  canViewAuditLog: boolean;
  canDeleteAuditLog: boolean;
  canManageIntegrations: boolean;
}

export const rolePermissions: Record<string, Permission> = {
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
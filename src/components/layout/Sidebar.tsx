import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Shield,
  BarChart3,
  Users,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  Menu,
  Home,
  Activity,
  Database,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth, usePermissions } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: Home,
    permission: "canViewDashboard",
    description: "Visão geral do sistema"
  },
  { 
    title: "Alertas", 
    url: "/alerts", 
    icon: AlertTriangle,
    permission: "canViewDashboard",
    description: "Monitoramento de ameaças"
  },
  { 
    title: "Analytics", 
    url: "/analytics", 
    icon: BarChart3,
    permission: "canViewDashboard",
    description: "Relatórios e métricas"
  },
  { 
    title: "Auditoria", 
    url: "/audit", 
    icon: FileText,
    permission: "canViewAuditLog",
    description: "Log de atividades"
  },
  { 
    title: "Usuários", 
    url: "/users", 
    icon: Users,
    permission: "canManageUsers",
    description: "Gestão de usuários"
  },
  { 
    title: "Integrações", 
    url: "/integrations", 
    icon: Database,
    permission: "canManageIntegrations",
    description: "APIs e conectores"
  },
  { 
    title: "Configurações", 
    url: "/settings", 
    icon: Settings,
    permission: "canConfigureAlerts",
    description: "Configurações do sistema"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/20 text-primary border-r-2 border-primary font-medium" 
      : "hover:bg-muted/50 transition-fast";

  // Filtrar itens baseado nas permissões
  const allowedItems = menuItems.filter(item => {
    if (item.permission === "canViewDashboard") return permissions.canViewDashboard;
    if (item.permission === "canManageUsers") return permissions.canManageUsers;
    if (item.permission === "canViewAuditLog") return permissions.canViewAuditLog;
    if (item.permission === "canManageIntegrations") return permissions.canManageIntegrations;
    if (item.permission === "canConfigureAlerts") return permissions.canConfigureAlerts;
    return true;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-critical text-white';
      case 'gestor': return 'bg-warning text-warning-foreground';
      case 'analista': return 'bg-success text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'gestor': return 'Gestor';
      case 'analista': return 'Analista';
      default: return role;
    }
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-64"} transition-all duration-300 bg-sidebar border-sidebar-border`}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        {/* Header */}
        <div className={`p-4 border-b border-sidebar-border ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-primary rounded-lg p-2 shadow-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h1 className="text-lg font-bold text-sidebar-foreground">SecureSOC</h1>
                <p className="text-xs text-sidebar-foreground/60">Dashboard v2.0</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className={`p-4 border-b border-sidebar-border ${isCollapsed ? 'px-2' : ''}`}>
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!isCollapsed && "Menu Principal"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {allowedItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                      title={isCollapsed ? item.title : item.description}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="block font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground block truncate">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className={`p-4 border-t border-sidebar-border ${isCollapsed ? 'px-2' : ''}`}>
          <Button
            variant="ghost"
            size={isCollapsed ? "sm" : "default"}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent transition-fast"
            onClick={logout}
            title="Sair do sistema"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
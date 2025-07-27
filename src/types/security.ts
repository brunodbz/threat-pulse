export interface SecurityEvent {
  id: string;
  source: 'elastic' | 'trellix' | 'defender' | 'tenable';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignee?: string;
  tags: string[];
  details: Record<string, any>;
}

export interface VulnerabilityData {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  remediated: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AssetData {
  total: number;
  online: number;
  offline: number;
  vulnerable: number;
  compliant: number;
  riskScore: number;
}

export interface ThreatIntelligence {
  indicators: number;
  blocked: number;
  allowed: number;
  investigating: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
}

export interface DashboardMetrics {
  events: SecurityEvent[];
  vulnerabilities: VulnerabilityData;
  assets: AssetData;
  threats: ThreatIntelligence;
  recentActivity: AuditLogEntry[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  source: 'elastic' | 'trellix' | 'defender' | 'tenable' | 'all';
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  conditions: Record<string, any>;
  actions: {
    email?: boolean;
    telegram?: boolean;
    dashboard?: boolean;
  };
  createdBy: string;
  createdAt: Date;
  lastTriggered?: Date;
}
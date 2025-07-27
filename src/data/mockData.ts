import { SecurityEvent, VulnerabilityData, AssetData, ThreatIntelligence, AuditLogEntry, DashboardMetrics } from '@/types/security';

// Mock data generator functions for realistic security dashboard data

export const generateMockEvents = (): SecurityEvent[] => {
  const sources = ['elastic', 'trellix', 'defender', 'tenable'] as const;
  const severities = ['critical', 'high', 'medium', 'low'] as const;
  const statuses = ['open', 'investigating', 'resolved', 'false_positive'] as const;
  
  const eventTemplates = [
    // Elastic Events
    { source: 'elastic', title: 'Suspicious Login Activity', description: 'Multiple failed login attempts detected from IP 192.168.1.100' },
    { source: 'elastic', title: 'SQL Injection Attempt', description: 'Malicious SQL query detected in web application logs' },
    { source: 'elastic', title: 'Port Scan Detected', description: 'Network port scanning activity from external IP' },
    { source: 'elastic', title: 'Privilege Escalation', description: 'User account gained elevated privileges unexpectedly' },
    { source: 'elastic', title: 'Data Exfiltration Alert', description: 'Unusual data transfer volumes detected' },
    
    // Trellix Events
    { source: 'trellix', title: 'Malware Detection', description: 'Trojan.GenKryptor detected and quarantined' },
    { source: 'trellix', title: 'Ransomware Activity', description: 'File encryption behavior detected on workstation WS-001' },
    { source: 'trellix', title: 'Phishing Email Blocked', description: 'Malicious email attachment blocked before delivery' },
    { source: 'trellix', title: 'Command & Control', description: 'Outbound connection to known C2 server blocked' },
    { source: 'trellix', title: 'Zero-Day Exploit', description: 'Unknown exploit pattern detected and analyzed' },
    
    // Microsoft Defender Events
    { source: 'defender', title: 'ATP Alert', description: 'Advanced threat protection triggered on endpoint EP-042' },
    { source: 'defender', title: 'Cloud App Security', description: 'Unauthorized access attempt to Office 365' },
    { source: 'defender', title: 'Identity Protection', description: 'Impossible travel detected for user account' },
    { source: 'defender', title: 'Device Compliance', description: 'Non-compliant device attempted network access' },
    { source: 'defender', title: 'Safe Attachments', description: 'Malicious file detonated in sandbox environment' },
    
    // Tenable Events
    { source: 'tenable', title: 'Critical Vulnerability', description: 'CVE-2024-0001 detected on production server' },
    { source: 'tenable', title: 'Missing Security Patch', description: 'Critical security update not installed on 15 hosts' },
    { source: 'tenable', title: 'Weak Authentication', description: 'Default credentials found on network device' },
    { source: 'tenable', title: 'Network Misconfiguration', description: 'Open ports detected on firewall configuration' },
    { source: 'tenable', title: 'Compliance Violation', description: 'PCI-DSS compliance check failed on payment server' },
  ];

  return eventTemplates.map((template, index) => ({
    id: `event-${index + 1}`,
    source: template.source as 'elastic' | 'trellix' | 'defender' | 'tenable',
    title: template.title,
    description: template.description,
    severity: severities[Math.floor(Math.random() * severities.length)],
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
    status: statuses[Math.floor(Math.random() * statuses.length)],
    assignee: Math.random() > 0.5 ? ['João Silva', 'Maria Santos', 'Carlos Lima'][Math.floor(Math.random() * 3)] : undefined,
    tags: ['security', 'automated', 'monitoring'].slice(0, Math.floor(Math.random() * 3) + 1),
    details: {
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      affected_systems: Math.floor(Math.random() * 10) + 1,
      confidence: Math.floor(Math.random() * 100) + 1,
    },
  }));
};

export const generateVulnerabilityData = (): VulnerabilityData => ({
  total: 1247,
  critical: 23,
  high: 156,
  medium: 428,
  low: 640,
  remediated: 892,
  trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
});

export const generateAssetData = (): AssetData => ({
  total: 2847,
  online: 2703,
  offline: 144,
  vulnerable: 234,
  compliant: 2613,
  riskScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
});

export const generateThreatIntelligence = (): ThreatIntelligence => ({
  indicators: 45672,
  blocked: 1892,
  allowed: 43234,
  investigating: 546,
  confidence: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
});

export const generateAuditLog = (): AuditLogEntry[] => {
  const users = ['admin@empresa.com', 'gestor@empresa.com', 'analista@empresa.com', 'system'];
  const actions = [
    'User Login',
    'User Logout',
    'Alert Configuration Changed',
    'User Created',
    'User Modified',
    'User Deleted',
    'Integration Added',
    'Integration Modified',
    'Report Generated',
    'Export Downloaded',
    'Security Policy Updated',
    'Audit Log Cleared',
    'Dashboard Accessed',
    'System Backup Created',
    'Password Changed',
  ];
  
  const resources = [
    'User Management',
    'Alert System',
    'Dashboard',
    'Elastic Integration',
    'Trellix Integration',
    'Defender Integration',
    'Tenable Integration',
    'Audit System',
    'Report Engine',
    'Security Policies',
  ];

  return Array.from({ length: 150 }, (_, index) => ({
    id: `audit-${index + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
    user: users[Math.floor(Math.random() * users.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    resource: resources[Math.floor(Math.random() * resources.length)],
    details: 'Action completed successfully with standard parameters',
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: ['success', 'failed', 'warning'][Math.floor(Math.random() * 3)] as 'success' | 'failed' | 'warning',
  }));
};

export const generateDashboardMetrics = (): DashboardMetrics => ({
  events: generateMockEvents(),
  vulnerabilities: generateVulnerabilityData(),
  assets: generateAssetData(),
  threats: generateThreatIntelligence(),
  recentActivity: generateAuditLog().slice(0, 10),
});

// Simulated API delay for realistic data fetching
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  async getDashboardData(): Promise<DashboardMetrics> {
    await delay();
    return generateDashboardMetrics();
  },
  
  async getEvents(filters?: { source?: string; severity?: string; status?: string }): Promise<SecurityEvent[]> {
    await delay();
    let events = generateMockEvents();
    
    if (filters?.source) {
      events = events.filter(e => e.source === filters.source);
    }
    if (filters?.severity) {
      events = events.filter(e => e.severity === filters.severity);
    }
    if (filters?.status) {
      events = events.filter(e => e.status === filters.status);
    }
    
    return events;
  },
  
  async getAuditLog(filters?: { user?: string; action?: string; dateRange?: { start: Date; end: Date } }): Promise<AuditLogEntry[]> {
    await delay();
    let logs = generateAuditLog();
    
    if (filters?.user) {
      logs = logs.filter(log => log.user.includes(filters.user!));
    }
    if (filters?.action) {
      logs = logs.filter(log => log.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }
    if (filters?.dateRange) {
      logs = logs.filter(log => 
        log.timestamp >= filters.dateRange!.start && 
        log.timestamp <= filters.dateRange!.end
      );
    }
    
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },
};

// Real-time alert simulation
export const simulateRealTimeAlert = (): SecurityEvent => {
  const criticalEvents = [
    { source: 'defender', title: 'CRITICAL: Active Breach Detected', description: 'Unauthorized access to sensitive database detected' },
    { source: 'trellix', title: 'CRITICAL: Ransomware Outbreak', description: 'Multiple endpoints showing encryption activity' },
    { source: 'elastic', title: 'CRITICAL: Data Exfiltration', description: 'Large data transfer to external IP detected' },
    { source: 'tenable', title: 'CRITICAL: Zero-Day Exploit', description: 'Unknown vulnerability being actively exploited' },
  ];
  
  const template = criticalEvents[Math.floor(Math.random() * criticalEvents.length)];
  
  return {
    id: `critical-${Date.now()}`,
    source: template.source as any,
    title: template.title,
    description: template.description,
    severity: 'critical',
    timestamp: new Date(),
    status: 'open',
    tags: ['critical', 'real-time', 'urgent'],
    details: {
      confidence: 95,
      automated_response: true,
      escalation_required: true,
    },
  };
};
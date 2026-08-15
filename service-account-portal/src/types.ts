export interface BankRecord {
  code: string;
  name: string;
  routingCode: string;
  swiftBic: string;
  settlementAccount: string;
  ledgerId: string;
  complianceStatus: 'Passed' | 'Pending Review' | 'Audited';
  dailyLimitUsd: number;
}

export interface LastScanRecord {
  scanId: string;
  timestamp: string;
  status: 'passed' | 'warning' | 'critical' | 'audited';
  totalServices: number;
  onlineServices: number;
  maintenanceServices: number;
  offlineServices: number;
  latencyAvgMs: number;
  bankVerified: boolean;
  complianceScore: number;
  filename: string;
  summary: string;
  servicesSnapshot: {
    name: string;
    status: string;
    version: string;
    latencyMs?: number;
  }[];
}

export interface AccountInfo {
  awsId: number;
  name: string;
  title: string;
  clusterName: string;
  region: string;
  clusterStatus: 'healthy' | 'degraded' | 'maintenance';
  availability: 'available' | 'maintenance' | 'offline';
  nodesCount: number;
  attachedBank: BankRecord;
  lastScan?: LastScanRecord;
}

export interface ServiceItem {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  version: string;
  account: string;
  bank: string;
  env: 'prod' | 'uat' | 'qa' | 'sbx';
  serviceType: 'API' | 'Lambda' | 'Fargate';
  lastUpdated: { seconds: number };
  activeConnections?: number;
  latencyMs?: number;
}

export interface LocalReviewFile {
  filename: string;
  sizeBytes: number;
  modifiedAt: string;
  title?: string;
  id?: string;
  accountName?: string;
  bankCode?: string;
  reviewNotes?: string;
  content?: any;
}

export interface AuditSnapshotPackage {
  id: string;
  generatedAt: string;
  title: string;
  account: AccountInfo;
  services: ServiceItem[];
  reviewNotes: string;
}

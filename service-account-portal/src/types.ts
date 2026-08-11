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

export interface AccountInfo {
  awsId: number;
  name: string;
  title: string;
  clusterName: string;
  region: string;
  clusterStatus: 'healthy' | 'degraded' | 'maintenance';
  nodesCount: number;
  attachedBank: BankRecord;
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

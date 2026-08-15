import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REVIEWS_DIR = path.join(__dirname, "storage", "reviews");
if (!fs.existsSync(REVIEWS_DIR)) {
  fs.mkdirSync(REVIEWS_DIR, { recursive: true });
}

// Master Accounts with Cluster Names, Availability & Attached Bank Records
export const ACCOUNTS_DATA = [
  {
    awsId: 111122223333,
    name: "057",
    title: "Corporate Banking",
    clusterName: "prod-cluster-us-east-1a",
    region: "us-east-1",
    clusterStatus: "healthy",
    availability: "available",
    nodesCount: 24,
    attachedBank: {
      code: "NW",
      name: "NatWest Group",
      routingCode: "60-12-34",
      swiftBic: "NWBKGB2L",
      settlementAccount: "GB82NWBK60123412345678",
      ledgerId: "LEDGER-CORP-057",
      complianceStatus: "Passed",
      dailyLimitUsd: 50000000
    },
    lastScan: {
      scanId: "scan-057-8912",
      timestamp: "2026-08-15T16:45:00.000Z",
      status: "passed",
      totalServices: 2,
      onlineServices: 1,
      maintenanceServices: 1,
      offlineServices: 0,
      latencyAvgMs: 51,
      bankVerified: true,
      complianceScore: 98,
      filename: "account-057-cluster-report.json",
      summary: "Verified 2 services across cluster prod-cluster-us-east-1a. NatWest settlement ledger in compliance.",
      servicesSnapshot: [
        { name: "Authentication API", status: "online", version: "v2.4.1", latencyMs: 14 },
        { name: "Audit Logging Service", status: "maintenance", version: "v1.1.2", latencyMs: 88 }
      ]
    }
  },
  {
    awsId: 444455556666,
    name: "058",
    title: "Retail Dev",
    clusterName: "uat-cluster-eu-west-1b",
    region: "eu-west-1",
    clusterStatus: "healthy",
    availability: "available",
    nodesCount: 12,
    attachedBank: {
      code: "BB",
      name: "Barclays Bank",
      routingCode: "20-00-00",
      swiftBic: "BARCGB22",
      settlementAccount: "GB14BARC20000098765432",
      ledgerId: "LEDGER-RETAIL-058",
      complianceStatus: "Passed",
      dailyLimitUsd: 25000000
    },
    lastScan: {
      scanId: "scan-058-4420",
      timestamp: "2026-08-15T16:30:00.000Z",
      status: "passed",
      totalServices: 2,
      onlineServices: 1,
      maintenanceServices: 1,
      offlineServices: 0,
      latencyAvgMs: 32,
      bankVerified: true,
      complianceScore: 96,
      filename: "account-058-retail-scan.json",
      summary: "Payment Gateway in maintenance for routine patch. Reporting Engine online with 19ms latency.",
      servicesSnapshot: [
        { name: "Reporting Engine", status: "online", version: "v3.0.0", latencyMs: 19 },
        { name: "Payment Gateway", status: "maintenance", version: "v1.0.8", latencyMs: 45 }
      ]
    }
  },
  {
    awsId: 777788889999,
    name: "074",
    title: "Global Treasury",
    clusterName: "eks-treasury-eu-west-1",
    region: "eu-west-1",
    clusterStatus: "degraded",
    availability: "available",
    nodesCount: 16,
    attachedBank: {
      code: "RBS",
      name: "Royal Bank of Scotland",
      routingCode: "83-04-11",
      swiftBic: "RBOSGB2L",
      settlementAccount: "GB91RBOS83041187654321",
      ledgerId: "LEDGER-TREASURY-074",
      complianceStatus: "Audited",
      dailyLimitUsd: 120000000
    },
    lastScan: {
      scanId: "scan-074-7711",
      timestamp: "2026-08-15T16:15:00.000Z",
      status: "warning",
      totalServices: 1,
      onlineServices: 0,
      maintenanceServices: 0,
      offlineServices: 1,
      latencyAvgMs: 0,
      bankVerified: true,
      complianceScore: 84,
      filename: "bank-rbs-service-audit.json",
      summary: "Legacy Database reported offline. Failover replication protocol engaged.",
      servicesSnapshot: [
        { name: "Legacy Database", status: "offline", version: "v0.9.2", latencyMs: 0 }
      ]
    }
  },
  {
    awsId: 121234345656,
    name: "075",
    title: "Venture Capital",
    clusterName: "fargate-vc-us-west-2",
    region: "us-west-2",
    clusterStatus: "healthy",
    availability: "available",
    nodesCount: 8,
    attachedBank: {
      code: "NW",
      name: "NatWest Group",
      routingCode: "60-12-35",
      swiftBic: "NWBKGB2L",
      settlementAccount: "GB82NWBK60123511223344",
      ledgerId: "LEDGER-VC-075",
      complianceStatus: "Passed",
      dailyLimitUsd: 30000000
    },
    lastScan: {
      scanId: "scan-075-3390",
      timestamp: "2026-08-15T16:00:00.000Z",
      status: "passed",
      totalServices: 1,
      onlineServices: 1,
      maintenanceServices: 0,
      offlineServices: 0,
      latencyAvgMs: 32,
      bankVerified: true,
      complianceScore: 99,
      filename: "account-075-vc-scan.json",
      summary: "Image Processing Lambda running nominal with 890 active connections.",
      servicesSnapshot: [
        { name: "Image Processing", status: "online", version: "v3.1.0", latencyMs: 32 }
      ]
    }
  },
  {
    awsId: 989876765454,
    name: "076",
    title: "Asset Management",
    clusterName: "eks-asset-ap-southeast-1",
    region: "ap-southeast-1",
    clusterStatus: "maintenance",
    availability: "available",
    nodesCount: 10,
    attachedBank: {
      code: "HSBC",
      name: "HSBC Global Finance",
      routingCode: "40-05-15",
      swiftBic: "MIDLGB22",
      settlementAccount: "GB44MIDL40051533445566",
      ledgerId: "LEDGER-ASSET-076",
      complianceStatus: "Pending Review",
      dailyLimitUsd: 75000000
    },
    lastScan: {
      scanId: "scan-076-1209",
      timestamp: "2026-08-15T15:45:00.000Z",
      status: "passed",
      totalServices: 1,
      onlineServices: 1,
      maintenanceServices: 0,
      offlineServices: 0,
      latencyAvgMs: 22,
      bankVerified: true,
      complianceScore: 92,
      filename: "account-076-asset-scan.json",
      summary: "Notification Dispatcher operating normally. Cluster nodes undergo scheduled rolling refresh.",
      servicesSnapshot: [
        { name: "Notification Dispatcher", status: "online", version: "v1.2.0", latencyMs: 22 }
      ]
    }
  },
  {
    awsId: 545465657676,
    name: "080",
    title: "Wealth Admin",
    clusterName: "cluster-wealth-prod-01",
    region: "us-east-1",
    clusterStatus: "healthy",
    availability: "available",
    nodesCount: 18,
    attachedBank: {
      code: "GMM",
      name: "Global Money Management",
      routingCode: "90-11-22",
      swiftBic: "GMMUS33X",
      settlementAccount: "US99GMMU90112255667788",
      ledgerId: "LEDGER-WEALTH-080",
      complianceStatus: "Passed",
      dailyLimitUsd: 100000000
    },
    lastScan: {
      scanId: "scan-080-6644",
      timestamp: "2026-08-15T15:30:00.000Z",
      status: "passed",
      totalServices: 1,
      onlineServices: 1,
      maintenanceServices: 0,
      offlineServices: 0,
      latencyAvgMs: 8,
      bankVerified: true,
      complianceScore: 100,
      filename: "account-080-wealth-scan.json",
      summary: "Transaction Processor API verified under 8ms response latency and high throughput.",
      servicesSnapshot: [
        { name: "Transaction Processor", status: "online", version: "v2.0.1", latencyMs: 8 }
      ]
    }
  },
  {
    awsId: 323243435454,
    name: "081",
    title: "Securities Ops",
    clusterName: "eks-securities-sa-east-1",
    region: "sa-east-1",
    clusterStatus: "degraded",
    availability: "available",
    nodesCount: 6,
    attachedBank: {
      code: "JPMC",
      name: "JPMorgan Chase",
      routingCode: "02-10-00",
      swiftBic: "CHASUS33",
      settlementAccount: "US12CHAS02100077889900",
      ledgerId: "LEDGER-SEC-081",
      complianceStatus: "Pending Review",
      dailyLimitUsd: 150000000
    },
    lastScan: {
      scanId: "scan-081-5501",
      timestamp: "2026-08-15T15:00:00.000Z",
      status: "warning",
      totalServices: 1,
      onlineServices: 0,
      maintenanceServices: 0,
      offlineServices: 1,
      latencyAvgMs: 0,
      bankVerified: true,
      complianceScore: 80,
      filename: "account-081-securities-scan.json",
      summary: "Customer Analytics Fargate task marked offline in sandbox. Node scaling requested.",
      servicesSnapshot: [
        { name: "Customer Analytics", status: "offline", version: "v0.5.4", latencyMs: 0 }
      ]
    }
  }
];

let services: any[] = [
  { id: 'ex-1', name: 'Authentication API', status: 'online', version: 'v2.4.1', account: '057', bank: 'NW', env: 'prod', serviceType: 'API', lastUpdated: { seconds: Date.now() / 1000 }, activeConnections: 1420, latencyMs: 14 },
  { id: 'ex-2', name: 'Payment Gateway', status: 'maintenance', version: 'v1.0.8', account: '058', bank: 'BB', env: 'uat', serviceType: 'Lambda', lastUpdated: { seconds: (Date.now() - 3600000) / 1000 }, activeConnections: 240, latencyMs: 45 },
  { id: 'ex-3', name: 'Legacy Database', status: 'offline', version: 'v0.9.2', account: '074', bank: 'RBS', env: 'prod', serviceType: 'Fargate', lastUpdated: { seconds: (Date.now() - 7200000) / 1000 }, activeConnections: 0, latencyMs: 0 },
  { id: 'ex-4', name: 'Image Processing', status: 'online', version: 'v3.1.0', account: '075', bank: 'NW', env: 'qa', serviceType: 'Lambda', lastUpdated: { seconds: Date.now() / 1000 }, activeConnections: 890, latencyMs: 32 },
  { id: 'ex-5', name: 'Notification Dispatcher', status: 'online', version: 'v1.2.0', account: '076', bank: 'HSBC', env: 'qa', serviceType: 'Lambda', lastUpdated: { seconds: Date.now() / 1000 }, activeConnections: 310, latencyMs: 22 },
  { id: 'ex-6', name: 'Transaction Processor', status: 'online', version: 'v2.0.1', account: '080', bank: 'GMM', env: 'prod', serviceType: 'API', lastUpdated: { seconds: Date.now() / 1000 }, activeConnections: 3450, latencyMs: 8 },
  { id: 'ex-7', name: 'Customer Analytics', status: 'offline', version: 'v0.5.4', account: '081', bank: 'JPMC', env: 'sbx', serviceType: 'Fargate', lastUpdated: { seconds: (Date.now() - 14400000) / 1000 }, activeConnections: 0, latencyMs: 0 },
  { id: 'ex-8', name: 'Audit Logging Service', status: 'maintenance', version: 'v1.1.2', account: '057', bank: 'NW', env: 'uat', serviceType: 'API', lastUpdated: { seconds: (Date.now() - 1800000) / 1000 }, activeConnections: 45, latencyMs: 88 },
  { id: 'ex-9', name: 'Reporting Engine', status: 'online', version: 'v3.0.0', account: '058', bank: 'BB', env: 'prod', serviceType: 'Fargate', lastUpdated: { seconds: Date.now() / 1000 }, activeConnections: 1100, latencyMs: 19 },
];

// Initialize sample review files in storage/reviews
function initializeSampleFiles() {
  ACCOUNTS_DATA.forEach(acc => {
    if (acc.lastScan) {
      const filePath = path.join(REVIEWS_DIR, acc.lastScan.filename);
      if (!fs.existsSync(filePath)) {
        const payload = {
          id: acc.lastScan.scanId,
          generatedAt: acc.lastScan.timestamp,
          title: `Account ${acc.name} - ${acc.title} Cluster Scan Report`,
          account: acc,
          services: services.filter(s => s.account === acc.name),
          lastScanMetadata: acc.lastScan,
          reviewNotes: acc.lastScan.summary
        };
        fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
      }
    }
  });
}

initializeSampleFiles();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/accounts", (req, res) => {
    res.json(ACCOUNTS_DATA);
  });

  app.get("/api/services", (req, res) => {
    res.json(services);
  });

  app.post("/api/services", (req, res) => {
    const { name, version, status, account, bank, env, serviceType } = req.body;
    const newService = {
      id: "svc-" + Math.random().toString(36).substring(2, 9),
      name,
      version,
      status: status || "online",
      account: account || "057",
      bank: bank || "NW",
      env: env || "sbx",
      serviceType: serviceType || "API",
      lastUpdated: { seconds: Date.now() / 1000 },
      activeConnections: Math.floor(Math.random() * 500) + 10,
      latencyMs: Math.floor(Math.random() * 40) + 5
    };
    services.push(newService);
    res.json(newService);
  });

  app.delete("/api/services/:id", (req, res) => {
    services = services.filter(s => s.id !== req.params.id);
    res.json({ success: true });
  });

  // Service Request & Audit compilation endpoint
  app.post("/api/services/request-audit", (req, res) => {
    const { accountName, bankCode, env, serviceType, notes } = req.body;

    let filtered = services;
    if (accountName) filtered = filtered.filter(s => s.account === accountName);
    if (bankCode) filtered = filtered.filter(s => s.bank === bankCode);
    if (env) filtered = filtered.filter(s => s.env === env);
    if (serviceType) filtered = filtered.filter(s => s.serviceType === serviceType);

    const targetAccount = ACCOUNTS_DATA.find(a => a.name === accountName) || ACCOUNTS_DATA[0];

    const onlineCount = filtered.filter(s => s.status === 'online').length;
    const maintCount = filtered.filter(s => s.status === 'maintenance').length;
    const offlineCount = filtered.filter(s => s.status === 'offline').length;
    const avgLatency = filtered.length > 0
      ? Math.round(filtered.reduce((acc, s) => acc + (s.latencyMs || 20), 0) / filtered.length)
      : 25;

    const scanRecord = {
      scanId: `scan-${targetAccount.name}-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      status: offlineCount > 0 ? "warning" : "passed",
      totalServices: filtered.length,
      onlineServices: onlineCount,
      maintenanceServices: maintCount,
      offlineServices: offlineCount,
      latencyAvgMs: avgLatency,
      bankVerified: true,
      complianceScore: offlineCount > 0 ? 85 : 98,
      filename: `account-${targetAccount.name}-scan-${Date.now()}.json`,
      summary: notes || `Scan completed for ${targetAccount.title} on cluster ${targetAccount.clusterName}.`,
      servicesSnapshot: filtered.map(s => ({
        name: s.name,
        status: s.status,
        version: s.version,
        latencyMs: s.latencyMs
      }))
    };

    // Update in-memory lastScan for the account
    targetAccount.lastScan = scanRecord as any;

    const snapshot = {
      id: scanRecord.scanId,
      generatedAt: scanRecord.timestamp,
      title: `Service Audit Report - Account ${targetAccount.name} (${targetAccount.clusterName})`,
      account: targetAccount,
      services: filtered,
      lastScanMetadata: scanRecord,
      reviewNotes: notes || `Automated request compilation for ${targetAccount.title}. Bank attached: ${targetAccount.attachedBank.name} (${targetAccount.attachedBank.code}).`
    };

    res.json(snapshot);
  });

  // --- Local Files API ---

  // List stored review files
  app.get("/api/local-files", (req, res) => {
    try {
      const filenames = fs.readdirSync(REVIEWS_DIR);
      const filesList = filenames.map(fn => {
        const filePath = path.join(REVIEWS_DIR, fn);
        const stat = fs.statSync(filePath);
        let fileData: any = null;
        try {
          if (fn.endsWith('.json')) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            fileData = JSON.parse(raw);
          }
        } catch (e) {
          // ignore parse errors for summary list
        }
        return {
          filename: fn,
          sizeBytes: stat.size,
          modifiedAt: stat.mtime.toISOString(),
          title: fileData?.title || fn,
          id: fileData?.id || fn,
          accountName: fileData?.account?.name || null,
          bankCode: fileData?.account?.attachedBank?.code || null,
          reviewNotes: fileData?.reviewNotes || fileData?.lastScanMetadata?.summary || null
        };
      });
      res.json(filesList);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to list local files" });
    }
  });

  // Save review payload into a local file on disk
  app.post("/api/local-files", (req, res) => {
    try {
      const { filename, content, format = 'json' } = req.body;
      let targetName = filename;

      if (!targetName) {
        const safeTitle = (content.title || 'review').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        targetName = `${safeTitle}-${Date.now()}.${format}`;
      }

      if (!targetName.endsWith('.json') && !targetName.endsWith('.csv') && !targetName.endsWith('.txt')) {
        targetName += `.${format}`;
      }

      const filePath = path.join(REVIEWS_DIR, targetName);
      let dataToWrite = "";

      if (typeof content === "string") {
        dataToWrite = content;
      } else {
        dataToWrite = JSON.stringify(content, null, 2);
      }

      fs.writeFileSync(filePath, dataToWrite, "utf-8");

      res.json({
        success: true,
        filename: targetName,
        filePath,
        savedAt: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to save local file" });
    }
  });

  // Read a single local file
  app.get("/api/local-files/:filename", (req, res) => {
    try {
      const safeFilename = path.basename(req.params.filename);
      const filePath = path.join(REVIEWS_DIR, safeFilename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Local file not found" });
      }

      const raw = fs.readFileSync(filePath, "utf-8");
      if (safeFilename.endsWith('.json')) {
        try {
          return res.json({ filename: safeFilename, content: JSON.parse(raw), raw });
        } catch (e) {
          return res.json({ filename: safeFilename, raw });
        }
      }
      res.json({ filename: safeFilename, raw });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to read local file" });
    }
  });

  // Delete a local file
  app.delete("/api/local-files/:filename", (req, res) => {
    try {
      const safeFilename = path.basename(req.params.filename);
      const filePath = path.join(REVIEWS_DIR, safeFilename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.json({ success: true, filename: safeFilename });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete local file" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

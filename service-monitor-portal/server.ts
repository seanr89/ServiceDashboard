import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let services: any[] = [
  { id: 'ex-1', name: 'Authentication API', status: 'online', version: 'v2.4.1', account: '057', bank: 'NW', env: 'prod', serviceType: 'API', lastUpdated: { seconds: Date.now() / 1000 } },
  { id: 'ex-2', name: 'Payment Gateway', status: 'maintenance', version: 'v1.0.8', account: '058', bank: 'BB', env: 'uat', serviceType: 'Lambda', lastUpdated: { seconds: (Date.now() - 3600000) / 1000 } },
  { id: 'ex-3', name: 'Legacy Database', status: 'offline', version: 'v0.9.2', account: '074', bank: 'RBS', env: 'prod', serviceType: 'Fargate', lastUpdated: { seconds: (Date.now() - 7200000) / 1000 } },
  { id: 'ex-4', name: 'Image Processing', status: 'online', version: 'v3.1.0', account: '075', bank: 'NW', env: 'qa', serviceType: 'Lambda', lastUpdated: { seconds: Date.now() / 1000 } },
  { id: 'ex-5', name: 'Notification Dispatcher', status: 'online', version: 'v1.2.0', account: '076', bank: 'RBS', env: 'qa', serviceType: 'Lambda', lastUpdated: { seconds: Date.now() / 1000 } },
  { id: 'ex-6', name: 'Transaction Processor', status: 'online', version: 'v2.0.1', account: '080', bank: 'GMM', env: 'prod', serviceType: 'API', lastUpdated: { seconds: Date.now() / 1000 } },
  { id: 'ex-7', name: 'Customer Analytics', status: 'offline', version: 'v0.5.4', account: '081', bank: 'BB', env: 'sbx', serviceType: 'Fargate', lastUpdated: { seconds: (Date.now() - 14400000) / 1000 } },
  { id: 'ex-8', name: 'Audit Logging Service', status: 'maintenance', version: 'v1.1.2', account: '057', bank: 'GMM', env: 'uat', serviceType: 'API', lastUpdated: { seconds: (Date.now() - 1800000) / 1000 } },
  { id: 'ex-9', name: 'Reporting Engine', status: 'online', version: 'v3.0.0', account: '058', bank: 'NW', env: 'prod', serviceType: 'Fargate', lastUpdated: { seconds: Date.now() / 1000 } },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/services", (req, res) => {
    res.json(services);
  });

  app.post("/api/services", (req, res) => {
    const { name, version, status, account, bank, env, serviceType } = req.body;
    const newService = {
      id: Math.random().toString(36).substring(7),
      name,
      version,
      status: status || "online",
      account: account || "057",
      bank: bank || "NW",
      env: env || "sbx",
      serviceType: serviceType || "API",
      lastUpdated: { seconds: Date.now() / 1000 }
    };
    services.push(newService);
    res.json(newService);
  });

  app.delete("/api/services/:id", (req, res) => {
    services = services.filter(s => s.id !== req.params.id);
    res.json({ success: true });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let services: any[] = [
  { id: 'ex-1', name: 'Authentication API', status: 'online', version: 'v2.4.1', lastUpdated: { seconds: Date.now() / 1000 } },
  { id: 'ex-2', name: 'Payment Gateway', status: 'maintenance', version: 'v1.0.8', lastUpdated: { seconds: (Date.now() - 3600000) / 1000 } },
  { id: 'ex-3', name: 'Legacy Database', status: 'offline', version: 'v0.9.2', lastUpdated: { seconds: (Date.now() - 7200000) / 1000 } },
  { id: 'ex-4', name: 'Image Processing', status: 'online', version: 'v3.1.0', lastUpdated: { seconds: Date.now() / 1000 } },
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
    const newService = {
      id: Math.random().toString(36).substring(7),
      ...req.body,
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

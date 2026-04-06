import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// Note: In this environment, we use the project ID. 
// Real-world apps would use a service account key.
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/sync-user", async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Missing ID token" });

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const { uid, email } = decodedToken;

      // Mock external API call to check roles
      // In a real app, this would be a fetch to another service
      let role = "admin";
      if (email === "srafferty89@gmail.com" || email?.endsWith("@admin.com")) {
        role = "admin";
      }

      // Update custom claims
      await auth.setCustomUserClaims(uid, { role });

      // Sync to Firestore
      await db.collection("users").doc(uid).set({
        uid,
        email,
        role,
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      res.json({ success: true, role });
    } catch (error) {
      console.error("Error syncing user:", error);
      res.status(500).json({ error: "Internal server error" });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

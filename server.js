import express from "express";
import busboy from "busboy";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();

// ✅ Zyada strong CORS settings
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/uploads", express.static("uploads"));

// Root route (Checking ke liye ki server live hai ya nahi)
app.get("/", (req, res) => res.send("Server is running!"));

app.post("/upload", (req, res) => {
  // OPTIONS request handle karne ke liye (Pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const bb = busboy({ headers: req.headers });

  bb.on("file", (_, file, info) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const saveTo = path.join(uploadDir, info.filename);
    const stream = fs.createWriteStream(saveTo);

    file.pipe(stream);

    stream.on("close", () => {
      const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
      const finalURL = `${baseUrl}/uploads/${info.filename}`;
      res.json({ success: true, url: finalURL });
    });
  });

  req.pipe(bb);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
import express from "express";
import busboy from "busboy";
import fs from "fs";
import path from "path";
import cors from "cors"; // ✅ Add kiya

const app = express();

// ✅ CORS enable kiya taaki frontend se connection block na ho
app.use(cors()); 

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

app.post("/upload", (req, res) => {
  const bb = busboy({ 
    headers: req.headers,
    limits: { fileSize: 5 * 1024 * 1024 * 1024 } // ✅ 5GB Limit set ki
  });

  bb.on("file", (_, file, info) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const saveTo = path.join(uploadDir, info.filename);
    const stream = fs.createWriteStream(saveTo);

    file.pipe(stream);

    stream.on("close", () => {
      // Render par base URL change hota hai isliye ye logic best hai
      const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
      const finalURL = `${baseUrl}/uploads/${info.filename}`;
      
      // Response send karne se pehle check karein ki headers sent toh nahi
      if (!res.headersSent) {
        res.json({ success: true, url: finalURL });
      }
    });
  });

  bb.on("error", (err) => {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  });

  req.pipe(bb);
});

// ✅ Port ko Render ke environment variable ke hisaab se rakha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Upload server running on ${PORT}`));
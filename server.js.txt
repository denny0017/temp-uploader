import express from "express";
import busboy from "busboy";
import fs from "fs";
import path from "path";

const app = express();

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

app.post("/upload", (req, res) => {
  const bb = busboy({ headers: req.headers });

  bb.on("file", (_, file, info) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const saveTo = path.join(uploadDir, info.filename);
    const stream = fs.createWriteStream(saveTo);

    file.pipe(stream);

    stream.on("close", () => {
      const finalURL = `${process.env.RENDER_EXTERNAL_URL}/uploads/${info.filename}`;
      res.json({ success: true, url: finalURL });
    });
  });

  req.pipe(bb);
});

app.listen(3000, () => console.log("Upload server running on 3000"));

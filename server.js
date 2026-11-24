import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = Number(process.env.PORT || 3001);
const model = process.env.OPENAI_MODEL || "gpt-6.2-astra";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: true }));
app.use(express.json({ limit: "12mb" }));

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const systemPrompt = `
You are SPIDER AI, a friendly personal assistant with a polished futuristic suit-computer personality.
Be helpful, calm, concise, and clear. Reply in the language the user uses (Thai or English).
You are software, not a real superhero suit. Never claim to control a device or perform an action unless an implemented tool confirms it.
For device actions, explain what the user can do and ask for confirmation before consequential actions.
`;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(client), model });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) return res.status(503).json({ error: "ยังไม่ได้ตั้งค่า OPENAI_API_KEY ในไฟล์ .env" });
    const message = String(req.body?.message || "").trim();
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];
    if (!message) return res.status(400).json({ error: "กรุณาพิมพ์ข้อความก่อน" });

    const input = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 6000)
      })),
      { role: "user", content: message.slice(0, 6000) }
    ];

    const response = await client.responses.create({ model, input });
    res.json({ reply: response.output_text || "ขออภัย ฉันยังไม่มีคำตอบในตอนนี้" });
  } catch (err) {
    console.error("chat error:", err);
    res.status(500).json({ error: err?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ AI" });
  }
});

app.post("/api/vision", async (req, res) => {
  try {
    if (!client) return res.status(503).json({ error: "ยังไม่ได้ตั้งค่า OPENAI_API_KEY ในไฟล์ .env" });
    const image = String(req.body?.image || "");
    const question = String(req.body?.question || "ช่วยอธิบายสิ่งที่เห็นในภาพนี้").slice(0, 2000);
    if (!/^data:image\/(png|jpeg|webp|gif);base64,/.test(image)) {
      return res.status(400).json({ error: "ไฟล์ภาพไม่ถูกต้อง กรุณาใช้ PNG, JPG, WEBP หรือ GIF" });
    }

    const response = await client.responses.create({
      model,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: question },
          { type: "input_image", image_url: image, detail: "auto" }
        ]
      }]
    });
    res.json({ reply: response.output_text || "ไม่สามารถวิเคราะห์ภาพได้ในตอนนี้" });
  } catch (err) {
    console.error("vision error:", err);
    res.status(500).json({ error: err?.message || "วิเคราะห์ภาพไม่สำเร็จ" });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
}

app.listen(port, () => {
  console.log(`SPIDER AI server running at http://localhost:${port}`);
  if (!client) console.log("Set OPENAI_API_KEY in .env to enable AI.");
});

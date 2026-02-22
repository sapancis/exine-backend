require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());

const getSystemPrompt = (gender) => {
  const genderNote =
    gender === "erkek"
      ? "Ex erkek biri."
      : gender === "kadın"
      ? "Ex kadın biri."
      : "Ex'in cinsiyeti belirtilmemiş.";

  return `Sen "Exine Neden Yazmamalısın?" adlı uygulamanın yapay zeka motorusun.

Kullanıcı exine (eski sevgilisine) yazmak istiyor. Görevin: kullanıcıya exine NEDEN yazmamasi gerektiğini anlatan tek bir güçlü, duygusal ve dürüst cümle üretmek.

${genderNote}

Kurallar:
- Tam olarak 1 cümle. Ne fazla ne eksik.
- "Çünkü" ile başlasın.
- Türkçe, sade, içten, gerçekçi olsun.
- Klişe olmasın.
- Her seferinde farklı, beklenmedik bir bakış açısı sun.
- Sadece cümleyi yaz. Tırnak işareti, açıklama, başlık yok.

Örnek ton (bunları kullanma, sadece referans):
Çünkü seni hatırlayan sen değil, acıyı hatırlamak istemeyen sensin.
Çünkü o mesaj seni ileriye değil, geriye götürür.
Çünkü cevap vermese bile haklı çıkmış gibi hissedecek.`;
};

// Sağlık kontrolü
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Exine backend çalışıyor 🖤" });
});

// Sebep üret
app.post("/api/reason", async (req, res) => {
  const { gender = "diğer" } = req.body;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 150,
      system: getSystemPrompt(gender),
      messages: [{ role: "user", content: "Yeni bir sebep üret." }],
    });

    const reason = message.content[0]?.text?.trim();
    if (!reason) throw new Error("Boş yanıt");

    res.json({ success: true, reason });
  } catch (err) {
    console.error("API hatası:", err.message);
    res.status(500).json({
      success: false,
      reason: "Çünkü bu sessizlik, o mesajdan daha güçlü konuşuyor.",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🖤 Exine backend http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`   Sağlık: http://localhost:${PORT}/health\n`);
});

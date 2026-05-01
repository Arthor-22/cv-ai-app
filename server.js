import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();


const app = express();
app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send("User-agent: *\nAllow: /");
});
app.use(express.static("public"));
app.use((req, res, next) => {
  res.setHeader("X-Robots-Tag", "index, follow");
  next();
});
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =========================
// 🔥 ROUTE PRINCIPALE IA
// =========================
app.post("/generate", async (req, res) => {
  const { type, name, job, skills, experience, education, jobOffer } = req.body;

  let finalPrompt = "";

  // =========================
  // 📄 CV
  // =========================
  if (type === "CV") {
    finalPrompt = `
Tu es un expert en CV.

RÈGLES :
- Réponds uniquement en français
- N'utilise aucun *
- N'invente aucune information
- Texte clair et structuré

Génère un CV professionnel :

Nom : ${name}
Poste : ${job}

Résumé :
(3 lignes maximum)

Expérience :
${experience || "Non précisé"}

Compétences :
${skills || "Non précisé"}

Formation :
${education || "Non précisé"}
`;
  }

  // =========================
  // ✉️ LETTRE DE MOTIVATION
  // =========================
  else if (type === "lettre de motivation") {
    finalPrompt = `
Tu es un expert en lettres de motivation.

RÈGLES :
- Français uniquement
- Ton naturel et professionnel
- N'invente pas d'informations
- Texte fluide sans *
- Texte complet

Écris une lettre de motivation :

Nom : ${name}
Poste visé : ${job}
Expérience : ${experience || "Non précisé"}
Compétences : ${skills || "Non précisé"}
Formation : ${education || "Non précisé"}
Offre : ${jobOffer || "Non précisé"}

Structure :
- Introduction
- Motivation
- Compétences
- Conclusion
`;
  }

  // =========================
  // 📧 EMAIL
  // =========================
  else if (type === "email professionnel") {
    finalPrompt = `
Tu es un expert en emails professionnels.

RÈGLES :
- Français uniquement
- Court et professionnel
- Aucun *

Écris un email professionnel :

Nom : ${name}
Objet : Candidature au poste de ${job}

Structure :
- Objet
- Message
- Conclusion
`;
  }

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistral-small",
        messages: [
          { role: "user", content: finalPrompt }
        ]
      })
    });

    const data = await response.json();

    const text = data.choices?.[0]?.message?.content;

    res.json({
      result: text || "Erreur génération"
    });

  } catch (error) {
    console.error("❌ ERREUR MISTRAL:", error);

    res.json({
      result: "Erreur serveur IA"
    });
  }
});

// =========================
// 🚀 LANCEMENT SERVEUR
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/generate", async (req, res) => {
  const { type, name, job, skills, experience, education, jobOffer } = req.body;

  let finalPrompt = "";

  // =========================
  // 📄 CV
  // =========================
  if (type === "CV") {
    finalPrompt = `
Tu es un expert en CV.

Règles :
- Français uniquement
- Aucun *
- Aucun contenu inventé

CV :

Nom : ${name}
Poste : ${job}

Résumé :
3 lignes maximum

Expérience :
${experience || "Non précisé"}

Compétences :
${skills || "Non précisé"}

Formation :
${education || "Non précisé"}
`;
  }

  // =========================
  // ✉️ LETTRE
  // =========================
  else if (type === "lettre de motivation") {
    finalPrompt = `
Tu es un expert en lettres de motivation.

Règles :
- Français uniquement
- Texte fluide et professionnel
- Aucun *

Lettre de motivation :

Nom : ${name}
Poste : ${job}
Expérience : ${experience || "Non précisé"}
Compétences : ${skills || "Non précisé"}
Formation : ${education || "Non précisé"}
Offre : ${jobOffer || "Non précisé"}

Structure :
Introduction, motivation, compétences, conclusion
`;
  }

  // =========================
  // 📧 EMAIL
  // =========================
  else if (type === "email professionnel") {
    finalPrompt = `
Tu es un expert en emails professionnels.

Règles :
- Français uniquement
- Court et poli
- Aucun *

Email :

Nom : ${name}
Objet : ${job}

Contenu :
Message professionnel complet
`;
  }

  try {
    // 👉 ICI appel à Ollama
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistral:latest",
        prompt: finalPrompt,
        stream: false
      })
    });

    const data = await response.json();

    res.json({
      result: data.response || "Erreur génération"
    });

  } catch (error) {
    console.error("❌ ERREUR:", error);

    res.json({
      result: "Erreur serveur (Ollama non lancé ?)"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Serveur lancé sur port " + PORT);
});
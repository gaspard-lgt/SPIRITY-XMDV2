import axios from "axios";
import config from '../config.cjs';

const pairHandler = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  if (!["pair", "paircode", "code"].includes(cmd)) return;

  const args = m.body.trim().split(/\s+/).slice(1);
  const numero = args[0];

  if (!numero) {
    return m.reply(`⚠️ Merci de fournir un numéro.\nExemple : *${prefix}pair 226xxxxxxx*`);
  }

  try {
    await m.reply("⏳ Génération du code pairage, patiente...");

    // Appel de ton API pair
    const { data } = await axios.get(`https://spirity-xmd-pair1.onrender.com/pair?phone=${encodeURIComponent(numero)}`);

    if (!data?.pair_code) {
      return m.reply("❌ Aucun code pair trouvé. Vérifie le numéro et réessaye.");
    }

    // Message final avec branding complet
    const codePair = data.pair_code;
    const explication = `
╭─ 🔑 *SPIRITY-XMD PAIRE* ──────────────
│ ➤ *Code :* ${codePair}
│
│ 📌 *Comment l'utiliser ?*
│ 1. Ouvre *WhatsApp > Appareils connectés*
│ 2. Clique sur *Connecter un appareil*
│ 3. Utilise ce *code de 8 chiffres*
│
│ ⚠️ *Note :* expire rapidement. Utilise-le immédiatement.
│
│ 🚀 Powered by DARK-DEV
╰─────────────────────────────────────────
`;

    await sock.sendMessage(
      m.from,
      {
        text: explication.trim(),
        contextInfo: {
          forwardingScore: 777,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
            newsletterJid: "120363422353392657@newsletter",
          },
        },
      },
      { quoted: m }
    );

  } catch (error) {
    console.error("Erreur commande pair :", error);
    m.reply(`⚠️ Erreur lors de la récupération :\n${error.message}`);
  }
};

export default pairHandler;

import axios from "axios";
import { createRequire } from "module";

// Import config.cjs using createRequire
const require = createRequire(import.meta.url);
const config = require("../config.cjs");

const whatsappApkSearchCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const validCommands = ["playstore", "sapk"];

  if (!validCommands.includes(cmd)) return;

  // Extraction de la requête de recherche après la commande
  const query = m.body.slice(prefix.length + cmd.length).trim();

  if (!query) {
    await sock.sendMessage(
      m.from,
      { text: "⚠️ Veuillez indiquer ce que vous souhaitez rechercher après la commande." },
      { quoted: m }
    );
    return;
  }

  const apiUrl = `https://www.dark-yasiya-api.site/search/apk?text=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.status && data.result.data.length > 0) {
      let reply = `🔍 *Résultats de recherche APK WhatsApp pour :* _${query}_\n\n`;

      data.result.data.forEach((item, i) => {
        reply += `*${i + 1}. ${item.name}*\n`;
        reply += `📱 *ID du package :* ${item.id}\n`;
        reply += `🔗 *Lien Google Play :* https://play.google.com/store/apps/details?id=${item.id}\n\n`;
      });

      await sock.sendMessage(m.from, { text: reply.trim() }, { quoted: m });
    } else {
      await sock.sendMessage(
        m.from,
        { text: "❌ Aucun résultat APK trouvé pour votre recherche." },
        { quoted: m }
      );
    }
  } catch (error) {
    console.error("Erreur commande recherche APK WhatsApp :", error);
    await sock.sendMessage(
      m.from,
      { text: "⚠️ Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard." },
      { quoted: m }
    );
  }
};

export default whatsappApkSearchCommand;

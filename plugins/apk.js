// Fichier : commands/app.js

import axios from 'axios';
import config from '../config.cjs';

const apkDownloader = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "app") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "❌ *Veuillez fournir un nom d'application à rechercher.*" }, { quoted: m });
    }

    // Réaction de chargement
    await sock.sendMessage(m.from, { react: { text: "⏳", key: m.key } });

    try {
      const query = encodeURIComponent(text);
      const apiUrl = `https://web-api-cache.aptoide.com/search?query=${query}`;
      const response = await axios.get(apiUrl);
      const result = response.data?.datalist?.list?.[0];

      if (!result) {
        return sock.sendMessage(m.from, { text: "❌ *Aucune application trouvée avec ce nom.*" }, { quoted: m });
      }

      const appName = result.name;
      const appSize = (result.size / 1048576).toFixed(2);
      const appPackage = result.package;
      const appVersion = result.file?.vername || "inconnue";
      const updated = new Date(result.updated).toLocaleDateString("fr-FR");
      const apkUrl = result.file?.path_alt || result.file?.path;

      if (!apkUrl) {
        return sock.sendMessage(m.from, { text: "❌ *Lien de téléchargement introuvable pour cette app.*" }, { quoted: m });
      }

      // Affichage des infos
      const message = `
╭───『 *APK Downloader* 』───╮
┃ 🔤 *Nom:* ${appName}
┃ 📦 *Package:* ${appPackage}
┃ 🧾 *Version:* ${appVersion}
┃ 📅 *Mise à jour:* ${updated}
┃ 📂 *Taille:* ${appSize} MB
╰──────────────────────────╯
      `;

      await sock.sendMessage(m.from, { text: message }, { quoted: m });

      // Envoi du fichier APK
      await sock.sendMessage(m.from, {
        document: { url: apkUrl },
        mimetype: "application/vnd.android.package-archive",
        fileName: `${appName}.apk`,
        caption: "✅ *Voici l'APK demandé.*"
      }, { quoted: m });

      // Réaction succès
      await sock.sendMessage(m.from, { react: { text: "✅", key: m.key } });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.from, { text: "❌ *Erreur lors de la récupération de l'application.*" }, { quoted: m });
    }
  }
};

export default apkDownloader;

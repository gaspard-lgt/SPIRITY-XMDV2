import config from '../config.cjs';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const gitdl = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const q = m.body.split(' ').slice(1).join(' ');
  const reply = (text) => sock.sendMessage(m.from, { text }, { quoted: m });

  if (!['gitdl', 'gitdownload'].includes(cmd)) return;

  if (!q || !q.includes("github.com")) {
    await reply(`✨ Veuillez fournir un lien GitHub valide.\nExemple : ${prefix}${cmd} https://github.com/user/repo ✨`);
    return; // Retour pour stopper
  }

  await reply("🚀 Téléchargement en cours... Merci de patienter ⏳");

  try {
    const match = q.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      await reply("⚠️ Lien GitHub invalide. Format attendu : https://github.com/user/repo");
      return; // Retour pour stopper
    }

    const user = match[1];
    const repo = match[2].replace(/\/$/, '');
    const zipUrl = `https://github.com/${user}/${repo}/archive/refs/heads/main.zip`;

    const res = await axios.get(zipUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data, 'binary');

    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempFile = path.join(tempDir, `${repo}.zip`);
    fs.writeFileSync(tempFile, buffer);

    // Caption ASCII style
    const caption = `
╭─ 📦 𝐆𝐈𝐓𝐇𝐔𝐁 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ───────────────
│ ⤷ 👤 User    : ${user}
│ ⤷ 📁 Repo    : ${repo}
│ ⤷ 📝 Format  : ZIP
│ ⤷ 🔗 Lien    : ${q}
│ ⤷ 🤖 Bot     : SPIRITY-XMD
│ ⤷ 🧠 By      : DARK-DEV
╰────────────────────────────────────────
`.trim();

    const profilePictureUrl = 'https://telegra.ph/file/f0ec04b879430456ae593.jpg';

    await sock.sendMessage(
      m.from,
      {
        document: fs.readFileSync(tempFile),
        mimetype: 'application/zip',
        fileName: `${repo}.zip`,
        caption,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
            newsletterJid: "120363422353392657@newsletter",
          },
          externalAdReply: {
            title: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
            body: "GitHub Downloader",
            thumbnailUrl: profilePictureUrl,
            sourceUrl: "https://github.com/DARKMAN226/SPIRITY-XMD-V2.git",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );

    fs.unlinkSync(tempFile);
    await m.React('✅');
    return; // Retour après envoi
  } catch (error) {
    console.error("Erreur lors du téléchargement GitHub :", error);
    await reply(`🚨 Une erreur est survenue : ${error.message}`);
    await m.React('❌');
    return;
  }
};

export default gitdl;

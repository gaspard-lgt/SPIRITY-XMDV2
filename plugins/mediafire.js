import fetch from 'node-fetch';
import config from '../config.cjs';

const downloadMediaFireFile = async (m, gss) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  if (!body.startsWith(prefix)) return;

  // Extraire la commande
  const cmd = body.slice(prefix.length).split(' ')[0].toLowerCase();
  if (!['mediafire', 'mf'].includes(cmd)) return;

  // Extraire arguments en prenant soin de ne pas couper une URL avec espaces
  const args = body.slice(prefix.length + cmd.length).trim();
  const firstSpace = args.indexOf(' ');
  const url = firstSpace === -1 ? args : args.substring(0, firstSpace);
  const captionUser = firstSpace === -1 ? 'SPIRITY-XMD ʙᴏᴛ' : args.substring(firstSpace + 1);

  // Validation stricte du lien MediaFire
  if (
    !url ||
    !url.includes('mediafire.com') ||
    url.startsWith('javascript:') ||
    !/^https?:\/\//.test(url)
  ) {
    return m.reply('❌ Veuillez fournir un lien MediaFire valide (commençant par http:// ou https://).');
  }

  console.log('URL MediaFire reçue:', url);

  try {
    const apiUrl = `https://bk9.fun/download/mediafire?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: Status ${response.status} - ${errorText}`);
      throw new Error(`Erreur API ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Réponse API:', data);

    const downloadUrl = data?.BK9?.link;
    const fileName = data?.BK9?.name || 'file_mediafire';
    const mimeType = data?.BK9?.mime || 'application/octet-stream';
    const size = data?.BK9?.size || 'N/A';

    if (!downloadUrl) throw new Error('Le lien de téléchargement est introuvable.');

    // Construire le message ASCII
    const asciiCaption = `
╭─ 📥 𝐌𝐄𝐃𝐈𝐀𝐅𝐈𝐑𝐄 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ───────────────
│ ⤷ 📁 Nom    : ${fileName}
│ ⤷ 📦 Taille : ${size}
│ ⤷ 🧾 Type   : ${mimeType}
│ ⤷ 🔗 Lien   : (fichier envoyé en document)
│ ⤷ 📝 Note   : ${captionUser}
│ ⤷ 🤖 Bot    : SPIRITY-XMD
│ ⤷ 🧠 By     : DARK-DEV
╰────────────────────────────────────────
`.trim();

    // Envoi du document avec le message ASCII en caption
    await gss.sendMessage(
      m.from,
      {
        document: { url: downloadUrl },
        mimetype: mimeType,
        fileName,
        caption: asciiCaption,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
            newsletterJid: "120363422353392657@newsletter",
          },
        },
      },
      { quoted: m }
    );

    // Optionnel : supprimer le message d'origine
    try {
      await gss.sendMessage(m.key.remoteJid, { delete: m.key });
    } catch {}

  } catch (err) {
    console.error('Erreur téléchargement MediaFire:', err.message);
    await m.reply(`❌ Échec du téléchargement : ${err.message}`);
  }
};

export default downloadMediaFireFile;

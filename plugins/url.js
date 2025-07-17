import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

const MAX_FILE_SIZE_MB = 200;

// Fonction pour uploader le média sur catbox.moe
async function uploadMedia(buffer) {
  try {
    const { ext } = await fileTypeFromBuffer(buffer); // détecte l'extension du fichier
    const form = new FormData();
    form.append("fileToUpload", buffer, "file." + ext);
    form.append("reqtype", "fileupload");

    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      throw new Error(`Erreur lors de l'upload : ${res.status} ${res.statusText}`);
    }

    const url = await res.text();
    return url; // retourne l'URL du fichier uploadé
  } catch (error) {
    console.error("Erreur lors de l'upload du média :", error);
    throw new Error('Échec de l\'upload du média');
  }
}

// Commande principale pour récupérer l'URL du média envoyé/répondu
const tourl = async (m, bot) => {
  // Detecte le préfixe dans le message (/ ! # . \)
  const prefixMatch = m.body.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const validCommands = ['url', 'geturl', 'upload', 'u'];

  if (!validCommands.includes(cmd)) return;

  // Vérifie qu'on répond à un message média (image, vidéo, audio)
  if (!m.quoted || !['imageMessage', 'videoMessage', 'audioMessage'].includes(m.quoted.mtype)) {
    return m.reply(`Envoie ou réponds à une image, vidéo ou audio pour l'uploader avec la commande *${prefix + cmd}*`);
  }

  try {
    // Affiche un loader avec animation pendant l'upload
    const loadingMessages = [
      "*[●○○○○○○○○○]*",
      "*[●●○○○○○○○○]*",
      "*[●●●○○○○○○○]*",
      "*[●●●●○○○○○○]*",
      "*[●●●●●○○○○○]*",
      "*[●●●●●●○○○○]*",
      "*[●●●●●●●○○○]*",
      "*[●●●●●●●●○○]*",
      "*[●●●●●●●●●○]*",
      "*[●●●●●●●●●●]*",
    ];

    const loadingCount = loadingMessages.length;
    let currentIndex = 0;
    const { key } = await bot.sendMessage(m.from, { text: loadingMessages[currentIndex] }, { quoted: m });

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingCount;
      bot.sendMessage(m.from, { text: loadingMessages[currentIndex] }, { quoted: m, messageId: key });
    }, 500);

    // Télécharge le média du message cité/répondu
    const media = await m.quoted.download();
    if (!media) throw new Error('Échec du téléchargement du média.');

    // Vérifie la taille max
    const fileSizeMB = media.length / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      clearInterval(interval);
      return m.reply(`La taille du fichier dépasse la limite de ${MAX_FILE_SIZE_MB} MB.`);
    }

    // Upload le média et récupère l'URL
    const mediaUrl = await uploadMedia(media);

    clearInterval(interval);
    await bot.sendMessage(m.from, { text: '✅ Upload terminé.' }, { quoted: m });

    // Envoie le message avec le lien selon le type de média
    const mediaType = getMediaType(m.quoted.mtype);
    if (mediaType === 'audio') {
      await bot.sendMessage(m.from, {
        text: `*Hey ${m.pushName}, voici ton URL audio*\n*URL:* ${mediaUrl}`
      }, { quoted: m });
    } else {
      await bot.sendMessage(m.from, {
        [mediaType]: { url: mediaUrl },
        caption: `*URL:* *${mediaUrl}*\n\n*DEV by DARK-DEV*`
      }, { quoted: m });
    }

  } catch (error) {
    console.error('Erreur lors du traitement du média :', error);
    m.reply('Erreur lors du traitement du média.');
  }
};

// Helper pour déterminer le type de média à envoyer
const getMediaType = (mtype) => {
  switch (mtype) {
    case 'imageMessage': return 'image';
    case 'videoMessage': return 'video';
    case 'audioMessage': return 'audio';
    default: return null;
  }
};

export default tourl;

import config from '../config.cjs';
import axios from 'axios';

const tiktokdl = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const q = m.body.split(' ').slice(1).join(' ');
  const reply = (text) => sock.sendMessage(m.from, { text }, { quoted: m });

  if (cmd !== "tiktokdl" && cmd !== "tiktok") return;

  if (!q) {
    return reply(`✨ Veuillez fournir un lien TikTok valide.\nExemple : ${prefix}${cmd} https://vm.tiktok.com/xxxx/ ✨`);
  }

  if (!q.includes("tiktok.com")) {
    return reply("⚠️ Le lien fourni ne semble pas être un lien TikTok valide.");
  }

  await reply("🚀 Téléchargement en cours... Merci de patienter ⏳");

  try {
    const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.data) {
      return reply("💔 Échec de la récupération de la vidéo TikTok. Le serveur est peut-être indisponible ou le lien est invalide.");
    }

    const { title, like, comment, share, author, meta } = data.data;
    const videoUrl = meta.media.find(v => v.type === "video")?.org;
    const views = meta?.play_count || 'N/A';

    if (!videoUrl) {
      return reply("⚠️ Impossible de récupérer l'URL vidéo dans la réponse.");
    }

    const caption = 
`🎬 *Vidéo TikTok téléchargée !* 🎬

👤 Créateur : ${author.nickname} (@${author.username})
📝 Titre : ${title || 'Non disponible'}
👁️ Vues : ${views}
❤️ Likes : ${like}
💬 Commentaires : ${comment}
🔗 Partages : ${share}

ᴘᴏᴡᴇʀᴇᴅ ʙʏ DARK DEV 👻`;

    await sock.sendMessage(
      m.from,
      {
        video: { url: videoUrl },
        caption,
        contextInfo: { mentionedJid: [m.sender] },
      },
      { quoted: m }
    );

  } catch (error) {
    console.error("Erreur lors du téléchargement TikTok :", error);
    reply(`🚨 Une erreur est survenue : ${error.message}`);
  }
};

export default tiktokdl;

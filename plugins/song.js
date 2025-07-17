import axios from "axios";
import yts from "yt-search";
import config from '../config.cjs';

const song = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) 
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() 
    : "";
  const args = m.body.slice(prefix.length + cmd.length).trim().split(" ");

  if (cmd !== "video") return;

  if (args.length === 0 || !args.join(" ")) {
    return m.reply("*Veuillez fournir un nom de chanson ou des mots clés à rechercher.*");
  }

  const searchQuery = args.join(" ");
  await m.reply("*🎥 Recherche de la vidéo en cours...*");

  try {
    const searchResults = await yts(searchQuery);
    if (!searchResults.videos?.length) {
      return m.reply(`❌ Aucun résultat trouvé pour "${searchQuery}".`);
    }

    const firstResult = searchResults.videos[0];
    const videoUrl = firstResult.url;

    const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data.success) {
      return m.reply(`❌ Échec de la récupération de la vidéo pour "${searchQuery}".`);
    }

    const { title, download_url } = response.data.result;

    await gss.sendMessage(
      m.from,
      {
        video: { url: download_url },
        mimetype: "video/mp4",
        caption: `*${title}*\n\nPowered By SPIRITY-XMD ▶️`,
      },
      { quoted: m }
    );

  } catch (error) {
    console.error("Erreur commande vidéo :", error);
    m.reply("❌ Une erreur est survenue lors du traitement de votre demande.");
  }
};

export default song;

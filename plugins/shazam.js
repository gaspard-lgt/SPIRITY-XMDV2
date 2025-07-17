import fs from 'fs';
import acrcloud from 'acrcloud';
import config from '../config.cjs';

const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: '716b4ddfa557144ce0a459344fe0c2c9',
  access_secret: 'Lz75UbI8g6AzkLRQgTgHyBlaQq9YT5wonr3xhFkf'
});

const shazam = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';
    const validCommands = ['shazam', 'hansfind', 'whatmusic'];
    if (!validCommands.includes(cmd)) return;

    const quoted = m.quoted || {};
    if (!quoted || (quoted.mtype !== 'audioMessage' && quoted.mtype !== 'videoMessage')) {
      return m.reply('❗ Merci de citer un message audio ou vidéo pour identifier la musique.');
    }

    const media = await m.quoted.download();
    const filePath = `./${Date.now()}.mp3`;
    fs.writeFileSync(filePath, media);

    await m.reply('⏳ Identification en cours, merci de patienter...');

    const res = await acr.identify(fs.readFileSync(filePath));
    fs.unlinkSync(filePath);

    if (res.status.code !== 0) {
      return m.reply(`❌ Identification échouée : ${res.status.msg}`);
    }

    const music = res.metadata.music[0];
    if (!music) {
      return m.reply('❌ Musique non trouvée.');
    }

    const title = music.title || 'Inconnu';
    const artists = music.artists ? music.artists.map(a => a.name).join(', ') : 'Inconnu';
    const album = music.album ? music.album.name : 'Inconnu';
    const genres = music.genres ? music.genres.map(g => g.name).join(', ') : 'Inconnu';
    const releaseDate = music.release_date || 'Inconnu';

    const replyText = `
🎶 Résultat de l'identification 🎶
• Titre       : ${title}
• Artiste(s)  : ${artists}
• Album       : ${album}
• Genre(s)    : ${genres}
• Date sortie : ${releaseDate}
`;

    await m.reply(replyText.trim());

  } catch (error) {
    console.error('Erreur shazam:', error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await m.reply('⚠️ Une erreur est survenue lors de l\'identification de la musique.');
  }
};

export default shazam;

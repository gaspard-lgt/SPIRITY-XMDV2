import axios from 'axios';
import fs from 'fs';
import path from 'path';
import config from '../config.cjs';

const prefix = config.PREFIX;

// Fonction pour créer une box ASCII
function makeAsciiBox(title, lines) {
  const width = 60; // largeur de la box (ajuste si besoin)
  const top = '╭' + '─'.repeat(width) + '╮';
  const bottom = '╰' + '─'.repeat(width) + '╯';
  const titleLine = `│ ${title.padEnd(width - 2)} │`;
  const content = lines.map(line => {
    if (line.length > width - 2) {
      // couper les lignes trop longues
      const chunks = [];
      for (let i = 0; i < line.length; i += width - 2) {
        chunks.push(line.substring(i, i + width - 2));
      }
      return chunks.map(chunk => `│ ${chunk.padEnd(width - 2)} │`).join('\n');
    }
    return `│ ${line.padEnd(width - 2)} │`;
  }).join('\n');
  return [top, titleLine, '│', content, bottom].join('\n');
}

const Lyrics = async (m, Matrix) => {
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'lyrics' && cmd !== 'lyric') return;

  if (!text) {
    return m.reply(
      `👋 Salut *${m.pushName}*,\n` +
      `Utilisation : *${prefix}lyrics Titre|Artiste*\n` +
      `Exemple : *${prefix}lyrics Spectre|Alan Walker*`
    );
  }

  if (!text.includes('|')) {
    return m.reply(
      `⚠️ Merci d'utiliser le format : *Titre|Artiste*\n` +
      `Exemple : *Spectre|Alan Walker*`
    );
  }

  const [title, artist] = text.split('|').map(s => s.trim());
  if (!title || !artist) {
    return m.reply(
      `⚠️ Le titre et l'artiste sont obligatoires.\n` +
      `Format attendu : *Titre|Artiste*`
    );
  }

  // Lire la clé Genius dans le fichier .en à la racine
  let geniusToken;
  try {
    const keyPath = path.resolve('./.en');
    geniusToken = fs.readFileSync(keyPath, 'utf-8').trim();
    if (!geniusToken) throw new Error('Clé Genius vide dans .en');
  } catch (err) {
    console.error('Erreur lecture clé Genius:', err);
    return m.reply('❌ Impossible de lire la clé Genius. Veuillez vérifier le fichier .en');
  }

  try {
    await m.React('🕘');
    await m.reply('⏳ Recherche des paroles en cours...');

    // Recherche sur Genius API
    const searchRes = await axios.get('https://api.genius.com/search', {
      headers: { Authorization: `Bearer ${geniusToken}` },
      params: { q: `${title} ${artist}` },
    });

    const hits = searchRes.data.response.hits;
    if (!hits.length) {
      return m.reply(`❌ Aucune parole trouvée pour "${title}" de "${artist}".`);
    }

    // Prendre le premier résultat pertinent
    const song = hits.find(
      h =>
        h.result.title.toLowerCase().includes(title.toLowerCase()) &&
        h.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase())
    ) || hits[0];

    const lyricsUrl = song.result.url;

    // Récupérer les paroles via page Genius (parce que Genius API ne donne pas les paroles directes)
    const pageRes = await axios.get(lyricsUrl);
    const html = pageRes.data;

    // Extraire les paroles dans <div data-lyrics-container="true">...</div>
    const regex = /<div data-lyrics-container="true">(.*?)<\/div>/gs;
    const matches = [...html.matchAll(regex)];
    if (!matches.length) {
      return m.reply(`❌ Impossible d'extraire les paroles depuis Genius.`);
    }

    // Nettoyer et concaténer le texte
    const lyrics = matches.map(m => m[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<.*?>/g, '') // enlever balises HTML restantes
      .trim()
    ).join('\n\n');

    // Préparer la box ASCII
    const lines = [
      `${song.result.title} - ${song.result.primary_artist.name}`,
      '',
      ...lyrics.split('\n').slice(0, 30), // limite à 30 lignes pour éviter message trop long
      '',
      `Lien Genius : ${lyricsUrl}`
    ];

    const asciiBox = makeAsciiBox('🎵 Paroles de chanson', lines);

    // Envoyer le message
    await Matrix.sendMessage(m.from, { text: asciiBox }, { quoted: m });
    await m.React('✅');

  } catch (err) {
    console.error('Erreur lyrics Genius:', err);
    await m.reply('❌ Une erreur est survenue lors de la récupération des paroles.');
    await m.React('❌');
  }
};

export default Lyrics;

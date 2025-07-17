import axios from 'axios';
import config from '../config.cjs';

const ttsHandler = async (m, sock) => {
  try {
    if (!m?.from || !m?.body || !sock) return;

    const prefix = config.PREFIX || '!';
    const body = m.body;
    if (!body.startsWith(prefix)) return;

    const cmd = body.slice(prefix.length).split(' ')[0].toLowerCase();
    const text = body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['tts', 'say', 'speak', 'talk'];
    if (!validCommands.includes(cmd)) return;

    if (!text) {
      await sock.sendMessage(
        m.from,
        {
          text: "✨ Oups, tu as oublié ce que tu voulais que je dise ! Essaie par exemple :\n\n*!tts humain tu sais que je peux t'exorciser*"
        },
        { quoted: m }
      );
      if (typeof m.React === 'function') await m.React('❌');
      return;
    }

    if (typeof m.React === 'function') await m.React('🎀');

    const apiUrl = `https://api.nexoracle.com/tts/text-to-speech?apikey=33241c3a8402295fdc&lang=en-US&text=${encodeURIComponent(text)}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (!data?.status || !data?.result) {
        await sock.sendMessage(
          m.from,
          {
            text: "🥺 Oups, je n'ai pas réussi à transformer ton texte en message vocal... Peux-tu réessayer ?"
          },
          { quoted: m }
        );
        if (typeof m.React === 'function') await m.React('❌');
        return;
      }

      await sock.sendMessage(
        m.from,
        {
          audio: { url: data.result },
          mimetype: 'audio/mpeg',
          ptt: true,
        },
        { quoted: m }
      );

      if (typeof m.React === 'function') await m.React('💖');

    } catch (err) {
      console.error('Erreur API TTS:', err);
      await sock.sendMessage(
        m.from,
        {
          text: "⚠️ Oups, un problème est survenu lors de la conversion... Essaie plus tard."
        },
        { quoted: m }
      );
      if (typeof m.React === 'function') await m.React('❌');
    }

  } catch (error) {
    console.error('Erreur gestionnaire TTS:', error);
    await sock.sendMessage(
      m.from,
      {
        text: "❌ Oups, une erreur est survenue dans le bot... Merci de prévenir mon créateur !"
      },
      { quoted: m }
    );
    if (typeof m.React === 'function') await m.React('❌');
  }
};

export default ttsHandler;

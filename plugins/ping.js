// 📁 plugins/ping.js
import config from '../config.cjs';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ping = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "ping") {
    const start = Date.now();
    await m.React('⚡');

    const animation = [
      '🧬 Démarrage du noyau SPIRITY...',
      '🛡️ Sécurisation du protocole...',
      '👁️ Analyse des ports ouverts...',
      '🔗 Connexion à l’interface neuronale...',
      '🌀 Calibration de l’algorithme...',
      '🚀 Lancement réussi ! Système actif.'
    ];

    // Envoyer le premier message
    let sentMsg = await sock.sendMessage(m.from, { text: `*${animation[0]}*` }, { quoted: m });

    // Remplacer les messages suivants dans le même message (édition)
    for (let i = 1; i < animation.length; i++) {
      await delay(300);
      await sock.sendMessage(m.from, {
        text: `*${animation[i]}*`,
        edit: sentMsg.key
      });
    }

    const end = Date.now();
    const pingTime = ((end - start) / 1000).toFixed(3);

    // Message final stylé
    const result = `
╭─『 *SPIRITY-XMD PING* 』
│⚡ *Latence:* ${pingTime}s
│🤖 *Statut:* OPÉRATIONNEL
│🌐 *Serveur:* CONNECTÉ
╰───────────────
`;

    await delay(300);
    await sock.sendMessage(m.from, {
      text: result,
      edit: sentMsg.key, // Réutilise le même message
      contextInfo: {
        externalAdReply: {
          title: 'SPIRITY-XMD SYSTEM',
          body: 'Système IA haute performance – DARK-DEV',
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: 'https://i.imgur.com/AZb9Jsy.jpeg',
          sourceUrl: 'https://github.com/DARKMAN226/SPIRITY-XMD-V2'
        }
      }
    });
  }
};

export default ping;

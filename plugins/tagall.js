import config from '../config.cjs';

const tagEveryoneInGroup = async (message, sock) => {
  const prefix = config.PREFIX;
  const cmd = message.body.startsWith(prefix)
    ? message.body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
    : '';

  if (cmd === 'tagall' || cmd === 'hidetag') {
    if (!message.isGroup) {
      return await sock.sendMessage(
        message.from,
        { text: '🚫 Cette commande fonctionne uniquement dans les groupes.' },
        { quoted: message }
      );
    }

    try {
      const groupMeta = await sock.groupMetadata(message.from);
      const participants = groupMeta.participants;
      const senderId = message.sender;

      // Photo de profil (par défaut si erreur)
      let profilePicture = 'https://files.catbox.moe/fta4xd.jpg';
      try {
        profilePicture = await sock.profilePictureUrl(senderId, 'image');
      } catch (e) {}

      const mentions = participants.map(p => p.id);
      const adminCount = participants.filter(p => p.admin).length;
      const senderName = senderId.split('@')[0];
      const rawText = message.body.trim().split(' ').slice(1).join(' ');
      const userText = rawText || 'Blanc';

      if (cmd === 'tagall') {
        const tagList = mentions.map(id => `@${id.split('@')[0]}`).join('\n');

        const caption = `
╔═══════❖ 『 *TAGALL* 』❖═══════╗
║   🧠 *SPIRITY-XMD SYSTEM v2*   ║
╠═════════════════════════════╣
║ 👥 *Groupe* : ${groupMeta.subject}
║ 👤 *Auteur* : @${senderName}
║ 👨‍👩‍👧‍👦 *Membres* : ${participants.length}
║ 🛡️ *Admins* : ${adminCount}
╠═════════════════════════════╣
║ 🗒️ *Message personnalisé* :
║ ${userText}
╚═════════════════════════════╝

${tagList}

🔧 *Powered by DARK-DEV*
`;

        await sock.sendMessage(
          message.from,
          {
            image: { url: profilePicture },
            caption,
            mentions
          },
          { quoted: message }
        );
      } else if (cmd === 'hidetag') {
        // Message avec mentions, mais sans liste visible
        const text = userText || 'Voici un message pour tout le groupe !';

        await sock.sendMessage(
          message.from,
          {
            text,
            mentions
          },
          { quoted: message }
        );
      }

    } catch (err) {
      console.error('❌ Erreur dans tagall/hidetag:', err);
      await sock.sendMessage(
        message.from,
        { text: '❌ Une erreur est survenue lors du tag.' },
        { quoted: message }
      );
    }
  }
};

export default tagEveryoneInGroup;

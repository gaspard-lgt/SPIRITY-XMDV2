import config from '../config.cjs';

const TagadminCommand = async (m, sock, { participants }) => {
  try {
    const prefix = config.PREFIX || '.';
    if (!m.body) return;

    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    if (cmd !== 'tagadmin') return;

    if (!m.isGroup) {
      return await sock.sendMessage(m.from, { text: "❌ *Cette commande est réservée aux groupes.*" }, { quoted: m });
    }

    if (!participants || participants.length === 0) {
      return await sock.sendMessage(m.from, { text: "⚠️ *Impossible de récupérer les participants du groupe.*" }, { quoted: m });
    }

    const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
    if (admins.length === 0) {
      return await sock.sendMessage(m.from, { text: "⚠️ *Aucun admin trouvé dans ce groupe.*" }, { quoted: m });
    }

    const mentions = admins.map(p => p.id);
    const lines = admins
      .map((a, i) => `┃ 👑 *Admin ${i + 1}* 👉 @${a.id.split('@')[0]}`)
      .join('\n');

    const styledMsg = `
╔══════════════════════╗
║   🌟 *LISTE DES ADMINS* 🌟
╠══════════════════════╣
${lines}
╚══════════════════════╝
🔰 *Total:* ${admins.length} admin(s)
`;

    await sock.sendMessage(m.from, { text: styledMsg, mentions }, { quoted: m });

  } catch (error) {
    console.error('❌ Erreur dans TagadminCommand :', error);
    await sock.sendMessage(m.from, { text: '❌ Une erreur est survenue lors de la commande tagadmin.' }, { quoted: m });
  }
};

export default TagadminCommand;

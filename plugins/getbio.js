import config from '../config.cjs';

const groupCommands = async (m, sock) => {
  try {
    const isGroup = m.key.remoteJid?.endsWith('@g.us');
    if (!isGroup) return;

    const prefix = config.PREFIX || '!';
    if (!m.body || !m.body.startsWith(prefix)) return;

    const args = m.body.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    const metadata = await sock.groupMetadata(m.from);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = metadata.participants.some(p => p.id === botId && p.admin);
    const isSenderAdmin = metadata.participants.some(p => p.id === m.sender && p.admin);

    switch (cmd) {
      case 'link': {
  if (!isBotAdmin) {
    return m.reply("🚫 *Le bot doit être admin* pour obtenir le lien d'invitation.");
  }

  try {
    // Vérifie que c’est un groupe
    if (!m.from.endsWith('@g.us')) {
      return m.reply("⚠️ *Cette commande s'utilise uniquement dans un groupe.*");
    }

    // Obtenir le lien d’invitation
    const code = await sock.groupInviteCode(m.from);
    const inviteLink = `https://chat.whatsapp.com/${code}`;

    await sock.sendMessage(m.from, {
      text: `▛▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
▌ 🔗 𝓛𝓘𝓔𝓝 𝓓𝓤 𝓖𝓡𝓞𝓤𝓟𝓔
▌
▌ Voici le lien :
▌ ${inviteLink}
▌
▌ 📆 Valide jusqu’à 7 jours
▙▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
> 🌟 𝓢𝓟𝓘𝓡𝓘𝓣𝓨-𝓧𝓜𝓓 𝓑𝓞𝓣`
    }, { quoted: m });
  } catch (e) {
    console.error("❌ Erreur lors de la récupération du lien :", e);
    await m.reply("❌ *Impossible d’obtenir le lien du groupe.*\nVérifie que :\n- Le groupe permet les invitations\n- Le bot est bien administrateur\n- Le numéro du bot n'est pas restreint.");
  }
  break;
}


      case 'grdesc': {
        if (!isBotAdmin) return m.reply("🚫 Le bot doit être admin pour lire la description.");
        const desc = metadata.desc || "Aucune description définie.";
        await sock.sendMessage(m.from, {
          text: `▛▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
▌ 📝 𝓓𝓔𝓢𝓒𝓡𝓘𝓟𝓣𝓘𝓞𝓝 𝓓𝓤 𝓖𝓡𝓞𝓤𝓟𝓔
▌
▌ ${desc}
▙▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
▌ ✏️ Seuls les admins peuvent la modifier.
> 🌟 𝓢𝓟𝓘𝓡𝓘𝓣𝓨-𝓧𝓜𝓓 𝓑𝓞𝓣`
        }, { quoted: m });
        break;
      }

      case 'setgrdesc': {
        if (!isSenderAdmin) return m.reply("🚫 Seuls les admins peuvent changer la description.");
        const newDesc = args.join(' ');
        if (!newDesc) return m.reply("❗ Fournis une nouvelle description.");
        await sock.groupUpdateDescription(m.from, newDesc);
        await sock.sendMessage(m.from, {
          text: `✅ *Description mise à jour avec succès !*`,
        }, { quoted: m });
        break;
      }

      case 'setgrname': {
        if (!isSenderAdmin) return m.reply("🚫 Seuls les admins peuvent changer le nom.");
        const newName = args.join(' ');
        if (!newName) return m.reply("❗ Fournis un nouveau nom pour le groupe.");
        await sock.groupUpdateSubject(m.from, newName);
        await sock.sendMessage(m.from, {
          text: `✅ *Nom du groupe mis à jour :* ${newName}`,
        }, { quoted: m });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('❌ Erreur dans groupCommands :', err);
    await m.reply("❌ Une erreur est survenue.");
  }
};

export default groupCommands;

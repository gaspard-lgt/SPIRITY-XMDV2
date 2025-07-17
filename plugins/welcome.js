import config from '../config.cjs';

const gcEvent = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim().toLowerCase();

  if (cmd === 'welcome') {
    if (!m.isGroup) return m.reply("❌ *Cette commande ne peut être utilisée que dans les groupes.*");

    const groupMetadata = await Matrix.groupMetadata(m.from);
    const participants = groupMetadata.participants;
    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    const bot = participants.find(p => p.id === botNumber);
    const sender = participants.find(p => p.id === m.sender);

    const botAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin' || bot.isAdmin);
    const senderAdmin = sender && (sender.admin === 'admin' || sender.admin === 'superadmin' || sender.isAdmin);

    if (!botAdmin) return m.reply("❌ *Je dois être administrateur pour utiliser cette commande.*");
    if (!senderAdmin) return m.reply("❌ *Vous devez être administrateur pour utiliser cette commande.*");

    let responseMessage;
    if (text === 'on') {
      config.WELCOME = true;
      responseMessage = `
╔═════〔 🎉 𝚆𝙴𝙻𝙲𝙾𝙼𝙴 ACTIVÉ 〕═════╗
║
║ ✅ Les messages de bienvenue
║ et d'au revoir ont été activés.
║
╚════════════════════════════╝`;
    } else if (text === 'off') {
      config.WELCOME = false;
      responseMessage = `
╔═════〔 🎉 𝚆𝙴𝙻𝙲𝙾𝙼𝙴 DÉSACTIVÉ 〕═════╗
║
║ ❌ Les messages de bienvenue
║ et d'au revoir ont été désactivés.
║
╚════════════════════════════╝`;
    } else {
      responseMessage = `
╔═════〔 🎉 𝚆𝙴𝙻𝙲𝙾𝙼𝙴 〕═════╗
║
║ 📥 *Activer / Désactiver*
║
║ 🔧 *Commandes :*
║    ➜ welcome on
║    ➜ welcome off
║
║ 📖 *Description :*
║    Active ou désactive les messages
║    de bienvenue et d'au revoir
║    pour ce groupe.
║
║ 👑 *Admins uniquement*
║ 🤖 *Bot admin requis*
║
╚═══════════════════════╝`;
    }

    try {
      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    } catch (error) {
      console.error("Erreur lors du traitement :", error);
      await Matrix.sendMessage(m.from, { text: '❌ Une erreur est survenue lors du traitement de votre demande.' }, { quoted: m });
    }
  }
};

export default gcEvent;

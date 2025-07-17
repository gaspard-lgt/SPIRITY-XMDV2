import config from '../config.cjs';

const gcEvent = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim().toLowerCase();

  if (cmd === 'welcome') {
    if (!m.isGroup) return m.reply("🚫 *Cette commande ne fonctionne que dans les groupes !*");

    let responseMessage;

    if (text === 'on') {
      config.WELCOME = true;
      responseMessage = `
╔═════〔 ✅ 𝚆𝙴𝙻𝙲𝙾𝙼𝙴 ACTIVÉ 〕═════╗
║
║ 🎉 *Messages de bienvenue activés*
║
║ ➔ Les nouveaux membres recevront
║    désormais un message personnalisé. 👋
║
╚═════════════════════════════════╝`;
    } else if (text === 'off') {
      config.WELCOME = false;
      responseMessage = `
╔═════〔 ❌ 𝚆𝙴𝙻𝙲𝙾𝙼𝙴 DÉSACTIVÉ 〕═════╗
║
║ 🔕 *Messages de bienvenue désactivés*
║
║ ➔ Les arrivées et départs ne seront
║    plus notifiés dans ce groupe.
║
╚═════════════════════════════════╝`;
    } else {
      responseMessage = `
╔═════〔 📘 UTILISATION 〕═════╗
║
║ 🔧 *Commandes :*
║
║ ➜ ${prefix}welcome on
║     ➥ Active les messages
║
║ ➜ ${prefix}welcome off
║     ➥ Désactive les messages
║
╚══════════════════════════╝`;
    }

    try {
      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    } catch (error) {
      console.error("Erreur :", error);
      await Matrix.sendMessage(m.from, { text: '❌ *Une erreur est survenue lors du traitement de votre demande.*' }, { quoted: m });
    }
  }
};

export default gcEvent;

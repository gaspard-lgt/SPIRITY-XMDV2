import config from '../config.cjs';

const autoreadCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'autoread') {
    if (!isCreator) {
      return m.reply("❌ Cette commande est réservée au propriétaire.");
    }

    let responseMessage;

    if (text === 'on') {
      config.AUTO_READ = true;
      responseMessage = "✅ Auto-Read a été activé.";
    } else if (text === 'off') {
      config.AUTO_READ = false;
      responseMessage = "⚠️ Auto-Read a été désactivé.";
    } else {
      responseMessage = `📖 Utilisation :
• \`${prefix}autoread on\` : Active Auto-Read
• \`${prefix}autoread off\` : Désactive Auto-Read`;
    }

    try {
      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    } catch (error) {
      console.error("❌ Erreur lors du traitement de la commande :", error);
      await Matrix.sendMessage(m.from, { text: '⚠️ Une erreur est survenue lors du traitement de la commande.' }, { quoted: m });
    }
  }
};

export default autoreadCommand;

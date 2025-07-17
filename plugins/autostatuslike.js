import config from '../config.cjs';

// Fonction principale
const anticallCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();
  
  const validCommands = ['autolike', 'autoslike', 'autostatuslike'];

  if (validCommands.includes(cmd)) {
    if (!isCreator) {
      return m.reply("❌ Cette commande est réservée au propriétaire.");
    }

    let responseMessage;

    if (text === 'on') {
      config.AUTOLIKE_STATUS = true;
      responseMessage = "✅ Auto-Like Status a été activé.";
    } else if (text === 'off') {
      config.AUTOLIKE_STATUS = false;
      responseMessage = "⚠️ Auto-Like Status a été désactivé.";
    } else {
      responseMessage = `💡 Utilisation :
• \`${prefix + cmd} on\` : Active Auto-Like Status
• \`${prefix + cmd} off\` : Désactive Auto-Like Status`;
    }

    try {
      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    } catch (error) {
      console.error("❌ Erreur lors du traitement de la commande :", error);
      await Matrix.sendMessage(m.from, { text: '⚠️ Une erreur est survenue lors du traitement de la commande.' }, { quoted: m });
    }
  }
};

export default anticallCommand;

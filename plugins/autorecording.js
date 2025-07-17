import config from '../config.cjs';

const autorecordingCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'autorecording') {
    if (!isCreator) {
      return m.reply("❌ Cette commande est réservée au propriétaire.");
    }

    let responseMessage;

    if (text === 'on') {
      config.AUTO_RECORDING = true;
      responseMessage = "✅ Auto-Recording a été activé.";
    } else if (text === 'off') {
      config.AUTO_RECORDING = false;
      responseMessage = "⚠️ Auto-Recording a été désactivé.";
    } else {
      responseMessage = `🎙️ Utilisation :
• \`${prefix}autorecording on\` : Active Auto-Recording
• \`${prefix}autorecording off\` : Désactive Auto-Recording`;
    }

    try {
      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    } catch (error) {
      console.error("❌ Erreur lors du traitement de la commande :", error);
      await Matrix.sendMessage(m.from, { text: '⚠️ Une erreur est survenue lors du traitement de la commande.' }, { quoted: m });
    }
  }
};

export default autorecordingCommand;

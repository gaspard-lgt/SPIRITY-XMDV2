import config from '../config.cjs';

// Fonction principale
const anticallCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;
  const [cmd, ...args] = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(/\s+/) : [''];
  const text = args.join(' ').trim().toLowerCase();

  const validCommands = ['autostatus', 'autosview', 'autostatusview'];

  if (validCommands.includes(cmd)) {
    if (!isCreator) {
      return m.reply("❌ Cette commande est réservée au propriétaire.");
    }

    let responseMessage = '';
    let updatedConfig = false;

    if (text === 'on') {
      config.AUTO_STATUS_SEEN = true;
      updatedConfig = true;
      responseMessage = "✅ Auto-Status View a été activé. Tous les statuts seront désormais vus automatiquement.";
    } else if (text === 'off') {
      config.AUTO_STATUS_SEEN = false;
      updatedConfig = true;
      responseMessage = "⚠️ Auto-Status View a été désactivé. Les statuts ne seront plus vus automatiquement.";
    } else {
      responseMessage = `💡 Utilisation :
• \`${prefix + cmd} on\` : Active Auto-Status View
• \`${prefix + cmd} off\` : Désactive Auto-Status View`;
    }

    try {
      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
      if (updatedConfig) {
        console.log("⚙️ Configuration mise à jour :", config);
      }
    } catch (error) {
      console.error("❌ Erreur lors du traitement :", error);
      await Matrix.sendMessage(m.from, { text: '⚠️ Une erreur est survenue lors du traitement de la commande.' }, { quoted: m });
    }
  }
};

export default anticallCommand;

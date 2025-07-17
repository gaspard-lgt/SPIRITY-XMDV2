import config from '../config.cjs';

const antigays = async (m, Matrix) => {
  const prefix = config.PREFIX || '.';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim().toLowerCase();

  if (cmd === 'antigays') {
    if (m.isGroup) return m.reply("🚫 Cette commande ne fonctionne qu'en messages privés.");

    if (!text || (text !== 'on' && text !== 'off')) {
      return m.reply("Usage : antigays on | antigays off");
    }

    config.ANTIGAYS_ENABLED = (text === 'on');
    return await Matrix.sendMessage(m.from, { text: `Filtre antigays 😏🫴 est maintenant *${config.ANTIGAYS_ENABLED ? 'activé ✅' : 'désactivé ❌'}*` }, { quoted: m });
  }
};

// Fonction à appeler dans handler.js
const checkPrivateMessages = async (m, Matrix) => {
  try {
    // Exclure la commande antigays elle-même
    const prefix = config.PREFIX || '.';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    if (cmd === 'antigays') return;

    if (!config.ANTIGAYS_ENABLED) return;
    if (m.isGroup) return; // fonctionne uniquement en PV
    if (m.key.fromMe) return;

    const bannedWords = config.ANTIGAYS_WORDS || ['peder', 'gays','gys','pede', 'pedé', 'pédé', 'pédé', 'gai', 'gay'];
    const messageText = m.body.toLowerCase();
    const found = bannedWords.some(word => messageText.includes(word));

    if (found) {
      const sender = m.sender || m.key.remoteJid;
      await Matrix.updateBlockStatus(sender, 'block');
      await Matrix.sendMessage(sender, { text: "🚫 Vous avez été bloqué parce que vous êtes un putain de pédé." });
      console.log(`[ANTIGAYS] Bloqué ${sender} pour message inapproprié.`);
    }
  } catch (error) {
    console.error('Erreur dans antigays:', error);
  }
};

export { antigays, checkPrivateMessages };
export default antigays;

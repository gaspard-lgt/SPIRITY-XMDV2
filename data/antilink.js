import { serialize } from '../lib/Serializer.js';

const antilinkSettings = {};
const warns = {};

const BOT_NAME = '🌟 𝓢𝓟𝓘𝓡𝓘𝓣𝓨-𝓧𝓜𝓓 𝓑𝓞𝓣';

const asciiBox = (title, body) => `
╔══ ⦿ ${title} ⦿ ═════════════╗
${body}
╚════════════════════════════╝
`;

const darkSpirityWarn = (user, warnCount, maxWarn) => asciiBox(
  '𝗔𝗡𝗧𝗜𝗟𝗜𝗡𝗞 - 𝗔𝗩𝗘𝗥𝗧𝗜𝗦𝗦𝗘𝗠𝗘𝗡𝗧',
  `⚠️ @${user}, avertissement ${warnCount}/${maxWarn}
🚫 Pas de lien autorisé dans ce groupe.
🔮 Respecte les règles ou subis les conséquences.`
);

const darkSpirityKick = (user, warnCount) => asciiBox(
  '𝗔𝗡𝗧𝗜𝗟𝗜𝗡𝗞 - 𝗘𝗫𝗣𝗨𝗟𝗦𝗜𝗢𝗡',
  `🔥 @${user} a reçu ${warnCount} avertissements !
💨 Il a été banni du groupe.
☠️ Les règles sont sacrées dans ce sanctuaire.`
);

const darkSpirityDelete = asciiBox(
  '𝗔𝗡𝗧𝗜𝗟𝗜𝗡𝗞 - 𝗦𝗨𝗣𝗣𝗥𝗘𝗦𝗦𝗜𝗢𝗡',
  `💀 Message supprimé automatiquement.
🔗 Un lien interdit a été détecté.
🧿 Protégé par ${BOT_NAME}`
);

const darkSpirityActivated = (mode) => asciiBox(
  '𝗔𝗡𝗧𝗜𝗟𝗜𝗡𝗞 - 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗜𝗢𝗡',
  `✅ Protection activée : *${mode.toUpperCase()}*
🛡️ Ce groupe est désormais protégé par ${BOT_NAME}.`
);

const darkSpirityDeactivated = asciiBox(
  '𝗔𝗡𝗧𝗜𝗟𝗜𝗡𝗞 - 𝗗É𝗦𝗔𝗖𝗧𝗜𝗩É',
  `⚠️ Protection désactivée.
❗ Le groupe n'est plus protégé par ${BOT_NAME}.
👉 Sois prudent.`
);

export const handleAntilink = async (m, sock, logger, isBotAdmins, isAdmins, isCreator) => {
  const PREFIX = /^[\\/!#.]/;
  const isCOMMAND = (body) => PREFIX.test(body);
  const prefixMatch = isCOMMAND(m.body) ? m.body.match(PREFIX) : null;
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'antilink') {
    const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/);
    const action = args[0]?.toLowerCase();

    if (!m.isGroup) return sock.sendMessage(m.from, { text: '❌ Commande groupe uniquement.' }, { quoted: m });
    if (!isBotAdmins) return sock.sendMessage(m.from, { text: '❌ Le bot doit être admin.' }, { quoted: m });
    if (!isAdmins) return sock.sendMessage(m.from, { text: '❌ Seuls les admins peuvent activer cette fonction.' }, { quoted: m });

    if (action === 'on') {
      antilinkSettings[m.from] = antilinkSettings[m.from] || {};
      antilinkSettings[m.from].enabled = true;
      if (!antilinkSettings[m.from].mode) antilinkSettings[m.from].mode = 'delete';
      return sock.sendMessage(m.from, { text: darkSpirityActivated(antilinkSettings[m.from].mode) }, { quoted: m });
    }

    if (action === 'off') {
      if (antilinkSettings[m.from]) antilinkSettings[m.from].enabled = false;
      return sock.sendMessage(m.from, { text: darkSpirityDeactivated }, { quoted: m });
    }

    if (['warn1', 'warn2', 'warn3', 'delete'].includes(action)) {
      antilinkSettings[m.from] = antilinkSettings[m.from] || {};
      antilinkSettings[m.from].mode = action;
      antilinkSettings[m.from].enabled = true;
      return sock.sendMessage(m.from, {
        text: asciiBox('𝗔𝗡𝗧𝗜𝗟𝗜𝗡𝗞 - 𝗠𝗢𝗗𝗘', `🔧 Mode antilink mis à jour : *${action.toUpperCase()}*`)
      }, { quoted: m });
    }

    return sock.sendMessage(m.from, {
      text: asciiBox('𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗜𝗢𝗡', `
┏━━━〔 *Commandes disponibles* : 〕━━━┓
${prefix}antilink on
${prefix}antilink off
${prefix}antilink warn1
${prefix}antilink warn2
${prefix}antilink warn3
${prefix}antilink delete`)


    }, { quoted: m });
  }

  if (antilinkSettings[m.from]?.enabled && m.isGroup) {
    if (isAdmins || isBotAdmins || isCreator) return;

    const linkRegex = /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[a-zA-Z0-9]+)/gi;
    let text = '';
    if (m.message.conversation) text = m.message.conversation;
    else if (m.message.extendedTextMessage) text = m.message.extendedTextMessage.text;
    else return;

    if (linkRegex.test(text)) {
      try {
        await sock.sendMessage(m.from, { delete: m.key });
        await sock.sendMessage(m.from, { text: darkSpirityDelete }, { quoted: m });
      } catch (e) {
        console.error('❌ Suppression échouée :', e);
      }

      const mode = antilinkSettings[m.from].mode || 'delete';
      if (mode === 'delete') return;

      warns[m.from] = warns[m.from] || {};
      warns[m.from][m.sender] = (warns[m.from][m.sender] || 0) + 1;

      const maxWarn = parseInt(mode.replace('warn', ''), 10);
      const userWarns = warns[m.from][m.sender];

      if (userWarns >= maxWarn) {
        try {
          await sock.groupParticipantsUpdate(m.from, [m.sender], 'remove');
          await sock.sendMessage(m.from, {
            text: darkSpirityKick(m.sender.split('@')[0], userWarns),
            contextInfo: { mentionedJid: [m.sender] }
          });
          warns[m.from][m.sender] = 0;
        } catch (err) {
          console.error('❌ Expulsion échouée :', err);
        }
      } else {
        await sock.sendMessage(m.from, {
          text: darkSpirityWarn(m.sender.split('@')[0], userWarns, maxWarn),
          contextInfo: { mentionedJid: [m.sender] }
        });
      }
    }
  }
};

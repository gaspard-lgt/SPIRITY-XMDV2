import config from '../config.cjs';

// Stockage en mémoire des timers par groupe
const groupTimers = new Map();

function parseDuration(durationStr) {
  // Parse une durée comme "5h", "10min", "2jrs"
  const regex = /^(\d+)(min|h|jrs)$/i;
  const match = durationStr.match(regex);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'min': return value * 60 * 1000;       // minutes en ms
    case 'h': return value * 60 * 60 * 1000;    // heures en ms
    case 'jrs': return value * 24 * 60 * 60 * 1000; // jours en ms
    default: return null;
  }
}

const openCloseGroupTemp = async (message, sock) => {
  const prefix = config.PREFIX;
  const parts = message.body.startsWith(prefix)
    ? message.body.slice(prefix.length).trim().split(' ')
    : [];

  const cmd = parts[0]?.toLowerCase();
  const durationArg = parts[1]?.toLowerCase();

  if (!['open', 'close'].includes(cmd)) return;

  if (!message.isGroup) {
    return await sock.sendMessage(
      message.from,
      { text: '🚫 Cette commande fonctionne uniquement dans les groupes.' },
      { quoted: message }
    );
  }

  // Vérifier que l’auteur est admin
  const groupMeta = await sock.groupMetadata(message.from);
  const participants = groupMeta.participants;
  const senderId = message.sender;
  const senderIsAdmin = participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));

  if (!senderIsAdmin) {
    return await sock.sendMessage(
      message.from,
      { text: '❌ Vous devez être admin pour utiliser cette commande.' },
      { quoted: message }
    );
  }

  // Durée facultative, sinon 0 = indéfini
  let durationMs = 0;
  if (durationArg) {
    const parsed = parseDuration(durationArg);
    if (parsed === null) {
      return await sock.sendMessage(
        message.from,
        { text: "❌ Durée invalide. Utilisez par exemple : 5min, 3h, 2jrs" },
        { quoted: message }
      );
    }
    durationMs = parsed;
  }

  try {
    if (cmd === 'close') {
      // Fermer le groupe (mode annonce)
      await sock.groupSettingUpdate(message.from, 'announcement');
      await sock.sendMessage(message.from, { text: `🔒 Groupe fermé${durationMs ? ` pendant ${durationArg}` : ''} : seuls les admins peuvent écrire.` }, { quoted: message });

      // Planifier réouverture si durée définie
      if (durationMs > 0) {
        if (groupTimers.has(message.from)) clearTimeout(groupTimers.get(message.from));
        const timer = setTimeout(async () => {
          try {
            await sock.groupSettingUpdate(message.from, 'not_announcement');
            await sock.sendMessage(message.from, { text: '🔓 Le groupe est automatiquement rouvert.' });
          } catch (e) {
            console.error('Erreur réouverture groupe:', e);
          }
          groupTimers.delete(message.from);
        }, durationMs);
        groupTimers.set(message.from, timer);
      }
    } else if (cmd === 'open') {
      // Ouvrir le groupe (mode normal)
      await sock.groupSettingUpdate(message.from, 'not_announcement');
      await sock.sendMessage(message.from, { text: `🔓 Groupe ouvert${durationMs ? ` pendant ${durationArg}` : ''} : tous les membres peuvent écrire.` }, { quoted: message });

      // Planifier fermeture si durée définie
      if (durationMs > 0) {
        if (groupTimers.has(message.from)) clearTimeout(groupTimers.get(message.from));
        const timer = setTimeout(async () => {
          try {
            await sock.groupSettingUpdate(message.from, 'announcement');
            await sock.sendMessage(message.from, { text: '🔒 Le groupe est automatiquement fermé.' });
          } catch (e) {
            console.error('Erreur fermeture groupe:', e);
          }
          groupTimers.delete(message.from);
        }, durationMs);
        groupTimers.set(message.from, timer);
      }
    }
  } catch (error) {
    console.error('Erreur open/close temporaire:', error);
    await sock.sendMessage(message.from, { text: '❌ Une erreur est survenue lors de la modification du groupe.' }, { quoted: message });
  }
};

export default openCloseGroupTemp;

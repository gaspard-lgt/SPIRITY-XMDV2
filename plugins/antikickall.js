// groupTools.js

import pkg from '@whiskeysockets/baileys';
const { proto } = pkg;
import config from '../config.cjs'; // adapte selon ton chemin

const groupTools = async (m, sock) => {
  const { isGroup, from, participant, sender, quoted, body } = m;
  const groupMetadata = isGroup ? await sock.groupMetadata(from) : {};
  const groupAdmins = isGroup ? groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id) : [];
  const isBotAdmin = isGroup ? groupMetadata.participants.some(p => p.id === sock.user.id && p.admin !== null) : false;
  const isAdmin = isGroup ? groupAdmins.includes(sender) : false;

  const prefix = '.';
  const ownerNumber = config.OWNER_NUMBER; // configure OWNER_NUMBER dans ton config.cjs

  const isOwner = sender.includes(ownerNumber);
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  // PROMOTE
  if (cmd === 'promote') {
    if (!isGroup) return await sock.sendMessage(from, { text: 'Cette commande est réservée aux groupes.' }, { quoted: m });
    if (!isAdmin) return await sock.sendMessage(from, { text: 'Seuls les admins peuvent promouvoir.' }, { quoted: m });
    if (!isBotAdmin) return await sock.sendMessage(from, { text: 'Je dois être admin pour promouvoir.' }, { quoted: m });

    const mention = quoted ? quoted.sender : m.mentionedJid ? m.mentionedJid[0] : null;
    if (!mention) return await sock.sendMessage(from, { text: 'Mentionnez la personne à promouvoir.' }, { quoted: m });

    await sock.groupParticipantsUpdate(from, [mention], 'promote');
    await sock.sendMessage(from, { text: '✅ Promotion réussie.' }, { quoted: m });
  }

  // DEMOTE
  if (cmd === 'demote') {
    if (!isGroup) return await sock.sendMessage(from, { text: 'Cette commande est réservée aux groupes.' }, { quoted: m });
    if (!isAdmin) return await sock.sendMessage(from, { text: 'Seuls les admins peuvent rétrograder.' }, { quoted: m });
    if (!isBotAdmin) return await sock.sendMessage(from, { text: 'Je dois être admin pour rétrograder.' }, { quoted: m });

    const mention = quoted ? quoted.sender : m.mentionedJid ? m.mentionedJid[0] : null;
    if (!mention) return await sock.sendMessage(from, { text: 'Mentionnez la personne à rétrograder.' }, { quoted: m });

    await sock.groupParticipantsUpdate(from, [mention], 'demote');
    await sock.sendMessage(from, { text: '✅ Rétrogradation réussie.' }, { quoted: m });
  }

  // ANTIKICKALL (propriétaire uniquement)
  if (cmd === 'antikickall') {
    if (!isOwner) return await sock.sendMessage(from, { text: '❌ Seul le propriétaire du bot peut utiliser cette commande.' }, { quoted: m });

    if (!isGroup) return await sock.sendMessage(from, { text: 'Cette commande est réservée aux groupes.' }, { quoted: m });

    await sock.sendMessage(from, { text: '🛡️ Antikick activé (protection basique, ajoute le handler global si besoin).' }, { quoted: m });
    // Implémente ton système global ici pour surveiller et réinviter les kickés si ce n’est pas un kick du propriétaire.
  }
};

export default groupTools;

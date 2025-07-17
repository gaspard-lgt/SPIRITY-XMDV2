import pkg from '@whiskeysockets/baileys';
const { downloadMediaMessage } = pkg;
import config from '../config.cjs';

const OwnerCmd = async (m, Matrix) => {
  // Numéros du bot et du propriétaire
  const botNumber = Matrix.user.id.split(':')[0] + '@s.whatsapp.net';
  const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
  const prefix = config.PREFIX;
  
  // Extraire la commande (sans le préfixe)
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  // Vérifier si l’émetteur est le propriétaire ou le bot
  const isOwner = m.sender === ownerNumber;
  const isBot = m.sender === botNumber;

  // On ne traite que les commandes vv, vv2, vv3
  if (!['vv', 'vv2', 'vv3'].includes(cmd)) return;

  // Vérifier qu’un message est cité (répondu)
  if (!m.quoted) return m.reply('*Réponds à un message View Once !*');

  // Extraire le vrai message contenu dans la structure View Once
  let msg = m.quoted.message;
  if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;
  else if (msg.viewOnceMessage) msg = msg.viewOnceMessage.message;

  if (!msg) return m.reply('*Ce message n\'est pas un View Once !*');

  // Autorisation : les commandes vv2 et vv3 sont réservées au propriétaire et au bot
  if (['vv2', 'vv3'].includes(cmd) && !isOwner && !isBot) {
    return m.reply('*Seul le propriétaire ou le bot peuvent utiliser cette commande !*');
  }

  // La commande vv est aussi limitée au propriétaire et au bot
  if (cmd === 'vv' && !isOwner && !isBot) {
    return m.reply('*Seul le propriétaire ou le bot peuvent utiliser cette commande pour envoyer un média !*');
  }

  try {
    // Récupérer le type du message (image, vidéo, audio, etc.)
    const messageType = Object.keys(msg)[0];
    let buffer;

    // Télécharger le média en buffer, en précisant le type si c’est un audio
    if (messageType === 'audioMessage') {
      buffer = await downloadMediaMessage(m.quoted, 'buffer', {}, { type: 'audio' });
    } else {
      buffer = await downloadMediaMessage(m.quoted, 'buffer');
    }

    if (!buffer) return m.reply('*Impossible de récupérer le média !*');

    // Définir le mimetype audio par défaut et le texte du caption
    const mimetype = msg.audioMessage?.mimetype || 'audio/ogg';
    const caption = ' *ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ ᴠɪᴇᴡ ᴏɴᴄᴇ ʙʏ DARK DEV*';

    // Déterminer le destinataire selon la commande
    let destinataire;
    switch (cmd) {
      case 'vv': destinataire = m.from; break;      // Même discussion (propriétaire/bot uniquement)
      case 'vv2': destinataire = botNumber; break;  // Boîte de réception du bot
      case 'vv3': destinataire = ownerNumber; break;// Boîte de réception du propriétaire
    }

    // Envoyer le média selon son type
    if (messageType === 'imageMessage') {
      await Matrix.sendMessage(destinataire, { image: buffer, caption });
    } else if (messageType === 'videoMessage') {
      await Matrix.sendMessage(destinataire, { video: buffer, caption, mimetype: 'video/mp4' });
    } else if (messageType === 'audioMessage') {
      await Matrix.sendMessage(destinataire, { audio: buffer, mimetype, ptt: true });
    } else {
      return m.reply('*Type de média non supporté !*');
    }

  } catch (error) {
    console.error('Erreur dans OwnerCmd :', error);
    await m.reply('*Échec lors du traitement du message View Once !*');
  }
};

export default OwnerCmd;

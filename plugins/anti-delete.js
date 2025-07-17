import fs from 'fs';
import config from '../config.cjs';
import pkg from '@whiskeysockets/baileys';
const { proto, downloadContentFromMessage } = pkg;

const prefix = config.PREFIX;
const antiDeleteGlobal = config.ANTI_DELETE;

const demonContext = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363422353392657@newsletter',
    newsletterName: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
    serverMessageId: 143
  }
};

class DemonAntiDelete {
  constructor() {
    this.enabled = false;
    this.messageCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanExpiredMessages(), this.cacheExpiry);
  }

  cleanExpiredMessages() {
    const now = Date.now();
    for (const [key, msg] of this.messageCache.entries()) {
      if (now - msg.timestamp > this.cacheExpiry) {
        this.messageCache.delete(key);
      }
    }
  }

  formatTime(timestamp) {
    const options = {
      timeZone: 'Africa/Ouagadougou',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    return new Date(timestamp).toLocaleString('fr-FR', options);
  }
}

const demonDelete = new DemonAntiDelete();
const statusPath = './demon_antidelete.json';

let statusData = {};
if (fs.existsSync(statusPath)) {
  statusData = JSON.parse(fs.readFileSync(statusPath));
}
if (!statusData.chats) statusData.chats = {};

if (antiDeleteGlobal) {
  demonDelete.enabled = true;
}

const AntiDelete = async (m, Matrix) => {
  const chatId = m.from;
  const formatJid = (jid) => jid ? jid.replace(/@s\.whatsapp\.net|@g\.us/g, '') : 'Inconnu';

  const getChatInfo = async (jid) => {
    if (!jid) return { name: 'Chat inconnu', isGroup: false };
    if (jid.includes('@g.us')) {
      try {
        const groupMetadata = await Matrix.groupMetadata(jid);
        return {
          name: groupMetadata?.subject || 'Groupe',
          isGroup: true
        };
      } catch {
        return { name: 'Groupe', isGroup: true };
      }
    }
    return { name: 'Conversation privée', isGroup: false };
  };

  if (m.body.toLowerCase() === `${prefix}antidelete on` || m.body.toLowerCase() === `${prefix}antidelete off`) {
    if (m.body.toLowerCase() === `${prefix}antidelete on`) {
      statusData.chats[chatId] = true;
      demonDelete.enabled = true;
      await Matrix.sendMessage(m.from, {
        text: `╭━━━[ 𝐀𝐧𝐭𝐢-𝐒𝐮𝐩𝐩𝐫𝐞𝐬𝐬𝐢𝐨𝐧 ]━━━╮\n┃ ✅ Anti-delete activé\n┃ Les messages supprimés seront récupérés\n╰━━━━━━━━━━━━━━━━━━╯\nᴘᴏᴡᴇʀᴇᴅ ʙʏ DARK-DEV`
      }, { quoted: m });
    } else {
      statusData.chats[chatId] = false;
      demonDelete.enabled = false;
      demonDelete.messageCache.clear();
      await Matrix.sendMessage(m.from, {
        text: `╭━━━[ 𝐀𝐧𝐭𝐢-𝐒𝐮𝐩𝐩𝐫𝐞𝐬𝐬𝐢𝐨𝐧 ]━━━╮\n┃ ⛔ Anti-delete désactivé\n┃ Les messages supprimés ne seront plus récupérés\n╰━━━━━━━━━━━━━━━━━━╯\nᴘᴏᴡᴇʀᴇᴅ ʙʏ DARK-DEV`
      }, { quoted: m });
    }
    fs.writeFileSync(statusPath, JSON.stringify(statusData, null, 2));
    await Matrix.sendReaction(m.from, m.key, '⚔️');
    return;
  }

  Matrix.ev.on('messages.upsert', async ({ messages }) => {
    if (!antiDeleteGlobal && !demonDelete.enabled) return;
    if (!messages?.length) return;

    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message || msg.key.remoteJid === 'status@broadcast') continue;

      try {
        const content = msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          msg.message.documentMessage?.caption;

        let media, type, mimetype;
        const mediaTypes = ['image', 'video', 'audio', 'sticker', 'document'];

        for (const mediaType of mediaTypes) {
          if (msg.message[`${mediaType}Message`]) {
            const mediaMsg = msg.message[`${mediaType}Message`];
            try {
              const stream = await downloadContentFromMessage(mediaMsg, mediaType);
              let buffer = Buffer.from([]);
              for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
              media = buffer;
              type = mediaType;
              mimetype = mediaMsg.mimetype;
              break;
            } catch {}
          }
        }

        if (msg.message.audioMessage?.ptt) {
          try {
            const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            media = buffer;
            type = 'voice';
            mimetype = msg.message.audioMessage.mimetype;
          } catch {}
        }

        if (content || media) {
          demonDelete.messageCache.set(msg.key.id, {
            content,
            media,
            type,
            mimetype,
            sender: msg.key.participant || msg.key.remoteJid,
            senderFormatted: `@${formatJid(msg.key.participant || msg.key.remoteJid)}`,
            timestamp: Date.now(),
            chatJid: msg.key.remoteJid
          });
        }
      } catch {}
    }
  });

  Matrix.ev.on('messages.update', async (updates) => {
    if (!antiDeleteGlobal && !demonDelete.enabled) return;
    if (!updates?.length) return;

    for (const update of updates) {
      try {
        const { key, update: updateData } = update;
        const isDeleted = updateData?.messageStubType === proto.WebMessageInfo.StubType.REVOKE ||
          updateData?.status === proto.WebMessageInfo.Status.DELETED;

        if (!isDeleted || key.fromMe || !demonDelete.messageCache.has(key.id)) continue;

        const cachedMsg = demonDelete.messageCache.get(key.id);
        demonDelete.messageCache.delete(key.id);

        const chatInfo = await getChatInfo(cachedMsg.chatJid);
        const deletedBy = updateData?.participant ?
          `@${formatJid(updateData.participant)}` :
          (key.participant ? `@${formatJid(key.participant)}` : 'Inconnu');

        const messageType = cachedMsg.type ?
          cachedMsg.type.charAt(0).toUpperCase() + cachedMsg.type.slice(1) :
          'Message';

        const baseInfo = `
╭━━━[ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐒𝐮𝐩𝐩𝐫𝐢𝐦é 𝐑é𝐜𝐮𝐩é𝐫é ]━━━╮
┃
┃ 👤 Expéditeur : ${cachedMsg.senderFormatted}
┃ 🗡️ Supprimé par : ${deletedBy}
┃ 🏰 Lieu : ${chatInfo.name}${chatInfo.isGroup ? ' (Groupe)' : ''}
┃ ⏰ Envoyé à : ${demonDelete.formatTime(cachedMsg.timestamp)}
┃ 🕰️ Supprimé à : ${demonDelete.formatTime(Date.now())}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
ᴘᴏᴡᴇʀᴇᴅ ʙʏ DARK-DEV
`;

        if (cachedMsg.media) {
          await Matrix.sendMessage(cachedMsg.chatJid, {
            [cachedMsg.type]: cachedMsg.media,
            mimetype: cachedMsg.mimetype,
            caption: baseInfo,
            contextInfo: demonContext
          });
        } else if (cachedMsg.content) {
          await Matrix.sendMessage(cachedMsg.chatJid, {
            text: `${baseInfo}\n\n📜 Contenu récupéré : \n${cachedMsg.content}`,
            contextInfo: demonContext
          });
        }
      } catch {}
    }
  });
};

export default AntiDelete;

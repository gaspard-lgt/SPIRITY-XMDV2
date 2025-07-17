import { serialize } from '../lib/Serializer.js';
import path from 'path';
import fs from 'fs/promises';
import config from '../config.cjs';
import { smsg } from '../lib/myfunc.cjs';
import { handleAntilink } from './antilink.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getGroupAdmins = (participants = []) => {
  return participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
};

const Handler = async (chatUpdate, sock, logger) => {
  try {
    if (chatUpdate.type !== 'notify') return;

    const m = serialize(JSON.parse(JSON.stringify(chatUpdate.messages[0])), sock, logger);
    if (!m.message) return;

    // Récupération des IDs
    const botNumber = await sock.decodeJid(sock.user.id);
    const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';

    // ============ FILTRE ANTIGAYS =============
    // On ne bloque pas le propriétaire ni le bot lui-même
    if (
      !m.isGroup && 
      config.ANTIGAYS_ENABLED && 
      m.sender !== ownerNumber && 
      m.sender !== botNumber
    ) {
      const bannedWords = ['peder', 'gays', 'gys', 'pede', 'pedé', 'pédé', 'gai', 'gay'];
      const messageText = (m.body || '').toLowerCase();
      const found = bannedWords.some(word => messageText.includes(word));

      if (found) {
        await sock.updateBlockStatus(m.sender, 'block'); // bloque le user
        await sock.sendMessage(m.sender, {
          text: "🚫 Vous avez été bloqué pour utilisation de mots interdits."
        });
        console.log(`[ANTIGAYS] ${m.sender} bloqué pour message: ${messageText}`);
        return; // stop further processing
      }
    }
    // ============================================

    // Récupération conditionnelle des données de groupe
    let groupMetadata = null;
    let participants = [];

    const groupRequiredCmds = [
      'tagall', 'tagadmin', 'antilink', 'welcome', 'url',
      'viewonce', 'shazam', 'spirity', 'surah', 'tiktok'
    ];

    const PREFIX = /^[\\/!#\.]/;
    const isCOMMAND = (body) => PREFIX.test(body);
    const prefixMatch = isCOMMAND(m.body) ? m.body.match(PREFIX) : null;
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    // Si commande nécessite infos groupe, alors seulement on appelle groupMetadata
    if (m.isGroup && groupRequiredCmds.includes(cmd)) {
      try {
        groupMetadata = await sock.groupMetadata(m.from);
        participants = groupMetadata?.participants || [];
      } catch (err) {
        if (err.data === 429) {
          await sock.sendMessage(m.from, {
            text: '⚠️ Trop de requêtes envoyées à WhatsApp. Attends un peu avant de réessayer.'
          }, { quoted: m });
          return;
        } else {
          console.error(`❌ Erreur groupMetadata (${m.from}) :`, err);
        }
      }
    }

    const groupAdmins = m.isGroup ? getGroupAdmins(participants) : [];
    const botId = botNumber;
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botId) : false;
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
    const isCreator = [ownerNumber, botNumber].includes(m.sender);

    if (!sock.public && !isCreator) return;

    await handleAntilink(m, sock, logger, isBotAdmins, isAdmins, isCreator);

    // Chargement des plugins dynamiques
    const pluginDir = path.resolve(__dirname, '..', 'plugins');

    try {
      const pluginFiles = await fs.readdir(pluginDir);
      for (const file of pluginFiles) {
        if (file.endsWith('.js')) {
          const pluginPath = path.join(pluginDir, file);
          try {
            const pluginModule = await import(`file://${pluginPath}`);
            const loadPlugin = pluginModule.default;
            await loadPlugin(m, sock, { participants, groupMetadata });
          } catch (err) {
            console.error(`❌ Failed to load plugin: ${pluginPath}`, err);
          }
        }
      }
    } catch (err) {
      console.error(`❌ Plugin folder not found: ${pluginDir}`, err);
    }
  } catch (err) {
    console.error('❌ Erreur générale dans le handler :', err);
  }
};

export default Handler;

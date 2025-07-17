import axios from 'axios';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('../config.cjs');

const chatbotcommand = async (m, Matrix) => {
  try {
    console.log('--- Nouvelle commande reçue ---');
    console.log('Message:', m.body);
    console.log('Sender:', m.sender);

    const botNumber = await Matrix.decodeJid(Matrix.user.id);
    console.log('Bot Number:', botNumber);

    const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
    const prefix = config.PREFIX;

    let msgText = '';
    if (m.message.conversation) msgText = m.message.conversation;
    else if (m.message.extendedTextMessage) msgText = m.message.extendedTextMessage.text;
    else {
      console.log('Message non texte, on ignore.');
      return;
    }

    if (!msgText.startsWith(prefix)) {
      console.log('Message ne commence pas par le préfixe.');
      return;
    }

    const args = msgText.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();
    const text = args.join(' ').toLowerCase();

    const from = m.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? m.key.participant : from;

    console.log(`Commande: ${cmd}, Args: ${text}`);
    console.log(`Is group: ${isGroup}, Sender utilisé: ${sender}`);

    // Commandes admin
    if (cmd === 'dark-ai') {
      if (!isCreator) {
        console.log('Accès refusé: utilisateur non admin');
        return m.reply("❌ *Accès refusé* — Réservé à l'administrateur.");
      }

      if (text === 'on') {
        global.chatbotEnabled = true;
        await Matrix.sendMessage(from, { text: "🤖 Chatbot activé pour les messages privés." }, { quoted: m });
      } else if (text === 'off') {
        global.chatbotEnabled = false;
        await Matrix.sendMessage(from, { text: "🛑 Chatbot désactivé pour les messages privés." }, { quoted: m });
      } else {
        await Matrix.sendMessage(from, { text: `Usage :\n${prefix}dark-ai on\n${prefix}dark-ai off` }, { quoted: m });
      }
      return;
    }

    if (cmd === 'darkai-grp') {
      if (!isCreator) {
        console.log('Accès refusé: utilisateur non admin');
        return m.reply("❌ *Accès refusé* — Réservé à l'administrateur.");
      }

      if (text === 'on') {
        global.chatbotInGroupEnabled = true;
        await Matrix.sendMessage(from, { text: "👥 Chatbot activé dans les groupes." }, { quoted: m });
      } else if (text === 'off') {
        global.chatbotInGroupEnabled = false;
        await Matrix.sendMessage(from, { text: "🚫 Chatbot désactivé dans les groupes." }, { quoted: m });
      } else {
        await Matrix.sendMessage(from, { text: `Usage :\n${prefix}darkai-grp on\n${prefix}darkai-grp off` }, { quoted: m });
      }
      return;
    }

    if (!isGroup && !global.chatbotEnabled) {
      console.log('Chatbot désactivé en inbox');
      return;
    }
    if (isGroup && !global.chatbotInGroupEnabled) {
      console.log('Chatbot désactivé en groupe');
      return;
    }

    if (isGroup) {
      const mentionedJid = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (!mentionedJid.includes(botNumber)) {
        console.log('Bot non mentionné dans le groupe, on ignore.');
        return;
      }
    }

    if (!global.userChats) global.userChats = {};
    if (!global.userChats[sender]) global.userChats[sender] = [];

    global.userChats[sender].push(`User: ${msgText}`);
    if (global.userChats[sender].length > 15) global.userChats[sender].shift();
    const userHistory = global.userChats[sender].join("\n");

    const questionsQuiEsTu = [
      "qui es-tu",
      "qui es tu",
      "qui êtes-vous",
      "c'est quoi dark-ai",
      "c'est qui dark-ai",
      "que fais-tu",
      "qui es dark-ai"
    ];
    const msgLower = msgText.toLowerCase();

    if (questionsQuiEsTu.some(q => msgLower.includes(q))) {
      const reponse = "👻 Je suis l'esprit *Dark-AI*, exorcisé par *Dark-DEv*, prêt à répondre à tes questions dans les ténèbres du code.";
      global.userChats[sender].push(`Bot: ${reponse}`);
      await Matrix.sendMessage(from, { text: reponse }, { quoted: m });
      return;
    }

    const prompt = `
Hey Hey human, I am Dark-AI developed in the darkness by DARK-DEV.

### Conversation History:
${userHistory}
    `;

    try {
      const { data } = await axios.get("https://mannoffc-x.hf.space/ai/logic", {
        params: { q: msgText, logic: prompt }
      });

      const botResponse = data.result || "Désolé, je n'ai pas compris.";

      global.userChats[sender].push(`Bot: ${botResponse}`);

      await Matrix.sendMessage(from, { text: botResponse }, { quoted: m });
    } catch (error) {
      console.error('Erreur chatbot:', error);
      await Matrix.sendMessage(from, { text: '⚠️ Une erreur est survenue lors du traitement de ta demande.' }, { quoted: m });
    }

  } catch (err) {
    console.error('Erreur dans chatbotcommand:', err);
  }
};

export default chatbotcommand;

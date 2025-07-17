import config from '../config.cjs';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const add = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['add', 'invite', 'bring'];
    if (!validCommands.includes(cmd)) return;

    if (!m.isGroup) return m.reply("*Commande réservée aux groupes.*");

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;

    const isBotAdmin = participants.find(p => p.id === botNumber)?.admin;
    if (!isBotAdmin) return m.reply("*Je ne suis pas admin dans ce groupe.*");

    const sender = m.sender;
    const isOwner = sender === config.OWNER_NUMBER + '@s.whatsapp.net';

    // MODE OWNER-ONLY
    if (!isOwner) {
      return m.reply("*Seul le propriétaire du bot peut utiliser cette commande.*");
    }

    if (!text) return m.reply("*Veuillez fournir un ou plusieurs numéros à ajouter.*");

    // Découpe plusieurs numéros séparés par espace ou virgule
    const numbers = text.split(/[\s,]+/).map(n => n.replace(/[^0-9]/g, '')).filter(Boolean);

    if (numbers.length === 0) return m.reply("*Aucun numéro valide trouvé.*");

    m.reply(`*Ajout de ${numbers.length} utilisateur(s) dans ${groupMetadata.subject}...*`);

    for (let number of numbers) {
      const userId = number + '@s.whatsapp.net';

      await gss.groupParticipantsUpdate(m.from, [userId], 'add')
        .then(() => {
          m.reply(`*Utilisateur @${number} ajouté avec succès.*`);
        })
        .catch((e) => {
          console.error('Erreur lors de l\'ajout :', e);
          m.reply(`*Impossible d'ajouter @${number}. Peut-être que son paramètre de confidentialité bloque l'ajout ou qu'il a quitté trop de fois.*`);
        });

      // Intervalle aléatoire entre 3 et 5 secondes pour éviter la détection spam
      const interval = Math.floor(Math.random() * 2000) + 3000;
      await sleep(interval);
    }

  } catch (error) {
    console.error('Erreur générale :', error);
    m.reply('Une erreur est survenue lors de l’exécution de la commande.');
  }
};

export default add;

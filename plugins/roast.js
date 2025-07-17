import config from '../config.cjs';

const roastList = [
  "You're not stupid; you just have bad luck thinking.",
  "You're like a cloud. When you disappear, it’s a beautiful day.",
  "You have something on your chin... no, the third one down.",
  // ... (le reste de ta liste)
  "You're not even a glitch in the matrix — just a bug in beta."
];

const numbersThatCantBeRoasted = ['22603786xx', '22603786xx', '22603786xx'];

const roastCmd = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd !== 'roast') return;

  const senderNumber = m.sender.split('@')[0];

  // Commande réservée aux groupes
  if (!m.key.remoteJid.endsWith('@g.us')) {
    return await sock.sendMessage(
      m.from,
      {
        text: `*This is a groups command*\n\n*Usage:* ${prefix}roast (userName)`
      },
      { quoted: m }
    );
  }

  // Vérification des numéros protégés
  if (numbersThatCantBeRoasted.includes(senderNumber)) {
    return await sock.sendMessage(
      m.from,
      {
        text: `*ʀᴇsᴛʀɪᴄᴛᴇᴅ:* You can't roast this user.`
      },
      { quoted: m }
    );
  }

  // Tirage aléatoire d'un roast
  const randomRoast = roastList[Math.floor(Math.random() * roastList.length)];

  await sock.sendMessage(
    m.from,
    {
      text: `*ʀᴏᴀsᴛ:* ${randomRoast}`,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 100,
      },
    },
    { quoted: m }
  );
};

export default roastCmd;

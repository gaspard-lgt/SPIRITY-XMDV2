import config from '../config.cjs';

const prefix = config.PREFIX;

// Fonction pour faire une "box" ASCII
const makeBox = (title, lines) => {
  const width = 38;
  const top = '╭' + '─'.repeat(width) + '╮';
  const bottom = '╰' + '─'.repeat(width) + '╯';
  const titleLine = `│ ${title.padEnd(width - 2)} │`;
  const content = lines.map(line => `│ ${line.padEnd(width - 2)} │`).join('\n');
  return [top, titleLine, '│', content, bottom].join('\n');
};

const chaineCommand = async (m, sock) => {
  const body = m.body || '';
  if (!body.startsWith(prefix)) return;

  const args = body.slice(prefix.length).trim().split(' ');
  const cmd = args.shift().toLowerCase();

  const fixedChannelLink = 'https://whatsapp.com/channel/0029VbAfF6f1dAw7hJidqS0i';
  const newsletterJid = '120363422353392657@newsletter';

  if (cmd === 'chaine') {
    const lines = [
      '🔗 Lien de la chaîne :',
      fixedChannelLink,
      '',
      '👆 Copie et visite dans WhatsApp'
    ];
    const asciiBox = makeBox('spirity-chaine', lines);

    return sock.sendMessage(
      m.from,
      {
        text: asciiBox,
        footer: '© SPIRITY-XMD 2025',
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
            newsletterJid,
          },
        },
      },
      { quoted: m }
    );
  }

  if (cmd === 'id') {
    if (args.length === 0) {
      return sock.sendMessage(
        m.from,
        {
          text:
            '│ ⚠️ Veuillez fournir un lien de chaîne WhatsApp.\n│ Exemple :\n│ ' +
            prefix +
            'id https://whatsapp.com/channel/xxxxxxxxxxxxxx',
        },
        { quoted: m }
      );
    }

    const url = args[0];
    const match = url.match(/channel\/([a-zA-Z0-9]+)/);
    if (!match) {
      return sock.sendMessage(
        m.from,
        { text: '│ ❌ Lien invalide. Fournis un lien WhatsApp Channel valide.' },
        { quoted: m }
      );
    }

    const extractedId = match[1];
    const newsletterJidFromId = `${extractedId}@newsletter`;

    const lines = [
      '🔗 Lien fourni :',
      url,
      '',
      '🆔 Newsletter JID :',
      newsletterJidFromId,
    ];
    const response = makeBox('spirity-id', lines);
    return sock.sendMessage(
      m.from,
      {
        text: response,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
            newsletterJid: newsletterJidFromId,
          },
        },
      },
      { quoted: m }
    );
  }
};

export default chaineCommand;

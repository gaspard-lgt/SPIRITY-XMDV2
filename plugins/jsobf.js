import javascriptObfuscator from 'javascript-obfuscator';
import fs from 'fs';

const jsobf = async (m, Matrix) => {
  const prefix = '.';
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd !== 'jsobf') return;

  try {
    let code = '';

    // 1. Si le message est une réponse à un message texte, on récupère le texte de ce message cité
    if (m.quoted && m.quoted.message && m.quoted.message.conversation) {
      code = m.quoted.message.conversation;
    }
    // 2. Sinon, on prend tout ce qui suit la commande dans le message
    else {
      code = m.body.slice(prefix.length + cmd.length).trim();
    }

    if (!code) {
      return m.reply(
        `╭─❍ *ERREUR : Aucun code fourni* ❍─╮
│ Merci de fournir du code JavaScript
│ en texte, soit directement après la
│ commande, soit en répondant à un
│ message contenant le code.
╰─────────────────────────────╯`
      );
    }

    // Obfuscation
    const obfuscatedCode = javascriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      debugProtection: true,
      disableConsoleOutput: true,
    }).getObfuscatedCode();

    const fileName = 'spirity_encrypt.js';
    fs.writeFileSync(fileName, obfuscatedCode);

    const asciiCaption = `
╭─ 𝗝𝗔𝗩𝗔𝗦𝗖𝗥𝗜𝗣𝗧 𝗢𝗕𝗙𝗨𝗦𝗖𝗔𝗧𝗜𝗢𝗡 ─────────────
│ ⤷ Nom fichier : ${fileName}
│ ⤷ Taille      : ${Buffer.byteLength(obfuscatedCode, 'utf8')} bytes
│ ⤷ Note        : Code obfusqué avec SPIRITY-XMD
│ ⤷ 🤖 Bot      : SPIRITY-XMD
│ ⤷ 🧠 By       : DARK-DEV
╰─────────────────────────────────────
`.trim();

    // Envoi du fichier avec message ASCII en caption
    await Matrix.sendMessage(
      m.from,
      {
        document: { url: fileName },
        mimetype: 'application/javascript',
        fileName,
        caption: asciiCaption,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
            newsletterJid: "120363422353392657@newsletter",
          },
        },
      },
      { quoted: m }
    );

    fs.unlinkSync(fileName);
  } catch (error) {
    console.error('Erreur lors de l\'obfuscation :', error);
    await Matrix.sendMessage(
      m.from,
      { text: '❌ *Une erreur est survenue lors de l\'obfuscation.*' },
      { quoted: m }
    );
  }
};

export default jsobf;

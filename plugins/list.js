import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

const alive = async (m, Matrix) => {
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (24 * 3600));
  const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  
  const prefix = /^[\\/!#.]/gi.test(m.body) ? m.body.match(/^[\\/!#.]/gi)[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).toLowerCase() : '';
    if (['command', 'comman', 'commands'].includes(cmd)) {

  const uptimeMessage = `╔═══▣◎▣═══╗
║  🩸 𝚂𝙿𝙸𝚁𝙸𝚃𝚈-𝚇𝙼𝙳 𝙱𝙾𝚃
║  ⚙️ Version: 2.0.0
║  🕯️ Dev: DARK-DEV🍷
╚═══▣◎▣═══╝

⚔️ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗠𝗘𝗡𝗨 ⚔️
╭─ SYSTEM ───────────────
│ ⤷ ${prefix}Ping
│ ⤷ ${prefix}Alive
│ ⤷ ${prefix}Owner
│ ⤷ ${prefix}Menu
╰────────────────────────

╭─ OWNER ────────────────
│ ⤷ ${prefix}addowner
│ ⤷ ${prefix}Join
│ ⤷ ${prefix}Leave
│ ⤷ ${prefix}Block
│ ⤷ ${prefix}Unblock
│ ⤷ ${prefix}Setppbot
│ ⤷ ${prefix}Anticall
│ ⤷ ${prefix}Setstatus
│ ⤷ ${prefix}Setnamebot
│ ⤷ ${prefix}Autotyping
│ ⤷ ${prefix}AlwaysOnline
│ ⤷ ${prefix}Autoread
│ ⤷ ${prefix}Autosview
╰────────────────────────

╭─ GPT & AI ─────────────
│ ⤷ ${prefix}Ai
│ ⤷ ${prefix}Report
│ ⤷ ${prefix}Gpt
│ ⤷ ${prefix}spirity
│ ⤷ ${prefix}dark-ai on/off
│ ⤷ ${prefix}Gemini
│ ⤷ ${prefix}darkai-grp on/off
╰────────────────────────

╭─ CONVERTER ────────────
│ ⤷ ${prefix}Attp
│ ⤷ ${prefix}Attp2
│ ⤷ ${prefix}Attp3
│ ⤷ ${prefix}Ebinary
│ ⤷ ${prefix}Dbinary
│ ⤷ ${prefix}Emojimix
│ ⤷ ${prefix}Mp3
│ ⤷ ${prefix}jsobf
╰────────────────────────

╭─ GROUP ────────────────
│ ⤷ ${prefix}LinkGroup
│ ⤷ ${prefix}Setppgc
│ ⤷ ${prefix}Setname
│ ⤷ ${prefix}Setdesc
│ ⤷ ${prefix}Group
│ ⤷ ${prefix}Gcsetting
│ ⤷ ${prefix}Welcome
│ ⤷ ${prefix}Add
│ ⤷ ${prefix}Kick
│ ⤷ ${prefix}Hidetag
│ ⤷ ${prefix}Tagall
│ ⤷ ${prefix}Antilink
│ ⤷ ${prefix}Antitoxic
│ ⤷ ${prefix}Promote
│ ⤷ ${prefix}Demote
│ ⤷ ${prefix}Getbio
│ ⤷ ${prefix}Tagadmin
│ ⤷ ${prefix}open/close(time)
╰────────────────────────

╭─ DOWNLOAD ─────────────
│ ⤷ ${prefix}Apk
│ ⤷ ${prefix}Facebook
│ ⤷ ${prefix}Mediafire
│ ⤷ ${prefix}Pinterestdl
│ ⤷ ${prefix}Gitclone
│ ⤷ ${prefix}Gdrive
│ ⤷ ${prefix}Insta
│ ⤷ ${prefix}Ytmp3
│ ⤷ ${prefix}Ytmp4
│ ⤷ ${prefix}Play
│ ⤷ ${prefix}Song
│ ⤷ ${prefix}Video
│ ⤷ ${prefix}Ytmp3doc
│ ⤷ ${prefix}Ytmp4doc
│ ⤷ ${prefix}Tiktok
╰────────────────────────

╭─ SEARCH ───────────────
│ ⤷ ${prefix}Play
│ ⤷ ${prefix}Yts
│ ⤷ ${prefix}Movie
│ ⤷ ${prefix}Chatbot
│ ⤷ ${prefix}Gimage
│ ⤷ ${prefix}Lyrics
╰────────────────────────

💀 *MORE COMMANDS COMING SOON...*
🔥 *EXORCISTE DARK-DEV OWNS THIS REALM*
`;

  const buttons = [
      {
        "name": "quick_reply",
        "buttonParamsJson": JSON.stringify({
          display_text: "📁 REPO",
          id: `${prefix}repo`
        })
      }
    ];

  const msg = generateWAMessageFromContent(m.from, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: uptimeMessage
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: "© DARK-DEV🍷"
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: "",
            gifPlayback: true,
            subtitle: "",
            hasMediaAttachment: false 
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons
          }),
          contextInfo: {
                  mentionedJid: [m.sender], 
                  forwardingScore: 999,
                  isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363422353392657@newsletter',
                  newsletterName: "DARK-DEV",
                  serverMessageId: 143
                }
              }
        }),
      },
    },
  }, {});

  await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
    messageId: msg.key.id
  });
    }
};

export default alive;

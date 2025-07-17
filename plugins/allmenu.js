import moment from 'moment-timezone';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../config.cjs';

const allMenu = async (m, sock) => {
  const prefix = config.PREFIX;
  const mode = config.MODE;
  const pushName = m.pushName || 'User';

  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  // Calculate uptime
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (24 * 3600));
  const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  // Realtime function
  const realTime = moment().tz("Asia/Karachi").format("HH:mm:ss");

  // Pushwish function
  let pushwish = "";
  if (realTime < "05:00:00") {
    pushwish = `🌑 Bonne nuit`;
  } else if (realTime < "11:00:00") {
    pushwish = `🌅 Bonjour`;
  } else if (realTime < "15:00:00") {
    pushwish = `🌤️ Bon après-midi`;
  } else if (realTime < "19:00:00") {
    pushwish = `🌆 Bonsoir`;
  } else {
    pushwish = `🌙 Bonne nuit`;
  }

  const sendCommandMessage = async (messageContent) => {
    await sock.sendMessage(
      m.from,
      {
        text: messageContent,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363422353392657@newsletter',
            newsletterName: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
            serverMessageId: -1,
          },
          externalAdReply: {
            title: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
            body: pushName,
            thumbnailUrl: 'https://files.catbox.moe/fta4xd.jpg',
            sourceUrl: 'https://github.com/DARKMAN226/SPIRITY-XMD-V2.git',
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
  };

  // Style menu header
  const menuHeader = 
`╭━〔 𝕊ℙ𝕀ℝ𝕀𝕋𝕐-𝕏𝕄𝔻 v2 〕━⬣
┃ 👑 Exorciste : DARK-DEV │
┃ ⚡ Version : 2.0.0 │
│ 👤 Utilisateur : ${pushName} — ${pushwish}
│ 🌐 Mode : ${mode}
│ ⏰ Heure : ${realTime}
│ ⏳ Uptime : ${days}j ${hours}h ${minutes}m ${seconds}s
╰━━━━━━━━━━━━━━╯\n`;

  // Menus
  const menus = {
    "list": 
`${menuHeader}╭─❒ 𝕄𝔼𝕹𝕌 𝔾𝔼ℕ𝔼ℝ𝔸𝕃
│ ✝️ ${prefix}religion
│ 📥 ${prefix}downloadmenu
│ 🤖 ${prefix}aimenu
│ 🔍 ${prefix}searchmenu
│ ⚙️ ${prefix}system 
│ 🫂 ${prefix}groupmenu
│ 🔄 ${prefix}convert
│ 🍷 ${prefix}othermenu
╰───────────────╯
╭─❒ Powered by DARK-DEV
╰───────────────╯`,

    "religion": 
`${menuHeader}╭─❒ R𝔼𝕃𝕀𝔾𝕀𝕆ℕ 𝕄𝔼ℕ𝕌
│ ✝️ ${prefix}bible
╰───────────────╯
╭─❒ Powered by DARK-DEV
╰───────────────╯`,

    "downloadmenu":
`${menuHeader}╭─❒ 𝔻𝕆𝕎ℕ𝕃𝕆𝔸𝔻 𝕄𝔼ℕ𝕌
│ ⏬ ${prefix}fb
│ ⏬ ${prefix}insta
│ ⏬ ${prefix}play
│ ⏬ ${prefix}song
│ ⏬ ${prefix}video
│ ⏬ ${prefix}tiktok
│ ⏬ ${prefix}ytmp3
│ ⏬ ${prefix}ytmp4
│ ⏬ ${prefix}mediafire
│ ⏬ ${prefix}gdrive
│ ⏬ ${prefix}app
╰───────────────╯
╭─❒ Powered by DARK-DEV
╰───────────────╯`,

    "aimenu":
`${menuHeader}╭─❒ 𝔸𝕀 𝕄𝔼ℕ𝕌
│ 🤓 ${prefix}ai
│ 🤓 ${prefix}dark-bug
│ 🤓 ${prefix}report
│ 🤓 ${prefix}dark-ai on/off
│ 🤓 ${prefix}gpt
│ 🤓 ${prefix}spirity
╰───────────────╯
╭─❒ Powered by DARK-DEV
╰───────────────╯`,

    "convert":
`${menuHeader}╭─❒ CONV𝔼ℝ𝕊𝕀𝕆ℕ 𝕄𝔼ℕ𝕌
│ • ${prefix}attp
│ • ${prefix}gimage
│ • ${prefix}play
│ • ${prefix}video
│ • ${prefix}jsobf
│ • ${prefix}ID
╰───────────────╯
╭─❒ Powered by DARK-DEV
╰───────────────╯`,

    "groupmenu":
`${menuHeader}╭─❒ 𝔾ℝ𝕆𝕌ℙ 𝕄𝔼ℕ𝕌
│ 🫂 ${prefix}link
│ 🫂 ${prefix}setppgc
│ 🫂 ${prefix}setgrnam
│ 🫂 ${prefix}setdesc
│ 🫂 ${prefix}group
│ 🫂 ${prefix}gcsetting
│ 🫂 ${prefix}welcome
│ 🫂 ${prefix}add
│ 🫂 ${prefix}kick
│ 🫂 ${prefix}hidetag
│ 🫂 ${prefix}tagall
│ 🫂 ${prefix}antilink
│ 🫂 ${prefix}antitoxic
│ 🫂 ${prefix}promote
│ 🫂 ${prefix}demote
│ 🫂 ${prefix}grdesc
│ 🫂 ${prefix}tagadmin
│ 🫂 ${prefix}open/close(time)
│ 🫂 ${prefix}invite
╰───────────────╯
╭─❒ Powered by DARK-DEV
╰───────────────╯`,

    "searchmenu":
`${menuHeader}╭─❒ sᴇᴀʀᴄʜ ᴍᴇɴᴜ
│ 📡 ${prefix}yts
│ 📡 ${prefix}wallpaper
│ 📡 ${prefix}spotify
│ 📡 ${prefix}google
│ 📡 ${prefix}mediafire
│ 📡 ${prefix}facebook
│ 📡 ${prefix}instagram
│ 📡 ${prefix}tiktok
│ 📡 ${prefix}lyrics
│ 📡 ${prefix}imdb
│ 📡 ${prefix}shazam
╰───────────────╯
╭─❒ Powered by DARK-DEV
╰───────────────╯`,

    "ownermenu":
`${menuHeader}╭─❒ 𝕆𝕎ℕ𝔼ℝ 𝕄𝔼ℕ𝕌
│ • ${prefix}addowner
│ • ${prefix}join
│ • ${prefix}leave
│ • ${prefix}autobio
│ • ${prefix}block
│ • ${prefix}autolikestatus
│ • ${prefix}unblock
│ • ${prefix}antidelete on
│ • ${prefix}anticall
│ • ${prefix}settings
│ • ${prefix}setname
│ • ${prefix}mode
│ • ${prefix}setpp
│ • ${prefix}vv
│ • ${prefix}vv2 
╰───────────────╯
╭─❒ 𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃
╰───────────────╯`,

    "othermenu":
`${menuHeader}╭─❒ 𝕆𝕋ℍ𝔼ℝ 𝕄𝔼ℕ𝕌
│ 🥷 ${prefix}ping
│ 🥷 ${prefix}repo
│ 🥷 ${prefix}alive
│ 🥷 ${prefix}url
│ 🥷 ${prefix}uptime
╰───────────────╯
╭─❒ Powered by DARK-DEV
╰───────────────╯`,

    "system":
`${menuHeader}╭─❒ SYS𝕋𝔼𝕄 𝕄𝔼ℕ𝕌
│ 🎲 ${prefix}tts
│ 🎲 ${prefix}fetch
│ 🎲 ${prefix}menu
│ 🎲 ${prefix}alive
│ 🎲 ${prefix}owner
│ 🎲 ${prefix}list
│ 🎲 ${prefix}chaine
╰───────────────╯
╭─❒ Powered by DARK-DEV
╰───────────────╯`
  };

  // Execute matching menu
  if (menus[cmd]) {
    await m.React('⏳');
    await m.React('✅');
    await sendCommandMessage(menus[cmd]);
  }
};

export default allMenu;

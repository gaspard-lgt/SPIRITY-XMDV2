import config from '../config.cjs';

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "menu" || cmd === "help" || cmd === "commands" || cmd === "spirit") {
    await sock.sendMessage(m.from, { react: { text: '✨', key: m.key } }).catch(() => {});

    const profilePictureUrl = 'https://files.catbox.moe/fta4xd.jpg';
    const uptimeFormatted = formatUptime(process.uptime());
    const totalCommands = 78; // 🔧 Ton nombre réel de commandes

    const menuText = `
╭━━〔 𝕊ℙ𝕀ℝ𝕀𝕋𝕐-𝕏𝕄𝔻 v2 〕━━╮
┃ 👑 Exorciste : DARK-DEV │
┃ ⚡ Version : 2.0.0 │
┃ 📅 Date : ${new Date().toLocaleDateString('fr-FR')} │
┃ ⏳ Uptime : ${uptimeFormatted} │
┃ 🛠️ Mode : ${config.MODE} │
┃ 📚 Commandes : ${totalCommands} │
╰━━━━━━━━━━━━━━━━━━━━╯

│ ╭──〔 spirity-system 〕
│ • ${prefix}menu
│ • ${prefix}alive
│ • ${prefix}owner
│ • ${prefix}list
│ • ${prefix}chaine
│ • ${prefix}ping
│ • ${prefix}uptime

│ ╭──〔 spirity-owner 〕
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

│ ╭──〔 spirity-group 〕
│ • ${prefix}linkgroup
│ • ${prefix}setppgc
│ • ${prefix}setgrnam
│ • ${prefix}setdesc
│ • ${prefix}group
│ • ${prefix}gcsetting
│ • ${prefix}welcome
│ • ${prefix}add
│ • ${prefix}kick
│ • ${prefix}hidetag
│ • ${prefix}tagall
│ • ${prefix}antilink
│ • ${prefix}antitoxic
│ • ${prefix}promote
│ • ${prefix}demote
│ • ${prefix}grdesc
│ • ${prefix}tagadmin
│ • ${prefix}open/close(time)

│ ╭──〔 spirity-gpt 〕
│ • ${prefix}ai
│ • ${prefix}dark-bug
│ • ${prefix}report
│ • ${prefix}dark-ai on/off
│ • ${prefix}gpt
│ • ${prefix}spirity

│ ╭──〔 spirity-convert 〕
│ • ${prefix}attp
│ • ${prefix}gimage
│ • ${prefix}play
│ • ${prefix}video
│ • ${prefix}jsobf
│ • ${prefix}ID

│ ╭──〔 spirity-search 〕
│ • ${prefix}google
│ • ${prefix}mediafire
│ • ${prefix}facebook
│ • ${prefix}instagram
│ • ${prefix}tiktok
│ • ${prefix}lyrics
│ • ${prefix}imdb
│ • ${prefix}gitdl <url>

│ ╭──〔 spirity-fun 〕
│ • ${prefix}getpp
│ • ${prefix}url
│ • ${prefix}roast

╰──〔 👻 By DARK-DEV 〕
`;

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText.trim(),
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
          newsletterJid: "120363422353392657@newsletter",
        },
      }
    }, { quoted: m });
  }
};

export default menu;

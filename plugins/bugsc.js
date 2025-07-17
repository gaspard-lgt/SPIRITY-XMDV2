import config from '../config.cjs';

const prefix = config.PREFIX;

const bugScriptCommand = async (m, sock) => {
  const body = m.body || '';
  if (!body.startsWith(prefix)) return;

  const cmd = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();

  if (cmd === 'bug-script') {
    const imageUrl = 'https://files.catbox.moe/e0qwl3.png';

    const bugText = `
╔═══════════════════════════════
║  ⚡ 𝔻𝔸ℝ𝕂𝔹𝕆𝕐-𝔹𝕌𝔾 ⚡            
║   ————————————————              
║  💀 Bot ultime by 𝕯𝕬𝕽𝕶-𝕯𝕰𝖁 💀   
║                              
║  🕷 Un bug bot sombre et puissant 🕷 
║  ⚠ Glitché pour dominer la nuit ⚠ 
║  🔥 Rapidité, stealth & contrôle 🔥 
║                              
║  📥 Téléchargement ici :         
║  https://www.mediafire.com/file/bncrxi7xe4g8f19/DARKBOY-BUG.zip/file 
║                              
║  ⚔ Rejoins la légende.           
╚═══════════════════════════════
✨ 𝕯𝕬𝕽𝕶-𝕯𝕰𝖁 — Le génie de l’ombre. ✨
`.trim();

    await sock.sendMessage(
      m.from,
      {
        image: { url: imageUrl },
        caption: bugText,
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
  }
};

export default bugScriptCommand;

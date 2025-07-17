import config from '../config.cjs';
import fetch from 'node-fetch'; // Assure-toi que node-fetch est installé

const repo = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "repo") {
    if (m.React) await m.React('🖇️'); // Réagir au message (si supporté)

    const repoUrl = 'https://github.com/DARKMAN226/SPIRITY-XMD-V2';
    const profilePictureUrl = 'https://i.imgur.com/AZb9Jsy.jpeg'; // Exemple : photo de profil ou image personnalisée

    try {
      const apiUrl = `https://api.github.com/repos/DARKMAN226/SPIRITY-XMD-V2`;
      const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Node.js' } // Evite certains blocages GitHub
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const stars = data.stargazers_count ?? '❔';
      const forks = data.forks_count ?? '❔';

      const menuText = `
╔══════════════════════════════════════════════╗
║              𝕾𝖕𝖎𝖗𝖎𝖙𝖞-𝖃𝕸𝕯 𝕽𝖊𝖕𝖔            
╠══════════════════════════════════════════════╣
║                                              
║ 📂 Repository: SPIRITY-XMD-V2                 
║ 👑 Auteur: DARKMAN🍷                           
║ ⭐ Étoiles: ${stars.toString().padEnd(29)}║
║ 🍴 Forks: ${forks.toString().padEnd(31)}║
║                                              
║ 🔗 URL:                                      
║ ${repoUrl} ║
║                                              
║ 𝓟𝓻𝓸𝓽𝓮𝓬𝓽𝓲𝓸𝓷 • 𝓤𝓲 𝓕𝓾𝓽𝓾𝓻𝓲𝓼𝓽𝓮 • 𝓐𝓘              
║                                              
║      ➤ Contribuez et rejoignez-nous!          
╚══════════════════════════════════════════════╝
> Powered by DARK-DEV™
`.trim();

      await sock.sendMessage(m.from, {
        image: { url: profilePictureUrl },
        caption: menuText,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "𝐒𝐏𝐈𝐑𝐈𝐓𝐘-𝐗𝐌𝐃",
            newsletterJid: "120363422353392657@newsletter",
          },
        }
      }, { quoted: m });

    } catch (error) {
      console.error("Error fetching repo info:", error);
      await sock.sendMessage(m.from, { text: '🚨 Error encountered while fetching repo data. 😢', quoted: m });
    } finally {
      if (m.React) await m.React('✅');
    }
  }
};

export default repo;

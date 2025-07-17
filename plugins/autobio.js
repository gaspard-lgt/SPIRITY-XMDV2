import config from '../config.cjs';
import moment from 'moment-timezone';

// 🕷️ Tableau de citations sombres et psychologiques 🕸️
const lifeQuotes = [
  "🌑 Nous portons tous des masques, et vient un moment où ils tombent…",
  "🕯️ La douleur est la sagesse que le monde refuse d'apprendre.",
  "🌌 La nuit n'est jamais complète… il reste toujours la lueur de nos pensées les plus noires.",
  "🩸 Le vrai monstre n’est pas celui que l’on voit, mais celui qui vit en nous.",
  "🕳️ Plus tu regardes dans l’abîme, plus l’abîme regarde en toi.",
  "🌫️ L’obscurité révèle ce que la lumière tente de cacher.",
  "🖤 La solitude est une mer profonde où l’âme se noie pour renaître.",
  "⚫ Ce qui ne te tue pas te transforme en quelque chose de plus froid.",
  "🔮 L’esprit humain est un labyrinthe dont peu ressortent indemnes.",
  "🕷️ La peur n’est que l’ombre de ton véritable pouvoir."
];

let bioUpdateInterval = null; // ⏳ Stockage de l'ID de l'intervalle ⏳

const autobio = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "autobio") {
    if (!sock.user?.id) {
      await sock.sendMessage(m.from, { text: '⚠️ Infos du bot indisponibles. Réessaie plus tard.' }, { quoted: m });
      return;
    }

    const updateBio = async () => {
      try {
        const bfTime = moment().tz('Africa/Ouagadougou').format('HH:mm:ss');
        const randomIndex = Math.floor(Math.random() * lifeQuotes.length);
        const randomQuote = lifeQuotes[randomIndex];
        const newBio = `🕷️ SPIRITY-XMD veille dans l'ombre 🕰️ ${bfTime} | "${randomQuote}"`;
        await sock.updateProfileStatus(newBio);
        console.log('✅ Bio mis à jour :', newBio);
      } catch (error) {
        console.error('❌ Échec de la mise à jour du bio :', error);
      }
    };

    if (bioUpdateInterval) {
      clearInterval(bioUpdateInterval); // 🛑 Arrêter les mises à jour automatiques 🛑
      bioUpdateInterval = null;
      await sock.sendMessage(m.from, { text: '🕸️ Les mises à jour automatiques du bio ont été arrêtées.' }, { quoted: m });
    } else {
      // 🚀 Première mise à jour 🚀
      await updateBio();

      // ⏳ Mettre à jour toutes les minutes ⏳
      bioUpdateInterval = setInterval(updateBio, 60000); // ⏱️ 60000 ms = 1 minute ⏱️

      await sock.sendMessage(m.from, { text: '🌑 Les mises à jour automatiques du bio ont commencé.' }, { quoted: m });
    }
  }
};

export default autobio;

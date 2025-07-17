import axios from 'axios';
import config from '../config.cjs';

const ipStalk = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();
  const args = text.split(' ');

  const validCommands = ['ipstalk', 'lookup', 'iplocate'];

  if (validCommands.includes(cmd)) {
    if (!args[0]) return m.reply('❗ Veuillez mentionner une adresse IP à rechercher.');

    const ip = args[0];

    try {
      const apiResponse = await axios.get(`https://bk9.fun/stalk/ip?q=${ip}`);
      const data = apiResponse.data;

      if (data.status) {
        const ipData = data.BK9;

        let responseMessage = 
`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🌍  𝕊ℙ𝕀ℝ𝕀𝕋𝕐-𝕏𝕄𝔻  ɪᴘ sᴛᴀʟᴋᴇʀ 🌍
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📌 IP : ${ipData.ip}
┃  🌐 Continent : ${ipData.continent}
┃  🇫🇷 Pays : ${ipData.country} (${ipData.countryCode})
┃  🗺️ Région : ${ipData.regionName}
┃  🏙️ Ville : ${ipData.city}
┃  📮 Code postal : ${ipData.zip}
┃  🧭 Latitude : ${ipData.lat}
┃  🧭 Longitude : ${ipData.lon}
┃  ⏰ Fuseau horaire : ${ipData.timezone}
┃  💰 Devise : ${ipData.currency}
┃  📡 FAI : ${ipData.isp}
┃  🏢 Organisation : ${ipData.org}
┃  🆔 AS : ${ipData.as}
┃  🔄 DNS inverse : ${ipData.reverse}
┃  📱 Mobile : ${ipData.mobile ? 'Oui' : 'Non'}
┃  🛡️ Proxy : ${ipData.proxy ? 'Oui' : 'Non'}
┃  🏠 Hébergement : ${ipData.hosting ? 'Oui' : 'Non'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👻 *SPIRITY-XMD*
💎 *𝐏ᴏᴡᴇʀᴇᴅ 𝐁ʏ DARK-DEV 🍷*`;

        await gss.sendMessage(m.from, { text: responseMessage }, { quoted: m });
      } else {
        m.reply('❌ Adresse IP introuvable. Veuillez vérifier la saisie.');
      }
    } catch (error) {
      m.reply('⚠️ Une erreur est survenue lors de la récupération des données.');
      console.error('Erreur IP Stalk:', error);
    }
  }
};

export default ipStalk;

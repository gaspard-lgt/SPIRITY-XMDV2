import moment from 'moment-timezone';
import config from '../config.cjs';

const newsletterName = "SPIRITY-XMD";
const fallbackPP = "https://i.imgur.com/AZb9Jsy.jpeg";

function getNewsletterContext(jid) {
   return {
      mentionedJid: [jid],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
         newsletterJid: "120363422353392657@newsletter",
         newsletterName,
         serverMessageId: 101,
      },
   };
}

export default async function GroupParticipants(sock, { id, participants, action }) {
   try {
      const metadata = await sock.groupMetadata(id);

      for (const jid of participants) {
         let profilePic;

         try {
            profilePic = await sock.profilePictureUrl(jid, "image");
         } catch {
            profilePic = fallbackPP;
         }

         const userName = jid.split("@")[0];
         const membersCount = metadata.participants.length;
         const groupName = metadata.subject;
         const date = moment.tz('Africa/Kinshasa').format('DD/MM/YYYY');
         const time = moment.tz('Africa/Kinshasa').format('HH:mm:ss');

         if (action === "add" && config.WELCOME === true) {
            const welcomeMessage = {
               image: { url: profilePic },
               caption: `
┏━━━〔 🎉 BIENVENUE 🎉 〕━━━┓

Salut @${userName} !
Bienvenue dans *${groupName}*.

Nous sommes désormais
*${membersCount}* membres.

Profite bien de l’aventure
et partage ta bonne humeur !

📅 Date : ${date}
⏰ Heure : ${time}

╰━━━━━━✦ ${newsletterName} ✦━━━━━╯
               `.trim(),
               mentions: [jid],
               contextInfo: getNewsletterContext(jid),
            };

            await sock.sendMessage(id, welcomeMessage);
         }

         if (action === "remove" && config.WELCOME === true) {
            const goodbyeMessage = {
               image: { url: profilePic },
               caption: `
┏━━━〔 😢 AU REVOIR 😢 〕━━━┓

@${userName} a quitté
le groupe *${groupName}*.

Il reste *${membersCount}*
membres pour continuer.

On espère te revoir
bientôt parmi nous !

📅 Date : ${date}
⏰ Heure : ${time}

╰━━━━━━✦ ${newsletterName} ✦━━━━━╯
               `.trim(),
               mentions: [jid],
               contextInfo: getNewsletterContext(jid),
            };

            await sock.sendMessage(id, goodbyeMessage);
         }
      }
   } catch (e) {
      console.error("❌ Erreur dans GroupParticipants :", e);
   }
}

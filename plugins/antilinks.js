import fs from "fs";
import config from "../config.cjs";

const dbPath = "./data/antilink.json";
const warnsPath = "./data/warn.json";

let antilinkDB = fs.existsSync(dbPath)
  ? JSON.parse(fs.readFileSync(dbPath))
  : {};

let warnsDB = fs.existsSync(warnsPath)
  ? JSON.parse(fs.readFileSync(warnsPath))
  : {};

const saveDB = () => fs.writeFileSync(dbPath, JSON.stringify(antilinkDB, null, 2));
const saveWarns = () => fs.writeFileSync(warnsPath, JSON.stringify(warnsDB, null, 2));

const antiLink = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const body = m.body?.toLowerCase() || "";
    if (!body.startsWith(prefix)) return;

    const command = body.slice(prefix.length).trim();
    const [cmd, arg] = command.split(" ");

    if (cmd !== "antilink") return;

    if (!m.isGroup) return m.reply("*Cette commande fonctionne uniquement en groupe.*");

    const metadata = await gss.groupMetadata(m.from);
    const senderAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;
    if (!senderAdmin) return m.reply("*Seuls les admins peuvent utiliser cette commande.*");

    // Affichage usage
    if (command === "antilink") {
      return m.reply(`*╭─❍『 ANTILINK USAGE 』❍
│ ➤ ${prefix}antilink on
│ ➤ ${prefix}antilink off
│ ➤ ${prefix}antilink warn1
│ ➤ ${prefix}antilink warn2
│ ➤ ${prefix}antilink warn3
│ ➤ ${prefix}antilink delete
│
│ Activez/désactivez la protection anti liens et choisissez la sanction.
│===== par Dark-DEV
╰───────────────━⊷*`);
    }

    // Activation / désactivation
    if (arg === "on") {
      antilinkDB[m.from] = antilinkDB[m.from] || {};
      antilinkDB[m.from].enabled = true;
      if (!antilinkDB[m.from].mode) antilinkDB[m.from].mode = "delete";
      saveDB();
      return m.reply("*Antilink activé dans ce groupe.*");
    }

    if (arg === "off") {
      if (antilinkDB[m.from]) {
        antilinkDB[m.from].enabled = false;
        saveDB();
      }
      return m.reply("*Antilink désactivé dans ce groupe.*");
    }

    // Mode sanction
    const validModes = ["warn1", "warn2", "warn3", "delete"];
    if (validModes.includes(arg)) {
      antilinkDB[m.from] = antilinkDB[m.from] || {};
      antilinkDB[m.from].mode = arg;
      antilinkDB[m.from].enabled = true;
      saveDB();
      return m.reply(`*Mode antilink changé en : ${arg}*`);
    }

    // Si antilink activé pour ce groupe, vérifier les liens dans les messages
    if (antilinkDB[m.from]?.enabled && m.isGroup && m.message) {
      if (senderAdmin) return; // ignore admins

      const linkRegex = /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[a-zA-Z0-9]+)/gi;
      let text = m.body || "";

      if (linkRegex.test(text)) {
        const mode = antilinkDB[m.from].mode || "delete";

        if (mode === "delete") {
          await gss.sendMessage(m.from, { delete: m.key });

          // Newsletter notification
          await gss.sendMessage(m.from, {
            text: `🚫 Message supprimé : les liens sont interdits ici.`,
            contextInfo: {
              isForwarded: true,
              forwardingScore: 999,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422353392657@newsletter',
                newsletterName: "🚀 SPIRITY-XMD",
                serverMessageId: -1
              },
              externalAdReply: {
                title: "Antilink SPIRITY-XMD",
                body: "Lien interdit supprimé",
                thumbnailUrl: "https://telegra.ph/file/67aa89af5a0ddbe8d6ef6.jpg",
                sourceUrl: "https://whatsapp.com/channel/0029VbAfF6f1dAw7hJidqS0i",
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: m });

        } else if (mode.startsWith("warn")) {
          const maxWarn = parseInt(mode.replace("warn", ""), 10);
          warnsDB[m.from] = warnsDB[m.from] || {};
          warnsDB[m.from][m.sender] = (warnsDB[m.from][m.sender] || 0) + 1;
          saveWarns();

          const userWarns = warnsDB[m.from][m.sender];

          if (userWarns >= maxWarn) {
            await gss.groupParticipantsUpdate(m.from, [m.sender], "remove");

            await gss.sendMessage(m.from, {
              text: `⚠️ ${m.sender.split("@")[0]} a été exclu après ${userWarns} avertissements pour lien interdit.`,
              contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363422353392657@newsletter',
                  newsletterName: "🚀 SPIRITY-XMD",
                  serverMessageId: -1
                }
              }
            });

            warnsDB[m.from][m.sender] = 0;
            saveWarns();

          } else {
            await gss.sendMessage(m.from, {
              text: `⚠️ Avertissement ${userWarns}/${maxWarn} : les liens sont interdits ici.`,
              contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363422353392657@newsletter',
                  newsletterName: "🚀 SPIRITY-XMD",
                  serverMessageId: -1
                }
              }
            });
          }
        }
      }
    }

  } catch (e) {
    console.error("Erreur dans antilink:", e);
    m.reply("*❌ Une erreur est survenue dans la commande antilink.*");
  }
};

export default antiLink;

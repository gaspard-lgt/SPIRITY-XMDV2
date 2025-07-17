import config from '../config.cjs';
import fetch from 'node-fetch';

const prefix = config.PREFIX;

// Dictionnaire des livres en français → anglais
const booksFrToEn = {
  "genèse": "Genesis",
  "exode": "Exodus",
  "lévitique": "Leviticus",
  "nombres": "Numbers",
  "deutéronome": "Deuteronomy",
  "josué": "Joshua",
  "juges": "Judges",
  "ruth": "Ruth",
  "1 samuel": "1 Samuel",
  "2 samuel": "2 Samuel",
  "1 rois": "1 Kings",
  "2 rois": "2 Kings",
  "1 chroniques": "1 Chronicles",
  "2 chroniques": "2 Chronicles",
  "esdras": "Ezra",
  "néhémie": "Nehemiah",
  "esther": "Esther",
  "job": "Job",
  "psaumes": "Psalms",
  "proverbes": "Proverbs",
  "ecclésiaste": "Ecclesiastes",
  "cantique des cantiques": "Song of Solomon",
  "esaïe": "Isaiah",
  "jérémie": "Jeremiah",
  "lamentations": "Lamentations",
  "ézéchiel": "Ezekiel",
  "daniel": "Daniel",
  "osée": "Hosea",
  "joël": "Joel",
  "amos": "Amos",
  "abdias": "Obadiah",
  "jonas": "Jonah",
  "michée": "Micah",
  "nahum": "Nahum",
  "habacuc": "Habakkuk",
  "sophonie": "Zephaniah",
  "aggée": "Haggai",
  "zacharie": "Zechariah",
  "malachie": "Malachi",
  "matthieu": "Matthew",
  "marc": "Mark",
  "luc": "Luke",
  "jean": "John",
  "actes": "Acts",
  "romains": "Romans",
  "1 corinthiens": "1 Corinthians",
  "2 corinthiens": "2 Corinthians",
  "galates": "Galatians",
  "éphésiens": "Ephesians",
  "philippiens": "Philippians",
  "colossiens": "Colossians",
  "1 thessaloniciens": "1 Thessalonians",
  "2 thessaloniciens": "2 Thessalonians",
  "1 timothée": "1 Timothy",
  "2 timothée": "2 Timothy",
  "tite": "Titus",
  "philémon": "Philemon",
  "hébreux": "Hebrews",
  "jacques": "James",
  "1 pierre": "1 Peter",
  "2 pierre": "2 Peter",
  "1 jean": "1 John",
  "2 jean": "2 John",
  "3 jean": "3 John",
  "jude": "Jude",
  "apocalypse": "Revelation"
};

const bible = async (m, sock) => {
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "bible") {

    // Commande: .bible list
    if (text.toLowerCase() === "list") {
      const booksFr = Object.keys(booksFrToEn);
      const booksPerLine = 3;

      let formatted = "╭───〔 📖 *LISTE DES LIVRES* 〕───\n";
      for (let i = 0; i < booksFr.length; i += booksPerLine) {
        const line = booksFr.slice(i, i + booksPerLine).join(" | ");
        formatted += `│ ${line}\n`;
      }
      formatted += "╰────────────────────────────";

      return sock.sendMessage(
        m.from,
        {
          text: formatted,
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

    // Commande: .bible <verset>
    if (!text) {
      return sock.sendMessage(m.from, {
        text: `❌ Veuillez spécifier un verset. Exemple : ${prefix}bible Jean 3:16`
      }, { quoted: m });
    }

    const start = new Date().getTime();
    await m.React('⏳');

    try {
      // Conversion du livre en anglais si entré en français
      const refParts = text.split(' ');
      const bookInput = refParts[0].toLowerCase();
      const remaining = refParts.slice(1).join(' ');

      const bookEn = booksFrToEn[bookInput] || bookInput;
      const verseRef = `${bookEn} ${remaining}`;

      const apiUrl = `https://bible-api.com/${encodeURIComponent(verseRef)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      const end = new Date().getTime();
      const responseTime = end - start;

      if (data.error) {
        return sock.sendMessage(m.from, {
          text: `❌ Erreur : ${data.error}`
        }, { quoted: m });
      }

      const verseText = data.text.trim();
      const reference = data.reference;
      const formattedText = `╭───〔 ✝️ *${reference}* 〕───\n${verseText}\n╰───────────────\n_⌛ Fetched in ${responseTime} ms_`;

      await sock.sendMessage(
        m.from,
        {
          text: formattedText,
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

    } catch (error) {
      console.error("Erreur Bible:", error);
      await sock.sendMessage(m.from, { text: '❌ Une erreur est survenue.' }, { quoted: m });
    } finally {
      await m.React('✅');
    }
  }
};

export default bible;

import fs from 'fs';
import path from 'path';
import config from '../config.cjs';

// 📌 Chemin absolu du fichier owners
const ownersFile = path.resolve('./addwoner.json');

// 📖 Lire les owners depuis le fichier
function getOwners() {
  try {
    if (!fs.existsSync(ownersFile)) return [];
    const data = fs.readFileSync(ownersFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('❌ Erreur lecture addwoner.json :', err);
    return [];
  }
}

// 💾 Sauvegarder les owners dans le fichier
function saveOwners(owners) {
  try {
    fs.writeFileSync(ownersFile, JSON.stringify(owners, null, 2));
    console.log('✅ Owners mis à jour.');
  } catch (err) {
    console.error('❌ Erreur écriture addwoner.json :', err);
  }
}

// ✅ COMMANDE EXPORTÉE
export default async function loadAddow(m, sock) {
  try {
    const prefixPattern = /^[\\/!#.]/;
    const isCommand = prefixPattern.test(m.body || '');
    if (!isCommand) return;

    const args = m.body.trim().split(/\s+/);
    const cmd = args[0].slice(1).toLowerCase(); // sans prefix
    const input = args[1];

    if (cmd !== 'addow') return;

    const sender = m.sender;
    const senderNumber = sender.split('@')[0];
    const mainOwner = config.OWNER_NUMBER;
    const owners = getOwners();

    // 🔐 Vérifie autorisation
    const isAllowed = senderNumber === mainOwner || owners.includes(sender);
    if (!isAllowed) {
      console.log(`⛔ Accès refusé pour ${sender}`);
      return await sock.sendMessage(m.from, {
        text: '🚫 Seuls les *propriétaires actuels* peuvent utiliser cette commande.'
      }, { quoted: m });
    }

    // ❗ Vérifie l’entrée
    if (!input || !/^\d{8,15}$/.test(input)) {
      console.warn(`⚠️ Entrée invalide : ${input}`);
      return await sock.sendMessage(m.from, {
        text: '❗ Utilisation correcte : `.addow 226XXXXXXXX`\n> Numéro invalide.'
      }, { quoted: m });
    }

    const jid = input + '@s.whatsapp.net';

    if (owners.includes(jid)) {
      console.log(`📌 Déjà owner : ${jid}`);
      return await sock.sendMessage(m.from, {
        text: `ℹ️ Le numéro @${input} est déjà un propriétaire.`,
        mentions: [jid]
      }, { quoted: m });
    }

    // ✅ Ajoute l’owner
    owners.push(jid);
    saveOwners(owners);

    await sock.sendMessage(m.from, {
      text: `✅ *Propriétaire ajouté avec succès !*\n👤 Numéro : @${input}`,
      mentions: [jid]
    }, { quoted: m });

    console.log(`✅ Nouveau owner ajouté : ${jid}`);
  } catch (err) {
    console.error('❌ Erreur dans la commande .addow :', err);
    await sock.sendMessage(m.from, {
      text: '❌ Une erreur est survenue lors de l’ajout du propriétaire.'
    }, { quoted: m });
  }
}

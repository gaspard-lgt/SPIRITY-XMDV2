// Fichier : lib/owners.js

import fs from 'fs';
import path from 'path';

const ownersFile = path.resolve('./addwoner.json');

// 🔁 Lire les propriétaires
export function getDynamicOwners() {
  try {
    if (!fs.existsSync(ownersFile)) return [];
    const data = fs.readFileSync(ownersFile, 'utf-8');
    const json = JSON.parse(data);
    if (!Array.isArray(json)) return [];
    return json;
  } catch (err) {
    console.error('❌ Erreur lecture addwoner.json :', err);
    return [];
  }
}

// 💾 Sauvegarder les propriétaires
export function saveDynamicOwners(owners) {
  try {
    fs.writeFileSync(ownersFile, JSON.stringify(owners, null, 2));
    console.log('✅ Fichier addwoner.json mis à jour.');
  } catch (err) {
    console.error('❌ Erreur sauvegarde addwoner.json :', err);
  }
}

// ➕ Ajouter un propriétaire
export function addOwner(jid) {
  const owners = getDynamicOwners();
  if (!owners.includes(jid)) {
    owners.push(jid);
    saveDynamicOwners(owners);
  }
}

// ➖ Supprimer un propriétaire
export function removeOwner(jid) {
  let owners = getDynamicOwners();
  owners = owners.filter(o => o !== jid);
  saveDynamicOwners(owners);
}

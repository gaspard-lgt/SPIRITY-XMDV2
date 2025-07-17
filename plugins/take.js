import fs from 'fs/promises';
import path from 'path';

const stickerCommand = async (m, gss) => {
  const text = m?.body || '';
  const prefixMatch = text.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';

  const [cmd, ...args] = text.startsWith(prefix) ? text.slice(prefix.length).split(' ') : [];
  const command = cmd?.toLowerCase() || '';

  const defaultPackname = "DARK-DEV🍷";
  const defaultAuthor = "SPIRITY-XMD_V2";

  if (['sticker', 's', 'take'].includes(command)) {
    const quoted = m.quoted;
    if (!quoted || !quoted.mtype) {
      return m.reply(`🛑 Réponds à un message contenant un média pour utiliser la commande ${prefix + command}.`);
    }

    try {
      if (['sticker', 's'].includes(command)) {
        if (!['imageMessage', 'videoMessage'].includes(quoted.mtype)) {
          return m.reply(`❌ Envoie ou répond à une *image ou vidéo* pour la convertir en sticker avec ${prefix + command}.`);
        }

        const media = await quoted.download();
        if (!media) throw new Error('Échec du téléchargement du média.');

        const extension = quoted.mtype === 'imageMessage' ? 'png' : 'mp4';
        const tmpDir = './tmp';
        await fs.mkdir(tmpDir, { recursive: true });

        const filePath = path.join(tmpDir, `sticker_${Date.now()}.${extension}`);
        await fs.writeFile(filePath, media);

        if (quoted.mtype === 'imageMessage') {
          const stickerBuffer = await fs.readFile(filePath);
          await gss.sendImageAsSticker(m.from, stickerBuffer, m, {
            packname: defaultPackname,
            author: defaultAuthor
          });
        } else {
          await gss.sendVideoAsSticker(m.from, filePath, m, {
            packname: defaultPackname,
            author: defaultAuthor
          });
        }

        await fs.unlink(filePath);
      }

      if (command === 'take') {
        if (quoted.mtype !== 'stickerMessage') {
          return m.reply(`❗ Répond à un *sticker* pour changer son packname.\nEx: ${prefix}take MonPack`);
        }

        const newPackname = args.join(' ') || defaultPackname;
        const stickerMedia = await quoted.download();
        if (!stickerMedia) throw new Error('Échec du téléchargement du sticker.');

        await gss.sendImageAsSticker(m.from, stickerMedia, m, {
          packname: newPackname,
          author: defaultAuthor
        });
      }
    } catch (error) {
      console.error("❌ Erreur dans sticker/take :", error);
      await m.reply('⚠️ Une erreur est survenue lors du traitement du sticker.');
    }
  }
};

export default stickerCommand;

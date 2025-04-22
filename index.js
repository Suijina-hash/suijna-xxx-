const { default: makeWASocket, DisconnectReason, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot Suijna XXX connecté avec succès !');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (messageText === '.menu') {
      await sock.sendMessage(from, { text: '🌸 Bienvenue sur le bot SUIJNA XXX\n\nCommandes :\n.menu\n.info\n.help' });
    }

    if (messageText === '.info') {
      await sock.sendMessage(from, { text: '✨ Bot créé par Suijina. Inspiré par la puissance de la purge.' });
    }

    if (messageText === '.help') {
      await sock.sendMessage(from, { text: '❓ Tape .menu pour voir la liste des commandes.' });
    }
  });
}

startBot();

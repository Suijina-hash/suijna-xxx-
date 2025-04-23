const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('./baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

// Auth state
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

// Démarrer le bot
async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connexion fermée. Reconnexion :', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot connecté à WhatsApp');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text === '.ping') {
            await sock.sendMessage(from, { text: '🏓 Pong ! Je suis actif.' });
        }

        if (text === '.menu') {
            await sock.sendMessage(from, { text: '🌸 Menu de SUIJNA XXX\n\n1. .ping\n2. .menu\n3. .info' });
        }

        if (text === '.info') {
            await sock.sendMessage(from, {
                text: 'Bot WhatsApp *SUIJNA XXX*\nDéveloppé avec Baileys.\nHebergé sur Render.'
            });
        }
    });
}

startBot();

import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { removerCaracteres } from './bot/codigos/removerCaracteres.js';
import { blacklist, banUser, notifyUserRemoved, handleMessage } from './bot/codigos/blacklist.js';
import configurarBloqueio from './bot/codigos/bloquearUsuarios.js';
import { handleMessage as handleAdvertencias } from './bot/codigos/advertenciaGrupos.js';
import { mencionarTodos } from './bot/codigos/enviarRegras.js';
import { handleAntiLink } from './bot/codigos/antilink.js';
import { verificarFlood } from './bot/codigos/antiflood.js';
import { handleBanMessage } from './bot/codigos/banUsuario.js';
import removerNumEstrangeiros from './bot/codigos/removerNumEstrangeiros.js';

async function connectToWhatsApp() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
            console.log('Reconectando...');
            setTimeout(() => connectToWhatsApp(), 3000);
        } else if (connection === 'open') {
            console.log('Bot conectado com sucesso!');
        } else if (connection === 'connecting') {
            console.log('Tentando conectar...');
        }
    });

    configurarBloqueio(sock);

    // Evento de mensagens recebidas
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const message = m.messages[0];
            if (!message.message || message.key.remoteJid === 'status@broadcast') return;

            await removerCaracteres(sock, message);
            await mencionarTodos(sock, message); // Chama função para enviar regras

            // Verifica e processa outros eventos
            await handleBanMessage(sock, message); // Verifica comando #ban
            await verificarFlood(sock, message.key.remoteJid, message); // Verifica flood
            await handleAdvertencias(sock, message); // Verifica advertências
            await handleMessage(sock, message); // Lida com blacklist

            const groupMeta = await sock.groupMetadata(message.key.remoteJid);
            const adminNumbers = groupMeta.participants
                .filter(participant => participant.isAdmin)
                .map(admin => admin.id);

            await handleAntiLink(sock, message, message.key.remoteJid, adminNumbers); // Lida com links
        } catch (err) {
            console.error('Erro ao processar mensagens:', err);
        }
    });

    // Evento de atualização de participantes no grupo
    sock.ev.on('group-participants.update', async (update) => {
        const { id: groupId, participants, action } = update;

        // Remove números estrangeiros ao adicionar novos participantes
        if (action === 'add') {
            await removerNumEstrangeiros(sock, groupId); // Chama a função ao adicionar participantes
        }

        if (action === 'add') {
            for (let participant of participants) {
                if (blacklist.includes(participant)) {
                    console.log(`Usuário ${participant} encontrado na blacklist. Removendo...`);
                    await banUser(sock, groupId, participant);
                    await notifyUserRemoved(sock, groupId, participant);
                } else {
                    console.log(`Novo participante ${participant} adicionado.`);
                }
            }
        }
    });
}

connectToWhatsApp().catch(err => {
    console.error('Erro ao conectar:', err);
});

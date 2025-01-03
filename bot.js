// Importações
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { removerCaracteres } from './bot/codigos/removerCaracteres.js';
import { blacklist, banUser, notifyUserRemoved, handleMessage } from './bot/codigos/blacklist.js';
import configurarBloqueio from './bot/codigos/bloquearUsuarios.js';
import { handleMessage as handleAdvertencias } from './bot/codigos/advertenciaGrupos.js';
import { mencionarTodos } from './bot/codigos/enviarRegras.js';
import { handleAntiLink } from './bot/codigos/antilink.js';
import { verificarFlood } from './bot/codigos/antiflood.js';
import { handleBanMessage } from './bot/codigos/banUsuario.js';

async function connectToWhatsApp() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
            console.log("Reconectando...");
            setTimeout(() => connectToWhatsApp(), 3000);
        } else if (connection === "open") {
            console.log("Bot conectado com sucesso!");
        } else if (connection === 'connecting') {
            console.log("Tentando conectar...");
        }
    });

    // Configura o bloqueio, anti-link e despedida
    configurarBloqueio(sock);

    sock.ev.on("messages.upsert", async (m) => {
        try {
            const message = m.messages[0];

            // Chamar a função removerCaracteres
            await removerCaracteres(sock, message);

            // Chamar a função mencionarTodos
            await mencionarTodos(sock, message);  // Usando a função mencionada

            const content = message.message?.conversation || '';
            const from = message.key.remoteJid;
            const sender = message.key.participant || message.key.remoteJid;

            // Verifica se a mensagem é o comando #ban
            await handleBanMessage(sock, message);

            // Chama a verificação de flood
            await verificarFlood(sock, from, message);

            // Processa mensagens para advertências
            await handleAdvertencias(sock, message);

            // Verifica e lida com a blacklist
            await handleMessage(sock, message);

            // Lida com o anti-link
            const groupMeta = await sock.groupMetadata(from);
            const adminNumbers = groupMeta.participants
                .filter(participant => participant.isAdmin)
                .map(admin => admin.id);

            // Chama a função handleAntiLink para processar a verificação de links
            await handleAntiLink(sock, message, from, adminNumbers);
        } catch (err) {
            console.error("Erro ao processar mensagens:", err);
        }
    });

    sock.ev.on('group-participants.update', async (update) => {
        const { id: groupId, participants, action } = update;

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
    console.error("Erro ao conectar:", err);
});

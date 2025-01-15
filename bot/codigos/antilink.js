// Função principal para lidar com links, texto oculto e comandos suspeitos
export const handleAntiLink = async (sock, msg, groupId) => {
    try {
        const linkPattern = /((https?:\/\/|www\.|wa\.me\/\d+)[^\s]+)/img;
        const commandPattern = /[!&@#$%.,*~\-][\w]+/g; // Detecta comandos começando com caracteres especiais e seguidos por palavras
        const allowedCommands = ['#adv', '#ban', '#regras', '#todos']; // Comandos permitidos
        const textLimit = 950; // Limite de caracteres permitido

        let text = '';
        let extractedText = ''; // Texto extraído de mídia (se aplicável)
        let fullText = ''; // Texto total combinado

        // Verifica o tipo de mensagem e coleta o texto
        if (msg.message.conversation) {
            text = msg.message.conversation;
        } else if (msg.message.extendedTextMessage) {
            text = msg.message.extendedTextMessage.text;
        } else if (msg.message.imageMessage || msg.message.videoMessage || msg.message.audioMessage || msg.message.documentMessage) {
            // Verifica legenda, se houver
            if (msg.message.imageMessage?.caption) {
                text = msg.message.imageMessage.caption;
            } else if (msg.message.videoMessage?.caption) {
                text = msg.message.videoMessage.caption;
            }

            // Se for uma mídia, tenta extrair texto oculto
            const mediaUrl = msg.message.imageMessage?.url || 
                             msg.message.videoMessage?.url || 
                             msg.message.documentMessage?.url || 
                             msg.message.audioMessage?.url;
            if (mediaUrl) {
                extractedText = await extractTextFromImage(mediaUrl);
            }
        }

        // Ignora mensagens enviadas pelo bot
        if (msg.key.fromMe) return;

        // Combina texto visível e oculto
        fullText = `${text} ${extractedText}`.trim();

        console.log('Texto combinado da mensagem:', fullText);

        // Verifica comandos suspeitos
        const words = fullText.split(/\s+/); // Divide o texto em palavras
        for (let word of words) {
            if (commandPattern.test(word) && !allowedCommands.includes(word)) {
                console.log('Removendo mensagem com comando suspeito:', word);
                await sock.sendMessage(groupId, { delete: msg.key });
                const userId = msg.key.participant;
                console.log('Removendo usuário por envio de comando suspeito:', userId);
                await sock.groupParticipantsUpdate(groupId, [userId], 'remove');
                return; // Sai após remover a mensagem e o usuário
            }
        }

        // Verifica links no texto combinado
        const links = fullText.match(linkPattern);
        if (links) {
            const groupInviteLink = await getGroupInviteLink(sock, groupId);
            if (!groupInviteLink) {
                console.error('Não foi possível obter o link de convite do grupo.');
                return;
            }

            const normalizedGroupInviteLink = groupInviteLink.replace(/^https?:\/\//, '').toLowerCase();
            const allowedInviteLink = 'ewlkegcnhjp5axqy34agl'; // Exemplo de link permitido

            for (let link of links) {
                const normalizedLink = link.replace(/^https?:\/\//, '').toLowerCase();
                if (normalizedLink !== allowedInviteLink && !normalizedLink.includes(normalizedGroupInviteLink)) {
                    console.log('Removendo mensagem com link:', normalizedLink);
                    await sock.sendMessage(groupId, { delete: msg.key });
                    const userId = msg.key.participant;
                    console.log('Removendo usuário por envio de link:', userId);
                    await sock.groupParticipantsUpdate(groupId, [userId], 'remove');
                    return; // Sai após remover a mensagem e o usuário
                }
            }
        }

        // Verifica se o texto total ultrapassa o limite de caracteres
        if (fullText.length > textLimit) {
            console.log('Removendo mensagem com texto acima de 950 caracteres.');
            await sock.sendMessage(groupId, { delete: msg.key });
            const userId = msg.key.participant;
            console.log('Removendo usuário por envio de texto longo:', userId);
            await sock.groupParticipantsUpdate(groupId, [userId], 'remove');
            return; // Sai após remover a mensagem e o usuário
        }
    } catch (error) {
        console.error('Erro no handleAntiLink:', error);
    }
};

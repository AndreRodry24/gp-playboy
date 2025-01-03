// Função para obter o link de convite do grupo
const getGroupInviteLink = async (sock, groupId) => {
    try {
        // Obtém o código de convite do grupo
        const inviteCode = await sock.groupInviteCode(groupId);

        // Gera o link de convite com base no código
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        return inviteLink;
    } catch (error) {
        console.error('Erro ao obter o link de convite do grupo:', error);
        return null;
    }
};

// Função principal para tratar links não permitidos
export const handleAntiLink = async (sock, msg, groupId) => {
    try {
        // Expressão regular para capturar URLs
        const linkPattern = /((https?:\/\/|www\.|wa\.me\/\d+)[^\s]+)/img;

        let text = '';

        // Verifica se a mensagem contém texto (pode ser uma mensagem simples ou uma extendedTextMessage)
        if (msg.message.conversation) {
            text = msg.message.conversation;
        } else if (msg.message.extendedTextMessage) {
            text = msg.message.extendedTextMessage.text;
        }

        // Ignora mensagens do bot
        if (msg.key.fromMe) return;

        console.log('Texto da mensagem recebida:', text);

        // Obtém o link de convite do grupo
        const groupInviteLink = await getGroupInviteLink(sock, groupId);

        if (!groupInviteLink) {
            console.error('Não foi possível obter o link de convite do grupo.');
            return;
        }

        const normalizedGroupInviteLink = groupInviteLink.replace(/^https?:\/\//, '').toLowerCase();

        // Link específico que não deve ser removido
        const allowedInviteLink = 'ewlkegcnhjp5axqy34agl'; // Link do grupo permitido, sem 'https://chat.whatsapp.com/'

        // Verifica se a mensagem contém links
        const links = text.match(linkPattern);

        if (links) {
            for (let link of links) {
                const normalizedLink = link.replace(/^https?:\/\//, '').toLowerCase();

                // Verifica se o link é exatamente o link permitido
                if (normalizedLink === allowedInviteLink) {
                    console.log('Link permitido encontrado, não será removido:', normalizedLink);
                    continue; // Não remove a mensagem
                }

                // Compara o link da mensagem com o link do grupo
                if (normalizedLink !== normalizedGroupInviteLink && !normalizedLink.includes(normalizedGroupInviteLink)) {
                    // Apaga a mensagem contendo o link
                    await sock.sendMessage(groupId, { delete: msg.key });

                    console.log('Mensagem contendo link removida:', normalizedLink);

                    // Remove o usuário que postou o link
                    const userId = msg.key.participant;  // Obtém o ID do usuário que enviou a mensagem
                    await sock.groupParticipantsUpdate(groupId, [userId], 'remove');

                    console.log('Usuário removido do grupo:', userId);
                    break;  // Não precisa continuar verificando outros links na mesma mensagem
                }
            }
        } else {
            console.log('Nenhum link detectado na mensagem.');
        }
    } catch (error) {
        console.error('Erro no handleAntiLink:', error);
    }
};

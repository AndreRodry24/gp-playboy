export const mencionarTodos = async (c, mensagem) => {
    try {
        const chatId = mensagem.key.remoteJid; // ID do grupo
        const grupoInfo = await c.groupMetadata(chatId); // Obter informações do grupo
        const descricaoGrupo = grupoInfo.desc ? grupoInfo.desc : '🚫 *Sem descrição definida ainda!*'; // Obter a descrição do grupo

        let textoMensagem = '';
        if (mensagem.message.conversation) {
            textoMensagem = mensagem.message.conversation; // Mensagem enviada pelo usuário
        } else if (mensagem.message.extendedTextMessage) {
            textoMensagem = mensagem.message.extendedTextMessage.text; // Mensagem com texto (como links)
        }

        // Verificar se o texto contém #regras
        if (textoMensagem && textoMensagem.endsWith('#regras')) {
            console.log('Comando #regras detectado.');

            let idsUsuarios = [];

            // Verificar se a mensagem é uma resposta citada
            if (
                mensagem.message.extendedTextMessage &&
                mensagem.message.extendedTextMessage.contextInfo &&
                mensagem.message.extendedTextMessage.contextInfo.quotedMessage
            ) {
                // Se for uma resposta citada, pegar o ID do usuário mencionado na resposta
                const usuarioRespondido = mensagem.message.extendedTextMessage.contextInfo.participant;
                if (usuarioRespondido) {
                    idsUsuarios = [usuarioRespondido]; // Mencionar apenas o autor da mensagem citada
                }
            }

            let mensagemRegras = '';

            if (idsUsuarios.length === 0) {
                // Nenhuma resposta citada: enviar regras sem mencionar ninguém
                mensagemRegras += `🚨 𝑳𝒆𝒊𝒂 𝒂𝒕𝒆𝒏𝒕𝒂𝒎𝒆𝒏𝒕𝒆 𝒂𝒔 𝒓𝒆𝒈𝒓𝒂𝒔 𝒅𝒐 𝒈𝒓𝒖𝒑𝒐  🚨`;
                mensagemRegras += `\n🔒 𝑷𝒂𝒓𝒂 𝒏𝒂̃𝒐 𝒄𝒐𝒎𝒆𝒕𝒆𝒓 𝒊𝒏𝒇𝒓𝒂𝒄̧𝒐̃𝒆𝒔 🚫`;
                mensagemRegras += `\n\n${descricaoGrupo}`;
            } else {
                // Se houver usuários mencionados
                mensagemRegras += `${idsUsuarios.map(id => `@${id.split('@')[0]}`).join(', ')}`;
                mensagemRegras += `\n\n🚨 𝑳𝒆𝒊𝒂 𝒂𝒕𝒆𝒏𝒕𝒂𝒎𝒆𝒏𝒕𝒆 𝒂𝒔 𝒓𝒆𝒈𝒓𝒂𝒔 𝒅𝒐 𝒈𝒓𝒖𝒑𝒐  🚨`;
                mensagemRegras += `\n🔒 𝑷𝒂𝒓𝒂 𝒏𝒂̃𝒐 𝒄𝒐𝒎𝒆𝒕𝒆𝒓 𝒊𝒏𝒇𝒓𝒂𝒄̧𝒐̃𝒆𝒔 🚫`;
                mensagemRegras += `\n\n${descricaoGrupo}`;
            }

            const mensagemFinal = {
                text: mensagemRegras,
                mentions: idsUsuarios, // Mencionando o usuário citado (se existir)
            };

            await c.sendMessage(chatId, mensagemFinal);
            console.log('Mensagem de regras enviada para o grupo com sucesso:', mensagemFinal);
        }
    } catch (error) {
        console.error('Erro ao enviar regras:', error);
        console.log('Detalhes da mensagem:', mensagem);
    }
};

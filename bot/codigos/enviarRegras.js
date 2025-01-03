// Função para enviar regras do grupo (ou descrição)
export const mencionarTodos = async (c, mensagem) => {
    try {
        const chatId = mensagem.key.remoteJid; // ID do grupo
        const grupoInfo = await c.groupMetadata(chatId); // Obter informações do grupo
        const descricaoGrupo = grupoInfo.desc ? grupoInfo.desc : '🚫 *Sem descrição definida ainda!*'; // Obter a descrição do grupo

        // Verificar se a mensagem contém #regras
        let textoMensagem = '';
        if (mensagem.message.conversation) {
            textoMensagem = mensagem.message.conversation; // Mensagem enviada pelo usuário
        } else if (mensagem.message.extendedTextMessage) {
            textoMensagem = mensagem.message.extendedTextMessage.text; // Mensagem com texto (como links)
        }

        if (textoMensagem && textoMensagem.endsWith('#regras')) {
            console.log('Comando #regras detectado.');

            // Enviar a mensagem com as regras extraídas da descrição do grupo
            const mensagemRegras = {
                text: `${descricaoGrupo}`,
            };

            // Enviar a mensagem para o grupo
            await c.sendMessage(chatId, mensagemRegras);
            console.log('Mensagem de regras enviada para o grupo com sucesso:', mensagemRegras);
        }
    } catch (error) {
        console.error('Erro ao enviar regras:', error);
        console.log('Detalhes da mensagem:', mensagem);
    }
};

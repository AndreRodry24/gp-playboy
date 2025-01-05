async function mensionarTodos(sock, mensagem) {
    try {
        const comando = mensagem.message?.extendedTextMessage?.text || '';
        const isReply = !!mensagem.message?.extendedTextMessage?.contextInfo;
        const idGrupo = mensagem.key.remoteJid;
        const grupoInfo = await sock.groupMetadata(idGrupo);

        // Verificar se o usuário que enviou a mensagem é um administrador
        const isAdmin = grupoInfo.participants.find(participant => participant.id === mensagem.key.participant)?.admin;

        // Verifica se o comando é #todos, se é uma resposta, e se o usuário é um administrador
        if (comando === '#todos' && isReply) {
            // Se for um administrador, executa o comando normalmente
            if (isAdmin) {
                const membros = grupoInfo.participants.map(part => part.id);
                const mensagemCitada = mensagem.message.extendedTextMessage.contextInfo;
                let textoCitado = '';

                // Verificando o tipo de mensagem citada e acessando o texto de acordo com o tipo
                if (mensagemCitada.quotedMessage?.conversation) {
                    textoCitado = mensagemCitada.quotedMessage.conversation; // Mensagem de texto
                } else if (mensagemCitada.quotedMessage?.imageMessage) {
                    textoCitado = mensagemCitada.quotedMessage.imageMessage.caption; // Legenda de uma imagem
                } else if (mensagemCitada.quotedMessage?.videoMessage) {
                    textoCitado = mensagemCitada.quotedMessage.videoMessage.caption; // Legenda de um vídeo
                } else if (mensagemCitada.quotedMessage?.extendedTextMessage) {
                    textoCitado = mensagemCitada.quotedMessage.extendedTextMessage.text; // Mensagem com texto (como links)
                } else if (mensagemCitada.quotedMessage?.contactMessage) {
                    textoCitado = mensagemCitada.quotedMessage.contactMessage.displayName; // Nome de um contato
                }

                // A mensagem final será a mensagem citada do usuário, sem as menções visíveis
                const mensagemFinal = `${textoCitado}`;

                // Enviando a nova mensagem como resposta citada, mas sem as menções visíveis no texto
                await sock.sendMessage(idGrupo, {
                    text: mensagemFinal,
                    mentions: membros,  // A lista de membros é mantida para criar as menções
                    quotedMessage: {
                        extendedTextMessage: {
                            text: textoCitado,
                            contextInfo: mensagemCitada,
                        }
                    },
                });

                console.log(`Mencionou todos no grupo: ${idGrupo}`);
            } else {
                // Se não for um administrador, envia a mensagem de permissão
                const mensagemAviso = `@${mensagem.key.participant.split('@')[0]}, você *NÃO tem permissão* para executar esse comando 🚫👨🏻‍✈️ *Ele é EXCLUSIVO dos administradores* do grupo 👑🐰 *Ƥˡ𝒶Ƴ乃𝔬у* ♕🎀`;

                // Envia a mensagem mencionando o usuário que tentou executar o comando
                await sock.sendMessage(idGrupo, {
                    text: mensagemAviso,
                    mentions: [mensagem.key.participant],  // Menciona o usuário que tentou executar
                });

                console.log(`Usuário não autorizado tentou executar #todos: ${mensagem.key.participant}`);
            }
        }
    } catch (error) {
        console.error('Erro ao mencionar todos os membros:', error);
    }
}

export { mensionarTodos };
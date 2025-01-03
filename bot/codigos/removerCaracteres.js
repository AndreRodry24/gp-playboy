export async function removerCaracteres(c, mensagem) {
    // Obtém o texto da mensagem, seja como 'conversation' ou como legenda de imagem
    const textoMensagem = mensagem.message?.conversation || mensagem.message?.imageMessage?.caption;

    // Verifica se há mensagem de texto ou legenda
    if (textoMensagem) {
        // Palavras-chave para identificar conteúdo proibido
        const palavrasProibidas = [
            "pedofilia",
            "cp",
            "pedo",
            "vendo videos",
            "entre no meu grupo",
            "videos proibidos",
            "fotos proibidas",
            "mega",
            "links de grupos",
            "sexualmente explícito",
            "pornografia",
            "drogas",
            "armas",
            "terrorismo",
            "fraude",
            "golpe",
            "venda de armas",
            "venda de drogas",
            "venda de produtos ilegais",
            "extorsão",
            "hacking",
            "hackear",
            "phishing",
            "propaganda de produtos ilegais",
            "conteúdo ofensivo",
            "discurso de ódio",
            "racismo",
            "discriminação",
            "violência",
            "assédio",
            "aposta",
            "plataforma",
            "intimidação",
            "bullying",
            "estelionato",
            "roubo",
            "jogue",
            "depósito",
            "acesse",
            "pirataria",
            "jogo de azar",
            "crimes cibernéticos",
            "spam",
            "flood",
            "fake news",
            "notícias falsas",
            "fake accounts",
            "perfis falsos",
            "apologia ao crime",
            "incitação à violência",
            "exploração infantil",
            "exploração sexual",
            "tráfico humano",
            "tráfico de pessoas",
            "conteúdo sensível",
            "imagem íntima não consensual",
            "sexting não consensual"
        ];

        // Lista de palavras-chave para identificar regras do grupo
        const regrasDoGrupo = [
            "regras do grupo", "não envie links", "não envie spam", "respeite os administradores", 
            "sem conteúdo ofensivo", "seja educado", "não envie flood", "não envie fake news",
            "não envie conteúdo sensível", "não envie pornografia", "não envie links de grupos",
            "não faça propaganda", "não envie mensagens repetitivas", "evite linguagem vulgar",
            "não compartilhe conteúdo ilegal", "proibido assédio", "proibido discriminação",
            "proibido violência", "proibido apologia ao crime", "proibido incitação à violência",
            "não envie mensagens de ódio", "evite discurso racista", "não envie spam de promoções",
            "não compartilhe pirataria", "não compartilhe conteúdos sensíveis", "não envie textos abusivos",
            "respeite os direitos dos outros", "evite conteúdo de ódio", "não faça perseguição",
            "não compartilhe conteúdos de exploração", "não faça apologia à violência"
        ];

        // Verifica se a mensagem contém qualquer uma das regras do grupo
        if (regrasDoGrupo.some(regra => textoMensagem.toLowerCase().includes(regra.toLowerCase()))) {
            console.log("Mensagem identificada como parte das regras do grupo. Não será removida.");
            return; // Não faz nada, pois a mensagem é sobre as regras do grupo
        }

        // Verifica se a mensagem contém qualquer uma das palavras proibidas
        if (palavrasProibidas.some(palavra => textoMensagem.toLowerCase().includes(palavra.toLowerCase()))) {
            console.log("Mensagem identificada com conteúdo proibido. Usuário será removido.");
            
            // Obtém o ID do usuário que enviou a mensagem
            const usuarioId = mensagem.key.participant || mensagem.key.remoteJid;
            const grupoId = mensagem.key.remoteJid;

            // Verifica se o usuário é um administrador no grupo
            const metadata = await c.groupMetadata(grupoId);
            const isAdmin = metadata.participants.some(participant => 
                participant.id === usuarioId && 
                (participant.admin === 'admin' || participant.admin === 'superadmin')
            );

            // Apenas se o usuário NÃO for administrador
            if (!isAdmin) {
                try {
                    // Apaga a mensagem do grupo
                    await c.sendMessage(grupoId, { delete: mensagem.key });

                    // Remove o usuário do grupo
                    await c.groupParticipantsUpdate(grupoId, [usuarioId], 'remove');

                    console.log(`Usuário ${usuarioId} removido por conteúdo proibido.`);
                } catch (error) {
                    console.error(`Erro ao remover participante:`, error);
                }
            } else {
                console.log(`Usuário ${usuarioId} é administrador e não será removido.`);
            }
        }

        // Verifica o comprimento total da mensagem ou legenda
        const comprimentoTotal = textoMensagem.length;

        // Obtém o ID do usuário que enviou a mensagem
        const usuarioId = mensagem.key.participant || mensagem.key.remoteJid;
        const grupoId = mensagem.key.remoteJid;

        // Verifica se a mensagem ou legenda tem mais de 950 caracteres
        if (comprimentoTotal > 950) {
            try {
                // Apaga a mensagem do grupo
                await c.sendMessage(grupoId, { delete: mensagem.key });

                // Remove o usuário do grupo
                await c.groupParticipantsUpdate(grupoId, [usuarioId], 'remove');

                console.log(`Usuário ${usuarioId} removido por mensagem longa.`);
            } catch (error) {
                console.error(`Erro ao remover participante:`, error);
            }
        }
    }
}

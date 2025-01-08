export async function removerCaracteres(c, mensagem) {
    const textoMensagem = mensagem.message?.conversation || mensagem.message?.imageMessage?.caption;

    if (textoMensagem) {
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
            "cartão clonado",
            "estamos com saldo na conta",
            "mecho com cartão",
            "pix",
            "chamadinha na promoção",
            "vendo conteúdo proibido",
            "novinhas",
            "mãe e filho",
            "incesto",
            "pesados",
            "pai e filhos",
            "Trabalho com fotos vídeos e chamadas",
            "vídeos e chamadas",
            "conta de terceiros",
            "Chama só interessados",
            "Fortune Mouse",
            "slots mais queridinhos",
            "CASSINOS MET GOL",
            "PLATAFORMA DE  5 REAIS",
            "Suporte 24horas",
            "sexting não consensual",
            "Sem limite de saques",
            "Jogue com responsabilidade!",
            "Jogos de azar",
            "SÓ VIA PIX",
            "LINK TELEGRAM",
            "1000MIL VÍDEOS  POR 7,00$",
            "VÍDEOS DE NOVINHA",
            "LINKS DE VÍDEOS C🅿️",
            "VIA MEGA✅",
            "SIGILO ABSOLUTO🤫✅",
            "ATENDIMENTO 24h",
            "VALORES DOS LINKS",
            "GRUPO C🅿️ TELEGRAM EXCLUSIVO",
            "telegram exclusivo",
            "LINKS NOVOS",
            "PROMOÇÃO",
            "vendo packs",
            "plaquinha",
            "chamada com sexo",
            "não faço pg",
            "não faço programa",
            "apartir",
            "tabelinha",
            "chame no privado",
            "pv liberados para interessados",
            "Até gozamos",
            "Chamada de vídeo",
            "Vip",
            "vip",
            "Meu grupo vip",
            "videos personalizados",
            "real interesse"
        ];

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

        // ** Limite máximo para análise **
        const LIMITE_ANALISE = 950;

        if (textoMensagem.length > LIMITE_ANALISE) {
            try {
                const usuarioId = mensagem.key.participant || mensagem.key.remoteJid;
                const grupoId = mensagem.key.remoteJid;

                await c.sendMessage(grupoId, { delete: mensagem.key });
                await c.groupParticipantsUpdate(grupoId, [usuarioId], 'remove');
                console.log(`Usuário ${usuarioId} removido por mensagem longa.`);
            } catch (error) {
                console.error(`Erro ao remover participante por mensagem longa:`, error);
            }
            return;
        }

        // ** Divisão do texto em blocos menores para busca otimizada **
        const BLOCOS = 50; // Número de caracteres por bloco
        const textoDividido = textoMensagem.match(new RegExp(`.{1,${BLOCOS}}`, 'g'));

        // Verifica palavras proibidas nos blocos
        const mensagemProibida = textoDividido.some(bloco =>
            palavrasProibidas.some(palavra => bloco.toLowerCase().includes(palavra.toLowerCase()))
        );

        if (mensagemProibida) {
            const usuarioId = mensagem.key.participant || mensagem.key.remoteJid;
            const grupoId = mensagem.key.remoteJid;

            const metadata = await c.groupMetadata(grupoId);
            const isAdmin = metadata.participants.some(participant =>
                participant.id === usuarioId &&
                (participant.admin === 'admin' || participant.admin === 'superadmin')
            );

            if (!isAdmin) {
                try {
                    await c.sendMessage(grupoId, { delete: mensagem.key });
                    await c.groupParticipantsUpdate(grupoId, [usuarioId], 'remove');
                    console.log(`Usuário ${usuarioId} removido por conteúdo proibido.`);
                } catch (error) {
                    console.error(`Erro ao remover participante:`, error);
                }
            } else {
                console.log(`Usuário ${usuarioId} é administrador e não será removido.`);
            }
        }

        // Caso nenhuma palavra proibida seja encontrada, retorna
        console.log("Mensagem aprovada, sem palavras proibidas.");
    }
}

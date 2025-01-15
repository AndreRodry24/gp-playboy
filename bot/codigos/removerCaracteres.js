export async function removerCaracteres(c, mensagem) {
    const textoMensagem = mensagem.message?.conversation || mensagem.message?.imageMessage?.caption;

    if (textoMensagem) {
        const palavrasProibidas = [
            "pedofilia",
            "cp",
            "Cp",
            "pedo",
            "Pedo",
            "vendo",
            "Vendo",
            "criança",
            "zoofilia",
            "necrofilia",
            "crianças",
            "entre",
            "proibidos",
            "proibidas",
            "proibidas",
            "mega",
            "links de grupos",
            "grupos",
            "links",
            "explícito",
            "sexualmente",
            "pornografia",
            "drogas",
            "armas",
            "terrorismo",
            "fraude",
            "golpe",
            "armas",
            "armas",
            "venda",
            "vendas e chamadas",
            "vendendo",
            "drogas",
            "venda",
            "ilegais",
            "ilegais",
            "produtos",
            "produto",
            "extorsão",
            "hacking",
            "hackear",
            "phishing",
            "ilegais",
            "propaganda",
            "ofensivo",
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
            "azar",
            "cibernéticos",
            "crimes",
            "crime",
            "spam",
            "flood",
            "infantil",
            "esploração",
            "tráfico",
            "sensível",
            "consensual",
            "íntima",
            "clonado",
            "Clonado",
            "cartão",
            "conta",
            "saldo",
            "saldo",
            "cartão",
            "pix",
            "PIX",
            "promoção",
            "chamadinha",
            "chamada",
            "proibido",
            "novinhas",
            "Conteúdo",
            "conteúdo",
            "filho",
            "mãe",
            "Pai",
            "incesto",
            "Incestos",
            "incestos",
            "pesados",
            "pesado",
            "Pesados",
            "pai e filhos",
            "chamadas",
            "terceiros",
            "interessados",
            "Mouse",
            "Fortune",
            "slots",
            "queridinhos",
            "MET",
            "GOL",
            "CASSINOS",
            "PLATAFORMA",
            "Suporte",
            "consensual",
            "sexting",
            "saques",
            "limite",
            "responsabilidade",
            "Jogue",
            "Jogos de azar",
            "azar",
            "Jogos",
            "VIA",
            "TELEGRAM",
            "LINK",
            "NOVINHA",
            "NOVINHAS",
            "LINKS DE VÍDEOS C🅿️",
            "VIA MEGA✅",
            "SIGILO ABSOLUTO🤫✅",
            "SIGILO",
            "ATENDIMENTO 24h",
            "ATENDIMENTO",
            "VALORES DOS LINKS",
            "VALORES",
            "C🅿️",
            "exclusivo",
            "TELEGRAM",
            "LINKS",
            "PROMOÇÃO",
            "vendo packs",
            "packs",
            "plaquinha",
            "chamada com sexo",
            "não faço pg",
            "pg",
            "não faço programa",
            "programa",
            "apartir",
            "tabelinha",
            "chame no privado",
            "interessados",
            "liberados",
            "interessado",
            "liberado",
            "gozamos",
            "gozamo",
            "Chamada de vídeo",
            "Vip",
            "Meu grupo vip",
            "grupo vip",
            "meu grupo",
            "Meu grupo",
            "personalizados",
            "personalizado",
            "real interesse",
            "interesse",
            "real",
            "cadastra",
            "cadastrar",
            "to disponível",
            "disponivel",
            "interessados",
            "meus conteúdos",
            "conteúdos",
            "chamadas",
            "Chamadas",
            "verificada",
            "VERIFICADA",
            "vídeos chamadas",
            "Pix",
            "chat-whatsapp",
            "aviator",
            "garantia",
            "dragon",
            "megapix",
            "bet",
            "cassino",
            "cotações",
            "cashback",
            "Packs Disponível",
            "R$",
            "Ox",
            "Tiger",
            "Habbit",
            "HERO FILMES",
            "METGOL",
            "MINE ISLAND",
            "LIGAÇÃO",
            "ligação"
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
            palavrasProibidas.some(palavra =>
                bloco.toLowerCase().includes(palavra.toLowerCase()) // Converte ambos para minúsculas
            )
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

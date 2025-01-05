// removerNumEstrangeiros.js

// Função para verificar se um número é brasileiro e válido
const isBrazilianNumber = (number) => {
    // Remove caracteres não numéricos
    const cleanNumber = number.replace(/\D/g, '');

    // Verifica se o número é brasileiro e segue o formato válido de celular
    const isMobile = 
        cleanNumber.length >= 12 && // Número com DDI (55) e DDD (mínimo de 12 caracteres)
        cleanNumber.startsWith('55') && // Começa com o DDI do Brasil
        /^[0-9]+$/.test(cleanNumber); // Apenas números são permitidos

    return isMobile;
};

// Função para remover números estrangeiros
const removerNumEstrangeiros = async (conn, groupId) => {
    try {
        const group = await conn.groupMetadata(groupId); // Obtém metadados do grupo
        const participantes = group.participants; // Lista de participantes

        for (const participante of participantes) {
            const numero = participante.id;

            // Verifica se o número não é brasileiro
            if (!isBrazilianNumber(numero)) {
                try {
                    console.log(`Removendo número estrangeiro: ${numero}`);
                    await conn.groupParticipantsUpdate(groupId, [numero], 'remove'); // Remove o participante
                } catch (error) {
                    console.error(`Erro ao remover ${numero} do grupo ${groupId}:`, error);
                }
            } else {
                console.log(`Número brasileiro detectado: ${numero}`);
            }
        }
    } catch (error) {
        console.error(`Erro ao processar o grupo ${groupId}:`, error);
    }
};

// Exportar a função para ser usada em outros módulos
export default removerNumEstrangeiros;

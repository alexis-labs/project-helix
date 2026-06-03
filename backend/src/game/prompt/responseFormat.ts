export const responseFormat = `# FORMATO OBRIGATÓRIO DE RESPOSTA

Primeiro escreve apenas a narração para o jogador.
Depois, no final, inclui sempre os blocos técnicos abaixo para a interface atualizar o estado.
Estes blocos não fazem parte da narração e não devem ser explicados ao jogador.

MEMORIA:
Cada linha é uma variável persistente da aventura no formato:
- chave: valor | fonte | descrição curta

Regras do bloco MEMORIA:
- Inclui SEMPRE a lista completa de variáveis relevantes neste turno.
- fonte deve ser uma de: jogador, externo, descoberta
- jogador → ações ou intenções do jogador
- externo → eventos do mundo, NPCs, ambiente, acidentes
- descoberta → factos ou segredos que o jogador passou a saber
- Altera o valor quando algo muda (ex.: rumor_confirmado → rumor_desmentido).
- Remove variáveis obsoletas omitindo-as da lista.
- Usa chaves em minúsculas com underscores (ex.: ultima_acao, npc_marta).

Exemplo:
- ultima_acao: explorar_corredor | jogador | Explorou o corredor escuro
- rumor_radio: ouvido | externo | Discussão nocturna sobre transmissões
- mae_paradeiro: desconhecido | descoberta | Último contacto na evacuação

ESTADO_UI:

MEDO: X/100
FERIMENTOS: X/100
FOME: X/100
EXAUSTÃO: X/100

INVENTÁRIO:
- item 1
- item 2
- item 3

LOCALIZAÇÃO:
(local atual)

OBJETIVO ATUAL:
(objetivo atual)

Depois aguarda pela próxima ação do jogador.`;

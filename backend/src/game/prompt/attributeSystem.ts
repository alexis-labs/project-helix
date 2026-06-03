export const attributeSystem = `# SISTEMA DE ATRIBUTOS

## MEDO

Representa o estado psicológico do jogador.

- 0-20 → Calmo
- 21-40 → Inquieto
- 41-60 → Nervoso
- 61-80 → Em pânico
- 81-100 → Colapso psicológico

Efeitos possíveis:
- Tremores
- Dificuldade em tomar decisões
- Alucinações auditivas
- Ataques de pânico

---

## FERIMENTOS

Representa o estado físico.

- 0-20 → Pequenos cortes e hematomas
- 21-40 → Dor constante
- 41-60 → Mobilidade reduzida
- 61-80 → Estado grave
- 81-100 → Morte

---

## FOME

Representa necessidade de alimentação.

- 0-20 → Satisfeito
- 21-40 → Fome ligeira
- 41-60 → Fome constante
- 61-80 → Fraqueza
- 81-100 → Inanição

---

## EXAUSTÃO

Representa cansaço físico e mental.

- 0-20 → Descansado
- 21-40 → Cansado
- 41-60 → Muito cansado
- 61-80 → Exausto
- 81-100 → Incapacitado

---

# EVENTOS QUE AUMENTAM MEDO

## +5 MEDO

- Ouvir choro distante
- Encontrar sangue seco
- Escutar passos sem identificar origem
- Ouvir alguém falar sozinho

## +10 MEDO

- Ficar sozinho numa zona desconhecida
- Descobrir que alguém desapareceu
- Ouvir um infetado próximo
- Encontrar sinais de luta

## +20 MEDO

- Perder a venda
- Ficar preso num espaço fechado
- Ouvir a voz da mãe sem a ver
- Quase provocar contacto visual

## +30 MEDO

- Ver um infetado de perto
- Encontrar alguém conhecido transformado
- Presenciar uma infeção
- Acreditar que vais morrer

---

# FIM DE JOGO POR ATRIBUTOS

Se MEDO, FERIMENTOS, FOME ou EXAUSTÃO atingirem 100/100, a aventura termina nesse turno.

Narra de forma clara e definitiva a consequência:
- MEDO 100 → colapso psicológico irreversível
- FERIMENTOS 100 → morte
- FOME 100 → inanição
- EXAUSTÃO 100 → colapso por exaustão total

Não convides o jogador a continuar depois disso.

---

# EVENTOS QUE CAUSAM FERIMENTOS

## +5 FERIMENTOS

- Cortes em vidro
- Queda ligeira
- Tropeçar em escombros

## +10 FERIMENTOS

- Cair escadas abaixo
- Saltar uma vedação
- Ser empurrado

## +20 FERIMENTOS

- Ataque de sobreviventes hostis
- Queda de altura
- Ser atingido por destroços

## +40 FERIMENTOS

- Desabamento
- Acidente grave
- Ataque severo`;

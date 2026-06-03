import type { GameAttributes, GameStatus, MemoryVariable } from "./types.ts";

export const gameContent = {
  character: {
    name: "Jack",
    age: 16,
    backstory: `Quando o caos começou, Jack estava em casa com a mãe.

Durante a evacuação de emergência, uma multidão entrou em pânico após surgirem rumores de infetados na zona.

Pessoas correram em todas as direções.

Jack perdeu a mão da mãe no meio da confusão.

Passou horas sozinho.

Para sobreviver, rasgou uma camisola e improvisou uma venda para evitar contacto visual com desconhecidos.

Foi encontrado por um pequeno grupo de sobreviventes.

Esses sobreviventes levaram-no para um abrigo instalado numa antiga escola secundária.

Desde então nunca mais viu a mãe.`,
    family: {
      father: "Morreu anos antes devido a doença.",
      mother: "Desaparecida. Última vez vista durante a evacuação."
    }
  },
  initialAttributes: {
    fear: 20,
    injuries: 0,
    hunger: 10,
    exhaustion: 15
  } satisfies GameAttributes,
  initialStatus: {
    location: "Abrigo da escola secundária",
    inventory: [
      "Venda improvisada",
      "Fotografia antiga da mãe",
      "Garrafa de água meio cheia"
    ]
  } satisfies GameStatus,
  objectives: {
    primary: "Encontrar a mãe.",
    secondary: [
      "Fugir do abrigo",
      "Não ser infetado",
      "Voltar a casa",
      "Descobrir mais sobre a infeção"
    ]
  },
  playerKnowledge: [
    "A infeção transmite-se através de contacto visual direto.",
    "Os infetados perdem completamente a identidade.",
    "Os cegos são imunes.",
    "A maioria dos sobreviventes vive vendada.",
    "Os responsáveis do abrigo proíbem saídas."
  ],
  initialMemoryVariables: [
    {
      key: "objetivo_principal",
      value: "encontrar_mae",
      source: "jogador",
      description: "Encontrar a mãe"
    },
    {
      key: "mae_paradeiro",
      value: "desconhecido",
      source: "descoberta",
      description: "Mãe perdida durante a evacuação"
    },
    {
      key: "abrigo_regras",
      value: "proibido_sair",
      source: "externo",
      description: "Responsáveis proíbem saídas do abrigo"
    },
    {
      key: "infeccao_conhecimento",
      value: "contacto_visual",
      source: "descoberta",
      description: "A infeção transmite-se por contacto visual"
    }
  ] satisfies MemoryVariable[],
  itemPools: {
    common: [
      "Lanterna de manivela",
      "Corda",
      "Garrafa reutilizável",
      "Máscara improvisada",
      "Cobertor",
      "Mapa rasgado da cidade",
      "Rádio avariado",
      "Mochila velha"
    ],
    uncommon: [
      "Canivete enferrujado",
      "Rádio parcialmente funcional",
      "Chaves de manutenção da escola",
      "Diário de um sobrevivente",
      "Pilhas"
    ],
    rare: [
      "Chaves do portão exterior",
      "Lista de evacuações",
      "Bilhete deixado pela mãe",
      "Mapa completo da cidade",
      "Venda militar de alta qualidade"
    ]
  }
} as const;

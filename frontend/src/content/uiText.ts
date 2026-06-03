export const uiText = {
  title: "Blindfold",
  subtitle: "Uma venda. Nenhuma saída visível.",
  menuAriaLabel: "Menu principal",
  menuActionsAriaLabel: "Opções do jogo",
  menuNewGame: "Novo jogo",
  menuContinue: "Continuar",
  menuExit: "Sair",
  menuContinueDisabledHint: "Ainda não existe uma história guardada.",
  menuExitHint: "Podes fechar este separador do browser para sair.",
  menuNewGameConfirmTitle: "Apagar gravação?",
  menuNewGameConfirmMessage:
    "Iniciar um novo jogo vai substituir a história guardada. Esta ação não pode ser desfeita. Queres mesmo continuar?",
  menuNewGameConfirmYes: "Sim, começar de novo",
  menuNewGameConfirmNo: "Cancelar",
  menuNewGameConfirmAriaLabel: "Confirmar novo jogo",
  narratorLabel: "Narrador",
  playerLabel: "Você",
  currentActionLabel: "Ação",
  sessionTitle: "Sessão",
  sessionCollapseLabel: "Fechar painel",
  sessionExpandLabel: "Abrir painel",
  sessionAriaLabel: "Painel de sessão",
  sidebarActionsLabel: "Controlos da sessão",
  mainAriaLabel: "Blindfold",
  diarySearchLabel: "Pesquisar na história",
  diarySearchPlaceholder: "Palavras, ações, locais...",
  diarySearchHint: "Pesquisa em todas as entradas da aventura.",
  diarySearchResultsAriaLabel: "Resultados da pesquisa na história",
  diarySearchClear: "Limpar pesquisa",
  diaryEntryLabel: (index: number) => `Entrada ${String(index).padStart(2, "0")}`,
  diaryResultsLabel: (shown: number, total: number) =>
    shown === total
      ? `${total} ${total === 1 ? "entrada" : "entradas"}`
      : `${shown} de ${total} entradas`,
  diaryNoResults: "Nenhuma entrada corresponde à pesquisa.",
  diaryPlayerHeading: "A tua nota",
  diaryNarratorHeading: "O que aconteceu",
  inputAriaLabel: "A tua ação",
  inputPlaceholder: "Escreve o teu caminho...",
  submitLabel: "Enviar",
  themeLightLabel: "Modo claro",
  themeDarkLabel: "Modo escuro",
  audioOnLabel: "Silenciar",
  audioOffLabel: "Ambiente",
  ereadToneLabel: "Luminosidade",
  ereadToneToggleLabel: "Ajustar luminosidade",
  ereadToneAriaLabel: "Ajustar luminosidade e tom do ecrã",
  ereadToneValueLabel: (value: number) =>
    value === 0
      ? "Luminosidade normal"
      : value >= 85
        ? "Luminosidade quente no máximo"
        : `${value} por cento de luminosidade quente`,
  ereadToneMinHint: "Normal",
  ereadToneMaxHint: "Quente",
  stateIndicatorsAriaLabel: "HUD de mapa, inventário e estado",
  vitalsIndicatorLabel: "Estado",
  vitalsStableLabel: "Estável",
  vitalsStrainedLabel: "Tenso",
  vitalsCriticalLabel: "Crítico",
  sidebarResizeLabel: "Redimensionar painel da sessão",
  mapIndicatorLabel: "Localização",
  mapCurrentLocationLabel: "Zona atual",
  inventoryIndicatorLabel: "Mochila",
  inventoryEmptyLabel: "Sem itens",
  inventoryEmptySlotLabel: "Vazio",
  inventoryHiddenItemsLabel: (count: number) => `+${count}`,
  inventorySingleItemLabel: "1 item",
  inventoryItemsAriaLabel: "Itens no inventário",
  inventoryItemsLabel: (count: number) => `${count} itens`,
  requestError: "O narrador ficou em silêncio.",
  connectionError: "A ligação falhou. Só ouves a tua respiração.",
  backendUnreachable:
    "Não foi possível contactar o servidor do jogo. Inicia o backend com «npm run dev:backend» na raiz do projeto (porta 3001) e recarrega a página.",
  memoryTitle: "Memória",
  memoryToggleLabel: "Ver memória da aventura",
  memoryAriaLabel: "Variáveis de memória da aventura",
  memoryEmpty: "Ainda não há factos registados na memória.",
  memorySourcePlayer: "Jogador",
  memorySourceExternal: "Externo",
  memorySourceDiscovery: "Descoberta",
  contextUsageAriaLabel: (percent: number, used: number, limit: number) =>
    `Contexto usado: ${percent} por cento, ${used} de ${limit} tokens`,
  contextUsageHint: (used: number, limit: number, percent: number) =>
    `${percent}% do contexto (${used.toLocaleString("pt-PT")} / ${limit.toLocaleString("pt-PT")} tokens)`,
  gameOverEyebrow: "Fim da jornada",
  gameOverTitle: "A história acaba aqui",
  gameOverCause: (cause: "fear" | "injuries" | "hunger" | "exhaustion") => {
    const labels = {
      fear: "Colapso psicológico — medo no máximo",
      injuries: "Morte — ferimentos no máximo",
      hunger: "Inanição — fome no máximo",
      exhaustion: "Exaustão total — exaustão no máximo"
    };

    return labels[cause];
  },
  gameOverSummaryLabel: "Resumo da história",
  gameOverSummaryLoading: "A recolher os últimos fragmentos da tua história...",
  gameOverReturnToMenu: "Voltar ao menu",
  gameOverFallbackSummary: (cause: "fear" | "injuries" | "hunger" | "exhaustion") => {
    const endings = {
      fear:
        "O medo consumiu-te por completo. Perdeste o controlo sobre o teu corpo e sobre os teus pensamentos, e a escuridão tornou-se permanente.",
      injuries:
        "Os ferimentos provaram ser demasiado graves. A tua luta por sobreviver chegou ao fim entre a dor e o silêncio.",
      hunger:
        "A fome venceu-te. Sem forças para continuar, o teu corpo cedeu antes de encontrares respostas.",
      exhaustion:
        "A exaustão esgotou-te por completo. Não te restou energia para dar mais um passo."
    };

    return `A tua jornada termina aqui.\n\n${endings[cause]}\n\nO abrigo, a cidade e a procura pela tua mãe ficam para trás — para sempre.`;
  }
};

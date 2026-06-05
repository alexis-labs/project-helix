import { FONT_SCALE_DEFAULT } from "../hooks/useFontScale";

export const uiText = {
  title: "Blindfold",
  subtitle: "Sandbox narrativa editavel.",
  menuAriaLabel: "Menu principal",
  menuActionsAriaLabel: "Opcoes do jogo",
  menuNewGame: "Novo jogo",
  menuContinue: "Continuar",
  menuExit: "Sair",
  menuContinueDisabledHint: "Ainda nao existe uma sessao guardada.",
  menuExitHint: "Podes fechar este separador do browser para sair.",
  menuNewGameConfirmTitle: "Apagar gravacao?",
  menuNewGameConfirmMessage:
    "Iniciar um novo jogo vai substituir a sessao guardada. Esta acao nao pode ser desfeita. Queres mesmo continuar?",
  menuNewGameConfirmYes: "Sim, comecar de novo",
  menuNewGameConfirmNo: "Cancelar",
  menuNewGameConfirmAriaLabel: "Confirmar novo jogo",
  narratorLabel: "Narrador",
  playerLabel: "Voce",
  currentActionLabel: "Acao",
  sidebarCollapseLabel: "Fechar painel",
  sidebarExpandLabel: "Abrir painel",
  sidebarActionsLabel: "Controlos",
  mainAriaLabel: "Blindfold",
  diarySearchLabel: "Pesquisar na sessao",
  diarySearchPlaceholder: "Palavras, acoes, locais...",
  diarySearchHint: "Pesquisa em todas as entradas da sessao.",
  diarySearchResultsAriaLabel: "Resultados da pesquisa na sessao",
  diarySearchClear: "Limpar pesquisa",
  diaryEntryLabel: (index: number) => `Entrada ${String(index).padStart(2, "0")}`,
  diaryResultsLabel: (shown: number, total: number) =>
    shown === total
      ? `${total} ${total === 1 ? "entrada" : "entradas"}`
      : `${shown} de ${total} entradas`,
  diaryNoResults: "Nenhuma entrada corresponde a pesquisa.",
  diaryPlayerHeading: "A tua nota",
  diaryNarratorHeading: "Resposta",
  inputAriaLabel: "A tua acao",
  inputPlaceholder: "Escreve...",
  submitLabel: "Enviar",
  themeLightLabel: "Modo claro",
  themeDarkLabel: "Modo escuro",
  audioOnLabel: "Silenciar",
  audioOffLabel: "Ambiente",
  ereadToneLabel: "Luminosidade",
  ereadToneToggleLabel: "Ajustar luminosidade",
  ereadToneAriaLabel: "Ajustar luminosidade e tom do ecra",
  ereadToneValueLabel: (value: number) =>
    value === 0
      ? "Luminosidade normal"
      : value >= 85
        ? "Luminosidade quente no maximo"
        : `${value} por cento de luminosidade quente`,
  ereadToneMinHint: "Normal",
  ereadToneMaxHint: "Quente",
  fontScaleLabel: "Tamanho do texto",
  fontScaleToggleLabel: "Ajustar tamanho do texto",
  fontScaleAriaLabel: "Ajustar tamanho das letras",
  fontScaleValueLabel: (value: number) =>
    value === FONT_SCALE_DEFAULT
      ? "Tamanho de texto normal"
      : value <= 90
        ? "Texto mais pequeno"
        : value >= 120
          ? "Texto maior no maximo"
          : `${value} por cento do tamanho normal`,
  fontScaleMinHint: "Menor",
  fontScaleMaxHint: "Maior",
  stateIndicatorsAriaLabel: "HUD de mapa, inventario e estado",
  vitalsIndicatorLabel: "Estado",
  attributeChangesAriaLabel: "Alteracoes de estado",
  attributeChangeLabel: (delta: number, name: string) => {
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta} de ${name}`;
  },
  attributeNames: {
    fear: "medo",
    injuries: "ferimentos",
    hunger: "fome",
    exhaustion: "exaustao"
  } as const,
  vitalsStableLabel: "Estavel",
  vitalsStrainedLabel: "Tenso",
  vitalsCriticalLabel: "Critico",
  sidebarResizeLabel: "Redimensionar painel lateral",
  mapIndicatorLabel: "Localizacao",
  mapCurrentLocationLabel: "Zona atual",
  inventoryIndicatorLabel: "Mochila",
  inventoryEmptyLabel: "Sem itens",
  inventoryEmptySlotLabel: "Vazio",
  inventoryHiddenItemsLabel: (count: number) => `+${count}`,
  inventorySingleItemLabel: "1 item",
  inventoryItemsAriaLabel: "Itens no inventario",
  inventoryItemsLabel: (count: number) => `${count} itens`,
  requestError: "O modelo nao devolveu resposta.",
  connectionError: "A ligacao falhou.",
  backendUnreachable:
    "Nao foi possivel contactar o servidor do jogo. Inicia o backend com «npm run dev:backend» na raiz do projeto (porta 3011) e recarrega a pagina.",
  diaryTitle: "Diario",
  diaryToggleLabel: "Ver skills",
  diaryAriaLabel: "Diario da sessao",
  diaryEmpty: "Ainda nao ha notas no diario.",
  skillsTitle: "Skills",
  skillsAriaLabel: "Skills da aventura",
  skillsEmpty: "Ainda nao ha skills registadas.",
  skillsTitleLabel: "Titulo",
  skillsDescriptionLabel: "Descricao",
  skillsContentLabel: "Conteudo",
  skillsAddAriaLabel: "Adicionar skill",
  skillsSettingsLabel: "Skills",
  skillsSettingsDescription:
    "Memorias e lore da aventura consultadas pelo modelo via ferramentas.",
  skillsSearchPlaceholder: "Pesquisar por titulo, descricao ou id...",
  skillsIdLabel: "ID",
  skillsDeleteAriaLabel: (title: string) => `Remover skill ${title}`,
  skillsEditAriaLabel: (title: string) => `Editar skill ${title}`,
  skillsSettingsEmpty: "Ainda nao existem skills nesta aventura.",
  skillsNewSkill: "Nova skill",
  skillsNewFolder: "Nova pasta",
  skillsNewFolderName: "Nova pasta",
  skillsCreateFolder: "Criar pasta",
  skillsFolderLabel: "Pasta",
  skillsSkillLabel: "Skill",
  skillsFolderNameLabel: "Nome da pasta",
  skillsNewInFolder: "Nova skill aqui",
  skillsFolderSkillCount: (count: number) =>
    `${count} ${count === 1 ? "skill nesta pasta" : "skills nesta pasta"}`,
  skillsDeleteFolderAriaLabel: (name: string) => `Remover pasta ${name}`,
  skillsDeleteFolderConfirm: (name: string) =>
    `Remover a pasta «${name}»? As skills passam para a pasta pai ou para a raiz.`,
  skillsDuplicateAriaLabel: (title: string) => `Duplicar skill ${title}`,
  skillsEditorEmptyTitle: "Seleciona uma skill ou pasta",
  skillsEditorEmptyHint:
    "Usa a arvore à esquerda para navegar, editar conteudo e reorganizar com arrastar.",
  skillsEditorLoading: "A carregar editor...",
  skillsMissingSelection: "O item selecionado ja nao existe.",
  skillsUntitledName: "Nova skill",
  skillsUntitledDescription: "Descricao da skill",
  skillsCreateSkill: "Criar skill",
  skillsCreateAtRoot: "Raiz",
  skillsCreateInsideLabel: "Criar dentro de",
  skillsQuickAddLabel: "Criar skill ou pasta",
  skillsFolderNamePlaceholder: "Ex: Personagens, Locais...",
  skillsSkillNamePlaceholder: "Ex: Maria, Cabana na floresta...",
  skillsWorkbenchHint:
    "Seleciona uma pasta na arvore e cria abaixo. Deixa o nome vazio para usar um template.",
  skillsTreeEmptyHint:
    "Usa o painel abaixo da arvore para criar a primeira pasta ou skill.",
  diaryTagPlayer: "Tu",
  diaryTagExternal: "Externo",
  diaryTagDiscovery: "Descoberta",
  contextUsageAriaLabel: (percent: number, used: number, limit: number) =>
    `Contexto usado: ${percent} por cento, ${used} de ${limit} tokens`,
  contextUsageHint: (used: number, limit: number, percent: number) =>
    `${percent}% do contexto (${used.toLocaleString("pt-PT")} / ${limit.toLocaleString("pt-PT")} tokens)`,
  gameOverEyebrow: "Fim da sessao",
  gameOverTitle: "A sessao acaba aqui",
  gameOverCause: (cause: "fear" | "injuries" | "hunger" | "exhaustion") => {
    const labels = {
      fear: "Medo no maximo",
      injuries: "Ferimentos no maximo",
      hunger: "Fome no maximo",
      exhaustion: "Exaustao no maximo"
    };

    return labels[cause];
  },
  gameOverSummaryLabel: "Resumo",
  gameOverSummaryLoading: "A resumir a sessao...",
  gameOverReturnToMenu: "Voltar ao menu",
  gameOverFallbackSummary: (cause: "fear" | "injuries" | "hunger" | "exhaustion") => {
    const endings = {
      fear: "Medo no maximo.",
      injuries: "Ferimentos no maximo.",
      hunger: "Fome no maximo.",
      exhaustion: "Exaustao no maximo."
    };

    return `A sessao termina aqui.\n\n${endings[cause]}`;
  }
};

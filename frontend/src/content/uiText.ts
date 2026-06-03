export const uiText = {
  title: "Blindfold",
  subtitle: "Uma venda. Nenhuma saída visível.",
  narratorLabel: "Narrador",
  playerLabel: "Você",
  currentActionLabel: "Ação",
  historyTitle: "Sessão",
  historyCollapseLabel: "Fechar sessão",
  historyExpandLabel: "Abrir sessão",
  sidebarActionsLabel: "Controlos da sessão",
  mainAriaLabel: "Blindfold",
  historyAriaLabel: "Histórico de sessão",
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
  stateIndicatorsAriaLabel: "HUD de mapa e inventário",
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
  connectionError: "A ligação falhou. Só ouves a tua respiração."
};

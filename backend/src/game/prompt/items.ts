import { gameContent } from "../../../../shared/gameContent.ts";

function formatItemList(items: readonly string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function formatItemsSection() {
  const { itemPools } = gameContent;

  return `# ITENS INTERATIVOS

## Comuns

${formatItemList(itemPools.common)}

---

## Incomuns

${formatItemList(itemPools.uncommon)}

---

## Raros

${formatItemList(itemPools.rare)}`;
}

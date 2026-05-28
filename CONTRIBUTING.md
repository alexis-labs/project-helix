# Contribuir para Blindfold

Obrigado por quereres contribuir. Blindfold e pequeno de proposito: texto curto, atmosfera forte e codigo facil de ler.

## Como comecar

1. Faz fork do repositorio.
2. Cria uma branch com um nome claro, por exemplo `feature/history-beats` ou `fix/mobile-input`.
3. Instala dependencias:

```bash
npm run install:all
```

4. Corre o backend e o frontend em terminais separados:

```bash
npm run dev:backend
npm run dev:frontend
```

5. Antes de abrir PR, valida:

```bash
npm run build
```

## Onde editar

- Mundo, premissa e regras narrativas: `backend/src/game/world.ts`
- Prompt final enviado ao LLM: `backend/src/game/systemPrompt.ts`
- Respostas offline quando nao ha LLM: `backend/src/game/fallbackNarrator.ts`
- Texto inicial e mensagens de estado: `frontend/src/content/story.ts`
- Textos fixos da interface: `frontend/src/content/uiText.ts`
- Componentes visuais: `frontend/src/components/`

## Tipos de contribuicao bem-vindos

- Melhorias de atmosfera e escrita curta.
- Novos beats sensoriais que nao dependam de visao.
- Correcoes de UI responsiva.
- Melhorias de acessibilidade.
- Pequenas melhorias no backend e no fluxo LLM.
- Documentacao para pessoas novas no projeto.

## Diretrizes de historia

- O jogador esta vendado.
- Evita descricoes visuais diretas.
- Usa som, cheiro, toque, temperatura, respiracao e espaco.
- Mantem as respostas curtas.
- Da sempre uma pista pequena para a proxima acao.
- Nao resolves a fuga cedo demais.

## Pull requests

Mantem PRs pequenos quando possivel. Inclui:

- O que mudou.
- Como testar.
- Screenshots ou pequenos exemplos de texto quando muda UI ou narrativa.
- Qualquer impacto em `.env`, API ou estrutura de ficheiros.

## Reportar problemas

Usa os templates de issue em `.github/ISSUE_TEMPLATE/`. Para bugs, inclui passos para reproduzir, resultado esperado e resultado atual.

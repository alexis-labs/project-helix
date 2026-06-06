# Índice do Projeto — Blindfold

Referência rápida de ficheiros, funcionalidades e fluxo de dados.

## Raiz

| Ficheiro | Descrição |
|----------|-----------|
| `package.json` | Scripts de orquestração (`install:all`, `build`, `dev:*`, `restart:dev`) |
| `README.md` | Documentação principal |
| `INDEX.md` | Este índice |
| `AGENTS.md` | Instruções para agentes de código |
| `CONTRIBUTING.md` | Guia de contribuição |
| `CODE_OF_CONDUCT.md` | Código de conduta |
| `SECURITY.md` | Política de segurança |
| `SUPPORT.md` | Onde pedir ajuda |
| `.env.example` | Variáveis de ambiente do backend (OpenRouter, OpenAI, Groq, Gemini) |
| `scripts/restart-all.ps1` | Reinicia backend (3011) e frontend (5174) no Windows |

## Partilhado (`shared/`)

| Caminho | Descrição |
|---------|-----------|
| `types.ts` | `GameAttributes`, `GameStatus`, `AdventureSkill`, `SkillFolder`, `AdventureSkills` |
| `adventureSettings.ts` | `AdventureSettings`, `OPENROUTER_MODELS`, defaults de aparência e LLM |
| `narratorReply.ts` | `stripUiStateBlock`, `sanitizeNarratorReply` — limpa blocos `ESTADO_UI:` e metadados |
| `llmDebug.ts` | Tipos `LlmDebugPayload` e `LlmDebugRound` para o painel de debug |

## Backend (`backend/`)

| Caminho | Descrição |
|---------|-----------|
| `src/server.ts` | Express — `/api/health`, `/api/play`, `/api/summary`; loop de ferramentas de skills |
| `src/game/llmConfig.ts` | Provider, modelo, tokens e cliente OpenAI |
| `src/game/systemPrompt.ts` | `buildSystemPrompt`, `buildSummaryPrompt`, `normalizeAdventureSettings` |
| `src/game/skills.ts` | CRUD de skills, ferramentas LLM (`consultar_skill`, `guardar_skill`), auto-consulta |
| `src/game/gameState.ts` | Normalização de atributos e status recebidos da API |
| `src/game/llmDebug.ts` | Serialização de mensagens para payload de debug |
| `src/game/tokens.ts` | Estimativa de tokens de texto |
| `src/game/types.ts` | Tipos do backend (re-export de `shared/types.ts` + `ClientTurn`) |
| `tsconfig.json` | Configuração TypeScript do backend |

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Estado do LLM, modelos disponíveis, estimativa de tokens do system prompt |
| `POST` | `/api/play` | Turno do jogador → narração + `skillUpdates` + `usage` + `debug` |
| `POST` | `/api/summary` | Resumo de game over por causa (`fear`, `injuries`, `hunger`, `exhaustion`) |

## Frontend (`frontend/`)

| Caminho | Descrição |
|---------|-----------|
| `index.html` | Página HTML — ponto de entrada do Vite |
| `vite.config.ts` | Porta 5174, proxy `/api` → `127.0.0.1:3011`, alias `@shared` |
| `.env.example` | `VITE_API_URL` opcional (nota: comentário ainda referencia porta 3001) |
| `src/main.tsx` | Bootstrap React |
| `src/styles.css` | Estilos globais (dark/light, atmosférico) |
| `src/types.ts` | Tipos do frontend (re-export e extensões) |
| `src/vite-env.d.ts` | Tipos Vite |

### Componentes (`src/components/`)

| Caminho | Descrição |
|---------|-----------|
| `App.tsx` | Estado raiz: menu, jogo, settings, game over, pesquisa, sidebar |
| `MainMenu.tsx` | Novo jogo / continuar / sair; confirmação de overwrite |
| `GameHeader.tsx` | Título e subtítulo |
| `NarrationPanel.tsx` | Narração typewriter, ação atual, deltas de atributos, trigger de debug |
| `CommandInput.tsx` | Input do jogador + anel de uso de contexto |
| `HistoryPanel.tsx` | Barra lateral: tema, diário, áudio, sandbox, indicadores de estado |
| `StateIndicators.tsx` | Localização, inventário, resumo de vitais |
| `AttributeBars.tsx` | Barras de medo, ferimentos, fome, exaustão |
| `AttributeChangeOverlay.tsx` | Animação de mudanças de atributos no último turno |
| `AttributeChangeList.tsx` | Lista compacta de deltas +/- |
| `ContextUsageRing.tsx` | Anel SVG de % de contexto LLM estimado |
| `StorySearchBar.tsx` | Campo de pesquisa no histórico |
| `StorySearchResults.tsx` | Resultados filtrados com destaque |
| `DiaryHighlight.tsx` | Destaque `<mark>` em resultados de pesquisa |
| `SkillsPanel.tsx` | Vista in-game de skills/diário + adicionar manualmente |
| `AdventureSettingsPanel.tsx` | Sandbox completo: prompt, stats, items, location, skills, modelos, aparência |
| `GameOverPanel.tsx` | Ecrã de fim + resumo narrativo |
| `LlmDebugPanel.tsx` | Painel expansível com payload de debug por turno |
| `FontSizeSlider.tsx` | Escala de fonte 85–130% |
| `EreaderToneSlider.tsx` | Tom e-reader (sépia/brilho) 0–100% |
| `SettingsRangeSlider.tsx` | Slider genérico (line-height, largura, parâmetros LLM) |
| `AppearancePreview.tsx` | Pré-visualização ao vivo de tipografia nas definições |

### Skills workbench (`src/components/skills/`)

| Caminho | Descrição |
|---------|-----------|
| `SkillsWorkbench.tsx` | Layout com painéis redimensionáveis (árvore + editor) |
| `SkillsTreeSidebar.tsx` | Árvore de pastas/skills (`react-arborist`, drag-and-drop) |
| `SkillEditorPane.tsx` | Edição de skill ou pasta selecionada |
| `SkillContentEditor.tsx` | Editor Monaco (lazy) para conteúdo markdown |
| `SkillsQuickAdd.tsx` | Criação rápida de pasta ou skill |

### Conteúdo (`src/content/`)

| Caminho | Descrição |
|---------|-----------|
| `story.ts` | Texto inicial e mensagens de estado |
| `uiText.ts` | Textos fixos da interface |

### API (`src/api/`)

| Caminho | Descrição |
|---------|-----------|
| `play.ts` | `POST /api/play` — envia settings, skills, modelo; recebe reply, skillUpdates, usage, debug |
| `summary.ts` | `POST /api/summary` — resumo de game over |
| `health.ts` | `GET /api/health` — janela de contexto e estimativas |

### Áudio (`src/audio/`)

| Caminho | Descrição |
|---------|-----------|
| `useAmbientAudio.ts` | Web Audio (drones + ruído) + loop opcional `/bgm/Cold Interrogation.mp3` |

### Game logic (`src/game/`)

| Caminho | Descrição |
|---------|-----------|
| `initialState.ts` | `INITIAL_ATTRIBUTES`, `createNewGameState()` |
| `adventureSkills.ts` | CRUD de skills, templates, merge de updates do LLM |
| `skillsTree.ts` | Construção de árvore, paths de pastas, drag-move |
| `gameSave.ts` | Persistência `localStorage` v7; migrações de saves antigos |
| `attributes.ts` | Clamp 0–100, deteção de game over |
| `attributeChanges.ts` | Cálculo de deltas e formatação para pesquisa |
| `diaryEntries.ts` | Pares jogador+narrador; filtro para pesquisa |
| `contextTokens.ts` | Estimativa de tokens do próximo pedido |
| `appearance.ts` | Aplica tema, tom, fonte, line-height, largura, typeface, reduced-motion ao DOM |

### Hooks (`src/hooks/`)

| Caminho | Descrição |
|---------|-----------|
| `useFontScale.ts` | Escala de fonte + CSS var `--font-scale`; `localStorage` |
| `useEreaderTone.ts` | Tom e-reader; `localStorage` |
| `useSidebarResize.ts` | Barra lateral redimensionável 240–400px; `localStorage` |

## Fluxo de dados

```
MainMenu → App (novo/continuar de localStorage)
                ↓
Jogador → CommandInput → App.submitAction → POST /api/play
                ↓
server.ts → buildSystemPrompt → OpenAI (OpenRouter) + skill tools
                ↓
reply (sanitized) → NarrationPanel (typewriter)
                  → HistoryPanel (histórico)
                  → parse ESTADO_UI → attributes, status
                  → skillUpdates → adventureSkills merge
                  → debug → LlmDebugPanel
                ↓
attribute === 100 → GameOverPanel → POST /api/summary
```

## Portas e proxy

| Serviço | Porta | Notas |
|---------|-------|-------|
| Backend | **3011** | `PORT` em `.env` ou default em `server.ts` |
| Frontend dev | **5174** | `strictPort: true` em `vite.config.ts` |
| Frontend preview | **4173** | `npm --prefix frontend run preview` |
| Proxy Vite | `/api` → `127.0.0.1:3011` | Em dev, `VITE_API_URL` normalmente não é necessário |

## Scripts úteis

```bash
npm run install:all      # Instala dependências de backend e frontend
npm run dev:backend      # Backend em modo watch (porta 3011)
npm run dev:frontend     # Compila TS + Vite dev (porta 5174)
npm run build            # Build de produção completo
npm run restart:dev      # Mata processos nas portas 3011/5174 e reinicia (Windows)
```

## Dependências notáveis (frontend)

| Pacote | Uso |
|--------|-----|
| `@monaco-editor/react` | Editor de conteúdo de skills |
| `react-arborist` | Árvore de pastas/skills |
| `react-resizable-panels` | Layout do skills workbench |
| `lucide-react` | Ícones da UI |

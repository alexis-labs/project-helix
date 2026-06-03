# Índice do Projeto — Blindfold

Referência rápida de ficheiros e pastas.

## Raiz

| Ficheiro | Descrição |
|----------|-----------|
| `package.json` | Scripts de orquestração (`install:all`, `build`, `dev:*`) |
| `README.md` | Documentação principal |
| `INDEX.md` | Este índice |
| `AGENTS.md` | Instruções para agentes de código |
| `CONTRIBUTING.md` | Guia de contribuição |
| `CODE_OF_CONDUCT.md` | Código de conduta |
| `SECURITY.md` | Política de segurança |
| `SUPPORT.md` | Onde pedir ajuda |

## Backend (`backend/`)

| Caminho | Descrição |
|---------|-----------|
| `src/server.ts` | Servidor Express — endpoints `/api/health`, `/api/play` e `/api/summary` |
| `src/game/llmConfig.ts` | Configuracao LLM (provider, modelo, tokens) |
| `src/game/prompt/` | Secções modulares do prompt e compositor `buildSystemPrompt` |
| `src/game/gameState.ts` | Normalizacao de atributos e status recebidos da API |
| `src/game/types.ts` | Tipos do backend (re-export de `shared/types.ts`) |
| `tsconfig.json` | Configuração TypeScript do backend |

## Partilhado (`shared/`)

| Caminho | Descrição |
|---------|-----------|
| `gameContent.ts` | Atributos, inventario, memoria inicial, personagem e item pools |
| `types.ts` | Tipos partilhados entre frontend e backend |

## Frontend (`frontend/`)

| Caminho | Descrição |
|---------|-----------|
| `index.html` | Página HTML — ponto de entrada do Vite |
| `src/main.tsx` | Bootstrap React |
| `src/styles.css` | Estilos globais (dark, atmosférico) |
| `src/types.ts` | Tipos partilhados do frontend |
| **Componentes** | |
| `src/components/App.tsx` | Componente raiz — estado principal do jogo |
| `src/components/GameHeader.tsx` | Título + botão de áudio ambiente |
| `src/components/NarrationPanel.tsx` | Painel de narração com efeito typewriter |
| `src/components/HistoryPanel.tsx` | Barra lateral de histórico colapsável |
| `src/components/CommandInput.tsx` | Formulário de input do jogador |
| **Conteúdo** | |
| `src/content/story.ts` | Texto inicial e mensagens de estado |
| `src/content/uiText.ts` | Textos fixos da interface |
| **API** | |
| `src/api/play.ts` | Chamada fetch ao endpoint `/api/play` |
| **Áudio** | |
| `src/audio/useAmbientAudio.ts` | Hook de áudio ambiente |

## Fluxo de dados

```
Jogador → CommandInput → App.submitAction → fetch /api/play
                                                  ↓
                              server.ts → buildSystemPrompt → OpenAI (ou fallback)
                                                  ↓
                              reply → NarrationPanel (typewriter)
                                    → HistoryPanel (lista)
```

## Scripts úteis

```bash
npm run install:all      # Instala dependências de backend e frontend
npm run dev:backend      # Backend em modo watch (porta 3001)
npm run dev:frontend     # Frontend Vite (porta 5173)
npm run build            # Build de produção completo
```

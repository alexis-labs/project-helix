# AGENTS.md — Instruções para agentes de código

Este ficheiro orienta agentes de IA (Copilot, Claude, etc.) que trabalhem neste repositório.

## Contexto do projeto

**Blindfold** é um jogo de terror psicológico interativo em texto. O jogador está vendado — não vê nada. Interage através de perguntas e ações; o narrador responde com texto curto, tenso e sensorial.

- Stack: React 19 + Vite 7 (frontend), Express + OpenAI SDK (backend), TypeScript
- Monorepo simples com `backend/`, `frontend/` e `shared/` — orquestrado por scripts npm na raiz
- Persistência em `localStorage` durante a sessão do browser (save v7); sem base de dados no servidor
- LLM via OpenRouter por defeito; qualquer endpoint compatível com OpenAI funciona via `OPENAI_BASE_URL`

### Funcionalidades principais

- **Sandbox narrativo** — `AdventureSettingsPanel` com prompt, stats, inventário, localização, modelos e aparência
- **Skills / diário** — árvore de pastas, editor Monaco, ferramentas LLM no backend (`consultar_skill`, `guardar_skill`)
- **Atributos** — medo, ferimentos, fome, exaustão (0–100); game over e resumo via `/api/summary`
- **Aparência** — tema, tom e-reader, escala de fonte, tipografia, movimento reduzido
- **Debug LLM** — payload completo por turno (mensagens, ferramentas, modelo)
- **Pesquisa** — histórico de turnos com destaque
- **Áudio ambiente** — synth + BGM opcional

## Convenções de código

### Geral

- TypeScript estrito em ambos os pacotes
- ESM (`"type": "module"`) em ambos
- Sem classes — funções e tipos apenas
- Nomes de variáveis e funções em inglês
- Comentários e textos de UI em português
- Tipos partilhados em `shared/`; alias `@shared` no Vite

### Frontend

- React funcional com hooks
- Sem state managers externos — `useState` + lifting state em `App.tsx`
- CSS puro num único ficheiro (`styles.css`) — sem CSS-in-JS, sem Tailwind
- Ícones via `lucide-react`
- Compilação intermediária (`npm run compile`) antes do Vite servir ou fazer build
- Dependências UI adicionais: `@monaco-editor/react`, `react-arborist`, `react-resizable-panels`

### Backend

- Express com `--experimental-strip-types` em dev (sem transpilação)
- `tsc` apenas para build de produção
- Sem ORM, sem base de dados
- Respostas JSON simples
- Fallback obrigatório quando não há chave API — resposta vazia, sem erro
- Configuração LLM em `backend/src/game/llmConfig.ts`
- Prompt narrativo e normalização de settings em `backend/src/game/systemPrompt.ts`
- Lógica de skills e ferramentas LLM em `backend/src/game/skills.ts`
- Estado inicial do jogo em `frontend/src/game/initialState.ts` (não em `shared/`)

## Regras importantes

1. **Não adicionar dependências** sem necessidade clara. Preferir o que já existe.
2. **Não usar Tailwind, styled-components ou CSS modules.** Os estilos são globais em `styles.css`.
3. **Não criar ficheiros de teste** a menos que pedido — ainda não há framework de testes configurada.
4. **Respeitar a estética dark/atmosférica** — cores quentes sobre fundo escuro, tipografia monospace (configurável pelo jogador).
5. **Manter respostas curtas** — na narrativa e no código. Menos é mais.
6. **Não expor segredos** — chaves API nunca aparecem em código ou logs.
7. **Não inventar ficheiros removidos** — `shared/gameContent.ts` e `backend/src/game/prompt/` já não existem.

## Como correr

```bash
npm run install:all
npm run dev:backend      # Terminal 1 — porta 3011
npm run dev:frontend     # Terminal 2 — porta 5174
```

Validar antes de PR:

```bash
npm run build
```

## Estrutura de decisão

| Quero... | Edito... |
|----------|----------|
| Mudar modelo, temperature ou limite de tokens (env) | `backend/src/game/llmConfig.ts` |
| Mudar modelos disponíveis na UI | `shared/adventureSettings.ts` (`OPENROUTER_MODELS`) |
| Mudar regras do narrador, prompt base ou formato de resposta | `backend/src/game/systemPrompt.ts` |
| Mudar ferramentas de skills ou auto-consulta | `backend/src/game/skills.ts` |
| Mudar atributos iniciais ou estado de novo jogo | `frontend/src/game/initialState.ts` |
| Mudar templates ou merge de skills | `frontend/src/game/adventureSkills.ts` |
| Mudar persistência ou migrações de save | `frontend/src/game/gameSave.ts` |
| Mudar parsing de `ESTADO_UI:` ou sanitização de reply | `shared/narratorReply.ts` + `frontend/src/components/App.tsx` |
| Mudar texto da UI | `frontend/src/content/uiText.ts` |
| Mudar narrativa inicial | `frontend/src/content/story.ts` |
| Mudar estilos visuais ou temas | `frontend/src/styles.css` + `frontend/src/game/appearance.ts` |
| Adicionar componente | `frontend/src/components/` |
| Mudar lógica de estado principal | `frontend/src/components/App.tsx` |
| Mudar endpoints ou loop de ferramentas | `backend/src/server.ts` |

## API — contratos atuais

- `GET /api/health` — estado LLM e modelos
- `POST /api/play` — body inclui `message`, `history`, `adventureSettings`, `skills`, `folders`, `attributes`, `status`, `model`; resposta inclui `reply`, `skillUpdates`, `usage`, `debug`
- `POST /api/summary` — body inclui `cause` (`fear` \| `injuries` \| `hunger` \| `exhaustion`), `history`, settings e skills; resposta `{ summary }`

Não documentar nem reintroduzir o campo `memory[]` — foi substituído por skills.

## LLM e providers

- Provider hardcoded como `"openrouter"` em `llmConfig.ts`; chave lida de `LLM_API_KEY` → `OPENROUTER_API_KEY` → `OPENAI_API_KEY`
- `LLM_PROVIDER` em `.env.example` é documentação — o código não o lê
- Para Gemini/Groq/OpenAI: configurar `OPENAI_BASE_URL` e a chave do provider
- O narrador pode devolver bloco `ESTADO_UI:` — o frontend extrai atributos e inventário

## Padrões de commit

- Mensagens em inglês, imperativo presente
- Prefixos: `feat:`, `fix:`, `style:`, `docs:`, `refactor:`, `chore:`
- Um commit por mudança lógica

## O que evitar

- Over-engineering (abstrações prematuras, patterns desnecessários)
- Adicionar bundlers, linters ou formatters sem ser pedido
- Mudar a identidade visual sem instrução explícita
- Criar documentação markdown para cada mudança feita
- Referenciar `shared/gameContent.ts` ou `backend/src/game/prompt/` em código ou docs novos

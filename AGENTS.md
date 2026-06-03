# AGENTS.md — Instruções para agentes de código

Este ficheiro orienta agentes de IA (Copilot, Claude, etc.) que trabalhem neste repositório.

## Contexto do projeto

**Blindfold** é um jogo de terror psicológico interativo em texto. O jogador está vendado — não vê nada. Interage através de perguntas e ações; o narrador responde com texto curto, tenso e sensorial.

- Stack: React 19 + Vite 7 (frontend), Express + OpenAI SDK (backend), TypeScript
- Monorepo simples com `backend/` e `frontend/` — orquestrado por scripts npm na raiz
- Sem base de dados — estado vive em memória durante a sessão

## Convenções de código

### Geral

- TypeScript estrito em ambos os pacotes
- ESM (`"type": "module"`) em ambos
- Sem classes — funções e tipos apenas
- Nomes de variáveis e funções em inglês
- Comentários e textos de UI em português

### Frontend

- React funcional com hooks
- Sem state managers externos — `useState` + lifting state
- CSS puro num único ficheiro (`styles.css`) — sem CSS-in-JS, sem Tailwind
- Ícones via `lucide-react`
- Compilação intermediária para `compiled/` antes do Vite servir

### Backend

- Express com `--experimental-strip-types` em dev (sem transpilação)
- `tsc` apenas para build de produção
- Sem ORM, sem base de dados
- Respostas JSON simples
- Fallback local obrigatório quando `OPENAI_API_KEY` está vazio
- Toda a configuracao LLM vive em `backend/src/game/llmConfig.ts`
- Prompt narrativo, mundo e regras vivem em `backend/src/game/prompt/`
- Conteudo inicial do jogo (atributos, inventario, memoria) vive em `shared/gameContent.ts`

## Regras importantes

1. **Não adicionar dependências** sem necessidade clara. O projeto é intencionalmente mínimo.
2. **Não usar Tailwind, styled-components ou CSS modules.** Os estilos são globais em `styles.css`.
3. **Não criar ficheiros de teste** a menos que pedido — ainda não há framework de testes configurada.
4. **Respeitar a estética dark/atmosférica** — cores quentes sobre fundo escuro, tipografia monospace.
5. **Manter respostas curtas** — na narrativa e no código. Menos é mais.
6. **Não expor segredos** — a chave API nunca aparece em código ou logs.

## Como correr

```bash
npm run install:all
npm run dev:backend      # Terminal 1
npm run dev:frontend     # Terminal 2
```

## Estrutura de decisão

| Quero... | Edito... |
|----------|----------|
| Mudar modelo, temperature ou limite de tokens | `backend/src/game/llmConfig.ts` |
| Mudar regras do narrador, atributos, NPCs ou formato de resposta | `backend/src/game/prompt/` |
| Mudar atributos iniciais, inventario, objectivos ou memoria inicial | `shared/gameContent.ts` |
| Adicionar respostas offline | `backend/src/server.ts` |
| Mudar texto da UI | `frontend/src/content/uiText.ts` |
| Mudar narrativa inicial | `frontend/src/content/story.ts` |
| Mudar estilos visuais | `frontend/src/styles.css` |
| Adicionar componente | `frontend/src/components/` |
| Mudar lógica de estado | `frontend/src/components/App.tsx` |

## Padrões de commit

- Mensagens em inglês, imperativo presente
- Prefixos: `feat:`, `fix:`, `style:`, `docs:`, `refactor:`, `chore:`
- Um commit por mudança lógica

## O que evitar

- Over-engineering (abstrações prematuras, patterns desnecessários)
- Adicionar bundlers, linters ou formatters sem ser pedido
- Mudar a identidade visual sem instrução explícita
- Criar documentação markdown para cada mudança feita

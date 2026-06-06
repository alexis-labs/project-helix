# Blindfold

Blindfold é um jogo web de terror psicológico interativo em texto.

O jogador acorda vendado numa casa abandonada. Não vê nada. Só pode perguntar, ouvir, tocar, chamar, seguir sons e tentar perceber onde está. O narrador responde com texto curto, tenso e sensorial.

## Estado do projeto

Jogo jogável em browser com sandbox narrativo, sistema de skills, persistência local e painel de debug LLM.

- Frontend: React 19, Vite 7, TypeScript
- Backend: Node.js 22, Express, TypeScript
- LLM: OpenAI SDK com OpenRouter por defeito (compatível com OpenAI, Groq e Gemini via `baseURL`)
- Fallback local: resposta vazia quando não há chave de API — permite testar a UI sem custos

### Funcionalidades

| Área | O que faz |
|------|-----------|
| **Jogo** | Menu principal (novo / continuar), narração com typewriter, input de comandos, histórico de turnos |
| **Atributos** | Medo, ferimentos, fome e exaustão (0–100); barras visuais, overlay de mudanças, game over ao atingir 100 |
| **Skills / diário** | Árvore de pastas e skills editáveis; o LLM consulta e grava skills via ferramentas; painel in-game e workbench nas definições |
| **Sandbox** | Painel de definições da aventura: prompt, stats, inventário, localização, skills, modelos AI e aparência |
| **Aparência** | Tema claro/escuro, tom e-reader, escala de fonte, altura de linha, largura de conteúdo, tipo de letra, movimento reduzido |
| **Áudio** | Ambiente sintético + loop opcional de BGM; toggle na barra lateral |
| **Pesquisa** | Pesquisa no histórico de turnos (diário) com destaque de resultados |
| **Contexto LLM** | Indicador de uso de contexto junto ao input; endpoint de health com estimativas |
| **Debug LLM** | Painel expansível com modelo, mensagens e rondas de ferramentas por turno |
| **Persistência** | Auto-gravação em `localStorage` (v7); continuar partida no menu |
| **Game over** | Ecrã final com resumo narrativo via `/api/summary` (LLM ou fallback local) |

## Documentação

| Ficheiro | Descrição |
|----------|-----------|
| [INDEX.md](INDEX.md) | Índice completo de ficheiros e fluxo de dados |
| [AGENTS.md](AGENTS.md) | Instruções para agentes de código (Copilot, Claude) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Como contribuir |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Código de conduta |
| [SECURITY.md](SECURITY.md) | Política de segurança |

## Demo local

Corre em dois terminais:

```bash
npm run dev:backend
npm run dev:frontend
```

Depois abre o URL indicado pelo Vite:

```txt
http://localhost:5174
```

A porta 5174 é fixa (`strictPort: true`). O Vite faz proxy de `/api` para o backend em `http://localhost:3011`.

Para reiniciar ambos os serviços (Windows):

```bash
npm run restart:dev
```

## Requisitos

- Node.js 22 recomendado
- npm
- Chave OpenRouter (ou outro provider compatível) opcional para respostas LLM reais

## Instalação

```bash
npm run install:all
```

Ou manualmente:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Configuração

Backend:

```bash
cp .env.example .env
```

Edita `.env`:

```txt
PORT=3011
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openrouter/free
OPENROUTER_API_KEY=
```

Cria uma chave em `https://openrouter.ai/keys` para testar via OpenRouter.
Deixa a chave vazia para usar o fallback local (resposta vazia) durante desenvolvimento.

O ficheiro `.env.example` inclui exemplos comentados para OpenAI, Groq e Google Gemini. O código usa `OPENAI_BASE_URL` e a chave correspondente — `LLM_PROVIDER` é apenas documentação.

Variáveis adicionais lidas pelo backend:

```txt
LLM_API_KEY=          # alternativa genérica à chave do provider
OPENAI_API_KEY=       # fallback se OPENROUTER_API_KEY estiver vazio
LLM_MAX_COMPLETION_TOKENS=1024
LLM_CONTEXT_WINDOW=128000
```

Frontend, apenas se o backend não estiver em `http://localhost:3011`:

```bash
cp frontend/.env.example frontend/.env
```

```txt
VITE_API_URL=http://localhost:3011
```

## Scripts

Na raiz do projeto:

```bash
npm run install:all
npm run build
npm run dev:backend      # porta 3011
npm run dev:frontend     # porta 5174
npm run restart:dev      # reinicia backend + frontend (PowerShell)
```

Também podes correr scripts diretamente:

```bash
npm --prefix backend run build
npm --prefix frontend run build
```

## Estrutura

Ver [INDEX.md](INDEX.md) para o índice completo.

```txt
.
|-- shared
|   |-- adventureSettings.ts
|   |-- llmDebug.ts
|   |-- narratorReply.ts
|   `-- types.ts
|-- backend
|   `-- src
|       |-- server.ts
|       `-- game
|           |-- gameState.ts
|           |-- llmConfig.ts
|           |-- llmDebug.ts
|           |-- skills.ts
|           |-- systemPrompt.ts
|           |-- tokens.ts
|           `-- types.ts
|-- frontend
|   `-- src
|       |-- api
|       |-- audio
|       |-- components
|       |-- content
|       |-- game
|       |-- hooks
|       |-- main.tsx
|       `-- styles.css
|-- AGENTS.md
|-- INDEX.md
`-- README.md
```

## Onde editar

- Configuração LLM (modelo, tokens, provider): `backend/src/game/llmConfig.ts`
- Prompt narrativo, regras e normalização de settings: `backend/src/game/systemPrompt.ts`
- Ferramentas e lógica de skills no backend: `backend/src/game/skills.ts`
- Modelos OpenRouter e defaults de aventura: `shared/adventureSettings.ts`
- Estado inicial do jogo (atributos, skills): `frontend/src/game/initialState.ts` e `frontend/src/game/adventureSkills.ts`
- Persistência local: `frontend/src/game/gameSave.ts`
- Texto inicial e mensagens de estado: `frontend/src/content/story.ts`
- Textos fixos da interface: `frontend/src/content/uiText.ts`
- Chamadas à API: `frontend/src/api/`
- Componentes da UI: `frontend/src/components/`
- Estilos globais: `frontend/src/styles.css`

## API

### `GET /api/health`

Resposta:

```json
{
  "ok": true,
  "llm": {
    "enabled": true,
    "model": "mistralai/mistral-nemo",
    "provider": "openrouter",
    "contextWindowTokens": 128000,
    "estimatedSystemPromptTokens": 0,
    "availableModels": []
  }
}
```

### `POST /api/play`

Pedido:

```json
{
  "message": "escuto atrás da porta",
  "history": [
    { "role": "player", "content": "onde estou?" },
    { "role": "narrator", "content": "..." }
  ],
  "adventureSettings": {
    "prompt": "",
    "skillsEnabled": true,
    "selectedModel": "mistralai/mistral-nemo",
    "appearance": { "theme": "dark" },
    "llm": { "temperature": 0.85, "maxCompletionTokens": 1024, "contextWindowTokens": 128000 }
  },
  "skills": [],
  "folders": [],
  "attributes": {
    "fear": 20,
    "injuries": 0,
    "hunger": 10,
    "exhaustion": 15
  },
  "status": {
    "location": "Abrigo da escola secundária",
    "inventory": ["Venda improvisada"]
  },
  "model": "mistralai/mistral-nemo"
}
```

Resposta:

```json
{
  "reply": "Ouves madeira a ranger do outro lado. Algo respira devagar, muito perto da porta.",
  "skillUpdates": [],
  "usage": {
    "promptTokens": 0,
    "totalTokens": 0,
    "contextLimit": 128000
  },
  "debug": {}
}
```

Sem chave LLM: `{ "reply": "", "skillUpdates": [] }`.

### `POST /api/summary`

Pedido (game over):

```json
{
  "cause": "fear",
  "history": [],
  "adventureSettings": {},
  "skills": [],
  "folders": [],
  "model": "mistralai/mistral-nemo"
}
```

`cause` aceita: `fear`, `injuries`, `hunger`, `exhaustion`.

Resposta:

```json
{
  "summary": "..."
}
```

## Regras narrativas

Blindfold funciona melhor quando a escrita respeita estas regras:

- O jogador não consegue ver.
- Não descrevas imagens diretamente.
- Usa som, cheiro, toque, temperatura, respiração e sensação espacial.
- Mantém respostas curtas.
- Não expliques regras ao jogador.
- Não digas que o narrador é uma IA.
- Cria tensão aos poucos.
- Dá sempre uma pista pequena para a próxima ação.

O narrador pode incluir um bloco `ESTADO_UI:` no final da resposta; o frontend extrai atributos, inventário e localização desse bloco.

## Como contribuir

Lê [CONTRIBUTING.md](CONTRIBUTING.md).

Para contexto técnico e decisões de design, consulta [AGENTS.md](AGENTS.md).

Contribuições bem-vindas:

- Bugs pequenos e reproduzíveis.
- Melhorias de acessibilidade.
- Beats narrativos sensoriais.
- Polimento visual.
- Documentação para novos contribuidores.
- Melhorias de prompts, skills e fallback offline.

Antes de abrir PR:

```bash
npm run build
```

## GitHub community

Este repo inclui:

- Templates de bug, feature e story idea.
- Template de pull request.
- GitHub Actions para build de backend e frontend.
- Dependabot semanal para dependências npm.
- Código de conduta, suporte e segurança.

## Roadmap curto

- Mais respostas fallback sem LLM.
- Testes automatizados para API e componentes principais.
- Melhor experiência mobile.
- Sincronização de saves entre dispositivos (requer backend com base de dados).

## Licença

Licença ainda por definir.

Antes de aceitar contribuições externas em escala, escolhe uma licença open source e adiciona um ficheiro `LICENSE`.

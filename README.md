# Blindfold

Blindfold e um MVP web de terror psicologico interativo em texto.

O jogador acorda vendado numa casa abandonada. Nao ve nada. So pode perguntar, ouvir, tocar, chamar, seguir sons e tentar perceber onde esta. O narrador responde com texto curto, tenso e sensorial.

## Estado do projeto

MVP jogavel em browser.

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- LLM: OpenAI API via `.env`
- Fallback local: permite testar o jogo sem chave de API

## Demo local

Corre em dois terminais:

```bash
npm run dev:backend
npm run dev:frontend
```

Depois abre o URL indicado pelo Vite, normalmente:

```txt
http://localhost:5173
```

Se a porta estiver ocupada, o Vite escolhe outra e mostra no terminal.

## Requisitos

- Node.js 22 recomendado
- npm
- Chave OpenAI opcional para respostas LLM reais

## Instalacao

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

## Configuracao

Backend:

```bash
cp .env.example .env
```

Edita `.env`:

```txt
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
PORT=3001
```

Deixa `OPENAI_API_KEY` vazio para usar o fallback local durante desenvolvimento.

Frontend, apenas se o backend nao estiver em `http://localhost:3001`:

```bash
cp frontend/.env.example frontend/.env
```

```txt
VITE_API_URL=http://localhost:3001
```

## Scripts

Na raiz do projeto:

```bash
npm run install:all
npm run build
npm run dev:backend
npm run dev:frontend
```

Tambem podes correr scripts diretamente:

```bash
npm --prefix backend run build
npm --prefix frontend run build
```

## Estrutura

```txt
.
|-- backend
|   `-- src
|       |-- game
|       |   |-- fallbackNarrator.ts
|       |   |-- systemPrompt.ts
|       |   |-- types.ts
|       |   `-- world.ts
|       `-- server.ts
|-- frontend
|   `-- src
|       |-- api
|       |-- components
|       |-- content
|       |-- main.tsx
|       `-- styles.css
|-- .github
|   |-- ISSUE_TEMPLATE
|   `-- workflows
|-- CONTRIBUTING.md
|-- CODE_OF_CONDUCT.md
|-- SECURITY.md
`-- README.md
```

## Onde editar

- Mundo, premissa e regras narrativas: `backend/src/game/world.ts`
- Prompt final enviado ao LLM: `backend/src/game/systemPrompt.ts`
- Respostas offline quando nao ha LLM: `backend/src/game/fallbackNarrator.ts`
- Texto inicial e mensagens de estado: `frontend/src/content/story.ts`
- Textos fixos da interface: `frontend/src/content/uiText.ts`
- Chamada ao endpoint: `frontend/src/api/play.ts`
- Componentes da UI: `frontend/src/components/`
- Estilos globais: `frontend/src/styles.css`

## API

### `POST /api/play`

Pedido:

```json
{
  "message": "escuto atras da porta",
  "history": []
}
```

Resposta:

```json
{
  "reply": "Ouves madeira a ranger do outro lado. Algo respira devagar, muito perto da porta."
}
```

## Regras narrativas

Blindfold funciona melhor quando a escrita respeita estas regras:

- O jogador nao consegue ver.
- Nao descrevas imagens diretamente.
- Usa som, cheiro, toque, temperatura, respiracao e sensacao espacial.
- Mantem respostas curtas.
- Nao expliques regras ao jogador.
- Nao digas que o narrador e uma IA.
- Cria tensao aos poucos.
- Da sempre uma pista pequena para a proxima acao.

## Como contribuir

Le [CONTRIBUTING.md](CONTRIBUTING.md).

Contribuicoes bem-vindas:

- Bugs pequenos e reproduziveis.
- Melhorias de acessibilidade.
- Beats narrativos sensoriais.
- Polimento visual.
- Documentacao para novos contribuidores.
- Melhorias de prompts e fallback offline.

Antes de abrir PR:

```bash
npm run build
```

## GitHub community

Este repo inclui:

- Templates de bug, feature e story idea.
- Template de pull request.
- GitHub Actions para build de backend e frontend.
- Dependabot semanal para dependencias npm.
- Codigo de conduta, suporte e seguranca.

## Roadmap curto

- Melhor persistencia de estado narrativo.
- Mais respostas fallback sem LLM.
- Modo de debug para comparar prompt, historico e resposta.
- Testes automatizados para API e componentes principais.
- Melhor experiencia mobile.

## Licenca

Licenca ainda por definir.

Antes de aceitar contribuicoes externas em escala, escolhe uma licenca open source e adiciona um ficheiro `LICENSE`.

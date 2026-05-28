# Blindfold

Blindfold e um MVP de jogo web de terror psicologico em texto. O jogador acorda vendado numa casa abandonada e interage escrevendo perguntas ou acoes livres.

## Estrutura

```txt
/frontend
/backend
README.md
.env.example
```

## Ficheiros editaveis

- Prompt do narrador: `backend/src/game/systemPrompt.ts`
- Respostas fallback e beats da historia: `backend/src/game/story.ts`
- Texto inicial do jogador: `frontend/src/content/story.ts`
- Textos fixos da interface: `frontend/src/content/uiText.ts`
- Chamada ao endpoint do jogo: `frontend/src/api/play.ts`
- Componentes da UI: `frontend/src/components/`

Assim podes mudar prompt, historia ou UI sem abrir os ficheiros principais do servidor ou do ponto de entrada React.

## Requisitos

- Node.js 20+
- Uma chave de API no `.env` para usar o LLM

## Configuracao

```bash
cp .env.example .env
```

Preenche `OPENAI_API_KEY` no ficheiro `.env`.

O backend tambem tem um fallback local curto para o MVP continuar jogavel durante desenvolvimento quando a chave nao estiver definida.

Opcionalmente, define `VITE_API_URL` no frontend se o backend nao estiver em `http://localhost:3001`.

## Instalar

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Correr em desenvolvimento

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Abre `http://localhost:5173`.

Se a porta 5173 estiver ocupada, o Vite indica outra porta no terminal.

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

## Prompt do jogo

O backend usa um system prompt em portugues para manter a historia curta, coerente e sensorial: som, cheiro, toque, temperatura, respiracao e sensacao espacial, sem descrever imagens diretamente.

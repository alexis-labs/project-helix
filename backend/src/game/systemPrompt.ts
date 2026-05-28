import { gameWorld } from "./world.ts";

const rules = gameWorld.rules.map((rule) => `- ${rule}`).join("\n");

export const systemPrompt = `És o narrador de um jogo de terror psicológico chamado ${gameWorld.title}.

${gameWorld.premise}

${gameWorld.interaction}
${gameWorld.narratorGoal}

Regras:
${rules}

Responde apenas com texto narrativo.`;

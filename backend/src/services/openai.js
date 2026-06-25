let openai = null;

async function getClient() {
  if (!openai) {
    const { default: OpenAI } = await import('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

const SYSTEM_PROMPT =
  'Eres un coach de productividad y entrenamiento. Ayudas a los usuarios con técnicas Pomodoro, Tabata, gestión de tareas, y motivación. Respondes en español de forma concisa y práctica.';

export async function streamChat(messages, onChunk) {
  const client = await getClient();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const stream = await client.chat.completions.create({
    model,
    stream: true,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
  });

  let fullResponse = '';

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      onChunk(content);
    }
  }

  return fullResponse;
}

const responses = {
  // Saludos
  hello: [
    '¡Hola! Soy tu asistente de productividad. ¿En qué puedo ayudarte?',
    '¡Bienvenido! Prueba preguntarme sobre Pomodoro, Tabata, o cómo organizar tus tareas.',
  ],

  // Pomodoro
  pomodoro: [
    '🍅 **Método Pomodoro**: Trabaja en bloques de 25 minutos (enfoque total), luego descansa 5 minutos. Cada 4 bloques, tómate un descanso largo de 15-30 minutos. Ideal para mantener la concentración sin quemarte.',
    '💡 **Tips Pomodoro**: 1) Elimina distracciones antes de empezar. 2) Si algo interrumpe tu enfoque, anótalo y retomálo después. 3) Usa los descansos para estirarte o hidratarte.',
    '⏱️ **¿Sabías que...?** El Pomodoro fue creado por Francesco Cirillo en los 80s, y debe su nombre a un timer de cocina con forma de tomate 🍅.',
  ],

  // Tabata
  tabata: [
    '🥊 **Método Tabata**: Entrenamiento de intervalos de alta intensidad (HIIT). Trabajás a máxima intensidad por 3 minutos, descansás 1 minuto, y repetís. Ideal para mejorar resistencia y quemar grasa.',
    '💪 **Tip Tabata**: Mantené una intensidad que te permita completar todos los rounds. Mejor hacer menos rounds bien hechos que muchos con mala técnica.',
    '🔥 **¿Sabías que...?** El Tabata fue desarrollado por el Dr. Izumi Tabata para el equipo de speed skating japonés. ¡Un estudio de 1996 demostró que mejora tanto el sistema aeróbico como el anaeróbico!',
  ],

  // Tareas
  tasks: [
    '📋 **Gestión de Tareas**: Usá la lista de tareas para organizar tu día. Asigná prioridades y categorías para mantener el foco en lo importante.',
    '🎯 **Prioridades**: Marcá tus tareas como Alta, Media o Baja. Atacá las de alta prioridad en tu primer Pomodoro del día.',
    '✅ **Tip**: Al final del día, revisá tus tareas completadas y prepará la lista del día siguiente. ¡La consistencia gana!',
  ],

  // Calculadora
  calculator: [
    '🧮 **Calculadora**: Usá la calculadora científica para tus cálculos. Tenés modo básico y científico con funciones trigonométricas, logaritmos y más.',
    '💡 **Tip**: Podés usar el teclado físico para escribir expresiones más rápido. Y el historial guarda tus últimos 100 cálculos.',
  ],

  // Respiración
  breathing: [
    '🌬️ **Ejercicio de respiración 4-7-8**: 1) Inhalá por la nariz contando 4 segundos. 2) Mantené la respiración contando 7 segundos. 3) Exhalá por la boca contando 8 segundos. Repetí 4 veces. ¡Ideal entre sesiones de trabajo!',
    '🧘‍♂️ **Técnica de respiración de caja**: 1) Inhalá 4 segundos. 2) Mantené 4 segundos. 3) Exhalá 4 segundos. 4) Mantené 4 segundos. Perfecto para calmar la ansiedad.',
  ],

  // Productividad general
  tips: [
    '🚀 **Regla de los 2 minutos**: Si una tarea te lleva menos de 2 minutos, hacela ahora. No la postergues.',
    '🎯 **Ley de Parkinson**: El trabajo se expande hasta ocupar todo el tiempo disponible. Ponete plazos más cortos para ser más eficiente.',
    '📊 **Regla 80/20**: El 80% de los resultados vienen del 20% del esfuerzo. Identificá qué tareas son ese 20% y priorizalas.',
    '💤 **Descanso activo**: Entre sesiones de trabajo, movete. 5 minutos de estiramientos mejoran tu circulación y concentración.',
  ],

  // FAQ general
  help: [
    '🤖 **Comandos disponibles**: Preguntame sobre:\n• "pomodoro" - Técnica y tips\n• "tabata" - Entrenamiento HIIT\n• "tareas" - Gestión de tareas\n• "calculadora" - Cómo usarla\n• "respiración" - Ejercicios\n• "tips" - Consejos de productividad',
  ],

  // Default
  default: [
    'No entendí tu consulta. Podés preguntarme sobre **Pomodoro**, **Tabata**, **tareas**, **calculadora**, **respiración** o pedir **tips de productividad**.',
  ],
}

export function getResponse(input) {
  const lower = input.toLowerCase()

  if (/\b(hola|hey|buenas|hello|hi)\b/.test(lower)) {
    return pickRandom(responses.hello)
  }
  if (/\b(pomodoro|tomate|focus|enfoque|25|cirillo)\b/.test(lower)) {
    return pickRandom(responses.pomodoro)
  }
  if (/\b(tabata|pelea|peleador|hiit|round|entrenamiento|ejercicio)\b/.test(lower)) {
    return pickRandom(responses.tabata)
  }
  if (/\b(tarea|task|lista|pendiente|quehacer)\b/.test(lower)) {
    return pickRandom(responses.tasks)
  }
  if (/\b(calculadora|calculo|math|matemática|número|calc)\b/.test(lower)) {
    return pickRandom(responses.calculator)
  }
  if (/\b(respira|respiracion|breathing|meditar|calmar|relajar)\b/.test(lower)) {
    return pickRandom(responses.breathing)
  }
  if (/\b(tip|consejo|productividad|ayuda|como|qué es|qué son)\b/.test(lower)) {
    return pickRandom(responses.tips)
  }
  if (/\b(ayuda|help|comandos|qué hacer|menu)\b/.test(lower)) {
    return pickRandom(responses.help)
  }

  return pickRandom(responses.default)
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Chatbot adapter interface — ready for future API/webhook
export class ChatbotAdapter {
  async getResponse(input) {
    // Current: static response matching
    return getResponse(input)
  }

  // Future:
  // async setApiEndpoint(url) { this.endpoint = url }
  // async getResponse(input) {
  //   const res = await fetch(this.endpoint, { method: 'POST', body: JSON.stringify({ message: input }) })
  //   return res.json()
  // }
}

export const chatbot = new ChatbotAdapter()

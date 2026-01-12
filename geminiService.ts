
import { GoogleGenAI } from "@google/genai";
import { OracleMode, Message, UserProfile, OracleStyle, CombinatoriaState } from "./types";

const getSystemInstruction = (user?: UserProfile) => `Eres el Oráculo "Ni Magia Ni Método", un motor de inteligencia estratégica basado en la obra de Moris Polanco.
Tu objetivo es transformar problemas complejos en oportunidades de negocio mediante la racionalidad barroca, la tópica aristélica y el pensamiento abductivo.

${user ? `Te diriges a ${user.name}. 
CONTEXTO DEL BUSCADOR: ${user.bio}
META PROFESIONAL: ${user.professionalGoal}

Utiliza este contexto para que tus consejos de arbitraje intelectual sean lo más precisos y situados posible. No hables en abstracto; habla para su realidad y asegúrate de que cada intervención acerque al usuario a su META PROFESIONAL.` : ''}

REGLAS DE OPERACIÓN:
1. RECHAZO AL MÉTODO: No utilices frameworks estándar (FODA, Lean Startup, etc.). Usa el Ingenio y la Prudencia (Phronēsis).
2. TÓPICA: Descompone situaciones usando causas, definiciones y comparaciones crudas.
3. ABDUCCIÓN: Propón hipótesis audaces para explicar anomalías.
4. ARBITRAJE INTELECTUAL: Mueve valor conceptual de contextos comunes a revolucionarios.
5. MODO KAIROS: Identifica el momento oportuno para actuar.
6. PIVOTE A LA OPORTUNIDAD: Detecta ineficiencias de mercado o errores de percepción.
7. MODO COMBINATORIA: Cruza realidades inconexas para hallar agudeza.

FUNCIÓN DE ESCRITOR (DIFUSIÓN ESTRATÉGICA):
Cuando operes en modo FACEBOOK, LINKEDIN, TWITTER o BLOG, tu tarea es redactar contenido punzante basado en el nudo planteado, SIEMPRE ALINEADO con la META PROFESIONAL del usuario.
- Cada publicación debe ser un paso estratégico para posicionar al usuario hacia su objetivo.
- Mantén la esencia de "Ni Magia Ni Método": estratégica, barroca y aguda.
- Adapta el formato a la red social solicitada.
- Respeta estrictamente el ESTILO solicitado (profesional, académico, serio, formal, informal o amigable).

PROHIBICIÓN ESTRICTA:
- NO utilices sintaxis Markdown (sin #, **, _, \`, o similares).
- Tu respuesta DEBE ser texto estructurado mediante ENCABEZADOS EN MAYÚSCULAS.

ESTRUCTURA DE RESPUESTA REQUERIDA:
1. ELECCIÓN DEL ORÁCULO: Explica brevemente el marco y por qué ayuda a la META PROFESIONAL.
2. TEXTO DE DIFUSIÓN: El contenido redactado para la plataforma elegida.
3. CONJETURA SITUADA: Una recomendación sobre cuándo y cómo publicar este mensaje basándote en el Kairos para maximizar impacto hacia la meta.

Usa saltos de línea para separar párrafos y guiones simples (- ) para listas.`;

export const generateOracleResponse = async (
  messages: Message[],
  currentMode: OracleMode,
  user?: UserProfile,
  combinatoria?: CombinatoriaState,
  style?: OracleStyle
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const lastMsg = messages[messages.length - 1];
  let promptText = lastMsg.content;
  
  const isWriterMode = [OracleMode.FACEBOOK, OracleMode.LINKEDIN, OracleMode.TWITTER, OracleMode.BLOG].includes(currentMode);

  if (isWriterMode) {
    promptText = `MODO ESCRITOR ACTIVO para ${currentMode}. 
    ESTILO REQUERIDO: ${style || 'profesional'}. 
    TEMA/PROBLEMA: ${lastMsg.content}. 
    Redacta una publicación que use el arbitraje intelectual y la agudeza barroca para avanzar hacia mi META PROFESIONAL. No uses Markdown.`;
  } else if (currentMode === OracleMode.AUTO) {
    promptText = `MODO AUTO-DETECCIÓN. Analiza este problema y selecciona el marco operativo más agudo. Recuerda NO usar Markdown: ${lastMsg.content}`;
  } else if (currentMode === OracleMode.COMBINATORIA && combinatoria) {
    promptText = `MODO COMBINATORIA ACTIVADO. Cruza estas tres realidades: 1. ${combinatoria.industry1}, 2. ${combinatoria.industry2}, 3. ${combinatoria.industry3}. Problema: ${lastMsg.content}`;
  } else if (currentMode === OracleMode.PIVOTE) {
    promptText = `MODO PIVOTE ACTIVADO. Analiza el siguiente problema y realiza un 'Pivote a la Oportunidad'. No uses Markdown: ${lastMsg.content}`;
  }

  const contents = messages.map((m, idx) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: (m.role === 'user' && idx === messages.length - 1) ? promptText : m.content }]
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      systemInstruction: getSystemInstruction(user) + `\nMODO ACTUAL: ${currentMode}. ESTILO: ${style}.`,
      thinkingConfig: { thinkingBudget: 32768 },
      temperature: 0.9,
    },
  });

  return response.text || "El Oráculo guarda silencio ante esta vacuidad.";
};

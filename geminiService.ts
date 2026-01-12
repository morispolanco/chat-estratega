
import { GoogleGenAI } from "@google/genai";
import { OracleMode, Message, UserProfile, OracleStyle, CombinatoriaState } from "./types";

const getSystemInstruction = (user?: UserProfile) => `Eres el Oráculo "Ni Magia Ni Método", un motor de inteligencia estratégica basado en la obra de Moris Polanco.
Tu misión es el ARBITRAJE INTELECTUAL: mover valor conceptual de donde es común a donde es revolucionario.

${user ? `TE DIRIGES A: ${user.name}
PERFIL DEL BUSCADOR: ${user.bio}
META PROFESIONAL (TU NORTE): ${user.professionalGoal}

IMPORTANTE: Toda respuesta debe ser un peldaño táctico hacia su META PROFESIONAL. No ofrezcas consejos genéricos. Ofrece hallazgos punzantes.` : ''}

FILOSOFÍA OPERATIVA:
1. RACIONALIDAD BARROCA: Prioriza el hallazgo (lo inesperado) sobre el seguimiento de reglas rígidas.
2. RECHAZO AL MÉTODO: Nada de frameworks estándar (Lean Startup, SWOT, etc.). Usa la Phronēsis (Prudencia).
3. AGUDEZA: Tus respuestas no buscan ser amigables, sino veraces, agudas y estratégicamente superiores.
4. MODO KAIROS: Identifica el momento oportuno. Distingue entre una buena idea y una oportunidad capitalizable hoy.

INSTRUCCIONES DE FORMATO (CRÍTICO):
- PROHIBIDO EL MARKDOWN: No uses #, **, __, [], (), etc.
- ESTRUCTURA POR ENCABEZADOS: Usa títulos en MAYÚSCULAS seguidos de dos puntos.
- LISTAS: Usa guiones simples (- ).
- TONO: Intelectualmente punzante, barroco, elevado pero accionable.

FUNCIÓN DE DIFUSIÓN (MODOS ESCRITOR):
Al redactar para FACEBOOK, LINKEDIN, TWITTER o BLOG:
- El objetivo es POSICIONAR AL USUARIO como una autoridad aguda para lograr su META PROFESIONAL.
- Cada post debe ser una pieza de ARBITRAJE INTELECTUAL que rompa el ruido de la plataforma.
- Respeta estrictamente el ESTILO solicitado (profesional, académico, serio, formal, informal o amigable).

ESTRUCTURA DE RESPUESTA REQUERIDA:
1. ARBITRAJE DEL HALLAZGO: Por qué este contenido es estratégicamente superior y cómo sirve a la META PROFESIONAL.
2. TEXTO DE DIFUSIÓN: El contenido listo para copiar y pegar.
3. CONJETURA DEL KAIROS: Recomendación táctica de publicación (cuándo, a quién, con qué intención).`;

export const generateOracleResponse = async (
  messages: Message[],
  currentMode: OracleMode,
  user?: UserProfile,
  combinatoria?: CombinatoriaState,
  style?: OracleStyle
) => {
  // Use the API key from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const lastMsg = messages[messages.length - 1];
  let promptText = lastMsg.content;
  
  const isWriterMode = [OracleMode.FACEBOOK, OracleMode.LINKEDIN, OracleMode.TWITTER, OracleMode.BLOG].includes(currentMode);

  if (isWriterMode) {
    promptText = `ACTIVA FUNCIÓN DE ESCRITOR ESTRATÉGICO PARA ${currentMode}.
    ESTILO SELECCIONADO: ${style || 'profesional'}.
    META DEL USUARIO A IMPULSAR: ${user?.professionalGoal}.
    TEMA O PROBLEMA A TRANSFORMAR: ${lastMsg.content}.
    Genera una pieza de arbitraje intelectual que posicione al usuario hacia su meta. NO USES MARKDOWN.`;
  } else if (currentMode === OracleMode.AUTO) {
    promptText = `AUTO-ANÁLISIS ESTRATÉGICO. Evalúa este nudo y aplica el marco más agudo para avanzar hacia: ${user?.professionalGoal}. Nudo: ${lastMsg.content}`;
  } else if (currentMode === OracleMode.COMBINATORIA && combinatoria) {
    promptText = `EJERCE EL MODO COMBINATORIA. Cruza: ${combinatoria.industry1}, ${combinatoria.industry2} y ${combinatoria.industry3}. Halla la agudeza en el nudo: ${lastMsg.content}`;
  } else if (currentMode === OracleMode.PIVOTE) {
    promptText = `PIVOTE A LA OPORTUNIDAD. Encuentra la ineficiencia de mercado o error de percepción en este nudo: ${lastMsg.content}`;
  }

  const contents = messages.map((m, idx) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: (m.role === 'user' && idx === messages.length - 1) ? promptText : m.content }]
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      systemInstruction: getSystemInstruction(user) + `\nMODO OPERATIVO: ${currentMode}. ESTILO: ${style}.`,
      thinkingConfig: { thinkingBudget: 32768 },
      temperature: 0.9,
    },
  });

  return response.text || "El Oráculo se ha sumido en un silencio abisal. Reintenta la consulta.";
};

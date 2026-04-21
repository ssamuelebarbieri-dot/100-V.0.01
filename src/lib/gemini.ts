import { GoogleGenAI } from "@google/genai";
import { Task, UserStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getStudyTips = async (currentTasks: Task[], userStats?: UserStats) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Sei un esperto di efficienza nello studio e neuroscienze. 
  Contesto Utente: ${userStats ? `Lingua: ${userStats.language}, Età: ${userStats.age}, Scuola: ${userStats.school}` : "Non forniti"}
  Routine Utente: ${userStats?.routineDescription || "Non fornita"}
  Analizza queste attività: ${JSON.stringify(currentTasks)}. 
  Fornisci 3 consigli pratici per migliorare la concentrazione.
  
  IMPORTANTE: Adotta un approccio GRADUALE e SOSTENIBILE. Non proporre cambiamenti radicali se l'utente sembra all'inizio. I consigli devono essere facili da implementare.
  Considera i rischi dei contenuti brevi (TikTok/Reels) e adatta i suggerimenti all'età e al contesto dell'utente.
  
  Rispondi nella lingua dell'utente (${userStats?.language || 'italiano'}).
  Rispondi in formato JSON con un array di oggetti {title: string, content: string, category: 'efficiency' | 'concentration' | 'method'}.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching study tips:", error);
    return [];
  }
};

export const askAssistant = async (question: string, tasks: Task[], userContext?: string, userStats?: UserStats) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Sei l'assistente IA dell'app "100%". L'utente ti ha chiesto: "${question}".
  Contesto Utente: ${userStats ? `Lingua: ${userStats.language}, Età: ${userStats.age}, Scuola: ${userStats.school}` : "Non forniti"}
  Contesto attuale delle attività: ${JSON.stringify(tasks)}.
  Contesto utente (routine dettagliata): ${userContext || "Non fornito"}.
  
  IMPORTANTE: I tuoi consigli devono basarsi su studi scientifici riguardanti i disturbi dell'attenzione, in particolare quelli legati all'eccessivo consumo di contenuti brevi (short-form content come TikTok/Reels) che frammentano la concentrazione. Suggerisci tecniche per ricostruire l'attenzione profonda (Deep Work).
  
  REGOLE SPECIFICHE PER LA ROUTINE E APPROCCIO GRADUALE:
  1. ADOTTA UN APPROCCIO GRADUALE: Non pretendere troppo subito. Se lo studente ha difficoltà o una routine caotica, proponi cambiamenti piccoli e proporzionali. Deve essere FACILE iniziare per evitare che si arrenda.
  2. Analizza gli orari di sveglia/sonno e quelli scolastici (considerando le variazioni di durata tra i giorni).
  3. Se l'utente NON pratica attività fisica, chiedigli cosa gli piacerebbe fare e CONSIGLIAGLI un'attività specifica motivando la scelta in base al suo profilo.
  4. Considera gli hobby e il tempo di utilizzo del telefono/social per bilanciare la programmazione senza essere punitivo.
  5. Tieni conto del rendimento scolastico per calibrare l'intensità dello studio in modo sostenibile.
  
  Rispondi in modo conciso, motivante e professionale, aiutando l'utente a sfruttare il 100% del suo tempo e del suo cervello in modo sostenibile.
  Usa il formato Markdown per la risposta. Rispondi nella lingua dell'utente (${userStats?.language || 'italiano'}).`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Non sono riuscito a generare una risposta.";
  } catch (error) {
    console.error("Error asking assistant:", error);
    return "Errore nella comunicazione con l'assistente.";
  }
};

export const evaluateExitReason = async (reason: string) => {
  const model = "gemini-3-flash-preview";
  const prompt = `L'utente sta cercando di uscire dalla modalità "Focus" dell'app "100%". 
  La sua motivazione è: "${reason}".
  Rispondi come un coach motivazionale rigoroso ma empatico che vuole che l'utente sfrutti il 100% del suo potenziale.
  Se la ragione è valida (es. emergenza, pausa meritata), augura un buon riposo. 
  Se la ragione sembra una scusa o pigrizia, cerca di convincerlo a restare altri 5-10 minuti con una frase potente.
  Rispondi in massimo 2-3 frasi. Sii coerente con il brand "100%". Rispondi in italiano.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Il tuo potenziale ti aspetta. Sei sicuro di voler interrompere?";
  } catch (error) {
    console.error("Error evaluating exit reason:", error);
    return "La disciplina è la chiave del successo. Resta concentrato.";
  }
};

export const getSmartSchedule = async (currentTasks: Task[], userStats?: UserStats) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Sei un assistente IA per lo studio chiamato "100%". Il tuo obiettivo è far sfruttare all'utente il 100% del suo tempo e del suo cervello.
  Contesto Utente: ${userStats ? `Lingua: ${userStats.language}, Età: ${userStats.age}, Scuola: ${userStats.school}` : "Non forniti"}
  Analizza queste attività: ${JSON.stringify(currentTasks)}.
  Suggerisci gli orari ottimali per queste attività, tenendo conto dei picchi di produttività (solitamente al mattino per compiti complessi) e dei periodi di riposo.
  Adatta la programmazione all'età e al tipo di scuola.
  Per ogni suggerimento, spiega la ragione scientifica o basata sui dati in ${userStats?.language || 'italiano'}.
  Rispondi in formato JSON con un array di oggetti {taskId: string, suggestedStartTime: string, reasoning: string}. 
  Usa lo stesso formato ISO per le date.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching smart schedule:", error);
    return [];
  }
};

export const explainSchedule = async (tasks: Task[]) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Spiega perché hai programmato queste attività in questo modo: ${JSON.stringify(tasks)}. 
  Sii incoraggiante, ordinato e spiega la logica dietro l'alternanza tra studio e attività extra. 
  Rispondi in italiano.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Nessuna spiegazione disponibile.";
  } catch (error) {
    console.error("Error explaining schedule:", error);
    return "Errore nella generazione della spiegazione.";
  }
};

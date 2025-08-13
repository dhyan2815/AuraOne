// /services/chatHandler.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { processAIRequest } from "./aiService";

/**
 * Main orchestrator for handling a user message using the unified AI service.
 * Processes natural language requests through Gemini (with Qwen fallback) and stores results.
 */
export const handleSendMessage = async ({
  input,
  user,
  selectedSession,
  db,
  setInput,
  setLoading,
  setLoadingTimer,
  loadingTimer,
}: {
  input: string;
  user: any;
  selectedSession: string | null;
  db: any;
  setInput: (val: string) => void;
  setLoading: (val: boolean) => void;
  setLoadingTimer: (timer: NodeJS.Timeout | null) => void;
  loadingTimer: NodeJS.Timeout | null;
}) => {
  if (!input.trim() || !user || !selectedSession) return;

  const content = input.trim();
  const messagesRef = collection(
    db,
    "users",
    user.uid,
    "sessions",
    selectedSession,
    "messages"
  );

  const userMessage = { role: "user", content };

  await addDoc(messagesRef, {
    ...userMessage,
    createdAt: serverTimestamp(),
  });

  setInput("");

  const timer = setTimeout(() => setLoading(true), 300);
  setLoadingTimer(timer);

  try {
    // Use the unified AI service to process the request
    const resultText = await processAIRequest(content, user.uid, {
      preferModel: 'gemini', // Use Gemini as primary, Qwen as fallback
      maxRetries: 3,
    });

    const aiMessage = { role: "ai", content: resultText };
    await addDoc(messagesRef, {
      ...aiMessage,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("❌ Error in AI service:", error);
    
    // Provide user-friendly error message
    let errorMessage = "I couldn't process your request. Please try again.";
    if (error instanceof Error) {
      if (error.message.includes('API key not configured')) {
        errorMessage = "AI service is not properly configured. Please contact support.";
      } else if (error.message.includes('All AI models failed')) {
        errorMessage = "I'm having trouble connecting to my AI services. Please try again in a moment.";
      } else if (error.message.includes('CRUD operation failed')) {
        errorMessage = "I couldn't complete that action. Please check your request and try again.";
      }
    }
    
    await addDoc(messagesRef, {
      role: "ai",
      content: `Error: ${errorMessage} ⚠️`,
      createdAt: serverTimestamp(),
    });
  } finally {
    setLoading(false);
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      setLoadingTimer(null);
    }
  }
};

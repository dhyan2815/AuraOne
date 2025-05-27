// src/pages/Chat.tsx
import { useState } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Message = {
  role: "user" | "ai";
  content: string;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input.trim() };
    const typingMessage: Message = {
      role: "ai",
      content: "Typing response...",
    };

    setMessages((prev) => [...prev, newMessage, typingMessage]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", content: `You said: "${newMessage.content}"` },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-semibold">AI Chat</h1>
        </div>
      </div>

      {/* Chat box */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-card p-4 space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-lg px-4 py-2 rounded-lg ${
              msg.role === "user"
                ? "bg-primary-600 text-white self-end ml-auto"
                : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center border rounded-lg bg-white dark:bg-slate-800 shadow-card p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 bg-transparent outline-none text-slate-800 dark:text-slate-100"
        />
        <button
          onClick={handleSend}
          className="p-2 rounded-full text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chat;

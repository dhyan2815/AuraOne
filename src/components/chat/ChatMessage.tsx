import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Message } from "../../services/chatHandler";

interface ChatMessageProps {
  msg: Message;
  displayName: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ msg }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isUser = msg.role === "user";
  const tools = msg.metadata?.toolsUsed ?? [];
  const sources = msg.metadata?.sources ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex max-w-[680px] flex-col gap-2 ${isUser ? "self-end" : "self-start"}`}
    >
      {/* Tool steps and context sources, shown only where the message carries them */}
      {!isUser && (tools.length > 0 || sources.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {tools.map((tool: string, ti: number) => (
            <span key={ti} className="lm-chip lm-chip-a">{tool}</span>
          ))}
          {sources.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className="lm-chip lm-chip-a inline-flex items-center gap-1"
            >
              {sources.length} context {sources.length === 1 ? "source" : "sources"}
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {isExpanded && sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid gap-2 rounded-[22px] bg-step px-[18px] py-3.5 text-[15px]">
              {sources.map((source: { id: string; sourceType: string; title: string; content: string; similarity: number }, si: number) => (
                <div key={si}>
                  <b className="block">
                    {source.title || source.sourceType} · {(source.similarity * 100).toFixed(0)}% match
                  </b>
                  <span className="line-clamp-2 text-ink2">{source.content}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`rounded-[26px] px-5 py-3.5 text-[17px] ${
          isUser ? "bg-[#1F211E] text-white dark:bg-ink dark:text-water" : "bg-water text-ink"
        }`}
      >
        <div className="prose prose-sm max-w-none whitespace-pre-wrap break-words text-inherit prose-p:my-1 prose-headings:text-inherit prose-strong:text-inherit prose-a:text-inherit prose-li:text-inherit">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;

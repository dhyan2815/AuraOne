import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Search, Wrench, ChevronUp, ChevronDown, Database, ExternalLink } from "lucide-react";
import Logo from "../structure/Logo";
import { Message } from "../../services/chatHandler";

interface ChatMessageProps {
  msg: Message;
  displayName: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ msg, displayName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        msg.role === "ai" ? "bg-gradient-to-tr from-primary to-secondary text-white" : "glass border border-primary/20 text-primary"
      }`}>
        {msg.role === "ai" ? <Logo iconOnly iconClassName="w-4 h-4 filter brightness-0 invert" /> : <span className="text-[11px] font-bold">{displayName[0]}</span>}
      </div>
      
      <div className="flex flex-col gap-2 max-w-[85%]">
        <div className={`px-4 py-2.5 text-sm leading-relaxed ${
          msg.role === "user" 
            ? "bg-white dark:bg-primary text-black dark:text-white border border-primary/10 rounded-2xl rounded-tr-sm shadow-md" 
            : "bg-white dark:bg-slate-800 border border-primary/5 text-black dark:text-white rounded-2xl rounded-tl-sm"
        }`}>
          <div className="whitespace-pre-wrap break-words prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        </div>

        {/* Metadata / Sources UI */}
        {msg.role === "ai" && msg.metadata && (
          <div className="mt-1">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-all mb-2"
            >
              {msg.metadata.sources?.length ? <Search size={10} /> : <Wrench size={10} />}
              {msg.metadata.sources?.length ? `${msg.metadata.sources.length} Context Sources` : 'Agent Insights'}
              {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {msg.metadata.toolsUsed && msg.metadata.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {msg.metadata.toolsUsed.map((tool: string, ti: number) => (
                        <div key={ti} className="px-2 py-1 rounded bg-primary/5 border border-primary/10 flex items-center gap-1.5">
                          <Wrench size={10} className="text-primary" />
                          <span className="text-[9px] font-bold text-text-variant opacity-70">{tool}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {msg.metadata.sources && msg.metadata.sources.map((source: { id: string; sourceType: string; title: string; content: string; similarity: number }, si: number) => (
                    <div key={si} className="p-3 rounded-xl bg-white/5 border border-white/5 flex gap-3 group">
                      <Database size={14} className="text-primary/40 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-text-variant uppercase mb-1">
                          {source.sourceType} • {(source.similarity * 100).toFixed(0)}% Match
                        </p>
                        <p className="text-xs text-text opacity-70 line-clamp-2 italic">"{source.content}"</p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-all p-1 text-text-variant hover:text-primary">
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;

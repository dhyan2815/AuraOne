import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { AgentStep } from "../../services/agentOrchestrator";

interface StepTraceProps {
  steps: AgentStep[];
  live?: boolean; // Open while the agent is still working.
}

const label = (s: AgentStep) => {
  if (s.type === "thinking") return s.text;
  if (s.type === "tool_call") return `Calling ${s.name}`;
  return `${s.ok ? "✓" : "✗"} ${s.name}: ${s.summary}`;
};

// Collapsible chain-of-thought trace: plan sentences, tool calls and their results.
const StepTrace: React.FC<StepTraceProps> = ({ steps, live }) => {
  const [open, setOpen] = useState(false);
  if (steps.length === 0) return null;
  const expanded = live || open;

  return (
    <div className="rounded-[22px] bg-step px-[18px] py-3 text-[14px]">
      <button
        onClick={() => setOpen(!open)}
        disabled={live}
        aria-expanded={expanded}
        className="flex items-center gap-1 font-bold"
      >
        {live ? "Working…" : `${steps.filter(s => s.type === "tool_call").length} steps`}
        {!live && (expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </button>
      {expanded && (
        <ol className="mt-2 grid gap-1 text-ink2">
          {steps.map((s, i) => (
            <li key={i} className={s.type === "thinking" ? "italic" : s.type === "tool_result" && !s.ok ? "text-red-600" : ""}>
              {label(s)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default StepTrace;

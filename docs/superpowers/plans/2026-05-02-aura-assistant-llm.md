# Aura Assistant LLM Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Open Router (free-tier models) into Aura Assistant as a "Deep Reasoning" mode and a fallback for Gemini, with a "BRAIN" toggle and dynamic thinking animations.

**Architecture:** Fast-First dual-mode routing. Gemini handles JSON commands by default. Open Router handles free-form reasoning when manually toggled or as a fallback for Gemini safety/validation errors.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide React, Framer Motion, Supabase, Google Gemini API, Open Router API.

---

### Task 1: API Configuration Update

**Files:**
- Modify: `src/config/api.ts`

- [ ] **Step 1: Update API_CONFIG to include Open Router**
Modify `API_CONFIG` in `src/config/api.ts` to include the Open Router API key and URLs.

```typescript
export const API_CONFIG = {
  // ... existing keys
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
  OPENROUTER_API_URL: "https://openrouter.ai/api/v1/chat/completions",
  // ...
};
```

- [ ] **Step 2: Update validateApiKeys**
Add validation for the Open Router key.

- [ ] **Step 3: Update getAIConfig**
Expose Open Router configuration to the rest of the app.

```typescript
export const getAIConfig = () => {
  const validation = validateApiKeys();
  return {
    // ...
    openRouter: {
      enabled: !!API_CONFIG.OPENROUTER_API_KEY,
      apiKey: API_CONFIG.OPENROUTER_API_KEY,
      apiUrl: API_CONFIG.OPENROUTER_API_URL,
      model: "openrouter/auto",
    },
    // ...
  };
};
```

- [ ] **Step 4: Commit**
```bash
git add src/config/api.ts
git commit -m "feat: add Open Router to API configuration"
```

---

### Task 2: Service Layer Logic (Open Router & Routing)

**Files:**
- Modify: `src/services/aiService.ts`

- [ ] **Step 1: Implement callOpenRouterAPI**
Add the `callOpenRouterAPI` function to handle requests to Open Router.

```typescript
async function callOpenRouterAPI(prompt: string): Promise<string> {
  const AI_CONFIG = getAIConfig();
  if (!AI_CONFIG.openRouter.enabled) throw new Error('Open Router not configured');

  const response = await fetch(AI_CONFIG.openRouter.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.openRouter.apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'AuraOne'
    },
    body: JSON.stringify({
      model: AI_CONFIG.openRouter.model,
      messages: [
        { role: 'system', content: 'You are Aura, a professional assistant. Provide helpful, conversational responses.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error(`Open Router error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response from Neural Hub';
}
```

- [ ] **Step 2: Update processAIRequest for Dual-Mode Routing**
Modify `processAIRequest` to handle `mode: 'brain'` and implement the fallback logic.

- [ ] **Step 3: Commit**
```bash
git add src/services/aiService.ts
git commit -m "feat: implement Open Router service and dual-mode routing"
```

---

### Task 3: Handler Layer Update

**Files:**
- Modify: `src/services/chatHandler.ts`

- [ ] **Step 1: Update handleSendMessage Signature**
Add `isBrainMode: boolean` to the parameters of `handleSendMessage`.

- [ ] **Step 2: Update AI Processing Logic**
Pass `mode` in the options to `processAIRequest`.

```typescript
const resultText = await processAIRequest(content, user.id, { 
  mode: isBrainMode ? 'brain' : 'command' 
});
```

- [ ] **Step 3: Commit**
```bash
git add src/services/chatHandler.ts
git commit -m "feat: update chat handler to support brain mode"
```

---

### Task 4: UI Implementation (Toggle & Animations)

**Files:**
- Modify: `src/pages/Chat.tsx`

- [ ] **Step 1: Add Brain Mode State**
Add `const [isBrainMode, setIsBrainMode] = useState(false);` and a `thinkingStep` state for the animation.

- [ ] **Step 2: Implement BRAIN Toggle Component**
Add the toggle switch to the input bar UI.

- [ ] **Step 3: Update Loading Animation**
Cycle through the "Neural Handshake" steps when `loading` is true and `isBrainMode` is active (or during fallback).

- [ ] **Step 4: Update handleSend**
Pass the `isBrainMode` state to `handleSendMessage`.

- [ ] **Step 5: Commit**
```bash
git add src/pages/Chat.tsx
git commit -m "feat: add BRAIN toggle and neural handshake animations to Chat UI"
```

---

### Task 5: Final Validation

- [ ] **Step 1: Verify Command Mode**
Test: Ask "Create a task to buy milk".
Expected: Task created in DB, response confirms success.

- [ ] **Step 2: Verify Brain Mode**
Test: Toggle "BRAIN" ON and ask "What is quantum entanglement?".
Expected: Conversational response from Open Router, no JSON validation errors.

- [ ] **Step 3: Verify Fallback**
Test: Toggle "BRAIN" OFF and input a prompt that triggers a safety block or validation error.
Expected: Automatic switch to Open Router, response received.

- [ ] **Step 4: Commit**
```bash
git commit --allow-empty -m "chore: final validation complete"
```

// Render the public LandingPage marketing interface in the Living Map style: hero lobe, "Say it. Aura does it." demo, feature parts, testimonials and close.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Logo from "../components/structure/Logo";
import SiteFooter from "../components/structure/SiteFooter";

// List of client testimonials displayed dynamically.
const TESTIMONIALS = [
    {
        name: "Rajesh Verma",
        role: "Product Manager",
        content: "AuraOne has completely transformed how I manage my daily tasks and notes. The AI assistant is incredibly intuitive and saves me hours every week.",
    },
    {
        name: "Anjali Sharma",
        role: "Software Developer",
        content: "The real-time sync across all my devices is flawless. I can start a task on my phone and finish it on my laptop without any hassle.",
    },
    {
        name: "Amit Patel",
        role: "Marketing Director",
        content: "The calendar integration and smart reminders have made me so much more organized. AuraOne is exactly what I needed for my busy schedule.",
    },
    {
        name: "Dhairya Kumar",
        role: "Freelance Writer",
        content: "The rich text editor for notes is fantastic, and the AI chat feature helps me brainstorm ideas quickly. This is productivity software done right.",
    }
];

// Example sentences for the interactive demo — local UI state only, nothing is sent to Aura.
const DEMO_LINES = [
    { say: "remind me to buy groceries tomorrow", mode: "Command", steps: ["create_task", "due: tomorrow", "priority: medium"], reply: "Added Buy groceries to tomorrow's list." },
    { say: "push my review by half an hour", mode: "Command", steps: ["read_events", "update_event", "10:00 → 10:30"], reply: "Your review now starts at 10:30." },
    { say: "what did I decide about chunk overlap?", mode: "Brain", steps: ["search_knowledge", "3 notes", "0.82 match"], reply: "You settled on 512-token chunks with 64 overlap, from your note Chunking strategies." },
];

const PARTS = [
    { title: "Tasks", color: "tasks", text: "High, medium and low priority with due dates, completed in one tap.", radius: "48% 52% 40% 60% / 40% 44% 56% 60%" },
    { title: "Notes", color: "notes", text: "A rich text editor with tags, searchable by you and by Aura.", radius: "56% 44% 58% 42% / 52% 60% 40% 48%" },
    { title: "Events", color: "events", text: "A month calendar with today's schedule, created in plain words.", radius: "40% 60% 46% 54% / 58% 40% 60% 42%" },
    { title: "Knowledge", color: "know", text: "Your notes, tasks and events, chunked and embedded so Aura answers from what you actually wrote.", radius: "48% 52% 40% 60% / 40% 44% 56% 60%" },
];

// How the product works, in three steps.
const STEPS = [
    { n: "01", title: "Sign up free", text: "Create an account in seconds. Your workspace syncs in real time across every device." },
    { n: "02", title: "Fill your day", text: "Add tasks, write notes and schedule events yourself, or just tell Aura in plain words." },
    { n: "03", title: "Ask Aura", text: "Command Mode changes your data. Brain Mode answers from your own notes, tasks and events." },
];

// Facts about what powers AuraOne.
const FACTS = [
    { k: "ReAct", v: "agent loop with tool calls over your own data" },
    { k: "RAG", v: "personal knowledge base built from what you write" },
    { k: "Realtime", v: "Supabase auth and sync on every device" },
    { k: "Light + dark", v: "follows your system, switch any time" },
];

const LandingPage = () => {
    // Track the active testimonial and the selected demo sentence.
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [pick, setPick] = useState(0);

    // Spin up an interval timer to cycle testimonials automatically every 4 seconds.
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prevIndex) =>
                (prevIndex + 1) % TESTIMONIALS.length
            );
        }, 4000);

        // Terminate active timer intervals on unmount.
        return () => clearInterval(interval);
    }, []);

    const t = TESTIMONIALS[currentTestimonial];
    const cur = DEMO_LINES[pick];
    const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    const [weekday, ...dateRest] = today.replace(",", "").split(" ");

    return (
        <div className="sec-today min-h-screen bg-water font-sans text-ink">
            <div className="mx-auto max-w-[1440px] overflow-x-clip">
                {/* Header */}
                <header className="flex flex-wrap items-center gap-2 px-4 py-4 md:px-6">
                    <Link to="/" className="mr-4" aria-label="AuraOne home"><Logo textOnly /></Link>
                    <nav className="hidden gap-1.5 md:flex" aria-label="Sections">
                        <a className="lm-cap" href="#aura" style={{ "--c": "var(--aura)" } as React.CSSProperties}><i />Aura</a>
                        <a className="lm-cap" href="#parts" style={{ "--c": "var(--tasks)" } as React.CSSProperties}><i />Features</a>
                        <a className="lm-cap" href="#how" style={{ "--c": "var(--events)" } as React.CSSProperties}><i />How it works</a>
                        <a className="lm-cap" href="#voices" style={{ "--c": "var(--notes)" } as React.CSSProperties}><i />Stories</a>
                    </nav>
                    <div className="ml-auto flex gap-2">
                        <Link to="/login" className="lm-btn lm-btn-soft">Log in</Link>
                        <Link to="/signup" className="lm-btn">Sign up free</Link>
                    </div>
                </header>

                {/* Hero */}
                <section className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                    <div className="lm-lobe flex flex-col justify-center !w-auto !min-h-[480px] lg:!min-h-[calc(620px*var(--unzoom))] lg:!pl-[calc(132px*var(--unzoom))] lg:!pr-[calc(72px*var(--unzoom))] lg:!py-[calc(72px*var(--unzoom))]">
                        <h1 style={{ fontSize: "clamp(56px, 8.4vw, 128px)" }}>One map for your whole day</h1>
                        <p>Tasks, notes, events and news in one place, with Aura to add, move and find anything in plain words.</p>
                        <div className="lm-acts">
                            <Link to="/signup" className="lm-btn">Create your free account</Link>
                            <Link to="/login" className="lm-btn lm-btn-ghost">Log in</Link>
                        </div>
                    </div>

                    <div className="mx-4 grid gap-3.5 rounded-[32px] bg-sheet p-5 lg:mr-6" aria-label="AuraOne Today screen">
                        <div className="flex gap-1.5">
                            <span className="lm-cap on" style={{ "--c": "var(--today)" } as React.CSSProperties}><i />Today</span>
                            <span className="lm-cap !bg-step" style={{ "--c": "var(--tasks)" } as React.CSSProperties}><i />Tasks</span>
                            <span className="lm-cap !bg-step" style={{ "--c": "var(--aura)" } as React.CSSProperties}><i />Aura</span>
                        </div>
                        <div className="rounded-r-[60%] rounded-bl-none bg-today px-7 pb-9 pt-6 text-[#1F211E]" style={{ borderRadius: "0 60% 48% 0 / 0 70% 58% 0" }}>
                            <div className="lm-display text-[52px]">{weekday}<br />{dateRest.join(" ")}</div>
                        </div>
                        <div className="lm-sheet !bg-water">
                            <div className="lm-row"><span className="w-14 flex-none font-bold">10:30</span>Design review<span className="lm-chip lm-chip-a ml-auto">moved by Aura</span></div>
                            <div className="lm-row"><span className="lm-check" />Write up the chunking notes<span className="lm-chip lm-chip-h ml-auto">High</span></div>
                            <div className="lm-row"><span className="lm-check" />Buy groceries<span className="lm-muted ml-auto">Sun</span></div>
                        </div>
                    </div>
                </section>

                {/* Say it. Aura does it. */}
                <section className="px-4 pt-24 md:px-6 md:pt-36" id="aura">
                    <h2 className="lm-display max-w-[900px] text-[clamp(44px,5.6vw,84px)]">Say it. Aura does it.</h2>
                    <p className="mt-4 max-w-[620px] text-xl">Aura reads and changes your own tasks, notes and events. Pick a sentence and see what it would do.</p>
                    <div className="mt-10 grid gap-5 md:grid-cols-2">
                        <div className="grid content-start gap-2.5">
                            {DEMO_LINES.map((l, i) => (
                                <button
                                    key={l.say}
                                    aria-pressed={i === pick}
                                    onClick={() => setPick(i)}
                                    className={`lm-tile rounded-3xl px-[22px] py-[18px] text-left text-[19px] font-semibold active:scale-[.98] ${i === pick ? "bg-aura text-[#1F211E]" : "bg-sheet"}`}
                                >
                                    “{l.say}”
                                </button>
                            ))}
                        </div>
                        <div className="rounded-[32px] bg-ink p-7 text-water" aria-live="polite">
                            <p className="text-sm opacity-75">Aura · {cur.mode} mode</p>
                            <div className="mb-5 mt-3.5 flex flex-wrap gap-2">
                                {cur.steps.map((s) => <span key={s} className="lm-chip lm-chip-a">{s}</span>)}
                            </div>
                            <p className="text-[26px] font-semibold leading-[1.3]" style={{ letterSpacing: "-.02em" }}>{cur.reply}</p>
                        </div>
                    </div>
                </section>

                {/* Parts */}
                <section className="px-4 pt-24 md:px-6 md:pt-36" id="parts">
                    <h2 className="lm-display max-w-[900px] text-[clamp(44px,5.6vw,84px)]">Every part of your day, in its own colour</h2>
                    <div className="mt-10 grid gap-5 md:grid-cols-2">
                        {PARTS.map((p) => (
                            <div
                                key={p.title}
                                className="lm-tile min-h-[300px] px-8 py-12 text-[#1F211E] md:px-16 md:py-14"
                                style={{ background: `rgb(var(--${p.color}))`, borderRadius: p.radius }}
                            >
                                <h3 className="lm-display text-[44px] !leading-none !text-[#1F211E]">{p.title}</h3>
                                <p className="mt-2.5 max-w-[420px] text-lg">{p.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="px-4 pt-24 md:px-6 md:pt-36" id="how">
                    <h2 className="lm-display max-w-[900px] text-[clamp(44px,5.6vw,84px)]">Up and running in three steps</h2>
                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {STEPS.map((st) => (
                            <div key={st.n} className="lm-sheet lm-tile !p-8">
                                <span className="lm-display text-[56px]">{st.n}</span>
                                <h3 className="mt-2 text-2xl font-extrabold">{st.title}</h3>
                                <p className="mt-2 text-lg">{st.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Under the hood */}
                <section className="px-4 pt-24 md:px-6 md:pt-36" id="about">
                    <h2 className="lm-display max-w-[900px] text-[clamp(44px,5.6vw,84px)]">An assistant, not a chat box</h2>
                    <p className="mt-4 max-w-[680px] text-xl">Aura runs a ReAct agent loop with validated create, read, update and delete actions, grounded by your own knowledge base. Gemini answers first, with OpenRouter as fallback.</p>
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {FACTS.map((f) => (
                            <div key={f.k} className="lm-tile rounded-3xl bg-sheet p-6">
                                <p className="lm-display text-[34px]">{f.k}</p>
                                <p className="lm-muted mt-1.5">{f.v}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Voices */}
                <section className="px-4 pt-24 md:px-6 md:pt-36" id="voices">
                    <h2 className="lm-display max-w-[900px] text-[clamp(44px,5.6vw,84px)]">From early users</h2>
                    <div className="lm-sheet mt-10 !p-8 md:!px-14 md:!py-12">
                        <p className="max-w-[900px] text-[26px] font-semibold leading-[1.3] md:text-[30px]" style={{ letterSpacing: "-.02em" }}>“{t.content}”</p>
                        <div className="mt-5 flex items-center gap-2.5">
                            <span className="grid h-[42px] w-[42px] place-items-center rounded-full bg-ink font-extrabold text-water">{t.name.charAt(0)}</span>
                            <div>
                                <b>{t.name}</b><br />
                                <span className="lm-muted">{t.role}</span>
                            </div>
                            <div className="ml-auto flex gap-2">
                                <button className="lm-round !bg-step" aria-label="Previous story" onClick={() => setCurrentTestimonial((currentTestimonial + TESTIMONIALS.length - 1) % TESTIMONIALS.length)}><ChevronLeft size={20} /></button>
                                <button className="lm-round !bg-step" aria-label="Next story" onClick={() => setCurrentTestimonial((currentTestimonial + 1) % TESTIMONIALS.length)}><ChevronRight size={20} /></button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Close */}
                <section className="mx-4 mt-24 bg-today px-8 pb-12 pt-16 text-[#1F211E] md:mx-6 md:mt-36 md:px-[72px] md:pt-24" style={{ borderRadius: "0 48% 0 0 / 0 60% 0 0" }}>
                    <h2 className="lm-display !text-[#1F211E] text-[clamp(56px,8vw,120px)]">Start with today</h2>
                    <div className="lm-acts">
                        <Link to="/signup" className="lm-btn !bg-[#1F211E] !text-white">Create your free account</Link>
                        <Link to="/login" className="lm-btn lm-btn-ghost !bg-white/60 !text-[#1F211E]">I have an account</Link>
                    </div>
                    <p className="mt-16 font-extrabold leading-[.8] md:mt-20" style={{ fontSize: "clamp(90px, 17vw, 250px)", letterSpacing: "-.07em", fontStretch: "62%" }}>AuraOne</p>
                </section>

                <SiteFooter />
            </div>
        </div>
    );
};

export default LandingPage;

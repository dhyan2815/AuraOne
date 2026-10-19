// Render the public LandingPage marketing interface in the Living Map style: hero lobe, "Say it. Aura does it." demo, feature parts, testimonials and close.

import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
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

// radius and r2 are the two blob shapes each tile drifts between.
const PARTS = [
    { title: "Tasks", color: "tasks", text: "High, medium and low priority with due dates, completed in one tap.", radius: "48% 52% 40% 60% / 40% 44% 56% 60%", r2: "58% 42% 52% 48% / 52% 58% 42% 48%" },
    { title: "Notes", color: "notes", text: "A rich text editor with tags, searchable by you and by Aura.", radius: "56% 44% 58% 42% / 52% 60% 40% 48%", r2: "44% 56% 46% 54% / 44% 48% 52% 56%" },
    { title: "Events", color: "events", text: "A month calendar with today's schedule, created in plain words.", radius: "40% 60% 46% 54% / 58% 40% 60% 42%", r2: "52% 48% 56% 44% / 46% 54% 46% 54%" },
    { title: "Knowledge", color: "know", text: "Your notes, tasks and events, chunked and embedded so Aura answers from what you actually wrote.", radius: "48% 52% 40% 60% / 40% 44% 56% 60%", r2: "40% 60% 54% 46% / 56% 42% 58% 44%" },
];

// Header anchors; c is the section colour reused by the scroll-spy pill and progress rail.
const NAV = [
    { id: "aura", label: "Aura", c: "--aura" },
    { id: "parts", label: "Features", c: "--tasks" },
    { id: "how", label: "How it works", c: "--events" },
    { id: "voices", label: "Stories", c: "--notes" },
];

// How the product works, in three steps.
const STEPS = [
    { n: "01", title: "Sign up free", text: "Create an account in seconds. Your workspace syncs in real time across every device." },
    { n: "02", title: "Fill your day", text: "Add tasks, write notes and schedule events yourself, or just tell Aura in plain words." },
    { n: "03", title: "Ask Aura", text: "Command Mode changes your data. Brain Mode answers from your own notes, tasks and events." },
];

// Facts about what powers AuraOne.
const FACTS = [
    { k: "ReAct", v: "agent loop with tool calls over your own data", c: "--tasks" },
    { k: "RAG", v: "personal knowledge base built from what you write", c: "--notes" },
    { k: "Realtime", v: "Supabase auth and sync on every device", c: "--events" },
    { k: "Light + dark", v: "follows your system, switch any time", c: "--aura" },
];

// Fade-up on scroll into view; clip swaps it for a circle wipe. Wraps the element so the child's own hover transform is untouched.
const Reveal = ({ children, delay = 0, clip, className }: { children: ReactNode; delay?: number; clip?: boolean; className?: string }) => {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className={className}
            initial={reduce ? false : clip ? { opacity: 0, clipPath: "circle(0% at 50% 50%)" } : { opacity: 0, y: 32 }}
            whileInView={clip ? { opacity: 1, clipPath: "circle(150% at 50% 50%)" } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: clip ? 0.9 : 0.6, delay, ease: [0.2, 0.8, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
};

// Springs its child a little toward the cursor.
const Magnetic = ({ children }: { children: ReactNode }) => {
    const reduce = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 200, damping: 15 });
    const sy = useSpring(y, { stiffness: 200, damping: 15 });
    if (reduce) return <>{children}</>;
    return (
        <motion.span
            className="inline-block"
            style={{ x: sx, y: sy }}
            onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                x.set((e.clientX - r.left - r.width / 2) * 0.25);
                y.set((e.clientY - r.top - r.height / 2) * 0.25);
            }}
            onPointerLeave={() => { x.set(0); y.set(0); }}
        >
            {children}
        </motion.span>
    );
};

// Counts 0 → to once scrolled into view, padded to two digits.
const CountUp = ({ to }: { to: number }) => {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const [v, setV] = useState(reduce ? to : 0);
    useEffect(() => {
        if (!inView || reduce) return;
        const c = animate(0, to, { duration: 0.8, onUpdate: (l) => setV(Math.round(l)) });
        return () => c.stop();
    }, [inView, reduce, to]);
    return <span ref={ref}>{String(v).padStart(2, "0")}</span>;
};

// Soft colour glow that follows the pointer; the parent needs `isolate`, `relative` + `overflow-hidden`, and an onPointerMove that sets --gx/--gy.
const Glow = ({ c }: { c: string }) => (
    <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(260px circle at var(--gx, 50%) var(--gy, 50%), rgb(var(${c}) / .45), transparent 70%)` }}
    />
);

const trackGlow = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--gx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--gy", `${e.clientY - r.top}px`);
};

// "Say it. Aura does it." demo: steps pop in, the reply types out, then it moves to the next sentence until the visitor picks one.
const AuraDemo = () => {
    const reduce = useReducedMotion();
    const [pick, setPick] = useState(0);
    const [auto, setAuto] = useState(true);
    const [typed, setTyped] = useState(0);
    const cur = DEMO_LINES[pick];

    // Type the reply once its steps have shown.
    useEffect(() => {
        if (reduce) { setTyped(cur.reply.length); return; }
        setTyped(0);
        let iv = 0;
        const start = window.setTimeout(() => {
            let n = 0;
            iv = window.setInterval(() => {
                setTyped(++n);
                if (n >= cur.reply.length) clearInterval(iv);
            }, 22);
        }, 200 + cur.steps.length * 180);
        return () => { clearTimeout(start); clearInterval(iv); };
    }, [pick, reduce, cur]);

    // Advance on our own after a typed reply, until the visitor takes over.
    useEffect(() => {
        if (reduce || !auto || typed < cur.reply.length) return;
        const id = window.setTimeout(() => setPick((p) => (p + 1) % DEMO_LINES.length), 3200);
        return () => clearTimeout(id);
    }, [typed, auto, reduce, cur]);

    return (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="grid content-start gap-2.5">
                {DEMO_LINES.map((l, i) => (
                    <button
                        key={l.say}
                        aria-pressed={i === pick}
                        onClick={() => { setPick(i); setAuto(false); }}
                        className={`lm-tile relative overflow-hidden rounded-3xl px-[22px] py-[18px] text-left text-[19px] font-semibold active:scale-[.98] ${i === pick ? "bg-aura text-[#1F211E]" : "bg-sheet"}`}
                    >
                        “{l.say}”
                        {/* Countdown to the next sentence while auto-play is running. */}
                        {i === pick && auto && !reduce && typed >= cur.reply.length && (
                            <motion.span
                                key={pick}
                                aria-hidden
                                className="absolute inset-x-0 bottom-0 h-1 origin-left bg-[#1F211E]/30"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 3.2, ease: "linear" }}
                            />
                        )}
                    </button>
                ))}
            </div>
            <div className="group relative isolate overflow-hidden rounded-[32px] bg-ink p-7 text-water" onPointerMove={trackGlow}>
                <Glow c="--aura" />
                <p className="sr-only" aria-live="polite">{cur.mode} mode: {cur.reply}</p>
                <div aria-hidden>
                    <p className="text-sm opacity-75">Aura · {cur.mode} mode</p>
                    <div className="mb-5 mt-3.5 flex flex-wrap gap-2">
                        {cur.steps.map((s, i) => (
                            <motion.span
                                key={`${pick}-${s}`}
                                className="lm-chip lm-chip-a"
                                initial={reduce ? false : { opacity: 0, y: 8, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.15 + i * 0.18, type: "spring", stiffness: 380, damping: 24 }}
                            >
                                {s}
                            </motion.span>
                        ))}
                    </div>
                    {/* The full reply sits invisible underneath so the panel never changes height while typing. */}
                    <p className="grid text-[26px] font-semibold leading-[1.3]" style={{ letterSpacing: "-.02em" }}>
                        <span className="invisible col-start-1 row-start-1">{cur.reply}</span>
                        <span className="col-start-1 row-start-1">
                            {cur.reply.slice(0, typed)}
                            {typed < cur.reply.length && <span className="ml-0.5 inline-block h-[1em] w-[3px] translate-y-[3px] animate-pulse bg-current" />}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Hero Today list that replays what Aura does: ticks a task, then moves the review from 10:00 to 10:30.
const TodayRows = () => {
    const reduce = useReducedMotion();
    const [moved, setMoved] = useState(true);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (reduce) return;
        let ids: number[] = [];
        const run = () => {
            setMoved(false);
            setDone(false);
            ids = [
                window.setTimeout(() => setDone(true), 1400),
                window.setTimeout(() => setMoved(true), 3000),
                window.setTimeout(run, 8000),
            ];
        };
        run();
        return () => ids.forEach(clearTimeout);
    }, [reduce]);

    return (
        <div className="lm-sheet !bg-water">
            <div className="lm-row">
                <span className="relative h-[1.4em] w-14 flex-none overflow-hidden font-bold">
                    <AnimatePresence initial={false}>
                        <motion.span
                            key={moved ? "10:30" : "10:00"}
                            className="absolute left-0 top-0"
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "-100%", opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.3, 1] }}
                        >
                            {moved ? "10:30" : "10:00"}
                        </motion.span>
                    </AnimatePresence>
                </span>
                Design review
                <AnimatePresence>
                    {moved && (
                        <motion.span
                            className="lm-chip lm-chip-a ml-auto"
                            initial={reduce ? false : { scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 420, damping: 20 }}
                        >
                            moved by Aura
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            <div className="lm-row"><span className={`lm-check ${done ? "done" : ""}`} /><span className={`lm-sl ${done ? "done" : ""}`}>Write up the chunking notes</span><span className="lm-chip lm-chip-h ml-auto">High</span></div>
            <div className="lm-row"><span className="lm-check" />Buy groceries<span className="lm-muted ml-auto">Sun</span></div>
        </div>
    );
};

// Feature tile: morphs between two blob shapes and nudges its content toward the cursor.
const PartTile = ({ p, i }: { p: (typeof PARTS)[number]; i: number }) => (
    <div
        className="lm-tile lm-morph min-h-[300px] px-8 py-12 text-[#1F211E] md:px-16 md:py-14"
        style={{ background: `rgb(var(--${p.color}))`, borderRadius: p.radius, "--r1": p.radius, "--r2": p.r2, "--d": `${-i * 3}s` } as React.CSSProperties}
        onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
            e.currentTarget.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
        }}
        onPointerLeave={(e) => {
            e.currentTarget.style.setProperty("--px", "0");
            e.currentTarget.style.setProperty("--py", "0");
        }}
    >
        <div className="lm-par">
            <h3 className="lm-display text-[44px] !leading-none !text-[#1F211E]">{p.title}</h3>
            <p className="mt-2.5 max-w-[420px] text-lg">{p.text}</p>
        </div>
    </div>
);

const LandingPage = () => {
    // Track the active testimonial and the section nearest the viewport middle.
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [paused, setPaused] = useState(false);
    const [active, setActive] = useState("top");
    const reduce = useReducedMotion();
    const { scrollY, scrollYProgress } = useScroll();
    // Hero card and its date blob drift at different rates; steps rail and close wordmark are scrubbed by their own element.
    const cardY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -48]);
    const blobY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 24]);
    const stepsRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: stepsP } = useScroll({ target: stepsRef, offset: ["start 85%", "end 60%"] });
    const markRef = useRef<HTMLParagraphElement>(null);
    const { scrollYProgress: markP } = useScroll({ target: markRef, offset: ["start end", "end end"] });
    const markStretch = useTransform(markP, [0, 1], ["62%", reduce ? "62%" : "78%"]);

    // Inertia scroll for the whole page (and eased anchor jumps); native scroll when motion is reduced.
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const lenis = new Lenis({ autoRaf: true, anchors: { offset: -72 } });
        return () => lenis.destroy();
    }, []);

    // Scroll-spy: the section crossing the 40–45% band of the viewport is the active one.
    useEffect(() => {
        const io = new IntersectionObserver(
            (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
            { rootMargin: "-40% 0px -55% 0px" },
        );
        document.querySelectorAll("section[id]").forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    // Advance testimonials 4 seconds after each change; hovering pauses and restarts the wait.
    useEffect(() => {
        if (paused) return;
        const id = setTimeout(() => setCurrentTestimonial((p) => (p + 1) % TESTIMONIALS.length), 4000);
        return () => clearTimeout(id);
    }, [currentTestimonial, paused]);

    const t = TESTIMONIALS[currentTestimonial];
    const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    const [weekday, ...dateRest] = today.replace(",", "").split(" ");

    return (
        <div className="sec-today min-h-screen overflow-x-clip bg-water font-sans text-ink [--gut:max(24px,calc((100vw*var(--unzoom,1)-1440px)/2))]">
            {/* Scroll progress rail, tinted by the section in view */}
            <motion.div
                aria-hidden
                className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left transition-colors duration-500"
                style={{ scaleX: scrollYProgress, background: `rgb(var(${NAV.find((n) => n.id === active)?.c ?? "--today"}))` }}
            />
            {/* Header */}
            <header className="sticky top-0 z-40 flex flex-wrap items-center gap-2 bg-water/85 px-4 py-4 backdrop-blur md:px-[max(24px,var(--gut))]">
                <Link to="/" className="mr-4" aria-label="AuraOne home"><Logo textOnly /></Link>
                <nav className="hidden gap-1.5 md:flex" aria-label="Sections">
                    {NAV.map((n) => (
                        <a key={n.id} className={`lm-cap ${active === n.id ? "on" : ""}`} href={`#${n.id}`} aria-current={active === n.id ? "location" : undefined} style={{ "--c": `var(${n.c})` } as React.CSSProperties}><i />{n.label}</a>
                    ))}
                </nav>
                <div className="ml-auto flex gap-2">
                    <Link to="/login" viewTransition className="lm-btn lm-btn-soft">Log in</Link>
                    <Link to="/signup" viewTransition className="lm-btn">Sign up free</Link>
                </div>
            </header>

            <div className="mx-auto max-w-[1440px]">
                {/* Hero */}
                <section id="top" className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                    <div className="lm-lobe flex flex-col justify-center !w-auto !min-h-[480px] lg:!min-h-[calc(620px*var(--unzoom))] lg:!pl-[calc(var(--gut)+108px*var(--unzoom))] lg:!pr-[calc(72px*var(--unzoom))] lg:!py-[calc(72px*var(--unzoom))]" style={{ viewTransitionName: "auth-lobe" }}>
                        <h1 style={{ fontSize: "clamp(40px, 5.6vw, 80px)" }} aria-label="Your whole day, finally in order">
                            {"Your whole day, finally in order".split(" ").map((w, i) => (
                                <span key={i} aria-hidden className="-mb-[.1em] mr-[0.28em] inline-block overflow-hidden pb-[.1em] align-bottom">
                                    <motion.span
                                        className="inline-block"
                                        initial={reduce ? false : { y: "110%" }}
                                        animate={{ y: 0 }}
                                        transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: [0.2, 0.8, 0.3, 1] }}
                                    >
                                        {w}
                                    </motion.span>
                                </span>
                            ))}
                        </h1>
                        <p>Tasks, notes, events and news in one place, with Aura to add, move and find anything in plain words.</p>
                        <div className="lm-acts">
                            <Magnetic><Link to="/signup" viewTransition className="lm-btn">Create your free account</Link></Magnetic>
                            <Link to="/login" viewTransition className="lm-btn lm-btn-ghost">Log in</Link>
                        </div>
                    </div>

                    <motion.div className="mx-4 grid gap-3.5 rounded-[32px] bg-sheet p-5 lg:mr-6" style={{ y: cardY }} aria-label="AuraOne Today screen">
                        <div className="flex gap-1.5">
                            <span className="lm-cap on" style={{ "--c": "var(--today)" } as React.CSSProperties}><i />Today</span>
                            <span className="lm-cap !bg-step" style={{ "--c": "var(--tasks)" } as React.CSSProperties}><i />Tasks</span>
                            <span className="lm-cap !bg-step" style={{ "--c": "var(--aura)" } as React.CSSProperties}><i />Aura</span>
                        </div>
                        <motion.div className="rounded-r-[60%] rounded-bl-none bg-today px-7 pb-9 pt-6 text-[#1F211E]" style={{ borderRadius: "0 60% 48% 0 / 0 70% 58% 0", y: blobY }}>
                            <div className="lm-display text-[52px]">{weekday}<br />{dateRest.join(" ")}</div>
                        </motion.div>
                        <TodayRows />
                    </motion.div>
                </section>

                {/* Feature marquee */}
                <div className="lm-marquee mt-16 overflow-hidden md:mt-24" aria-hidden>
                    <div className="flex w-max gap-3">
                        {[0, 1].map((k) => (
                            <div key={k} className="flex gap-3">
                                {[...PARTS, ...PARTS].map((p, i) => (
                                    <span key={i} className="lm-chip !px-5 !py-2.5 !text-lg text-[#1F211E]" style={{ background: `rgb(var(--${p.color}))` }}>{p.title}</span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Say it. Aura does it. */}
                <section className="px-4 pt-24 md:px-6 md:pt-36" id="aura">
                    <h2 className="lm-display max-w-[900px] text-[clamp(44px,5.6vw,84px)]">Say it. Aura does it.</h2>
                    <p className="mt-4 max-w-[620px] text-xl">Aura reads and changes your own tasks, notes and events. Pick a sentence and see what it would do.</p>
                    <AuraDemo />
                </section>

                {/* Parts */}
                <section className="px-4 pt-24 md:px-6 md:pt-36" id="parts">
                    <h2 className="lm-display max-w-[900px] text-[clamp(44px,5.6vw,84px)]">Every part of your day, in its own colour</h2>
                    <div className="mt-10 grid gap-5 md:grid-cols-2">
                        {PARTS.map((p, i) => <Reveal key={p.title} clip delay={(i % 2) * 0.12}><PartTile p={p} i={i} /></Reveal>)}
                    </div>
                </section>

                {/* How it works */}
                <section className="px-4 pt-24 md:px-6 md:pt-36" id="how">
                    <h2 className="lm-display max-w-[900px] text-[clamp(44px,5.6vw,84px)]">Up and running in three steps</h2>
                    <div ref={stepsRef} className="relative mt-10 grid gap-5 md:grid-cols-3">
                        {/* Rail that fills as the steps scroll past */}
                        <motion.div aria-hidden className="absolute -top-4 left-0 hidden h-[3px] w-full origin-left bg-events md:block" style={{ scaleX: reduce ? 1 : stepsP }} />
                        {STEPS.map((st, i) => (
                            <Reveal key={st.n} delay={i * 0.12} className="h-full">
                                <div className="lm-sheet lm-tile h-full !p-8">
                                    <span className="lm-display text-[56px]"><CountUp to={parseInt(st.n, 10)} /></span>
                                    <h3 className="mt-2 text-2xl font-extrabold">{st.title}</h3>
                                    <p className="mt-2 text-lg">{st.text}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Under the hood */}
                <section className="px-4 pt-24 md:px-6 md:pt-36" id="about">
                    <h2 className="lm-display max-w-[900px] text-[clamp(44px,5.6vw,84px)]">An assistant, not a chat box</h2>
                    <p className="mt-4 max-w-[680px] text-xl">Aura runs a ReAct agent loop with validated create, read, update and delete actions, grounded by your own knowledge base. Gemini answers first, with OpenRouter as fallback.</p>
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {FACTS.map((f, i) => (
                            <Reveal key={f.k} delay={i * 0.08} className="h-full">
                                <div className="lm-tile group relative isolate h-full overflow-hidden rounded-3xl bg-sheet p-6" onPointerMove={trackGlow}>
                                    <Glow c={f.c} />
                                    <p className="lm-display text-[34px]">{f.k}</p>
                                    <p className="lm-muted mt-1.5">{f.v}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Voices */}
                <section className="px-4 pt-24 md:px-6 md:pt-36" id="voices">
                    <h2 className="lm-display max-w-[900px] text-[clamp(44px,5.6vw,84px)]">From early users</h2>
                    <div className="lm-sheet relative mt-10 overflow-hidden !p-8 md:!px-14 md:!py-12" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.p
                                key={currentTestimonial}
                                className="max-w-[900px] text-[26px] font-semibold leading-[1.3] md:text-[30px]"
                                style={{ letterSpacing: "-.02em" }}
                                initial={{ opacity: 0, x: 32 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -32 }}
                                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.3, 1] }}
                            >
                                “{t.content}”
                            </motion.p>
                        </AnimatePresence>
                        <div className="mt-5 flex items-center gap-2.5">
                            <span className="grid h-[42px] w-[42px] place-items-center rounded-full bg-ink font-extrabold text-water">{t.name.charAt(0)}</span>
                            <motion.div key={currentTestimonial} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }}>
                                <b>{t.name}</b><br />
                                <span className="lm-muted">{t.role}</span>
                            </motion.div>
                            <div className="ml-auto flex gap-2">
                                <button className="lm-round !bg-step" aria-label="Previous story" onClick={() => setCurrentTestimonial((currentTestimonial + TESTIMONIALS.length - 1) % TESTIMONIALS.length)}><ChevronLeft size={20} /></button>
                                <button className="lm-round !bg-step" aria-label="Next story" onClick={() => setCurrentTestimonial((currentTestimonial + 1) % TESTIMONIALS.length)}><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        {/* 4s countdown to the next story; empty while hovered */}
                        <motion.div
                            key={currentTestimonial}
                            aria-hidden
                            className="absolute inset-x-0 bottom-0 h-1 origin-left bg-notes"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: paused ? 0 : 1 }}
                            transition={{ duration: paused ? 0.2 : 4, ease: "linear" }}
                        />
                    </div>
                </section>

                {/* Close */}
                <section className="mx-4 mt-24 bg-today px-8 pb-12 pt-16 text-[#1F211E] md:mx-6 md:mt-36 md:px-[72px] md:pt-24" style={{ borderRadius: "0 48% 0 0 / 0 60% 0 0" }}>
                    <h2 className="lm-display !text-[#1F211E] text-[clamp(56px,8vw,120px)]">Start with today</h2>
                    <div className="lm-acts">
                        <Magnetic><Link to="/signup" className="lm-btn !bg-[#1F211E] !text-white">Create your free account</Link></Magnetic>
                        <Link to="/login" className="lm-btn lm-btn-ghost !bg-white/60 !text-[#1F211E]">I have an account</Link>
                    </div>
                    <motion.p ref={markRef} className="mt-16 font-extrabold leading-[.8] md:mt-20" style={{ fontSize: "clamp(90px, 17vw, 250px)", letterSpacing: "-.07em", fontStretch: markStretch }}>AuraOne</motion.p>
                </section>

                <SiteFooter />
            </div>
        </div>
    );
};

export default LandingPage;

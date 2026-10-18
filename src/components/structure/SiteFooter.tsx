// Shared marketing blocks for public pages: a features overview strip and the full site footer with social links.

import { Link } from "react-router-dom";
import { Github, UserRound } from "lucide-react";
import Logo from "./Logo";

const OVERVIEW = [
    { title: "Tasks", color: "tasks", text: "Priorities and due dates, done in one tap." },
    { title: "Notes", color: "notes", text: "Rich text with tags, searchable by Aura." },
    { title: "Events", color: "events", text: "A month calendar, created in plain words." },
    { title: "Aura", color: "aura", text: "An assistant that acts on your own data." },
];

const PRODUCT = [["Aura", "/#aura"], ["Features", "/#parts"], ["How it works", "/#how"], ["Stories", "/#voices"]];
const ACCOUNT = [["Sign up", "/signup"], ["Log in", "/login"], ["Forgot password", "/forgot-password"]];
const SOCIAL = [
    { label: "GitHub", href: "https://github.com/dhyan2815/AuraOne", Icon: Github },
    { label: "Developer profile", href: "https://dhyan-patel.notion.site/about-dhyan", Icon: UserRound },
];

export const FeaturesOverview = () => (
    <section className="px-4 pt-16 md:px-6" aria-label="Features overview">
        <h2 className="lm-display max-w-[760px] text-[clamp(36px,4.4vw,64px)]">One hub for your whole day</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OVERVIEW.map((o) => (
                <div key={o.title} className="rounded-3xl p-6 text-[#1F211E]" style={{ background: `rgb(var(--${o.color}))` }}>
                    <h3 className="lm-display text-[32px] !leading-none !text-[#1F211E]">{o.title}</h3>
                    <p className="mt-2 text-base">{o.text}</p>
                </div>
            ))}
        </div>
    </section>
);

const SiteFooter = () => (
    <footer className="px-4 pb-10 pt-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div>
                <Logo textOnly />
                <p className="lm-muted mt-3 max-w-[340px]">One personal hub for tasks, notes, events and news, with Aura to act on all of it.</p>
                <div className="mt-4 flex gap-2">
                    {SOCIAL.map(({ label, href, Icon }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="lm-round !bg-step">
                            <Icon size={20} />
                        </a>
                    ))}
                </div>
            </div>
            <nav aria-label="Product">
                <p className="font-extrabold">Product</p>
                <ul className="mt-3 grid gap-2">
                    {PRODUCT.map(([label, href]) => <li key={label}><a href={href} className="lm-muted hover:underline">{label}</a></li>)}
                </ul>
            </nav>
            <nav aria-label="Account">
                <p className="font-extrabold">Account</p>
                <ul className="mt-3 grid gap-2">
                    {ACCOUNT.map(([label, to]) => <li key={label}><Link to={to} className="lm-muted hover:underline">{label}</Link></li>)}
                </ul>
            </nav>
            <nav aria-label="Developer">
                <p className="font-extrabold">Developer</p>
                <ul className="mt-3 grid gap-2">
                    {SOCIAL.map(({ label, href }) => <li key={label}><a href={href} target="_blank" rel="noopener noreferrer" className="lm-muted hover:underline">{label}</a></li>)}
                </ul>
            </nav>
        </div>
        <div className="lm-muted mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-current/10 pt-6">
            <span>&copy; 2026 AuraOne. All rights reserved.</span>
            <span>Built by Dhyan Patel</span>
            <span className="md:ml-auto">Release 1.4.2</span>
        </div>
    </footer>
);

export default SiteFooter;

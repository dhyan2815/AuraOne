import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle, MessageSquare, ArrowRight, ChevronDown, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LandingPicture from "../assets/LandingImage.png";
// import Card from "../components/ui/Card";
import Logo from "../components/structure/Logo";

const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const testimonials = [
        {
            name: "Rajesh Verma",
            role: "Product Manager",
            content: "AuraOne has completely transformed how I manage my daily tasks and notes. The AI assistant is incredibly intuitive and saves me hours every week.",
            rating: 4
        },
        {
            name: "Anjali Sharma",
            role: "Software Developer",
            content: "The real-time sync across all my devices is flawless. I can start a task on my phone and finish it on my laptop without any hassle.",
            rating: 4
        },
        {
            name: "Amit Patel",
            role: "Marketing Director",
            content: "The calendar integration and smart reminders have made me so much more organized. AuraOne is exactly what I needed for my busy schedule.",
            rating: 5
        },
        {
            name: "Dhairya Kumar",
            role: "Freelance Writer",
            content: "The rich text editor for notes is fantastic, and the AI chat feature helps me brainstorm ideas quickly. This is productivity software done right.",
            rating: 4
        }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prevIndex) =>
                (prevIndex + 1) % testimonials.length
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [testimonials.length]);

    const scrollToFeatures = () => {
        const featuresElement = document.getElementById('features');
        if (featuresElement) {
            featuresElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen font-sans text-text bg-background transition-colors duration-500">

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-background/80 backdrop-blur-lg border-b border-primary/10 shadow-lg shadow-primary/5' : 'py-6 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    <button
                        onClick={scrollToTop}
                        className="hover:opacity-80 transition-opacity cursor-pointer inline-block"
                    >
                        <Logo iconClassName="w-8 h-8 sm:w-10 sm:h-10" textClassName="text-xl sm:text-2xl" />
                    </button>

                    <div className="hidden md:flex items-center space-x-8">
                        <button onClick={scrollToFeatures} className="text-sm font-bold text-text-variant hover:text-primary transition-colors">Features</button>
                        <button onClick={scrollToTop} className="text-sm font-bold text-text-variant hover:text-primary transition-colors">About</button>
                        <Link to="/signup" className="text-sm font-bold text-text-variant hover:text-primary transition-colors">Pricing</Link>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <Link
                            to="/login"
                            className="text-xs sm:text-sm font-bold text-text-variant hover:text-primary transition-colors px-1 sm:px-2"
                        >
                            Log In
                        </Link>
                        <Link
                            to="/signup"
                            className="bg-primary text-white font-black py-2 px-4 sm:py-2.5 sm:px-6 rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-widest text-[9px] sm:text-[10px]"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 sm:pt-48 sm:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-500/5 dark:bg-grid-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6 sm:space-y-8 z-10 text-center lg:text-left"
                        >
                            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tighter leading-tight text-text">
                                Your Workspace,<br />
                                Redefined in <span className="text-primary italic">Light</span>.
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-text-variant font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Experience productivity as a sanctuary. AuraOne harmonizes tasks, notes, and AI intelligence within a breathtaking luminous environment.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center bg-primary text-white font-black py-3.5 px-8 sm:py-4 sm:px-10 rounded-2xl group text-xs sm:text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:bg-primary/90 transition-all uppercase tracking-[0.2em]"
                                >
                                    Start Your Flow
                                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button
                                    onClick={scrollToFeatures}
                                    className="inline-flex items-center justify-center glass border border-primary/10 text-text font-black py-3.5 px-8 sm:py-4 sm:px-10 rounded-2xl group text-xs sm:text-sm shadow-xl shadow-primary/5 hover:border-primary/20 transition-all uppercase tracking-[0.2em]"
                                >
                                    The Capability
                                    <ChevronDown className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-1 transition-transform" />
                                </button>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start gap-8 sm:gap-12 pt-6 sm:pt-8">
                                <div className="text-center">
                                    <p className="text-3xl sm:text-4xl font-black text-primary">99%</p>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-text-variant opacity-60">Consistency</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl sm:text-4xl font-black text-cta">4.9</p>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-text-variant opacity-60">Synthesis</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="absolute -inset-8 sm:-inset-16 bg-gradient-to-tr from-primary/30 to-tertiary/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none opacity-50"></div>
                            <div className="glass p-2 sm:p-3 rounded-2xl sm:rounded-[3rem] shadow-2xl relative z-10 border border-primary/10 overflow-hidden transform hover:scale-[1.01] transition-transform duration-700">
                                <img
                                    src={LandingPicture}
                                    alt="Luminous Interface"
                                    className="w-full h-auto rounded-xl sm:rounded-[2.5rem] shadow-inner"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 sm:py-32 relative bg-primary/5 dark:bg-slate-900/40 border-y border-primary/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12 sm:mb-24 space-y-3 sm:space-y-4">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-primary">Foundational Modules</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tighter text-text">
                            Crafted for the Modern Mind.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {[
                            { icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Events Calendar", description: "Orchestrate your time with a weightless scheduling experience designed for clarity and temporal flow." },
                            { icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Tasks & Notes Management", description: "Precision management. Organize your objectives with intuitive focus systems and dynamic priority tiers." },
                            { icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Aura Assistant", description: "Your neural companion. Advanced AI intelligence that anticipates your needs and streamlines your workflow." },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -8 }}
                                className="group"
                            >
                            <div className="glass h-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/10 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:shadow-2xl group-hover:shadow-primary/5 transition-all duration-300">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 border border-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-inner group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 text-primary">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-text group-hover:text-primary transition-colors">{feature.title}</h3>
                                <p className="text-xs sm:text-sm text-text-variant font-medium leading-relaxed">{feature.description}</p>
                            </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 sm:py-32 overflow-hidden bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
                    <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTestimonial}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.6 }}
                                className="space-y-6 sm:space-y-10"
                            >
                                <div className="flex justify-center gap-1 opacity-60">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < testimonials[currentTestimonial].rating ? 'text-primary fill-primary' : 'text-primary/20'}`} />
                                    ))}
                                </div>
                                <blockquote className="text-xl sm:text-3xl lg:text-5xl font-black italic tracking-tighter leading-tight text-text px-2 sm:px-4">
                                    "{testimonials[currentTestimonial].content}"
                                </blockquote>
                                <div className="flex items-center justify-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 border border-primary/10 flex items-center justify-center font-black text-primary shadow-xl text-sm sm:text-base">
                                        {testimonials[currentTestimonial].name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm sm:text-lg text-text">{testimonials[currentTestimonial].name}</p>
                                        <p className="text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-80">{testimonials[currentTestimonial].role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-center gap-2">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentTestimonial(i)}
                                    className={`h-1.5 transition-all duration-500 rounded-full ${i === currentTestimonial ? 'w-8 sm:w-10 bg-primary shadow-lg shadow-primary/30' : 'w-3 sm:w-4 bg-primary/20 hover:bg-primary/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 sm:py-40 relative bg-primary/5 dark:bg-slate-900/40 border-t border-primary/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <div className="glass p-8 sm:p-20 rounded-2xl sm:rounded-[3rem] shadow-2xl border border-primary/10 relative overflow-hidden group">
                        <div className="absolute -inset-48 bg-gradient-to-tr from-primary/10 to-transparent blur-[100px] pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity"></div>
                        <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 sm:mb-8 tracking-tighter text-text relative z-10">
                            Join <span className="text-primary bold">Aura</span>.
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-text-variant font-medium mb-8 sm:mb-12 max-w-2xl mx-auto relative z-10">
                            Elevate your digital presence. Start your journey into the Luminous Workspace today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center relative z-10 max-w-xs sm:max-w-none mx-auto">
                            <Link
                                to="/signup"
                                className="bg-primary text-white font-black py-3.5 sm:py-4 px-8 sm:px-12 rounded-2xl text-xs sm:text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-[0.2em]"
                            >
                                Sign Up
                            </Link>
                            <Link
                                to="/login"
                                className="glass border border-primary/20 text-text font-black py-3.5 sm:py-4 px-8 sm:px-12 rounded-2xl text-xs sm:text-sm shadow-xl hover:border-primary/40 transition-all uppercase tracking-[0.2em]"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 sm:py-20 border-t border-primary/5 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12 sm:mb-16">
                        <div className="col-span-1 md:col-span-2 space-y-4 sm:space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
                            <Logo iconClassName="w-8 h-8" textClassName="text-xl sm:text-2xl" />
                            <p className="text-xs sm:text-sm text-text-variant max-w-sm font-medium leading-relaxed opacity-70">
                                Curating focus in a world of distraction. Built with love for the dreamers and the doers.
                            </p>
                        </div>

                        <div className="space-y-4 sm:space-y-6 text-center md:text-left">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-60">Architect</p>
                            <ul className="space-y-3 sm:space-y-4 font-bold text-xs sm:text-sm">
                                <li><button onClick={scrollToFeatures} className="text-text-variant hover:text-primary transition-colors">Experience</button></li>
                                <li><Link to="/login" className="text-text-variant hover:text-primary transition-colors">Join Us</Link></li>
                                <li><a href="https://dhyan-patel.notion.site/about-dhyan" target="_blank" rel="noopener noreferrer" className="text-text-variant hover:text-primary transition-colors">Developer Profile</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-text-variant opacity-40">&copy; 2026 AuraOne Intelligence. All rights reserved.</p>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary opacity-40">System Release 1.4.2</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

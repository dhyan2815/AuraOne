import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle, FileText, MessageSquare, Shield, ArrowRight, ChevronDown, Star, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LandingPicture from "../assets/LandingImage.png";
import Card from "../components/ui/Card";
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
        <div className="min-h-screen font-sans text-text bg-background">

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/50' : 'py-6 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <button
                        onClick={scrollToTop}
                        className="hover:opacity-80 transition-opacity cursor-pointer inline-block"
                    >
                        <Logo iconClassName="w-10 h-10" textClassName="text-2xl" />
                    </button>

                    <div className="hidden md:flex items-center space-x-8">
                        <button onClick={scrollToFeatures} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Features</button>
                        <button onClick={scrollToTop} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">About</button>
                        <Link to="/signup" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Pricing</Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-primary/90 transition-all"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/20 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8 z-10"
                        >
                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-tight text-text">
                                Your Workspace,<br />
                                Redefined in <span className="text-primary italic">Light</span>.
                            </h1>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                                Experience productivity as a sanctuary. AuraOne harmonizes tasks, notes, and AI intelligence within a breathtaking luminous environment.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center bg-primary text-white font-bold py-4 px-8 rounded-lg group text-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
                                >
                                    Start Your Flow
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button
                                    onClick={scrollToFeatures}
                                    className="inline-flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-slate-200 dark:border-gray-700 text-text font-bold py-4 px-8 rounded-lg group text-lg shadow-lg hover:shadow-xl transition-all"
                                >
                                    Explore Features
                                    <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
                                </button>
                            </div>

                            <div className="flex items-center gap-12 pt-8">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-primary">10k+</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Visionaries</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-secondary">99.9%</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Uptime</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-cta">4.9/5</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Rating</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="absolute -inset-8 bg-gradient-to-tr from-primary/20 to-secondary/20 blur-3xl rounded-full"></div>
                            <Card className="p-4 rounded-[2.5rem] shadow-2xl relative z-10">
                                <div className="p-0">
                                <img
                                    src={LandingPicture}
                                    alt="Luminous Interface"
                                    className="w-full h-auto rounded-[2rem] shadow-inner"
                                />
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 relative bg-slate-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24 space-y-4">
                        <p className="text-sm font-bold uppercase tracking-widest text-primary">Capabilities</p>
                        <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tighter text-text">
                            Crafted for the Modern Mind.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <Calendar className="w-6 h-6 text-primary" />, title: "Ethereal Calendar", description: "A weightless scheduling experience that brings clarity to your temporal flow." },
                            { icon: <CheckCircle className="w-6 h-6 text-secondary" />, title: "Fluid Tasks", description: "Prioritize with grace. Manage your output with intuitive focus systems." },
                            { icon: <MessageSquare className="w-6 h-6 text-cta" />, title: "Aura Intelligence", description: "Advanced AI assistance that converses with you, not just for you." },
                            { icon: <FileText className="w-6 h-6 text-primary" />, title: "Rich Typography", description: "Note-taking that feels like editorial design. Every word deserves beauty." },
                            { icon: <BarChart3 className="w-6 h-6 text-secondary" />, title: "Deep Insights", description: "Visualize your cognitive patterns and optimize your peak productivity hours." },
                            { icon: <Shield className="w-6 h-6 text-cta" />, title: "Fortified Privacy", description: "Your sanctuary is protected by enterprise-grade encryption and ethical AI." }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -10 }}
                                className="group"
                            >
                            <Card className="h-full p-8 group cursor-default shadow-lg hover:shadow-xl transition-all">
                               <div className="p-0 flex flex-col items-start">
                                <div className="w-14 h-14 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-text">{feature.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                               </div>
                            </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTestimonial}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.6 }}
                                className="space-y-10"
                            >
                                <div className="flex justify-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-5 h-5 ${i < testimonials[currentTestimonial].rating ? 'text-secondary fill-secondary' : 'text-primary/20'}`} />
                                    ))}
                                </div>
                                <blockquote className="text-4xl lg:text-5xl font-black italic tracking-tighter leading-tight text-primary/80">
                                    "{testimonials[currentTestimonial].content}"
                                </blockquote>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center font-black text-secondary ring-4 ring-white dark:ring-gray-900 shadow-xl">
                                        {testimonials[currentTestimonial].name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-lg text-text">{testimonials[currentTestimonial].name}</p>
                                        <p className="text-sm font-medium text-primary/80 uppercase tracking-[0.2em]">{testimonials[currentTestimonial].role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-center gap-2">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentTestimonial(i)}
                                    className={`h-1.5 transition-all duration-500 rounded-full ${i === currentTestimonial ? 'w-10 bg-secondary shadow-lg shadow-secondary/30' : 'w-4 bg-primary/20 hover:bg-primary/30'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 relative bg-slate-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <Card className="p-12 sm:p-20 rounded-[3rem] shadow-2xl">
                       <div className="p-0">
                        <h2 className="text-5xl font-extrabold mb-8 tracking-tighter text-text">
                            Join the <span className="text-secondary italic">Aura</span>.
                        </h2>
                        <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto">
                            Elevate your digital presence. Start your journey into the Luminous Workspace today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                to="/signup"
                                className="bg-primary text-white font-bold py-4 px-12 rounded-lg text-xl shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/login"
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-slate-200 dark:border-gray-700 text-text font-bold py-4 px-12 rounded-lg text-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                Visionary Login
                            </Link>
                        </div>
                       </div>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2 space-y-6">
                            <Logo iconClassName="w-8 h-8" textClassName="text-2xl" />
                            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                                Curating focus in a world of distraction. Built with love for the dreamers and the doers.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Sanctuary</p>
                            <ul className="space-y-4 font-bold text-sm">
                                <li><button onClick={scrollToFeatures} className="hover:text-primary transition-colors">Experience</button></li>
                                <li><Link to="/login" className="hover:text-primary transition-colors">Join Us</Link></li>
                                <li><a href="https://dhyan-patel.onrender.com" target="_blank" className="hover:text-primary transition-colors">Developer</a></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Philosophy</p>
                            <ul className="space-y-4 font-bold text-sm">
                                <li><span className="text-primary/40">Beta Phase</span></li>
                                <li><span className="text-secondary/40">Design First</span></li>
                                <li><span className="text-cta/40">Privacy Centric</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">&copy; 2026 AuraOne Registry. All rights reserved.</p>
                        <p className="text-xs font-black uppercase tracking-widest text-secondary/40">Designed by Dhyan Patel</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

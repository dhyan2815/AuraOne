import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle, FileText, MessageSquare, Sparkles, Shield, ArrowRight, ChevronDown, Star, BarChart3 } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import LandingPicture from "../assets/LandingImage.png";


const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    // Testimonials data
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

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-rotate testimonials every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prevIndex) => 
                (prevIndex + 1) % testimonials.length
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [testimonials.length]);

    // Smooth scroll to features section
    const scrollToFeatures = () => {
        const featuresElement = document.getElementById('features');
        if (featuresElement) {
            featuresElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Smooth scroll to tech section
    const scrollToTech = () => {
        const techElement = document.getElementById('tech');
        if (techElement) {
            techElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Smooth scroll to top
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="landing-page min-h-screen text-aurora-on-surface" style={{ scrollBehavior: 'smooth' }}>
            {/* Background Animated Gradient Mesh */}
            <div className="aurora-mesh fixed inset-0 z-[-1]" aria-hidden="true" />

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'glass py-3 border-b border-primary/5' : 'bg-transparent py-6'}`}>
                <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
                    <button 
                        onClick={scrollToTop}
                        className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer group"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-aurora-on-surface">AuraOne</span>
                    </button>

                    <div className="flex items-center space-x-8">
                        <Link
                            to="/login"
                            className="text-sm font-bold text-aurora-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="btn-aurora-primary px-8 py-3"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <h1 className="display-lg leading-[1.1] bg-gradient-to-br from-primary via-secondary to-tertiary bg-clip-text text-transparent italic">
                                Your Workspace,<br />
                                <span className="not-italic text-aurora-on-surface font-extrabold">Redefined in Light.</span>
                            </h1>
                            <p className="text-xl text-aurora-on-surface-variant font-medium leading-relaxed max-w-xl">
                                Experience productivity as a sanctuary. AuraOne harmonizes tasks, notes, and AI intelligence within a breathtaking luminous environment.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    to="/signup"
                                    className="btn-aurora-primary group text-lg"
                                >
                                    Start Your Flow
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button
                                    onClick={scrollToFeatures}
                                    className="btn-aurora-secondary text-lg"
                                >
                                    Explore Sanctuaries
                                    <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
                                </button>
                            </div>

                            {/* Trust Stats */}
                            <div className="flex items-center gap-12 pt-8">
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-primary">10k+</p>
                                    <p className="section-header mb-0 text-[0.6rem]">Visionaries</p>
                                </div>
                                <div className="w-px h-12 bg-primary/10" />
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-secondary">99.9%</p>
                                    <p className="section-header mb-0 text-[0.6rem]">Uptime</p>
                                </div>
                                <div className="w-px h-12 bg-primary/10" />
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-tertiary">4.9/5</p>
                                    <p className="section-header mb-0 text-[0.6rem]">Rating</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Hero Visual */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="glass-panel p-4 rounded-[2.5rem] shadow-2xl relative z-10">
                                <img
                                    src={LandingPicture}
                                    alt="Luminous Interface"
                                    className="w-full h-auto rounded-[2rem] shadow-inner"
                                />
                            </div>
                            
                            {/* Decorative Aurora Elements */}
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 blur-[100px] -z-10 rounded-full animate-aurora-float" />
                            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/10 blur-[100px] -z-10 rounded-full animate-aurora-float [animation-delay:2s]" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 relative">
                <div className="max-w-[1440px] mx-auto px-6">
                    <div className="text-center mb-24 space-y-4">
                        <p className="section-header">Sophisticated Capabilities</p>
                        <h2 className="headline-sm text-4xl lg:text-6xl tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Crafted for the Modern Mind.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Calendar className="w-6 h-6 text-primary" />,
                                title: "Ethereal Calendar",
                                description: "A weightless scheduling experience that brings clarity to your temporal flow.",
                                gradient: "from-primary/5 to-transparent"
                            },
                            {
                                icon: <CheckCircle className="w-6 h-6 text-secondary" />,
                                title: "Fluid Tasks",
                                description: "Prioritize with grace. Manage your output with intuitive focus systems.",
                                gradient: "from-secondary/5 to-transparent"
                            },
                            {
                                icon: <MessageSquare className="w-6 h-6 text-tertiary" />,
                                title: "Aura Intelligence",
                                description: "Advanced AI assistance that converses with you, not just for you.",
                                gradient: "from-tertiary/5 to-transparent"
                            },
                            {
                                icon: <FileText className="w-6 h-6 text-primary" />,
                                title: "Rich Typography",
                                description: "Note-taking that feels like editorial design. Every word deserves beauty.",
                                gradient: "from-primary/5 to-transparent"
                            },
                            {
                                icon: <BarChart3 className="w-6 h-6 text-secondary" />,
                                title: "Deep Insights",
                                description: "Visualize your cognitive patterns and optimize your peak productivity hours.",
                                gradient: "from-secondary/5 to-transparent"
                            },
                            {
                                icon: <Shield className="w-6 h-6 text-tertiary" />,
                                title: "Fortified Privacy",
                                description: "Your sanctuary is protected by enterprise-grade encryption and ethical AI.",
                                gradient: "from-tertiary/5 to-transparent"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -10 }}
                                className={`glass-card bg-gradient-to-br ${feature.gradient} group cursor-default`}
                            >
                                <div className="w-14 h-14 glass bg-white/60 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-white/20 group-hover:scale-110 group-hover:bg-white transition-all">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-aurora-on-surface-variant font-medium leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 glass bg-white/20 backdrop-blur-3xl overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-6 relative">
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
                                        <Star key={i} className={`w-5 h-5 ${i < testimonials[currentTestimonial].rating ? 'text-secondary fill-secondary' : 'text-primary/10'}`} />
                                    ))}
                                </div>
                                <blockquote className="text-4xl lg:text-5xl font-black italic tracking-tighter leading-tight text-primary/80">
                                    "{testimonials[currentTestimonial].content}"
                                </blockquote>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-12 h-12 rounded-full glass flex items-center justify-center font-black text-secondary ring-4 ring-white shadow-xl">
                                        {testimonials[currentTestimonial].name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-lg">{testimonials[currentTestimonial].name}</p>
                                        <p className="text-sm font-medium text-primary/50 uppercase tracking-[0.2em]">{testimonials[currentTestimonial].role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-center gap-2">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentTestimonial(i)}
                                    className={`h-1.5 transition-all duration-500 rounded-full ${i === currentTestimonial ? 'w-10 bg-secondary shadow-lg shadow-secondary/30' : 'w-4 bg-primary/10 hover:bg-primary/30'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 relative">
                <div className="max-w-4xl mx-auto px-6 text-center glass-panel p-20 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(73,83,188,0.2)]">
                    <h2 className="display-lg mb-8 tracking-tighter">
                        Join the <span className="text-secondary italic">Aura</span>.
                    </h2>
                    <p className="text-xl text-aurora-on-surface-variant font-medium mb-12 max-w-2xl mx-auto">
                        Elevate your digital presence. Start your journey into the Luminous Workspace today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to="/signup"
                            className="btn-aurora-primary px-12 py-4 text-xl shadow-2xl shadow-primary/40"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            to="/login"
                            className="btn-aurora-secondary px-12 py-4 text-xl"
                        >
                            Visionary Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-primary/5">
                <div className="max-w-[1440px] mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2 space-y-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-2xl font-black tracking-tighter">AuraOne</span>
                            </div>
                            <p className="text-aurora-on-surface-variant max-w-sm font-medium leading-relaxed">
                                Curating focus in a world of distraction. Built with love for the dreamers and the doers.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <p className="section-header">Sanctuary</p>
                            <ul className="space-y-4 font-bold text-sm">
                                <li><button onClick={scrollToFeatures} className="hover:text-primary transition-colors">Experience</button></li>
                                <li><Link to="/login" className="hover:text-primary transition-colors">Join Us</Link></li>
                                <li><a href="https://dhyan-patel.onrender.com" target="_blank" className="hover:text-primary transition-colors">Developer</a></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <p className="section-header">Philosophy</p>
                            <ul className="space-y-4 font-bold text-sm">
                                <li><span className="text-primary/40">Beta Phase</span></li>
                                <li><span className="text-secondary/40">Design First</span></li>
                                <li><span className="text-tertiary/40">Privacy Centric</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/40">&copy; 2026 AuraOne Registry. All rights reserved.</p>
                        <p className="text-xs font-black uppercase tracking-widest text-secondary/40">Designed by Dhyan Patel</p>
                    </div>
                </div>
            </footer>
        </div>
    );

};

export default LandingPage;

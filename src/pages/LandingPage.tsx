import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle, FileText, MessageSquare, Sparkles, Shield, Zap, ArrowRight, Clock, BarChart3, Smartphone, Globe, Lock, Heart, ChevronDown } from "lucide-react";
import LandingPicture from "../assets/flat-illustration-1.jpg";

const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        <div className="landing-page min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-lg shadow-black/10' : 'bg-white/20 backdrop-blur-xl border-b border-white/30 shadow-lg shadow-black/5'}`}>
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={scrollToTop}
                            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">AuraOne</span>
                        </button>

                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-black hover:text-indigo-600 transition-colors font-medium text-lg"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md text-md"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50 mt-2">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-5 gap-8 items-center">
                            {/* Left Content */}
                            <div className="space-y-4 lg:col-span-2">
                                <div className="space-y-4 mt-2">
                                    <h1 className="text-3xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                        Your All-in-One
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 block">
                                            Productivity Hub
                                        </span>
                                    </h1>
                                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                                        Transform your workflow with AuraOne - the intelligent productivity platform that combines tasks, notes, calendar, and AI assistance in one beautiful interface.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link
                                        to="/signup"
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold text-base hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center group"
                                    >
                                        Start Free Journey
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <button
                                        onClick={scrollToFeatures}
                                        className="border-2 border-indigo-600 text-indigo-600 px-6 py-2 rounded-lg font-semibold text-base hover:bg-indigo-600 hover:text-white transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
                                    >
                                        Explore Features
                                        <ChevronDown className="ml-2 w-4 h-4 group-hover:translate-y-1 transition-transform" />
                                    </button>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-8 pt-0">
                                    <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                                        <div className="text-3xl font-bold text-indigo-600">10+</div>
                                        <div className="text-gray-600 text-sm">Active Users</div>
                                    </div>
                                    <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                                        <div className="text-3xl font-bold text-indigo-600">89.99%</div>
                                        <div className="text-gray-600 text-sm">Uptime</div>
                                    </div>
                                    <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                                        <div className="text-3xl font-bold text-indigo-600">★★★★</div>
                                        <div className="text-gray-600 text-sm">User Rating</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Content - Hero Image */}
                            <div className="relative lg:col-span-3">
                                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                                    <img
                                        src={LandingPicture}
                                        alt="AuraOne Dashboard Preview"
                                        className="w-full h-[500px] object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>

                                {/* Floating Cards */}
                                <div className="absolute -top-4 -left-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-4 transform rotate-3 border border-white/30">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-800">AI Assistant Active</span>
                                    </div>
                                </div>

                                <div className="absolute -bottom-4 -right-4 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-4 transform -rotate-3 border border-white/30">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-medium text-gray-800">3 Events Today</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Everything You Need to Stay
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Productive</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            AuraOne combines all your essential productivity tools in one intelligent, beautiful interface designed for modern workflows.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature Cards */}
                        {[
                            {
                                icon: <Calendar className="w-8 h-8 text-indigo-600" />,
                                title: "Smart Calendar",
                                description: "Organize your schedule with intelligent event management and smart reminders.",
                                gradient: "from-indigo-50 to-purple-50",
                                iconBg: "bg-indigo-100"
                            },
                            {
                                icon: <CheckCircle className="w-8 h-8 text-green-600" />,
                                title: "Task Management",
                                description: "Track and complete tasks with priority levels, deadlines, and progress tracking.",
                                gradient: "from-green-50 to-emerald-50",
                                iconBg: "bg-green-100"
                            },
                            {
                                icon: <FileText className="w-8 h-8 text-blue-600" />,
                                title: "Rich Notes",
                                description: "Create, organize, and search through your notes with powerful rich text editing.",
                                gradient: "from-blue-50 to-cyan-50",
                                iconBg: "bg-blue-100"
                            },
                            {
                                icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
                                title: "AI Assistant",
                                description: "Get intelligent help and insights from our advanced AI-powered chat assistant.",
                                gradient: "from-purple-50 to-pink-50",
                                iconBg: "bg-purple-100"
                            },
                            {
                                icon: <BarChart3 className="w-8 h-8 text-yellow-600" />,
                                title: "Analytics Dashboard",
                                description: "Track your productivity patterns and get insights to optimize your workflow.",
                                gradient: "from-yellow-50 to-orange-50",
                                iconBg: "bg-yellow-100"
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-red-600" />,
                                title: "Secure & Private",
                                description: "Your data is encrypted and protected with enterprise-grade security measures.",
                                gradient: "from-red-50 to-rose-50",
                                iconBg: "bg-red-100"
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group backdrop-blur-sm border border-white/20`}
                            >
                                <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Stack Section */}
            <section id="tech" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Built with
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Modern Technology</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            AuraOne leverages cutting-edge web technologies to deliver a fast, secure, and scalable productivity experience.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Tech Stack Cards */}
                            <div className="space-y-6">
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/30">
                                    <div className="flex items-center mb-6">
                                        <Zap className="w-6 h-6 text-indigo-600 mr-3" />
                                        <h3 className="text-xl font-bold text-gray-900">Frontend Excellence</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { name: "React 18", color: "bg-blue-100 text-blue-700" },
                                            { name: "TypeScript", color: "bg-cyan-100 text-cyan-700" },
                                            { name: "Tailwind CSS", color: "bg-purple-100 text-purple-700" },
                                            { name: "Vite", color: "bg-orange-100 text-orange-700" }
                                        ].map((tech, index) => (
                                            <span key={index} className={`px-4 py-2 rounded-lg text-sm font-medium ${tech.color}`}>
                                                {tech.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/30">
                                    <div className="flex items-center mb-6">
                                        <Globe className="w-6 h-6 text-indigo-600 mr-3" />
                                        <h3 className="text-xl font-bold text-gray-900">Backend & Services</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { name: "Firebase", color: "bg-green-100 text-green-700" },
                                            { name: "AI Integration", color: "bg-yellow-100 text-yellow-700" },
                                            { name: "Real-time Sync", color: "bg-red-100 text-red-700" },
                                            { name: "PWA Ready", color: "bg-indigo-100 text-indigo-700" }
                                        ].map((tech, index) => (
                                            <span key={index} className={`px-4 py-2 rounded-lg text-sm font-medium ${tech.color}`}>
                                                {tech.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Benefits List */}
                            <div className="space-y-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose AuraOne?</h3>
                                {[
                                    {
                                        icon: <Clock className="w-6 h-6 text-indigo-600" />,
                                        title: "Lightning Fast",
                                        description: "Built with Vite and optimized for performance, AuraOne loads instantly and responds quickly to every interaction."
                                    },
                                    {
                                        icon: <Lock className="w-6 h-6 text-green-600" />,
                                        title: "Enterprise Security",
                                        description: "Your data is protected with Firebase's enterprise-grade security and end-to-end encryption."
                                    },
                                    {
                                        icon: <Smartphone className="w-6 h-6 text-purple-600" />,
                                        title: "Cross-Platform",
                                        description: "Access AuraOne from any device - desktop, tablet, or mobile - with our responsive design."
                                    },
                                    {
                                        icon: <Heart className="w-6 h-6 text-red-600" />,
                                        title: "User-Centric Design",
                                        description: "Every feature is designed with user experience in mind, making productivity enjoyable and intuitive."
                                    }
                                ].map((benefit, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                                            {benefit.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                                            <p className="text-gray-600">{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Ready to Transform Your Productivity?
                        </h2>
                        <p className="text-xl text-indigo-100 mb-12 leading-relaxed">
                            Join thousands of users who have already revolutionized their workflow with AuraOne.
                            Start your free journey today and experience the future of productivity.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link
                                to="/signup"
                                className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center group"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/login"
                                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-200 transform hover:scale-105"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">AuraOne</span>
                            </div>
                            <p className="text-gray-400">
                                Your all-in-one productivity hub for the modern digital workspace.
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Beta Version</span>
                                </span>
                                <span>•</span>
                                <span>Free to use</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><button onClick={scrollToFeatures} className="hover:text-white transition-colors text-left">Features</button></li>
                                <li><button onClick={scrollToTech} className="hover:text-white transition-colors text-left">Technology</button></li>
                                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                                <li><Link to="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Get in Touch</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a 
                                        href="mailto:dhyan.work.2815@gmail.com" 
                                        className="hover:text-white transition-colors"
                                    >
                                        dhyan.work.2815@gmail.com
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="https://dhyan-patel.onrender.com" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-colors"
                                    >
                                        Developer Portfolio
                                    </a>
                                </li>
                                <li className="text-sm text-gray-500">
                                    We're just getting started! 
                                    <br />
                                    Your feedback shapes our future.
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 AuraOne. All rights reserved.</p>
                        <p> Developed by Dhyan Patel </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

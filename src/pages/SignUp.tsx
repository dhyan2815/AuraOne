import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, Calendar, MessageSquare, FileText, Sparkles, Shield, Zap, Users } from "lucide-react";
import toast from "react-hot-toast";
import SignUpPicture from "../assets/flat-illustration-3.png"

const SignUp = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSigningUp, setIsSigningUp] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {

        e.preventDefault();
        setIsSigningUp(true);
        try {
            const userCredentails = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredentails.user;

            await setDoc(doc(db, "users", user.uid), { name, email, createdAt: new Date() });
            console.log("User Registered with Name: ", name);
        } catch (err: any) {
            setError(err.message);
            toast.error(`Registration Failed: ${err.message}`)
        }
        toast.success("Registration Successfull")
        navigate("/dashboard"); // Redirect to dashboard after successful signup!
    };

    return (
        <div className="signup min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-6">
                <div className="text-center mb-6">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Your All-in-One
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Productivity Hub</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Manage tasks, notes, calendar, and more in one beautiful workspace.
                        Join many of users who've transformed their productivity.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-8">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Free forever</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Setup in 2 minutes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-width Image and Credential Section */}
            <div className="px-4 pb-16">
                <div className="md:flex md:max-w-screen-xl lg:max-w-screen-2xl mx-auto">
                    {/* Image Section (Left) */}
                    <div className="md:w-full flex items-center justify-center rounded-xl mb-8 md:mb-0 z-0">
                        <img src={SignUpPicture} alt="signup art" className="w-full rounded-xl h-full object-cover shadow-2xl" />
                    </div>

                    <div className="md:w-1/2 flex items-center rounded-xl justify-center bg-white shadow-xl z-10">
                        <form
                            onSubmit={handleSignUp}
                            className="w-full px-8 py-9 space-y-7"
                            style={{ minWidth: 340 }}
                            autoComplete="off"
                        >
                            {/* Logo and Brand */}
                            <div className="flex items-center">
                                <span className="font-bold text-2xl text-indigo-700 tracking-wide">AuraOne</span>
                            </div>

                            {/* Enhanced Heading */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Start Your Journey Today</h2>
                                <p className="text-gray-500 text-base">Join the productivity revolution and get organized instantly.</p>
                            </div>

                            {/* Display error */}
                            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}

                            {/* Name Input */}
                            <div>
                                <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Your name"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@gmail.com"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="********"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Enhanced Sign Up Button */}
                            <button
                                type="submit"
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                disabled={isSigningUp}
                            >
                                {isSigningUp ? 'Creating Your Account...' : '🚀 Start Your Free Journey'}
                            </button>

                            {/* Security Note */}
                            <p className="text-xs text-center text-gray-500">
                                🔒 Your data is encrypted and secure. We never share your information.
                            </p>

                            {/* Existing User? */}
                            <p className="text-sm text-center text-gray-500 mt-4">
                                Already a part of Aura?{" "}
                                <Link
                                    to="/login"
                                    className="text-indigo-600 font-semibold hover:underline"
                                >
                                    Login here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {/* Feature Highlights Section */}
            <div className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Stay Productive</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            AuraOne combines all your essential tools in one beautiful, intuitive interface
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Smart Calendar</h3>
                            <p className="text-gray-600 text-sm">Organize your schedule with intelligent event management</p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Task Management</h3>
                            <p className="text-gray-600 text-sm">Track and complete tasks with priority and deadline features</p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Rich Notes</h3>
                            <p className="text-gray-600 text-sm">Create, organize, and search through your notes effortlessly</p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">AI Assistant</h3>
                            <p className="text-gray-600 text-sm">Get help and insights from our intelligent chat assistant</p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Smart Widgets</h3>
                            <p className="text-gray-600 text-sm">Weather, news, and productivity widgets at your fingertips</p>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                            <p className="text-gray-600 text-sm">Your data is encrypted and protected with enterprise-grade security</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Showcase Section */}
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Modern Productivity</h2>
                        <p className="text-lg text-gray-600">A comprehensive dashboard that brings together all your essential tools</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-indigo-600 mb-2">5+</div>
                            <div className="text-gray-600">Core Features</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
                            <div className="text-gray-600">Free & Open Source</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-indigo-600 mb-2">Instant</div>
                            <div className="text-gray-600">Smart Productivity Tools</div>
                        </div>
                    </div>

                    {/* Technology Stack Section */}
                    <div className="bg-white p-8">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <Zap className="w-6 h-6 text-indigo-600" />
                            <span className="text-lg font-semibold text-gray-900">Built with Modern Tech Stack</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Frontend Excellence</h4>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">React 18</span>
                                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full">TypeScript</span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Tailwind CSS</span>
                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Vite</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Backend & Services</h4>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Firebase</span>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">AI Integration</span>
                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">Real-time Sync</span>
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">PWA Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Boost Your Productivity?</h2>
                    <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                        Experience the power of modern web technologies in a beautiful, functional dashboard
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/signup"
                            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;

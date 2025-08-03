import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import SignUpPicture from "../assets/flat-illustration-1.jpg"

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
        <div className="signup min-h-screen flex items-center justify-center px-4">
            <div className="md:flex md:w-full md:max-w-screen-xl lg:max-w-screen-2xl">
                {/* Image Section (Left) */}
                <div className="md:w-1/2 flex items-center justify-center">
                    <img src={SignUpPicture} alt="signup art" className="w-full h-auto object-cover" />
                </div>

                <div className="md:w-1/2 flex items-center justify-center bg-white">
                    <form
                        onSubmit={handleSignUp}
                        className="w-full px-8 py-9 rounded-2xl space-y-7"
                        style={{ minWidth: 340 }}
                        autoComplete="off"
                    >
                        {/* Logo and Brand (optional, consistent with Login) */}
                        <div className="flex items-center">
                            <span className="font-bold text-2xl text-indigo-700 tracking-wide">AuraOne</span>
                        </div>

                        {/* Heading */}
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">Create your AuraOne account</h2>
                        <p className="text-gray-500 text-base mb-4">Sign up to access your workspace and get started.</p>

                        {/* Display error */}
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Your name"
                                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-colors shadow-sm"
                            disabled={isSigningUp}
                        >
                            {isSigningUp ? 'Signing Up...' : 'Sign Up'}
                        </button>

                        {/* Forgot Password Link */}
                        <div className="text-center">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Forgot your password?
                            </Link>
                        </div>

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
    );
};

export default SignUp;

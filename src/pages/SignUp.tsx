import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const SignUp = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredentails = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredentails.user;

            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                password,
                createdAt: new Date(),
            });
            console.log("User Registered with Name: ", name);
        } catch (err: any) {
            setError(err.message);
        }
        toast.success("Registration Successfull")
        navigate("/dashboard"); // Redirect to dashboard after successful signup!
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <form
                onSubmit={handleSignUp}
                className="w-full max-w-md bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md space-y-4"
            >
                <div className="font-semibold text-center space-y-1">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
                        Join Aura ✨
                    </h2>
                    <p className="text-sm font-semibold text-center text-gray-400 dark:text-gray-300">
                        Let’s create your account to begin
                    </p>
                </div>

                {/* display error */}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="space-y-4">
                    {/* Name input */}
                    <input
                        type="text"
                        placeholder="Name"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {/* Email input */}
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {/* Password Input */}
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {/* Password Visbility */}
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Sign Up button */}
                <button
                    type="submit"
                    className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                >
                    Sign Up
                </button>

                {/* Existing User? */}
                <p className="text-base text-center text-gray-600 dark:text-gray-300">
                    Already a part of Aura?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 hover:underline dark:text-blue-600"
                    >
                        Login here
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default SignUp;

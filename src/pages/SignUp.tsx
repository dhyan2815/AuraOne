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
            const userCredentails = await createUserWithEmailAndPassword(auth,email, password);
            const user = userCredentails.user;

            await setDoc(doc(db, "users", user.uid), { name, email, password, createdAt: new Date()});
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

            {/* Sign-Up Form Section (Right) */}
            <div className="md:w-1/2 flex items-center justify-center">
                <form
                    onSubmit={handleSignUp}
                    className="w-full max-w-md bg-white p-4 rounded-xl space-y-4"
                >
                    <div className="font-semibold text-center space-y-1">
                        <h2 className="text-2xl font-semibold text-center text-gray-800 ">
                            Join Aura ✨
                        </h2>
                        <p className="text-sm font-semibold text-center text-gray-400 ">
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
                            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {/* Email input */}
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {/* Password Input */}
                        <div className="relative w-full">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white  text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {/* Password Visbility */}
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 "
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
                        disabled={isSigningUp}
                    >
                        {isSigningUp ? 'Signing Up..' : 'Sign Up'}
                    </button>

                    {/* Existing User? */}
                    <p className="text-base text-center text-gray-600">
                        Already a part of Aura?{" "}
                        <Link
                            to="/login"
                            className="text-blue-600 hover:underline"
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

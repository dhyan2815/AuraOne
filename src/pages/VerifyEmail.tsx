import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const VerifyEmail = () => {
    const { user, sendEmailVerification, isEmailVerified } = useAuth();
    const navigate = useNavigate();
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Redirect if no user or already verified
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        
        if (isEmailVerified) {
            navigate("/dashboard");
            return;
        }
    }, [user, isEmailVerified, navigate]);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResendEmail = async () => {
        setIsResending(true);
        const result = await sendEmailVerification();
        
        if (result.success) {
            toast.success("Verification email sent successfully!");
            setCountdown(60); // 60 second cooldown
        } else {
            toast.error(`Failed to send email: ${result.error}`);
        }
        setIsResending(false);
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    if (!user) {
        return null; // Will redirect to login
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                    <p className="text-gray-600">
                        We've sent a verification link to
                    </p>
                    <p className="text-indigo-600 font-semibold break-all">
                        {user.email}
                    </p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Next steps:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Check your email inbox (and spam folder)</li>
                                <li>Click the verification link in the email</li>
                                <li>Return here and refresh the page</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        I've Verified My Email
                    </button>

                    {/* Resend Email Button */}
                    <button
                        onClick={handleResendEmail}
                        disabled={isResending || countdown > 0}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                            isResending || countdown > 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {isResending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                Sending...
                            </>
                        ) : countdown > 0 ? (
                            `Resend in ${countdown}s`
                        ) : (
                            <>
                                <Mail className="w-4 h-4" />
                                Resend Verification Email
                            </>
                        )}
                    </button>

                    {/* Back to Login */}
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>
                </div>

                {/* Success State (hidden by default, shown when verified) */}
                {isEmailVerified && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="font-medium text-green-800">Email verified successfully!</p>
                                <p className="text-sm text-green-700">Redirecting to dashboard...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;

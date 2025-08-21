import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../services/firebase";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

const EmailVerificationHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleVerification = async () => {
            const oobCode = searchParams.get('oobCode');
            
            if (!oobCode) {
                setStatus('error');
                setMessage('Invalid verification link. Please try again.');
                return;
            }

            try {
                await verifyEmail(oobCode);
                setStatus('success');
                setMessage('Email verified successfully! Redirecting to login...');
                toast.success('Email verified successfully!');
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);
                
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'Verification failed. Please try again.');
                toast.error('Email verification failed');
            }
        };

        handleVerification();
    }, [searchParams, navigate]);

    const getStatusIcon = () => {
        switch (status) {
            case 'loading':
                return <Loader className="w-12 h-12 text-indigo-600 animate-spin" />;
            case 'success':
                return <CheckCircle className="w-12 h-12 text-green-600" />;
            case 'error':
                return <XCircle className="w-12 h-12 text-red-600" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'loading':
                return 'text-indigo-600';
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
        }
    };

    const getStatusBg = () => {
        switch (status) {
            case 'loading':
                return 'bg-indigo-50 border-indigo-200';
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center">
                    <div className="mb-6">
                        {getStatusIcon()}
                    </div>
                    
                    <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
                        {status === 'loading' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </h1>
                    
                    <div className={`p-4 rounded-lg border ${getStatusBg()} mb-6`}>
                        <p className="text-sm">
                            {message}
                        </p>
                    </div>

                    {status === 'error' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/verify-email')}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Go to Verification Page
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-sm text-gray-600">
                            <p>You will be redirected automatically...</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Click here if not redirected
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationHandler;

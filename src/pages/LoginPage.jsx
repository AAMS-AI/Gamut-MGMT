import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-2xl shadow-primary-500/50 mb-4">
                        <span className="text-3xl font-bold text-white">G</span>
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-2">Gamut</h1>
                    <p className="text-gray-400">AI-Powered Claims Management</p>
                </div>

                <div className="card border-slate-700">
                    <h2 className="text-2xl font-bold text-gray-100 mb-6">Sign In</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/100/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
                            <LogIn size={20} />
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                        <p className="text-xs font-medium text-gray-300 mb-2">Demo Credentials:</p>
                        <div className="space-y-1 text-xs text-gray-400">
                            <p><strong className="text-primary-400">Org Owner:</strong> owner@gamut.com / owner123 (All Teams)</p>
                            <p><strong className="text-accent-400">Manager:</strong> manager1@gamut.com / manager123 (Team 1 Only)</p>
                            <p><strong className="text-accent-400">Manager (Admin):</strong> manager2@gamut.com / manager123 (All Teams)</p>
                            <p><strong className="text-gray-400">Member:</strong> member@gamut.com / member123 (Own Info)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

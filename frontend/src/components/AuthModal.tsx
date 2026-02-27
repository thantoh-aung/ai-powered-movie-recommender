"use client";

import React, { useState } from 'react';

interface AuthModalProps {
    onClose: () => void;
    onLoginSuccess: (user: { user_id: number; username: string }) => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const API_URL = rawApiUrl.replace(/\/$/, '');
        const endpoint = isLogin ? '/api/auth/login/' : '/api/auth/register/';

        try {
            const body = isLogin
                ? { username, password }
                : { username, password, age: age === '' ? 18 : age };

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Success
            localStorage.setItem('ai_user_id', data.user_id);
            localStorage.setItem('ai_username', data.username);

            // Registration returns the age, logins might not if we didn't update the login view, 
            // but we can assume age is handled strictly backend-side or via a separate profile fetch.
            if (data.age) localStorage.setItem('ai_user_age', data.age.toString());

            onLoginSuccess({ user_id: data.user_id, username: data.username });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl w-full max-w-md relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Username</label>
                        <input
                            type="text"
                            required
                            value={username ?? ''}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="johndoe"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password ?? ''}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Age</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="120"
                                value={age}
                                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="18"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors mt-6"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-gray-400 hover:text-indigo-400 text-sm transition-colors"
                    >
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}

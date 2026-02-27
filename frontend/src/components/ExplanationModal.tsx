import React from 'react';

interface Movie {
    title: string;
    explanation: string;
    overview?: string;
    cast?: string[];
    rating?: number;
    year?: string;
    poster_url: string;
    tmdb_id?: number;
}

interface ExplanationModalProps {
    movie: Movie;
    onClose: () => void;
}

import { motion } from 'framer-motion';

export default function ExplanationModal({ movie, onClose }: ExplanationModalProps) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl max-w-2xl w-full p-0 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col max-h-[90vh]"
            >

                {/* Header Image Section */}
                <div className="relative h-48 sm:h-64 w-full shrink-0">
                    <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-gray-300 hover:text-white hover:bg-black transition-colors z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="absolute bottom-4 left-6 pr-6">
                        <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">{movie.title} <span className="font-light text-gray-300">({movie.year})</span></h2>
                        {movie.rating && (
                            <div className="flex items-center gap-2 text-yellow-500 font-bold bg-black/40 w-max px-3 py-1 rounded-full text-sm">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                {movie.rating} / 10
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 overflow-y-auto space-y-8">
                    {/* The Explainable AI Core Part - VISUALIZER */}
                    <div className="mb-2">
                        <div className="flex items-center gap-3 mb-4 text-indigo-400">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            <h3 className="font-bold text-lg uppercase tracking-wider">Prolog XAI Logic Trace</h3>
                        </div>

                        {/* Interactive Tree UI */}
                        <div className="flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-xl text-[#E5E7EB] shadow-md text-sm"
                            >
                                User Constraints
                            </motion.div>

                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 24 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                                className="w-0.5 bg-indigo-500/50"
                            />

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 p-4 rounded-xl text-center w-full shadow-[0_0_15px_rgba(79,70,229,0.15)]"
                            >
                                <p className="text-[#E5E7EB] leading-relaxed font-mono">
                                    {movie.explanation}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 24 }}
                                transition={{ delay: 0.8, duration: 0.3 }}
                                className="w-0.5 bg-green-500/50"
                            />

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.1 }}
                                className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-6 py-2 rounded-xl text-emerald-300 font-bold shadow-md"
                            >
                                Match: {movie.title}
                            </motion.div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div>
                        <h3 className="text-gray-400 font-bold uppercase text-sm mb-2 tracking-wider">Synopsis</h3>
                        <p className="text-gray-300 leading-relaxed text-sm md:text-base">{movie.overview || "No description available."}</p>
                    </div>

                    {movie.cast && movie.cast.length > 0 && (
                        <div>
                            <h3 className="text-gray-400 font-bold uppercase text-sm mb-2 tracking-wider">Starring</h3>
                            <div className="flex flex-wrap gap-2">
                                {movie.cast.map((actor, idx) => (
                                    <span key={idx} className="bg-white/5 backdrop-blur-md text-[#E5E7EB] px-3 py-1 rounded-full text-sm font-medium border border-white/10">
                                        {actor}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 shrink-0 flex gap-4">
                    {movie.tmdb_id && (
                        <a
                            href={`https://vidsrc.me/embed/movie?tmdb=${movie.tmdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-8 py-3 bg-gradient-to-br from-indigo-500 to-cyan-400 hover:opacity-90 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(99,102,241,0.39)]"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z" /></svg>
                            Watch Movie
                        </a>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 px-8 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/15 text-[#E5E7EB] rounded-xl font-bold transition-all"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

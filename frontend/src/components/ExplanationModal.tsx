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

export default function ExplanationModal({ movie, onClose }: ExplanationModalProps) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full p-0 shadow-2xl relative animate-scale-up overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header Image Section */}
                <div className="relative h-48 sm:h-64 w-full shrink-0">
                    <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-gray-300 hover:text-white hover:bg-black transition-colors"
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
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* The Explainable AI Core Part */}
                    <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3 text-indigo-400">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            <h3 className="font-bold text-lg uppercase tracking-wider">AI Reasoning</h3>
                        </div>
                        <p className="text-gray-200 text-lg leading-relaxed font-mono">
                            {movie.explanation}
                        </p>
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
                                    <span key={idx} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-gray-700">
                                        {actor}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-800 shrink-0 flex gap-4">
                    {movie.tmdb_id && (
                        <a
                            href={`https://vidsrc.to/embed/movie/${movie.tmdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z" /></svg>
                            Watch Movie
                        </a>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

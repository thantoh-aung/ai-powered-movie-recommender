import React from 'react';

interface Movie {
    title: string;
    explanation: string;
    poster_url: string;
    rating?: number;
}

interface MovieCardProps {
    movie: Movie;
    onExplainClick: (movie: Movie) => void;
}

export default function MovieCard({ movie, onExplainClick }: MovieCardProps) {
    return (
        <div className="bg-white/5 backdrop-blur-md rounded-[20px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)] duration-300 border border-white/10 flex flex-col h-full group">
            <div className="relative w-full aspect-[2/3] bg-[#0B0F14] border-b border-white/10 overflow-hidden">
                <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0B0F14] to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                {movie.rating && (
                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-yellow-400 font-bold px-2 py-1 rounded-lg text-sm flex items-center gap-1 border border-white/10">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {movie.rating}
                    </div>
                )}
            </div>
            <div className="p-5 flex flex-col flex-grow justify-between bg-white/5 backdrop-blur-md border-t border-white/10">
                <h3 className="text-xl font-bold text-[#E5E7EB] mb-4 line-clamp-2">{movie.title}</h3>
                <button
                    onClick={() => onExplainClick(movie)}
                    className="w-full bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/20 text-[#E5E7EB] py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-white/15 shadow-md hover:shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Why this movie?
                </button>
            </div>
        </div>
    );
}

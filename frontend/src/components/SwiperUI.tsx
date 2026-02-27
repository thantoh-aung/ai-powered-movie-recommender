"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

export default function SwiperUI({ movies, onLike, onDislike, onExplain }: any) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [feedback, setFeedback] = useState<{ message: string, type: 'like' | 'dislike' } | null>(null);

    const showFeedback = (message: string, type: 'like' | 'dislike') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 1000);
    };

    const handleDragEnd = (e: any, info: PanInfo) => {
        const x = info.offset.x;
        const width = window.innerWidth;
        const threshold = width * 0.2; // swipe 20% of screen to trigger

        if (x > threshold) {
            handleSwipeRight();
        } else if (x < -threshold) {
            handleSwipeLeft();
        }
    };

    const handleSwipeRight = () => {
        if (currentIndex >= movies.length) return;
        onLike(movies[currentIndex]);
        showFeedback("Liked: Updating Prolog KB", "like");
        setCurrentIndex(prev => prev + 1);
    };

    const handleSwipeLeft = () => {
        if (currentIndex >= movies.length) return;
        onDislike(movies[currentIndex]);
        showFeedback("Passed", "dislike");
        setCurrentIndex(prev => prev + 1);
    };

    if (currentIndex >= movies.length) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-gray-400 bg-gray-800/50 rounded-2xl border border-gray-700">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                <p className="text-xl font-bold">You've reached the end!</p>
                <p>Tweak your preferences for more movies.</p>
            </div>
        );
    }

    const currentMovie = movies[currentIndex];

    return (
        <div className="relative h-[600px] w-full max-w-sm mx-auto flex items-center justify-center">

            {/* Feedback Toast */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`absolute top-4 z-50 px-6 py-2 rounded-full font-bold text-white shadow-xl border ${feedback.type === 'like' ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}`}
                    >
                        {feedback.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                <motion.div
                    key={currentMovie.title}
                    initial={{ scale: 0.95, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.2 } }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing flex flex-col"
                >
                    <div className="relative flex-grow pointer-events-none">
                        <img
                            src={currentMovie.poster_url}
                            alt={currentMovie.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                            <h2 className="text-3xl font-extrabold text-white leading-tight drop-shadow-md">{currentMovie.title}</h2>
                            <p className="text-gray-300 mt-2 line-clamp-2">{currentMovie.overview}</p>
                        </div>
                    </div>
                    {/* Controls */}
                    <div className="h-24 bg-gray-900 flex items-center justify-center gap-6 shrink-0 border-t border-gray-800">
                        <button
                            onClick={handleSwipeLeft}
                            className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/20 hover:scale-110 transition-all shadow-lg"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <button
                            onClick={() => onExplain(currentMovie)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full transition-colors shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                        >
                            Why this?
                        </button>

                        <button
                            onClick={handleSwipeRight}
                            className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-green-500 hover:bg-green-500/20 hover:scale-110 transition-all shadow-lg"
                        >
                            <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="absolute -bottom-16 text-center text-gray-500 text-sm w-full">
                Swipe Right to Like • Swipe Left to Pass
            </div>
        </div>
    );
}

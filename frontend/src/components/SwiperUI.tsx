"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

export default function SwiperUI({ movies, onLike, onDislike, onExplain }: any) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [expanded, setExpanded] = useState(false);

    // Motion values for swipe tracking on the top card
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);

    // Dynamic Opacity for the LIKE / PASS stamps
    const likeOpacity = useTransform(x, [20, 100], [0, 1]);
    const passOpacity = useTransform(x, [-20, -100], [0, 1]);

    const handleDragEnd = (e: any, info: any) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        const swipeRight = offset > 100 || velocity > 500;
        const swipeLeft = offset < -100 || velocity < -500;

        if (swipeRight) {
            handleLike();
        } else if (swipeLeft) {
            handlePass();
        } else {
            // Spring back if not swiped far enough
            setExpanded(false);
        }
    };

    const handleLike = () => {
        if (currentIndex >= movies.length) return;
        onLike(movies[currentIndex]);
        setExpanded(false);
        x.set(0); // reset position for next card behind it instantly
        setCurrentIndex(prev => prev + 1);
    };

    const handlePass = () => {
        if (currentIndex >= movies.length) return;
        onDislike(movies[currentIndex]);
        setExpanded(false);
        x.set(0);
        setCurrentIndex(prev => prev + 1);
    };

    if (currentIndex >= movies.length) {
        return (
            <div className="h-[600px] flex flex-col items-center justify-center text-[#9CA3AF] bg-white/5 backdrop-blur-md rounded-[20px] border border-white/10 shadow-lg">
                <svg className="w-20 h-20 mb-6 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                <p className="text-2xl font-bold text-[#E5E7EB]">You've reached the end!</p>
                <p className="mt-2 text-lg">Tweak your preferences for more movies.</p>
            </div>
        );
    }

    // We render up to 3 cards for the stacked 3D dropoff effect
    const visibleCards = movies.slice(currentIndex, currentIndex + 3);

    return (
        <div className="relative h-[650px] w-full max-w-sm mx-auto flex items-center justify-center">

            <AnimatePresence>
                {[...visibleCards].reverse().map((movie: any, reverseIndex: number) => {
                    // Because we reversed, the real top card is the LAST one in the mapped array
                    const isTop = reverseIndex === visibleCards.length - 1;
                    const visualIndex = visibleCards.length - 1 - reverseIndex; // 0 for Top, 1 for Second, 2 for Third

                    return (
                        <motion.div
                            key={movie.title}
                            className="absolute inset-0 w-full h-full rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/10 bg-[#0B0F14]"
                            style={{
                                x: isTop ? x : 0,
                                rotate: isTop ? rotate : 0,
                                zIndex: isTop ? 10 : 10 - visualIndex
                            }}
                            drag={isTop ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={isTop ? handleDragEnd : undefined}
                            // 3D Stacking Animations
                            initial={{
                                scale: 1 - visualIndex * 0.05,
                                y: -visualIndex * 30,
                                opacity: 1 - visualIndex * 0.2
                            }}
                            animate={{
                                scale: 1 - visualIndex * 0.05,
                                y: -visualIndex * 30,
                                opacity: 1 - visualIndex * 0.1
                            }}
                            exit={{
                                y: -100,
                                x: x.get() > 0 ? 500 : -500,
                                opacity: 0,
                                rotate: x.get() > 0 ? 30 : -30,
                                transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            whileDrag={{ cursor: "grabbing", scale: 1.02 }}
                            whileTap={{ cursor: "grabbing" }}
                        >
                            {/* --- THE POSTER BACKGROUND --- */}
                            <div className="absolute inset-0 z-0 pointer-events-none bg-[#0B0F14]">
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/80 to-transparent"></div>
                                {/* Darken stack depth overlay - smoothly brightens as it comes forward */}
                                <motion.div
                                    className="absolute inset-0 bg-black pointer-events-none"
                                    animate={{ opacity: visualIndex * 0.35 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            </div>


                            {/* --- DYNAMIC SWIPE STAMPS (Only on Top Card) --- */}
                            {isTop && (
                                <>
                                    <motion.div style={{ opacity: likeOpacity }} className="absolute top-12 left-8 z-30 pointer-events-none transform -rotate-12">
                                        <div className="border-4 border-emerald-400 text-emerald-400 font-black text-4xl uppercase tracking-widest px-4 py-2 rounded-xl backdrop-blur-sm bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.5)]">LIKE</div>
                                    </motion.div>
                                    <motion.div style={{ opacity: passOpacity }} className="absolute top-12 right-8 z-30 pointer-events-none transform rotate-12">
                                        <div className="border-4 border-rose-500 text-rose-500 font-black text-4xl uppercase tracking-widest px-4 py-2 rounded-xl backdrop-blur-sm bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.5)]">PASS</div>
                                    </motion.div>
                                </>
                            )}

                            {/* --- CONTENT LAYER --- */}
                            <div className="relative z-10 flex flex-col h-full justify-end px-6 pb-6 pointer-events-none">
                                {/* Clicking the bottom text toggles expanded view */}
                                <div className="pointer-events-auto cursor-pointer" onClick={() => setExpanded(!expanded)}>
                                    <h2 className="text-4xl font-extrabold text-[#E5E7EB] leading-tight drop-shadow-lg mb-2 capitalize">
                                        {movie.title} <span className="text-xl font-normal text-gray-400">{movie.year}</span>
                                    </h2>

                                    {/* Sub-tags (Genres) */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {movie.rating && (
                                            <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md flex items-center gap-1">
                                                ⭐ {movie.rating}
                                            </span>
                                        )}
                                        {movie.genres?.slice(0, 2).map((g: string) => (
                                            <span key={g} className="bg-white/10 text-gray-200 border border-white/10 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md capitalize">
                                                {g}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Expandable Overview */}
                                    <motion.div
                                        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
                                        className="overflow-hidden text-gray-300 text-sm leading-relaxed"
                                    >
                                        <p className="mb-4">{movie.overview}</p>
                                        {movie.cast && (
                                            <p className="text-xs text-gray-400 border-t border-white/10 pt-2">
                                                <span className="font-bold">Cast:</span> {movie.cast.join(', ')}
                                            </p>
                                        )}
                                    </motion.div>

                                    {!expanded && (
                                        <p className="text-gray-400 text-sm flex items-center justify-center gap-2 mb-4 animate-pulse">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                            Tap to expand
                                        </p>
                                    )}
                                </div>

                                {/* --- ACTION BUTTONS (Only interactive on top card) --- */}
                                <div className={`flex items-center justify-between mt-4 ${!isTop && 'opacity-0 pointer-events-none'}`}>

                                    {/* Pass Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9, rotate: -15 }}
                                        onClick={handlePass}
                                        className="w-16 h-16 bg-white/5 border border-rose-500/30 backdrop-blur-xl rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500/20 hover:border-rose-500 transition-colors shadow-lg pointer-events-auto"
                                    >
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </motion.button>

                                    {/* Custom AI Explanation Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onExplain(movie)}
                                        className="relative pointer-events-auto bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full p-[2px] shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                    >
                                        <div className="bg-[#0B0F14] rounded-full px-6 py-3 h-full w-full flex items-center justify-center">
                                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-300 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                                                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                Why This?
                                            </span>
                                        </div>
                                    </motion.button>

                                    {/* Like Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9, rotate: 15 }}
                                        onClick={handleLike}
                                        className="w-16 h-16 bg-white/5 border border-emerald-400/30 backdrop-blur-xl rounded-full flex items-center justify-center text-emerald-400 hover:bg-emerald-400/20 hover:border-emerald-400 transition-colors shadow-lg pointer-events-auto"
                                    >
                                        <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

        </div>
    );
}

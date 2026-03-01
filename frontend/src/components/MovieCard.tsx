import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

interface Movie {
    title: string;
    explanation: string;
    poster_url: string;
    rating?: number;
}

interface MovieCardProps {
    movie: Movie;
    onExplainClick: (movie: Movie) => void;
    index?: number;
}

export default function MovieCard({ movie, onExplainClick, index = 0 }: MovieCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse position variables for 3D Tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth physics
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    // Define rotation based on mouse position
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    // Calculate glare lighting position unconditionally to avoid React Hook errors
    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);
    const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.15) 0%, transparent 60%)`;

    // Calculate mouse position relative to card center
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{ perspective: 1200 }}
            className="h-full"
        >
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX: isHovered ? rotateX : 0,
                    rotateY: isHovered ? rotateY : 0,
                    transformStyle: 'preserve-3d',
                }}
                className="relative bg-white/5 backdrop-blur-[2px] rounded-[20px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 border border-white/20 h-full group aspect-[2/3] cursor-pointer"
            >
                {/* Background Image Container */}
                <div
                    className="absolute inset-0 bg-[#0B0F14] overflow-hidden"
                    style={{ transform: "translateZ(-30px)" }} // Push image deep into background
                >
                    <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>

                {/* Glare Effect */}
                {isHovered && (
                    <motion.div
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{ background: glareBackground }}
                    />
                )}

                {/* Always-on Shadow Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0B0F14] to-transparent opacity-90" />

                {/* Rating Badge - Popped Out */}
                {movie.rating && (
                    <div
                        className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-yellow-400 font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 border border-white/20 shadow-xl z-20"
                        style={{ transform: "translateZ(30px)" }}
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {movie.rating}
                    </div>
                )}

                {/* Expanding Glassmorphic Meta-Data Panel */}
                <div
                    className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end transition-all duration-300 ease-out translate-y-1 group-hover:translate-y-0 z-20"
                    style={{ transform: "translateZ(40px)" }} // Pop text over the background
                >
                    <h3 className="text-xl font-extrabold text-[#E5E7EB] mb-1 line-clamp-2 drop-shadow-md">
                        {movie.title}
                    </h3>

                    {/* The Button is hidden by default and slides up on hover */}
                    <div className="overflow-hidden mt-0 max-h-0 opacity-0 group-hover:max-h-16 group-hover:opacity-100 group-hover:mt-3 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onExplainClick(movie);
                            }}
                            className="w-full bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400/50 backdrop-blur-xl text-white py-2 text-sm rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(99,102,241,0.4)] pointer-events-auto"
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Why this movie?
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

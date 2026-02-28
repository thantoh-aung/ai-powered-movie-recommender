"use client";

import React, { useState } from 'react';

interface PreferenceFormProps {
  onSubmit: (preferences: { genre: string; mood: string; age: number; search_query?: string }) => void;
  isLoading: boolean;
  userAge?: number;
}

const genresList = ['Action', 'Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Romance', 'Thriller', 'Animation', 'Fantasy'];
const moodsList = ['Dark', 'Funny', 'Thrilling', 'Heartwarming', 'Thought-Provoking', 'Action-Packed', 'Mind-Bending', 'Romantic'];

export default function PreferenceForm({ onSubmit, isLoading, userAge }: PreferenceFormProps) {
  const [genre, setGenre] = useState('any');
  const [mood, setMood] = useState('any');
  const [age, setAge] = useState<number | ''>(userAge ?? 18);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      genre,
      mood,
      age: userAge ?? (typeof age === 'number' ? age : 18)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-md mx-auto border border-white/10 backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-6 text-[#E5E7EB] tracking-wide">Movie Preferences</h2>

      <div className="mb-6">
        <label className="block text-indigo-400 text-sm font-bold mb-2 uppercase tracking-wider">
          Preferred Genre
        </label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors [&>option]:bg-gray-900"
        >
          <option value="any">Any Genre</option>
          {genresList.map(g => (
            <option key={g} value={g.toLowerCase()}>{g}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-cyan-400 text-sm font-bold mb-2 uppercase tracking-wider">
          Current Mood
        </label>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors [&>option]:bg-gray-900"
        >
          <option value="any">Any Vibe</option>
          {moodsList.map(m => (
            <option key={m} value={m.toLowerCase()}>{m}</option>
          ))}
        </select>
      </div>

      {userAge === undefined ? (
        <div className="mb-8">
          <label className="block text-[#9CA3AF] text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="age">
            Your Age
          </label>
          <input
            type="number" id="age" min="1" max="120"
            value={age ?? 18}
            onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-full bg-white/5 border border-white/10 text-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
      ) : (
        <div className="mb-8 text-center border-t border-white/10 pt-4">
          <span className="text-xs text-indigo-300 font-bold bg-indigo-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-500/20 shadow-md">
            Profile Age Applied ({userAge})
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-4 px-4 rounded-xl text-[#E5E7EB] font-bold text-lg transition-all transform ${isLoading ? 'bg-indigo-800/50 backdrop-blur-md cursor-wait' : 'bg-gradient-to-br from-indigo-500 to-cyan-400 hover:opacity-90 hover:scale-[1.02] active:scale-95 shadow-[0_4px_14px_rgba(99,102,241,0.39)]'}`}
      >
        {isLoading ? 'Consulting AI...' : 'Generate AI Matches'}
      </button>
    </form>
  );
}

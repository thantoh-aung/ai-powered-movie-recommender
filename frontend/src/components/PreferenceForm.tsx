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
      age: userAge ?? (typeof age === 'number' ? age : 18),
      search_query: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/80 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-gray-700 backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-6 text-white tracking-wide">Movie Preferences</h2>

      <div className="mb-6">
        <label className="block text-indigo-400 text-sm font-bold mb-2 uppercase tracking-wider">
          Preferred Genre
        </label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <option value="any">Any Genre</option>
          {genresList.map(g => (
            <option key={g} value={g.toLowerCase()}>{g}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-pink-400 text-sm font-bold mb-2 uppercase tracking-wider">
          Current Mood
        </label>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
        >
          <option value="any">Any Vibe</option>
          {moodsList.map(m => (
            <option key={m} value={m.toLowerCase()}>{m}</option>
          ))}
        </select>
      </div>

      {userAge === undefined ? (
        <div className="mb-8">
          <label className="block text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="age">
            Your Age
          </label>
          <input
            type="number" id="age" min="1" max="120"
            value={age ?? 18}
            onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
      ) : (
        <div className="mb-8 text-center border-t border-gray-700/50 pt-4">
          <span className="text-xs text-indigo-400 font-bold bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-500/30 shadow-[0_0_10px_rgba(79,70,229,0.2)]">
            Profile Age Applied ({userAge})
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg transition-all transform ${isLoading ? 'bg-indigo-800 cursor-wait' : 'bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.4)]'}`}
      >
        {isLoading ? 'Consulting AI...' : 'Generate AI Matches'}
      </button>
    </form>
  );
}

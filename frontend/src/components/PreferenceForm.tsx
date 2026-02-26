"use client";

import React, { useState } from 'react';

interface PreferenceFormProps {
  onSubmit: (preferences: { genre: string; mood: string; age: number }) => void;
  isLoading: boolean;
}

const genres = ['any', 'action', 'sci-fi', 'drama', 'comedy', 'animation', 'crime', 'thriller', 'romance', 'fantasy', 'horror'];
const moods = ['any', 'mind-bending', 'thrilling', 'dark', 'action-packed', 'emotional', 'awe-inspiring', 'thought-provoking', 'tense', 'funny', 'heartwarming', 'lighthearted', 'quirky', 'magical', 'visually-stunning', 'romantic', 'artistic', 'intense'];

export default function PreferenceForm({ onSubmit, isLoading }: PreferenceFormProps) {
  const [genre, setGenre] = useState('any');
  const [mood, setMood] = useState('any');
  const [age, setAge] = useState<number | ''>(18);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      genre,
      mood,
      age: typeof age === 'number' ? age : 18
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md mx-auto border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-white tracking-wide">AI Filters</h2>

      <div className="mb-5">
        <label className="block text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="genre">
          Genre Focus
        </label>
        <select
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        >
          {genres.map(g => (
            <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="block text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="mood">
          Mood / Vibe
        </label>
        <select
          id="mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        >
          {moods.map(m => (
            <option key={m} value={m}>{m.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <label className="block text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="age">
          Your Age
        </label>
        <input
          type="number"
          id="age"
          min="1"
          max="120"
          value={age}
          onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
          className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition-all transform ${isLoading ? 'bg-indigo-800 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-indigo-500/50'}`}
      >
        {isLoading ? 'Consulting AI Engine...' : 'Get AI Recommendation'}
      </button>
    </form>
  );
}

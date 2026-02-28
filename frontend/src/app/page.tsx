"use client";

import { useState, useEffect } from 'react';
import PreferenceForm from '@/components/PreferenceForm';
import MovieCard from '@/components/MovieCard';
import ExplanationModal from '@/components/ExplanationModal';
import AuthModal from '@/components/AuthModal';
import SwiperUI from '@/components/SwiperUI';

interface Movie {
  title: string;
  explanation: string;
  poster_url: string;
  overview?: string;
  cast?: string[];
  rating?: number;
  year?: string;
  popularity?: number;
  tmdb_id?: number;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const [currentPrefs, setCurrentPrefs] = useState({ genre: 'any', mood: 'any', age: 18, search_query: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const [isSwipeMode, setIsSwipeMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<{ user_id: number; username: string; age?: number } | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('ai_user_id');
    const uname = localStorage.getItem('ai_username');
    const uage = localStorage.getItem('ai_user_age');
    if (uid && uname) {
      setUser({
        user_id: parseInt(uid),
        username: uname,
        age: uage ? parseInt(uage) : undefined
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ai_user_id');
    localStorage.removeItem('ai_username');
    localStorage.removeItem('ai_user_age');
    setUser(null);
  };

  const fetchRecommendations = async (preferences: { genre: string; mood: string; age: number; search_query?: string }, isRetry = false) => {
    if (!isRetry) {
      setIsLoading(true);
      setError('');
    }

    try {
      // Use environment variable for production, fallback to localhost for local dev
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const API_URL = rawApiUrl.replace(/\/$/, '');
      const payload = { ...preferences, user_id: user?.user_id };
      const response = await fetch(`${API_URL}/api/recommend/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 202) {
        // Backend is asynchronously building the knowledge base via Celery.
        const data = await response.json();
        setError(data.message); // Temporarily show the building message
        setMovies([]);
        // Poll again in 5 seconds
        setTimeout(() => fetchRecommendations(preferences, true), 5000);
        return;
      }

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to fetch recommendations');

      if (data.message && (!data.recommendations || data.recommendations.length === 0)) {
        setError(data.message);
        setMovies([]);
      } else {
        setError('');
        setMovies(data.recommendations);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      if (!isRetry || (isRetry && error === '')) {
        setIsLoading(false);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations({ ...currentPrefs, search_query: searchQuery });
  };

  const handleFormSubmit = (preferences: { genre: string; mood: string; age: number; search_query?: string }) => {
    setCurrentPrefs({
      ...preferences,
      search_query: preferences.search_query || ''
    });
    fetchRecommendations(preferences);
  };

  const handleRateMovie = async (movie: Movie, liked: boolean) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const API_URL = rawApiUrl.replace(/\/$/, '');
      await fetch(`${API_URL}/api/movie/like/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, tmdb_id: movie.tmdb_id, liked })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Top Nav */}
        <div className="flex justify-end mb-4">
          {user ? (
            <div className="flex items-center gap-4 bg-gray-900 px-4 py-2 rounded-full border border-gray-700">
              <span className="text-gray-300">Welcome, <span className="text-indigo-400 font-bold">{user.username}</span></span>
              <button onClick={handleLogout} className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-gray-300">Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-full font-bold transition-colors shadow-lg">Login / Register</button>
          )}
        </div>

        <header className="mb-10 text-center pt-2">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-indigo-500 mb-4 tracking-tighter">
            Explainable AI Movies
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light mb-8">
            Powered by a transparent Prolog reasoning engine. We don't just recommend movies, we tell you <span className="text-indigo-400 font-semibold">exactly why</span>.
          </p>

          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a movie, actor, or keyword..."
              className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-[#E5E7EB] rounded-full py-4 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all placeholder:text-[#6B7280]"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full transition-colors hidden sm:block"
            >
              Search
            </button>
          </form>

          {movies.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 flex shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <button onClick={() => setIsSwipeMode(false)} className={`px-6 py-2 rounded-full font-bold transition-colors ${!isSwipeMode ? 'bg-indigo-600 text-white' : 'text-[#9CA3AF] hover:text-white'}`}>Grid View</button>
                <button onClick={() => setIsSwipeMode(true)} className={`px-6 py-2 rounded-full font-bold transition-colors ${isSwipeMode ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}>Swipe Mode</button>
              </div>
            </div>
          )}
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Sidebar Area - Preference Form */}
          <div className="lg:w-1/3 shrink-0 lg:sticky lg:top-8 w-full">
            <PreferenceForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              userAge={user?.age}
            />

            {error && (
              <div className="mt-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-center">
                {error}
              </div>
            )}
          </div>

          {/* Main Content Area - Results */}
          <div className="lg:w-2/3">
            {movies.length > 0 ? (
              <div>
                <h2 className="text-3xl font-bold mb-8 border-b border-white/10 pb-4 text-[#E5E7EB]">
                  {isSwipeMode ? 'Discover Movies' : 'Top Matches for You'}
                </h2>

                {isSwipeMode ? (
                  <SwiperUI
                    movies={movies}
                    onLike={(m: Movie) => handleRateMovie(m, true)}
                    onDislike={(m: Movie) => handleRateMovie(m, false)}
                    onExplain={setSelectedMovie}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {movies.map(movie => (
                      <MovieCard
                        key={movie.title}
                        movie={movie}
                        onExplainClick={setSelectedMovie}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              !isLoading && !error && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-[#9CA3AF] border-2 border-dashed border-white/10 rounded-[20px] p-8 text-center bg-white/5 backdrop-blur-md shadow-lg">
                  <svg className="w-20 h-20 mb-6 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                  <p className="text-2xl font-semibold mb-2 text-[#E5E7EB]">No Recommendations Yet</p>
                  <p className="text-lg">Tweak your preferences and ask the AI Engine.</p>
                </div>
              )
            )}

            {isLoading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-800 border-t-red-600 rounded-full animate-spin mb-6"></div>
                <p className="text-xl text-gray-400 animate-pulse">Consulting the Knowledge Base...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedMovie && (
        <ExplanationModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(u) => { setShowAuthModal(false); setUser(u); }}
        />
      )}
    </main>
  );
}

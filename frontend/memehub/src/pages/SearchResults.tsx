import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import memeService, { Meme } from '@/services/memeService';
import MemeGrid from '@/components/MemeGrid';

export default function SearchResults() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    memeService.searchMemes(query)
      .then(setMemes)
      .catch(() => setError('Failed to load search results'))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Searching...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <MemeGrid initialMemes={memes} />
      )}
    </div>
  );
}

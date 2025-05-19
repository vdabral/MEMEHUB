import { useEffect, useState } from 'react';
import memeService, { Meme, normalizeMeme } from '../services/memeService';
import MemeCard from '../components/MemeCard';
import { toast } from 'sonner';

export default function SavedMemes() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      try {
        setLoading(true);
        const saved: any = await memeService.getSavedMemes();
        let memeArr: any[] = [];
        if (Array.isArray(saved)) {
          memeArr = saved;
        } else if (saved && Array.isArray(saved.savedMemes)) {
          memeArr = saved.savedMemes;
        }
        setMemes(memeArr.map(normalizeMeme));
      } catch (e) {
        toast.error('Failed to load saved memes');
        setMemes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, []);

  // Remove meme from state when unsaved
  const handleUnsave = (id: string) => {
    setMemes(memes => memes.filter(meme => meme.id !== id));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Saved Memes</h1>
      {loading && <div className="text-center py-8">Loading...</div>}
      {!loading && memes.length === 0 && (
        <div className="text-center py-8 text-gray-500">No saved memes yet.</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {memes.map(meme => (
          <MemeCard key={meme.id} meme={meme} isSaved={true} onUnsave={handleUnsave} />
        ))}
      </div>
    </div>
  );
}

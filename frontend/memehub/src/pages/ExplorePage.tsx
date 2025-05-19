import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import memeService from '@/services/memeService';
import { toast } from "sonner";

export default function ExplorePage() {
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await memeService.getPopularTags();
        setPopularTags(tags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        toast.error('Failed to load popular tags');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore</h1>

      <div className="mb-12">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold">Popular Tags</h2>
          <div className="ml-2 px-2 py-0.5 bg-meme-purple bg-opacity-10 rounded-full">
            <span className="text-sm text-meme-purple font-medium">{popularTags.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : popularTags.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No popular tags found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularTags.map((tag, index) => (
              <Link
                to={`/?tag=${tag}`}
                key={index}
                className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center"
              >
                <span className="text-meme-purple text-lg font-semibold block mb-1">#{tag}</span>
                <span className="text-xs text-gray-500">View memes</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Popular Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/?sort=trending" className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-800 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Trending</h3>
              <p className="opacity-90">See what's hot right now</p>
            </div>
          </Link>

          <Link to="/?sort=top&filter=week" className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Top of the Week</h3>
              <p className="opacity-90">The week's best memes</p>
            </div>
          </Link>

          <Link to="/?sort=new" className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Fresh Memes</h3>
              <p className="opacity-90">Just uploaded, hot off the press</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Ready to create your own meme?</h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Let your creativity shine by adding your own memes to the community. It only takes a minute to get started.
        </p>
        <Button asChild>
          <Link to="/create">Create a Meme</Link>
        </Button>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";

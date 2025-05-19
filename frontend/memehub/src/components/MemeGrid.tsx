import { useEffect, useState } from 'react';
import MemeCard from './MemeCard';
import { Meme, SortOption, TimeFilter } from '@/services/memeService';
import memeService from '@/services/memeService';
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Calendar, ChevronsUp, RefreshCw } from 'lucide-react';
import MemeCardSkeleton from './MemeCardSkeleton';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface MemeGridProps {
  initialMemes?: Meme[];
  tag?: string;
  sort?: SortOption;
  timeFilter?: TimeFilter;
}

export default function MemeGrid({ initialMemes, tag, sort: parentSort, timeFilter: parentTimeFilter }: MemeGridProps) {
  // Ensure memes is always initialized as an array
  const [memes, setMemes] = useState<Meme[]>(initialMemes || []);
  const [loading, setLoading] = useState(!initialMemes);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<SortOption>(parentSort || 'trending');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(parentTimeFilter || 'today');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { savedMemes } = useAuth();

  useEffect(() => {
    if (parentSort && parentSort !== sort) setSort(parentSort);
  }, [parentSort]);
  useEffect(() => {
    if (parentTimeFilter && parentTimeFilter !== timeFilter) setTimeFilter(parentTimeFilter);
  }, [parentTimeFilter]);

  const loadMemes = async (reset = false) => {
    try {
      const newPage = reset ? 1 : page;
      setLoading(reset);
      const fetchedMemes = await memeService.getAllMemes(sort, timeFilter, newPage, tag);
      const memesArray = Array.isArray(fetchedMemes) ? fetchedMemes : [];
      if (reset) {
        setMemes(memesArray);
      } else {
        setMemes(prev => [...prev, ...memesArray]);
      }
      setPage(newPage + 1);
      setHasMore(memesArray.length > 0);
    } catch (error) {
      console.error('Failed to load memes:', error);
      toast.error('Failed to load memes. Please try again.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    // Use initial memes if provided, otherwise load memes
    if (!initialMemes) {
      loadMemes(true);
    }
  }, [tag, sort, timeFilter]);

  const handleLoadMore = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    loadMemes();
  };
  return (
    <div className="space-y-6">
      {/* Sorting and Filtering Controls (secondary controls) */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {tag && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center"
            >
              <span className="mr-1">Showing:</span> #{tag}
            </motion.div>
          )}
        </div>
        
        <Tabs defaultValue={sort} className="w-auto" onValueChange={(value) => setSort(value as SortOption)}>
          <TabsList className="grid grid-cols-3 w-[300px]">
            <TabsTrigger value="new" className="flex items-center gap-1 data-[state=active]:bg-meme-purple data-[state=active]:text-white"><Clock size={14} /> New</TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-1 data-[state=active]:bg-meme-purple data-[state=active]:text-white"><TrendingUp size={14} /> Trending</TabsTrigger>
            <TabsTrigger value="top" className="flex items-center gap-1 data-[state=active]:bg-meme-purple data-[state=active]:text-white"><ChevronsUp size={14} /> Top</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Meme Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <MemeCardSkeleton count={6} />
        ) : memes.length > 0 ? (
          memes.map((meme, index) => (
            <motion.div
              key={meme.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <MemeCard meme={meme} isSaved={savedMemes.includes(meme.id)} />
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="col-span-full text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <ChevronsUp className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No memes found</h3>
              <p className="text-gray-500 mb-6">Try changing your filters or check back later!</p>
              <Button 
                variant="outline" 
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                onClick={() => loadMemes(true)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && memes.length > 0 && (
        <div className="flex justify-center mt-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleLoadMore} 
              disabled={isLoadingMore}
              className="font-medium border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Load More Memes
                </>
              )}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

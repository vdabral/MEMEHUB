import React, { useEffect, useState } from "react";
import MemeGrid from "../components/MemeGrid";
import memeService, { SortOption, TimeFilter } from "../services/memeService";
import { Badge } from "../components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import { Clock, TrendingUp, Star, X, Tag as TagIcon, Filter, Upload, Sparkles, Bookmark, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const Home: React.FC = () => {
  const [initialMemes, setInitialMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("new");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const navigate = useNavigate();
  const location = useLocation();

  // Get tag from query string (for tag-based discovery)
  const params = new URLSearchParams(location.search);
  const tag = params.get("tag") || undefined;

  useEffect(() => {
    setLoading(true);
    setError("");
    memeService
      .getAllMemes(sort, timeFilter, 1, tag)
      .then((memes) => {
        setInitialMemes(memes);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load memes");
        setLoading(false);
      });
  }, [tag, sort, timeFilter]);

  useEffect(() => {
    setTagsLoading(true);
    memeService
      .getPopularTags()
      .then((tags) => {
        setPopularTags(tags);
        setTagsLoading(false);
      })
      .catch(() => {
        setPopularTags([]);
        setTagsLoading(false);
      });
  }, []);

  const handleTagClick = (tag: string) => {
    if (tag === params.get("tag")) {
      navigate("/");
    } else {
      navigate(`/?tag=${tag}`);
    }
  };

  const sortOptions = [
    { value: "new", label: "New", icon: <Clock className="h-4 w-4 mr-2" /> },
    { value: "top", label: "Top", icon: <Star className="h-4 w-4 mr-2" /> },
    { value: "trending", label: "Trending", icon: <TrendingUp className="h-4 w-4 mr-2" /> }
  ];

  const timeOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Last 24 Hours" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };
  const { user } = useAuth();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="pb-12"
    >
      {/* Hero Banner */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
        variants={itemVariants}
      >
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <motion.div 
            className="flex flex-col md:flex-row items-center"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            <motion.div 
              className="md:w-2/3 mb-8 md:mb-0 md:pr-8"
              variants={itemVariants}
            >
              <motion.h1 
                className="text-3xl md:text-5xl font-bold mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Welcome to MemeHub
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl mb-6 text-purple-100"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Discover, share, and enjoy the internet's funniest memes all in one place.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button 
                  size="lg" 
                  variant="default" 
                  className="bg-white text-purple-700 hover:bg-purple-50"
                  onClick={() => navigate(user ? "/create" : "/login")}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {user ? "Create Meme" : "Sign In to Create"}
                </Button>
                
                {user ? (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-purple-700 bg-opacity-30 text-white border-white hover:bg-purple-700 hover:bg-opacity-50"
                    onClick={() => navigate("/saved")}
                  >
                    <Bookmark className="mr-2 h-5 w-5" />
                    Saved Memes
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-purple-700 bg-opacity-30 text-white border-white hover:bg-purple-700 hover:bg-opacity-50"
                    onClick={() => navigate("/register")}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Join Now
                  </Button>
                )}
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/3 flex justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <img 
                src="/meme-collage.png" 
                alt="Meme Collage" 
                className="w-64 h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div 
        className="bg-gray-50 border-b border-gray-200 py-8 mb-8"
        variants={itemVariants}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-4"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
              variants={itemVariants}
            >
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Trending Memes</h3>
                <p className="text-gray-600 text-sm">Discover what's making everyone laugh right now.</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-4"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
              variants={itemVariants}
            >
              <div className="bg-purple-100 p-3 rounded-full">
                <TagIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Tag Filtering</h3>
                <p className="text-gray-600 text-sm">Find exactly what you're looking for with specific tags.</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-4"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
              variants={itemVariants}
            >
              <div className="bg-purple-100 p-3 rounded-full">
                <Bookmark className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Save Favorites</h3>
                <p className="text-gray-600 text-sm">Bookmark memes to revisit them anytime you want.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Sidebar: Popular Tags */}
          <motion.aside 
            className="mb-6 lg:mb-0 lg:w-1/4"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-20">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <TagIcon className="h-5 w-5 mr-2 text-meme-purple" />
                Popular Tags
              </h2>
              
              {tagsLoading ? (
                <div className="flex flex-wrap gap-2">
                  {Array(8).fill(0).map((_, idx) => (
                    <Skeleton key={idx} width={60 + Math.random() * 40} height={24} className="rounded-full" />
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="flex flex-wrap gap-2"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
                    }
                  }}
                >
                  {popularTags.length === 0 && <span className="text-gray-400">No tags</span>}
                  {popularTags.map((t, idx) => (
                    <motion.div 
                      key={t} 
                      variants={tagVariants}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant={tag === t ? "default" : "outline"}
                        className={`cursor-pointer ${tag === t ? 'bg-meme-purple' : 'hover:border-meme-purple hover:text-meme-purple'}`}
                        onClick={() => handleTagClick(t)}
                      >
                        #{t}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              {tag && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center text-sm text-meme-purple hover:text-purple-800 mt-4 font-medium"
                  onClick={() => navigate("/")}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear tag filter
                </motion.button>
              )}
              
              {user && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-meme-purple border-meme-purple hover:bg-meme-purple hover:text-white"
                    onClick={() => navigate("/saved")}
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    My Saved Memes
                  </Button>
                </div>
              )}
            </div>
          </motion.aside>
          
          {/* Main Content: Meme Grid */}
          <motion.main 
            className="flex-1"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <motion.h1 
                  className="text-2xl font-bold flex items-center"
                  variants={itemVariants}
                >
                  <Sparkles className="h-5 w-5 mr-2 text-meme-purple" />
                  Discover Memes
                </motion.h1>
                
                <AnimatePresence>
                  {tag && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      <span className="mr-1">#{tag}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <motion.div variants={itemVariants}>
                <Tabs 
                  defaultValue={sort} 
                  className="mb-4" 
                  onValueChange={v => setSort(v as SortOption)}
                >
                  <TabsList className="relative overflow-hidden w-full">
                    {sortOptions.map(option => (
                      <TabsTrigger 
                        key={option.value} 
                        value={option.value}
                        className="flex-1 data-[state=active]:bg-meme-purple data-[state=active]:text-white"
                      >
                        <span className="flex items-center justify-center">
                          {option.icon}
                          {option.label}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </motion.div>
              
              <AnimatePresence mode="wait">
                {sort === "top" && (
                  <motion.div 
                    className="mb-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <Filter className="h-4 w-4 mr-2 text-gray-500" />
                      <Select
                        value={timeFilter}
                        onValueChange={(value) => setTimeFilter(value as TimeFilter)}
                      >
                        <SelectTrigger className="w-[180px] border-none bg-transparent">
                          <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {loading ? (
              <motion.div 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                variants={itemVariants}
              >
                <div className="flex justify-center items-center p-4">
                  <RefreshCw className="h-6 w-6 mr-2 text-meme-purple animate-spin" />
                  <span className="text-meme-purple font-medium">Loading memes...</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  {Array(6).fill(0).map((_, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden">
                      <Skeleton height={200} className="w-full" />
                      <div className="p-4">
                        <Skeleton height={24} className="mb-2" />
                        <Skeleton height={16} width="60%" />
                        <div className="mt-4 flex justify-between">
                          <Skeleton height={20} width={80} />
                          <Skeleton height={20} width={40} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : error ? (
              <motion.div 
                className="text-center py-12 bg-red-50 rounded-xl border border-red-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-red-500 mb-2 text-lg font-medium">{error}</div>
                <Button 
                  variant="destructive"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <MemeGrid initialMemes={initialMemes} tag={tag} sort={sort} timeFilter={timeFilter} />
            )}
          </motion.main>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;

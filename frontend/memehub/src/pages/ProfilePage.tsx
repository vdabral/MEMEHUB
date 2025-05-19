import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import memeService, { Meme } from "@/services/memeService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemeCard from "@/components/MemeCard";
import ProfileSkeleton from "@/components/ProfileSkeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [activeTab, setActiveTab] = useState("memes");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use the current user if viewing own profile
        if ((!id && user) || (id && user && id === user.id)) {
          setProfileUser(user);
          setIsCurrentUser(true);
          
          // Fetch user stats for current user
          const userStats = await memeService.getUserStats();
          setStats(userStats);
        } else if (id) {
          // Fetch profile of another user
          try {
            const fetchedUser = await fetch(`/api/users/${id}`).then(res => res.json());
            setProfileUser(fetchedUser);
            setIsCurrentUser(false);
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            toast.error('User profile not found');
          }
        }
        
        // Fetch user's memes
        const userId = id || (user?.id as string);
        if (userId) {
          const userMemes = await memeService.getUserMemes(userId);
          setMemes(userMemes);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    if (user || id) {
      fetchData();
    }
  }, [id, user]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profileUser) {
    return (
      <motion.div 
        className="container mx-auto px-4 py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </motion.div>
    );
  }

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

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Profile Header */}
      <motion.div 
        className="bg-white rounded-lg shadow-md p-6 mb-8"
        variants={itemVariants}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileUser.avatar} />
              <AvatarFallback className="text-2xl">
                {profileUser && profileUser.username ? profileUser.username.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold mb-1">{profileUser.username}</h1>
            <div className="text-gray-500 mb-4">{profileUser.email}</div>
            
            {profileUser.bio && (
              <p className="text-gray-700 mb-4">{profileUser.bio}</p>
            )}
            
            <div className="text-gray-500 text-sm">
              Member since {new Date(profileUser.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          {isCurrentUser && (
            <div className="ml-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" asChild>
                  <Link to="/profile/edit">Edit Profile</Link>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards (Only show for current user) */}
      {isCurrentUser && stats && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          variants={itemVariants}
        >
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-meme-purple"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.2)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-gray-500 mb-1">Total Memes</div>
            <div className="text-3xl font-bold">{stats.totalMemes || 0}</div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-gray-500 mb-1">Total Upvotes</div>
            <div className="text-3xl font-bold">{stats.totalUpvotes || 0}</div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.2)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-gray-500 mb-1">Total Comments</div>
            <div className="text-3xl font-bold">{stats.totalComments || 0}</div>
          </motion.div>
        </motion.div>
      )}

      {/* Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="memes">Memes</TabsTrigger>
            {isCurrentUser && (
              <TabsTrigger value="saved">Saved</TabsTrigger>
            )}
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          {/* Memes Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="memes" key="memes-tab">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-4">
                  {isCurrentUser ? "My Memes" : `${profileUser.username}'s Memes`}
                </h2>
                
                {memes.length === 0 ? (
                  <motion.div 
                    className="text-center py-12 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-gray-500 mb-4">
                      {isCurrentUser ? "You haven't created any memes yet." : "This user hasn't created any memes yet."}
                    </p>
                    {isCurrentUser && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button asChild>
                          <Link to="/create">Create Your First Meme</Link>
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                  >
                    {memes.map((meme, idx) => (
                      <motion.div 
                        key={meme.id || idx}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                      >
                        <MemeCard meme={meme} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>
            
            {/* Saved Tab - Only for current user */}
            {isCurrentUser && (
              <TabsContent value="saved" key="saved-tab">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold mb-4">Saved Memes</h2>
                  <motion.div 
                    className="text-center py-12 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-gray-500">You haven't saved any memes yet.</p>
                  </motion.div>
                </motion.div>
              </TabsContent>
            )}
            
            {/* About Tab */}
            <TabsContent value="about" key="about-tab">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">About {isCurrentUser ? "Me" : profileUser.username}</h2>
                  <div className="space-y-4">
                    {profileUser.bio ? (
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h3 className="font-semibold text-gray-700">Bio</h3>
                        <p>{profileUser.bio}</p>
                      </motion.div>
                    ) : (
                      <motion.p 
                        className="text-gray-500"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {isCurrentUser ? "You haven't added a bio yet." : "This user hasn't added a bio yet."}
                      </motion.p>
                    )}
                    
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="font-semibold text-gray-700">Member Since</h3>
                      <p>{new Date(profileUser.createdAt).toLocaleDateString()}</p>
                    </motion.div>
                    
                    {isCurrentUser && (
                      <motion.div 
                        className="mt-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button variant="outline" asChild>
                            <Link to="/profile/edit">Edit Profile</Link>
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </motion.div>  );
}

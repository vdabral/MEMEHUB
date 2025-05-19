import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Meme } from '@/services/memeService';
import { useAuth } from '@/contexts/AuthContext';
import memeService from '@/services/memeService';
import { toast } from "sonner";
import { motion } from "framer-motion";

interface MemeCardProps {
  meme: Meme;
  isSaved?: boolean;
  onUnsave?: (id: string) => void;
}

export default function MemeCard({ meme, isSaved: isSavedProp = false, onUnsave }: MemeCardProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState({
    upvotes: meme.upvotes,
    downvotes: meme.downvotes
  });
  const [isVoting, setIsVoting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(isSavedProp);

  // Defensive: safely access username and avatar for display
  const username = meme.username || "?";
  const userAvatar = meme.userAvatar || undefined;

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  function timeSince(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
  
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
  
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
  
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
  
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
  
    return Math.floor(seconds) + " seconds ago";
  }

  async function handleVote() {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    if (isVoting) return;

    if (!meme.id) {
      toast.error('Cannot vote: Meme ID is missing.');
      console.warn('Attempted to vote on meme with missing id:', meme);
      return;
    }

    try {
      setIsVoting(true);
      const result = await memeService.upvoteMeme(meme.id);
      setVotes({
        upvotes: result.upvotes,
        downvotes: result.downvotes
      });
      setIsLiked(true);
      
      // Reset the liked state after animation completes
      setTimeout(() => setIsLiked(false), 500);
      
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  }

  async function handleSave() {
    if (!user) {
      toast.error('Please log in to save memes');
      return;
    }
    setIsSaving(true);
    try {
      if (isSaved) {
        await memeService.unsaveMeme(meme.id);
        setIsSaved(false);
        toast.success('Meme removed from saved');
        if (onUnsave) onUnsave(meme.id);
      } else {
        await memeService.saveMeme(meme.id);
        setIsSaved(true);
        toast.success('Meme saved!');
      }
    } catch (e) {
      toast.error('Failed to update saved memes');
    } finally {
      setIsSaving(false);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.origin + `/memes/${meme.id}`)
      .then(() => {
        toast.success('Link copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  }
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:border-purple-200 transition-all h-full flex flex-col"
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="meme-image-container relative overflow-hidden">
        <Link to={`/memes/${meme.id}`} className="block">
          <motion.img 
            src={meme.image} 
            alt={meme.title} 
            className="w-full h-auto object-cover aspect-[4/3]"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Text Overlays */}
          {meme.textOverlays?.map((overlay, idx) => (
            <div 
              key={overlay.id || idx}
              className="text-overlay"
              style={{
                top: `${overlay.y}%`,
                left: `${overlay.x}%`,
                fontSize: `${overlay.fontSize}px`,
                color: overlay.color,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {overlay.text}
            </div>
          ))}
        </Link>
        
        {/* Save Button Overlay */}
        {user && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving}
            className={`absolute top-2 right-2 p-2 rounded-full ${
              isSaved 
                ? 'bg-meme-purple text-white' 
                : 'bg-black bg-opacity-50 text-white hover:bg-meme-purple'
            }`}
            title={isSaved ? 'Unsave meme' : 'Save meme'}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </motion.button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <Link to={`/memes/${meme.id}`} className="text-lg font-semibold line-clamp-1 hover:text-meme-purple transition-colors">
            {meme.title}
          </Link>
          <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {timeSince(meme.createdAt)}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-3 space-x-1 flex flex-wrap">
          {meme.tags.slice(0, 3).map((tag, index) => (
            <Link to={`/?tag=${tag}`} key={tag || index} className="tag-badge mb-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors">
              #{tag}
            </Link>
          ))}
          {meme.tags.length > 3 && (
            <span className="text-xs font-medium text-gray-500 mb-1 px-2 py-1">
              +{meme.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Spacer to push the action bar to the bottom */}
        <div className="flex-grow"></div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 mt-auto border-t border-gray-100">
          {meme.userId ? (
            <Link to={`/users/${meme.userId}`} className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={userAvatar} />
                <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{username}</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2 opacity-60 cursor-not-allowed">
              <Avatar className="h-6 w-6">
                <AvatarImage src={userAvatar} />
                <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Unknown user</span>
            </div>
          )}

        <div className="flex items-center space-x-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleVote} 
              disabled={isVoting}
              className="flex items-center space-x-1 text-gray-600 hover:text-meme-purple p-1 h-auto bg-transparent border-none"
            >              <motion.div
                animate={isLiked ? { scale: [1, 1.5, 1], rotate: [0, 15, -15, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Heart size={18} className={user && (isLiked || meme.upvotedBy?.includes(user.id)) ? "fill-meme-purple text-meme-purple" : ""} />
              </motion.div>
              <span>{votes.upvotes}</span>
            </motion.button>
            
            <Link to={`/memes/${meme.id}`} className="flex items-center space-x-1 text-gray-600 hover:text-meme-purple p-1">
              <MessageSquare size={18} />
              <span>{meme.commentCount || 0}</span>
            </Link>
            
            <motion.button
              whileHover={{ rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center text-gray-600 hover:text-meme-purple p-1 h-auto bg-transparent border-none"
            >
              <Share2 size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

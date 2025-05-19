import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import memeService, { Meme, Comment } from '@/services/memeService';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageSquare,
  Share2,
  Clock,
  ThumbsDown,
  Trash,
  AlertTriangle
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MemeDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [meme, setMeme] = useState<Meme | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState<'upvoted' | 'downvoted' | 'none'>('none');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const memeData = await memeService.getMemeById(id);
        setMeme(memeData);
        setVotes({ upvotes: memeData.upvotes, downvotes: memeData.downvotes });
        setIsOwner(user?.id === memeData.userId);
        
        // Detect user vote if backend provides upvotedBy/downvotedBy
        if (user && Array.isArray(memeData.upvotedBy) && memeData.upvotedBy.includes(user.id)) {
          setUserVote('upvoted');
        } else if (user && Array.isArray(memeData.downvotedBy) && memeData.downvotedBy.includes(user.id)) {
          setUserVote('downvoted');
        } else {
          setUserVote('none');
        }

        const commentsData = await memeService.getMemeComments(id);
        setComments(commentsData);
      } catch (error) {
        toast.error('Failed to load meme');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, navigate]);

  const handleUpvote = async () => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }
    
    try {
      if (!id) return;
      // If already upvoted, remove vote (optional, if backend supports)
      if (userVote === 'upvoted') {
        const result = await memeService.removeVote(id); // You need to implement this in your backend and service
        setVotes(result);
        setUserVote('none');
      } else {
        const result = await memeService.upvoteMeme(id);
        setVotes(result);
        setUserVote('upvoted');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleDownvote = async () => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }
    
    try {
      if (!id) return;
      // If already downvoted, remove vote (optional, if backend supports)
      if (userVote === 'downvoted') {
        const result = await memeService.removeVote(id); // You need to implement this in your backend and service
        setVotes(result);
        setUserVote('none');
      } else {
        const result = await memeService.downvoteMeme(id);
        setVotes(result);
        setUserVote('downvoted');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleDeleteMeme = async () => {
    try {
      if (!id) return;
      await memeService.deleteMeme(id);
      toast.success('Meme deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete meme');
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }
    // Prevent empty or whitespace-only comments
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    try {
      if (!id) return;
      setIsSubmitting(true);
      const comment = await memeService.addComment(id, commentText);
      setComments([...comments, comment]);
      setCommentText('');
    } catch (error: any) {
      // Show backend error if available
      const message = error?.response?.data?.message || 'Failed to add comment';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast.success('Link copied to clipboard!');
        })
        .catch(() => {
          toast.error('Failed to copy link');
        });
    } else {
      // Fallback for browsers/environments without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (!meme) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Meme Not Found</h2>
        <p className="text-gray-600 mb-6">The meme you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  // Defensive: safely access user info for display
  const username = meme.username || (meme.creator && meme.creator.username) || "?";
  const userAvatar = meme.userAvatar || (meme.creator && meme.creator.avatar) || undefined;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{meme.title}</h1>
        
        {isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash size={16} className="mr-1" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your meme.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteMeme}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Meme Content */}
      <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6">
        <div className="relative">
          <img 
            src={meme.image} 
            alt={meme.title} 
            className="w-full object-contain max-h-[600px]" 
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
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Link to={`/users/${meme.userId}`} className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={userAvatar} />
                <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{username}</p>
              </div>
            </Link>
            
            <div className="flex items-center text-gray-500">
              <Clock size={16} className="mr-1" />
              <p className="text-sm">{formatDate(meme.createdAt)}</p>
            </div>
          </div>
          
          {/* Tags */}
          <div className="mb-6 space-x-1 flex flex-wrap">
            {meme.tags.map((tag, index) => (
              <Link to={`/?tag=${tag}`} key={tag || index} className="tag-badge mb-1">
                #{tag}
              </Link>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUpvote}
                className={`flex items-center space-x-1 ${userVote === 'upvoted' ? 'bg-meme-purple/10 border-meme-purple text-meme-purple' : ''}`}
              >
                <Heart size={18} className={userVote === 'upvoted' ? 'fill-meme-purple text-meme-purple' : ''} />
                <span>{votes.upvotes}</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownvote}
                className={`flex items-center space-x-1 ${userVote === 'downvoted' ? 'bg-red-100 border-red-400 text-red-600' : ''}`}
              >
                <ThumbsDown size={18} />
                <span>{votes.downvotes}</span>
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-1"
            >
              <Share2 size={18} />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold">Comments</h2>
          <div className="ml-2 flex items-center px-2 py-1 bg-gray-100 rounded-full">
            <MessageSquare size={16} className="mr-1 text-gray-500" />
            <span className="text-sm text-gray-500">{comments.length}</span>
          </div>
        </div>
        
        {/* Add Comment */}
        {user ? (
          <div className="mb-6">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="mb-2"
            />
            <Button 
              onClick={handleAddComment}
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
            <p className="mb-2">Please log in to leave a comment</p>
            <Button asChild size="sm">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        )}
        
        <Separator className="my-4" />
        
        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <Avatar>
                  <AvatarImage src={comment.userAvatar} />
                  <AvatarFallback>{(comment.username?.charAt(0) || "?").toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <Link to={`/users/${comment.userId}`} className="font-medium hover:underline mr-2">
                      {comment.username}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

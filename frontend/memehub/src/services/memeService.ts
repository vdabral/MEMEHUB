import { api } from './api';

// Types
export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
}

export interface Meme {
  id: string;
  title: string;
  image: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  username: string;
  userAvatar?: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  tags: string[];
  textOverlays?: TextOverlay[];
  upvotedBy?: string[];
  downvotedBy?: string[];
  creator?: { username?: string; avatar?: string };
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  username: string;
  userAvatar?: string;
}

export interface MemeAnalytics {
  totalViews: number;
  uniqueViews: number;
  upvoteRate: number;
  commentRate: number;
  shareCount: number;
  viewsByDay: { date: string; count: number }[];
}

export type SortOption = 'trending' | 'new' | 'top';
export type TimeFilter = 'today' | 'week' | 'month' | 'all';

// Utility: Normalize meme object to always have 'id'
function normalizeMeme(raw: any): Meme {
  // Defensive: support both creator object and flat fields
  let username = raw.username;
  let userId = raw.userId;
  let userAvatar = raw.userAvatar;
  if (raw.creator) {
    username = raw.creator.username || username;
    userId = raw.creator._id || userId;
    userAvatar = raw.creator.avatar || userAvatar;
  }
  return {
    ...raw,
    id: raw.id || raw._id, // prefer 'id', fallback to '_id'
    username: username || '?',
    userId: userId || '',
    userAvatar: userAvatar || '',
    commentCount: Array.isArray(raw.comments) ? raw.comments.length : (raw.commentCount ?? 0),
  };
}

// Utility: Normalize comment object to always have required fields
function normalizeComment(raw: any): Comment {
  return {
    id: raw.id || raw._id,
    text: raw.text || raw.content || "",
    createdAt: raw.createdAt,
    userId: raw.userId || raw.creator?._id,
    username: raw.username || raw.creator?.username || "?",
    userAvatar: raw.userAvatar || raw.creator?.avatar,
  };
}

// Service
const memeService = {
  // Get all memes with filtering and pagination
  async getAllMemes(sort: SortOption = 'trending', filter: TimeFilter = 'all', page: number = 1, tag?: string): Promise<Meme[]> {
    let endpoint = `/memes?page=${page}&sort=${sort}&filter=${filter}`;
    if (tag) endpoint += `&tag=${tag}`;
    const data = await api.get(endpoint);
    // Handle both array and object with memes property
    const memesArray = Array.isArray(data) ? data : (Array.isArray(data.memes) ? data.memes : []);
    return memesArray.map(normalizeMeme);
  },

  // Search for memes
  async searchMemes(query: string, page: number = 1): Promise<Meme[]> {
    const data = await api.get(`/memes/search?q=${encodeURIComponent(query)}&page=${page}`);
    // Handle both array and object with memes property
    const memesArray = Array.isArray(data) ? data : (Array.isArray(data.memes) ? data.memes : []);
    return memesArray.map(normalizeMeme);
  },

  // Get a single meme by ID
  async getMemeById(id: string): Promise<Meme> {
    const data = await api.get(`/memes/${id}`);
    return normalizeMeme(data);
  },

  // Create a new meme
  async createMeme(memePayload: {
    title: string;
    imageUrl: string;
    tags: string[];
    textOverlays?: TextOverlay[];
  }): Promise<Meme> {
    const data = await api.post('/memes', memePayload);
    return normalizeMeme(data);
  },

  // Update an existing meme
  async updateMeme(id: string, formData: FormData): Promise<Meme> {
    const data = await api.putFormData(`/memes/${id}`, formData);
    return normalizeMeme(data);
  },

  // Delete a meme
  async deleteMeme(id: string): Promise<void> {
    return await api.delete(`/memes/${id}`);
  },

  // Upvote a meme
  async upvoteMeme(id: string): Promise<{ upvotes: number; downvotes: number }> {
    // id is now required; TypeScript will enforce this
    return await api.post(`/memes/${id}/upvote`, {});
  },

  // Downvote a meme
  async downvoteMeme(id: string): Promise<{ upvotes: number; downvotes: number }> {
    // id is now required; TypeScript will enforce this
    return await api.post(`/memes/${id}/downvote`, {});
  },

  // Remove a user's vote from a meme
  async removeVote(id: string): Promise<{ upvotes: number; downvotes: number }> {
    return await api.post(`/memes/${id}/remove-vote`, {});
  },

  // Get comments for a meme
  async getMemeComments(id: string): Promise<Comment[]> {
    const data = await api.get(`/memes/${id}/comments`);
    return Array.isArray(data) ? data.map(normalizeComment) : [];
  },

  // Add a comment to a meme
  async addComment(id: string, text: string): Promise<Comment> {
    const data = await api.post(`/memes/${id}/comments`, { content: text });
    return normalizeComment(data);
  },

  // Get popular tags
  async getPopularTags(): Promise<string[]> {
    return await api.get('/memes/tags/popular');
  },

  // Get analytics for a meme
  async getMemeAnalytics(id: string): Promise<MemeAnalytics> {
    return await api.get(`/analytics/meme/${id}`);
  },

  // Get user memes
  async getUserMemes(userId: string, page: number = 1): Promise<Meme[]> {
    const data = await api.get(`/users/${userId}/memes?page=${page}`);
    return Array.isArray(data) ? data.map(normalizeMeme) : [];
  },

  // Get user stats
  async getUserStats(): Promise<any> {
    return await api.get('/users/me/stats');
  },

  // Save a meme for the logged-in user
  async saveMeme(id: string): Promise<void> {
    await api.post(`/users/me/saved/${id}`, {});
  },

  // Unsave a meme for the logged-in user
  async unsaveMeme(id: string): Promise<void> {
    await api.delete(`/users/me/saved/${id}`);
  },

  // Get saved memes for the logged-in user
  async getSavedMemes(): Promise<Meme[]> {
    const data = await api.get('/users/me/saved');
    return Array.isArray(data) ? data.map(normalizeMeme) : [];
  }
};

export const searchMemes = async (query: string): Promise<Meme[]> => {
  try {
    const response = await api.get(`/memes?q=${encodeURIComponent(query)}`);
    return response.data.memes;
  } catch (error) {
    console.error("Error searching memes:", error);
    throw error;
  }
};

export { normalizeMeme };

export default memeService;

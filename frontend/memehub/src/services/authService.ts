import { api } from './api';
import { toast } from "sonner";

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Service
const authService = {
  // Register a new user
  async register(username: string, email: string, password: string): Promise<User> {
    const response = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', response.token);
    toast.success('Registration successful!');
    return response.user;
  },

  // Login a user
  async login(identifier: string, password: string): Promise<User> {
    const response = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('token', response.token);
    toast.success('Login successful!');
    return response.user;
  },

  // Logout the current user
  logout(): void {
    localStorage.removeItem('token');
    toast.info('You have been logged out');
  },

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  },

  // Get the current user's details
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.isLoggedIn()) return null;
      const user = await api.get('/users/profile');
      // Normalize _id to id for compatibility
      if (user && user._id) {
        user.id = user._id;
        delete user._id;
      }
      return user;
    } catch (error) {
      // If there's an error, clear the token and return null
      localStorage.removeItem('token');
      return null;
    }
  },

  // Get the current user's profile
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response;
  }
};

export default authService;
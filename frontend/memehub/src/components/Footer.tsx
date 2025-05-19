
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-meme-purple">Meme<span className="text-black">Hub</span></span>
            </Link>
            <p className="text-gray-500 mt-2 text-sm">The next-generation meme-sharing platform</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
            <div>
              <h3 className="font-semibold mb-2 text-center md:text-left">Navigation</h3>
              <ul className="space-y-1 text-sm text-center md:text-left">
                <li><Link to="/" className="text-gray-500 hover:text-meme-purple">Home</Link></li>
                <li><Link to="/explore" className="text-gray-500 hover:text-meme-purple">Explore</Link></li>
                <li><Link to="/create" className="text-gray-500 hover:text-meme-purple">Create Meme</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-center md:text-left">Account</h3>
              <ul className="space-y-1 text-sm text-center md:text-left">
                <li><Link to="/login" className="text-gray-500 hover:text-meme-purple">Login</Link></li>
                <li><Link to="/register" className="text-gray-500 hover:text-meme-purple">Register</Link></li>
                <li><Link to="/profile" className="text-gray-500 hover:text-meme-purple">Profile</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-center md:text-left">Legal</h3>
              <ul className="space-y-1 text-sm text-center md:text-left">
                <li><Link to="/terms" className="text-gray-500 hover:text-meme-purple">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-500 hover:text-meme-purple">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MemeHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

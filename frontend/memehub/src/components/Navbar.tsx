import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Search, Menu, X, User, Plus, Home, Compass, LogOut, Settings, Bookmark } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Animation variants
  const navbarVariants = {
    initial: {
      backgroundColor: "rgba(255, 255, 255, 1)",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    scrolled: {
      backgroundColor: "rgba(139, 92, 246, 0.98)",
      boxShadow: "0 4px 20px rgba(139, 92, 246, 0.25)"
    }
  };

  const navItemVariants = {
    initial: { y: 0, opacity: 1 },
    hover: { y: -2, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 10 } }
  };

  const mobileMenuVariants = {
    closed: { 
      height: 0, 
      opacity: 0,
      transition: { 
        duration: 0.3,
        opacity: { duration: 0.15 }
      }
    },
    open: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        duration: 0.3,
        opacity: { delay: 0.15, duration: 0.15 }
      }
    }
  };

  const navbarClasses = "sticky top-0 z-50 transition-all duration-300";

  return (
    <motion.header 
      className={navbarClasses}
      initial="initial"
      animate={scrolled ? "scrolled" : "initial"}
      variants={navbarVariants}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.span 
              className={`text-2xl font-bold ${scrolled ? 'text-white' : 'text-meme-purple'}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Meme<span className={scrolled ? "text-purple-200" : "text-black"}>Hub</span>
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <motion.div whileHover="hover" initial="initial" variants={navItemVariants}>
              <Link to="/" className={`flex items-center space-x-1 ${scrolled ? 'text-white hover:text-purple-200' : 'text-gray-600 hover:text-meme-purple'} transition-colors duration-200`}>
                <Home size={20} />
                <span>Home</span>
              </Link>
            </motion.div>
            
            <motion.div whileHover="hover" initial="initial" variants={navItemVariants}>
              <Link to="/create" className={`flex items-center space-x-1 ${scrolled ? 'text-white hover:text-purple-200' : 'text-gray-600 hover:text-meme-purple'} transition-colors duration-200`}>
                <Plus size={20} />
                <span>Create</span>
              </Link>
            </motion.div>
            
            <motion.div whileHover="hover" initial="initial" variants={navItemVariants}>
              <Link to="/explore" className={`flex items-center space-x-1 ${scrolled ? 'text-white hover:text-purple-200' : 'text-gray-600 hover:text-meme-purple'} transition-colors duration-200`}>
                <Compass size={20} />
                <span>Explore</span>
              </Link>
            </motion.div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex relative mx-4 flex-1 max-w-md">
            <motion.div 
              className="w-full"
              whileFocus={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="text"
                placeholder="Search memes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-meme-purple focus:border-transparent transition-all duration-300"
              />
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                size={18}
              />
            </motion.div>
          </form>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`relative h-10 w-10 rounded-full p-0 ${scrolled ? 'hover:bg-purple-400/20' : 'hover:bg-meme-purple/10'} transition-colors`}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Avatar className="h-10 w-10 ring-2 ring-purple-400">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="bg-meme-purple text-white">
                          {user && user.username ? user.username.charAt(0).toUpperCase() : '?'}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{user && user.username ? user.username.charAt(0).toUpperCase() : '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user.username}</span>
                      <span className="text-xs text-gray-500 truncate">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/dashboard" className="flex w-full items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/saved" className="flex w-full items-center">
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Saved Memes</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>            ) : (
              <div className="flex items-center space-x-2">                <Link to="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant={scrolled ? "outline" : "ghost"} className={scrolled ? "bg-purple-700 text-white hover:bg-purple-800 border-purple-700" : ""}>Login</Button>
                  </motion.div>
                </Link>
                <Link to="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className={scrolled ? "bg-white text-purple-600 hover:bg-purple-100" : ""}>Register</Button>
                  </motion.div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button 
            className="md:hidden focus:outline-none" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? (
              <X size={24} className={scrolled ? "text-white" : ""} /> 
            ) : (
              <Menu size={24} className={scrolled ? "text-white" : ""} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white border-t"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
          >
            <div className="container mx-auto px-4 py-2">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search memes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-meme-purple focus:border-transparent"
                  />
                  <Search 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    size={18}
                  />
                </div>
              </form>
              <motion.nav className="space-y-3">
                {[
                  { to: "/", icon: <Home size={20} />, text: "Home" },
                  { to: "/create", icon: <Plus size={20} />, text: "Create" },
                  { to: "/explore", icon: <Compass size={20} />, text: "Explore" }
                ].map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <Link to={item.to} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md transition-colors" onClick={toggleMenu}>
                      {item.icon}
                      <span>{item.text}</span>
                    </Link>
                  </motion.div>
                ))}
                
                {user ? (
                  <>
                    {[
                      { to: "/profile", icon: <User size={20} />, text: "Profile" },
                      { to: "/dashboard", icon: <Settings size={20} />, text: "Dashboard" }
                    ].map((item, index) => (
                      <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index + 3) * 0.07 }}
                      >
                        <Link to={item.to} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md transition-colors" onClick={toggleMenu}>
                          {item.icon}
                          <span>{item.text}</span>
                        </Link>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <Button 
                        variant="ghost" 
                        onClick={() => { logout(); toggleMenu(); }} 
                        className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut size={20} className="mr-2" />
                        <span>Log out</span>
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div 
                    className="flex flex-col space-y-2 pt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link to="/login" onClick={toggleMenu}>
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/register" onClick={toggleMenu}>
                      <Button className="w-full">Register</Button>
                    </Link>
                  </motion.div>
                )}
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;

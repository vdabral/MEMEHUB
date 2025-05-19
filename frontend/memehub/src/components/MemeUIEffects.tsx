import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Move, 
  Text, 
  LightbulbIcon, 
  MousePointer, 
  Eye, 
  RefreshCcw, 
  SlidersHorizontal,
  Sparkles,
  Layers,
  CornerUpRight
} from 'lucide-react';

/**
 * Component that displays Pro Tips in the meme preview area
 */
export const MemeProTips = ({ textOverlaysCount }: { textOverlaysCount: number }) => {
  if (textOverlaysCount === 0) return null;
  
  return (
    <div className="mt-3 p-3 bg-meme-purple/5 border border-meme-purple/20 rounded-md">
      <motion.div
        className="flex items-center text-meme-purple/80 text-sm"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            repeatDelay: 5
          }}
        >
          <Zap size={16} className="mr-2 text-meme-purple" />
        </motion.div>
        <span className="font-medium">Pro Tips:</span>
      </motion.div>
      <motion.ul 
        className="mt-2 text-xs text-gray-600 space-y-1 pl-6 list-disc"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {[
          {
            text: "Drag text elements directly on the image to position them",
            icon: <MousePointer size={12} className="text-meme-purple inline mr-1" />
          },
          {
            text: "Click on a text element in the list to edit its properties",
            icon: <SlidersHorizontal size={12} className="text-meme-purple inline mr-1" />
          },
          {
            text: "Use AI suggestions to generate creative captions and tags",
            icon: <Sparkles size={12} className="text-meme-purple inline mr-1" />
          },
          textOverlaysCount >= 3 && {
            text: "Try using different font sizes and colors for emphasis",
            icon: <Eye size={12} className="text-meme-purple inline mr-1" />,
            highlight: true
          }
        ].filter(Boolean).map((tip, index) => (
          <motion.li 
            key={index} 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + (index * 0.1) }}
            className={tip.highlight ? "text-meme-purple font-medium" : ""}
          >
            {tip.icon} {tip.text}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

/**
 * Component that displays helpful footer tips
 */
export const MemeFooterTips = ({ textOverlaysCount }: { textOverlaysCount: number }) => {
  return (
    <motion.div
      className="flex items-center gap-1.5 text-xs text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <motion.div
        animate={textOverlaysCount > 0 ? {
          x: [0, 3, -3, 0],
          transition: { 
            duration: 1.5, 
            repeat: Infinity,
            repeatDelay: 4
          }
        } : {}}
      >
        <Move size={14} className="text-gray-400" />
      </motion.div>
      <span>{textOverlaysCount > 0 ? "Drag text to reposition | " : ""}</span>
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          transition: { 
            duration: 1.5, 
            repeat: Infinity,
            repeatDelay: 4
          }
        }}
      >
        <Text size={14} className="text-gray-400" />
      </motion.div>
      <span>Add text to create your perfect meme</span>
    </motion.div>
  );
};

/**
 * Component that displays a pulsing highlight effect around an element
 */
export const PulseHighlight = ({ children, active = true, delay = 0 }: { 
  children: React.ReactNode, 
  active?: boolean, 
  delay?: number 
}) => {
  if (!active) return <>{children}</>;
  
  return (
    <motion.div
      initial={{ boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)' }}
      animate={{ 
        boxShadow: ['0 0 0 0 rgba(139, 92, 246, 0)', '0 0 0 4px rgba(139, 92, 246, 0.3)', '0 0 0 0 rgba(139, 92, 246, 0)']
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1,
        delay
      }}
      className="rounded-md"
    >
      {children}
    </motion.div>
  );
};

/**
 * Component that highlights new features or tips
 */
export const FeatureHighlight = ({ 
  children, 
  show = true,
  message = "New feature!" 
}: { 
  children: React.ReactNode, 
  show?: boolean, 
  message?: string
}) => {
  if (!show) return <>{children}</>;
  
  return (
    <div className="relative group">
      <AnimatePresence>
        <motion.div 
          className="absolute -right-2 -top-2 bg-meme-purple text-white text-xs px-1.5 py-0.5 rounded-full z-10 whitespace-nowrap"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring" }}
        >
          <LightbulbIcon size={10} className="inline mr-0.5" /> {message}
        </motion.div>
      </AnimatePresence>
      {children}
    </div>
  );
};

/**
 * Helper animations for the preview containers
 */
export const previewContainerVariants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    y: -20
  }
};

/**
 * Animation variants for staggered children
 */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Animation for individual items in a staggered container
 */
export const staggerItemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};

/**
 * Animation for hover effects
 */
export const hoverScaleVariants = {
  initial: {},
  hover: { 
    scale: 1.05, 
    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
  },
  tap: { 
    scale: 0.95 
  }
};

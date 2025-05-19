import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { motion } from 'framer-motion';

export default function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header Skeleton */}
      <motion.div 
        className="bg-white rounded-lg shadow-md p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <Skeleton circle width={96} height={96} />
          
          <div className="text-center sm:text-left w-full max-w-md">
            <Skeleton height={36} width={180} />
            <div className="mt-2">
              <Skeleton height={20} width={220} />
            </div>
            <div className="mt-4">
              <Skeleton height={20} count={2} />
            </div>
            <div className="mt-2">
              <Skeleton height={16} width={180} />
            </div>
          </div>
          
          <div className="ml-auto hidden sm:block">
            <Skeleton height={38} width={120} />
          </div>
        </div>
      </motion.div>

      {/* Stats Cards Skeleton */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-200">
            <Skeleton height={16} width={80} />
            <div className="mt-2">
              <Skeleton height={32} width={60} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-6">
          <Skeleton height={40} width={300} />
        </div>
        
        <div className="mb-4">
          <Skeleton height={28} width={150} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <Skeleton height={200} className="w-full" />
              <div className="p-4">
                <Skeleton height={24} className="mb-2" />
                <Skeleton height={16} width="60%" />
                <div className="mt-4 flex justify-between">
                  <Skeleton height={24} width={80} />
                  <Skeleton height={24} width={40} />
                </div>
                <div className="mt-2">
                  <Skeleton height={20} width="40%" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

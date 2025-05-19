import React from 'react';
import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from 'react-loading-skeleton';
import { motion } from "framer-motion";

interface MemeCardSkeletonProps {
  count?: number;
}

export const MemeCardSkeleton: React.FC<MemeCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <motion.div 
          key={i} 
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-full flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <div className="relative overflow-hidden">
            <Skeleton height={200} width="100%" />
          </div>
          
          <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-3">
              <Skeleton width={150} />
              <Skeleton width={70} />
            </div>

            <div className="mb-3 flex gap-1">
              <Skeleton width={60} height={24} borderRadius={20} />
              <Skeleton width={70} height={24} borderRadius={20} />
              <Skeleton width={50} height={24} borderRadius={20} />
            </div>

            <div className="flex-grow"></div>

            <div className="flex justify-between items-center pt-4 mt-auto border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Skeleton circle width={24} height={24} />
                <Skeleton width={80} />
              </div>
              
              <div className="flex items-center space-x-3">
                <Skeleton width={40} height={24} />
                <Skeleton width={40} height={24} />
                <Skeleton width={20} height={24} />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default MemeCardSkeleton;

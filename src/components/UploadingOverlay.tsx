'use client';

import { useUploader } from '@/context/UploaderContext';
import { FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadingOverlay() {
  const { isUploading } = useUploader();

  return (
    <AnimatePresence>
      {isUploading && (
        <motion.div
          key="uploading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]"
        >
          <div className="flex flex-col items-center gap-4">
            <FaSpinner className="animate-spin text-blue-500 text-4xl" />
            <p className="text-white font-medium text-lg">Uploading...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
'use client';

import React, { createContext, useContext, useState } from 'react';

interface UploaderContextType {
  isUploading: boolean;
  startUpload: () => void;
  endUpload: () => void;
}

const UploaderContext = createContext<UploaderContextType | null>(null);

export function useUploader() {
  const context = useContext(UploaderContext);
  if (!context) throw new Error('UploaderContext not found');
  return context;
}

export function UploaderProvider({ children }: { children: React.ReactNode }) {
  const [isUploading, setIsUploading] = useState(false);

  const startUpload = () => setIsUploading(true);
  const endUpload = () => setIsUploading(false);

  return (
    <UploaderContext.Provider value={{ isUploading, startUpload, endUpload }}>
      {children}
    </UploaderContext.Provider>
  );
}
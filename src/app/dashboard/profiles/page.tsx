'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import Image from 'next/image';
import UploadClipModal from '@/components/UploadClipModal';
import { Button } from '@/components/ui/button';

export default function PrivateProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUser({ id: userSnap.id, ...userSnap.data() });
      }
    };

    fetchUser();
  }, []);

  if (!user) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Image
            src={user.avatar || '/default-avatar.png'}
            alt="avatar"
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <h1 className="text-xl font-bold text-black">{user.username || 'Unnamed'}</h1>
            <p className="text-sm text-gray-400">{user.bio || 'No bio yet.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Wallet Display */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold px-4 py-2 rounded-full shadow-md border-2 border-yellow-500">
  <Image
    src="/images/coin.png"
    alt="Credits"
    width={24}
    height={24}
    className="rounded-full shadow-sm"
  />
  <span className="text-sm font-bold">{user.credits ?? 0} Credits</span>
</div>


          <Button onClick={() => setShowUploadModal(true)}>Upload Content</Button>
        </div>
      </div>

      {/* Upload modal */}
      {showUploadModal && (
        <UploadClipModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => {
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}

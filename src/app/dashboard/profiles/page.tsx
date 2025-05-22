'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import Image from 'next/image';
import UploadClipModal from '@/components/UploadClipModal';
import { Button } from '@/components/ui/button';

export default function PrivateProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const fetchUserAndGallery = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userData = { id: userSnap.id, ...userSnap.data() };
      setUser(userData);

      const galleryRef = collection(db, 'gallery');
      const snapshot = await getDocs(galleryRef);
      const images = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(img => img.uid === currentUser.uid);

      setGallery(images);
    };

    fetchUserAndGallery();
  }, []);

  const handleTip = async (imageId: string) => {
    try {
      const res = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tip failed');

      alert('Thank you for tipping!');
    } catch (err) {
      console.error(err);
      alert('Error tipping');
    }
  };

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

      {/* Uploaded Images */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Images</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.map((img) => (
            <div key={img.id} className="bg-black p-2 rounded shadow">
              <Image
                src={img.mediaUrl}
                alt={img.title}
                width={300}
                height={300}
                className="w-full h-48 object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

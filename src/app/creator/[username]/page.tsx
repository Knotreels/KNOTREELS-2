'use client';

import TipModal from '@/components/TipModal';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function PublicProfilePage() {
  const { username } = useParams() as { username: string };
  const [user, setUser] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [tipImageId, setTipImageId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const userSnap = await getDocs(q);

      if (userSnap.empty) return;

      const userDoc = userSnap.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };
      setUser(userData);

      const clipsQ = query(
        collection(db, 'clips'),
        where('uid', '==', userDoc.id)
      );
      const clipSnap = await getDocs(clipsQ);
      setClips(clipSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const galleryQ = query(
        collection(db, 'gallery'),
        where('uid', '==', userDoc.id)
      );
      const gallerySnap = await getDocs(galleryQ);
      setGallery(gallerySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, [username]);

  if (!user) return <p className="text-center text-gray-400 mt-10">Loading profile...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-white">
      {/* Public Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <Image
          src={user.avatar || '/default-avatar.png'}
          alt="Avatar"
          width={60}
          height={60}
          className="rounded-full border border-gray-600"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.username}</h1>
          {user.bio && <p className="text-sm text-gray-400">{user.bio}</p>}
        </div>
        <div className="ml-auto">
          <Button onClick={() => alert('Boost logic here')} className="bg-blue-600 hover:bg-blue-700">
            Boost Creator
          </Button>
        </div>
      </div>

      {/* Videos */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {clips.length === 0 && <p className="text-sm text-gray-500">No videos yet.</p>}
          {clips.map(clip => (
            <video
              key={clip.id}
              src={clip.mediaUrl}
              controls
              className="rounded shadow-md w-full h-auto"
            />
          ))}
        </div>
      </section>

      {/* Images */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Images</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.length === 0 && <p className="text-sm text-gray-500">No images yet.</p>}
          {gallery.map(img => (
            <div key={img.id} className="bg-black p-2 rounded shadow">
              <Image
                src={img.mediaUrl}
                alt={img.title}
                width={300}
                height={300}
                className="w-full h-40 object-cover rounded"
              />
              <div className="mt-2 text-sm text-white">{img.title}</div>
              <Button
                onClick={() => setTipImageId(img.id)}
                className="mt-2 w-full"
              >
                Tip Creator
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal for tipping */}
      {tipImageId && user && (
        <TipModal
          imageId={tipImageId}
          creatorId={user.id}
          onClose={() => setTipImageId(null)}
        />
      )}
    </div>
  );
}

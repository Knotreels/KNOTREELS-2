'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, storage } from '@/firebase/config';
import Image from 'next/image';
import UploadClipModal from '@/components/UploadClipModal';
import { useAuth } from '@/context/AuthContext';
import { Camera, Edit2, Plus, DollarSign, Loader } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

export default function PrivateProfilePage() {
  const { user } = useAuth();
  const [gallery, setGallery] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [draftBio, setDraftBio] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Real-time gallery listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'gallery'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, snap => {
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        unsubscribe();
        onSnapshot(q, ss => setGallery(ss.docs.map(d => ({ id: d.id, ...d.data() }))));
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [user]);

  // Avatar upload
  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!user) return;
      const file = e.target.files?.[0];
      if (!file) return;
      setAvatarUploading(true);
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { avatar: url });
      setAvatarUploading(false);
    },
    [user]
  );

  // Bio save
  const saveBio = useCallback(async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { bio: draftBio });
    setEditingBio(false);
  }, [draftBio, user]);

  useEffect(() => {
    if (user && !editingBio) {
      setDraftBio(user.bio || '');
    }
  }, [user, editingBio]);

  if (!user) return <p className="text-white p-6">Loading profile…</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Inline avatar edit with pulsing blue border */}
          <label className="relative group cursor-pointer">
            <div className={
              `rounded-full overflow-hidden transition-all \${
                avatarUploading
                  ? 'ring-4 ring-blue-500 ring-opacity-75 animate-pulse'
                  : ''
              }`
            }>
              <Image
                src={user.avatar || '/default-avatar.png'}
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
            {avatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <Loader className="animate-spin text-white" size={24} />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Camera size={20} className="text-white bg-black rounded-full p-1" />
            </div>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
          </label>

          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-black leading-tight">
              {user.username}
            </h1>
            {/* Bio inline edit */}
            {editingBio ? (
              <div className="flex items-center gap-2">
                <input
                  className="border-b border-gray-300 bg-transparent focus:outline-none text-black placeholder-gray-500"
                  placeholder="Write a bio..."
                  value={draftBio}
                  onChange={e => setDraftBio(e.target.value)}
                  onBlur={saveBio}
                  onKeyDown={e => e.key === 'Enter' && saveBio()}
                  autoFocus
                />
                <Edit2 size={16} className="text-gray-500 cursor-pointer" onClick={saveBio} />
              </div>
            ) : (
              <div className="relative group">
                <p className="text-sm text-gray-500">
                  {user.bio || 'Add a bio'}
                </p>
                <Edit2
                  size={16}
                  className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition text-gray-400 cursor-pointer"
                  onClick={() => setEditingBio(true)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Wallet & Upload FABs */}
        <div className="flex items-center gap-3">
          {/* Credits Wallet */}
          <button
            title="Credits"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 shadow-xl hover:scale-105 transition-transform"
          >
            <DollarSign size={20} className="text-white" />
            <span className="absolute -bottom-1 right-0 bg-yellow-500 text-white text-xs font-semibold rounded-full px-1">
              {user.credits ?? 0}
            </span>
          </button>

          {/* Upload Content FAB with label on hover */}
          <button
            onClick={() => setShowUpload(true)}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 shadow-xl hover:scale-105 transition-transform"
            title="Upload Content"
          >
            <Plus size={20} className="text-white" />
            <span className="absolute -right-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-sm font-medium rounded py-1 px-2">
              Upload
            </span>
          </button>
        </div>
      </div>

      {/* UPLOAD MODAL */}
      {showUpload && (
        <UploadClipModal
          isOpen
          onClose={() => setShowUpload(false)}
          onUploaded={() => setShowUpload(false)}
        />
      )}

      {/* GALLERY */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-black">Your Images</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.map(img => (
            <div key={img.id} className="bg-black p-2 rounded-lg shadow-lg">
              <Image
                src={img.mediaUrl}
                alt={img.title}
                width={300}
                height={300}
                className="object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
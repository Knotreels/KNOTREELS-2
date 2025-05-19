'use client';

import { useState, useRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db, storage, auth } from '@/firebase/config';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category or label is required'),
  mediaUrl: z.string().optional(),
  price: z.string().optional(), // Price is in credits
});

type FormData = z.infer<typeof schema>;

interface UploadClipModalProps {
  isOpen: boolean;
  onClose(): void;
  onUploaded(): void;
}

export default function UploadClipModal({
  isOpen,
  onClose,
  onUploaded,
}: UploadClipModalProps) {
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!auth.currentUser) {
      alert('You must be signed in.');
      return;
    }

    setLoading(true);

    try {
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData: any = userSnap.exists() ? userSnap.data() : {};
      const username = (userData.username || 'creator').trim();

      let mediaLink = data.mediaUrl?.trim() || '';

      if (file) {
        const storageRef = ref(storage, `${mediaType}s/${uuidv4()}-${file.name}`);
        await uploadBytes(storageRef, file);
        mediaLink = await getDownloadURL(storageRef);
      }

      if (!mediaLink) {
        alert('Provide a URL or upload a file');
        return;
      }

      const priceInCredits = parseInt(data.price || '0', 10);
      const listing = {
        title: data.title.trim(),
        description: data.description.trim(),
        mediaUrl: mediaLink,
        category: data.category,
        uid: auth.currentUser.uid,
        username,
        type: mediaType,
        createdAt: serverTimestamp(),
        views: 0,
        price: priceInCredits,
      };

      const collectionName = mediaType === 'video' ? 'clips' : 'gallery';

      await addDoc(collection(db, collectionName), listing);

      if (priceInCredits > 0) {
        const marketRef = await addDoc(collection(db, 'marketplaceItems'), listing);
        await addDoc(
          collection(db, `users/${auth.currentUser.uid}/shopItems`),
          { ...listing, marketplaceId: marketRef.id }
        );
      }

      onUploaded();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={modalRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              ref={modalRef}
              className="bg-[#0a0a0a] p-6 rounded-xl w-full max-w-lg"
            >
              <Dialog.Title className="text-xl font-semibold text-white mb-4">
                Upload Content
              </Dialog.Title>

              <div className="flex gap-4 mb-4 text-white">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="mediaType"
                    value="video"
                    checked={mediaType === 'video'}
                    onChange={() => setMediaType('video')}
                  />
                  Video
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="mediaType"
                    value="image"
                    checked={mediaType === 'image'}
                    onChange={() => setMediaType('image')}
                  />
                  Image
                </label>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-white">
                <div>
                  <label className="block mb-1">Title</label>
                  <Input {...register('title')} placeholder="Enter a title" />
                  {errors.title && (
                    <p className="text-red-400 text-xs">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full p-2 bg-[#1a1a1a] border border-gray-600 rounded"
                    placeholder="Describe your content"
                  />
                  {errors.description && (
                    <p className="text-red-400 text-xs">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1">
                    {mediaType === 'video' ? 'Category' : 'Gallery Label'}
                  </label>
                  {mediaType === 'video' ? (
                    <select
                      {...register('category')}
                      className="w-full p-2 bg-[#1a1a1a] border border-gray-600 rounded"
                    >
                      <option value="">Choose a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.slug} value={cat.title}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      {...register('category')}
                      placeholder="e.g. Digital Art, Concept Design"
                    />
                  )}
                  {errors.category && (
                    <p className="text-red-400 text-xs">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1">Price (credits)</label>
                  <Input
                    {...register('price')}
                    placeholder="e.g. 10"
                    type="number"
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block mb-1">Media URL (optional)</label>
                  <Input {...register('mediaUrl')} placeholder="Paste a video/image URL" />
                </div>

                <div>
                  <label className="block mb-1">Or Upload File</label>
                  <input
                    type="file"
                    accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                    onChange={onFileChange}
                    className="w-full text-sm text-white"
                  />
                  {preview && (
                    <div className="mt-2">
                      {mediaType === 'image' ? (
                        <img
                          src={preview}
                          alt="preview"
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <video
                          src={preview}
                          controls
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Uploading…' : 'Upload'}
                  </Button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

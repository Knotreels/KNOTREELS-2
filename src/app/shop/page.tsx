// src/app/shop/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import BuyButton from '@/components/BuyButton';

export default function ShopPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForSale() {
      const q = query(
        collection(db, 'posts'),
        where('isForSale', '==', true)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
      setLoading(false);
    }

    fetchForSale();
  }, []);

  if (loading) return <p className="p-6 text-blue-500">Loading for-sale content...</p>;

  return (
    <div className="p-6 text-blue-700">
      <h1 className="text-3xl font-bold mb-6">🛒 Shop</h1>

      {posts.length === 0 ? (
        <p>No items for sale yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white text-blue-700 p-4 rounded shadow">
              <img src={post.mediaUrl} alt={post.title} className="w-full h-48 object-cover rounded mb-2" />
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-600">{post.description}</p>
              <p className="mt-2 font-bold">{post.price} Credits</p>
              <BuyButton postId={post.id} price={post.price} />

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

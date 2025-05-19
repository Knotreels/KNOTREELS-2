'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { FaDollarSign } from 'react-icons/fa';

interface MarketItem {
  id: string;
  title: string;
  mediaUrl: string;
  username: string;
  price: number;
  description: string;
  type: 'video' | 'image';
}

export default function ShopPage() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      const snap = await getDocs(
        query(collection(db, 'marketplaceItems'), orderBy('createdAt', 'desc'))
      );
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<MarketItem, 'id'>),
      }));
      setItems(data);
      setLoading(false);
    }

    fetchItems();
  }, []);

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400">No items available for sale.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map(item => (
            <div
              key={item.id}
              className="group relative cursor-pointer"
            >
              {/* Base Card */}
              <div className="bg-[#111] border border-gray-700 rounded-xl overflow-hidden shadow-md transition-transform duration-200 group-hover:scale-105">
                {item.type === 'image' ? (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <video
                    src={item.mediaUrl}
                    muted
                    playsInline
                    preload="metadata"
                    onMouseOver={e => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseOut={e => {
                      const video = e.currentTarget as HTMLVideoElement;
                      video.pause();
                      video.currentTime = 0;
                    }}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-4 space-y-1">
                  <h3 className="text-lg font-bold truncate">{item.title}</h3>
                  <p className="text-sm text-gray-400">by {item.username}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="flex items-center gap-1 text-blue-400 font-semibold">
                      <FaDollarSign className="text-sm" />
                      {item.price && item.price > 0 ? `${item.price} credits` : 'Free'}
                    </span>
                    <button className="bg-blue-600 text-sm text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">
                      Buy
                    </button>
                  </div>
                </div>
              </div>

              {/* Hover Preview */}
              <div className="absolute z-20 left-0 top-full mt-2 w-full bg-black/90 border border-gray-700 rounded-xl p-4 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl">
              <p className="text-gray-300 text-sm">{item.description}</p>
             </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

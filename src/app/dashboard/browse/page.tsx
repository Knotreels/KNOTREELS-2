'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

import HeroBanner from '@/components/HeroBanner';
import MovieRow from '@/components/MovieRow';
import Footer from '@/components/Footer';
import { getBoostedCreators } from '@/lib/fetchBoostedCreators';
import { CATEGORIES } from '@/lib/constants';

export default function BrowsePage() {
  const [boosted, setBoosted] = useState<any[] | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoosted = async () => {
      try {
        const creators = await getBoostedCreators();
        setBoosted(creators);
      } catch (err) {
        console.error('Failed to fetch boosted creators:', err);
        setBoosted([]);
      }
    };

    fetchBoosted();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData?.avatar) {
            setAvatarUrl(userData.avatar);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ⏳ Show loading screen until boosted is ready
  if (boosted === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl font-semibold animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {/* 👤 Profile Avatar (top right) */}
      {avatarUrl && (
        <Link href="/dashboard/profiles" className="absolute top-6 right-6 z-30">
          <Image
            src={avatarUrl || '/default-avatar.png'}
            alt="Profile"
            width={44}
            height={44}
            className="rounded-full border border-white hover:scale-105 transition"
          />
        </Link>
      )}

      {/* 🚀 Boosted Creators Hero */}
      <div className="-mb-4">
        <HeroBanner boosted={boosted} />
      </div>

      {/* 🚀 Boosted Creators Carousel */}
      {boosted.length > 0 && (
        <section className="px-6 py-4 space-y-4">
          <h2 className="text-white text-xl font-semibold">Boosted Creators</h2>
          <div className="flex overflow-x-auto gap-4 pb-2">
            {boosted.map((creator) => (
              <Link
                key={creator.id}
                href={`/creator/${creator.username}`}
                className="min-w-[140px] bg-[#1c1c1c] rounded-lg p-3 border border-gray-700 hover:bg-[#222] flex-shrink-0"
              >
                <Image
                  src={creator.avatar || '/default-avatar.png'}
                  alt={creator.username}
                  width={64}
                  height={64}
                  className="rounded-full mx-auto border border-gray-600"
                />
                <p className="text-center mt-2 text-sm font-medium truncate">{creator.username}</p>
                {creator.badges?.length > 0 && (
                  <p className="text-center text-xs text-blue-400 mt-1">
                    {creator.badges[creator.badges.length - 1]}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 📂 Categories */}
      <section className="relative z-10 w-full px-6 space-y-10 pb-14">
        <MovieRow
          title=" Genres "
          cardSize="large"
          movies={CATEGORIES.map((category, index) => ({
            id: index,
            title: category.title || 'Untitled',
            overview: '',
            poster_path: category.thumbnail || '',
            backdrop_path: category.thumbnail || '',
            release_date: '',
            genre_ids: [],
            vote_average: 0,
            href: `/category/${category.title.toLowerCase().replace(/\s+/g, '-')}`,
          }))}
        />
      </section>

      <Footer />
    </>
  );
}

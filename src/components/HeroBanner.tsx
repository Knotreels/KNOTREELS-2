'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import MovieRow from '@/components/MovieRow';
import CreditIcon from '../components/icons/CreditIcon';

interface HeroBannerProps {
  boosted?: any[];
}

const letterVariants: Variants = {
  hidden: { opacity: 0, x: -20, rotate: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: {
      delay: 0.8 + i * 0.1,
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  }),
};

export default function HeroBanner({ boosted = [] }: HeroBannerProps) {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') || 'viewer';
  const pathname = usePathname();
  const isBrowsePage = pathname?.includes('/browse');
  const reelsText = 'Reels'.split('');

  return (
    <section className="relative flex flex-col items-start justify-start min-h-screen bg-white text-blue-700 px-4 overflow-hidden">
      {/* Purchase Credits */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 text-sm">
        <CreditIcon className="w-5 h-5 text-blue-700" />
        <Link
          href={`/pricing?role=${roleParam}`}
          className="font-medium hover:underline transition"
        >

        </Link>
      </div>

      {/* Optional Video Background */}
      <video
        src="/highlight-reel.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10 opacity-10"
      />

  

      <div className="z-10 w-full max-w-7xl mx-auto pt-8 md:pt-12 px-4">
        {/* Animated Title */}
        <motion.h1
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 10, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold mb-1 tracking-wide flex flex-wrap"
        >
          <span className="text-gray-700">Knot</span>
          {reelsText.map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="text-blue-500 inline-block ml-2"
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Auth Buttons (not on /browse) */}
        {!isBrowsePage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="flex gap-4 mb-8"
          >
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm md:text-base font-medium"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="bg-blue-200 hover:bg-blue-300 text-blue-900 px-6 py-2 rounded-md text-sm md:text-base font-medium"
            >
              Log In
            </Link>
          </motion.div>
        )}

        {/* Featured Creators (only on /browse) */}
        {isBrowsePage && boosted.length > 0 && (
          <>
            <div className="mt-28 px-4 md:px-8">
              <MovieRow
                title="Featured Creators"
                cardSize="large"
                autoScroll
                scrollSpeed={4000}

                movies={boosted.map((c) => ({
                  id: c.id,
                  userId: c.id,
                  title: c.username || 'Creator',
                  overview: c.bio || '',
                  poster_path: c.avatar || '/default-avatar.png',
                  backdrop_path: c.avatar || '/default-avatar.png',
                  release_date: '',
                  genre_ids: [],
                  vote_average: 0,
                  badge: Array.isArray(c.badges) ? c.badges.at(-1) : null, // latest badge
                }))}
                
                
              />
            </div>

            <div className="mt-6">
              <div className="bg-white border border-blue-600 rounded-lg p-6 text-left max-w-3xl ml-16 shadow-md">
                <h2 className="text-xl font-bold text-blue-800 mb-2">
                  Get Boosted. Get Seen. 🌟
                </h2>
                <p className="text-blue-700 text-sm">
                  Once your content receives{' '}
                  <span className="text-blue-500 font-semibold">20 Boosts</span>, your
                  profile is featured in the{' '}
                  <span className="text-blue-600 font-semibold">Boosted Creators</span>{' '}
                  carousel for everyone to discover!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
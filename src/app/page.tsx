'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white grid grid-cols-1 lg:grid-cols-2">
      {/* Left side – logo and welcome message */}
      <div className="flex flex-col justify-center items-center px-6 py-20 text-center space-y-6">
        <Image
          src="/logo-kr.jpg"
          alt="KnotReels Logo"
          width={100}
          height={100}
          className="mb-4"
        />
        <h1 className="text-4xl font-bold">
          Welcome to <span className="text-blue-500">KnotReels</span>
        </h1>
        <p className="text-gray-400 max-w-md text-base">
          We’re a creative community built for filmmakers, storytellers, and dreamers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/signup?role=viewer">
            <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg rounded-md transition">
              Join as Viewer
            </Button>
          </Link>
          <Link href="/signup?role=creator">
            <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg rounded-md transition">
              Join as Creator
            </Button>
          </Link>
        </div>
        <Link
          href="/login"
          className="text-blue-400 hover:underline text-sm mt-4"
        >
          Already have an account? Sign in here
        </Link>
      </div>

      {/* Right side – dark blank panel for symmetry */}
      <div className="hidden lg:block bg-black"></div>
    </div>
  );
}

// File: src/components/MediaCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef } from 'react'
import {
  FaTrash,
  FaEye,
  FaDollarSign,
  FaCommentDots,
} from 'react-icons/fa'
import type { Clip } from '@/lib/types'

export interface MediaCardProps {
  clip: Clip
  isOwner: boolean
  onDelete?: (id: string) => void
  onComment?: (id: string) => void
  onTip?: (id: string) => void
}

export function MediaCard({
  clip,
  isOwner,
  onDelete,
  onComment,
  onTip,
}: MediaCardProps) {
  const [hovered, setHovered] = useState(false)
  const hasPlayed = useRef(false)

  const handlePlay = () => {
    if (!hasPlayed.current) {
      hasPlayed.current = true
      // TODO: your Firestore `increment(views)` logic here
    }
  }

  return (
    <div
      className="relative bg-gray-900 rounded-lg overflow-hidden group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {clip.type === 'video' ? (
        <video
          src={clip.mediaUrl}
          controls
          onPlay={handlePlay}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="relative w-full h-48">
          <Image
            src={clip.mediaUrl!}
            alt={clip.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* delete button (only shown to owner on hover) */}
      {isOwner && hovered && onDelete && (
        <button
          onClick={() => onDelete(clip.id)}
          className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white"
          title="Delete"
        >
          <FaTrash />
        </button>
      )}

      <div className="p-3 text-white space-y-1">
        {/* Title links to creator (you can change to clip page if you want) */}
        <Link
          href={`/creator/${encodeURIComponent(clip.uid)}`}
          className="font-semibold hover:underline block"
        >
          {clip.title}
        </Link>

        {/* Username */}
        <Link
          href={`/creator/${encodeURIComponent(clip.uid)}`}
          className="text-xs text-gray-400 hover:underline block"
        >
          @{clip.username}
        </Link>

        {/* stats & actions */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
          <span>
            {clip.price && clip.price > 0
              ? `${clip.price} credits`
              : 'Free'}
          </span>

          <span className="flex items-center gap-1">
            <FaEye /> {clip.views ?? 0}
          </span>

          <span className="flex items-center gap-1">
            <FaDollarSign /> {(clip.tips ?? 0).toFixed(2)}
          </span>

          <button
            onClick={() => onComment?.(clip.id)}
            className="flex items-center gap-1 text-blue-400 hover:underline"
          >
            <FaCommentDots /> Comments
          </button>

          <button
            onClick={() => onTip?.(clip.id)}
            className="flex items-center gap-1 text-green-400 hover:underline"
          >
            <FaDollarSign /> Tip
          </button>
        </div>
      </div>
    </div>
  )
}

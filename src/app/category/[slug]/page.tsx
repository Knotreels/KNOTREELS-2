// src/app/category/[slug]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase/config'
import { MediaCard } from '@/components/MediaCard'
import CommentModal from '@/components/CommentModal'
import TipModal     from '@/components/TipModal'

export default function CategoryPage() {
  const { slug } = useParams()
  const { user } = useAuth()

  const [clips, setClips]         = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [commentId, setCommentId] = useState<string|null>(null)
  const [tipId, setTipId]         = useState<string|null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const q = query(
        collection(db, 'clips'),
        where('categorySlug', '==', slug),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      setClips(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setLoading(false)
    })()
  }, [slug])

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'clips', id))
    setClips(cs => cs.filter(c => c.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white capitalize">
        {slug?.replace(/-/g, ' ')} Clips
      </h1>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {clips.map(clip => {
            const isOwner = user?.uid === clip.uid
            return (
              <MediaCard
                key={clip.id}
                clip={clip}
                isOwner={isOwner}
                onDelete={ isOwner ? handleDelete : undefined }
                onComment={(id) => setCommentId(id)}
                onTip={(id)     => setTipId(id)    }
              />
            )
          })}
        </div>
      )}

      {/* Comments */}
      {commentId && (
        <CommentModal
          clipId={commentId}
          isOpen={true}
          onClose={() => setCommentId(null)}
        />
      )}

      {/* Tips */}
      {tipId && (
        <TipModal
          imageId={tipId}
          creatorId={clips.find(c => c.id===tipId)!.uid}
          onClose={() => setTipId(null)}
        />
      )}
    </div>
  )
}

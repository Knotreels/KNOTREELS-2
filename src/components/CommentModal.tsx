'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { FaTimes, FaSmile } from 'react-icons/fa';
import Image from 'next/image';
import EmojiPicker from 'emoji-picker-react';

interface CommentData {
  id: string;
  clipId: string;
  parentId?: string | null;
  text: string;
  userId: string;
  username: string;
  avatar: string;
  createdAt: any;
}

interface Props {
  isOpen: boolean;
  onClose(): void;
  clipId: string;
}

export default function CommentModal({ isOpen, onClose, clipId }: Props) {
  const { user: currentUser } = useAuth();
  const [allComments, setAllComments] = useState<CommentData[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [id: string]: string }>({});
  const [showReplies, setShowReplies] = useState<{ [id: string]: boolean }>({});
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clipId) return;
    const q = query(
      collection(db, 'comments'),
      where('clipId', '==', clipId),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      const comments = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setAllComments(comments);
      setLoading(false);
    });
    return () => unsub();
  }, [clipId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showEmoji && emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  const handlePost = async (text: string, parentId: string | null = null) => {
    if (!text.trim() || !currentUser?.uid) return;

    const udoc = await getDoc(doc(db, 'users', currentUser.uid));
    const user = (udoc.data() as any) || {};

    await addDoc(collection(db, 'comments'), {
      clipId,
      parentId,
      text: text.trim(),
      userId: currentUser.uid,
      username: user.username || 'Anonymous',
      avatar: user.avatar || '/default-avatar.png',
      createdAt: serverTimestamp()
    });

    setCommentInputs(prev => {
      const newState = { ...prev };
      delete newState[parentId || 'top'];
      return newState;
    });

    if (parentId) {
      setShowReplies(prev => ({ ...prev, [parentId]: true }));
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    setCommentInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[commentId];
      return newInputs;
    });
  };

  const handleInputChange = (id: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [id]: value }));
  };

  const CommentThread = ({ parentId = null }: { parentId?: string | null }) => {
    const comments = allComments.filter(c => c.parentId === parentId);
    return (
      <>
        {comments.map(comment => {
          const replies = allComments.filter(r => r.parentId === comment.id);
          const isExpanded = showReplies[comment.id];
          return (
            <div key={comment.id} className="ml-0 mt-4">
              <div className="flex items-start gap-3">
                <Image
                  src={comment.avatar}
                  alt={comment.username}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <div className="flex-1 bg-zinc-800 p-2 rounded-lg">
                  <p className="text-xs font-semibold">{comment.username}</p>
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>

              <div className="ml-11 mt-1 mb-1 flex gap-4 text-xs text-blue-400">
                <button
                  onClick={() =>
                    setCommentInputs(prev => ({
                      ...prev,
                      [comment.id]: ''
                    }))
                  }
                  className="hover:underline"
                >
                  Reply
                </button>

                {replies.length > 0 && (
                  <button
                    onClick={() => toggleReplies(comment.id)}
                    className="hover:underline"
                  >
                    {isExpanded ? 'Hide replies' : `Show replies (${replies.length})`}
                  </button>
                )}
              </div>

              {/* Reply input field */}
              {commentInputs[comment.id] !== undefined && (
                <div className="ml-11 space-y-2 mb-2">
                  <input
                    type="text"
                    placeholder="Write a reply…"
                    value={commentInputs[comment.id]}
                    autoFocus
                    onChange={e => handleInputChange(comment.id, e.target.value)}
                    className="w-full rounded border border-zinc-600 bg-zinc-800 p-2 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        setCommentInputs(prev => {
                          const newInputs = { ...prev };
                          delete newInputs[comment.id];
                          return newInputs;
                        })
                      }
                      className="text-gray-400 text-sm hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePost(commentInputs[comment.id], comment.id)}
                      className="rounded bg-blue-600 px-4 py-2 text-white text-sm"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Nested replies */}
              {isExpanded && (
                <div className="ml-6">
                  <CommentThread parentId={comment.id} />
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md bg-[#0a0a0a] p-6 rounded-lg text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="mb-4 text-xl font-semibold">Comments</h2>

        <div className="space-y-2 mb-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading…</p>
          ) : allComments.filter(c => !c.parentId).length === 0 ? (
            <p className="text-center text-gray-500">No comments yet.</p>
          ) : (
            <CommentThread />
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-zinc-700 pt-4 relative">
          <input
            type="text"
            value={commentInputs.top || ''}
            onChange={e => handleInputChange('top', e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 rounded border border-zinc-600 bg-zinc-800 p-2 outline-none"
          />
          <button
            onClick={() => setShowEmoji(v => !v)}
            className="text-blue-400 hover:text-white"
          >
            <FaSmile size={18} />
          </button>
          <button
            onClick={() => handlePost(commentInputs.top || '', null)}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Send
          </button>
          {showEmoji && (
            <div ref={emojiRef} className="absolute bottom-full left-0 z-50">
              <EmojiPicker
                onEmojiClick={(_e, data) => {
                  setCommentInputs(prev => ({
                    ...prev,
                    top: (prev.top || '') + data.emoji
                  }));
                }}
                theme="dark"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from './ui/button';
import { auth } from '@/firebase/config';

interface TipModalProps {
  imageId: string;
  creatorId: string;
  onClose(): void;
}

export default function TipModal({ imageId, creatorId, onClose }: TipModalProps) {
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTip = async () => {
    const tipperId = auth.currentUser?.uid;

    if (!tipperId || !imageId || !creatorId || isNaN(amount) || amount < 1) {
      setMessage({ type: 'error', text: 'Missing info or invalid credit amount.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipperId,
          creatorId,
          imageId,
          credits: amount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to tip');

      setMessage({ type: 'success', text: 'Thanks for tipping!' });

      // Optionally auto-close after a delay
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Tip failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#111] text-white rounded-lg p-6 w-full max-w-sm">
          <Dialog.Title className="text-lg font-bold mb-4">Tip Creator</Dialog.Title>

          <label className="block mb-2 text-sm">Credits to send</label>
          <input
            type="number"
            value={amount}
            min={1}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val)) setAmount(val);
            }}
            className="w-full p-2 bg-black border border-gray-600 rounded mb-2 text-white"
          />

          {message && (
            <p className={`text-sm mb-2 ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message.text}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleTip} disabled={loading || amount < 1}>
              {loading ? 'Sending...' : `Send ${amount} Credits`}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

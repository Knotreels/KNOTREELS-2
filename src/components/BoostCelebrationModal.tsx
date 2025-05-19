'use client';

import { Button, Dialog, Transition } from '@headlessui/react';
import { DialogContent } from '@radix-ui/react-dialog';
import { Fragment } from 'react';

interface BoostCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function BoostCelebrationModal({
  isOpen,
  onClose,
  boostCount,
  viewerRole = 'supporter',
}: {
  isOpen: boolean
  onClose: () => void
  boostCount: number
  viewerRole?: 'creator' | 'supporter'
}) {
  return (
    <Dialog open={isOpen} onChange={onClose} onClose={function (value: boolean): void {
      throw new Error('Function not implemented.');
    } }>
      <DialogContent className="text-center">
        <h2 className="text-2xl font-bold text-blue-400 chewy-font">
          {viewerRole === 'creator'
            ? `🎉 You hit ${boostCount} boosts!`
            : `🚀 Boost sent!`}
        </h2>
        <p className="mt-2 text-white">
          {viewerRole === 'creator'
            ? `You're now featured and may have earned a new badge.`
            : `Thanks for supporting this creator!`}
        </p>
        <Button className="mt-4" onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}


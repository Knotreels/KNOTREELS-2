// components/ui/CoinIcon.tsx
import Image from 'next/image';

export default function CoinIcon({ size = 24 }: { size?: number }) {
  return (
    <Image
      src="/images/coin.png"
      alt="KnotReels Coin"
      width={size}
      height={size}
      className="inline-block align-middle"
    />
  );
}

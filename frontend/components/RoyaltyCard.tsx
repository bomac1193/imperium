import { Music, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';

interface RoyaltyCardProps {
  songId: bigint;
  title: string;
  artist: string;
  totalEarnings: number;
  monthlyEarnings: number;
  holders: number;
  imageUrl?: string;
}

export default function RoyaltyCard({
  songId,
  title,
  artist,
  totalEarnings,
  monthlyEarnings,
  holders,
  imageUrl,
}: RoyaltyCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Cover */}
      <div className="h-40 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <Music className="w-16 h-16 text-gray-700" />
        )}
      </div>

      <CardContent>
        <h3 className="font-display text-heading-sm mb-1 truncate">{title}</h3>
        <p className="text-gray-400 text-body-sm mb-4 truncate">{artist}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="overline mb-1">Total Earned</p>
            <p className="font-mono text-accent">
              {totalEarnings.toLocaleString()} USDC
            </p>
          </div>
          <div>
            <p className="overline mb-1">This Month</p>
            <p className="font-mono text-success">
              {monthlyEarnings.toLocaleString()} USDC
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-2 text-gray-400 text-body-sm">
            <Users className="w-4 h-4" />
            <span>{holders} holders</span>
          </div>
          <Link href={`/song/${songId}`}>
            <button className="text-accent hover:opacity-80 flex items-center gap-1 text-body-sm transition-opacity">
              Details
              <ExternalLink className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

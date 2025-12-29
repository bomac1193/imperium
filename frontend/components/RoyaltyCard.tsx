import { motion } from 'framer-motion';
import { Music, Users, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';

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
    <motion.div
      whileHover={{ y: -5 }}
      className="glass rounded-xl overflow-hidden card-hover"
    >
      {/* Cover Image */}
      <div className="h-40 bg-gradient-to-br from-imperium-purple/30 to-imperium-gold/30 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <Music className="w-16 h-16 text-white/30" />
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold mb-1 truncate">{title}</h3>
        <p className="text-white/60 text-sm mb-4 truncate">{artist}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-white/40 text-xs mb-1">Total Earned</p>
            <p className="font-mono text-imperium-gold font-bold">
              ${totalEarnings.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">This Month</p>
            <p className="font-mono text-green-400 font-bold">
              ${monthlyEarnings.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Users className="w-4 h-4" />
            <span>{holders} holders</span>
          </div>
          <Link href={`/song/${songId}`}>
            <button className="text-imperium-gold hover:text-imperium-gold/80 flex items-center gap-1 text-sm">
              Details
              <ExternalLink className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

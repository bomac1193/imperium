import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import {
  Music,
  Coins,
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import RoyaltyCard from '@/components/RoyaltyCard';
import {
  useCreatorSongs,
  useAllClaimableBalances,
  useClaimRoyalties,
} from '@/hooks/useContracts';
import { MOCK_SOURCES, MOCK_ROYALTY_FLOWS } from '@/lib/store';
import { formatUnits } from 'viem';
import Link from 'next/link';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: songIds } = useCreatorSongs(address);
  const { data: claimableBalances } = useAllClaimableBalances(address);
  const { claimAllRoyalties, isPending, isConfirming, isSuccess } = useClaimRoyalties();

  const [activeTab, setActiveTab] = useState<'overview' | 'songs' | 'earnings'>('overview');

  // Calculate total claimable
  const totalClaimable = claimableBalances?.reduce(
    (sum, b) => sum + Number(formatUnits(b.amount, 6)),
    0
  ) || 0;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-imperium-dark">
        <Navbar />
        <div className="pt-32 container mx-auto px-6">
          <div className="max-w-md mx-auto text-center">
            <Wallet className="w-16 h-16 mx-auto text-imperium-gold/50 mb-6" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-white/60 mb-8">
              Connect your wallet to view your dashboard, manage songs, and claim royalties.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-imperium-dark">
      <Navbar />

      <main className="pt-24 pb-12 container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
            <p className="text-white/60">
              Welcome back, {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/upload">
              <button className="px-6 py-3 bg-imperium-gold text-imperium-dark font-bold rounded-lg flex items-center gap-2 hover:bg-imperium-gold/90 transition-all">
                <Music className="w-5 h-5" />
                Upload Song
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Music className="w-6 h-6" />}
            label="Registered Songs"
            value={songIds?.length?.toString() || '0'}
            change="+2 this month"
          />
          <StatCard
            icon={<Coins className="w-6 h-6" />}
            label="Total Earned"
            value={`$${(174000).toLocaleString()}`}
            change="+12.5%"
            positive
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="This Month"
            value={`$${(12450).toLocaleString()}`}
            change="+8.2%"
            positive
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Claimable"
            value={`$${totalClaimable.toLocaleString()}`}
            action={
              totalClaimable > 0 && (
                <button
                  onClick={() => claimAllRoyalties()}
                  disabled={isPending || isConfirming}
                  className="text-xs bg-imperium-gold/20 text-imperium-gold px-2 py-1 rounded hover:bg-imperium-gold/30 transition-all"
                >
                  {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Claim All'}
                </button>
              )
            }
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10 mb-8">
          {(['overview', 'songs', 'earnings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 capitalize transition-colors ${
                activeTab === tab
                  ? 'text-imperium-gold border-b-2 border-imperium-gold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Earnings */}
            <div className="lg:col-span-2 glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Revenue by Source</h2>
              <div className="space-y-4">
                {MOCK_SOURCES.map((source) => (
                  <div key={source.name} className="flex items-center gap-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="flex-1">{source.name}</span>
                    <span className="text-white/60">{source.percentage}%</span>
                    <span className="font-mono">${source.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Simple Bar Chart */}
              <div className="mt-8 flex gap-1 h-8">
                {MOCK_SOURCES.map((source) => (
                  <motion.div
                    key={source.name}
                    initial={{ width: 0 }}
                    animate={{ width: `${source.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded"
                    style={{ backgroundColor: source.color }}
                  />
                ))}
              </div>
            </div>

            {/* Top Regions */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Top Regions</h2>
              <div className="space-y-4">
                {MOCK_ROYALTY_FLOWS.slice(0, 5).map((flow, i) => (
                  <div key={flow.region} className="flex items-center gap-4">
                    <span className="text-white/40 w-6">{i + 1}</span>
                    <span className="flex-1">{flow.region}</span>
                    <span className="font-mono text-imperium-gold">
                      ${flow.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/map">
                <button className="w-full mt-6 py-3 border border-white/20 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                  View Global Map
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'songs' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Songs - In production, map over actual songs */}
            <RoyaltyCard
              songId={1n}
              title="Break the Chain"
              artist="Your Name"
              totalEarnings={45000}
              monthlyEarnings={3200}
              holders={156}
            />
            <RoyaltyCard
              songId={2n}
              title="No Masters"
              artist="Your Name"
              totalEarnings={28000}
              monthlyEarnings={2100}
              holders={89}
            />
            <RoyaltyCard
              songId={3n}
              title="Take the Throne"
              artist="Your Name feat. Artist"
              totalEarnings={62000}
              monthlyEarnings={4500}
              holders={234}
            />

            {/* Add Song Card */}
            <Link href="/upload">
              <div className="glass rounded-xl p-6 h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-white/20 hover:border-imperium-gold/50 transition-all cursor-pointer min-h-[200px]">
                <Music className="w-12 h-12 text-white/40 mb-4" />
                <p className="text-white/60">Register New Song</p>
              </div>
            </Link>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full table-imperium">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Song</th>
                  <th>Source</th>
                  <th>Region</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '2024-01-15', song: 'Break the Chain', source: 'Spotify', region: 'US', amount: 1250, status: 'Claimed' },
                  { date: '2024-01-14', song: 'No Masters', source: 'Apple Music', region: 'GB', amount: 890, status: 'Claimed' },
                  { date: '2024-01-13', song: 'Take the Throne', source: 'YouTube', region: 'DE', amount: 650, status: 'Pending' },
                  { date: '2024-01-12', song: 'Break the Chain', source: 'Spotify', region: 'JP', amount: 420, status: 'Pending' },
                  { date: '2024-01-11', song: 'No Masters', source: 'Amazon', region: 'CA', amount: 380, status: 'Claimed' },
                ].map((earning, i) => (
                  <tr key={i}>
                    <td className="text-white/60">{earning.date}</td>
                    <td>{earning.song}</td>
                    <td>{earning.source}</td>
                    <td>{earning.region}</td>
                    <td className="font-mono text-imperium-gold">${earning.amount}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          earning.status === 'Claimed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {earning.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function StatCard({
  icon,
  label,
  value,
  change,
  positive,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-imperium-gold/10 rounded-lg flex items-center justify-center text-imperium-gold">
          {icon}
        </div>
        {action}
      </div>
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {change && (
        <p className={`text-sm mt-1 ${positive ? 'text-green-400' : 'text-white/40'}`}>
          {change}
        </p>
      )}
    </motion.div>
  );
}

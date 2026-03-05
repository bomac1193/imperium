import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import RoyaltyCard from '@/components/RoyaltyCard';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import PageHeader from '@/components/layout/PageHeader';
import {
  useCreatorSongs,
  useAllClaimableBalances,
  useClaimRoyalties,
} from '@/hooks/useContracts';
import { MOCK_SOURCES, MOCK_ROYALTY_FLOWS } from '@/lib/store';
import { formatUnits } from 'viem';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const TABS = ['overview', 'songs', 'earnings'] as const;

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: songIds } = useCreatorSongs(address);
  const { data: claimableBalances } = useAllClaimableBalances(address);
  const { claimAllRoyalties, isPending, isConfirming, isSuccess } = useClaimRoyalties();

  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('overview');

  const balancesArr = claimableBalances as { amount: bigint }[] | undefined;
  const totalClaimable = balancesArr?.reduce(
    (sum, b) => sum + Number(formatUnits(b.amount, 6)),
    0
  ) || 0;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black md:pl-48">
        <Navbar />
        <div className="pt-24 md:pt-16 container mx-auto px-6">
          <div className="max-w-sm mx-auto text-center">
            <h1 className="font-display text-heading-lg mb-4">Connect your wallet</h1>
            <p className="text-gray-400 font-light text-body-sm">
              Connect to view your dashboard and claim royalties.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black md:pl-48">
      <Navbar />

      <main className="pt-20 md:pt-8 pb-12 container mx-auto px-6">
        <PageHeader
          title="Dashboard"
          description={`Welcome back, ${address?.slice(0, 6)}...${address?.slice(-4)}`}
          actions={
            <Link href="/upload">
              <Button variant="accent">
                Upload song
              </Button>
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1a1a1a] mb-8">
          <StatCard
            label="Registered Songs"
            value={((songIds as any[])?.length ?? 0).toString()}
            trend="+2 this month"
            className="bg-black"
          />
          <StatCard
            label="Total Earned"
            value={`${(174000).toLocaleString()} USDC`}
            trend="+12.5%"
            trendPositive
            accent
            className="bg-black"
          />
          <StatCard
            label="This Month"
            value={`${(12450).toLocaleString()} USDC`}
            trend="+8.2%"
            trendPositive
            className="bg-black"
          />
          <StatCard
            label="Claimable"
            value={`${totalClaimable.toLocaleString()} USDC`}
            accent
            action={
              totalClaimable > 0 ? (
                <button
                  onClick={() => claimAllRoyalties()}
                  disabled={isPending || isConfirming}
                  className="text-caption bg-accent/15 text-accent px-2 py-1 transition-colors hover:bg-accent/25"
                >
                  {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Claim All'}
                </button>
              ) : undefined
            }
            className="bg-black"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-[#1a1a1a] mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-4 transition-colors overline',
                activeTab === tab
                  ? 'text-accent border-b border-accent'
                  : 'text-gray-500 hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardContent>
                <h2 className="font-display text-heading-sm mb-6">Revenue by source</h2>
                <div className="space-y-4">
                  {MOCK_SOURCES.map((source) => (
                    <div key={source.category} className="flex items-center gap-4">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="flex-1 text-body-sm">{source.label}</span>
                      <span className="text-gray-400 text-body-sm">{source.percentage}%</span>
                      <span className="font-mono text-body-sm">{source.amount.toLocaleString()} <span className="text-gray-500">USDC</span></span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-px h-2">
                  {MOCK_SOURCES.map((source) => (
                    <motion.div
                      key={source.category}
                      initial={{ width: 0 }}
                      animate={{ width: `${source.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full"
                      style={{ backgroundColor: source.color }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h2 className="font-display text-heading-sm mb-6">Top regions</h2>
                <div className="space-y-4">
                  {MOCK_ROYALTY_FLOWS.slice(0, 5).map((flow, i) => (
                    <div key={flow.region} className="flex items-center gap-4">
                      <span className="text-gray-500 font-mono text-body-sm w-6">{i + 1}</span>
                      <span className="flex-1 text-body-sm">{flow.region}</span>
                      <span className="font-mono text-accent text-body-sm">
                        {flow.amount.toLocaleString()} <span className="text-gray-500">USDC</span>
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/map">
                  <Button variant="outline" className="w-full mt-6">
                    View map
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Songs Tab */}
        {activeTab === 'songs' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RoyaltyCard
              songId={BigInt(1)}
              title="Break the Chain"
              artist="Your Name"
              totalEarnings={45000}
              monthlyEarnings={3200}
              holders={156}
            />
            <RoyaltyCard
              songId={BigInt(2)}
              title="No Masters"
              artist="Your Name"
              totalEarnings={28000}
              monthlyEarnings={2100}
              holders={89}
            />
            <RoyaltyCard
              songId={BigInt(3)}
              title="Take the Throne"
              artist="Your Name feat. Artist"
              totalEarnings={62000}
              monthlyEarnings={4500}
              holders={234}
            />
            <Link href="/upload">
              <div className="card p-6 h-full flex flex-col items-center justify-center text-center border-dashed cursor-pointer hover:border-accent/50 transition-colors min-h-[200px]">
                <p className="text-gray-400 text-body-sm">Register new song</p>
              </div>
            </Link>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Song</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { date: '2024-01-15', song: 'Break the Chain', source: 'Spotify', region: 'US', amount: 1250, status: 'Claimed' },
                  { date: '2024-01-14', song: 'No Masters', source: 'Apple Music', region: 'GB', amount: 890, status: 'Claimed' },
                  { date: '2024-01-13', song: 'Take the Throne', source: 'YouTube', region: 'DE', amount: 650, status: 'Pending' },
                  { date: '2024-01-12', song: 'Break the Chain', source: 'Spotify', region: 'JP', amount: 420, status: 'Pending' },
                  { date: '2024-01-11', song: 'No Masters', source: 'Amazon', region: 'CA', amount: 380, status: 'Claimed' },
                ].map((earning, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-gray-400">{earning.date}</TableCell>
                    <TableCell>{earning.song}</TableCell>
                    <TableCell>{earning.source}</TableCell>
                    <TableCell>{earning.region}</TableCell>
                    <TableCell className="font-mono text-accent">{earning.amount} USDC</TableCell>
                    <TableCell>
                      <Badge variant={earning.status === 'Claimed' ? 'claimed' : 'pending'}>
                        {earning.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  );
}

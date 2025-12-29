import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Globe, Map as MapIcon, Filter, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { MOCK_ROYALTY_FLOWS, MOCK_SOURCES } from '@/lib/store';

// Dynamically import the map component to avoid SSR issues
const RoyaltyGlobe = dynamic(() => import('@/components/RoyaltyGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-imperium-darker">
      <div className="text-center">
        <Globe className="w-16 h-16 mx-auto text-imperium-gold/50 animate-pulse mb-4" />
        <p className="text-white/60">Loading globe...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [viewMode, setViewMode] = useState<'globe' | 'flat'>('globe');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  const filteredFlows = useMemo(() => {
    if (!selectedSource) return MOCK_ROYALTY_FLOWS;
    return MOCK_ROYALTY_FLOWS.filter((f) => f.source === selectedSource);
  }, [selectedSource]);

  const totalAmount = filteredFlows.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="min-h-screen bg-imperium-dark">
      <Navbar />

      <main className="pt-16 h-screen flex flex-col">
        {/* Header Controls */}
        <div className="flex-shrink-0 px-6 py-4 glass border-b border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">
                Global <span className="text-imperium-gold">Royalty Flows</span>
              </h1>
              <p className="text-white/60 text-sm">
                Real-time visualization of royalty distribution worldwide
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('globe')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    viewMode === 'globe'
                      ? 'bg-imperium-gold text-imperium-dark'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Globe
                </button>
                <button
                  onClick={() => setViewMode('flat')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    viewMode === 'flat'
                      ? 'bg-imperium-gold text-imperium-dark'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  Map
                </button>
              </div>

              {/* Time Range */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-imperium-gold/50"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Map Container */}
          <div className="flex-1 relative">
            <RoyaltyGlobe flows={filteredFlows} viewMode={viewMode} />

            {/* Stats Overlay */}
            <div className="absolute top-4 left-4 glass rounded-xl p-4 max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 live-indicator" />
                <span className="text-sm text-white/60">Live Data</span>
              </div>
              <div className="text-3xl font-display font-bold text-imperium-gold">
                ${totalAmount.toLocaleString()}
              </div>
              <p className="text-sm text-white/60">Total royalties ({timeRange})</p>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 glass rounded-xl p-4">
              <h3 className="text-sm font-medium mb-3">Flow Intensity</h3>
              <div className="flex items-center gap-2">
                <div className="w-full h-2 rounded-full bg-gradient-to-r from-imperium-blue via-imperium-purple to-imperium-gold" />
              </div>
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 glass border-l border-white/10 overflow-y-auto">
            {/* Source Filter */}
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Source
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSource(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    !selectedSource
                      ? 'bg-imperium-gold text-imperium-dark'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  All
                </button>
                {MOCK_SOURCES.map((source) => (
                  <button
                    key={source.name}
                    onClick={() => setSelectedSource(source.name.toLowerCase())}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedSource === source.name.toLowerCase()
                        ? 'bg-imperium-gold text-imperium-dark'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {source.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Regions */}
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top Regions
              </h3>
              <div className="space-y-3">
                {filteredFlows
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 10)
                  .map((flow, i) => (
                    <motion.div
                      key={flow.region}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-white/40 w-5 text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{flow.region}</span>
                          <span className="text-sm font-mono text-imperium-gold">
                            ${flow.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(flow.amount / filteredFlows[0]?.amount) * 100}%`,
                            }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className="h-full bg-imperium-gold"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* Source Breakdown */}
            <div className="p-4">
              <h3 className="text-sm font-medium mb-3">Source Breakdown</h3>
              <div className="space-y-3">
                {MOCK_SOURCES.map((source) => (
                  <div key={source.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="flex-1 text-sm">{source.name}</span>
                    <span className="text-sm text-white/60">{source.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import {
  MOCK_CITY_FLOWS,
  aggregateByCity,
  aggregateBySong,
  type CityFlow,
} from '@/lib/store';
import { cn } from '@/lib/utils';

const RoyaltyGlobe = dynamic(() => import('@/components/RoyaltyGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-gray-600 text-body-sm">Loading...</div>
    </div>
  ),
});

export default function MapPage() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Filter flows
  const filteredFlows = useMemo(() => {
    let flows = MOCK_CITY_FLOWS;
    if (selectedSource) {
      flows = flows.filter((f) => f.source === selectedSource);
    }
    if (selectedSong) {
      flows = flows.filter((f) => f.songId === selectedSong);
    }
    return flows;
  }, [selectedSource, selectedSong]);

  const cityAggregates = useMemo(() => aggregateByCity(filteredFlows), [filteredFlows]);
  const totalAmount = filteredFlows.reduce((sum, f) => sum + f.amount, 0);
  const totalStreams = filteredFlows.reduce((sum, f) => sum + f.streams, 0);
  const cityCount = cityAggregates.length;

  // Selected city detail
  const cityDetail = useMemo(() => {
    if (!selectedCity) return null;
    const cityFlows = filteredFlows.filter((f) => f.city === selectedCity);
    if (cityFlows.length === 0) return null;
    const agg = cityAggregates.find((c) => c.city === selectedCity);
    return { flows: cityFlows, aggregate: agg };
  }, [selectedCity, filteredFlows, cityAggregates]);

  return (
    <div className="h-screen bg-black md:pl-48 pt-14 md:pt-0 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — left */}
        <div className="w-72 bg-black border-r border-[#1a1a1a] overflow-y-auto flex-shrink-0">
          {/* Stats */}
          <div className="p-4 border-b border-[#1a1a1a]">
            <p className="overline mb-3">Settlement</p>
            <div className="text-heading-md font-mono text-accent">
              {totalAmount.toLocaleString()} USDC
            </div>
            <div className="flex gap-4 mt-2 text-body-sm text-gray-500">
              <span>{(totalStreams / 1000000).toFixed(1)}M streams</span>
              <span>{cityCount} cities</span>
            </div>
          </div>

          {/* Song Filter */}
          <div className="p-4 border-b border-[#1a1a1a]">
            <p className="overline mb-3">Song</p>
            <div className="space-y-0.5">
              <button
                onClick={() => setSelectedSong(null)}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-body-sm transition-all',
                  !selectedSong
                    ? 'bg-accent text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                All songs
              </button>
              {aggregateBySong(MOCK_CITY_FLOWS).map((song) => (
                <button
                  key={song.songId}
                  onClick={() => setSelectedSong(song.songId === selectedSong ? null : song.songId)}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-body-sm transition-all flex justify-between',
                    selectedSong === song.songId
                      ? 'bg-accent text-black'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <span className="truncate">{song.title}</span>
                  <span className="font-mono ml-2">{(song.totalAmount / 1000).toFixed(0)}K USDC</span>
                </button>
              ))}
            </div>
          </div>

          {/* Source Filter */}
          <div className="p-4 border-b border-[#1a1a1a]">
            <p className="overline mb-3">Source</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSource(null)}
                className={cn(
                  'px-2.5 py-1 text-body-sm transition-all',
                  !selectedSource
                    ? 'bg-accent text-black'
                    : 'bg-[#0a0a0a] border border-[#1a1a1a] text-gray-400 hover:text-white'
                )}
              >
                All
              </button>
              {['spotify', 'apple', 'youtube', 'deezer', 'other'].map((source) => (
                <button
                  key={source}
                  onClick={() => setSelectedSource(source === selectedSource ? null : source)}
                  className={cn(
                    'px-2.5 py-1 text-body-sm transition-all capitalize',
                    selectedSource === source
                      ? 'bg-accent text-black'
                      : 'bg-[#0a0a0a] border border-[#1a1a1a] text-gray-400 hover:text-white'
                  )}
                >
                  {source === 'apple' ? 'Apple' : source}
                </button>
              ))}
            </div>
          </div>

          {/* Top Cities */}
          <div className="p-4">
            <p className="overline mb-3">Top cities</p>
            <div className="space-y-2">
              {cityAggregates.slice(0, 12).map((city, i) => (
                <button
                  key={city.city}
                  onClick={() => setSelectedCity(city.city === selectedCity ? null : city.city)}
                  className={cn(
                    'flex items-center gap-2 w-full text-left transition-colors',
                    selectedCity === city.city ? 'text-accent' : 'hover:text-white'
                  )}
                >
                  <span className="text-gray-600 font-mono w-4 text-right text-caption">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="text-body-sm truncate">{city.city}</span>
                      <span className="text-body-sm font-mono text-accent ml-2">
                        {city.totalAmount.toLocaleString()} <span className="text-gray-500">USDC</span>
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Globe */}
        <div className="flex-1 relative">
          <RoyaltyGlobe
            flows={filteredFlows}
            selectedCity={selectedCity}
            onCityClick={setSelectedCity}
          />

          {/* City Detail — slides from right */}
          <AnimatePresence>
            {cityDetail && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-4 right-4 bg-[#0a0a0a]/95 border border-[#1a1a1a] p-4 w-64"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-display text-heading-sm">{cityDetail.aggregate?.city}</h3>
                    <p className="text-caption text-gray-500">{cityDetail.aggregate?.country}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCity(null)}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <span className="overline text-gray-500">Revenue</span>
                    <p className="font-mono text-accent text-body-sm">
                      {cityDetail.aggregate?.totalAmount.toLocaleString()} USDC
                    </p>
                  </div>
                  <div>
                    <span className="overline text-gray-500">Growth</span>
                    <p className="font-mono text-body-sm text-accent">
                      +{cityDetail.aggregate?.avgGrowth.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <p className="overline text-gray-500 mb-2">Songs</p>
                <div className="space-y-1.5">
                  {cityDetail.flows.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between text-body-sm"
                    >
                      <span className="truncate max-w-[120px]">{f.songTitle}</span>
                      <span className="font-mono text-accent">{f.amount.toLocaleString()} <span className="text-gray-500">USDC</span></span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

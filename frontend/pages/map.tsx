import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { X, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import {
  MOCK_CITY_FLOWS,
  MOCK_SOURCES,
  aggregateByCity,
  aggregateBySong,
  aggregateByCategory,
  REVENUE_CATEGORIES,
  type CityFlow,
  type RevenueCategory,
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
  const [selectedCategory, setSelectedCategory] = useState<RevenueCategory | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<RevenueCategory | null>(null);

  // Filter flows
  const filteredFlows = useMemo(() => {
    let flows = MOCK_CITY_FLOWS;
    if (selectedSource) {
      flows = flows.filter((f) => f.source === selectedSource);
    } else if (selectedCategory) {
      flows = flows.filter((f) => f.sourceCategory === selectedCategory);
    }
    if (selectedSong) {
      flows = flows.filter((f) => f.songId === selectedSong);
    }
    return flows;
  }, [selectedCategory, selectedSource, selectedSong]);

  const cityAggregates = useMemo(() => aggregateByCity(filteredFlows), [filteredFlows]);
  const categoryStats = useMemo(() => aggregateByCategory(filteredFlows), [filteredFlows]);
  const totalAmount = filteredFlows.reduce((sum, f) => sum + f.amount, 0);
  const totalStreams = filteredFlows.filter((f) => f.sourceCategory === 'streaming').reduce((sum, f) => sum + f.streams, 0);
  const sourceCount = new Set(filteredFlows.map((f) => f.sourceCategory)).size;
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
              <span>{sourceCount} sources</span>
              <span>{cityCount} cities</span>
            </div>
          </div>

          {/* Song Filter */}
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between mb-2">
              <p className="overline">Song</p>
              {selectedSong && (
                <button onClick={() => setSelectedSong(null)} className="text-[0.6rem] text-gray-600 hover:text-gray-400 transition-colors">Clear</button>
              )}
            </div>
            <select
              value={selectedSong ?? ''}
              onChange={(e) => setSelectedSong(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-transparent font-sans text-caption text-gray-300 border-b border-[#1a1a1a] focus:border-accent outline-none py-1.5 px-1 appearance-none cursor-pointer"
            >
              <option value="" className="bg-black py-1">All songs</option>
              {aggregateBySong(MOCK_CITY_FLOWS).map((song) => (
                <option key={song.songId} value={song.songId} className="bg-black py-1">
                  {song.title}  —  {(song.totalAmount / 1000).toFixed(0)}K
                </option>
              ))}
            </select>
          </div>

          {/* Revenue Source Filter */}
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between mb-2">
              <p className="overline">Revenue</p>
              {(selectedCategory || selectedSource) && (
                <button onClick={() => { setSelectedCategory(null); setSelectedSource(null); }} className="text-[0.6rem] text-gray-600 hover:text-gray-400 transition-colors">Clear</button>
              )}
            </div>
            <div className="space-y-px">
              {categoryStats.map((cat) => {
                const isExpanded = expandedCategory === cat.category;
                const isActive = selectedCategory === cat.category || cat.subSources.some((s) => s.name === selectedSource);

                return (
                  <div key={cat.category}>
                    {/* Row — click to expand/collapse only */}
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                      className={cn(
                        'w-full flex items-center justify-between px-2 py-2 transition-colors group',
                        isActive ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronDown className={cn(
                          'w-3 h-3 transition-transform text-gray-600 group-hover:text-gray-400',
                          isExpanded && 'rotate-180'
                        )} />
                        <span className="text-[0.65rem] tracking-wider uppercase font-sans">{cat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.6rem] font-mono">{(cat.amount / 1000).toFixed(0)}K</span>
                        <span className="text-[0.55rem] text-gray-600">{cat.percentage}%</span>
                      </div>
                    </button>

                    {/* Expanded sub-sources */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-5 pr-2 pb-2 space-y-px">
                            {/* "All [category]" filter */}
                            <button
                              onClick={() => {
                                setSelectedSource(null);
                                setSelectedCategory(selectedCategory === cat.category ? null : cat.category);
                              }}
                              className={cn(
                                'w-full flex justify-between px-2 py-1.5 text-[0.6rem] transition-colors border-b border-[#1a1a1a] mb-1',
                                selectedCategory === cat.category ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
                              )}
                            >
                              <span>All {cat.label.toLowerCase()}</span>
                              <span className="font-mono">{(cat.amount / 1000).toFixed(0)}K</span>
                            </button>

                            {/* Individual sub-sources */}
                            {cat.subSources.map((sub) => (
                              <button
                                key={sub.name}
                                onClick={() => {
                                  setSelectedCategory(null);
                                  setSelectedSource(selectedSource === sub.name ? null : sub.name);
                                }}
                                className={cn(
                                  'w-full flex justify-between px-2 py-1 text-[0.6rem] transition-colors',
                                  selectedSource === sub.name ? 'text-accent' : 'text-gray-600 hover:text-gray-400'
                                )}
                              >
                                <span className="capitalize">{sub.name}</span>
                                <span className="font-mono">{(sub.amount / 1000).toFixed(0)}K</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
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

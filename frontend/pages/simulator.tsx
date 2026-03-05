import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const SimulatorGlobe = dynamic(() => import('@/components/SimulatorGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-black">
      <div className="text-gray-500">Loading visualization...</div>
    </div>
  ),
});

interface SimulationData {
  isrc: string;
  title: string;
  splits: { address: string; percentage: number; role: string }[];
  streams: number;
  regions: { code: string; name: string; percentage: number }[];
}

interface RoyaltyFlow {
  id: string;
  region: string;
  lat: number;
  lng: number;
  amount: number;
  source: string;
  timestamp: number;
}

interface PayoutEvent {
  id: string;
  recipient: string;
  amount: number;
  timestamp: number;
  source: string;
}

const RATE_PER_STREAM = 0.004;

const REGION_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  US: { lat: 39.8283, lng: -98.5795, name: 'United States' },
  GB: { lat: 55.3781, lng: -3.4360, name: 'United Kingdom' },
  DE: { lat: 51.1657, lng: 10.4515, name: 'Germany' },
  FR: { lat: 46.2276, lng: 2.2137, name: 'France' },
  JP: { lat: 36.2048, lng: 138.2529, name: 'Japan' },
  BR: { lat: -14.2350, lng: -51.9253, name: 'Brazil' },
  AU: { lat: -25.2744, lng: 133.7751, name: 'Australia' },
  CA: { lat: 56.1304, lng: -106.3468, name: 'Canada' },
  MX: { lat: 23.6345, lng: -102.5528, name: 'Mexico' },
  KR: { lat: 35.9078, lng: 127.7669, name: 'South Korea' },
};

const DEFAULT_REGIONS = [
  { code: 'US', name: 'United States', percentage: 45 },
  { code: 'GB', name: 'United Kingdom', percentage: 15 },
  { code: 'DE', name: 'Germany', percentage: 12 },
  { code: 'BR', name: 'Brazil', percentage: 10 },
  { code: 'JP', name: 'Japan', percentage: 8 },
  { code: 'CA', name: 'Canada', percentage: 5 },
  { code: 'AU', name: 'Australia', percentage: 5 },
];

export default function SimulatorPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const [formData, setFormData] = useState<SimulationData>({
    isrc: '',
    title: '',
    splits: [
      { address: 'artist.eth', percentage: 60, role: 'Artist' },
      { address: 'producer.eth', percentage: 30, role: 'Producer' },
      { address: 'writer.eth', percentage: 10, role: 'Writer' },
    ],
    streams: 100000,
    regions: DEFAULT_REGIONS,
  });

  const [royaltyFlows, setRoyaltyFlows] = useState<RoyaltyFlow[]>([]);
  const [payoutEvents, setPayoutEvents] = useState<PayoutEvent[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [simulatedDay, setSimulatedDay] = useState(1);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;
    console.log('Capturing email:', email);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setEmailSubmitted(true);
    setStep(2);
  };

  const generateFlow = useCallback(() => {
    const region = formData.regions[Math.floor(Math.random() * formData.regions.length)];
    const coords = REGION_COORDS[region.code] || { lat: 0, lng: 0 };
    const sources = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer'];
    const source = sources[Math.floor(Math.random() * sources.length)];

    const streamsForThisFlow = Math.floor(
      (formData.streams * (region.percentage / 100) * Math.random()) / 30
    );
    const amount = streamsForThisFlow * RATE_PER_STREAM;

    return {
      id: `flow_${Date.now()}_${Math.random()}`,
      region: region.code,
      lat: coords.lat + (Math.random() - 0.5) * 5,
      lng: coords.lng + (Math.random() - 0.5) * 5,
      amount,
      source,
      timestamp: Date.now(),
    };
  }, [formData]);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const newFlow = generateFlow();
      setRoyaltyFlows((prev) => [...prev.slice(-50), newFlow]);
      setTotalEarnings((prev) => prev + newFlow.amount);

      if (Math.random() > 0.7) {
        const splitRecipient = formData.splits[Math.floor(Math.random() * formData.splits.length)];
        const payoutAmount = newFlow.amount * (splitRecipient.percentage / 100);

        setPayoutEvents((prev) => [
          ...prev.slice(-20),
          {
            id: `payout_${Date.now()}`,
            recipient: splitRecipient.address,
            amount: payoutAmount,
            timestamp: Date.now(),
            source: newFlow.source,
          },
        ]);
      }

      if (Math.random() > 0.95) {
        setSimulatedDay((prev) => Math.min(prev + 1, 30));
      }
    }, 1000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, formData, generateFlow]);

  const resetSimulation = () => {
    setIsSimulating(false);
    setRoyaltyFlows([]);
    setPayoutEvents([]);
    setTotalEarnings(0);
    setSimulatedDay(1);
  };

  const projectedMonthly = formData.streams * RATE_PER_STREAM;
  const projectedYearly = projectedMonthly * 12;

  return (
    <div className="min-h-screen bg-black md:pl-48">
      <Navbar />

      <main className="pt-20 md:pt-8 pb-12 container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="overline mb-4">Simulation</p>
            <h1 className="font-display text-display-sm mb-4">
              Royalty simulator
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto font-light">
              Visualize how your royalties flow from streams to your wallet.
              No wallet required.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Email Gate */}
            {step === 1 && (
              <motion.div
                key="email-gate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-md mx-auto"
              >
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="font-display text-heading-sm">Get started</h2>
                    </div>

                    <p className="text-gray-400 mb-6 font-light">
                      Enter your email to access the royalty simulator and receive
                      updates about Imperium.
                    </p>

                    <form onSubmit={handleEmailSubmit}>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mb-4"
                      />

                      <Button
                        type="submit"
                        variant="accent"
                        className="w-full"
                        disabled={!isValidEmail(email)}
                      >
                        Start simulator
                      </Button>
                    </form>

                    <p className="text-caption text-gray-600 mt-4 text-center">
                      No spam. Unsubscribe anytime.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Simulation */}
            {step === 2 && (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Config Card */}
                  <Card>
                    <CardContent>
                      <h3 className="font-display text-heading-sm mb-4">
                        Song details
                      </h3>

                      <div className="space-y-4">
                        <Input
                          label="ISRC (optional)"
                          placeholder="USRC12345678"
                          value={formData.isrc}
                          onChange={(e) =>
                            setFormData({ ...formData, isrc: e.target.value.toUpperCase() })
                          }
                        />

                        <Input
                          label="Song Title"
                          placeholder="Your Song Name"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />

                        <div>
                          <label className="overline block mb-2">Monthly Streams</label>
                          <input
                            type="range"
                            min="1000"
                            max="10000000"
                            step="1000"
                            value={formData.streams}
                            onChange={(e) =>
                              setFormData({ ...formData, streams: parseInt(e.target.value) })
                            }
                            className="w-full accent-[#F5F0E8]"
                          />
                          <div className="flex justify-between text-caption text-gray-500 mt-1">
                            <span>1K</span>
                            <span className="text-accent font-mono">
                              {formData.streams.toLocaleString()}
                            </span>
                            <span>10M</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                        <p className="overline mb-3">Royalty splits</p>
                        <div className="space-y-2">
                          {formData.splits.map((split, i) => (
                            <div key={i} className="flex items-center gap-2 text-body-sm">
                              <span className="text-gray-400 w-20">{split.role}</span>
                              <div className="flex-1 bg-[#1a1a1a] h-1">
                                <div
                                  className="bg-accent h-1"
                                  style={{ width: `${split.percentage}%` }}
                                />
                              </div>
                              <span className="font-mono text-accent w-12 text-right">
                                {split.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Globe */}
                  <div className="lg:col-span-2">
                    <Card className="h-full">
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-display text-heading-sm">
                            Global royalty flow
                          </h3>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsSimulating(!isSimulating)}
                              className={cn(
                                'p-2 transition-all',
                                isSimulating
                                  ? 'bg-error/15 text-error'
                                  : 'bg-accent/15 text-accent'
                              )}
                            >
                              {isSimulating ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={resetSimulation}
                              className="p-2 bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
                            >
                              <RotateCcw className="w-5 h-5" />
                            </button>
                            <select
                              value={simulationSpeed}
                              onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                              className="bg-[#0a0a0a] border border-[#1a1a1a] px-2 py-1 text-body-sm outline-none"
                            >
                              <option value="1">1x</option>
                              <option value="2">2x</option>
                              <option value="5">5x</option>
                              <option value="10">10x</option>
                            </select>
                          </div>
                        </div>

                        <div className="h-[400px] overflow-hidden">
                          <SimulatorGlobe flows={royaltyFlows} />
                        </div>

                        <div className="mt-4 flex items-center justify-between text-body-sm">
                          <span className="text-gray-400 font-mono">Day {simulatedDay} / 30</span>
                          <div className="flex-1 mx-4 bg-[#1a1a1a] h-px">
                            <div
                              className="bg-accent h-px transition-all"
                              style={{ width: `${(simulatedDay / 30) * 100}%` }}
                            />
                          </div>
                          <span className="text-gray-400">1 Month</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1a1a1a] mb-8">
                  <StatCard
                    label="Simulated Earnings"
                    value={`${totalEarnings.toFixed(2)} USDC`}
                    accent
                    className="bg-black"
                  />
                  <StatCard
                    label="Projected Monthly"
                    value={`${projectedMonthly.toFixed(2)} USDC`}
                    className="bg-black"
                  />
                  <StatCard
                    label="Projected Yearly"
                    value={`${projectedYearly.toFixed(2)} USDC`}
                    className="bg-black"
                  />
                  <StatCard
                    label="Active Flows"
                    value={royaltyFlows.length.toString()}
                    className="bg-black"
                  />
                </div>

                {/* Payout Feed */}
                <Card>
                  <CardContent>
                    <h3 className="font-display text-heading-sm mb-4">
                      Live payout feed
                    </h3>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {payoutEvents.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          {isSimulating
                            ? 'Waiting for payouts...'
                            : 'Start the simulation to see payouts'}
                        </p>
                      ) : (
                        payoutEvents
                          .slice()
                          .reverse()
                          .map((event) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#1a1a1a]"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-success/15 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-success" />
                                </div>
                                <div>
                                  <div className="font-medium text-body-sm">{event.recipient}</div>
                                  <div className="text-caption text-gray-500">{event.source}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-accent text-body-sm">
                                  +{event.amount.toFixed(4)}
                                </div>
                                <div className="text-caption text-gray-500">USDC</div>
                              </div>
                            </motion.div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* CTA */}
                <div className="mt-8 text-center">
                  <p className="text-gray-400 mb-4 font-light">
                    Ready to make this real. Connect your wallet and start earning.
                  </p>
                  <a href="/upload">
                    <Button variant="accent" size="lg">
                      Register your song
                    </Button>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

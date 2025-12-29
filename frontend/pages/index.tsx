import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Music, Globe, Coins, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

const SLOGANS = [
  'Own It.',
  'Break the Chain.',
  'No Masters.',
  'Take the Throne.',
];

export default function Home() {
  const [currentSlogan, setCurrentSlogan] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-imperium-dark">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-imperium-gold/5 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Crown Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="mb-8"
            >
              <Crown className="w-20 h-20 mx-auto text-imperium-gold animate-float" />
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-display font-bold mb-6"
            >
              <span className="text-glow text-imperium-gold">IMPERIUM</span>
            </motion.h1>

            {/* Rotating Slogans */}
            <motion.div
              key={currentSlogan}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-12 mb-8"
            >
              <p className="text-2xl md:text-3xl font-display text-white/80">
                {SLOGANS[currentSlogan]}
              </p>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/60 mb-12 max-w-2xl mx-auto"
            >
              The decentralized music royalty platform that gives creators and fans
              control over music earnings. Transparent. Instant. On-chain.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/dashboard">
                <button className="btn-glow px-8 py-4 bg-imperium-gold text-imperium-dark font-bold rounded-lg flex items-center gap-2 hover:bg-imperium-gold/90 transition-all">
                  Launch App
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/map">
                <button className="px-8 py-4 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  View Global Flows
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="container mx-auto px-6 mt-20"
        >
          <div className="glass rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem label="Total Royalties Processed" value="$12.4M" />
            <StatItem label="Songs Registered" value="8,432" />
            <StatItem label="Active Creators" value="2,156" />
            <StatItem label="Countries" value="94" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-display font-bold text-center mb-4">
            <span className="text-imperium-gold">Revolutionary</span> Features
          </h2>
          <p className="text-white/60 text-center mb-16 max-w-2xl mx-auto">
            Built on Polygon for instant, low-cost transactions. Every royalty
            payment is tracked, split, and distributed transparently on-chain.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Music className="w-8 h-8" />}
              title="Song Registry"
              description="Immutable on-chain registration of songs with ISRC codes, ownership proof, and metadata stored on IPFS/Arweave."
            />
            <FeatureCard
              icon={<Coins className="w-8 h-8" />}
              title="Instant Payouts"
              description="Royalties distributed instantly in USDC. No more waiting 6-12 months for payments from traditional distributors."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Fractional Ownership"
              description="Fans and investors can purchase fractional ownership tokens and earn a share of song royalties."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Global Visualization"
              description="Real-time 3D globe showing royalty flows by country, source, and time. See your music's global impact."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="ZK Privacy"
              description="Optional zero-knowledge proofs for private royalty splits. Your business, your secret."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Black Box Hunter"
              description="AI-powered tool to find and claim unclaimed royalties from traditional streaming platforms."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-display font-bold text-center mb-16">
            How It <span className="text-imperium-gold">Works</span>
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <Step
                number="01"
                title="Connect & Register"
                description="Connect your wallet and register your songs with ISRC codes. Your music is now on-chain forever."
              />
              <Step
                number="02"
                title="Configure Splits"
                description="Set up royalty splits between artists, producers, writers, and labels. All verifiable on-chain."
              />
              <Step
                number="03"
                title="Receive Royalties"
                description="Streaming platforms deposit royalties to the smart contract. Payments are split and distributed automatically."
              />
              <Step
                number="04"
                title="Claim & Trade"
                description="Claim your earnings anytime. Optionally create fractional ownership tokens for fans to invest in your success."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="gradient-border rounded-2xl p-12 text-center">
            <Crown className="w-16 h-16 mx-auto text-imperium-gold mb-6" />
            <h2 className="text-4xl font-display font-bold mb-4">
              Ready to <span className="text-imperium-gold">Take the Throne</span>?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Join thousands of creators who have taken control of their music royalties.
              No middlemen. No black boxes. Just you and your earnings.
            </p>
            <Link href="/upload">
              <button className="btn-glow px-8 py-4 bg-imperium-gold text-imperium-dark font-bold rounded-lg hover:bg-imperium-gold/90 transition-all">
                Register Your First Song
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-imperium-gold" />
              <span className="font-display font-bold text-xl">IMPERIUM</span>
            </div>
            <p className="text-white/40 text-sm">
              Built on Polygon. Powered by creators.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white/60 hover:text-imperium-gold transition-colors">Docs</a>
              <a href="#" className="text-white/60 hover:text-imperium-gold transition-colors">GitHub</a>
              <a href="#" className="text-white/60 hover:text-imperium-gold transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-display font-bold text-imperium-gold mb-1">{value}</p>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass p-6 rounded-xl card-hover"
    >
      <div className="w-14 h-14 bg-imperium-gold/10 rounded-lg flex items-center justify-center text-imperium-gold mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/60">{description}</p>
    </motion.div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-16 h-16 bg-imperium-gold/10 rounded-full flex items-center justify-center">
        <span className="text-2xl font-display font-bold text-imperium-gold">{number}</span>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/60">{description}</p>
      </div>
    </div>
  );
}

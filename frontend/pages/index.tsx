import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="font-display text-display-lg md:text-display-xl mb-16"
            >
              Settled.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <Link href="/dashboard">
                <Button variant="accent" size="lg">
                  Enter
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="max-w-3xl mx-auto mt-32"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1a1a1a]">
              {[
                { label: 'Processed', value: '12.4M' },
                { label: 'Songs', value: '8,432' },
                { label: 'Creators', value: '2,156' },
                { label: 'Countries', value: '94' },
              ].map((stat) => (
                <div key={stat.label} className="bg-black p-6 text-center">
                  <p className="font-mono text-heading-md text-accent mb-1">{stat.value}</p>
                  <p className="overline">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-body-sm font-light">Imperium</span>
            <span className="text-gray-600 text-body-sm font-light">Polygon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
